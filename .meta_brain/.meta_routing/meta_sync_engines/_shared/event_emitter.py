"""
OS-wide Event Emitter (Agentic OS v5.6 — Event_Vocabulary live contract)
========================================================================

Why this exists
---------------
``Event_Vocabulary.md`` declared 14 OS-wide event names with explicit
"Emitted by" columns, but no engine actually emitted any of them. Same
root-cause class as the C4 pending-evolutions rollup before it landed:
doc-first design where the implementation never followed.

This module makes the catalogue's high-leverage subset live. Initial
implementation scope (G9/scoped Option A):

  * ``META_SYNC_FAILED``     — emitted by ``meta_sync.sync()`` when
                                 ``_do_sync`` raises. Most valuable event
                                 because a silent sync failure leaves no
                                 audit trail beyond stderr.
  * ``SESSION_OPENED``       — emitted by ``milestones_sync`` when a new
                                 session folder appears.
  * ``SESSION_CLOSED``       — emitted by ``milestones_sync`` when
                                 ``maybe_promote_session_status`` flips a
                                 session from ``active`` to ``completed``.
  * ``EVOLUTION_TRIGGERED``  — emitted by
                                 ``state_helpers.append_pending_evolution``
                                 every time a proposal is queued.

Other events in the catalogue (`META_SYNC_STARTED`, `META_SYNC_COMPLETED`,
`GOAL_PROGRESSED`, mode-related events, scope-suggestion events) remain
reserved — see ``Event_Vocabulary.md §5`` for the live/reserved split.

Design
------
The emitter writes canonical ``[<ISO>] <EVENT_NAME>: <summary>`` lines
into ``CONTROLER.communication_hubs.<hub>.recent_events``. Cap and line-
length truncation are handled by ``trim_recent_events()`` later in the
master sync; the emitter does not pre-truncate.

Concurrency contract
--------------------
* Writes go through ``atomic_io.atomic_write_yaml``.
* When the master sync is mid-cycle (``META_SYNC_LOCK_HELD=1``), the
  emitter skips re-acquisition — same etiquette as
  ``append_pending_evolution`` and the sub-engines.
* When called from outside a sync (e.g. an agent queueing an evolution),
  the emitter acquires the master lock for the duration of the
  read/mutate/write. This is rare and short, so contention is negligible.

Hub routing (per ``Event_Vocabulary §2.4``)
-------------------------------------------
* ``INFO``      → ``system_hub.recent_events`` only.
* ``WARN``      → ``system_hub.recent_events`` + the named extra hub's
                  ``messages[]``.
* ``ERROR``     → same as WARN.
* ``CRITICAL``  → ``system_hub.recent_events`` + ``messages[]`` on every
                  hub the workspace declares (system, scaler, hustler,
                  core).

Failure mode
------------
The emitter is best-effort. If CONTROLER.yaml is missing, unreadable,
or the lock can't be acquired within the timeout, the emitter logs to
stderr and returns False. It NEVER raises into a sub-engine, because
the caller (a sync engine or an agent) should not crash because logging
to recent_events failed.
"""
from __future__ import annotations

import os
import pathlib
import sys
from datetime import datetime
from typing import Iterable

# Severities used in this module. Mirrored from Event_Vocabulary.md §2.4 so
# any drift between the catalogue and the emitter is impossible.
VALID_SEVERITIES = ("INFO", "WARN", "ERROR", "CRITICAL")

# All hubs that ``CRITICAL`` events fan out to. Kept here as a single list
# so adding a new hub later is a one-line edit. The actual presence of each
# hub in CONTROLER is checked at write time — a missing hub is skipped, not
# created (no schema sprawl).
ALL_HUBS_FOR_CRITICAL = ("system_hub", "scaler_hub", "hustler_hub", "core_hub")


def _now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def _format_canonical_line(event_name: str, summary: str) -> str:
    """Build the ``[<ISO>] <EVENT_NAME>: <summary>`` string from §3 of the
    Event Vocabulary. Trim line length is handled by trim_recent_events().
    """
    return f"[{_now_iso()}] {event_name}: {summary}"


def _build_structured_message(
    event_name: str,
    severity: str,
    payload: dict | None,
    ack_required: bool,
) -> dict:
    """Build the structured form for ``communication_hubs.<hub>.messages[]``
    declared in ``Event_Vocabulary §3``.
    """
    return {
        "event": event_name,
        "severity": severity,
        "at": _now_iso(),
        "payload": dict(payload) if payload else {},
        "ack_required": bool(ack_required),
    }


