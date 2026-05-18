"""
BOOT_CONTRACTS shared loader (Agentic OS v5.5)
==============================================
Single source of truth for reading and stamping ``.meta_brain/BOOT_CONTRACTS.yaml``.
Lifted from the 6 near-duplicate readers that lived in:

  - .meta_brain/meta_sync.py
  - .meta_brain/.meta_routing/meta_sync_engines/milestones_sync.py
  - .meta_brain/.meta_routing/meta_sync_engines/toolboxes_sync.py
  - .meta_brain/.meta_routing/meta_sync_engines/meta_runtime_sync.py
  - _pipelines/_scaler/.scaler_brain/.scaler_routing/scaler_sync_engines/meta_runtime_sync.py
  - _pipelines/hustler/.hustler_brain/.hustler_routing/hustler_sync_engines/hustler_runtime_sync.py

Each had its own ``BOOT_CONTRACTS_PATH = WORKSPACE_ROOT / ...`` literal and
its own ``_constants()`` / ``_constant()`` reader. That class of duplication
was the same root cause behind GAP-LOCK-PATH-DRIFT (multiple hardcoded lock
paths). One module, one path, one loader.

Public surface
--------------
* ``boot_contracts_path(workspace_root)`` — canonical YAML path.
* ``load_boot_contracts(workspace_root)`` — returns the parsed dict (or None).
* ``load_constants(workspace_root, defaults=...)`` — merged defaults + live.
* ``constant(workspace_root, name, default)`` — single-key lookup with default.
* ``boot_steps_for_validation(workspace_root)`` — yields the BOOT-NN step
  records that --validate consumes (stable order).
* ``stamp_self(workspace_root, threshold_seconds=...)`` — writes the same
  ``freshness:`` block every router uses, plus refreshes ``last_updated``
  so the timestamp stops being a hand-edited lie.

All readers use the round-trip YAML loader so comments and key order survive
when the engine writes the file back. Writers use the shared atomic_io helper.
"""
from __future__ import annotations

import pathlib
from datetime import datetime
from typing import Any, Iterator

from ruamel.yaml import YAML

# ─── Centralised path (GAP-BOOT-PATH-DRIFT fix) ─────────────────────────────
BOOT_CONTRACTS_RELPATH = pathlib.PurePosixPath(".meta_brain") / "BOOT_CONTRACTS.yaml"


def boot_contracts_path(workspace_root: pathlib.Path) -> pathlib.Path:
    """Return the canonical BOOT_CONTRACTS.yaml path for ``workspace_root``."""
    return workspace_root / BOOT_CONTRACTS_RELPATH


_yaml = YAML()
_yaml.preserve_quotes = True
_yaml.indent(mapping=2, sequence=4, offset=2)


def load_boot_contracts(workspace_root: pathlib.Path) -> dict | None:
    """Load BOOT_CONTRACTS.yaml as a round-trip dict, or ``None`` if missing.

    Falls back to ``None`` (never raises) so callers can degrade to their
    declared defaults during a partial bootstrap.
    """
    path = boot_contracts_path(workspace_root)
    if not path.exists():
        return None
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return _yaml.load(fh)
    except Exception:
        return None


