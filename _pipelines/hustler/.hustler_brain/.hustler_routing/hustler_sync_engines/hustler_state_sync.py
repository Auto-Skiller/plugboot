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
from ruamel.yaml import YAML

# Force UTF-8 stdout — CONTROLER values contain emoji like 🟢 that would
# otherwise crash Windows cp1252.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent.parent.parent
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
    """Read CONTROLER.modes.hustler and return (work_mode, action_gate_list).
    work_mode is a string (e.g. 'STRICT'); action_gate is a flat list (e.g. ['PLANNING 🟢']).
    Returns (None, None) if CONTROLER is unreadable."""
    controler = load_yaml(CONTROLER_PATH)
    if not controler:
        return (None, None)
    hustler_mode = ((controler.get("modes") or {}).get("hustler") or {})
    work_mode = hustler_mode.get("work_mode")
    action_gate = hustler_mode.get("action_gate") or []
    if isinstance(action_gate, dict):
        flattened = []
        for k, v in action_gate.items():
            if v:
                flattened.append(k)
        action_gate = flattened
    return (work_mode, action_gate)


def count_mixed_inbox():
    if not MIXED_INBOX_DIR.exists():
        return 0
    return sum(1 for f in MIXED_INBOX_DIR.iterdir() if f.is_file() and f.name != ".gitkeep")


def sync_state(dry_run=False):
    print("\n[*] Synchronizing hustler_state.yaml...")

    state = load_yaml(HUSTLER_STATE) or {}
    if "state" not in state: state["state"] = {}

    # Mirror active_mode from CONTROLER (H3 fix — single source of truth)
    work_mode, action_gate = resolve_active_mode()
    if work_mode is not None or action_gate is not None:
        state["state"].setdefault("active_mode", {})
        if work_mode is not None:
            state["state"]["active_mode"]["work_mode"] = work_mode
        state["state"]["active_mode"]["action_gate"] = action_gate or []
        wm_ascii = (str(work_mode).encode("ascii", "replace").decode("ascii")
                    if work_mode is not None else "None")
        gate_ascii = [str(g).encode("ascii", "replace").decode("ascii") for g in (action_gate or [])]
        print(f"  [OK]  Mirrored CONTROLER.modes.hustler: work_mode={wm_ascii}, action_gate={gate_ascii}")
    else:
        print("  [WARN] Could not read CONTROLER.modes.hustler -- active_mode left as-is")

    # Bind every active hustler session — A1 multi-session safety.
    sessions = resolve_active_hustler_sessions()
    state["state"]["active_sessions"] = sessions
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

    if dry_run:
        print("  [DRY-RUN] Would update hustler_state.yaml in routing.")
    else:
        save_yaml(HUSTLER_STATE, state)
        print("  [+] Synchronized hustler_state.yaml (routing).")
    return True


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    ok = sync_state(dry_run)
    sys.exit(0 if ok else 1)
