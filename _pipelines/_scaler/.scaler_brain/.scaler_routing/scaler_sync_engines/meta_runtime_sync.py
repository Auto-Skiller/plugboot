"""
scaler/meta_runtime_sync.py
===========================
Scans .scaler_runtime/ and writes the runtime infrastructure index to
.scaler_routing/scaler_runtime.yaml. Skips deep recursion into archive/scratch
to avoid router bloat (G7 fix).

Multi-session safety (GAP-SUB-LOCK + GAP-WORKSPACE-ROOT fixes):
  - Workspace root is resolved by anchor-search (engine_bootstrap.find_workspace_root)
    instead of hardcoded parent counting.
  - When invoked directly, the engine runs under the workspace .sync.lock so
    concurrent agents serialise.

GAP-SCRATCH-PRUNE fix: prunes stale .scaler_scratch/*.log files on every run
using the workspace-level ``scratch_log_retention_max`` constant. Without this
the scratch folder grew unbounded over multi-hour autonomous sessions.
"""
import os
import sys
import pathlib
from datetime import datetime
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

# ─── GAP-WORKSPACE-ROOT fix: anchor-based resolution ────────────────────────
_THIS = pathlib.Path(__file__).resolve()
_ENGINES_PARENT = _THIS.parent.parent.parent.parent.parent.parent  # legacy fallback
_BOOTSTRAP_DIR = _ENGINES_PARENT / ".meta_brain" / ".meta_routing" / "meta_sync_engines" / "_shared"
sys.path.insert(0, str(_BOOTSTRAP_DIR))
try:
    from engine_bootstrap import find_workspace_root, run_under_workspace_lock  # noqa: E402
    WORKSPACE_ROOT = find_workspace_root(_THIS)
except Exception:
    WORKSPACE_ROOT = _ENGINES_PARENT
    run_under_workspace_lock = None  # type: ignore

RUNTIME_ROUTER_PATH = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain" / ".scaler_routing" / "scaler_runtime.yaml"
RUNTIME_DIR = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_runtime"
SCRATCH_DIR = RUNTIME_DIR / ".scaler_scratch"
BOOT_CONTRACTS_PATH = WORKSPACE_ROOT / ".meta_brain" / "BOOT_CONTRACTS.yaml"
SHARED_DIR = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "meta_sync_engines" / "_shared"

sys.path.insert(0, str(SHARED_DIR))
try:
    from atomic_io import atomic_write_yaml  # noqa: E402
except Exception:
    atomic_write_yaml = None
try:
    from freshness import stamp_freshness as _stamp_freshness  # noqa: E402
except Exception:
    _stamp_freshness = None
try:
    # GAP-PRUNE-DUPLICATE fix: every runtime engine pulls from the same
    # shared cap helper, so BOOT_CONTRACTS.constants.scratch_log_retention_max
    # is the single knob.
    from log_retention import prune_old_logs as _shared_prune_logs  # noqa: E402
except Exception:
    _shared_prune_logs = None
try:
    # GAP-BOOT-PATH-DRIFT fix: single reader for BOOT_CONTRACTS.
    from boot_contracts import constant as _shared_boot_constant  # noqa: E402
except Exception:
    _shared_boot_constant = None
try:
    # GAP-FRESH-LITERAL fix: single source for the freshness threshold.
    from boot_contracts import router_freshness_threshold as _shared_router_freshness  # noqa: E402
except Exception:
    _shared_router_freshness = None


def _shared_router_freshness_threshold() -> int:
    """Return the freshness threshold from BOOT_CONTRACTS, or fall back to
    1800s (30 minutes) when the shared helper isn't importable. The fallback
    only fires during early bootstrap before ``_shared/`` is on sys.path."""
    if _shared_router_freshness is not None:
        try:
            return int(_shared_router_freshness(WORKSPACE_ROOT))
        except Exception:
            pass
    return 1800
try:
    from log_retention import prune_old_logs as _shared_prune_logs  # noqa: E402
except Exception:
    _shared_prune_logs = None


def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)


