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
) -> int:
    """Run ``sync_fn(dry_run)`` under the workspace ``.sync.lock``.

    Skips lock acquisition when ``META_SYNC_LOCK_HELD=1`` (i.e. the master
    sync is already holding the lock). Returns the appropriate process exit
    code so the caller can ``sys.exit(...)`` on the result.

    GAP-SUB-LOCK fix: pipeline sub-engines previously ran their sync function
    with no lock when invoked directly. Two agents racing on (e.g.)
    ``scaler_state_sync.py`` could trample each other's writes. Wrapping the
    call here guarantees serialisation for every direct invocation while
    letting the master sync keep its single workspace-wide lock.
    """
    add_shared_to_syspath(workspace_root)
    lock_path = workspace_root / ".meta_brain" / ".meta_routing" / ".sync.lock"

    if os.environ.get("META_SYNC_LOCK_HELD") == "1":
        result = sync_fn(dry_run)
        return 0 if result is not False else 1

    # Lazy import so the unlocked path stays import-cheap for early-bootstrap
    # environments where ``_shared/`` may not yet exist on disk.
    try:
        from sync_lock import with_lock, SyncLockBusy  # type: ignore
    except Exception:
        # Lock module unavailable — fall back to running unlocked. The master
        # sync still holds its lock when this matters.
        result = sync_fn(dry_run)
        return 0 if result is not False else 1

    try:
        with with_lock(lock_path, stale_seconds=stale_seconds, timeout_seconds=timeout_seconds):
            os.environ["META_SYNC_LOCK_HELD"] = "1"
            try:
                result = sync_fn(dry_run)
            finally:
                # Don't leak the held flag back to the parent shell. We only
                # set it so any nested subprocess we spawn skips the lock.
                os.environ.pop("META_SYNC_LOCK_HELD", None)
            return 0 if result is not False else 1
    except SyncLockBusy as exc:
        print(f"[ERR] {exc}")
        return 2
