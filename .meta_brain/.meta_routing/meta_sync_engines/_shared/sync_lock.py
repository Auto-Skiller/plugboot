"""
Sync Lock (Agentic OS v5.3)
============================
File-based advisory lock for ``meta_sync.py`` and any engine that needs to be
exclusive across processes.

Why this exists
---------------
Under multi-session / multi-hour operation, two agents may both trigger the
master sync within the same second. Without a guard:

  - meta_router.yaml gets re-assembled twice with potentially conflicting
    interim state.
  - CONTROLER.yaml.telemetry counters race (one increment lost).
  - milestones_history.yaml may double-log SESSION_REOPENED events.

This module gives the master sync a way to say "I'm running — wait or exit"
without depending on platform-specific OS primitives (Windows has no fcntl,
fcntl on macOS/Linux is per-FD-per-process).

Design
------
- Lock file path: ``.meta_brain/.meta_routing/.sync.lock``
- Contents: ``{pid: int, host: str, acquired_at: ISO8601}``
- Stale tolerance: a lock older than ``constants.sync_lock_stale_seconds``
  (default 120s) is considered abandoned and stolen.
- On acquire, the helper writes the lock atomically. On release, it removes the
  file. ``with_lock(...)`` context manager handles both ends and the failure
  mode (process crashed → file removed on next sync via stale-tolerance).

Failure mode
------------
If acquisition fails after the polling timeout, the helper raises
``SyncLockBusy``. The master sync surfaces this as a non-zero exit so the
calling agent can retry instead of corrupting state.

Tmp-leak protection (GAP-LOCK-LEAK fix)
---------------------------------------
``acquire()`` writes ``<lock>.<pid>.tmp`` then ``os.replace()``s it into place.
If the process crashes between those two steps the tmp is left behind, and a
forensic listing of the routing folder (or a future sweep via the orchestrator
loop) sees orphan ``.sync.lock.<pid>.tmp`` files forever. The fix has two
parts:

  1. ``acquire()`` wraps the write+replace in ``try/except`` and unlinks the
     tmp on ANY failure path.
  2. Before each acquisition attempt, ``_sweep_stale_tmps()`` removes any
     ``.sync.lock.*.tmp`` whose PID is dead OR whose mtime is older than
     ``stale_seconds``. The sweep is cheap (one ``glob`` + a few stat calls)
     and means orphans cannot accumulate across sessions.
"""
from __future__ import annotations

import json
import os
import pathlib
import socket
import sys
import time
from contextlib import contextmanager
from datetime import datetime
from typing import Iterator


class SyncLockBusy(RuntimeError):
    """Raised when the sync lock is held by another live process."""


def _now_iso() -> str:
    return datetime.now().isoformat()


def _is_pid_alive(pid: int) -> bool:
    """Cheap liveness check that works on Windows + Unix.

    On Windows, ``os.kill(pid, 0)`` raises OSError if the PID is dead.
    On Unix, ``os.kill(pid, 0)`` raises ProcessLookupError if dead, and
    PermissionError if the PID is alive but we don't own it (we still treat
    that as alive — somebody else holds the lock).
    """
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    except OSError:
        # Windows: invalid handle / pid already exited.
        return False


