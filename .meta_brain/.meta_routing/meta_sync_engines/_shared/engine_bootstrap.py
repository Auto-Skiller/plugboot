"""
Engine Bootstrap (Agentic OS v5.4)
===================================
Single helper that every pipeline sub-engine (and any future sync engine that
lives more than two folders deep) imports for two things:

  1. ``find_workspace_root(__file__)`` — walks up from the engine file looking
     for the workspace anchor (a directory that contains both ``.meta_brain/``
     and ``CONTROLER.yaml``). Replaces brittle ``parent.parent.parent.parent
     .parent.parent`` arithmetic that breaks the moment the layout changes
     (GAP-WORKSPACE-ROOT fix).

  2. ``run_under_workspace_lock(...)`` — wraps a sync function with the
     workspace ``.sync.lock`` when the engine is invoked directly. When the
     master ``meta_sync.py`` already holds the lock it sets
     ``META_SYNC_LOCK_HELD=1`` in the child env; we honour that flag and skip
     re-acquisition. Pipeline sub-engines that called their own sync function
     standalone with no lock used to race the master sync (GAP-SUB-LOCK fix).

Both helpers are intentionally cheap and have zero side effects until the
caller invokes them. They live in ``_shared/`` so they're a single import for
every engine in the workspace.
"""
from __future__ import annotations

import os
import pathlib
import sys
from typing import Callable

# ─── Centralised constants (GAP-LOCK-PATH-DRIFT fix) ─────────────────────────
# Every engine must build its lock path through ``workspace_lock_path()``
# instead of hardcoding the literal ``.meta_brain/.meta_routing/.sync.lock``
# tail. Doing it through one helper means a future layout change becomes a
# one-line edit, not a 9-file find-and-replace.
SYNC_LOCK_RELPATH = pathlib.PurePosixPath(".meta_brain") / ".meta_routing" / ".sync.lock"

# ─── Child-engine exit-code legend (GAP-CASCADE-ABORT fix) ───────────────────
# Sub-engines used to return either 0 (clean) or 1 (any issue), which made
# transient warnings indistinguishable from hard failures. The orchestrator
# treated all non-zero codes as abort signals, so a single soft warning
# wedged the whole multi-hour autonomous loop. The new convention:
#
#   0 → clean
#   1 → soft warnings (router still produced, integrity intact)
#   2 → hard failure  (e.g. lock busy, missing schema, exception)
#
# The orchestrator can therefore continue the cycle on RC_WARN while still
# aborting on RC_FAIL. Engines that want to opt in pass ``warn_only=True``
# to ``run_under_workspace_lock`` and return False for warnings, True for
# success; ``run_under_workspace_lock`` maps that to RC_OK / RC_WARN.
RC_OK = 0
RC_WARN = 1
RC_FAIL = 2


def workspace_lock_path(workspace_root: pathlib.Path) -> pathlib.Path:
    """Return the canonical sync-lock path for ``workspace_root``."""
    return workspace_root / SYNC_LOCK_RELPATH


# ─── BOOT_CONTRACTS path (GAP-BOOT-PATH-DRIFT fix) ───────────────────────────
# Re-exported so engines that already import engine_bootstrap don't need a
# second module just to find the protocol file. Same root-cause class as
# workspace_lock_path: one helper, no copies of the literal string.
_BOOT_CONTRACTS_RELPATH = pathlib.PurePosixPath(".meta_brain") / "BOOT_CONTRACTS.yaml"


def boot_contracts_path(workspace_root: pathlib.Path) -> pathlib.Path:
    """Return the canonical BOOT_CONTRACTS.yaml path for ``workspace_root``."""
    return workspace_root / _BOOT_CONTRACTS_RELPATH


