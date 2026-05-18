"""
Pipelines Sync Engine (v5.3)
============================
Indexes every pipeline declared in pipelines.yaml and triggers each one's own
sync engine. Reads engine descriptor from the pipeline's own router so master
sync never has hardcoded paths to drift from (G1 root cause fix).

Each pipeline router MUST declare an `engine` block:

  engine:
    sync_script: <relative path to its own *_sync.py>
    state_file:  <relative path to its live state.yaml>

If either is missing, the master pipelines_sync emits a hard warning so the
operator notices instead of failing silently.

G-CTRL-7/8 hardening (this rev):
  - Child pipeline syncs now run under META_SYNC_LOCK_HELD=1 so they don't
    try to re-acquire the workspace lock we already own.
  - Child returncodes are inspected; a non-zero exit flips warnings_found so
    master sync's "abort on warnings" gate kicks in instead of swallowing
    the failure.
"""
from __future__ import annotations

import os
import pathlib
import subprocess
import sys
from datetime import datetime
from ruamel.yaml import YAML

# Local shared validators
sys.path.insert(0, str(pathlib.Path(__file__).parent / "_shared"))
from validators import validate, load_schema_from_yaml  # noqa: E402
from atomic_io import atomic_write_yaml  # noqa: E402
from freshness import stamp_freshness  # noqa: E402

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent
PIPELINES_ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "pipelines.yaml"


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


def update_pipeline_telemetry_passthrough(state_path: pathlib.Path, dry_run: bool):
    """Touch the local pipeline state's last_sync field if present."""
    if dry_run:
        return
    if not state_path.exists():
        return
    try:
        state = load_yaml(state_path)
        if not isinstance(state, dict):
            return
        tel = state.get("telemetry") or {}
        if not isinstance(tel, dict):
            return
        signals = tel.get("health_signals") or {}
        signals["last_sync"] = now_iso()
        tel["health_signals"] = signals
        state["telemetry"] = tel
        save_yaml(state_path, state)
        print(f"  [+] touched local telemetry: {state_path.relative_to(WORKSPACE_ROOT)}")
    except Exception as e:
        print(f"  [WARN] could not update {state_path}: {e}")


