"""
Milestones Sync Engine (v5.3)
==============================
Walks .meta_brain/milestones/, validates SESSION/GOAL files, computes progress
and health, archives done sessions, and re-asserts the router index.

Fixes baked in:
  G6  : Health math now penalises stale-pending goals as well as blocked ones.
        Penalties live in BOOT_CONTRACTS.constants so the rule has one home.
  G9  : Auto-detects when an archived session is reopened (folder reappears in
        live milestones/) and emits a SESSION_REOPENED audit event.
  G13 : Imports the shared validator instead of re-declaring its own.
  D1  : Sessions whose goals are all done auto-promote to status='completed'
        (and become eligible for auto-archive) — agents no longer need to
        remember the manual transition.
  D2  : Persistence-exhausted sessions move to status='paused' (a vocab-valid
        terminal state) and the engine stamps `metadata.persistence.exhausted`.
        The previous 'pended' value broke schema validation forever.
  D3  : Stale-pending detection is now based on
        `execution.state.last_progress_at` (set only when progress actually
        changes), not the whole-file mtime — the engine itself touches the
        file every cycle, which was masking real staleness.
  D4  : milestones_history.yaml is FIFO-trimmed to
        `constants.milestones_history_max`.
  D5  : Numeric-suffix anti-patterns now fail the sync (return False), matching
        Rules_And_Considerations.md §5 which calls them HARD anti-patterns.
  D6  : GOAL.yaml is rewritten only when something actually changed —
        eliminates spurious mtime updates.
  D7  : Status strings are normalised through `_norm_status()`. Invalid values
        no longer slip past the `.split()[0]` defensive parser.
  M1  : All disk writes now go through atomic_write_yaml (tmp+os.replace) so
        a kill or crash mid-write cannot corrupt the router/state files.
"""
from __future__ import annotations

import pathlib
import re
import shutil
import sys
import time
from datetime import datetime, timedelta, timezone
from ruamel.yaml import YAML

sys.path.insert(0, str(pathlib.Path(__file__).parent / "_shared"))
from validators import validate, load_schema_from_yaml  # noqa: E402
from atomic_io import atomic_write_yaml  # noqa: E402
from freshness import stamp_freshness  # noqa: E402
# GAP-BOOT-PATH-DRIFT fix: every engine reads BOOT_CONTRACTS through one
# helper module. The local literal is gone; the path comes from
# ``boot_contracts.boot_contracts_path()`` (centralised in ``_shared``).
from boot_contracts import (  # noqa: E402
    load_constants as _shared_load_constants,
    router_freshness_threshold as _shared_router_freshness,
)

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent
MISSION_BOARD_DIR = WORKSPACE_ROOT / ".meta_brain" / "milestones"
ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "milestones.yaml"
ARCHIVE_DIR = MISSION_BOARD_DIR / ".milestones_archive"
HISTORY_LOG_PATH = ARCHIVE_DIR / "milestones_history.yaml"

VALID_GOAL_STATUSES = {"pending", "in-progress", "blocked", "done", "archived"}
VALID_SESSION_STATUSES = {"active", "paused", "completed", "archived"}
DONE_STATUSES = {"done", "archived"}


def load_yaml(path):
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        return yaml.load(f)


def save_yaml(path, data):
    """Crash-safe YAML write (M1)."""
    atomic_write_yaml(path, data, yaml_instance=yaml)


def now_iso():
    return datetime.now().isoformat()


def _constants() -> dict:
    """GAP-BOOT-PATH-DRIFT fix: route through the shared loader.

    Engine-local defaults are intentionally empty — milestones_sync only
    needs values that exist in BOOT_CONTRACTS, and falls back to literal
    integers at each call site (e.g. ``int(_constants().get('foo', 14))``).
    """
    return _shared_load_constants(WORKSPACE_ROOT, defaults={})


def _norm_status(value) -> str:
    """D7: normalise any status string. Strip emoji decoration and whitespace,
    keep only the bare identifier. 'done 🟢' → 'done'."""
    if not isinstance(value, str):
        return ""
    return value.split()[0].strip().lower() if value.strip() else ""


