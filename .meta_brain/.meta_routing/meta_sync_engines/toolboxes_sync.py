import os
import sys
import pathlib
from datetime import datetime
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent
TOOLBOX_ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "toolboxes.yaml"
def load_schema_from_yaml(yaml_path, schema_key):
    if not yaml_path.exists(): return None
    with open(yaml_path, "r", encoding="utf-8") as f:
        data = yaml.load(f)
    if not data: return None
    schema_str = data.get(schema_key)
    if not schema_str: return None
    # Parse the schema string as YAML
    from ruamel.yaml import YAML as YAML_safe; return YAML_safe(typ='safe').load(schema_str)

def validate(data, schema):
    """
    Validates a data dictionary against a schema dictionary.
    Supports nested dicts, lists, enums (pipe-separated), and basic types.
    Returns (is_valid, error_message).
    """
    if isinstance(schema, dict):
        if not isinstance(data, dict):
            return False, f"Expected dict, got {type(data).__name__}"
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
        elif schema == "string | dict":
            if not isinstance(data, (str, dict)):
                return False, f"Expected string or dict, got {type(data).__name__}"
            return True, ""
        
        if "|" in schema:
            allowed = [s.strip() for s in schema.split("|")]
            if str(data) not in allowed:
                return False, f"Value '{data}' not in allowed list: {allowed}"
            return True, ""
        
        return True, ""
        
    return True, ""

def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def save_yaml(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: yaml.dump(data, f)

def now_iso(): return datetime.now().isoformat()

def sync_toolboxes(dry_run=False):
    print("\n[*] Synchronizing toolboxes.yaml...")
    router = load_yaml(TOOLBOX_ROUTER_PATH)
    schema = load_schema_from_yaml(TOOLBOX_ROUTER_PATH, "toolbox_inner_schema")
    warnings_found = False
    if not router:
        print("  [ERR] toolboxes.yaml not found \u2014 skipping.")
        return

    router_modified = False

    def process_toolbox(tb_info, tb_path):
        nonlocal router_modified, warnings_found
        if not tb_path.exists(): return
        
        # Try to load the internal YAML for description/when_to_use
        inner_yaml_path = tb_path / f"{tb_path.name}.yaml"
        if inner_yaml_path.exists():
            inner_data = load_yaml(inner_yaml_path)
            
            # Validate against schema
            if schema:
                is_valid, err = validate(inner_data, schema)
                if not is_valid:
                    print(f"  [WARN] Toolbox {tb_path.name} failed schema validation: {err}")
                    warnings_found = True
                    
            if inner_data and "metadata" in inner_data:
                meta = inner_data["metadata"]
                if meta.get("description") and tb_info.get("description") != meta["description"]:
                    tb_info["description"] = meta["description"]
                    router_modified = True
                if meta.get("when_to_use") and tb_info.get("when_to_use") != meta["when_to_use"]:
                    tb_info["when_to_use"] = meta["when_to_use"]
                    router_modified = True

        agents_dir, skills_dir = tb_path / "agents", tb_path / "skills"
        agent_names = sorted([f.stem for f in agents_dir.glob("*.md")]) if agents_dir.exists() else []
        skill_names = sorted([d.name for d in skills_dir.iterdir() if d.is_dir()]) if skills_dir.exists() else []
            
        if tb_info.get("agent_count") != len(agent_names) or tb_info.get("skill_count") != len(skill_names):
            tb_info["agent_names"] = agent_names
            tb_info["agent_count"] = len(agent_names)
            tb_info["skill_names"] = skill_names
            tb_info["skill_count"] = len(skill_names)
            router_modified = True
            
        if "health" in tb_info:
            pct = sum([
                40 if len(skill_names) > 0 else 0,
                30 if len(agent_names) > 0 else 0,
                20 if (tb_path / "execution").exists() else 0,
                10 if (tb_path / "examples").exists() else 0
            ])
            
            if tb_info["health"].get("completion_pct") != pct:
                tb_info["health"]["completion_pct"] = pct
                tb_info["health"]["status"] = "empty" if pct == 0 else "partial" if pct < 50 else "functional" if pct < 90 else "complete"
                router_modified = True

        # Check if local YAML file exists, and if so, keep it updated too!
        if inner_yaml_path.exists() and inner_data:
            inner_modified = False
            
            # Ensure dictionaries exist
            if "capabilities" not in inner_data:
                inner_data["capabilities"] = {}
            if "health" not in inner_data:
                inner_data["health"] = {}
                
            caps = inner_data["capabilities"]
            health_sec = inner_data["health"]
            
            if caps.get("agent_names") != agent_names:
                caps["agent_names"] = agent_names
                inner_modified = True
            if caps.get("agent_count") != len(agent_names):
                caps["agent_count"] = len(agent_names)
                inner_modified = True
            if caps.get("skill_names") != skill_names:
                caps["skill_names"] = skill_names
                inner_modified = True
            if caps.get("skill_count") != len(skill_names):
                caps["skill_count"] = len(skill_names)
                inner_modified = True
                
            pct = sum([
                40 if len(skill_names) > 0 else 0,
                30 if len(agent_names) > 0 else 0,
                20 if (tb_path / "execution").exists() else 0,
                10 if (tb_path / "examples").exists() else 0
            ])
            status = "empty" if pct == 0 else "partial" if pct < 50 else "functional" if pct < 90 else "complete"
            
            if health_sec.get("status") != status:
                health_sec["status"] = status
                inner_modified = True
                
            if "metadata" in inner_data:
                mat_level = "stub" if status == "empty" else status
                if inner_data["metadata"].get("maturity_level") != mat_level:
                    inner_data["metadata"]["maturity_level"] = mat_level
                    inner_modified = True
            
            if inner_modified:
                health_sec["last_audit"] = now_iso()
                if not dry_run:
                    save_yaml(inner_yaml_path, inner_data)
                    print(f"  [+] Auto-updated local toolbox manifest: {inner_yaml_path.name}")

    for name, info in (router.get("core_toolboxes") or {}).items():
        if not isinstance(info, dict): continue
        p = WORKSPACE_ROOT / info.get("path", "")
        if p.exists():
            print(f"  [OK]  core.{name}")
            process_toolbox(info, p)

    for domain, domain_info in (router.get("extended_toolboxes") or {}).items():
        if not isinstance(domain_info, dict): continue
        for sub_name, sub_info in (domain_info.get("sub_toolboxes") or {}).items():
            if not isinstance(sub_info, dict): continue
            p = WORKSPACE_ROOT / sub_info.get("path", "")
            if p.exists():
                print(f"  [OK]  {domain}/{sub_name}")
                process_toolbox(sub_info, p)

    if router_modified and not dry_run:
        save_yaml(TOOLBOX_ROUTER_PATH, router)
        print("  [+] Updated toolboxes.yaml with metadata from inner YAMLs.")

    print("[TOOLBOX] Done.")
    return not warnings_found

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    ok = sync_toolboxes(dry_run)
    sys.exit(0 if ok else 1)