def sync_pipelines(dry_run: bool = False) -> bool:
    print("\n[*] Synchronizing pipelines.yaml…")
    # GAP-PIPELINE-SCHEMA-SILENT fix: the file declares `pipeline_inner_schema:`
    # which describes the shape of EACH INNER pipeline router (e.g.
    # scaler_router.yaml / hustler_router.yaml), not the top-level
    # pipelines.yaml dict. We load the schema once and validate every inner
    # router we visit below — never the master file against an inner schema.
    inner_schema = load_schema_from_yaml(
        PIPELINES_ROUTER_PATH,
        "pipeline_inner_schema",
        alt_keys=("pipeline_schema",),
    )
    warnings_found = False

    router = load_yaml(PIPELINES_ROUTER_PATH) or {
        "name": "pipelines_router",
        "schema_version": "1.0",
        "description": "Index of all active OS pipelines.",
        "pipelines": {},
    }

    router_modified = False
    for p_name, p_info in (router.get("pipelines") or {}).items():
        inner_router_path = WORKSPACE_ROOT / p_info.get("path", "")
        if not inner_router_path.exists():
            print(f"  [WARN] inner router for {p_name} not found at {p_info.get('path')}")
            warnings_found = True
            continue

        inner_data = load_yaml(inner_router_path)
        if inner_data:
            # Validate the inner router against the inner schema. The schema
            # declares the shape of a pipeline's own router — this is the
            # only document it applies to. Validating the top-level
            # pipelines.yaml against this schema would always fail (was the
            # silent bug surfaced when GAP-SCHEMA-LOAD-SILENT was fixed).
            if inner_schema:
                is_valid, err = validate(inner_data, inner_schema)
                if not is_valid:
                    print(f"  [WARN] inner router for {p_name} failed schema validation: {err}")
                    warnings_found = True
            desc = inner_data.get("description")
            wtu = (
                inner_data.get("when_to_use")
                or inner_data.get("metadata", {}).get("metadata", {}).get("when_to_use")
            )
            status = inner_data.get("status") or inner_data.get("metadata", {}).get("status", "active")
            if desc and p_info.get("description") != desc:
                p_info["description"] = desc
                router_modified = True
            if wtu and p_info.get("when_to_use") != wtu:
                p_info["when_to_use"] = wtu
                router_modified = True
            if status and p_info.get("status") != status:
                p_info["status"] = status
                router_modified = True

            # ─── Engine descriptor (G1 fix) ────────────────────────────────────
            engine_block = inner_data.get("engine") or {}
            sync_script_rel = engine_block.get("sync_script")
            state_file_rel = engine_block.get("state_file")

            if sync_script_rel:
                sync_script_path = WORKSPACE_ROOT / sync_script_rel
                if not sync_script_path.exists():
                    print(f"  [ERR] {p_name}: declared sync_script missing → {sync_script_rel}")
                    warnings_found = True
                else:
                    if not dry_run:
                        print(f"  [*] triggering {p_name} sync ({sync_script_rel})…")
                    else:
                        print(f"  [*] [DRY-RUN] would trigger {p_name} sync ({sync_script_rel})…")
                    # G-CTRL-8: signal the child that the workspace lock is
                    # already held so it doesn't deadlock trying to acquire
                    # it again. G-CTRL-7: capture rc + log non-zero so the
                    # master sync's abort-on-warning gate can fire.
                    # GAP-DRY-RUN-PROPAGATION fix: forward --dry-run to
                    # children so a master-level dry run never mutates
                    # pipeline state. Previously the engine executed real
                    # writes during a master dry-run, which silently broke
                    # the "preview only" contract.
                    child_env = dict(os.environ)
                    child_env["META_SYNC_LOCK_HELD"] = "1"
                    child_cmd = [sys.executable, str(sync_script_path)]
                    if dry_run:
                        child_cmd.append("--dry-run")
                    rc = subprocess.run(child_cmd, env=child_env)
                    if rc.returncode != 0:
                        print(f"  [ERR] {p_name} sync exited {rc.returncode} — surfacing as warning.")
                        warnings_found = True
            else:
                print(f"  [WARN] {p_name}: no engine.sync_script declared in inner router. Master sync cannot trigger it.")
                warnings_found = True

            if state_file_rel:
                state_path = WORKSPACE_ROOT / state_file_rel
                if not state_path.exists():
                    print(f"  [WARN] {p_name}: declared state_file missing → {state_file_rel}")
                    warnings_found = True
                else:
                    update_pipeline_telemetry_passthrough(state_path, dry_run)
            else:
                print(f"  [WARN] {p_name}: no engine.state_file declared in inner router.")
                warnings_found = True

        print(f"  [OK]  {p_name}")

    if router_modified and not dry_run:
        save_yaml(PIPELINES_ROUTER_PATH, router)
        print("  [+] pipelines.yaml updated with metadata from pipeline routers.")

    # Stamp freshness so agents reading pipelines.yaml mid-session can detect
    # whether the catalog is current. Always write — even if no other field
    # changed, the freshness stamp itself is the contract refresh.
    if not dry_run:
        stamp_freshness(router, threshold_seconds=1800)
        save_yaml(PIPELINES_ROUTER_PATH, router)

    print("[PIPELINES] Done.")
    return not warnings_found


if __name__ == "__main__":
    import os as _os
    dry_run = "--dry-run" in sys.argv
    sys.path.insert(0, str(pathlib.Path(__file__).parent / "_shared"))
    from engine_bootstrap import workspace_lock_path  # noqa: E402
    if _os.environ.get("META_SYNC_LOCK_HELD") == "1":
        ok = sync_pipelines(dry_run)
        sys.exit(0 if ok else 1)
    from sync_lock import with_lock as _with_lock, SyncLockBusy as _SyncLockBusy  # noqa: E402
    _LOCK = workspace_lock_path(WORKSPACE_ROOT)
    try:
        with _with_lock(_LOCK, stale_seconds=120, timeout_seconds=30):
            ok = sync_pipelines(dry_run)
            sys.exit(0 if ok else 1)
    except _SyncLockBusy as exc:
        print(f"[ERR] {exc}")
        sys.exit(2)
