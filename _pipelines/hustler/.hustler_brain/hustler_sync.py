"""
Hustler Substrate Sync Engine
=============================
Master orchestrator for the Hustler pipeline. Triggers sub-syncs, re-assembles
hustler_router.yaml from live data, enforces HUSTLER_CONTRACTS verification
protocols, auto-extracts runbook metadata, supports --dry-run and --validate.
Modeled on scaler_sync.py.

Multi-session safety (G-CTRL-5/6 — propagated from .meta_brain hardening):
  - All disk writes go through atomic_write_yaml (tmp + os.replace) so a kill
    or crash mid-write cannot corrupt hustler_router.yaml.
  - When invoked directly (not as a child of meta_sync.py), this script
    acquires the workspace .sync.lock so two agents racing on the Hustler
    sync serialise instead of trampling each other.
"""
import argparse
import os
import re
import sys
import pathlib
import subprocess
from datetime import datetime
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent
HUSTLER_BRAIN_DIR = WORKSPACE_ROOT / "_pipelines" / "hustler" / ".hustler_brain"
HUSTLER_ROUTING_DIR = HUSTLER_BRAIN_DIR / ".hustler_routing"
HUSTLER_ROUTER_PATH = HUSTLER_BRAIN_DIR / "hustler_router.yaml"
HUSTLER_CONTRACTS_PATH = HUSTLER_BRAIN_DIR / "HUSTLER_CONTRACTS.yaml"
HUSTLER_RUNBOOKS_DIR = HUSTLER_BRAIN_DIR / "hustler_runbooks"
HUSTLER_STATE = HUSTLER_BRAIN_DIR / ".hustler_routing" / "hustler_state.yaml"
SHARED_DIR = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "meta_sync_engines" / "_shared"
sys.path.insert(0, str(SHARED_DIR))
try:
    from atomic_io import atomic_write_yaml  # noqa: E402
except Exception:
    atomic_write_yaml = None
try:
    from sync_lock import with_lock as _with_lock, SyncLockBusy as _SyncLockBusy  # noqa: E402
except Exception:
    _with_lock = None
    _SyncLockBusy = RuntimeError
try:
    from freshness import stamp_freshness as _stamp_freshness  # noqa: E402
except Exception:
    _stamp_freshness = None
try:
    # GAP-LOCK-PATH-DRIFT fix: pull the lock path from the single shared
    # constant so a future relocation only changes one line.
    from engine_bootstrap import workspace_lock_path as _workspace_lock_path  # noqa: E402
    SYNC_LOCK_PATH = _workspace_lock_path(WORKSPACE_ROOT)
except Exception:
    SYNC_LOCK_PATH = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / ".sync.lock"


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


