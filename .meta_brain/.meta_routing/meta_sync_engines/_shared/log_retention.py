"""
Log retention helper (Agentic OS v5.5)
======================================
Single source of truth for the "keep N most recent *.log files, prune the
rest" pattern. Hoisted out of three near-duplicate copies in:

  - .meta_brain/.meta_routing/meta_sync_engines/meta_runtime_sync.py
  - _pipelines/_scaler/.scaler_brain/.scaler_routing/scaler_sync_engines/meta_runtime_sync.py
  - _pipelines/hustler/.hustler_brain/.hustler_routing/hustler_sync_engines/hustler_runtime_sync.py

The cap comes from BOOT_CONTRACTS.constants.scratch_log_retention_max so a
single edit there propagates to every engine. Same root-cause class as
GAP-LOCK-PATH-DRIFT and GAP-BOOT-PATH-DRIFT — one helper, no copies.
"""
from __future__ import annotations

import pathlib


def prune_old_logs(scratch_dir: pathlib.Path, retention: int) -> int:
    """Keep only the ``retention`` most-recent ``*.log`` files. Delete the rest.

    Returns the number of files actually deleted (mostly useful for logging).
    Defensive against missing directory and unreadable mtimes — never raises.
    """
    if not scratch_dir.exists() or retention < 0:
        return 0
    try:
        logs = sorted(
            scratch_dir.glob("*.log"),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
    except OSError:
        return 0
    deleted = 0
    for stale in logs[retention:]:
        try:
            stale.unlink()
            deleted += 1
        except OSError:
            pass
    return deleted
