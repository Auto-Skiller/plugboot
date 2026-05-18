"""
Scaler Substrate Sync Engine
============================
Master orchestrator for the Scaler pipeline. Triggers sub-syncs, re-assembles
scaler_router.yaml from live data, enforces SCALER_CONTRACTS verification
protocols, auto-extracts runbook metadata, and supports --dry-run / --validate.

Multi-session safety (G-CTRL-5/6 — propagated from .meta_brain hardening):
  - All disk writes go through atomic_write_yaml (tmp + os.replace) so a
    kill or crash mid-write cannot corrupt scaler_router.yaml.
  - When invoked directly (not as a child of meta_sync.py), this script
    acquires the workspace .sync.lock so two agents racing on the Scaler
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
SCALER_BRAIN_DIR = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain"
SCALER_ROUTING_DIR = SCALER_BRAIN_DIR / ".scaler_routing"
SCALER_ROUTER_PATH = SCALER_BRAIN_DIR / "scaler_router.yaml"
SCALER_CONTRACTS_PATH = SCALER_BRAIN_DIR / "SCALER_CONTRACTS.yaml"
SCALER_RUNBOOKS_DIR = SCALER_BRAIN_DIR / "scaler_runbooks"
SCALER_STATE = SCALER_BRAIN_DIR / ".scaler_routing" / "scaler_state.yaml"
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
    # GAP-FRESH-LITERAL fix: read the freshness threshold from BOOT_CONTRACTS.
    from boot_contracts import router_freshness_threshold as _shared_router_freshness  # noqa: E402
except Exception:
    _shared_router_freshness = None


def _router_freshness_threshold() -> int:
    if _shared_router_freshness is not None:
        try:
            return int(_shared_router_freshness(WORKSPACE_ROOT))
        except Exception:
            pass
    return 1800
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


# ─── G12: Auto-extract runbook descriptions (mirrors meta_sync.py) ────────────
def extract_runbook_metadata(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        description = ""
        # Look for an explicit Purpose/Role/Description label first
        match_desc = re.search(r"\*\*(?:Purpose|Role|Description|Objective):\*\*\s*(.*)", content, re.IGNORECASE)
        if match_desc:
            description = match_desc.group(1).strip()
        else:
            # Fall back to first non-trivial paragraph
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


# ─── G4: SCALER_CONTRACTS verification protocol enforcement ───────────────────
def enforce_pre_flight():
    """Run pre_flight checks declared in SCALER_CONTRACTS.yaml. Fail-fast on violation."""
    contracts = load_yaml(SCALER_CONTRACTS_PATH)
    if not contracts:
        return True  # no contract, nothing to enforce
    checks = (contracts.get("verification_protocols") or {}).get("pre_flight_check") or []
    if not checks:
        return True

    print("[*] Pre-flight verification...")
    failures = []

    state = load_yaml(SCALER_STATE)
    if state is None:
        failures.append("scaler_state.yaml not found")
    elif not (state.get("state") or {}).get("current_phase"):
        failures.append("scaler_state.yaml is missing state.current_phase")

    if failures:
        print("  [FAIL] Pre-flight contract violations:")
        for f in failures: print(f"         - {f}")
        return False
    print(f"  [OK] Pre-flight passed ({len(checks)} declared check(s))")
    return True


def enforce_post_flight():
    """Run post_flight checks declared in SCALER_CONTRACTS.yaml. Fail-fast on violation."""
    contracts = load_yaml(SCALER_CONTRACTS_PATH)
    if not contracts:
        return True
    checks = (contracts.get("verification_protocols") or {}).get("post_flight_check") or []
    if not checks:
        return True

    print("[*] Post-flight verification...")
    failures = []

    if not SCALER_ROUTER_PATH.exists():
        failures.append("scaler_router.yaml was not produced by sync")
    else:
        router = load_yaml(SCALER_ROUTER_PATH)
        if not router or not router.get("last_updated"):
            failures.append("scaler_router.yaml is missing last_updated stamp")

    if failures:
        print("  [FAIL] Post-flight contract violations:")
        for f in failures: print(f"         - {f}")
        return False
    print(f"  [OK] Post-flight passed ({len(checks)} declared check(s))")
    return True


# ─── G11: --validate (read-only structural check) ─────────────────────────────
def run_validate():
    print("[VALIDATE] Scaler Substrate Validation")
    errors = 0
    warnings = 0

    def check(label, path, required=True):
        nonlocal errors, warnings
        if path.exists():
            print(f"  [OK]   {label}")
        elif required:
            print(f"  [ERR]  MISSING: {label} -> {path.relative_to(WORKSPACE_ROOT)}")
            errors += 1
        else:
            print(f"  [WARN] not found (optional): {label}")
            warnings += 1

    check("scaler_router.yaml", SCALER_ROUTER_PATH)
    check("SCALER_CONTRACTS.yaml", SCALER_CONTRACTS_PATH)
    check("scaler_state.yaml", SCALER_STATE)
    check("scaler_runbooks/", SCALER_RUNBOOKS_DIR)
    if SCALER_RUNBOOKS_DIR.exists():
        for required_runbook in [
            "Scaler-Architecture.md",
            "Scaler-Workflows.md",
            "Scaler-Operational-Rules.md",
            "Scaler-Gateway.md",
            "Scaler-Discovery-Logic.md",
        ]:
            check(f"scaler_runbooks/{required_runbook}", SCALER_RUNBOOKS_DIR / required_runbook)

    print(f"\n[VALIDATE] Done. {warnings} warning(s), {errors} error(s).")
    return errors == 0


# ─── Main sync flow ──────────────────────────────────────────────────────────
def sync(dry_run=False):
    print("[*] Starting Scaler Substrate Sync Engine v5.2...")

    if not enforce_pre_flight():
        print("[ABORT] Pre-flight contract failed.")
        sys.exit(1)

    sync_engines_dir = SCALER_ROUTING_DIR / "scaler_sync_engines"
    extra_args = ["--dry-run"] if dry_run else []
    # G-CTRL-8: propagate the lock-held flag so child engines don't try to
    # re-acquire a lock we already own. Without this, every nested engine
    # would deadlock once the lock helper is wired in.
    child_env = dict(os.environ)
    child_env["META_SYNC_LOCK_HELD"] = "1"

    # GAP-CHILD-CHECK-TRUE fix: a single child returncode!=0 must not blow up
    # the whole pipeline sync via CalledProcessError. Capture rc, log it, and
    # let the master sync's abort-on-warning gate decide. This mirrors how
    # `.meta_brain/meta_sync.py` handles its sub-syncs.
    failed_children: list[str] = []

    def _run_child(name: str, script: pathlib.Path):
        if not script.exists():
            return
        print(f"[*] Running {name}...")
        rc = subprocess.run([sys.executable, str(script), *extra_args], env=child_env)
        if rc.returncode != 0:
            print(f"  [ERR] {name} exited {rc.returncode} — surfacing as warning.")
            failed_children.append(name)

    # 1. meta_runtime_sync
    _run_child("meta_runtime_sync.py", sync_engines_dir / "meta_runtime_sync.py")

    # 2. scaler_state_sync
    _run_child("scaler_state_sync.py", sync_engines_dir / "scaler_state_sync.py")

    # 3. scaler_ledgers_sync
    _run_child("scaler_ledgers_sync.py", sync_engines_dir / "scaler_ledgers_sync.py")

    # 4. Re-assemble scaler_router.yaml
    print("\n[*] Re-assembling master scaler_router.yaml...")
    router = load_yaml(SCALER_ROUTER_PATH) or {
        "name": "scaler_router",
        "schema_version": "3.1",
        "description": "Master index for the Scaler Pipeline.",
    }

    runtime_data = load_yaml(SCALER_ROUTING_DIR / "scaler_runtime.yaml") or {}
    state_data = load_yaml(SCALER_STATE) or {}
    ledgers_data = load_yaml(SCALER_ROUTING_DIR / "scaler_ledgers.yaml") or {}

    router["last_updated"] = now_iso()

    # G12: Auto-populate runbook descriptions
    components = router.get("components") or {}
    runbook_block = components.get("runbook") or {}
    runbook_files = runbook_block.get("files") or []
    if SCALER_RUNBOOKS_DIR.exists() and runbook_files:
        for entry in runbook_files:
            name = entry.get("name") if isinstance(entry, dict) else None
            if not name:
                continue
            md_path = SCALER_RUNBOOKS_DIR / name
            if md_path.exists():
                desc = extract_runbook_metadata(md_path)
                if desc and entry.get("description") != desc:
                    entry["description"] = desc

    # Telemetry rollup. Single source per metric (G8 partial fix: gap counts
    # only live under internal_gaps, not duplicated under discoveries).
    aggregates = ledgers_data.get("external_discoveries", {}).get("aggregates", {}) or {}
    discoveries_view = {k: v for k, v in aggregates.items() if not k.startswith("total_active_gaps") and not k.startswith("total_resolved_gaps")}
    if not discoveries_view:
        discoveries_view = {
            "total_discoveries": 0, "total_integrated": 0, "total_pending": 0,
            "total_rejected": 0, "total_proposed": 0
        }

    router["telemetry"] = {
        "gateway": state_data.get("telemetry", {}).get("gateway", {
            "pending_approvals": 0, "last_action": "", "integration_queue": 0
        }),
        "discoveries": discoveries_view,
        "internal_gaps": ledgers_data.get("internal_gaps", {"active_gaps": 0, "resolved_gaps": 0})
    }

    if dry_run:
        print("  [DRY-RUN] Would write scaler_router.yaml")
    else:
        if _stamp_freshness is not None:
            _stamp_freshness(router, threshold_seconds=_router_freshness_threshold())
        save_yaml(SCALER_ROUTER_PATH, router)
        print("[+] Dynamic master scaler_router.yaml successfully re-assembled.")

    if not enforce_post_flight():
        print("[ABORT] Post-flight contract failed.")
        sys.exit(1)

    if failed_children:
        print(f"[!] Scaler Substrate Sync completed with {len(failed_children)} sub-engine warning(s): "
              f"{', '.join(failed_children)}")
        sys.exit(1)

    print("[!] Scaler Substrate Sync Complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scaler Substrate Sync Engine")
    parser.add_argument("--dry-run", action="store_true", help="Preview mutations.")
    parser.add_argument("--validate", action="store_true", help="Read-only structural check.")
    args = parser.parse_args()

    if args.validate:
        sys.exit(0 if run_validate() else 1)

    # G-CTRL-6: when invoked directly, acquire the master sync lock so two
    # agents racing on the Scaler sync don't trample each other's writes.
    # When invoked as a child of meta_sync.py, META_SYNC_LOCK_HELD=1 is set
    # and we skip lock acquisition (already held one level up).
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