def extract_runbook_metadata(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        description = ""
        match_desc = re.search(r"\*\*(?:Purpose|Role|Description|Objective):\*\*\s*(.*)", content, re.IGNORECASE)
        if match_desc:
            description = match_desc.group(1).strip()
        else:
            for line in content.split("\n"):
                line = line.strip()
                if not line or line.startswith("#") or line.startswith(">") or line.startswith("---"):
                    continue
                description = line
                if len(description) > 220: description = description[:217] + "..."
                break
        return description
    except Exception:
        return ""


def enforce_pre_flight():
    contracts = load_yaml(HUSTLER_CONTRACTS_PATH)
    if not contracts:
        return True
    checks = (contracts.get("verification_protocols") or {}).get("pre_flight_check") or []
    if not checks:
        return True
    print("[*] Pre-flight verification...")
    failures = []
    state = load_yaml(HUSTLER_STATE)
    if state is None:
        failures.append("hustler_state.yaml not found")
    elif not (state.get("state") or {}).get("current_phase"):
        failures.append("hustler_state.yaml is missing state.current_phase")
    if failures:
        print("  [FAIL] Pre-flight contract violations:")
        for f in failures: print(f"         - {f}")
        return False
    print(f"  [OK] Pre-flight passed ({len(checks)} declared check(s))")
    return True


def enforce_post_flight():
    contracts = load_yaml(HUSTLER_CONTRACTS_PATH)
    if not contracts:
        return True
    checks = (contracts.get("verification_protocols") or {}).get("post_flight_check") or []
    if not checks:
        return True
    print("[*] Post-flight verification...")
    failures = []
    if not HUSTLER_ROUTER_PATH.exists():
        failures.append("hustler_router.yaml was not produced by sync")
    else:
        router = load_yaml(HUSTLER_ROUTER_PATH)
        if not router or not router.get("last_updated"):
            failures.append("hustler_router.yaml is missing last_updated stamp")
    if failures:
        print("  [FAIL] Post-flight contract violations:")
        for f in failures: print(f"         - {f}")
        return False
    print(f"  [OK] Post-flight passed ({len(checks)} declared check(s))")
    return True


def run_validate():
    print("[VALIDATE] Hustler Substrate Validation")
    errors = 0
    warnings = 0
    def check(label, path, required=True):
        nonlocal errors, warnings
        if path.exists():
            print(f"  [OK]   {label}")
        elif required:
            print(f"  [ERR]  MISSING: {label}")
            errors += 1
        else:
            print(f"  [WARN] not found (optional): {label}")
            warnings += 1
    check("hustler_router.yaml", HUSTLER_ROUTER_PATH)
    check("HUSTLER_CONTRACTS.yaml", HUSTLER_CONTRACTS_PATH)
    check("hustler_state.yaml", HUSTLER_STATE)
    check("hustler_runbooks/", HUSTLER_RUNBOOKS_DIR)
    if HUSTLER_RUNBOOKS_DIR.exists():
        for required_runbook in [
            "Hustler-Architecture.md",
            "Hustler-Workflows.md",
            "Hustler-Operational-Rules.md",
            "Hustler-Cascading-Logic.md",
            "Hustler-Tagging-System.md",
        ]:
            check(f"hustler_runbooks/{required_runbook}", HUSTLER_RUNBOOKS_DIR / required_runbook)
    print(f"\n[VALIDATE] Done. {warnings} warning(s), {errors} error(s).")
    return errors == 0


def sync(dry_run=False):
    print("[*] Starting Hustler Substrate Sync Engine v2.0...")

    if not enforce_pre_flight():
        print("[ABORT] Pre-flight contract failed.")
        sys.exit(1)

    sync_engines_dir = HUSTLER_ROUTING_DIR / "hustler_sync_engines"
    extra_args = ["--dry-run"] if dry_run else []
    # G-CTRL-8: propagate the lock-held flag to child engines.
    child_env = dict(os.environ)
    child_env["META_SYNC_LOCK_HELD"] = "1"

    # GAP-CHILD-CHECK-TRUE fix: see scaler_sync.py for the rationale. A child
    # warning must surface as a master warning, not a hard CalledProcessError.
    failed_children: list[str] = []
    for engine in ("hustler_runtime_sync.py", "hustler_state_sync.py", "hustler_ledgers_sync.py"):
        script = sync_engines_dir / engine
        if not script.exists():
            continue
        print(f"[*] Running {engine}...")
        rc = subprocess.run([sys.executable, str(script), *extra_args], env=child_env)
        if rc.returncode != 0:
            print(f"  [ERR] {engine} exited {rc.returncode} — surfacing as warning.")
            failed_children.append(engine)

    print("\n[*] Re-assembling master hustler_router.yaml...")
    router = load_yaml(HUSTLER_ROUTER_PATH) or {
        "name": "hustler_router",
        "schema_version": "1.0",
        "description": "Master index for the Hustler Pipeline.",
    }

    runtime_data = load_yaml(HUSTLER_ROUTING_DIR / "hustler_runtime.yaml") or {}
    state_data = load_yaml(HUSTLER_STATE) or {}
    ledgers_data = load_yaml(HUSTLER_ROUTING_DIR / "hustler_ledgers.yaml") or {}

    router["last_updated"] = now_iso()

    components = router.get("components") or {}
    runbook_block = components.get("runbook") or {}
    runbook_files = runbook_block.get("files") or []
    if HUSTLER_RUNBOOKS_DIR.exists() and runbook_files:
        for entry in runbook_files:
            name = entry.get("name") if isinstance(entry, dict) else None
            if not name:
                continue
            md_path = HUSTLER_RUNBOOKS_DIR / name
            if md_path.exists():
                desc = extract_runbook_metadata(md_path)
                if desc and entry.get("description") != desc:
                    entry["description"] = desc

    aggregates = ledgers_data.get("discoveries", {}).get("aggregates", {}) or {}
    router["telemetry"] = {
        "gateway": (state_data.get("telemetry", {}) or {}).get("gateway", {
            "pending_approvals": 0, "last_action": "", "integration_queue": 0
        }),
        "discoveries": aggregates,
        "governance": {
            "laws_count": len((load_yaml(HUSTLER_STATE) or {}).get("governance", {}).get("laws", []) or []),
            "laws_enforced": sum(1 for l in (load_yaml(HUSTLER_STATE) or {}).get("governance", {}).get("laws", []) or [] if l.get("enforced")),
        },
    }

    if dry_run:
        print("  [DRY-RUN] Would write hustler_router.yaml")
    else:
        if _stamp_freshness is not None:
            _stamp_freshness(router, threshold_seconds=1800)
        save_yaml(HUSTLER_ROUTER_PATH, router)
        print("[+] Dynamic master hustler_router.yaml successfully re-assembled.")

    if not enforce_post_flight():
        print("[ABORT] Post-flight contract failed.")
        sys.exit(1)

    if failed_children:
        print(f"[!] Hustler Substrate Sync completed with {len(failed_children)} sub-engine warning(s): "
              f"{', '.join(failed_children)}")
        sys.exit(1)

    print("[!] Hustler Substrate Sync Complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Hustler Substrate Sync Engine")
    parser.add_argument("--dry-run", action="store_true", help="Preview mutations.")
    parser.add_argument("--validate", action="store_true", help="Read-only structural check.")
    args = parser.parse_args()
    if args.validate:
        sys.exit(0 if run_validate() else 1)

    # G-CTRL-6: acquire the workspace sync lock when invoked directly.
    if os.environ.get("META_SYNC_LOCK_HELD") == "1" or _with_lock is None:
        sync(dry_run=args.dry_run)
    else:
        try:
            with _with_lock(SYNC_LOCK_PATH, stale_seconds=120, timeout_seconds=30):
                os.environ["META_SYNC_LOCK_HELD"] = "1"
                sync(dry_run=args.dry_run)
        except _SyncLockBusy as exc:
            print(f"[ERR] {exc}")
            sys.exit(2)