def save_yaml(path, data):
    """Crash-safe YAML write (G-CTRL-5)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if atomic_write_yaml is not None:
        atomic_write_yaml(path, data, yaml_instance=yaml)
        return
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(data, f)


def now_iso(): return datetime.now().isoformat()


def _scratch_retention() -> int:
    """GAP-SCRATCH-PRUNE: cap comes from BOOT_CONTRACTS.constants so all sync
    engines pull from the same knob.

    GAP-BOOT-PATH-DRIFT fix: read through the shared boot_contracts loader
    when available so the path literal lives in one place (the shared
    ``boot_contracts_path()`` helper). Falls back to the local literal when
    the shared helper isn't importable (early bootstrap)."""
    if _shared_boot_constant is not None:
        try:
            return int(_shared_boot_constant(WORKSPACE_ROOT, "scratch_log_retention_max", 5))
        except Exception:
            pass
    try:
        boot = load_yaml(BOOT_CONTRACTS_PATH)
        if boot and isinstance(boot.get("constants"), dict):
            return int(boot["constants"].get("scratch_log_retention_max", 5))
    except Exception:
        pass
    return 5


def prune_old_logs(scratch_dir: pathlib.Path, retention: int) -> int:
    """Delete all but the N most-recent *.log files in ``scratch_dir``.

    GAP-PRUNE-DUPLICATE fix: delegates to ``_shared/log_retention.py`` so
    every engine across the workspace runs identical cap logic. Local
    fallback kept for first-boot environments where the shared layer may
    not yet be importable."""
    if _shared_prune_logs is not None:
        return _shared_prune_logs(scratch_dir, retention)
    if not scratch_dir.exists() or retention < 0:
        return 0
    logs = sorted(scratch_dir.glob("*.log"), key=lambda p: p.stat().st_mtime, reverse=True)
    deleted = 0
    for stale in logs[retention:]:
        try:
            stale.unlink()
            deleted += 1
        except Exception:
            pass
    return deleted


def sync_runtime(dry_run=False):
    print("\n[*] Synchronizing scaler_runtime.yaml...")
    if not RUNTIME_DIR.exists():
        print("  [ERR] .scaler_runtime directory not found.")
        return False

    if not dry_run:
        retention = _scratch_retention()
        deleted = prune_old_logs(SCRATCH_DIR, retention)
        if deleted:
            print(f"  [+] pruned {deleted} stale .scaler_scratch/*.log file(s) beyond retention={retention}")

    # Discover runtime files. Register top-level dirs only — never recurse into
    # archive subtrees (they grow linearly with integrations and would balloon
    # the router). Same for scratch.
    NO_RECURSE = {".scaler_archive", ".scaler_scratch"}
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
            # Register the root only; do not enumerate its children.
            continue
        if item.is_dir():
            for child in sorted(item.rglob("*")):
                if child.name.startswith("_") or child.name == ".gitkeep": continue
                register(child)

    runtime_data = load_yaml(RUNTIME_ROUTER_PATH) or {
        "name": "scaler_runtime_router",
        "schema_version": "1.0",
        "description": "Index of all Scaler runtime infrastructure components.",
    }
    runtime_data["generated_at"] = now_iso()
    runtime_data["runtime_infrastructure"] = infra

    # GAP-FRESH-INNER fix: stamp the same freshness contract every workspace
    # router uses, so the master --validate audit can detect a stale per-pipeline
    # routing file the same way it detects stale workspace routers.
    if not dry_run and _stamp_freshness is not None:
        _stamp_freshness(runtime_data, threshold_seconds=_shared_router_freshness_threshold())

    if dry_run:
        print(f"  [DRY-RUN] Would update scaler_runtime.yaml")
    else:
        save_yaml(RUNTIME_ROUTER_PATH, runtime_data)
        print(f"[+] Updated scaler_runtime.yaml")

    return True


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    if run_under_workspace_lock is not None:
        sys.exit(run_under_workspace_lock(sync_runtime, workspace_root=WORKSPACE_ROOT, dry_run=dry_run))
    ok = sync_runtime(dry_run)
    sys.exit(0 if ok else 1)