def emit_os_event(
    workspace_root: pathlib.Path,
    *,
    event_name: str,
    severity: str,
    summary: str,
    payload: dict | None = None,
    extra_hubs: Iterable[str] = (),
    ack_required: bool = False,
    sync_lock_timeout_seconds: int | None = None,
    sync_lock_stale_seconds: int | None = None,
) -> bool:
    """Emit an OS-wide event into CONTROLER.yaml.

    Parameters
    ----------
    workspace_root : pathlib.Path
        Workspace root, e.g. ``WORKSPACE_ROOT`` from any sync engine.
    event_name : str
        Canonical event name from ``Event_Vocabulary.md``. The emitter does
        not validate against the catalogue (intentional — the catalogue is
        markdown), but invariably violating it makes the audit log
        unreadable.
    severity : str
        One of ``INFO``, ``WARN``, ``ERROR``, ``CRITICAL``.
    summary : str
        One-line human-readable summary. Will be truncated to
        ``recent_event_summary_max_chars`` later by ``trim_recent_events``.
    payload : dict, optional
        Structured payload for ``messages[]`` (used for WARN/ERROR/CRITICAL).
        Ignored for INFO.
    extra_hubs : iterable of str, optional
        Additional hubs to receive a ``messages[]`` entry beyond
        ``system_hub.recent_events`` (which always gets the canonical line
        regardless of severity).
    ack_required : bool, optional
        Whether the structured message blocks until a human acknowledges.
        Defaults to False.
    sync_lock_timeout_seconds, sync_lock_stale_seconds : int, optional
        Override the default lock budgets. Mostly useful for tests.

    Returns
    -------
    bool
        True on success, False if CONTROLER is missing/unreadable, the lock
        can't be acquired, or any other recoverable error happens.
    """
    if severity not in VALID_SEVERITIES:
        print(
            f"[event_emitter] invalid severity {severity!r} for {event_name!r}; skipping.",
            file=sys.stderr,
        )
        return False

    controler_path = workspace_root / "CONTROLER.yaml"
    if not controler_path.exists():
        return False

    if sync_lock_timeout_seconds is None:
        sync_lock_timeout_seconds = 30
    if sync_lock_stale_seconds is None:
        sync_lock_stale_seconds = 120

    # Local imports keep this module cheap when callers only want the
    # constants. Also avoids circular-import surprises with state_helpers.
    #
    # Hybrid import: works both when this module is loaded as part of the
    # ``meta_sync_engines._shared`` package (master sync) AND when it's
    # loaded after ``sys.path.insert(0, .../_shared)`` makes its peers
    # top-level modules (sub-engines like milestones_sync.py). Sub-engines
    # cannot use ``from . import`` — there is no parent package on their
    # sys.path. ImportError below triggers the fallback.
    try:
        from . import sync_lock as _sync_lock
        from . import atomic_io as _atomic_io
        from . import engine_bootstrap as _engine_bootstrap
    except ImportError:
        import sync_lock as _sync_lock  # type: ignore[no-redef]
        import atomic_io as _atomic_io  # type: ignore[no-redef]
        import engine_bootstrap as _engine_bootstrap  # type: ignore[no-redef]

    canonical_line = _format_canonical_line(event_name, summary)

    # Determine which hubs receive a structured message (separate from the
    # canonical line, which always lands in system_hub.recent_events).
    if severity == "CRITICAL":
        message_hubs: tuple[str, ...] = tuple(ALL_HUBS_FOR_CRITICAL)
    elif severity in {"WARN", "ERROR"}:
        message_hubs = tuple(set(("system_hub", *extra_hubs)))
    else:  # INFO
        message_hubs = ()

    structured = _build_structured_message(
        event_name=event_name,
        severity=severity,
        payload=payload,
        ack_required=ack_required,
    )

    def _do_emit() -> bool:
        try:
            data = _atomic_io.atomic_read_yaml(controler_path)
        except Exception as exc:  # noqa: BLE001 — best-effort logger
            print(
                f"[event_emitter] could not read CONTROLER for {event_name!r}: {exc}",
                file=sys.stderr,
            )
            return False
        if not isinstance(data, dict):
            return False

        hubs = data.setdefault("communication_hubs", {})
        # Canonical line always lands on system_hub.recent_events.
        system_hub = hubs.setdefault("system_hub", {})
        events_list = system_hub.get("recent_events")
        if not isinstance(events_list, list):
            events_list = []
        events_list.append(canonical_line)
        system_hub["recent_events"] = events_list

        # Structured messages for non-INFO severities.
        for hub_name in message_hubs:
            hub = hubs.get(hub_name)
            if not isinstance(hub, dict):
                # Don't auto-create unknown hubs; system_hub is already
                # ensured above. Missing hubs are skipped silently.
                continue
            messages_list = hub.get("messages")
            if not isinstance(messages_list, list):
                messages_list = []
            messages_list.append(structured)
            hub["messages"] = messages_list

        try:
            _atomic_io.atomic_write_yaml(controler_path, data)
        except Exception as exc:  # noqa: BLE001
            print(
                f"[event_emitter] failed to write CONTROLER for {event_name!r}: {exc}",
                file=sys.stderr,
            )
            return False
        return True

    holding = os.environ.get("META_SYNC_LOCK_HELD") == "1"
    if holding:
        return _do_emit()

    lock_path = _engine_bootstrap.workspace_lock_path(workspace_root)
    try:
        with _sync_lock.with_lock(
            lock_path,
            stale_seconds=sync_lock_stale_seconds,
            timeout_seconds=sync_lock_timeout_seconds,
        ):
            return _do_emit()
    except _sync_lock.SyncLockBusy as exc:
        print(
            f"[event_emitter] sync lock busy while emitting {event_name!r}: {exc}",
            file=sys.stderr,
        )
        return False
