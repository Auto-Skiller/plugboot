import os
import sys
import pathlib
from ruamel.yaml import YAML

# Force UTF-8 stdout — CONTROLER values contain emoji that would otherwise
# crash Windows cp1252.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent.parent.parent
# Single source of truth for scaler state — lives only in routing.
SCALER_STATE = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain" / ".scaler_routing" / "scaler_state.yaml"
CONTROLER_PATH = WORKSPACE_ROOT / "CONTROLER.yaml"
MILESTONES_DIR = WORKSPACE_ROOT / ".meta_brain" / "milestones"

# Reach the workspace-shared atomic writer so partial writes can't corrupt state.
SHARED_DIR = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "meta_sync_engines" / "_shared"
sys.path.insert(0, str(SHARED_DIR))
try:
    from atomic_io import atomic_write_yaml  # noqa: E402
except Exception:
    atomic_write_yaml = None  # graceful fallback if shared layer is missing


def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def save_yaml(path, data):
    """Atomic write (M1) with graceful fallback for early-bootstrap calls."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if atomic_write_yaml is not None:
        atomic_write_yaml(path, data, yaml_instance=yaml)
        return
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(data, f)


# ─── A1 + G3 + G14: resolve EVERY active scaler session, not just the first.
def resolve_active_scaler_sessions():
    """Return a list of {session_name, current_round, max_rounds} dicts for
    every active session whose physical SESSION.yaml declares pipeline=='scaler'.

    Why a list: under multi-session multi-hour operation, two scaler sessions
    can be active in parallel (e.g. SES-SCALER-GROWTH cycling rounds while a
    SES-SCALER-EXECUTION lands a structural fix). The previous implementation
    returned the first match and silently dropped the rest.
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
        if str(meta.get("pipeline", "")).strip().lower() != "scaler":
            continue
        persistence = meta.get("persistence") or {}
        matches.append({
            "session_name": s_name,
            "current_round": persistence.get("current_round"),
            "max_rounds": persistence.get("max_rounds"),
        })
    return matches


def sync_state(dry_run=False):
    print("\n[*] Synchronizing scaler_state.yaml...")

    # 1. Scan target gateways for pending proposals.
    # Post-restructure (v5.3) layout: gateway folders are FLAT at the pipeline root
    # as `[Pillar]_external_proposals/` and `[Pillar]_internal_proposals/`.
    pillars = ["Foundational_Integrity", "Operational_Muscles", "Value_Generation"]
    pending_proposals = []

    for p in pillars:
        # Scan EXTERNAL gateway (flat)
        ext_gateway_dir = WORKSPACE_ROOT / "_pipelines" / "_scaler" / f"{p}_external_proposals"
        if ext_gateway_dir.exists():
            for f in ext_gateway_dir.glob("PROPOSAL-*.yaml"):
                pending_proposals.append(str(f.relative_to(WORKSPACE_ROOT)).replace("\\", "/"))

        # Scan INTERNAL gateway (flat)
        int_gateway_dir = WORKSPACE_ROOT / "_pipelines" / "_scaler" / f"{p}_internal_proposals"
        if int_gateway_dir.exists():
            for f in int_gateway_dir.glob("MEGA-INT-*.yaml"):
                pending_proposals.append(str(f.relative_to(WORKSPACE_ROOT)).replace("\\", "/"))

    print(f"  [OK]  Scanned gateways. Found {len(pending_proposals)} pending proposals/action cards.")

    # 2. Update scaler_state.yaml (single source of truth in routing)
    scaler_state = load_yaml(SCALER_STATE)
    if not scaler_state:
        scaler_state = {
            "name": "scaler_state",
            "state": {
                "current_phase": "Discovery",
                "active_mode": {
                    "action_gate": {"EXECUTION": [], "PLANNING": ["FULL"]},
                    "input_mode": "AUTO",
                    "target_pillar": "AUTO"
                },
                "gateway_metrics": {}
            },
            "telemetry": {
                "systems_scaled": 0,
                "proposals_generated": 0,
                "solutions_generated": 0
            }
        }

    if "state" not in scaler_state: scaler_state["state"] = {}
    if "gateway_metrics" not in scaler_state["state"]: scaler_state["state"]["gateway_metrics"] = {}

    scaler_state["state"]["gateway_metrics"]["pending_approvals_count"] = len(pending_proposals)
    scaler_state["state"]["gateway_metrics"]["active_proposals"] = pending_proposals

    # A1 + G3 + G14: resolve EVERY active CONTROLER session linked to this pipeline.
    sessions = resolve_active_scaler_sessions()
    scaler_state["state"]["active_sessions"] = sessions

    # Backwards-compatible singular fields. They mirror the FIRST entry so older
    # tools keep working; explicitly cleared when the list is empty.
    if sessions:
        primary = sessions[0]
        scaler_state["state"]["active_session"] = primary["session_name"]
        if primary.get("current_round") is not None:
            scaler_state["state"]["current_round"] = primary["current_round"]
        if primary.get("max_rounds") is not None:
            scaler_state["state"]["max_rounds"] = primary["max_rounds"]
        rounds_repr = ", ".join(
            f"{s['session_name']} ({s.get('current_round')}/{s.get('max_rounds')})" for s in sessions
        )
        print(f"  [OK]  Linked {len(sessions)} session(s): {rounds_repr}")
    else:
        for k in ("active_session", "current_round", "max_rounds"):
            scaler_state["state"].pop(k, None)
        print("  [OK]  No active scaler session in CONTROLER (cleared linkage)")

    # Update Telemetry gateway info
    if "telemetry" not in scaler_state: scaler_state["telemetry"] = {}
    scaler_state["telemetry"]["gateway"] = {
        "pending_approvals": len(pending_proposals),
        "last_action": scaler_state["state"]["gateway_metrics"].get("last_gateway_action", ""),
        "integration_queue": 0
    }

    if dry_run:
        print("  [DRY-RUN] Would update scaler_state.yaml in routing.")
    else:
        save_yaml(SCALER_STATE, scaler_state)
        print("  [+] Synchronized scaler_state.yaml (routing).")

    return True

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    ok = sync_state(dry_run)
    sys.exit(0 if ok else 1)
