import os
import sys
import pathlib
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent.parent.parent
SCALER_STATE_LIVE = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain" / "scaler_ledgers" / "scaler_state.yaml"
SCALER_STATE_ROUTER = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain" / ".scaler_routing" / "scaler_state.yaml"

def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def save_yaml(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: yaml.dump(data, f)

def sync_state(dry_run=False):
    print("\n[*] Synchronizing scaler_state.yaml...")
    
    # 1. Scan target gateways for pending proposals
    pillars = ["Foundational_Integrity", "Operational_Muscles", "Value_Generation"]
    pending_proposals = []

    for p in pillars:
        # Scan EXTERNAL gateways
        ext_gateway_dir = WORKSPACE_ROOT / "_pipelines" / "_scaler" / p / "external_proposals"
        if ext_gateway_dir.exists():
            for f in ext_gateway_dir.glob("PROPOSAL-*.yaml"):
                pending_proposals.append(str(f.relative_to(WORKSPACE_ROOT)).replace("\\", "/"))

        # Scan INTERNAL gateways
        int_gateway_dir = WORKSPACE_ROOT / "_pipelines" / "_scaler" / p / "internal_proposals"
        if int_gateway_dir.exists():
            for f in int_gateway_dir.glob("MEGA-INT-*.yaml"):
                pending_proposals.append(str(f.relative_to(WORKSPACE_ROOT)).replace("\\", "/"))

    print(f"  [OK]  Scanned gateways. Found {len(pending_proposals)} pending proposals/action cards.")

    # 2. Update Live scaler_state.yaml
    scaler_state = load_yaml(SCALER_STATE_LIVE)
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

    # Update Telemetry gateway info
    if "telemetry" not in scaler_state: scaler_state["telemetry"] = {}
    scaler_state["telemetry"]["gateway"] = {
        "pending_approvals": len(pending_proposals),
        "last_action": scaler_state["state"]["gateway_metrics"].get("last_gateway_action", ""),
        "integration_queue": 0
    }

    if dry_run:
        print("  [DRY-RUN] Would update live scaler_state.yaml and scaler_state.yaml router.")
    else:
        save_yaml(SCALER_STATE_LIVE, scaler_state)
        # Mirror to the scaler_state.yaml router
        save_yaml(SCALER_STATE_ROUTER, scaler_state)
        print("  [+] Synchronized live scaler_state.yaml and scaler_state.yaml router.")

    return True

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    ok = sync_state(dry_run)
    sys.exit(0 if ok else 1)
