"""
hustler_state_sync.py
=====================
v5.4 path-aligned. Single source of truth for Hustler state lives only in
.hustler_routing/hustler_state.yaml. Resolves EVERY active CONTROLER session
linked to the Hustler pipeline (via SESSION.yaml.metadata.pipeline == 'hustler')
and binds active_sessions[] (the singular fields mirror the first entry for
backwards compatibility). Counts items pending in
_HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/.

Multi-session safety:
  - All disk writes go through atomic_write_yaml (tmp+os.replace) so the
    workspace stays consistent even if two agents race on this script during
    a multi-hour autonomous run.
  - active_sessions[] supersedes the legacy singular active_session field;
    singular fields are mirrored from the first match so older tools keep
    working without modification.
"""
import sys
import pathlib
from datetime import datetime
from ruamel.yaml import YAML

# Force UTF-8 stdout — CONTROLER values contain emoji like 🟢 that would
# otherwise crash Windows cp1252.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

yaml = YAML()
yaml.preserve_quotes = True

# ─── GAP-WORKSPACE-ROOT + GAP-SUB-LOCK fixes ────────────────────────────────
_THIS = pathlib.Path(__file__).resolve()
_ENGINES_PARENT = _THIS.parent.parent.parent.parent.parent.parent  # legacy fallback
_BOOTSTRAP_DIR = _ENGINES_PARENT / ".meta_brain" / ".meta_routing" / "meta_sync_engines" / "_shared"
sys.path.insert(0, str(_BOOTSTRAP_DIR))
try:
    from engine_bootstrap import find_workspace_root, run_under_workspace_lock  # noqa: E402
    WORKSPACE_ROOT = find_workspace_root(_THIS)
except Exception:
    WORKSPACE_ROOT = _ENGINES_PARENT
    run_under_workspace_lock = None  # type: ignore

HUSTLER_STATE = WORKSPACE_ROOT / "_pipelines" / "hustler" / ".hustler_brain" / ".hustler_routing" / "hustler_state.yaml"
MIXED_INBOX_DIR = WORKSPACE_ROOT / "_pipelines" / "hustler" / "_HUSTLER-EXTERNAL_SOURCES" / ".hustler_mixed_inbox"
CONTROLER_PATH = WORKSPACE_ROOT / "CONTROLER.yaml"
MILESTONES_DIR = WORKSPACE_ROOT / ".meta_brain" / "milestones"

# Shared atomic write (graceful fallback for first-boot environments where the
# meta-brain helpers aren't on the path yet).
SHARED_DIR = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "meta_sync_engines" / "_shared"
sys.path.insert(0, str(SHARED_DIR))
try:
    from atomic_io import atomic_write_yaml  # noqa: E402
except Exception:
    atomic_write_yaml = None
try:
    from freshness import stamp_freshness as _stamp_freshness  # noqa: E402
except Exception:
    _stamp_freshness = None
try:
    # GAP-FRESH-LITERAL fix: read the freshness threshold from BOOT_CONTRACTS.
    from boot_contracts import router_freshness_threshold as _shared_router_freshness  # noqa: E402
except Exception:
    _shared_router_freshness = None
try:
    # G-CTRL-AUDIT-2 fix: shared singular/plural session mirror helper.
    from state_helpers import mirror_singular_session  # noqa: E402
except Exception:
    mirror_singular_session = None


def _router_freshness_threshold() -> int:
    if _shared_router_freshness is not None:
        try:
            return int(_shared_router_freshness(WORKSPACE_ROOT))
        except Exception:
            pass
    return 1800


def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)


