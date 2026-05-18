"""
Agentic OS — Master Sync Engine (v5.3)
======================================
Orchestrates every domain sync, re-assembles meta_router.yaml from authoritative
disk state, and updates CONTROLER.yaml with no drift.

Key invariants (each one is a fix for a Gap):
  G3 : Infrastructure block is REPLACED, never merged. Stale runtime entries
       can no longer survive across cycles.
  G5 : All thresholds (health_history_max, recent_events_max, …) come from
       BOOT_CONTRACTS.yaml.constants. No magic numbers in code.
  G7 : meta_runtime_sync no longer hides the launcher chain.
  G8 : --validate now performs bidirectional drift detection
       (router→disk AND disk→router).
  G20: CONTROLER.communication_hubs.*.recent_events are auto-trimmed and
       per-event summaries are truncated.
  C1 : Master sync now ROLLS UP each pipeline's local state.health_signals
       into CONTROLER.telemetry.pipelines.{name}, including a 'stale' tag
       when the pipeline hasn't synced within constants.pipeline_status_stale_seconds.
  C2 : `archived_sessions` is rebuilt from .milestones_archive/ + history log
       every cycle (capped at constants.archived_sessions_index_max). Agents no
       longer have to remember the manual transition documented in
       Controler_Guide.md §4 — the engine does it.
  C3 : `communication_hubs.scaler_hub.scaler_review_queue` is re-derived from
       scaler_state.gateway_metrics.active_proposals at every sync.
  C4 : `telemetry.pending_evolutions` reflects the size of
       .meta_brain/meta_identity/.pending_evolutions.yaml#pending. The file's
       own header promised this; the implementation never landed until now.
  B1 : Master sync acquires .meta_brain/.meta_routing/.sync.lock so concurrent
       agents serialise instead of racing on shared writes.
  M1 : All YAML writes are atomic (tmp + os.replace via shared atomic_io).
"""
from __future__ import annotations

import argparse
import os
import pathlib
import re
import subprocess
import sys
from datetime import datetime
from typing import Any

from ruamel.yaml import YAML
from ruamel.yaml.comments import CommentedMap, CommentedSeq

# Shared helpers — added in v5.3 to enforce single-source-of-truth across engines.
sys.path.insert(0, str(pathlib.Path(__file__).parent / ".meta_routing" / "meta_sync_engines" / "_shared"))
from atomic_io import atomic_write_yaml  # noqa: E402
from sync_lock import with_lock, SyncLockBusy  # noqa: E402

yaml = YAML()
yaml.preserve_quotes = True
yaml.indent(mapping=2, sequence=4, offset=2)

SYNC_ENGINE_VERSION = "5.3"

# --- Path Configuration ---
WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent
META_ENGINE_DIR = pathlib.Path(__file__).parent / ".meta_routing" / "meta_sync_engines"
MASTER_ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / "meta_router.yaml"
CONTROLER_PATH = WORKSPACE_ROOT / "CONTROLER.yaml"
IDENTITY_DIR = WORKSPACE_ROOT / ".meta_brain" / "meta_identity"
BOOT_CONTRACTS_PATH = WORKSPACE_ROOT / ".meta_brain" / "BOOT_CONTRACTS.yaml"
SYNC_LOCK_PATH = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / ".sync.lock"
PENDING_EVOLUTIONS_PATH = IDENTITY_DIR / ".pending_evolutions.yaml"
MILESTONES_ARCHIVE_DIR = WORKSPACE_ROOT / ".meta_brain" / "milestones" / ".milestones_archive"
MILESTONES_HISTORY_PATH = MILESTONES_ARCHIVE_DIR / "milestones_history.yaml"