def append_log_event(event: dict, dry_run: bool):
    if dry_run:
        return
    log = load_yaml(HISTORY_LOG_PATH) or {"events": []}
    if "events" not in log:
        log["events"] = []
    log["events"].append(event)
    # D4: cap history.
    cap = int(_constants().get("milestones_history_max", 1000))
    if cap > 0 and len(log["events"]) > cap:
        log["events"] = log["events"][-cap:]
    save_yaml(HISTORY_LOG_PATH, log)


def compute_progress(tasks):
    if not tasks:
        return "0%"
    done = sum(
        1 for t in tasks if isinstance(t, dict) and _norm_status(t.get("status")) in DONE_STATUSES
    )
    return f"{int((done / len(tasks)) * 100)}%"


def _file_mtime(path: pathlib.Path) -> datetime:
    try:
        return datetime.fromtimestamp(path.stat().st_mtime)
    except Exception:
        return datetime.now()


def _parse_iso_or_none(value):
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def compute_overall_health(sessions_found) -> str:
    """G6 + D3: penalise blocked goals AND goals whose
    `execution.state.last_progress_at` is older than the stale threshold.
    Falls back to GOAL.yaml mtime ONLY if last_progress_at is missing
    (legacy goals)."""
    consts = _constants()
    blocked_pen = int(consts.get("blocked_goal_health_penalty", 10))
    pending_pen = int(consts.get("pending_goal_health_penalty", 5))
    stale_days = int(consts.get("pending_goal_stale_days", 14))

    all_goals = []
    for s in sessions_found.values():
        all_goals.extend(s.get("goals", []))

    blocked_count = sum(1 for g in all_goals if _norm_status(g.get("status")) == "blocked")

    stale_pending = 0
    cutoff = datetime.now() - timedelta(days=stale_days)
    for g in all_goals:
        if _norm_status(g.get("status")) != "pending":
            continue
        # D3: Prefer the explicit progress timestamp.
        progress_at = _parse_iso_or_none(g.get("last_progress_at"))
        if progress_at is None:
            ypath = WORKSPACE_ROOT / g.get("yaml_path", "")
            if ypath.exists():
                progress_at = _file_mtime(ypath)
        if progress_at is not None and progress_at < cutoff:
            stale_pending += 1

    health = max(0, 100 - blocked_pen * blocked_count - pending_pen * stale_pending)
    return f"{health}%"


def _all_goals_done(goals_data) -> bool:
    if not goals_data:
        return False
    return all(
        _norm_status(g.get("metadata", {}).get("status")) in DONE_STATUSES for g in goals_data
    )


def maybe_promote_session_status(session_data, goals_data) -> bool:
    """D1: auto-promote session.status to 'completed' when every goal is done
    and the agent forgot the manual transition. Returns True when changed."""
    meta = session_data.setdefault("metadata", {})
    current = _norm_status(meta.get("status", "active"))
    if current in {"completed", "archived", "paused"}:
        return False
    if not _all_goals_done(goals_data):
        return False
    meta["status"] = "completed"
    return True


def should_auto_archive(session_data, goals_data):
    status = _norm_status(session_data.get("metadata", {}).get("status"))
    all_completed = _all_goals_done(goals_data)
    if not all_completed:
        return False
    if status != "completed":
        return False
    return True