def find_workspace_root(start_file: str | pathlib.Path) -> pathlib.Path:
    """Walk up from ``start_file`` until we find the workspace anchor.

    The anchor is any directory that contains *both* ``.meta_brain/`` and
    ``CONTROLER.yaml``. That signature is unique to this workspace and
    cannot be confused with a sub-folder.

    Falls back to ``start_file.parent`` if no anchor is found, which keeps
    the caller from crashing on a misplaced engine — they'll just get the
    wrong root and observe the failure during validation, rather than
    silently writing to a nonsense path.

    GAP-WORKSPACE-ROOT fix: replaces ``Path(__file__).parent.parent.parent
    .parent.parent.parent`` chains. Counting parents is fragile because the
    folder depth is incidental; the anchor is the contract.
    """
    here = pathlib.Path(start_file).resolve()
    current = here.parent
    visited: set[pathlib.Path] = set()
    while current not in visited:
        visited.add(current)
        if (current / ".meta_brain").is_dir() and (current / "CONTROLER.yaml").is_file():
            return current
        if current.parent == current:
            break  # filesystem root
        current = current.parent
    # Fallback: best-effort guess so the caller can still report a useful
    # error rather than crashing on `None`.
    return here.parent


def add_shared_to_syspath(workspace_root: pathlib.Path) -> None:
    """Make ``_shared/`` importable from anywhere in the workspace."""
    shared = workspace_root / ".meta_brain" / ".meta_routing" / "meta_sync_engines" / "_shared"
    if str(shared) not in sys.path:
        sys.path.insert(0, str(shared))


def run_under_workspace_lock(
    sync_fn: Callable[[bool], bool | None],
    *,
    workspace_root: pathlib.Path,
    dry_run: bool,
    stale_seconds: int = 120,
    timeout_seconds: int = 30,
    warn_only: bool = False,
) -> int:
    """Run ``sync_fn(dry_run)`` under the workspace ``.sync.lock``.

    Skips lock acquisition when ``META_SYNC_LOCK_HELD=1`` (i.e. the master
    sync is already holding the lock). Returns the appropriate process exit
    code so the caller can ``sys.exit(...)`` on the result.

    Severity mapping (GAP-CASCADE-ABORT fix):
      - sync_fn returns truthy (None counts as truthy) → RC_OK
      - sync_fn returns False:
          * if ``warn_only`` is True       → RC_WARN (soft)
          * otherwise                      → RC_WARN (preserves prior behaviour:
                                              orchestrator decides if it aborts)
      - sync_fn raises                     → RC_FAIL
      - SyncLockBusy                       → RC_FAIL

    Engines that want the new soft-warning behaviour set ``warn_only=True``.
    Without it they default to RC_WARN on False, which is strictly safer
    than the previous RC_FAIL collapse — the orchestrator now decides what
    to do with warnings vs. hard failures.

    GAP-SUB-LOCK fix: pipeline sub-engines previously ran their sync function
    with no lock when invoked directly. Two agents racing on (e.g.)
    ``scaler_state_sync.py`` could trample each other's writes. Wrapping the
    call here guarantees serialisation for every direct invocation while
    letting the master sync keep its single workspace-wide lock.
    """
    add_shared_to_syspath(workspace_root)
    lock_path = workspace_lock_path(workspace_root)

    def _exec_and_classify() -> int:
        try:
            result = sync_fn(dry_run)
        except Exception as exc:  # noqa: BLE001
            print(f"[ERR] sync function raised: {exc}")
            return RC_FAIL
        if result is False:
            return RC_WARN
        return RC_OK

    if os.environ.get("META_SYNC_LOCK_HELD") == "1":
        return _exec_and_classify()

    # Lazy import so the unlocked path stays import-cheap for early-bootstrap
    # environments where ``_shared/`` may not yet exist on disk.
    try:
        from sync_lock import with_lock, SyncLockBusy  # type: ignore
    except Exception:
        # Lock module unavailable — fall back to running unlocked. The master
        # sync still holds its lock when this matters.
        return _exec_and_classify()

    try:
        with with_lock(lock_path, stale_seconds=stale_seconds, timeout_seconds=timeout_seconds):
            os.environ["META_SYNC_LOCK_HELD"] = "1"
            try:
                return _exec_and_classify()
            finally:
                # Don't leak the held flag back to the parent shell. We only
                # set it so any nested subprocess we spawn skips the lock.
                os.environ.pop("META_SYNC_LOCK_HELD", None)
    except SyncLockBusy as exc:
        print(f"[ERR] {exc}")
        return RC_FAIL
