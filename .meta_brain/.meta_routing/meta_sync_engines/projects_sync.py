import os
import sys
import pathlib
from datetime import datetime
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent
PROJECTS_DIR = WORKSPACE_ROOT / "projects"
PROJ_ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "projects.yaml"

def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def save_yaml(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: yaml.dump(data, f)

def now_iso():
    return datetime.now().isoformat()

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

def sync_projects(dry_run=False):
    print("\n[*] Synchronizing projects.yaml...")
    if not PROJECTS_DIR.exists():
        print("  [WARN] projects/ directory not found.")
        return

    # Load schema
    schema = load_schema_from_yaml(PROJ_ROUTER_PATH, "project_schema")
    warnings_found = False
        
    proj_router = load_yaml(PROJ_ROUTER_PATH) or {
        "name": "projects_router",
        "schema_version": "1.0",
        "description": "Index of all finite codebases and standalone builds.",
        "projects": {}
    }

    if "projects" not in proj_router or not isinstance(proj_router["projects"], dict):
        proj_router["projects"] = {}

    for item in sorted(PROJECTS_DIR.iterdir()):
        if not item.is_dir() or item.name.startswith(".") or item.name.startswith("_"):
            continue
            
        proj_name = item.name
        
        # Default data
        if proj_name not in proj_router["projects"]:
            proj_router["projects"][proj_name] = {
                "path": f"projects/{proj_name}/",
                "readme": f"projects/{proj_name}/README.md" if (item / "README.md").exists() else None,
                "entry_point": "unknown",
                "type": "other",
                "stack": [],
                "status": "active",
                "description": "Auto-discovered project",
                "when_to_use": "No guidelines provided",
                "started_at": now_iso(),
                "last_modified": now_iso()
            }
            print(f"  [+] Discovered new project: {proj_name}")
        
        # Update dependencies and readme status
        p_data = proj_router["projects"][proj_name]
        p_data["readme"] = f"projects/{proj_name}/README.md" if (item / "README.md").exists() else None
        
        # Try to pull description and when_to_use from project.yaml
        proj_yaml_path = item / "project.yaml"
        if proj_yaml_path.exists():
            try:
                with open(proj_yaml_path, "r", encoding="utf-8") as f:
                    p_yaml = yaml.load(f)
                    if p_yaml:
                        if "description" in p_yaml: p_data["description"] = p_yaml["description"]
                        if "when_to_use" in p_yaml: p_data["when_to_use"] = p_yaml["when_to_use"]
            except:
                pass
                
        # Try to pull from README
        if p_data["readme"]:
            readme_path = item / "README.md"
            try:
                with open(readme_path, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                    if lines and p_data.get("description") == "Auto-discovered project":
                        first_line = lines[0].strip().lstrip("# ").strip()
                        if first_line: p_data["description"] = first_line
                        
                    for line in lines:
                        if "When to use:" in line or "**When to use:**" in line:
                            p_data["when_to_use"] = line.split(":", 1)[1].strip()
                            break
            except:
                pass

        if "dependencies" not in p_data: p_data["dependencies"] = {}
        p_data["dependencies"]["runtime"] = "requirements.txt" if (item / "requirements.txt").exists() else ("package.json" if (item / "package.json").exists() else None)
        p_data["dependencies"]["venv"] = ".venv" if (item / ".venv").exists() else ("node_modules" if (item / "node_modules").exists() else None)
        print(f"  [OK]  {proj_name}")

    # Validate against schema
    if schema:
        is_valid, err = validate(proj_router.get("projects", {}), schema)
        if not is_valid:
            print(f"  [WARN] Projects failed schema validation: {err}")
            warnings_found = True

    proj_router["generated_at"] = now_iso()

    if dry_run:
        print(f"  [DRY-RUN] Would update projects.yaml")
    else:
        save_yaml(PROJ_ROUTER_PATH, proj_router)
        print(f"[+] Updated projects.yaml")
        
    return not warnings_found

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    ok = sync_projects(dry_run)
    sys.exit(0 if ok else 1)
