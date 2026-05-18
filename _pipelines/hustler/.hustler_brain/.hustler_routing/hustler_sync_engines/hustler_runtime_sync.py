"""
hustler_runtime_sync.py
=======================
Scans .hustler_runtime/ and writes the runtime infrastructure index to
.hustler_routing/hustler_runtime.yaml. Skips deep recursion into archive/scratch
to avoid router bloat (mirrors the Scaler G7 fix).
"""
import sys
import pathlib
from datetime import datetime
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent.parent.parent
RUNTIME_ROUTER_PATH = WORKSPACE_ROOT / "_pipelines" / "hustler" / ".hustler_brain" / ".hustler_routing" / "hustler_runtime.yaml"
RUNTIME_DIR = WORKSPACE_ROOT / "_pipelines" / "hustler" / ".hustler_runtime"

NO_RECURSE = {".hustler_archive", ".hustler_scratch"}


def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)


def save_yaml(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: yaml.dump(data, f)


def now_iso(): return datetime.now().isoformat()


def sync_runtime(dry_run=False):
    print("\n[*] Synchronizing hustler_runtime.yaml...")
    if not RUNTIME_DIR.exists():
        print("  [ERR] .hustler_runtime directory not found.")
        return False

    infra = {}

    def register(item):
        rel_to_runtime = item.relative_to(RUNTIME_DIR)
        name = str(rel_to_runtime).replace("\\", "/").replace(" ", "_")
        is_file = item.is_file()
        infra[name] = {
            "path": str(item.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
            "description": f"File: {item.name}" if is_file else f"Directory: {item.name}"
        }
        print(f"  [OK]  {name}")

    for item in sorted(RUNTIME_DIR.iterdir()):
        if item.name == ".gitkeep": continue
        register(item)
        if item.is_dir() and item.name in NO_RECURSE:
            continue  # register the root only
        if item.is_dir():
            for child in sorted(item.rglob("*")):
                if child.name.startswith("_") or child.name == ".gitkeep": continue
                register(child)

    runtime_data = load_yaml(RUNTIME_ROUTER_PATH) or {
        "name": "hustler_runtime_router",
        "schema_version": "1.0",
        "description": "Index of all Hustler runtime infrastructure components.",
    }
    runtime_data["generated_at"] = now_iso()
    runtime_data["runtime_infrastructure"] = infra

    if dry_run:
        print("  [DRY-RUN] Would update hustler_runtime.yaml")
    else:
        save_yaml(RUNTIME_ROUTER_PATH, runtime_data)
        print("[+] Updated hustler_runtime.yaml")

    return True


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    ok = sync_runtime(dry_run)
    sys.exit(0 if ok else 1)
