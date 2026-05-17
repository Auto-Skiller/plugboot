import os
import sys
import pathlib
import subprocess
from datetime import datetime
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent
SCALER_BRAIN_DIR = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain"
SCALER_ROUTING_DIR = SCALER_BRAIN_DIR / ".scaler_routing"
SCALER_ROUTER_PATH = SCALER_BRAIN_DIR / "scaler_router.yaml"

def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def save_yaml(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: yaml.dump(data, f)

def now_iso(): return datetime.now().isoformat()

def main():
    print("[*] Starting Scaler Substrate Sync Engine v5.1...")
    
    sync_engines_dir = SCALER_ROUTING_DIR / "scaler_sync_engines"
    
    # 1. Run meta_runtime_sync.py
    runtime_sync = sync_engines_dir / "meta_runtime_sync.py"
    if runtime_sync.exists():
        print("[*] Running meta_runtime_sync.py...")
        subprocess.run([sys.executable, str(runtime_sync)], check=True)
        
    # 2. Run scaler_state_sync.py
    state_sync = sync_engines_dir / "scaler_state_sync.py"
    if state_sync.exists():
        print("[*] Running scaler_state_sync.py...")
        subprocess.run([sys.executable, str(state_sync)], check=True)
        
    # 3. Run scaler_ledgers_sync.py
    ledgers_sync = sync_engines_dir / "scaler_ledgers_sync.py"
    if ledgers_sync.exists():
        print("[*] Running scaler_ledgers_sync.py...")
        subprocess.run([sys.executable, str(ledgers_sync)], check=True)

    # 4. Re-assemble and verify master router: scaler_router.yaml
    print("\n[*] Re-assembling master scaler_router.yaml...")
    router = load_yaml(SCALER_ROUTER_PATH) or {
        "name": "scaler_router",
        "schema_version": "3.1",
        "description": "Master index for the Scaler Pipeline. Exposes the growth engine's architecture, workflows, rules, gateway lifecycle, and tracking ledgers.",
    }
    
    # Load dynamic parts
    runtime_data = load_yaml(SCALER_ROUTING_DIR / "scaler_runtime.yaml") or {}
    state_data = load_yaml(SCALER_ROUTING_DIR / "scaler_state.yaml") or {}
    ledgers_data = load_yaml(SCALER_ROUTING_DIR / "scaler_ledgers.yaml") or {}
    
    # Assemble router data
    router["last_updated"] = now_iso()
    
    # Reconstruct telemetry from gathered components
    router["telemetry"] = {
        "gateway": state_data.get("telemetry", {}).get("gateway", {
            "pending_approvals": 0, "last_action": "", "integration_queue": 0
        }),
        "discoveries": ledgers_data.get("external_discoveries", {}).get("aggregates", {
            "total_discoveries": 0, "total_integrated": 0, "total_pending": 0, "total_rejected": 0, "total_proposed": 0
        }),
        "internal_gaps": ledgers_data.get("internal_gaps", {"active_gaps": 0, "resolved_gaps": 0})
    }
    
    save_yaml(SCALER_ROUTER_PATH, router)
    print("[+] Dynamic master scaler_router.yaml successfully re-assembled.")
    print("[!] Scaler Substrate Sync Complete.")

if __name__ == "__main__":
    main()
