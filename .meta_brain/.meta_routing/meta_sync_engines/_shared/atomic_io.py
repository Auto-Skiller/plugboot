"""
Atomic IO Helpers (Agentic OS v5.3)
====================================
Shared atomic-write helpers for every sync engine.

Why this exists
---------------
Naked ``open(path, "w")`` + ``yaml.dump(...)`` is not crash-safe. If a sync is
killed mid-write (Ctrl-C, OOM, agent crash, parallel process collision), the
target file is left half-written and the next reader will see a corrupt YAML.

Under the v5.3 multi-session / multi-hour operating mode, multiple agents may
trigger ``meta_sync.py`` in close succession. The combination of:

  1. ``sync_lock.acquire()`` at the master level (one master sync at a time)
  2. ``atomic_write_yaml()`` everywhere (no partial writes on the disk)
  3. Bounded retry on Windows file-handle races (next paragraph)

Eliminates the entire class of "phantom corruption" bugs.

Why retry-on-replace
--------------------
On Windows, ``os.replace()`` can raise ``PermissionError`` (WinError 5) when
the destination file is briefly held open by an antivirus scanner, the
Windows Search indexer, or a pending CloseHandle from another process that
just released the master sync lock. The lock guarantees only one *writer*
window per file, but the OS may keep a phantom handle for tens of
milliseconds afterward. Retrying the rename with exponential backoff turns
this transient OS condition into a non-issue.

Convention
----------
All sync engines MUST import ``atomic_write_yaml`` instead of writing YAML by
hand. The previous ``save_yaml`` helpers in each engine were renamed to delegate
here so the call sites stay readable.
"""
from __future__ import annotations

import os
import pathlib
import tempfile
import time
from typing import Any

from ruamel.yaml import YAML

_yaml = YAML()
_yaml.preserve_quotes = True
_yaml.indent(mapping=2, sequence=4, offset=2)

# Retry tuning — kept small because the lock is the primary serialiser; this
# is just for the OS-level handle window.
_REPLACE_RETRY_ATTEMPTS = 6
_REPLACE_RETRY_BACKOFF_S = (0.05, 0.10, 0.20, 0.40, 0.80, 1.50)


def _replace_with_retry(src: str, dst: str | pathlib.Path) -> None:
    """``os.replace`` with bounded retries for Windows handle races."""
    last_exc: Exception | None = None
    for attempt in range(_REPLACE_RETRY_ATTEMPTS):
        try:
            os.replace(src, dst)
            return
        except PermissionError as exc:  # WinError 5
            last_exc = exc
            if attempt + 1 < _REPLACE_RETRY_ATTEMPTS:
                time.sleep(_REPLACE_RETRY_BACKOFF_S[attempt])
                continue
            raise
    if last_exc:
        raise last_exc


def atomic_write_yaml(path: pathlib.Path, data: Any, *, yaml_instance: YAML | None = None) -> None:
    """Atomically write ``data`` to ``path`` as YAML.

    Strategy: write to ``<path>.<pid>.tmp`` in the same directory, fsync, then
    ``os.replace()`` — an atomic rename on every POSIX and NTFS. Readers either
    see the old file or the new file, never a half-written one. Replace is
    retried on Windows-style handle races (see module docstring).

    Parameters
    ----------
    path : pathlib.Path
        Target YAML file.
    data : Any
        Anything ruamel.yaml can dump.
    yaml_instance : YAML, optional
        Override the default dumper. Useful when an engine needs round-trip
        preservation (``yaml.preserve_quotes = True`` is already on by default).
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    dumper = yaml_instance or _yaml

    # NamedTemporaryFile in the same directory so os.replace is on the same FS.
    fd, tmp_name = tempfile.mkstemp(
        prefix=path.name + ".",
        suffix=".tmp",
        dir=str(path.parent),
    )
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            dumper.dump(data, fh)
            fh.flush()
            try:
                os.fsync(fh.fileno())
            except OSError:
                # Some filesystems (e.g. network mounts) don't support fsync.
                pass
        _replace_with_retry(tmp_name, path)
    except Exception:
        # Clean up the tmp on any failure so we don't litter the directory.
        try:
            if os.path.exists(tmp_name):
                os.unlink(tmp_name)
        except OSError:
            pass
        raise


def atomic_read_yaml(path: pathlib.Path, *, yaml_instance: YAML | None = None) -> Any:
    """Read a YAML file safely. Returns ``None`` if the file does not exist.

    This is a thin wrapper that exists so engines can swap to a locked-read
    implementation later (advisory file lock during read) without changing
    every call site.
    """
    if not path.exists():
        return None
    loader = yaml_instance or _yaml
    with open(path, "r", encoding="utf-8") as fh:
        return loader.load(fh)
