import os
import sys
import pathlib
from datetime import datetime, timedelta
from ruamel.yaml import YAML

# Force UTF-8 stdout — CONTROLER values contain emoji that would otherwise
# crash Windows cp1252.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

yaml = YAML()
yaml.preserve_quotes = True

# ─── GAP-WORKSPACE-ROOT + GAP-SUB-LOCK fixes ────────────────────────────────
_THIS = pathlib.Path(__file__).resolve()
_ENGINES_PARENT = _THIS.parent.parent.parent.parent.parent.parent  # legacy fallback
_BOOTSTRAP_DIR = _ENGINES_PARENT / ".meta_brain" / ".meta_routing" / "meta_sync_engines" / "_shared"
sys.path.insert(0, str(_BOOTSTRAP_DIR))
try:
    from engine_bootstrap import find_workspace_root, run_under_workspace_lock  # noqa: E402
    WORKSPACE_ROOT = find_workspace_root(_THIS)
except Exception:
    WORKSPACE_ROOT = _ENGINES_PARENT
    run_under_workspace_lock = None  # type: ignore

# Single source of truth for scaler state — lives only in routing.
SCALER_STATE = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain" / ".scaler_routing" / "scaler_state.yaml"
CONTROLER_PATH = WORKSPACE_ROOT / "CONTROLER.yaml"
MILESTONES_DIR = WORKSPACE_ROOT / ".meta_brain" / "milestones"
# GAP-EXT-3: external sources root (mixed inbox + typed inboxes).
EXTERNAL_SOURCES_DIR = WORKSPACE_ROOT / "_pipelines" / "_scaler" / "_SCALER-EXTERNAL_SOURCES"
MIXED_INBOX_DIR = EXTERNAL_SOURCES_DIR / ".scaler_mixed_inbox"
TYPED_INBOXES = {
    "Foundational_Integrity": EXTERNAL_SOURCES_DIR / "_Foundational_Integrity_inbox",
    "Operational_Muscles": EXTERNAL_SOURCES_DIR / "_Operational_Muscles_inbox",
    "Value_Generation": EXTERNAL_SOURCES_DIR / "_Value_Generation_inbox",
}

# Reach the workspace-shared atomic writer so partial writes can't corrupt state.
SHARED_DIR = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "meta_sync_engines" / "_shared"
sys.path.insert(0, str(SHARED_DIR))
try:
    from atomic_io import atomic_write_yaml  # noqa: E402
except Exception:
    atomic_write_yaml = None  # graceful fallback if shared layer is missing
try:
    from freshness import stamp_freshness as _stamp_freshness  # noqa: E402
except Exception:
    _stamp_freshness = None


