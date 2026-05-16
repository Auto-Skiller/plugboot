import os
import sys
import pathlib
from datetime import datetime
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent.parent
PROJECTS_DIR = WORKSPACE_ROOT / "projects"
PROJ_ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / ".meta_router" / "projects.yaml"

def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def save_yaml(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: yaml.dump(data, f)

def now_iso():
    return datetime.now().isoformat()

def sync_projects(dry_run=False):
    print("\n[*] Synchronizing projects.yaml...")
    if not PROJECTS_DIR.exists():
        print("  [WARN] projects/ directory not found.")
        return
        
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
                "started_at": now_iso(),
                "last_modified": now_iso()
            }
            print(f"  [+] Discovered new project: {proj_name}")
        
        # Update dependencies and readme status
        p_data = proj_router["projects"][proj_name]
        p_data["readme"] = f"projects/{proj_name}/README.md" if (item / "README.md").exists() else None
        
        # Try to pull description from README
        if p_data.get("description") == "Auto-discovered project" and p_data["readme"]:
            readme_path = item / "README.md"
            try:
                with open(readme_path, "r", encoding="utf-8") as f:
                    first_line = f.readline().strip().lstrip("# ").strip()
                    if first_line:
                        p_data["description"] = first_line
            except:
                pass

        if "dependencies" not in p_data: p_data["dependencies"] = {}
        p_data["dependencies"]["runtime"] = "requirements.txt" if (item / "requirements.txt").exists() else ("package.json" if (item / "package.json").exists() else None)
        p_data["dependencies"]["venv"] = ".venv" if (item / ".venv").exists() else ("node_modules" if (item / "node_modules").exists() else None)
        print(f"  [OK]  {proj_name}")

    proj_router["generated_at"] = now_iso()

    if dry_run:
        print(f"  [DRY-RUN] Would update projects.yaml")
    else:
        save_yaml(PROJ_ROUTER_PATH, proj_router)
        print(f"[+] Updated projects.yaml")

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    sync_projects(dry_run)
