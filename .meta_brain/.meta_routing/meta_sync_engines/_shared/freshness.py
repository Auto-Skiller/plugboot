"""
Router Freshness Signal (Agentic OS v5.4)
==========================================
Inspired by the archived ``old engines/router.md`` pattern: the Router
refused to act on a catalog whose ``_meta.status`` was ``stale``. The current
sync stack rebuilds routers from disk and stamps ``generated_at``, but
nothing tells an agent reading the router whether the data is fresh enough
to trust. Multi-session / multi-hour autonomous runs need that signal —
otherwise an agent landing mid-session can act on hours-old routing data.

Design
------
Every router output gets a ``freshness`` block at write time::

    freshness:
      last_synced: <ISO>           # mtime of this sync cycle
      fresh_until: <ISO>           # last_synced + threshold (precomputed)
      status: fresh                # fresh | stale (computed at read time)
      threshold_seconds: <int>     # the threshold this stamp was written under

The ``status`` field reflects state at write time (always ``fresh``). At
read time, callers compare ``now()`` to ``fresh_until``: if the file is
older than its declared expiry, the data is stale and the agent should
re-run sync before consuming it. ``is_fresh()`` and ``check()`` both do
this comparison.

Why a separate ``freshness:`` key (not ``health:``)
---------------------------------------------------
Some routers already use ``health:`` for engine-state signals
(``meta_runtime.yaml``, ``toolboxes.yaml`` per-toolbox blocks). Co-locating
freshness there would force every consumer to disambiguate "router-level
freshness" from "engine-domain health". A dedicated key keeps the contract
unambiguous and survives future schema growth.
"""
from __future__ import annotations

import pathlib
from datetime import datetime, timedelta
from typing import Any

DEFAULT_THRESHOLD_SECONDS = 1800  # 30 minutes — comfortable margin above
                                  # typical multi-engine sync intervals.


def _now() -> datetime:
    return datetime.now()


def _parse_iso(value: Any) -> datetime | None:
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def stamp_freshness(data: dict, threshold_seconds: int = DEFAULT_THRESHOLD_SECONDS) -> None:
    """Write the freshness block onto ``data`` in-place.

    Idempotent: callers can invoke this at the end of every sync cycle.
    The block always reports ``status: fresh`` because, by definition, the
    sync engine just produced the file. Agents/validators compare
    ``fresh_until`` against ``now()`` to detect staleness later.
    """
    if not isinstance(data, dict):
        return
    now = _now()
    data["freshness"] = {
        "last_synced": now.isoformat(),
        "fresh_until": (now + timedelta(seconds=int(threshold_seconds))).isoformat(),
        "status": "fresh",
        "threshold_seconds": int(threshold_seconds),
    }


def evaluate(data: Any, *, now: datetime | None = None) -> dict:
    """Return a structured assessment of ``data``'s freshness.

    Shape::

        {
          "status": "fresh" | "stale" | "unknown",
          "age_seconds": <int> | None,
          "last_synced": <ISO> | None,
          "fresh_until": <ISO> | None,
          "threshold_seconds": <int> | None,
        }

    ``status: unknown`` means the router has no freshness block at all
    (legacy file or pre-stamp). Treat as stale for safety.
    """
    if not isinstance(data, dict):
        return {"status": "unknown", "age_seconds": None,
                "last_synced": None, "fresh_until": None, "threshold_seconds": None}
    block = data.get("freshness") or {}
    last_synced = _parse_iso(block.get("last_synced"))
    fresh_until = _parse_iso(block.get("fresh_until"))
    threshold = block.get("threshold_seconds")
    if last_synced is None or fresh_until is None:
        return {"status": "unknown", "age_seconds": None,
                "last_synced": None, "fresh_until": None,
                "threshold_seconds": threshold}
    cmp_now = now or _now()
    age = (cmp_now - last_synced).total_seconds()
    status = "fresh" if cmp_now <= fresh_until else "stale"
    return {
        "status": status,
        "age_seconds": int(age),
        "last_synced": last_synced.isoformat(),
        "fresh_until": fresh_until.isoformat(),
        "threshold_seconds": threshold,
    }


def is_fresh(data: Any, *, now: datetime | None = None) -> bool:
    """Convenience boolean wrapper around :func:`evaluate`."""
    return evaluate(data, now=now).get("status") == "fresh"


def check_router_file(yaml_path: pathlib.Path, *, loader=None,
                      now: datetime | None = None) -> dict:
    """Load a router YAML and return its freshness assessment.

    ``loader`` is an optional callable ``(path) -> dict`` so callers can
    plug in their preferred YAML loader (ruamel safe, ruamel round-trip,
    etc.) without forcing a dependency here.
    """
    if not yaml_path.exists():
        return {"status": "unknown", "age_seconds": None,
                "last_synced": None, "fresh_until": None,
                "threshold_seconds": None, "exists": False}
    if loader is None:
        from ruamel.yaml import YAML  # local import keeps freshness.py lean
        _y = YAML(typ="safe")
        with open(yaml_path, "r", encoding="utf-8") as fh:
            data = _y.load(fh)
    else:
        data = loader(yaml_path)
    out = evaluate(data, now=now)
    out["exists"] = True
    return out
