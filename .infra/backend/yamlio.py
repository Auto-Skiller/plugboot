"""YAML read/write for the daemon.

Concurrency posture (ADR-0001 / Decisions #2): simple writes, no lock, no
atomic tmp+replace, no version tokens. Git is the recovery net. If a real
clobber ever shows up during a long autonomous run, optimistic concurrency
gets added here — and only here — without touching callers.

round-trip mode (ruamel) preserves comments + quotes so hand-edits and
heavily-commented instance files survive a daemon rewrite.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from ruamel.yaml import YAML

_yaml = YAML()
_yaml.preserve_quotes = True
_yaml.indent(mapping=2, sequence=4, offset=2)
_yaml.width = 4096  # don't wrap long scalars


def load(path: Path) -> Any:
    """Load a YAML file. Returns {} for missing/empty files."""
    try:
        if path.exists() and path.stat().st_size > 0:
            with open(path, "r", encoding="utf-8") as f:
                return _yaml.load(f) or {}
    except Exception as e:  # noqa: BLE001 - daemon must never die on one bad file
        print(f"[yamlio] read error {path}: {e}")
    return {}


def dump(path: Path, data: Any) -> None:
    """Write a YAML file the simple way. Parent dirs are created."""
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            _yaml.dump(data, f)
    except Exception as e:  # noqa: BLE001
        print(f"[yamlio] write error {path}: {e}")
