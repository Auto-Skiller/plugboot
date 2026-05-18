"""
Projects Sync Engine (v5.3)
============================
Walks projects/, reads each project's local manifest (project.yaml or README),
and refreshes projects.yaml.

Fix baked in:
  G13 : Imports the shared validator instead of re-declaring its own.
"""
from __future__ import annotations

import pathlib
import sys
from datetime import datetime
from ruamel.yaml import YAML

sys.path.insert(0, str(pathlib.Path(__file__).parent / "_shared"))
from validators import validate, load_schema_from_yaml  # noqa: E402
from atomic_io import atomic_write_yaml  # noqa: E402
from freshness import stamp_freshness  # noqa: E402
# GAP-FRESH-LITERAL fix: read the threshold from BOOT_CONTRACTS through the
# shared helper so the 1800-second literal lives in one place.
from boot_contracts import router_freshness_threshold as _shared_router_freshness  # noqa: E402

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent
PROJECTS_DIR = WORKSPACE_ROOT / "projects"
PROJ_ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "projects.yaml"


def load_yaml(path):
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        return yaml.load(f)


def save_yaml(path, data):
    """Crash-safe YAML write (M1)."""
    atomic_write_yaml(path, data, yaml_instance=yaml)


def now_iso():
    return datetime.now().isoformat()


def sync_projects(dry_run: bool = False) -> bool:
    print("\n[*] Synchronizing projects.yaml…")
    if not PROJECTS_DIR.exists():
        print("  [WARN] projects/ directory not found.")
        return False

    schema = load_schema_from_yaml(PROJ_ROUTER_PATH, "project_schema")
    warnings_found = False

    proj_router = load_yaml(PROJ_ROUTER_PATH) or {
        "name": "projects_router",
        "schema_version": "1.0",
        "description": "Index of all finite codebases and standalone builds.",
        "projects": {},
    }
    if "projects" not in proj_router or not isinstance(proj_router["projects"], dict):
        proj_router["projects"] = {}

    for item in sorted(PROJECTS_DIR.iterdir()):
        if not item.is_dir() or item.name.startswith((".", "_")):
            continue
        proj_name = item.name

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
                "last_modified": now_iso(),
            }
            print(f"  [+] discovered new project: {proj_name}")

        p_data = proj_router["projects"][proj_name]
        p_data["readme"] = (
            f"projects/{proj_name}/README.md" if (item / "README.md").exists() else None
        )

        proj_yaml_path = item / "project.yaml"
        if proj_yaml_path.exists():
            try:
                with open(proj_yaml_path, "r", encoding="utf-8") as f:
                    p_yaml = yaml.load(f)
                if p_yaml:
                    if "description" in p_yaml:
                        p_data["description"] = p_yaml["description"]
                    if "when_to_use" in p_yaml:
                        p_data["when_to_use"] = p_yaml["when_to_use"]
            except Exception:
                pass

        if p_data["readme"]:
            try:
                lines = (item / "README.md").read_text(encoding="utf-8").splitlines()
                if lines and p_data.get("description") == "Auto-discovered project":
                    first_line = lines[0].strip().lstrip("# ").strip()
                    if first_line:
                        p_data["description"] = first_line
                for line in lines:
                    if "When to use:" in line or "**When to use:**" in line:
                        p_data["when_to_use"] = line.split(":", 1)[1].strip()
                        break
            except Exception:
                pass

        p_data.setdefault("dependencies", {})
        p_data["dependencies"]["runtime"] = (
            "requirements.txt" if (item / "requirements.txt").exists()
            else ("package.json" if (item / "package.json").exists() else None)
        )
        p_data["dependencies"]["venv"] = (
            ".venv" if (item / ".venv").exists()
            else ("node_modules" if (item / "node_modules").exists() else None)
        )
        print(f"  [OK]  {proj_name}")

    if schema:
        is_valid, err = validate(proj_router.get("projects", {}), schema)
        if not is_valid:
            print(f"  [WARN] projects failed schema validation: {err}")
            warnings_found = True

    proj_router["generated_at"] = now_iso()
    stamp_freshness(proj_router, threshold_seconds=_shared_router_freshness(WORKSPACE_ROOT))

    if dry_run:
        print("  [DRY-RUN] would update projects.yaml")
    else:
        save_yaml(PROJ_ROUTER_PATH, proj_router)
        print("[+] Updated projects.yaml")

    return not warnings_found


if __name__ == "__main__":
    # E1 (multi-session safety): when invoked directly, acquire the master
    # sync lock. When called by meta_sync.py, it sets META_SYNC_LOCK_HELD=1
    # so we don't double-lock.
    import os as _os
    dry_run = "--dry-run" in sys.argv
    sys.path.insert(0, str(pathlib.Path(__file__).parent / "_shared"))
    from engine_bootstrap import workspace_lock_path  # noqa: E402
    if _os.environ.get("META_SYNC_LOCK_HELD") == "1":
        ok = sync_projects(dry_run)
        sys.exit(0 if ok else 1)
    from sync_lock import with_lock as _with_lock, SyncLockBusy as _SyncLockBusy  # noqa: E402
    _LOCK = workspace_lock_path(WORKSPACE_ROOT)
    try:
        with _with_lock(_LOCK, stale_seconds=120, timeout_seconds=30):
            ok = sync_projects(dry_run)
            sys.exit(0 if ok else 1)
    except _SyncLockBusy as exc:
        print(f"[ERR] {exc}")
        sys.exit(2)
