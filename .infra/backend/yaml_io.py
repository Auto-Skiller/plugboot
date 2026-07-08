"""YAML load/dump + freshness helpers for the Agentic OS daemon.

Concurrency posture (ADR-0001 / Decisions #2): simple writes, no locks, no
atomic tmp+replace dance, no version tokens. Git is the recovery net. If a
real clobber ever shows up during a long autonomous run, we add optimistic
concurrency then — not before.
"""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from ruamel.yaml import YAML

_yaml = YAML()
_yaml.preserve_quotes = True
_yaml.indent(mapping=2, sequence=4, offset=2)


def now_iso() -> str:
    """UTC ISO-8601 timestamp."""
    return datetime.now(timezone.utc).isoformat()


def load_yaml(path: Path) -> dict:
    """Load a YAML file. Missing/unreadable -> {} (never raises)."""
    try:
        if path.exists():
            with path.open("r", encoding="utf-8") as f:
                return _yaml.load(f) or {}
    except Exception as exc:  # noqa: BLE001 - daemon must never crash on a bad file
        print(f"[yaml_io] read error {path}: {exc}")
    return {}


def dump_yaml(path: Path, data) -> None:
    """Write a YAML file the simple way (parent dirs created as needed)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        _yaml.dump(data, f)


def stamp_freshness(data: dict, *, edited: bool = False) -> dict:
    """Stamp the standard freshness block. Engine-owned fields."""
    fr = data.setdefault("freshness", {})
    fr["sync_status"] = "fresh"
    fr["sync_count"] = int(fr.get("sync_count") or 0) + 1
    fr["last_synced"] = now_iso()
    if edited or not fr.get("last_edited"):
        fr["last_edited"] = now_iso()
    return data
