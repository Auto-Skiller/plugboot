import os
import sys
import pathlib
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent.parent.parent
# Corrected paths for Agentic OS v5
SCALER_STATE_PATH = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain" / ".scaler_router" / "SCALER-STATE.yaml"

def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def save_yaml(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: yaml.dump(data, f)

def sync_scaler_gateways(dry_run=False):
    """Scans all gateway folders for pending proposals and updates SCALER-STATE.yaml."""
    if dry_run:
        print("  [DRY-RUN] Would scan Scaler gateways for pending proposals.")
        return

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

    try:
        scaler_state = load_yaml(SCALER_STATE_PATH)
        if not scaler_state:
            # Initialize state if missing
            scaler_state = {
                "name": "scaler_state",
                "state": {
                    "current_phase": "Discovery",
                    "gateway_metrics": {}
                },
                "telemetry": {}
            }
        
        if "state" not in scaler_state: scaler_state["state"] = {}
        if "gateway_metrics" not in scaler_state["state"]:
            scaler_state["state"]["gateway_metrics"] = {}
        
        scaler_state["state"]["gateway_metrics"]["pending_approvals_count"] = len(pending_proposals)
        scaler_state["state"]["gateway_metrics"]["active_proposals"] = pending_proposals
        
        save_yaml(SCALER_STATE_PATH, scaler_state)
        print(f"  [+] Updated SCALER-STATE.yaml gateway metrics (pending: {len(pending_proposals)})")
    except Exception as e:
        print(f"  [WARN] Failed to update SCALER-STATE.yaml: {e}")

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    sync_scaler_gateways(dry_run)