def load_constants(
    workspace_root: pathlib.Path,
    defaults: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Return the merged constants dict (defaults overlaid by live values).

    The defaults argument is intentional: each engine knows its own minimum
    safe set and passes it in. The live BOOT_CONTRACTS.constants overlays
    those values. If BOOT_CONTRACTS is unreadable, the defaults stand alone
    so the engine still functions.
    """
    out: dict[str, Any] = dict(defaults or {})
    boot = load_boot_contracts(workspace_root)
    if boot and isinstance(boot.get("constants"), dict):
        for k, v in boot["constants"].items():
            out[k] = v
    return out


def constant(
    workspace_root: pathlib.Path,
    name: str,
    default: Any,
) -> Any:
    """Single-key lookup. Returns ``default`` when BOOT_CONTRACTS or the key
    is missing. This is the call shape used by every per-pipeline engine."""
    boot = load_boot_contracts(workspace_root)
    if boot and isinstance(boot.get("constants"), dict):
        return boot["constants"].get(name, default)
    return default


# ─── Convenience aliases (root-cause fix for hardcoded thresholds) ──────────
# Every engine that stamps freshness used to inline ``threshold_seconds=1800``.
# That literal was duplicated across 9 call sites, so the live constant
# ``router_freshness_max_seconds`` was effectively unused — tuning it in
# BOOT_CONTRACTS had no effect until you also edited every literal. The two
# helpers below funnel every engine through the constant. A future tune is a
# single edit in BOOT_CONTRACTS.constants.

def router_freshness_threshold(
    workspace_root: pathlib.Path,
    *,
    default: int = 1800,
) -> int:
    """Return the canonical router freshness threshold (seconds).

    Reads ``constants.router_freshness_max_seconds`` from BOOT_CONTRACTS.
    Engines pass the result straight to ``stamp_freshness(..., threshold_seconds=...)``
    so every router shares one knob.
    """
    return int(constant(workspace_root, "router_freshness_max_seconds", default))


def required_engine_version(
    workspace_root: pathlib.Path,
    *,
    default: str = "5.4",
) -> str:
    """Return the engine version BOOT_CONTRACTS expects to be running.

    GAP-VERSION-COMPAT root-cause fix: the engine code carried its own
    ``SYNC_ENGINE_VERSION`` literal and BOOT_CONTRACTS carried its own
    ``required_sync_engine_version`` constant. Nothing audited the pair.
    The two were one merge away from disagreeing forever, with agents
    running stale binaries against fresh contracts. Funnelling both reads
    through this helper means ``--validate`` can compare them on every
    cycle and surface drift the moment it appears.
    """
    return str(constant(workspace_root, "required_sync_engine_version", default))


def assert_engine_version(
    workspace_root: pathlib.Path,
    running_version: str,
) -> tuple[bool, str]:
    """Compare ``running_version`` against the BOOT_CONTRACTS-required version.

    Returns ``(matches, message)``. ``matches`` is ``True`` when the strings
    are equal. ``message`` is a human-readable diagnostic suitable for the
    ``--validate`` output. Never raises; callers decide whether a mismatch
    is fatal.
    """
    expected = required_engine_version(workspace_root, default=str(running_version))
    if str(running_version) == expected:
        return True, f"engine version {running_version} matches BOOT_CONTRACTS"
    return False, (
        f"engine version drift: running {running_version!r}, BOOT_CONTRACTS expects "
        f"{expected!r} (constants.required_sync_engine_version)"
    )


def boot_steps_for_validation(workspace_root: pathlib.Path) -> Iterator[dict]:
    """Yield BOOT-NN step records suitable for --validate consumption.

    Skips conditional steps (``action: conditional``) — those depend on
    runtime state and can't be validated as static disk paths. Only yields
    steps with a non-empty ``target:``.
    """
    boot = load_boot_contracts(workspace_root)
    if not boot:
        return
    for step in (boot.get("steps") or []):
        if not isinstance(step, dict):
            continue
        if step.get("action") == "conditional":
            continue
        if not step.get("target"):
            continue
        yield step


def stamp_self(
    workspace_root: pathlib.Path,
    *,
    threshold_seconds: int = 1800,
    yaml_instance: YAML | None = None,
) -> bool:
    """Write the same ``freshness:`` block every router uses onto BOOT_CONTRACTS,
    refresh ``last_updated``, and persist atomically.

    Root-cause fix for GAP-BOOT-FRESH (no freshness contract on the protocol
    file itself) and GAP-BOOT-LAST-UPDATED (hand-edited timestamp inside a
    machine-enforced document). Returns True on success, False if the file
    is missing or unreadable.

    The function is idempotent — calling it multiple times in a row is safe;
    each call re-stamps with the current time.
    """
    # Lazy imports keep this module light for callers that only want path
    # / loader helpers (e.g. validators).
    try:
        from atomic_io import atomic_write_yaml  # type: ignore
    except Exception:
        from .atomic_io import atomic_write_yaml  # type: ignore
    try:
        from freshness import stamp_freshness  # type: ignore
    except Exception:
        from .freshness import stamp_freshness  # type: ignore

    path = boot_contracts_path(workspace_root)
    if not path.exists():
        return False
    dumper = yaml_instance or _yaml
    try:
        with open(path, "r", encoding="utf-8") as fh:
            data = dumper.load(fh)
    except Exception:
        return False
    if not isinstance(data, dict):
        return False
    # GAP-BOOT-LAST-UPDATED fix: stop hand-editing the timestamp inside the
    # protocol file. The engine owns it now and writes ISO on every sync.
    data["last_updated"] = datetime.now().isoformat()
    # GAP-BOOT-FRESH fix: add the same freshness contract every router uses
    # so --validate can audit BOOT_CONTRACTS the same way it audits routers.
    stamp_freshness(data, threshold_seconds=int(threshold_seconds))
    atomic_write_yaml(path, data, yaml_instance=dumper)
    return True
