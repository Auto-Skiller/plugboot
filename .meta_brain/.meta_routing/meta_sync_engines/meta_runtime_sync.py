import os
import sys
import pathlib
from datetime import datetime
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent
RUNTIME_ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "meta_runtime.yaml"
RUNTIME_DIR = WORKSPACE_ROOT / ".meta_runtime"

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
        
        # Check for dynamic keys like [INFRA_ID]
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

def check_env_health():
    venv_path = RUNTIME_DIR / "venv" / ".venv"
    req_path = RUNTIME_DIR / "venv" / "requirements.txt"
    
    health = {"status": "healthy", "warnings": []}
    
    if not venv_path.exists():
        health["status"] = "unhealthy"
        health["warnings"].append("Master .venv missing at .meta_runtime/venv/.venv")
    
    if not req_path.exists():
        health["warnings"].append("requirements.txt missing at .meta_runtime/venv/requirements.txt")
        
    return health

def sync_runtime(dry_run=False):
    print("\n[*] Synchronizing meta_runtime.yaml...")
    if not RUNTIME_DIR.exists():
        print("  [ERR] .meta_runtime directory not found.")
        return

    # Load schema
    schema = load_schema_from_yaml(RUNTIME_ROUTER_PATH, "infrastructure_schema")
    warnings_found = False

    health = check_env_health()
    if health["status"] == "unhealthy":
        for w in health["warnings"]: print(f"  [ERR] {w}")
    elif health["warnings"]:
        for w in health["warnings"]: print(f"  [WARN] {w}")

    # Discover infrastructure
    infra = {}
    for item in sorted(RUNTIME_DIR.rglob("*")):
        if item.name.startswith("_") or item.name == ".gitkeep": continue
        
        # Skip items inside venv except the venv folder itself
        rel_to_runtime = item.relative_to(RUNTIME_DIR)
        parts = rel_to_runtime.parts
        if len(parts) > 1 and parts[0] == "venv":
            continue
            
        # Skip heavy browser profiles / crashpad / default files to prevent huge maps and transient state
        if "browser_profile" in parts or "profiles" in parts:
            if "profiles" in parts and parts[parts.index("profiles"):] != ("profiles",):
                continue
            if "browser_profile" in parts:
                continue
            
        name = str(rel_to_runtime).replace("\\", "/").replace(" ", "_")
        is_file = item.is_file()
        
        infra[name] = {
            "path": str(item.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
            "description": f"File: {item.name}" if is_file else f"Directory: {item.name}"
        }
        
        # Special check for venv -> os_engine
        if name == "venv":
            req_path = item / "requirements.txt"
            if req_path.exists():
                infra["os_engine"] = {
                    "path": str(req_path.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
                    "description": "Python runtime engine manifest (requirements.txt)."
                }
        
        print(f"  [OK]  {name}")

    # Validate against schema
    if schema:
        is_valid, err = validate(infra, schema)
        if not is_valid:
            print(f"  [WARN] Infrastructure failed schema validation: {err}")
            warnings_found = True

    runtime_data = load_yaml(RUNTIME_ROUTER_PATH) or {
        "name": "meta_runtime_router",
        "schema_version": "1.0",
        "description": "Index of all runtime infrastructure components.",
    }
    runtime_data["generated_at"] = now_iso()
    runtime_data["health"] = health
    runtime_data["infrastructure"] = infra

    if dry_run:
        print(f"  [DRY-RUN] Would update meta_runtime.yaml")
    else:
        save_yaml(RUNTIME_ROUTER_PATH, runtime_data)
        print(f"[+] Updated meta_runtime.yaml (Status: {health['status']})")
        
    return not warnings_found

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    ok = sync_runtime(dry_run)
    sys.exit(0 if ok else 1)
