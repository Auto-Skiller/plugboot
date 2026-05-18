"""
Pipeline state helpers (Agentic OS v5.5)
========================================
Single home for the singular/plural session mirror invariant declared in
``Session_Template.md §4`` and ``Evolution_Protocol.md §11.LAW-12``.

Why this exists
---------------
Pipeline state files (``scaler_state.yaml``, ``hustler_state.yaml``, future
pipelines) carry both:

  - ``state.active_sessions: [{session_name, current_round, max_rounds}, ...]``
    — the canonical list (Multi-Session Concurrency Law).
  - ``state.active_session: <name>``       — back-compat mirror of the FIRST
  - ``state.current_round: <int>``         entry. These three legacy fields
  - ``state.max_rounds: <int|str>``        exist only so older tools keep working.

Until now, the mirror was opportunistically maintained inside two state-sync
engines (scaler_state_sync.py + hustler_state_sync.py). A third pipeline
that copy-pastes the pattern is one edit away from drifting; a hand-edit to
either field can desynchronise them between syncs (up to 30 minutes of
silent drift). Same root-cause class as GAP-LOCK-PATH-DRIFT and
GAP-BOOT-PATH-DRIFT — duplicated logic with no central enforcement.

Public surface
--------------
* :func:`mirror_singular_session` — write the legacy singular fields from
  ``state.active_sessions[0]``. Idempotent. Handles the empty-list case by
  clearing the singular fields. Returns True if anything changed.
* :func:`assert_session_mirror` — read-only check. Returns ``(ok, message)``.
  Used by ``meta_sync.py --validate`` to fail noisily on disagreement.
* :func:`audit_pipeline_state_files` — walk every pipeline declared in
  ``pipelines.yaml``, locate its state file, run ``assert_session_mirror``,
  and emit ``[ERR]`` / ``[WARN]`` lines. Returns the count of disagreements.

Anti-recurrence
---------------
The next pipeline that needs state imports this helper instead of
copy-pasting the mirror logic. A hand-edit to either field is caught on
the next ``--validate`` run because the audit reads disk truth, not the
last sync's output.
"""
from __future__ import annotations

import pathlib
from typing import Any, Iterable

# Singular fields managed by this helper. Listed here once so a future
# additional legacy field is a single edit (not a five-place find-and-
# replace across both engines).
_LEGACY_SINGULAR_KEYS = ("active_session", "current_round", "max_rounds")


def _state_block(state: Any) -> dict | None:
    """Return the inner ``state:`` mapping, or None if the shape is wrong."""
    if not isinstance(state, dict):
        return None
    s = state.get("state")
    return s if isinstance(s, dict) else None


def mirror_singular_session(state: Any) -> bool:
    """Write the legacy singular session fields from ``active_sessions[0]``.

    ``state`` is the parsed pipeline state file (the top-level dict, not the
    inner ``state:`` block). Mutates in-place. Returns True when the dict
    was modified, False otherwise.

    Empty-list contract: when ``active_sessions`` is empty or missing, the
    legacy keys are removed entirely (rather than left at stale values).
    Engines that need the keys to remain present-with-None can post-process.
    """
    inner = _state_block(state)
    if inner is None:
        return False
    sessions = inner.get("active_sessions")
    changed = False
    if isinstance(sessions, list) and sessions:
        primary = sessions[0]
        if not isinstance(primary, dict):
            return False
        new_values = {
            "active_session": primary.get("session_name"),
            "current_round": primary.get("current_round"),
            "max_rounds": primary.get("max_rounds"),
        }
        for key, value in new_values.items():
            if value is None:
                if inner.pop(key, None) is not None:
                    changed = True
                continue
            if inner.get(key) != value:
                inner[key] = value
                changed = True
    else:
        for key in _LEGACY_SINGULAR_KEYS:
            if inner.pop(key, None) is not None:
                changed = True
    return changed


