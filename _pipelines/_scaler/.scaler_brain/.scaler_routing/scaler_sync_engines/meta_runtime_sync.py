import os
import sys
import pathlib
from datetime import datetime
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent.parent.parent
RUNTIME_ROUTER_PATH = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain" / ".scaler_routing" / "scaler_runtime.yaml"
RUNTIME_DIR = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_runtime"

def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def save_yaml(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: yaml.dump(data, f)

def now_iso(): return datetime.now().isoformat()

def sync_runtime(dry_run=False):
    print("\n[*] Synchronizing scaler_runtime.yaml...")
    if not RUNTIME_DIR.exists():
        print("  [ERR] .scaler_runtime directory not found.")
        return False

    # Discover runtime files
    infra = {}
    for item in sorted(RUNTIME_DIR.rglob("*")):
        if item.name.startswith("_") or item.name == ".gitkeep": continue
        
        rel_to_runtime = item.relative_to(RUNTIME_DIR)
        name = str(rel_to_runtime).replace("\\", "/").replace(" ", "_")
        is_file = item.is_file()
        
        infra[name] = {
            "path": str(item.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
            "description": f"File: {item.name}" if is_file else f"Directory: {item.name}"
        }
        print(f"  [OK]  {name}")

    runtime_data = load_yaml(RUNTIME_ROUTER_PATH) or {
        "name": "scaler_runtime_router",
        "schema_version": "1.0",
        "description": "Index of all Scaler runtime infrastructure components.",
    }
    runtime_data["generated_at"] = now_iso()
    runtime_data["runtime_infrastructure"] = infra

    if dry_run:
        print(f"  [DRY-RUN] Would update scaler_runtime.yaml")
    else:
        save_yaml(RUNTIME_ROUTER_PATH, runtime_data)
        print(f"[+] Updated scaler_runtime.yaml")
        
    return True

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    ok = sync_runtime(dry_run)
    sys.exit(0 if ok else 1)
