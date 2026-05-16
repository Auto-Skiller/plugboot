import os
import sys
import pathlib
from datetime import datetime
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent.parent
RUNTIME_ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / ".meta_router" / "meta_runtime.yaml"
RUNTIME_DIR = WORKSPACE_ROOT / ".meta_runtime"

def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def save_yaml(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: yaml.dump(data, f)

def now_iso(): return datetime.now().isoformat()

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

    health = check_env_health()
    if health["status"] == "unhealthy":
        for w in health["warnings"]: print(f"  [ERR] {w}")
    elif health["warnings"]:
        for w in health["warnings"]: print(f"  [WARN] {w}")

    # Discover infrastructure
    infra = {}
    for item in sorted(RUNTIME_DIR.iterdir()):
        if item.name.startswith("_"): continue # Skip .meta_archive etc if needed, though they start with .
        if item.is_dir():
            infra[item.name] = {
                "path": str(item.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
                "description": f"Infrastructure component: {item.name}"
            }
            print(f"  [OK]  {item.name}")

    runtime_data = {
        "name": "meta_runtime_router",
        "schema_version": "1.0",
        "generated_at": now_iso(),
        "description": "Index of all runtime infrastructure components.",
        "health": health,
        "infrastructure": infra
    }

    if dry_run:
        print(f"  [DRY-RUN] Would update meta_runtime.yaml")
    else:
        save_yaml(RUNTIME_ROUTER_PATH, runtime_data)
        print(f"[+] Updated meta_runtime.yaml (Status: {health['status']})")

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    sync_runtime(dry_run)
