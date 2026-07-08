"""ymlio.py — YAML read/write helpers for the Agentic OS daemon.

Per ADR-0001 / Decisions #2: writes are SIMPLE. No locks, no tmp+replace
atomic dance, no version tokens. Git is the recovery net. Revisit only if a
real clobber shows up during a long autonomous run.

Uses ruamel.yaml to preserve comments/quotes/order so the schema files and the
human-authored sections survive round-trips.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from ruamel.yaml import YAML

_yaml = YAML()
_yaml.preserve_quotes = True
_yaml.indent(mapping=2, sequence=4, offset=2)
_yaml.width = 4096  # avoid line-wrapping long strings


def read_yaml(path: str | Path) -> Any:
    """Load a YAML file. Returns {} for missing/empty/broken files."""
    p = Path(path)
    if not p.exists():
        return {}
    try:
        with p.open("r", encoding="utf-8") as f:
            data = _yaml.load(f)
        return data if data is not None else {}
    except Exception as e:  # noqa: BLE001 - never crash the loop on one bad file
        print(f"[ymlio] read error {p}: {e}")
        return {}


def write_yaml(path: str | Path, data: Any) -> None:
    """Write a YAML file the simple way (direct write).

    A mid-write crash can corrupt this single file; recovery is `git checkout`.
    This is the deliberate v1 posture (Decisions #2).
    """
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    try:
        with p.open("w", encoding="utf-8") as f:
            _yaml.dump(data, f)
    except Exception as e:  # noqa: BLE001
        print(f"[ymlio] write error {p}: {e}")


def to_plain(obj: Any) -> Any:
    """Recursively convert ruamel YAML objects (CommentedMap/Seq + scalar
    subclasses) into plain dict/list/str/int/float/bool/None so json.dumps and
    Starlette's JSONResponse can serialize them.
    """
    if isinstance(obj, dict):
        return {str(to_plain(k)): to_plain(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [to_plain(v) for v in obj]
    if isinstance(obj, bool) or obj is None or isinstance(obj, (int, float)):
        return obj
    # ruamel scalar strings / dates / everything else -> string
    if isinstance(obj, str):
        return str(obj)
    return str(obj)


def read_text(path: str | Path) -> str:
    p = Path(path)
    if not p.exists():
        return ""
    try:
        return p.read_text(encoding="utf-8")
    except Exception as e:  # noqa: BLE001
        print(f"[ymlio] read_text error {p}: {e}")
        return ""


def write_text(path: str | Path, text: str) -> None:
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    try:
        p.write_text(text, encoding="utf-8")
    except Exception as e:  # noqa: BLE001
        print(f"[ymlio] write_text error {p}: {e}")