def save_yaml(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    if atomic_write_yaml is not None:
        atomic_write_yaml(path, data, yaml_instance=yaml)
        return
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(data, f)


def resolve_active_hustler_sessions():
    """Return a list of {session_name, current_round, max_rounds} dicts for
    every active session whose SESSION.yaml has metadata.pipeline=='hustler'.

    Returns [] when no Hustler-bound session is active. The list shape lets the
    pipeline track simultaneous sessions instead of silently picking just one.
    """
    controler = load_yaml(CONTROLER_PATH)
    if not controler:
        return []
    matches = []
    for session in (controler.get("active_sessions") or []):
        s_name = session.get("session_name")
        if not s_name:
            continue
        if session.get("session_status") not in (None, "active"):
            continue
        session_yaml = MILESTONES_DIR / s_name / "SESSION.yaml"
        if not session_yaml.exists():
            continue
        sdata = load_yaml(session_yaml) or {}
        meta = sdata.get("metadata") or {}
        if str(meta.get("pipeline", "")).strip().lower() != "hustler":
            continue
        persistence = meta.get("persistence") or {}
        matches.append({
            "session_name": s_name,
            "current_round": persistence.get("current_round"),
            "max_rounds": persistence.get("max_rounds"),
        })
    return matches


def resolve_active_mode():
    """Read CONTROLER.modes.hustler and return (work_mode, action_gate_list, profiles).

    work_mode is a string (e.g. 'STRICT'). action_gate is a flat list under the legacy
    single-list form (e.g. ['PLANNING 🟢']) OR an empty list when the new H-LAW-013
    profile form is used. profiles is the full INGESTION/PROCESSING profile mapping
    when present, else None.

    Returns (None, None, None) if CONTROLER is unreadable.
    """
    controler = load_yaml(CONTROLER_PATH)
    if not controler:
        return (None, None, None)
    hustler_mode = ((controler.get("modes") or {}).get("hustler") or {})
    work_mode = hustler_mode.get("work_mode")
    raw_profiles = hustler_mode.get("profiles")
    # Convert ruamel CommentedMap chains into plain Python dict/list so the
    # downstream YAML dumper builds a clean block structure (mixing
    # CommentedMap nodes from one document into another can leak flow_style
    # attributes and corrupt the output — see H-LAW-013 wiring rollout).
    profiles = _deep_plain(raw_profiles) if raw_profiles is not None else None

    action_gate = hustler_mode.get("action_gate") or []
    if isinstance(action_gate, dict):
        flattened = []
        for k, v in action_gate.items():
            if v:
                flattened.append(k)
        action_gate = flattened
    return (work_mode, action_gate, profiles)


def _deep_plain(node):
    """Recursively convert ruamel.yaml CommentedMap / CommentedSeq trees into
    plain Python dict / list. Drops anchors, comments, and flow_style flags so
    the receiving YAML document can render the value in its own preferred
    block style. Pure-data conversion — not a copy of structure."""
    if isinstance(node, dict):
        return {str(k): _deep_plain(v) for k, v in node.items()}
    if isinstance(node, (list, tuple)):
        return [_deep_plain(v) for v in node]
    return node


def count_mixed_inbox():
    if not MIXED_INBOX_DIR.exists():
        return 0
    return sum(1 for f in MIXED_INBOX_DIR.iterdir() if f.is_file() and f.name != ".gitkeep")


def heal_stuck_audit_lock(state: dict) -> bool:
    """GAP-EXT-1 (Hustler symmetric): same self-heal pattern as the Scaler.
    A crashed Audit Pass leaves ``state.audit_in_progress: true`` forever and
    blocks every future audit. We use the runbook's own per-check budget
    (``state.audit_policy.audit_check_timeout_seconds``, default 300s) ×
    6 checks × 1.5 safety margin to detect dead locks bounded in time.
    Returns True when the lock was healed.
    """
    s = (state or {}).get("state") or {}
    if not s.get("audit_in_progress"):
        return False
    last_audit = s.get("last_audit") or {}
    started_at = last_audit.get("started_at")
    completed_at = last_audit.get("completed_at")
    if completed_at and started_at and completed_at >= started_at:
        s["audit_in_progress"] = False
        print("  [+] healed stuck audit lock: completed_at present without lock release")
        return True
    if not isinstance(started_at, str) or not started_at:
        s["audit_in_progress"] = False
        print("  [+] healed orphan audit lock: started_at missing while lock=true")
        return True
    try:
        started_dt = datetime.fromisoformat(started_at)
    except ValueError:
        s["audit_in_progress"] = False
        print(f"  [+] healed audit lock with unparseable started_at={started_at!r}")
        return True
    policy = s.get("audit_policy") or {}
    per_check_seconds = int(policy.get("audit_check_timeout_seconds", 300))
    max_audit_seconds = int(per_check_seconds * 6 * 1.5)
    age = (datetime.now() - started_dt).total_seconds()
    if age > max_audit_seconds:
        s["audit_in_progress"] = False
        print(f"  [+] healed stuck audit lock: started_at={started_at} age={int(age)}s > budget {max_audit_seconds}s")
        return True
    return False


def sync_state(dry_run=False):
    print("\n[*] Synchronizing hustler_state.yaml...")

    state = load_yaml(HUSTLER_STATE) or {}
    if "state" not in state: state["state"] = {}

    # Mirror active_mode from CONTROLER (H3 fix — single source of truth).
    # H-LAW-013 extension: if CONTROLER uses the new profile form (per-transition
    # EXECUTION/PLANNING lists per phase), mirror the full profiles block under
    # active_mode.profiles so the runtime view matches the live gate. The legacy
    # single-list action_gate is still mirrored (as [] when profiles are used,
    # for backward compatibility with existing readers).
    work_mode, action_gate, profiles = resolve_active_mode()
    if work_mode is not None or action_gate is not None or profiles is not None:
        # Rebuild active_mode as a fresh CommentedMap to avoid trailing-comment
        # contamination from older schemas (the inherited comment ledger on the
        # legacy `action_gate` key would otherwise corrupt block style when a
        # new `profiles` sibling key is inserted after it).
        from ruamel.yaml.comments import CommentedMap
        am = CommentedMap()
        if work_mode is not None:
            am["work_mode"] = work_mode
        am["action_gate"] = action_gate or []
        if profiles is not None:
            am["profiles"] = profiles
        state["state"]["active_mode"] = am
        wm_ascii = (str(work_mode).encode("ascii", "replace").decode("ascii")
                    if work_mode is not None else "None")
        gate_ascii = [str(g).encode("ascii", "replace").decode("ascii") for g in (action_gate or [])]
        if profiles is not None:
            phases = list(profiles.keys()) if isinstance(profiles, dict) else []
            print(f"  [OK]  Mirrored CONTROLER.modes.hustler: work_mode={wm_ascii}, profiles={phases}")
        else:
            print(f"  [OK]  Mirrored CONTROLER.modes.hustler: work_mode={wm_ascii}, action_gate={gate_ascii}")
    else:
        print("  [WARN] Could not read CONTROLER.modes.hustler -- active_mode left as-is")

    # Bind every active hustler session — A1 multi-session safety.
    sessions = resolve_active_hustler_sessions()
    state["state"]["active_sessions"] = sessions

    # G-CTRL-AUDIT-2: mirror legacy singular fields through the shared helper
    # so the contract has one home (was: inline copy-paste in two engines).
    if mirror_singular_session is not None:
        mirror_singular_session(state)
        if sessions:
            rounds_repr = ", ".join(
                f"{s['session_name']} ({s.get('current_round')}/{s.get('max_rounds')})" for s in sessions
            )
            print(f"  [OK]  Linked {len(sessions)} session(s): {rounds_repr}")
        else:
            print("  [OK]  No active hustler session in CONTROLER (cleared linkage)")
    else:
        # Fallback: shared helper unavailable (early bootstrap).
        if sessions:
            primary = sessions[0]
            state["state"]["active_session"] = primary["session_name"]
            state["state"]["current_round"] = primary["current_round"]
            state["state"]["max_rounds"] = primary["max_rounds"]
            rounds_repr = ", ".join(
                f"{s['session_name']} ({s.get('current_round')}/{s.get('max_rounds')})" for s in sessions
            )
            print(f"  [OK]  Linked {len(sessions)} session(s): {rounds_repr}")
        else:
            for k in ("active_session", "current_round", "max_rounds"):
                state["state"][k] = None
            print("  [OK]  No active hustler session in CONTROLER (cleared linkage)")

    # Count pending items in .hustler_mixed_inbox/
    pending = count_mixed_inbox()
    if "telemetry" not in state: state["telemetry"] = {}
    state["telemetry"].setdefault("metrics", {})["mixed_inbox_pending"] = pending
    print(f"  [OK]  .hustler_mixed_inbox/ pending count: {pending}")

    # GAP-EXT-1 (symmetric): self-heal a stuck audit_in_progress lock so a
    # crashed audit never blocks future audits.
    heal_stuck_audit_lock(state)

    if dry_run:
        print("  [DRY-RUN] Would update hustler_state.yaml in routing.")
    else:
        # GAP-FRESH-INNER fix: stamp freshness so agents reading hustler_state
        # mid-session can detect staleness via is_fresh(), same contract as
        # every workspace router.
        if _stamp_freshness is not None:
            _stamp_freshness(state, threshold_seconds=_router_freshness_threshold())
        save_yaml(HUSTLER_STATE, state)
        print("  [+] Synchronized hustler_state.yaml (routing).")
    return True


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    if run_under_workspace_lock is not None:
        sys.exit(run_under_workspace_lock(sync_state, workspace_root=WORKSPACE_ROOT, dry_run=dry_run))
    ok = sync_state(dry_run)
    sys.exit(0 if ok else 1)