def _read_lock(lock_path: pathlib.Path) -> dict | None:
    if not lock_path.exists():
        return None
    try:
        return json.loads(lock_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def _is_stale(lock: dict, stale_seconds: int) -> bool:
    pid = int(lock.get("pid", 0))
    if pid <= 0:
        return True
    if not _is_pid_alive(pid):
        return True
    try:
        acquired = datetime.fromisoformat(lock["acquired_at"])
        age = (datetime.now() - acquired).total_seconds()
        return age > stale_seconds
    except (KeyError, ValueError):
        return True


def _sweep_stale_tmps(lock_path: pathlib.Path, stale_seconds: int) -> int:
    """GAP-LOCK-LEAK fix: delete orphan ``<lock>.<pid>.tmp`` files left behind
    when an ``acquire()`` was killed between write and ``os.replace``.

    Sweeps two classes of leftovers:
      1. PID encoded in the filename is no longer alive.
      2. File mtime older than ``stale_seconds``.

    Returns the count of deleted files (mostly useful for debugging).
    """
    parent = lock_path.parent
    if not parent.exists():
        return 0
    pattern = lock_path.name + ".*.tmp"
    deleted = 0
    now = time.time()
    for stale in parent.glob(pattern):
        try:
            # Try to extract the embedded PID: <lock>.<pid>.tmp
            stem_parts = stale.name[: -len(".tmp")].split(".")
            embedded_pid = int(stem_parts[-1]) if stem_parts and stem_parts[-1].isdigit() else 0
        except (ValueError, IndexError):
            embedded_pid = 0
        try:
            mtime_age = now - stale.stat().st_mtime
        except OSError:
            mtime_age = stale_seconds + 1  # treat unreadable as stale
        is_dead = embedded_pid > 0 and not _is_pid_alive(embedded_pid)
        if is_dead or mtime_age > stale_seconds:
            try:
                stale.unlink()
                deleted += 1
            except OSError:
                pass
    return deleted


def acquire(
    lock_path: pathlib.Path,
    *,
    stale_seconds: int = 120,
    timeout_seconds: int = 30,
    poll_interval: float = 0.5,
) -> None:
    """Acquire the sync lock or raise ``SyncLockBusy``.

    The function polls until either it grabs the lock, or ``timeout_seconds``
    has elapsed. Stale locks (dead PID or older than ``stale_seconds``) are
    stolen automatically. Orphan ``<lock>.<pid>.tmp`` leftovers from past
    crashed acquires are swept on every entry (GAP-LOCK-LEAK fix).
    """
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    _sweep_stale_tmps(lock_path, stale_seconds)
    deadline = time.monotonic() + timeout_seconds

    while True:
        existing = _read_lock(lock_path)
        if existing is None or _is_stale(existing, stale_seconds):
            payload = {
                "pid": os.getpid(),
                "host": socket.gethostname(),
                "acquired_at": _now_iso(),
                "owner_script": str(pathlib.Path(sys.argv[0]).name) if sys.argv else "<unknown>",
            }
            tmp = lock_path.with_suffix(lock_path.suffix + f".{os.getpid()}.tmp")
            try:
                # Atomic create/replace. If two processes hit the same window,
                # the second one's payload wins; both will then re-check via
                # poll (we re-read after sleep), and the loser will see a fresh
                # PID it doesn't own and back off.
                tmp.write_text(json.dumps(payload), encoding="utf-8")
                os.replace(tmp, lock_path)
            except OSError:
                # GAP-LOCK-LEAK: ensure the tmp can't survive a failed write
                # or replace. Best-effort cleanup; if even unlink fails we'll
                # rely on the next sweep to take it out.
                try:
                    if tmp.exists():
                        tmp.unlink()
                except OSError:
                    pass
                # Filesystem hiccup — treat as "didn't get it", loop.
            else:
                # Re-read to confirm we actually own it.
                check = _read_lock(lock_path)
                if check and check.get("pid") == os.getpid():
                    return
        if time.monotonic() >= deadline:
            holder = existing or {}
            raise SyncLockBusy(
                f"Sync lock held by pid={holder.get('pid')} since "
                f"{holder.get('acquired_at')} (host={holder.get('host')}). "
                f"Waited {timeout_seconds}s and gave up."
            )
        time.sleep(poll_interval)


def release(lock_path: pathlib.Path) -> None:
    """Release the lock if we own it. Silent on no-op."""
    try:
        existing = _read_lock(lock_path)
        if existing and existing.get("pid") == os.getpid():
            lock_path.unlink()
    except OSError:
        pass


@contextmanager
def with_lock(
    lock_path: pathlib.Path,
    *,
    stale_seconds: int = 120,
    timeout_seconds: int = 30,
) -> Iterator[None]:
    acquire(lock_path, stale_seconds=stale_seconds, timeout_seconds=timeout_seconds)
    try:
        yield
    finally:
        release(lock_path)


# ─── Observability helpers (GAP-LOCK-OBSERVABILITY fix) ──────────────────────
# Before this, the lock was a black box to anyone who didn't already hold it.
# An autonomous orchestrator running a multi-hour loop had no way to surface
# "another agent is currently in the master sync" except by attempting to
# acquire (which blocks for `timeout_seconds`). The two helpers below let
# --validate and other read-only diagnostics ask non-blocking questions.

def inspect(lock_path: pathlib.Path, *, stale_seconds: int = 120) -> dict:
    """Return a diagnostic snapshot of the lock state.

    Shape::

        {
          "exists": bool,
          "held_by_live_pid": bool,
          "stale": bool,
          "pid": int | None,
          "host": str | None,
          "owner_script": str | None,
          "acquired_at": ISO | None,
          "age_seconds": int | None,
          "stale_threshold_seconds": int,
        }

    Never raises. Safe to call from --validate, telemetry rollups, or the
    Orchestrator Loop's "is anyone else syncing?" check.
    """
    snapshot: dict = {
        "exists": lock_path.exists(),
        "held_by_live_pid": False,
        "stale": False,
        "pid": None,
        "host": None,
        "owner_script": None,
        "acquired_at": None,
        "age_seconds": None,
        "stale_threshold_seconds": int(stale_seconds),
    }
    if not snapshot["exists"]:
        return snapshot
    payload = _read_lock(lock_path)
    if not payload:
        # File exists but is unreadable / corrupt — treat as stale so the
        # next acquire() can steal it.
        snapshot["stale"] = True
        return snapshot
    pid = int(payload.get("pid", 0)) or None
    snapshot["pid"] = pid
    snapshot["host"] = payload.get("host")
    snapshot["owner_script"] = payload.get("owner_script")
    snapshot["acquired_at"] = payload.get("acquired_at")
    snapshot["held_by_live_pid"] = bool(pid and _is_pid_alive(pid))
    try:
        if isinstance(payload.get("acquired_at"), str):
            acquired = datetime.fromisoformat(payload["acquired_at"])
            age = (datetime.now() - acquired).total_seconds()
            snapshot["age_seconds"] = int(age)
            if age > stale_seconds:
                snapshot["stale"] = True
    except (KeyError, ValueError):
        snapshot["stale"] = True
    if not snapshot["held_by_live_pid"]:
        snapshot["stale"] = True
    return snapshot


def sweep_stale_tmps(lock_path: pathlib.Path, *, stale_seconds: int = 120) -> int:
    """Public wrapper around the internal tmp sweep.

    GAP-LOCK-LEAK-EXTERNAL fix: the previous contract bound the sweep to
    the ``acquire()`` path. When no sync ran for an extended period (e.g. a
    paused workspace), orphan ``<lock>.<pid>.tmp`` files from a past crash
    survived indefinitely. Exposing the sweep means --validate can call it
    and clear orphans without needing to acquire the lock first.
    """
    return _sweep_stale_tmps(lock_path, stale_seconds)