# Defaults if BOOT_CONTRACTS is unreadable for any reason
_DEFAULT_CONSTANTS = {
    "health_history_max": 3,
    "recent_events_max": 3,
    "recent_event_summary_max_chars": 240,
    "scratch_log_retention_max": 5,
    "pending_goal_stale_days": 14,
    "pending_goal_health_penalty": 5,
    "blocked_goal_health_penalty": 10,
    "sync_lock_stale_seconds": 120,
    "sync_lock_timeout_seconds": 30,
    "milestones_history_max": 1000,
    "archived_sessions_index_max": 50,
    "pipeline_status_stale_seconds": 600,
}


def load_yaml(path, sanitize=False):
    if not path.exists():
        return None
    safe_yaml = YAML(typ="safe")
    with open(path, "r", encoding="utf-8") as f:
        data = safe_yaml.load(f)
    if not sanitize:
        return data

    def to_commented(d):
        if isinstance(d, dict):
            cm = CommentedMap()
            for k, v in d.items():
                cm[k] = to_commented(v)
            return cm
        if isinstance(d, list):
            return [to_commented(i) for i in d]
        return d

    return to_commented(data)


def save_yaml(path, data):
    """Crash-safe YAML writer (M1)."""
    atomic_write_yaml(path, data, yaml_instance=yaml)


def now_iso():
    return datetime.now().isoformat()


def load_constants() -> dict:
    """Single source of truth for runtime thresholds (G5)."""
    boot = load_yaml(BOOT_CONTRACTS_PATH)
    out = dict(_DEFAULT_CONSTANTS)
    if boot and isinstance(boot.get("constants"), dict):
        for k, v in boot["constants"].items():
            out[k] = v
    return out


CONSTANTS = load_constants()


def truncate(text: str, limit: int) -> str:
    if not isinstance(text, str):
        return text
    text = text.strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def _parse_iso_or_none(value):
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def run_sub_sync(script_path, dry_run):
    print(f"[*] Running {script_path.name}…")
    cmd = [sys.executable, str(script_path)]
    if dry_run:
        cmd.append("--dry-run")
    # Tell child engines the master lock is already held so they don't try to
    # re-acquire it (which would deadlock or fail with SyncLockBusy).
    env = dict(os.environ)
    env["META_SYNC_LOCK_HELD"] = "1"
    result = subprocess.run(cmd, capture_output=True, text=True, env=env)
    if result.stdout:
        print(result.stdout.strip())
    if result.stderr:
        print(f"  [ERR] {result.stderr.strip()}")
    if result.returncode != 0:
        print(f"  [FAIL] {script_path.name} exited {result.returncode}")
        return False
    return True


