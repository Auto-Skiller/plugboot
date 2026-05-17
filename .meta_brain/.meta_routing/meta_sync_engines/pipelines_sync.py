import os
import sys
import pathlib
import subprocess
from datetime import datetime
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent
PIPELINES_ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "pipelines.yaml"
SCALER_STATE_PATH = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain" / "scaler_ledgers" / "scaler_state.yaml"
HUSTLER_STATE_PATH = WORKSPACE_ROOT / "_pipelines" / "hustler" / ".brain" / ".routing" / "HUSTLER-STATE.yaml"

def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def save_yaml(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: yaml.dump(data, f)

def now_iso(): return datetime.now().isoformat()

def validate(data, schema):
    if isinstance(schema, dict):
        if not isinstance(data, dict):
            return False, f"Expected dict, got {type(data).__name__}"
        
        # Check for dynamic keys like [PROJECT_ID]
        dynamic_key = None
        for k in schema.keys():
            if str(k).startswith("[") and str(k).endswith("]"):
                dynamic_key = k
                break
                
        if dynamic_key:
            type_def = schema[dynamic_key]
            for k, v in data.items():
                valid, err = validate(v, type_def)
                if not valid: return False, f"{k} -> {err}"
            return True, ""
            
        for key, type_def in schema.items():
            if key not in data:
                return False, f"Missing required key: {key}"
            valid, err = validate(data[key], type_def)
            if not valid:
                return False, f"{key} -> {err}"
        return True, ""
        
    elif isinstance(schema, list):
        if not isinstance(data, list):
            return False, f"Expected list, got {type(data).__name__}"
        if len(schema) > 0:
            type_def = schema[0]
            for i, item in enumerate(data):
                valid, err = validate(item, type_def)
                if not valid:
                    return False, f"Index {i} -> {err}"
        return True, ""
        
    elif isinstance(schema, str):
        if schema == "string":
            if not isinstance(data, str):
                return False, f"Expected string, got {type(data).__name__}"
            if not data.strip():
                return False, f"Field is empty"
        elif schema == "timestamp":
            if not isinstance(data, str):
                return False, f"Expected timestamp string, got {type(data).__name__}"
        
        if "|" in schema:
            allowed = [s.strip() for s in schema.split("|")]
            if str(data) not in allowed:
                return False, f"Value '{data}' not in allowed list: {allowed}"
            return True, ""
        
        return True, ""
        
    return True, ""

def load_schema_from_yaml(yaml_path, schema_key):
    if not yaml_path.exists(): return None
    with open(yaml_path, "r", encoding="utf-8") as f:
        data = yaml.load(f)
    if not data: return None
    schema_str = data.get(schema_key)
    if not schema_str: return None
    # Parse the schema string as YAML
    from ruamel.yaml import YAML as YAML_safe; return YAML_safe(typ='safe').load(schema_str)

def update_scaler_telemetry(dry_run: bool):
    if dry_run: return
    state = load_yaml(SCALER_STATE_PATH)
    if not state: return
    
    s_data = state.get("state", {})
    tel = state.get("telemetry", {})
    
    tel["gateway"] = {
        "pending_approvals": len(s_data.get("active_gateways", {}).get("proposals", [])),
        "last_action": s_data.get("active_gateways", {}).get("last_action", ""),
        "integration_queue": 0 
    }
    state["telemetry"] = tel
    save_yaml(SCALER_STATE_PATH, state)
    print(f"  [+] Updated Scaler local telemetry.")

def update_hustler_telemetry(dry_run: bool):
    if dry_run: return
    state = load_yaml(HUSTLER_STATE_PATH)
    if not state: return
    
    tel = state.get("telemetry", {})
    tel["health_signals"] = tel.get("health_signals", {})
    tel["health_signals"]["last_sync"] = now_iso()
    state["telemetry"] = tel
    save_yaml(HUSTLER_STATE_PATH, state)
    print(f"  [+] Updated Hustler local telemetry.")

def sync_pipelines(dry_run=False):
    print("\n[*] Synchronizing pipelines.yaml...")
    
    # Load schema
    schema = load_schema_from_yaml(PIPELINES_ROUTER_PATH, "pipeline_schema")
    warnings_found = False
    
    router = load_yaml(PIPELINES_ROUTER_PATH) or {
        "name": "pipelines_router",
        "schema_version": "1.0",
        "description": "Index of all active OS pipelines.",
        "pipelines": {}
    }

    router_modified = False
    for p_name, p_info in (router.get("pipelines") or {}).items():
        inner_router_path = WORKSPACE_ROOT / p_info.get("path", "")
        if not inner_router_path.exists():
            print(f"  [WARN] Inner router for {p_name} not found at {p_info.get('path')}")
            continue
            
        inner_data = load_yaml(inner_router_path)
        if inner_data:
            desc = inner_data.get("description")
            wtu = inner_data.get("when_to_use") or inner_data.get("metadata", {}).get("metadata", {}).get("when_to_use")
            status = inner_data.get("status") or inner_data.get("metadata", {}).get("status", "active")
            
            if desc and p_info.get("description") != desc:
                p_info["description"] = desc
                router_modified = True
            if wtu and p_info.get("when_to_use") != wtu:
                p_info["when_to_use"] = wtu
                router_modified = True
            if status and p_info.get("status") != status:
                p_info["status"] = status
                router_modified = True
        
        print(f"  [OK]  {p_name}")

    # Validate against schema
    if schema:
        is_valid, err = validate(router.get("pipelines", {}), schema)
        if not is_valid:
            print(f"  [WARN] Pipelines failed schema validation: {err}")
            warnings_found = True

    if router_modified and not dry_run:
        save_yaml(PIPELINES_ROUTER_PATH, router)
        print("  [+] Updated pipelines.yaml with metadata from pipeline routers.")

    # Specific Pipeline State Syncs (Preserving Original Logic)
    if not dry_run:
        # Scaler
        scaler_sync_script = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain" / "scaler_sync.py"
        if scaler_sync_script.exists():
            print("[*] Triggering Scaler State Sync...")
            subprocess.run([sys.executable, str(scaler_sync_script)])
            update_scaler_telemetry(dry_run)
        
        # Hustler
        hustler_sync_script = WORKSPACE_ROOT / "_pipelines" / "hustler" / ".brain" / ".routing" / "sync_engines" / "sync_hustler.py"
        if hustler_sync_script.exists():
            print("[*] Triggering Hustler State Sync...")
            subprocess.run([sys.executable, str(hustler_sync_script)])
            update_hustler_telemetry(dry_run)

    print("[PIPELINES] Done.")
    return not warnings_found

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    ok = sync_pipelines(dry_run)
    sys.exit(0 if ok else 1)