def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def save_yaml(path, data):
    """Atomic write (M1) with graceful fallback for early-bootstrap calls."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if atomic_write_yaml is not None:
        atomic_write_yaml(path, data, yaml_instance=yaml)
        return
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(data, f)


# ─── A1 + G3 + G14: resolve EVERY active scaler session, not just the first.
def resolve_active_scaler_sessions():
    """Return a list of {session_name, current_round, max_rounds} dicts for
    every active session whose physical SESSION.yaml declares pipeline=='scaler'.

    Why a list: under multi-session multi-hour operation, two scaler sessions
    can be active in parallel (e.g. SES-SCALER-GROWTH cycling rounds while a
    SES-SCALER-EXECUTION lands a structural fix). The previous implementation
    returned the first match and silently dropped the rest.
    """
    controler = load_yaml(CONTROLER_PATH)
    if not controler:
        return []
    matches = []
    for session in (controler.get("active_sessions") or []):
        s_name = session.get("session_name")
        if not s_name:
            continue
        if session.get("session_status") not in (None, "active"):
            continue
        session_yaml = MILESTONES_DIR / s_name / "SESSION.yaml"
        if not session_yaml.exists():
            continue
        sdata = load_yaml(session_yaml) or {}
        meta = sdata.get("metadata") or {}
        if str(meta.get("pipeline", "")).strip().lower() != "scaler":
            continue
        persistence = meta.get("persistence") or {}
        matches.append({
            "session_name": s_name,
            "current_round": persistence.get("current_round"),
            "max_rounds": persistence.get("max_rounds"),
        })
    return matches


def _deep_plain(node):
    """Recursively coerce ruamel CommentedMap / CommentedSeq trees into plain
    dict / list. The Hustler engine has the exact same helper for the exact
    same reason — without this, mixing nodes from CONTROLER into scaler_state
    can leak anchors / flow_style and corrupt the output. GAP-EXT-2 fix mirrors
    the Hustler implementation."""
    if isinstance(node, dict):
        return {str(k): _deep_plain(v) for k, v in node.items()}
    if isinstance(node, (list, tuple)):
        return [_deep_plain(v) for v in node]
    return node


def resolve_active_mode_from_controler():
    """GAP-EXT-2: Mirror CONTROLER.modes.scaler into scaler_state.active_mode
    every cycle. The Hustler engine does this; the Scaler engine never did,
    so two agents reading scaler_state mid-session could see a stale mode
    after any CONTROLER edit. Returns the same shape the existing scaler
    runbooks expect: ``{action_gate, input_mode, target_pillar, work_mode,
    profiles}`` (profiles is None unless CONTROLER uses the granular form).
    """
    controler = load_yaml(CONTROLER_PATH)
    if not controler:
        return None
    scaler_mode = ((controler.get("modes") or {}).get("scaler") or {})
    if not scaler_mode:
        return None
    out = {}
    work_mode = scaler_mode.get("work_mode")
    if work_mode is not None:
        out["work_mode"] = work_mode
    input_mode = scaler_mode.get("input_mode")
    if input_mode is not None:
        out["input_mode"] = input_mode
    profiles = scaler_mode.get("profiles")
    if profiles is not None:
        out["profiles"] = _deep_plain(profiles)
    # Legacy single-list action_gate, kept for back-compat. The Scaler runbook
    # (Modes.md / Scaler-Architecture §5) uses the per-pillar action_gate
    # under profiles[INTERNAL|EXTERNAL] when modes are granular; otherwise
    # we mirror whatever flat shape the CONTROLER carries.
    action_gate = scaler_mode.get("action_gate")
    if action_gate is not None:
        out["action_gate"] = _deep_plain(action_gate)
    target_pillar = scaler_mode.get("target_pillar")
    if target_pillar is not None:
        out["target_pillar"] = target_pillar
    return out


def count_external_pending() -> dict:
    """GAP-EXT-3: Read the disk directly so files dropped into the inboxes
    during a multi-hour run are visible immediately, not only after a cascade
    has logged them. The Hustler engine has the same pattern. Returns counts
    keyed by source so the runbook's Phase 1 "staging scan first" rule has a
    machine-readable signal."""
    def _count(d: pathlib.Path) -> int:
        if not d.exists():
            return 0
        return sum(1 for f in d.iterdir() if f.is_file() and f.name != ".gitkeep")
    counts = {
        "mixed_inbox": _count(MIXED_INBOX_DIR),
    }
    for pillar, path in TYPED_INBOXES.items():
        counts[f"{pillar}_inbox"] = _count(path)
    counts["total_pending"] = sum(v for k, v in counts.items() if k != "total_pending")
    return counts


def heal_stuck_audit_lock(state: dict) -> bool:
    """GAP-EXT-1: If a previous Audit Pass crashed mid-run, the runbook-defined
    ``audit_in_progress: true`` lock stays forever and blocks every future
    audit in every session. The runbook gives us all the information we need
    to detect this: ``last_audit.started_at`` (ISO timestamp) plus
    ``audit_policy.audit_check_timeout_seconds`` (per-check budget). Six
    checks × per-check budget × 1.5 safety margin = the longest a healthy
    audit can ever take; anything older than that is a corpse, and we
    self-heal it.

    Returns True when the lock was healed (and the caller should save).
    """
    s = (state or {}).get("state") or {}
    if not s.get("audit_in_progress"):
        return False
    last_audit = s.get("last_audit") or {}
    started_at = last_audit.get("started_at")
    completed_at = last_audit.get("completed_at")
    # If a completed_at exists with the same start time, the lock is just
    # forgotten housekeeping — heal it.
    if completed_at and started_at and completed_at >= started_at:
        s["audit_in_progress"] = False
        print("  [+] healed stuck audit lock: completed_at present without lock release")
        return True
    if not isinstance(started_at, str) or not started_at:
        # Lock=true but no start timestamp at all — that's an orphan from an
        # earlier crash before started_at could be written. Heal.
        s["audit_in_progress"] = False
        print("  [+] healed orphan audit lock: started_at missing while lock=true")
        return True
    try:
        started_dt = datetime.fromisoformat(started_at)
    except ValueError:
        s["audit_in_progress"] = False
        print(f"  [+] healed audit lock with unparseable started_at={started_at!r}")
        return True
    policy = s.get("audit_policy") or {}
    per_check_seconds = int(policy.get("audit_check_timeout_seconds", 300))
    # 6 checks per the runbook; safety multiplier ×1.5 keeps the heal from
    # firing on a slow but legitimate audit.
    max_audit_seconds = int(per_check_seconds * 6 * 1.5)
    age = (datetime.now() - started_dt).total_seconds()
    if age > max_audit_seconds:
        s["audit_in_progress"] = False
        print(f"  [+] healed stuck audit lock: started_at={started_at} age={int(age)}s > budget {max_audit_seconds}s")
        return True
    return False


def sync_state(dry_run=False):
    print("\n[*] Synchronizing scaler_state.yaml...")

    # 1. Scan target gateways for pending proposals.
    # Post-restructure (v5.3) layout: gateway folders are FLAT at the pipeline root
    # as `[Pillar]_external_proposals/` and `[Pillar]_internal_proposals/`.
    pillars = ["Foundational_Integrity", "Operational_Muscles", "Value_Generation"]
    pending_proposals = []

    for p in pillars:
        # Scan EXTERNAL gateway (flat)
        ext_gateway_dir = WORKSPACE_ROOT / "_pipelines" / "_scaler" / f"{p}_external_proposals"
        if ext_gateway_dir.exists():
            for f in ext_gateway_dir.glob("PROPOSAL-*.yaml"):
                pending_proposals.append(str(f.relative_to(WORKSPACE_ROOT)).replace("\\", "/"))

        # Scan INTERNAL gateway (flat)
        int_gateway_dir = WORKSPACE_ROOT / "_pipelines" / "_scaler" / f"{p}_internal_proposals"
        if int_gateway_dir.exists():
            for f in int_gateway_dir.glob("MEGA-INT-*.yaml"):
                pending_proposals.append(str(f.relative_to(WORKSPACE_ROOT)).replace("\\", "/"))

    print(f"  [OK]  Scanned gateways. Found {len(pending_proposals)} pending proposals/action cards.")

    # 2. Update scaler_state.yaml (single source of truth in routing)
    scaler_state = load_yaml(SCALER_STATE)
    if not scaler_state:
        scaler_state = {
            "name": "scaler_state",
            "state": {
                "current_phase": "Discovery",
                "active_mode": {
                    "action_gate": {"EXECUTION": [], "PLANNING": ["FULL"]},
                    "input_mode": "AUTO",
                    "target_pillar": "AUTO"
                },
                "gateway_metrics": {}
            },
            "telemetry": {
                "systems_scaled": 0,
                "proposals_generated": 0,
                "solutions_generated": 0
            }
        }

    if "state" not in scaler_state: scaler_state["state"] = {}
    if "gateway_metrics" not in scaler_state["state"]: scaler_state["state"]["gateway_metrics"] = {}

    scaler_state["state"]["gateway_metrics"]["pending_approvals_count"] = len(pending_proposals)
    scaler_state["state"]["gateway_metrics"]["active_proposals"] = pending_proposals

    # A1 + G3 + G14: resolve EVERY active CONTROLER session linked to this pipeline.
    sessions = resolve_active_scaler_sessions()
    scaler_state["state"]["active_sessions"] = sessions

    # Backwards-compatible singular fields. They mirror the FIRST entry so older
    # tools keep working; explicitly cleared when the list is empty.
    if sessions:
        primary = sessions[0]
        scaler_state["state"]["active_session"] = primary["session_name"]
        if primary.get("current_round") is not None:
            scaler_state["state"]["current_round"] = primary["current_round"]
        if primary.get("max_rounds") is not None:
            scaler_state["state"]["max_rounds"] = primary["max_rounds"]
        rounds_repr = ", ".join(
            f"{s['session_name']} ({s.get('current_round')}/{s.get('max_rounds')})" for s in sessions
        )
        print(f"  [OK]  Linked {len(sessions)} session(s): {rounds_repr}")
    else:
        for k in ("active_session", "current_round", "max_rounds"):
            scaler_state["state"].pop(k, None)
        print("  [OK]  No active scaler session in CONTROLER (cleared linkage)")

    # Update Telemetry gateway info
    if "telemetry" not in scaler_state: scaler_state["telemetry"] = {}
    scaler_state["telemetry"]["gateway"] = {
        "pending_approvals": len(pending_proposals),
        "last_action": scaler_state["state"]["gateway_metrics"].get("last_gateway_action", ""),
        "integration_queue": 0
    }

    # GAP-EXT-2: Mirror CONTROLER.modes.scaler into state.active_mode every
    # cycle. Without this, two agents reading scaler_state mid-session see
    # different views of the active mode after any CONTROLER edit.
    mode_snapshot = resolve_active_mode_from_controler()
    if mode_snapshot is not None:
        scaler_state["state"]["active_mode"] = mode_snapshot
        wm = mode_snapshot.get("work_mode")
        wm_ascii = (str(wm).encode("ascii", "replace").decode("ascii")
                    if wm is not None else "None")
        if "profiles" in mode_snapshot:
            phases = list(mode_snapshot["profiles"].keys()) if isinstance(mode_snapshot["profiles"], dict) else []
            print(f"  [OK]  Mirrored CONTROLER.modes.scaler: work_mode={wm_ascii}, profiles={phases}")
        else:
            print(f"  [OK]  Mirrored CONTROLER.modes.scaler: work_mode={wm_ascii}, "
                  f"input_mode={mode_snapshot.get('input_mode')}, target_pillar={mode_snapshot.get('target_pillar')}")

    # GAP-EXT-3: Read the disk directly so files dropped during a multi-hour
    # run are visible to the runbook's "staging scan first" rule even before
    # any cascade logs them. Hustler does this for its mixed inbox; we do it
    # for our 4 inboxes (mixed + 3 typed).
    inbox_counts = count_external_pending()
    scaler_state.setdefault("telemetry", {}).setdefault("metrics", {})
    scaler_state["telemetry"]["metrics"]["external_pending"] = inbox_counts
    print(f"  [OK]  External inbox pending counts: {inbox_counts}")

    # GAP-EXT-1: Self-heal a stuck audit_in_progress lock so a crashed audit
    # never blocks every future audit forever. Detection is bounded by
    # audit_check_timeout_seconds × 6 checks × 1.5 safety margin.
    heal_stuck_audit_lock(scaler_state)

    if dry_run:
        print("  [DRY-RUN] Would update scaler_state.yaml in routing.")
    else:
        # GAP-FRESH-INNER fix: stamp freshness so agents reading scaler_state
        # mid-session can detect staleness via is_fresh(), same contract as
        # every workspace router.
        if _stamp_freshness is not None:
            _stamp_freshness(scaler_state, threshold_seconds=1800)
        save_yaml(SCALER_STATE, scaler_state)
        print("  [+] Synchronized scaler_state.yaml (routing).")

    return True

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    if run_under_workspace_lock is not None:
        sys.exit(run_under_workspace_lock(sync_state, workspace_root=WORKSPACE_ROOT, dry_run=dry_run))
    ok = sync_state(dry_run)
    sys.exit(0 if ok else 1)