def extract_identity_metadata(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        description = ""
        match_desc = re.search(r"\*\*(?:Purpose|Role|Description):\*\* (.*)", content, re.IGNORECASE)
        if match_desc:
            description = match_desc.group(1).strip()
        else:
            for line in content.split("\n"):
                line = line.strip()
                if not line or line.startswith("#") or line.startswith(">") or line.startswith("---"):
                    continue
                description = line
                if len(description) > 200:
                    description = description[:197] + "…"
                break
        when_to_use = ""
        match_wtu = re.search(r"\*\*(?:When to [Uu]se):\*\* (.*)", content, re.IGNORECASE)
        if match_wtu:
            when_to_use = match_wtu.group(1).strip()
        return {
            "path": str(file_path.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
            "description": description,
            "when_to_use": when_to_use,
        }
    except Exception:
        return None


def update_telemetry(controler_data, health, session_count, dry_run):
    """G5: history cap comes from BOOT_CONTRACTS, not hardcoded 10."""
    if dry_run:
        return
    tel = controler_data.get("telemetry") or {}
    tel["sync_count"] = int(tel.get("sync_count", 0)) + 1
    history = list(tel.get("health_history") or [])
    history.append({"ts": now_iso(), "health": health, "sessions": session_count})
    cap = int(CONSTANTS.get("health_history_max", 3))
    if len(history) > cap:
        history = history[-cap:]
    tel["health_history"] = history
    tel["last_sync"] = now_iso()
    tel["peak_session_count"] = max(int(tel.get("peak_session_count", 0)), session_count)
    controler_data["telemetry"] = tel


def trim_recent_events(controler_data, dry_run):
    """G20: cap recent_events FIFO and truncate verbose lines at write time."""
    if dry_run:
        return
    cap = int(CONSTANTS.get("recent_events_max", 3))
    line_max = int(CONSTANTS.get("recent_event_summary_max_chars", 240))
    hubs = controler_data.get("communication_hubs") or {}
    for hub_name, hub in hubs.items():
        if not isinstance(hub, dict):
            continue
        events = hub.get("recent_events") or []
        if not isinstance(events, list):
            continue
        # Truncate each line to the configured limit (preserving the timestamp prefix).
        trimmed = []
        for ev in events:
            if not isinstance(ev, str):
                trimmed.append(ev)
                continue
            trimmed.append(truncate(ev, line_max))
        # Cap FIFO.
        if len(trimmed) > cap:
            trimmed = trimmed[-cap:]
        hub["recent_events"] = trimmed


# ─── C1 / C3: pipeline telemetry rollup ──────────────────────────────────────
def _walk_pipeline_states(pipelines_router):
    """Yield (pipeline_name, state_path) pairs from pipelines.yaml.

    Reads each pipeline's inner router (`engine.state_file`) so the master sync
    never has to hardcode pipeline-specific paths (root cause for G1).
    """
    if not pipelines_router:
        return
    for p_name, p_info in (pipelines_router.get("pipelines") or {}).items():
        inner_path = WORKSPACE_ROOT / (p_info.get("path") or "")
        if not inner_path.exists():
            continue
        try:
            inner = load_yaml(inner_path)
        except Exception:
            inner = None
        engine = (inner or {}).get("engine") or {}
        state_file_rel = engine.get("state_file")
        if not state_file_rel:
            continue
        state_path = WORKSPACE_ROOT / state_file_rel
        if state_path.exists():
            yield p_name, state_path


def rollup_pipeline_telemetry(controler_data, dry_run):
    """C1: write each pipeline's last_sync + status into CONTROLER.telemetry.pipelines."""
    if dry_run:
        return
    pipelines_router = load_yaml(WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "pipelines.yaml")
    if not pipelines_router:
        return
    stale_seconds = int(CONSTANTS.get("pipeline_status_stale_seconds", 600))
    tel = controler_data.setdefault("telemetry", {})
    pipelines_block = tel.setdefault("pipelines", {})

    seen = set()
    now = datetime.now()
    for p_name, state_path in _walk_pipeline_states(pipelines_router):
        seen.add(p_name)
        try:
            state = load_yaml(state_path) or {}
        except Exception:
            state = {}
        signals = (state.get("telemetry") or {}).get("health_signals") or {}
        last_sync_raw = signals.get("last_sync")
        last_sync_dt = _parse_iso_or_none(last_sync_raw)
        # Status preference: explicit status > inferred from last_sync.
        if last_sync_dt is None:
            status = "unknown"
        elif (now - last_sync_dt).total_seconds() > stale_seconds:
            status = "stale"
        else:
            status = signals.get("overall_status") or state.get("state", {}).get("status") or "active"
            # Normalise "ACTIVE 🟢" / "IDLE" forms back to a bare token.
            status = str(status).split()[0].lower() if status else "active"

        gateway_pending = (
            (state.get("telemetry") or {}).get("gateway", {}).get("pending_approvals")
            or (state.get("state") or {}).get("gateway_metrics", {}).get("pending_approvals_count")
            or 0
        )
        active_session = (state.get("state") or {}).get("active_session")

        pipelines_block[p_name] = {
            "status": status,
            "last_sync": last_sync_raw,
            "gateway_pending": gateway_pending,
            "active_session": active_session,
        }

    # Drop any pipeline rows that no longer exist on disk.
    for stale_name in [n for n in pipelines_block if n not in seen]:
        del pipelines_block[stale_name]


def rollup_scaler_review_queue(controler_data, dry_run):
    """C3: project scaler_state.gateway_metrics.active_proposals into
    communication_hubs.scaler_hub.scaler_review_queue so reviewers see the
    pending list without opening pipeline state files."""
    if dry_run:
        return
    scaler_state_path = (
        WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain" / ".scaler_routing"
        / "scaler_state.yaml"
    )
    if not scaler_state_path.exists():
        return
    state = load_yaml(scaler_state_path) or {}
    proposals = (state.get("state") or {}).get("gateway_metrics", {}).get("active_proposals") or []
    hubs = controler_data.setdefault("communication_hubs", {})
    scaler_hub = hubs.setdefault("scaler_hub", {})
    # Keep the existing structure; only the queue itself is derived.
    scaler_hub["scaler_review_queue"] = list(proposals)


def rollup_archived_sessions(controler_data, dry_run):
    """C2: rebuild CONTROLER.archived_sessions from disk + history log.

    Combines folder timestamps (from .milestones_archive/<name>_<YYYYMMDD>) with
    SESSION_ARCHIVED events in milestones_history.yaml. Capped FIFO so the index
    never bloats."""
    if dry_run:
        return
    cap = int(CONSTANTS.get("archived_sessions_index_max", 50))
    archived = []

    history = load_yaml(MILESTONES_HISTORY_PATH) or {"events": []}
    events_by_session = {}
    for ev in history.get("events", []) or []:
        if not isinstance(ev, dict):
            continue
        if ev.get("type") not in {"SESSION_ARCHIVED", "SESSION_REOPENED"}:
            continue
        s = ev.get("session")
        if not s:
            continue
        events_by_session.setdefault(s, []).append(ev)

    if MILESTONES_ARCHIVE_DIR.exists():
        for item in sorted(MILESTONES_ARCHIVE_DIR.iterdir()):
            if not item.is_dir() or item.name.startswith("."):
                continue
            session_yaml = item / "SESSION.yaml"
            session_name = item.name
            session_meta = {}
            if session_yaml.exists():
                try:
                    sdata = load_yaml(session_yaml) or {}
                    session_meta = sdata.get("metadata") or {}
                    session_name = session_meta.get("name") or session_name
                except Exception:
                    pass
            # Pick the most recent archive event for this session.
            related = events_by_session.get(session_name) or []
            archived_at = None
            for ev in reversed(related):
                if ev.get("type") == "SESSION_ARCHIVED":
                    archived_at = ev.get("ts")
                    break
            archived.append({
                "session_name": session_name,
                "folder_path": str(item.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
                "archived_at": archived_at,
                "pipeline": session_meta.get("pipeline"),
                "priority": session_meta.get("priority"),
                "summary": session_meta.get("description"),
            })

    # Sort newest first by archived_at when present, else by folder name (yymmdd suffix sorts ok).
    def _sort_key(row):
        ts = _parse_iso_or_none(row.get("archived_at"))
        return ts or datetime.min

    archived.sort(key=_sort_key, reverse=True)
    if cap > 0 and len(archived) > cap:
        archived = archived[:cap]
    controler_data["archived_sessions"] = archived


def rollup_pending_evolutions(controler_data, dry_run):
    """C4: surface the pending-evolutions count in CONTROLER telemetry."""
    if dry_run:
        return
    if not PENDING_EVOLUTIONS_PATH.exists():
        return
    data = load_yaml(PENDING_EVOLUTIONS_PATH) or {}
    pending = data.get("pending") or []
    applied = data.get("applied") or []
    rejected = data.get("rejected") or []
    tel = controler_data.setdefault("telemetry", {})
    tel["pending_evolutions"] = {
        "pending": len(pending),
        "applied": len(applied),
        "rejected": len(rejected),
    }


# ─── Drift Detection (G8) ────────────────────────────────────────────────────
def _walk_router_paths(node, found):
    """Recursively collect every value keyed under 'path', 'yaml_path', or 'target_path'."""
    if isinstance(node, dict):
        for k, v in node.items():
            if k in ("path", "yaml_path", "target_path") and isinstance(v, str):
                found.add(v)
            else:
                _walk_router_paths(v, found)
    elif isinstance(node, list):
        for item in node:
            _walk_router_paths(item, found)


def run_validate():
    """G8: bidirectional drift detection.

    Direction 1 (router → disk): every router-declared path must exist.
    Direction 2 (disk → router): every meaningful folder must be cataloged
                                  somewhere or explicitly excluded.
    """
    print("[VALIDATE] Agentic OS Router Validation")
    warnings = 0
    errors = 0

    def check_path(label, path, required=True):
        nonlocal warnings, errors
        if not path:
            return
        p = WORKSPACE_ROOT / path if not pathlib.Path(path).is_absolute() else pathlib.Path(path)
        if p.exists():
            return
        if required:
            print(f"  [ERR]  {label} -> MISSING: {path}")
            errors += 1
        else:
            print(f"  [WARN] {label} -> not found (optional): {path}")
            warnings += 1

    # Direction 1 — router → disk
    check_path("meta_router.yaml", ".meta_brain/meta_router.yaml")
    master = load_yaml(MASTER_ROUTER_PATH)
    declared_paths = set()
    if master:
        _walk_router_paths(master, declared_paths)

    # Also walk every child router so target_path entries (e.g. "_pipelines/")
    # count as "declared" for the orphan-direction check.
    routing_dir = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing"
    if routing_dir.exists():
        for child_yaml in routing_dir.glob("*.yaml"):
            child = load_yaml(child_yaml)
            if child:
                _walk_router_paths(child, declared_paths)

    for p in sorted(declared_paths):
        check_path(f"router-declared: {p}", p)

    # Identity files
    if IDENTITY_DIR.exists():
        for f in IDENTITY_DIR.glob("*.md"):
            check_path(f"identity: {f.name}", str(f.relative_to(WORKSPACE_ROOT)))

    # Direction 2 — disk → router (orphan scan)
    # Top-level workspace folders that should appear somewhere in the master router.
    expected_top = [".meta_brain", ".meta_runtime", "_pipelines", "projects"]
    for top in expected_top:
        if (WORKSPACE_ROOT / top).exists():
            if not any(top in p for p in declared_paths):
                print(f"  [WARN] orphan top-level: {top}/ exists on disk but is not referenced by any router path.")
                warnings += 1

    # Identity drift sweep — known-dead path tokens.
    # G4: any meta_identity file mentioning these paths is stale, UNLESS it
    # appears in an obvious anti-pattern context. Marker matching is
    # case-insensitive so "Never call X" and "NEVER call X" both count.
    dead_tokens = [
        ".meta_router/.meta_sync",
        ".meta_router/milestones",   # E1: prevent the path drift that hit System-Orchestrator-Loop.md
        ".meta_engine/",
        ".meta_engines/",
        ".venv\\Scripts\\python.exe",
        ".venv/Scripts/python.exe",
        "Activate.ps1",
        # T2 (toolbox dead-path drift): pre-v5 toolbox library paths that
        # survived in identity docs and runbooks. Adding them here means the
        # next time someone references the dead location in a doc, --validate
        # flags it before agents start following the dead link.
        ".brain/toolbox_library",
        ".brain/.toolbox_library",
        "_toolbox_graph.yaml",
        "toolbox_graph.yaml",
    ]
    anti_pattern_markers = (
        "never", "don't", "do not", "anti-pattern",
        "broken", "wrong", "instead of", "incorrect", "deprecated",
    )
    if IDENTITY_DIR.exists():
        for f in IDENTITY_DIR.glob("*.md"):
            try:
                txt = f.read_text(encoding="utf-8")
            except Exception:
                continue
            for token in dead_tokens:
                # Find each occurrence and check whether the surrounding line
                # signals "this is an anti-pattern, don't use it".
                idx = 0
                while True:
                    pos = txt.find(token, idx)
                    if pos == -1:
                        break
                    line_start = txt.rfind("\n", 0, pos) + 1
                    line_end = txt.find("\n", pos)
                    if line_end == -1:
                        line_end = len(txt)
                    line = txt[line_start:line_end].lower()
                    if not any(m in line for m in anti_pattern_markers):
                        print(f"  [WARN] identity drift in {f.name}: contains stale reference '{token}'")
                        warnings += 1
                    idx = pos + len(token)

    print(f"\n[VALIDATE] Done. {warnings} warning(s), {errors} error(s).")
    return errors == 0


def _do_sync(dry_run: bool):
    print(f"[*] Starting Agentic OS Sync Engine v{SYNC_ENGINE_VERSION}…")

    sync_scripts = [
        META_ENGINE_DIR / "meta_runtime_sync.py",
        META_ENGINE_DIR / "milestones_sync.py",
        META_ENGINE_DIR / "toolboxes_sync.py",
        META_ENGINE_DIR / "pipelines_sync.py",
        META_ENGINE_DIR / "projects_sync.py",
    ]
    for script in sync_scripts:
        if script.exists():
            ok = run_sub_sync(script, dry_run)
            if not ok:
                print(f"\n[ERR] Master Sync aborted because {script.name} reported warnings or errors.")
                print("[!] Please fix the mismatches and rerun.")
                sys.exit(1)
        else:
            print(f"  [WARN] Sync script missing: {script}")

    # ─── Re-assemble meta_router.yaml ────────────────────────────────────────
    print("\n[*] Re-assembling meta_router.yaml…")
    master = load_yaml(MASTER_ROUTER_PATH, sanitize=True)
    if not master:
        print("  [ERR] meta_router.yaml not found!")
        return

    runtime = load_yaml(pathlib.Path(__file__).parent / ".meta_routing" / "meta_runtime.yaml")
    milestones = load_yaml(pathlib.Path(__file__).parent / ".meta_routing" / "milestones.yaml")
    toolboxes = load_yaml(pathlib.Path(__file__).parent / ".meta_routing" / "toolboxes.yaml")
    pipelines = load_yaml(pathlib.Path(__file__).parent / ".meta_routing" / "pipelines.yaml")
    projects = load_yaml(pathlib.Path(__file__).parent / ".meta_routing" / "projects.yaml")

    routers = master.get("routers", {})

    if milestones and "brain" in routers and "milestones" in routers["brain"]:
        routers["brain"]["milestones"]["description"] = milestones.get("description", routers["brain"]["milestones"].get("description"))
        routers["brain"]["milestones"]["when_to_use"] = milestones.get("when_to_use", routers["brain"]["milestones"].get("when_to_use"))
    if toolboxes and "brain" in routers and "toolboxes" in routers["brain"]:
        routers["brain"]["toolboxes"]["description"] = toolboxes.get("description", routers["brain"]["toolboxes"].get("description"))
        routers["brain"]["toolboxes"]["when_to_use"] = toolboxes.get("when_to_use", routers["brain"]["toolboxes"].get("when_to_use"))
    if pipelines and "workspaces" in routers and "pipelines" in routers["workspaces"]:
        routers["workspaces"]["pipelines"]["description"] = pipelines.get("description", routers["workspaces"]["pipelines"].get("description"))
        routers["workspaces"]["pipelines"]["when_to_use"] = pipelines.get("when_to_use", routers["workspaces"]["pipelines"].get("when_to_use"))
    if projects and "workspaces" in routers and "projects" in routers["workspaces"]:
        routers["workspaces"]["projects"]["description"] = projects.get("description", routers["workspaces"]["projects"].get("description"))
        routers["workspaces"]["projects"]["when_to_use"] = projects.get("when_to_use", routers["workspaces"]["projects"].get("when_to_use"))

    # ─── G3: REPLACE infrastructure wholesale (no merge) ─────────────────────
    print("  [+] Re-assembling infrastructure (full replace)…")
    new_infra = CommentedMap()
    if runtime:
        runtime_infra = runtime.get("infrastructure", {}) or {}
        for key, data in runtime_infra.items():
            clean_key = str(key).lstrip(".").replace("meta_", "")
            new_infra[clean_key] = data
    master["infrastructure"] = new_infra

    # Identity catalog.
    print("  [+] Syncing identity metadata…")
    identity_map = {}
    if IDENTITY_DIR.exists():
        for f in IDENTITY_DIR.glob("*.md"):
            meta = extract_identity_metadata(f)
            if meta:
                identity_map[f.stem] = meta
    new_brain = yaml.map()
    old_brain = routers.get("brain", {})
    for key in ["milestones", "toolboxes", "runtime"]:
        if key in old_brain:
            new_brain[key] = old_brain[key]
    new_brain["identity"] = {
        "path": ".meta_brain/meta_identity/",
        "description": "The absolute architectural rules and system laws for the Agentic OS.",
        "when_to_use": "Loaded automatically via BOOT-00 for system grounding.",
        "files_count": len(identity_map),
        "files": identity_map,
    }
    routers["brain"] = new_brain

    # Style markers preserved.
    def set_section_marker(obj, key, marker_text, spacing="\n"):
        if key in obj:
            obj.ca.items.pop(key, None)
            obj.yaml_set_comment_before_after_key(key, before=f"{spacing}{marker_text}")

    set_section_marker(master, "routers", "─── Router Map ───────────────────────────────────────────────────────────────")
    set_section_marker(routers, "workspaces", "─── Workspaces ─────────────────────────────────────────────────────────────")

    # Protocol reference.
    boot = load_yaml(BOOT_CONTRACTS_PATH)
    if boot and "protocols" in master:
        master["protocols"]["boot"]["version"] = boot.get("schema_version", master["protocols"]["boot"].get("version"))
        master["protocols"]["boot"]["os_version"] = boot.get("os_version", "5.3")
        set_section_marker(master, "protocols", "─── Protocol & State Reference ───────────────────────────────────────────────", spacing="")
    set_section_marker(master, "infrastructure", "─── Infrastructure — Supporting Subsystems ──────────────────────────────────")

    # Flow style for status vocabulary.
    if "brain" in routers and "milestones" in routers["brain"]:
        vocab = routers["brain"]["milestones"].get("status_vocabulary", {})
        for k, v in vocab.items():
            if isinstance(v, list) and not isinstance(v, CommentedSeq):
                vocab[k] = CommentedSeq(v)
            if isinstance(vocab[k], CommentedSeq):
                vocab[k].fa.set_flow_style()

    master["routers"] = routers
    master["generated_at"] = now_iso()
    master.yaml_set_start_comment("🧠 MASTER ROUTER INDEX\n")

    if not dry_run:
        save_yaml(MASTER_ROUTER_PATH, master)
        print("  [+] meta_router.yaml re-assembled.")

    # ─── Update CONTROLER.yaml ───────────────────────────────────────────────
    print("\n[*] Updating CONTROLER.yaml…")
    controler = load_yaml(CONTROLER_PATH)
    if controler:
        health = "100%"
        session_count = 0
        if milestones:
            health = milestones.get("index", {}).get("overall_health", "100%")
            session_count = len(milestones.get("sessions", {}))

        if "system_status" not in controler:
            controler["system_status"] = {}
        controler["system_status"]["last_sync"] = now_iso()
        controler["system_status"]["overall_health"] = health
        controler["system_status"]["session_count"] = session_count

        if milestones and "sessions" in milestones:
            active_sessions = []
            for s_name, s_info in milestones["sessions"].items():
                goals_details = []
                for g in s_info.get("goals", []):
                    goals_details.append({
                        "name": g.get("name"),
                        "status": g.get("status"),
                        "progress": g.get("progress_percentage"),
                    })
                session_yaml_path = WORKSPACE_ROOT / s_info.get("yaml_path", "")
                round_info = None
                if session_yaml_path.exists():
                    y = YAML()
                    with open(session_yaml_path) as sf:
                        sdata = y.load(sf)
                        persistence = sdata.get("metadata", {}).get("persistence", {})
                        if persistence and persistence.get("enabled", False):
                            round_info = f"Round {persistence.get('current_round', 1)}/{persistence.get('max_rounds', 'unlimited')}"
                session_obj = {
                    "session_name": s_name,
                    "session_status": s_info.get("status"),
                    "session_summary": s_info.get("summary"),
                    "progress": s_info.get("progress_percentage"),
                    "goals": goals_details,
                }
                if round_info:
                    session_obj["round_info"] = round_info
                active_sessions.append(session_obj)
            controler["active_sessions"] = active_sessions

        update_telemetry(controler, health, session_count, dry_run)
        trim_recent_events(controler, dry_run)
        rollup_pipeline_telemetry(controler, dry_run)        # C1
        rollup_scaler_review_queue(controler, dry_run)        # C3
        rollup_archived_sessions(controler, dry_run)          # C2
        rollup_pending_evolutions(controler, dry_run)         # C4

        if toolboxes:
            total = functional = empty = 0
            for domain in ["core_toolboxes", "extended_toolboxes"]:
                d_data = toolboxes.get(domain, {})
                if domain == "core_toolboxes":
                    for _, t_info in d_data.items():
                        total += 1
                        status = t_info.get("health", {}).get("status")
                        if status in ["functional", "complete"]:
                            functional += 1
                        elif status == "empty":
                            empty += 1
                else:
                    for _, dom_info in d_data.items():
                        for _, sub_info in dom_info.get("sub_toolboxes", {}).items():
                            total += 1
                            status = sub_info.get("health", {}).get("status")
                            if status in ["functional", "complete"]:
                                functional += 1
                            elif status == "empty":
                                empty += 1
            controler.setdefault("telemetry", {})["toolbox_readiness"] = {
                "total": total,
                "functional": functional,
                "empty": empty,
            }

        if not dry_run:
            save_yaml(CONTROLER_PATH, controler)
            print(f"  [+] CONTROLER.yaml updated (Health: {health}, Sessions: {session_count}).")

    print("\n[!] Sync Complete.")


def sync(dry_run=False):
    """Run a master sync under the cross-process advisory lock (B1).

    Concurrent agents serialise through the lock; the second one waits up to
    `sync_lock_timeout_seconds` then exits non-zero so the caller can retry.
    """
    timeout = int(CONSTANTS.get("sync_lock_timeout_seconds", 30))
    stale = int(CONSTANTS.get("sync_lock_stale_seconds", 120))
    try:
        with with_lock(SYNC_LOCK_PATH, stale_seconds=stale, timeout_seconds=timeout):
            _do_sync(dry_run=dry_run)
    except SyncLockBusy as exc:
        print(f"[ERR] {exc}")
        print("[!] Another agent is currently running meta_sync. Try again in a moment.")
        sys.exit(2)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Agentic OS Master Sync Engine")
    parser.add_argument("--dry-run", action="store_true", help="Preview mutations.")
    parser.add_argument("--validate", action="store_true", help="Bidirectional drift detection.")
    args = parser.parse_args()
    if args.validate:
        ok = run_validate()
        sys.exit(0 if ok else 1)
    sync(dry_run=args.dry_run)