def assert_session_mirror(state: Any, *, label: str = "<state>") -> tuple[bool, str]:
    """Return ``(ok, message)`` describing the mirror invariant.

    Used by ``meta_sync.py --validate`` to fail noisily when the singular
    fields disagree with ``active_sessions[0]``. Never raises — readers
    decide whether a disagreement is fatal.
    """
    inner = _state_block(state)
    if inner is None:
        return True, f"{label}: no state block — nothing to mirror."
    sessions = inner.get("active_sessions")
    singular_name = inner.get("active_session")
    if not isinstance(sessions, list) or not sessions:
        if singular_name:
            return False, (
                f"{label}: state.active_sessions is empty but state.active_session={singular_name!r}."
                " Run meta_sync.py to clear the legacy singular fields."
            )
        return True, f"{label}: empty active_sessions, singular fields cleared (OK)."
    primary = sessions[0]
    if not isinstance(primary, dict):
        return False, f"{label}: state.active_sessions[0] is not a mapping."
    expected_name = primary.get("session_name")
    if singular_name != expected_name:
        return False, (
            f"{label}: state.active_session={singular_name!r} but "
            f"state.active_sessions[0].session_name={expected_name!r}."
        )
    expected_round = primary.get("current_round")
    actual_round = inner.get("current_round")
    if actual_round is not None and expected_round is not None and actual_round != expected_round:
        return False, (
            f"{label}: state.current_round={actual_round!r} but "
            f"state.active_sessions[0].current_round={expected_round!r}."
        )
    expected_max = primary.get("max_rounds")
    actual_max = inner.get("max_rounds")
    if actual_max is not None and expected_max is not None and actual_max != expected_max:
        return False, (
            f"{label}: state.max_rounds={actual_max!r} but "
            f"state.active_sessions[0].max_rounds={expected_max!r}."
        )
    return True, f"{label}: mirror OK (active_session={singular_name!r})."


def audit_pipeline_state_files(workspace_root: pathlib.Path) -> tuple[int, int, list[str]]:
    """Walk every declared pipeline state file and audit the mirror invariant.

    Returns ``(errors, ok_count, lines)`` where ``lines`` is a list of
    human-readable diagnostic strings the caller can emit straight to
    stdout. Pipelines without a declared state file are simply skipped
    (the engine descriptor itself is what gates inclusion).

    The function intentionally has no side effects — it never writes to
    disk, never acquires the lock. It's safe to call from inside
    ``meta_sync.py --validate``.
    """
    pipelines_yaml = workspace_root / ".meta_brain" / ".meta_routing" / "pipelines.yaml"
    if not pipelines_yaml.exists():
        return 0, 0, ["[INFO] pipelines.yaml not present — no state files to audit."]
    # Local import keeps this module cheap for callers that only need the
    # mutator helpers above.
    try:
        from ruamel.yaml import YAML  # type: ignore
    except Exception:
        return 0, 0, ["[WARN] ruamel.yaml unavailable — cannot audit pipeline state files."]
    safe_yaml = YAML(typ="safe")

    def _read(path: pathlib.Path) -> Any:
        if not path.exists():
            return None
        try:
            with open(path, "r", encoding="utf-8") as fh:
                return safe_yaml.load(fh)
        except Exception as exc:
            return {"__read_error__": str(exc)}

    pipelines_doc = _read(pipelines_yaml) or {}
    pipelines = pipelines_doc.get("pipelines") or {}
    lines: list[str] = []
    errors = 0
    ok_count = 0
    for p_name, p_info in pipelines.items():
        inner_router = p_info.get("path") if isinstance(p_info, dict) else None
        if not inner_router:
            continue
        inner_doc = _read(workspace_root / inner_router) or {}
        engine = inner_doc.get("engine") or {}
        state_rel = engine.get("state_file")
        if not state_rel:
            continue
        state_path = workspace_root / state_rel
        state_doc = _read(state_path)
        if state_doc is None:
            lines.append(f"  [WARN] {p_name}: state file declared but missing -> {state_rel}")
            continue
        if isinstance(state_doc, dict) and "__read_error__" in state_doc:
            lines.append(f"  [WARN] {p_name}: could not read {state_rel}: {state_doc['__read_error__']}")
            continue
        ok, msg = assert_session_mirror(state_doc, label=f"{p_name}::{state_rel}")
        if ok:
            ok_count += 1
        else:
            errors += 1
            lines.append(f"  [ERR]  {msg}")
    return errors, ok_count, lines
