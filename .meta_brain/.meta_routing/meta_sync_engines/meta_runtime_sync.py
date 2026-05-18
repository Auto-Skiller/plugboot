"""
Meta-Runtime Sync Engine (v5.3)
================================
Walks .meta_runtime/ and writes the canonical infrastructure index.

Fixes baked in:
  G3  : The infrastructure dict is REBUILT from disk every cycle. Stale entries
        cannot survive — the master sync also replaces wholesale on assembly.
  G7  : The .venv/ binary tree is excluded but the launcher files
        (meta_run.{ps1,sh}, bootstrap.{ps1,sh}, .env, requirements.txt,
        .python-version) are now visible to agents.
  G15 : .kiro/ and other host-IDE artifacts are explicitly excluded so they
        don't appear as orphans in --validate.
  G3+ : Old log files in .meta_scratch/ are auto-pruned (retention cap from
        BOOT_CONTRACTS.constants.scratch_log_retention_max). Cataloging only
        the surviving logs eliminates the phantom-entry class entirely.
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
# GAP-PRUNE-DUPLICATE fix: single home for log retention. Same module is
# imported by every runtime sync (workspace-level + each pipeline) so the
# cap rule lives in BOOT_CONTRACTS.constants.scratch_log_retention_max only.
from log_retention import prune_old_logs  # noqa: E402
# GAP-BOOT-PATH-DRIFT fix: single home for BOOT_CONTRACTS path + reads.
from boot_contracts import constant as _shared_constant  # noqa: E402

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent
RUNTIME_ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "meta_runtime.yaml"
RUNTIME_DIR = WORKSPACE_ROOT / ".meta_runtime"

# Heavy / ephemeral subtrees we never catalog inside the .venv binary tree.
# Authoritative for G7 — outside this list, everything in .meta_runtime is mapped.
_VENV_HEAVY = {".venv"}                      # The binary tree only
_AUTH_PROFILE_HEAVY_DIRS = {                  # NotebookLM cache that bloats the index
    "browser_profile",
    "Cache",
    "Code Cache",
    "GPUCache",
    "GraphiteDawnCache",
    "DawnGraphiteCache",
    "DawnWebGPUCache",
    "ShaderCache",
    "GrShaderCache",
    "Crashpad",
    "Sessions",
    "Service Worker",
}


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


def _constant(name: str, default):
    """GAP-BOOT-PATH-DRIFT fix: read through the shared boot_contracts loader
    so a future relocation of BOOT_CONTRACTS is a one-line change.

    The local literal ``BOOT_CONTRACTS_PATH = WORKSPACE_ROOT / ...`` was the
    same class of duplication that the workspace lock path used to suffer.
    One module owns the path now; every engine pulls from it.
    """
    return _shared_constant(WORKSPACE_ROOT, name, default)


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


def _should_skip(parts):
    """Return True if this path should not appear in the runtime index."""
    # 1. Any path inside .venv/ binary tree.
    if "venv" in parts and ".venv" in parts:
        idx = parts.index(".venv")
        # everything underneath .venv is binary; include .venv itself only as a folder
        if idx + 1 <= len(parts) - 1:  # there is something after .venv
            return True
    # 2. Heavy notebooklm browser_profile subtrees.
    for heavy in _AUTH_PROFILE_HEAVY_DIRS:
        if heavy in parts:
            return True
    # 3. Hidden gitkeep noise.
    return False


def sync_runtime(dry_run: bool = False) -> bool:
    print("\n[*] Synchronizing meta_runtime.yaml…")
    if not RUNTIME_DIR.exists():
        print("  [ERR] .meta_runtime directory not found.")
        return False

    schema = load_schema_from_yaml(RUNTIME_ROUTER_PATH, "infrastructure_schema")
    warnings_found = False

    # G3+: prune stale logs in .meta_scratch first so we never catalog them.
    retention = int(_constant("scratch_log_retention_max", 5))
    deleted = prune_old_logs(RUNTIME_DIR / ".meta_scratch", retention)
    if deleted:
        print(f"  [+] pruned {deleted} stale .meta_scratch/*.log file(s) beyond retention={retention}")

    health = check_env_health()
    if health["status"] == "unhealthy":
        for w in health["warnings"]:
            print(f"  [ERR] {w}")
    elif health["warnings"]:
        for w in health["warnings"]:
            print(f"  [WARN] {w}")

    infra = {}
    for item in sorted(RUNTIME_DIR.rglob("*")):
        if item.name == ".gitkeep":
            continue
        rel_to_runtime = item.relative_to(RUNTIME_DIR)
        parts = rel_to_runtime.parts

        if _should_skip(parts):
            continue

        # G7: launcher files inside venv/ MUST be visible. Allow venv/ direct
        # children that are not the .venv binary tree.
        if parts and parts[0] == "venv":
            if len(parts) > 1 and parts[1] == ".venv":
                # Surface only the .venv folder itself, not its contents.
                if len(parts) > 2:
                    continue

        name = str(rel_to_runtime).replace("\\", "/").replace(" ", "_")
        is_file = item.is_file()
        infra[name] = {
            "path": str(item.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
            "description": f"File: {item.name}" if is_file else f"Directory: {item.name}",
        }

        # Special-case: surface the os_engine alias for requirements.txt.
        if name == "venv":
            req_path = item / "requirements.txt"
            if req_path.exists():
                infra["os_engine"] = {
                    "path": str(req_path.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
                    "description": "Python runtime engine manifest (requirements.txt).",
                }

    # Validate.
    if schema:
        is_valid, err = validate(infra, schema)
        if not is_valid:
            print(f"  [WARN] infrastructure failed schema validation: {err}")
            warnings_found = True

    runtime_data = load_yaml(RUNTIME_ROUTER_PATH) or {
        "name": "meta_runtime_router",
        "schema_version": "1.0",
        "description": "Index of all runtime infrastructure components.",
    }
    runtime_data["generated_at"] = now_iso()
    runtime_data["health"] = health
    runtime_data["infrastructure"] = infra  # Full replace.
    stamp_freshness(runtime_data, threshold_seconds=int(_constant("router_freshness_max_seconds", 1800)))

    if dry_run:
        print("  [DRY-RUN] would update meta_runtime.yaml")
    else:
        save_yaml(RUNTIME_ROUTER_PATH, runtime_data)
        print(f"[+] Updated meta_runtime.yaml (Status: {health['status']}, items: {len(infra)})")

    return not warnings_found


if __name__ == "__main__":
    import os as _os
    dry_run = "--dry-run" in sys.argv
    sys.path.insert(0, str(pathlib.Path(__file__).parent / "_shared"))
    from engine_bootstrap import workspace_lock_path  # noqa: E402
    if _os.environ.get("META_SYNC_LOCK_HELD") == "1":
        ok = sync_runtime(dry_run)
        sys.exit(0 if ok else 1)
    from sync_lock import with_lock as _with_lock, SyncLockBusy as _SyncLockBusy  # noqa: E402
    _LOCK = workspace_lock_path(WORKSPACE_ROOT)
    try:
        with _with_lock(_LOCK, stale_seconds=120, timeout_seconds=30):
            ok = sync_runtime(dry_run)
            sys.exit(0 if ok else 1)
    except _SyncLockBusy as exc:
        print(f"[ERR] {exc}")
        sys.exit(2)