def archive_session(session_dir: pathlib.Path, dry_run: bool):
    timestamp = datetime.now().strftime("%Y%m%d")
    archive_target = ARCHIVE_DIR / f"{session_dir.name}_{timestamp}"
    if dry_run:
        print(f"  [DRY-RUN] would archive {session_dir.name} → _archive/{archive_target.name}")
        return
    shutil.copytree(str(session_dir), str(archive_target))
    shutil.rmtree(str(session_dir))
    print(f"  [AUTO-ARCHIVE] {session_dir.name} → _archive/{archive_target.name}")
    append_log_event({
        "ts": now_iso(),
        "type": "SESSION_ARCHIVED",
        "session": session_dir.name,
        "archive_path": str(archive_target.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
        "note": "auto-archived — all goals completed",
    }, dry_run=False)


def detect_reopened_sessions(live_session_names: set, dry_run: bool):
    """G9: if an active session matches a name already marked SESSION_ARCHIVED,
    log a SESSION_REOPENED event so the trail isn't a lie."""
    log = load_yaml(HISTORY_LOG_PATH) or {"events": []}
    events = log.get("events", []) or []
    last_state_for_name = {}
    for ev in events:
        if isinstance(ev, dict) and ev.get("session"):
            last_state_for_name[ev["session"]] = ev.get("type")
    archived_names = {
        name for name, last_type in last_state_for_name.items()
        if last_type == "SESSION_ARCHIVED" and name in live_session_names
    }
    for name in archived_names:
        last_event_for_name = next(
            (e for e in reversed(events) if isinstance(e, dict) and e.get("session") == name),
            None,
        )
        if last_event_for_name and last_event_for_name.get("type") == "SESSION_REOPENED":
            continue  # already logged
        print(f"  [AUDIT] session {name} was archived but is live again — logging SESSION_REOPENED")
        append_log_event({
            "ts": now_iso(),
            "type": "SESSION_REOPENED",
            "session": name,
            "note": "live folder reappeared after SESSION_ARCHIVED — audit trail reconciled",
        }, dry_run=dry_run)


def validate_naming(name, is_session=True) -> bool:
    """D5: numeric-suffix anti-patterns now FAIL the sync.

    Rules_And_Considerations.md §5 calls these "hard anti-patterns".
    Until now the engine only printed [WARN] and continued. That meant the
    documented rule had no enforcement teeth. We now return False so the
    caller can flip the warnings_found flag and exit non-zero.
    """
    if re.search(r"-\d+$", name):
        kind = "Session" if is_session else "Goal"
        print(f"  [ERR]  {kind} '{name}' uses a numeric suffix — hard anti-pattern (Rules §5).")
        return False
    return True


def _ensure_progress_timestamp(goal_data, new_progress: str) -> bool:
    """D3: stamp ``execution.state.last_progress_at`` only when progress
    actually changed since the last sync. Returns True if the goal dict was
    mutated.

    Self-heal: if the field is missing entirely (legacy goal), stamp it once
    so schema validation passes from the next cycle onward."""
    state = goal_data.setdefault("execution", {}).setdefault("state", {})
    old_progress = state.get("progress_percentage")
    needs_init = "last_progress_at" not in state
    if old_progress == new_progress and not needs_init:
        return False
    state["progress_percentage"] = new_progress
    state["last_progress_at"] = now_iso()
    return True


def sync_milestones(dry_run: bool = False) -> bool:
    print("\n[*] Synchronizing milestones.yaml…")
    session_schema = load_schema_from_yaml(ROUTER_PATH, "session_schema")
    goal_schema = load_schema_from_yaml(ROUTER_PATH, "goal_schema")
    warnings_found = False

    if not MISSION_BOARD_DIR.exists():
        print("  [WARN] .meta_brain/milestones/ directory not found.")
        return False

    sessions_found = {}
    live_session_names = set()
    all_goal_paths = []

    for item in sorted(MISSION_BOARD_DIR.iterdir()):
        if not item.is_dir() or item.name.startswith("_") or item.name.startswith("."):
            continue
        if not validate_naming(item.name, is_session=True):
            warnings_found = True
        live_session_names.add(item.name)

        session_yaml = item / "SESSION.yaml"
        if not session_yaml.exists():
            continue
        session_data = load_yaml(session_yaml)
        if not session_data:
            continue
        session_modified = False

        if session_schema:
            is_valid, err = validate(session_data, session_schema)
            if not is_valid:
                print(f"  [WARN] session {item.name} failed schema validation: {err}")
                warnings_found = True

        s_status = _norm_status(session_data.get("metadata", {}).get("status", "active"))
        if s_status not in VALID_SESSION_STATUSES:
            print(f"  [ERR] session {item.name} has invalid status '{s_status}'.")
            warnings_found = True
        goals_raw_data = []
        goals_for_router = []

        for subitem in sorted(item.iterdir()):
            if not subitem.is_dir() or subitem.name.startswith(".") or subitem.name.startswith("_"):
                continue
            if not subitem.name.startswith("GOAL-"):
                print(f"  [WARN] folder '{subitem.name}' in session '{item.name}' is not a Goal (missing 'GOAL-' prefix).")
                warnings_found = True
                continue
            if not validate_naming(subitem.name, is_session=False):
                warnings_found = True
            goal_yaml = subitem / "GOAL.yaml"
            if not goal_yaml.exists():
                continue
            goal_data = load_yaml(goal_yaml)
            if not goal_data:
                continue
            goal_modified = False

            g_status = _norm_status(goal_data.get("metadata", {}).get("status", "pending"))
            if g_status not in VALID_GOAL_STATUSES:
                print(f"  [ERR] goal {subitem.name} has invalid status '{g_status}'.")
                warnings_found = True
            tasks = goal_data.get("execution", {}).get("plan", {}).get("tasks", [])
            progress = compute_progress(tasks)

            # D3 + D6: only write if something actually changed. Run BEFORE
            # schema validation so the auto-stamped last_progress_at exists
            # when the schema checker arrives — otherwise legacy goals fail
            # forever on the first migration cycle.
            if _ensure_progress_timestamp(goal_data, progress):
                goal_modified = True

            if "round" not in goal_data.get("metadata", {}):
                persistence = session_data.get("metadata", {}).get("persistence", {})
                if persistence.get("enabled", False):
                    goal_data["metadata"]["round"] = persistence.get("current_round", 1)
                    goal_modified = True

            if goal_schema:
                is_valid, err = validate(goal_data, goal_schema)
                if not is_valid:
                    print(f"  [WARN] goal {subitem.name} failed schema validation: {err}")
                    warnings_found = True

            if goal_modified and not dry_run:
                save_yaml(goal_yaml, goal_data)

            artifacts = goal_data.get("execution", {}).get("state", {}).get("artifacts", [])
            last_progress_at = goal_data.get("execution", {}).get("state", {}).get("last_progress_at")

            goals_raw_data.append(goal_data)
            goal_router_entry = {
                "name": subitem.name,
                "summary": goal_data.get("metadata", {}).get("description", ""),
                "status": g_status,
                "priority": goal_data.get("metadata", {}).get("priority", "MEDIUM"),
                "progress_percentage": progress,
                "blocked": g_status == "blocked",
                "folder_path": str(subitem.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
                "yaml_path": str(goal_yaml.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
                "artifacts": artifacts,
                "last_progress_at": last_progress_at,
            }
            goals_for_router.append(goal_router_entry)
            all_goal_paths.append(goal_router_entry)

        # Sync SESSION.yaml execution.active_goals.
        discovered_goal_names = [g["name"] for g in goals_for_router]
        session_data.setdefault("execution", {})
        if session_data["execution"].get("active_goals") != discovered_goal_names:
            session_data["execution"]["active_goals"] = discovered_goal_names
            session_modified = True

        # D1: auto-promote completed sessions before checking auto-archive.
        if maybe_promote_session_status(session_data, goals_raw_data):
            session_modified = True
            s_status = _norm_status(session_data["metadata"]["status"])
            print(f"  [+] auto-promoted {item.name} to status=completed (all goals done)")

        if session_modified and not dry_run:
            save_yaml(session_yaml, session_data)

        if should_auto_archive(session_data, goals_raw_data):
            persistence = session_data.get("metadata", {}).get("persistence", {})
            if persistence and persistence.get("enabled", False):
                current_round = persistence.get("current_round", 1)
                max_rounds = persistence.get("max_rounds", "unlimited")
                if max_rounds == "unlimited" or current_round < max_rounds:
                    session_data["metadata"]["status"] = "active"
                    session_data["metadata"]["persistence"]["current_round"] = current_round + 1
                    save_yaml(session_yaml, session_data)
                    s_status = "active"
                    for subitem in sorted(item.iterdir()):
                        if not subitem.is_dir() or subitem.name.startswith((".", "_")):
                            continue
                        if not subitem.name.startswith("GOAL-"):
                            continue
                        gpath = subitem / "GOAL.yaml"
                        if not gpath.exists():
                            continue
                        gdata = load_yaml(gpath)
                        if not gdata:
                            continue
                        gdata["metadata"]["status"] = "pending"
                        gdata["metadata"]["round"] = current_round + 1
                        if "execution" in gdata and "plan" in gdata["execution"] and "tasks" in gdata["execution"]["plan"]:
                            for task in gdata["execution"]["plan"]["tasks"]:
                                task["status"] = "pending"
                        gdata.setdefault("execution", {}).setdefault("state", {})
                        gdata["execution"]["state"]["progress_percentage"] = "0%"
                        gdata["execution"]["state"]["last_progress_at"] = now_iso()
                        save_yaml(gpath, gdata)
                        for g in goals_for_router:
                            if g["name"] == subitem.name:
                                g["status"] = "pending"
                                g["progress_percentage"] = "0%"
                    append_log_event({
                        "ts": now_iso(),
                        "type": "SESSION_ROUND_INCREMENTED",
                        "session": item.name,
                        "note": f"Completed round {current_round}, started round {current_round + 1}",
                    }, dry_run=False)
                    print(f"  [PERSISTENCE] {item.name} round {current_round} → {current_round + 1}.")
                else:
                    # D2: 'paused' is a vocab-valid terminal state. Mark exhausted via a
                    # dedicated flag so future agents can distinguish "paused by user"
                    # from "paused by persistence cap".
                    session_data["metadata"]["status"] = "paused"
                    session_data["metadata"]["persistence"]["exhausted"] = True
                    save_yaml(session_yaml, session_data)
                    s_status = "paused"
                    print(f"  [PERSISTENCE] {item.name} reached max rounds ({max_rounds}); status=paused (exhausted).")
                    append_log_event({
                        "ts": now_iso(),
                        "type": "SESSION_PERSISTENCE_EXHAUSTED",
                        "session": item.name,
                        "note": f"reached max rounds ({max_rounds})",
                    }, dry_run=False)
            else:
                archive_session(item, dry_run)
                live_session_names.discard(item.name)
                continue

        total_goals = len(goals_for_router)
        done_goals = sum(1 for g in goals_for_router if g["status"] in DONE_STATUSES)
        s_progress = f"{int((done_goals / total_goals) * 100)}%" if total_goals else "0%"

        sessions_found[item.name] = {
            "summary": session_data.get("execution", {}).get("summary", ""),
            "pipeline": session_data.get("metadata", {}).get("pipeline", "unknown"),
            "status": s_status,
            "priority": session_data.get("metadata", {}).get("priority", "MEDIUM"),
            "progress_percentage": s_progress,
            "folder_path": str(item.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
            "yaml_path": str(session_yaml.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
            "goals": goals_for_router,
        }
        print(f"  [OK]  {item.name}")

    # G9: emit reopen events.
    detect_reopened_sessions(live_session_names, dry_run)

    overall_health = compute_overall_health(sessions_found)

    index_data = {
        "generated_at": now_iso(),
        "overall_health": overall_health,
        "sessions": {
            name: {"status": info["status"], "progress": info["progress_percentage"], "goal_count": len(info["goals"])}
            for name, info in sessions_found.items()
        },
        "goals": {
            g["name"]: {"status": g["status"], "progress": g["progress_percentage"], "blocked": g["blocked"]}
            for s in sessions_found.values()
            for g in s["goals"]
        },
    }

    milestones_data = load_yaml(ROUTER_PATH) or {
        "name": "milestones_router",
        "schema_version": "1.0",
        "description": "Catalogs all active execution sessions and goals.",
    }
    milestones_data["generated_at"] = now_iso()
    milestones_data["index"] = index_data
    milestones_data["sessions"] = sessions_found
    stamp_freshness(milestones_data, threshold_seconds=int(_constants().get("router_freshness_max_seconds", 1800)))

    if dry_run:
        print(f"  [DRY-RUN] would update milestones.yaml (Health: {overall_health})")
    else:
        save_yaml(ROUTER_PATH, milestones_data)
        print(f"[+] Updated milestones.yaml (Health: {overall_health})")

    return not warnings_found


if __name__ == "__main__":
    import os as _os
    dry_run = "--dry-run" in sys.argv
    sys.path.insert(0, str(pathlib.Path(__file__).parent / "_shared"))
    from engine_bootstrap import workspace_lock_path  # noqa: E402
    if _os.environ.get("META_SYNC_LOCK_HELD") == "1":
        ok = sync_milestones(dry_run)
        sys.exit(0 if ok else 1)
    from sync_lock import with_lock as _with_lock, SyncLockBusy as _SyncLockBusy  # noqa: E402
    _LOCK = workspace_lock_path(WORKSPACE_ROOT)
    try:
        with _with_lock(_LOCK, stale_seconds=120, timeout_seconds=30):
            ok = sync_milestones(dry_run)
            sys.exit(0 if ok else 1)
    except _SyncLockBusy as exc:
        print(f"[ERR] {exc}")
        sys.exit(2)
