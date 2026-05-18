"""
scaler_ledgers_sync.py
======================
v5.4 split-ledger model. Per-pillar ledgers are split into two files:
  - [Pillar].sources_ledger.yaml   → tracked_discoveries[] (raw EXTERNAL items, anti-duplication)
  - [Pillar].proposals_ledger.yaml → tracked_gaps[] + history[] (gateway cards)

The mixed-inbox has its own dedicated file:
  - .scaler_mixed_inbox.ledger.yaml → tracked_items[] for items still in
    .scaler_mixed_inbox/ awaiting cascade.

This script reads each split file, computes per-file summary blocks, and
aggregates totals into the auto-generated component router at
.scaler_routing/scaler_ledgers.yaml.

Counter rules (carried over from v5.3 G1/G2/G10 fixes):
  - resolved_gaps counts ONLY history entries with gap_id (not proposal_id-only entries)
  - proposed counts BOTH proposal_ids on tracked_discoveries AND action_card_id in history
  - validate_ledger_entry surfaces malformed entries as warnings (non-fatal)
"""
import sys
import pathlib
from datetime import datetime
from ruamel.yaml import YAML

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

LEDGERS_DIR = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain" / "scaler_ledgers"
LEDGERS_ROUTER = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain" / ".scaler_routing" / "scaler_ledgers.yaml"
SHARED_DIR = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "meta_sync_engines" / "_shared"

sys.path.insert(0, str(SHARED_DIR))
try:
    from atomic_io import atomic_write_yaml  # noqa: E402
except Exception:
    atomic_write_yaml = None
try:
    from freshness import stamp_freshness as _stamp_freshness  # noqa: E402
except Exception:
    _stamp_freshness = None

PILLARS = ["Foundational_Integrity", "Operational_Muscles", "Value_Generation"]
MIXED_INBOX_LEDGER = LEDGERS_DIR / ".scaler_mixed_inbox.ledger.yaml"


def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)


def save_yaml(path, data):
    """Crash-safe YAML write (G-CTRL-5)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if atomic_write_yaml is not None:
        atomic_write_yaml(path, data, yaml_instance=yaml)
        return
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(data, f)


def _stamp_ledger_metadata(data: dict) -> None:
    """GAP-EXT-4: refresh ``metadata.last_updated`` on every save so the
    timestamp can't rot under hand-edits. The summary block already updates
    every cycle; without this stamp, the metadata header lies about it.
    Idempotent — safe to call before every save."""
    if not isinstance(data, dict):
        return
    meta = data.setdefault("metadata", {})
    meta["last_updated"] = datetime.now().isoformat()


def is_gap_entry(entry):
    return isinstance(entry, dict) and bool(entry.get("gap_id"))


def is_proposal_entry(entry):
    return isinstance(entry, dict) and bool(entry.get("proposal_id")) and not entry.get("gap_id")


def validate_ledger_entry(entry, label="entry"):
    warnings = []
    if not isinstance(entry, dict):
        return [f"{label}: expected dict, got {type(entry).__name__}"]
    if is_gap_entry(entry):
        for key in ("gap_id", "primary_aspect", "integration_status"):
            if not entry.get(key):
                warnings.append(f"{label} (gap {entry.get('gap_id', '?')}): missing required key '{key}'")
    elif is_proposal_entry(entry):
        for key in ("proposal_id", "status"):
            if not entry.get(key):
                warnings.append(f"{label} (proposal {entry.get('proposal_id', '?')}): missing required key '{key}'")
    elif "discovery_id" in entry or "source_path" in entry:
        # Source/discovery entry — different schema
        for key in ("discovery_id", "discovery_status"):
            if not entry.get(key):
                warnings.append(f"{label} (discovery {entry.get('discovery_id', '?')}): missing required key '{key}'")
    else:
        warnings.append(f"{label}: entry has no recognizable id (gap_id / proposal_id / discovery_id)")
    return warnings


def process_pillar(pillar, schema_warnings, dry_run):
    """Process one pillar's split ledger pair. Returns the per-pillar summary dict."""
    sources_path = LEDGERS_DIR / f"{pillar}.sources_ledger.yaml"
    proposals_path = LEDGERS_DIR / f"{pillar}.proposals_ledger.yaml"

    sources_data = load_yaml(sources_path) or {}
    proposals_data = load_yaml(proposals_path) or {}

    # Sources ledger: tracked_discoveries[] is the canonical anti-duplication tracker.
    sources_state = sources_data.get("state") or {}
    tracked = sources_state.get("tracked_discoveries", []) or []

    # Proposals ledger: tracked_gaps[] (active) + history[] (resolved gaps + integrated proposals)
    prop_state = proposals_data.get("state") or {}
    tracked_gaps = prop_state.get("tracked_gaps", []) or []
    history = prop_state.get("history", []) or []

    # Validation (non-fatal warnings)
    for i, entry in enumerate(tracked):
        schema_warnings.extend(validate_ledger_entry(entry, f"{pillar}.sources[{i}]"))
    for i, entry in enumerate(tracked_gaps + history):
        schema_warnings.extend(validate_ledger_entry(entry, f"{pillar}.proposals[{i}]"))

    # Discovery counters (over sources_ledger.tracked_discoveries[])
    p_total = len(tracked)
    p_pending = sum(1 for d in tracked if d.get("discovery_status") == "PENDING" or d.get("integration_status") == "PENDING")
    p_integrated = sum(1 for d in tracked if d.get("integration_status") == "INTEGRATED")
    p_rejected = sum(1 for d in tracked if d.get("integration_status") == "REJECTED")

    # Proposed: external (proposal_ids attached to a discovery) + internal (action_card_id in proposals history)
    p_proposed_external = sum(1 for d in tracked if d.get("proposal_ids"))
    p_proposed_internal = sum(1 for h in history if h.get("action_card_id"))
    p_proposed = p_proposed_external + p_proposed_internal

    # Gaps
    p_active_gaps = len(tracked_gaps)
    p_resolved_gaps = sum(1 for h in history if is_gap_entry(h))

    # Write summary blocks back to each ledger (bidirectional sync — P-LAW Bidirectional Local Sync)
    if "metadata" not in sources_data: sources_data["metadata"] = {"type": pillar, "schema_version": "1.0"}
    if "state" not in sources_data: sources_data["state"] = {}
    sources_data["state"].setdefault("tracked_discoveries", [])
    sources_data["state"]["summary"] = {
        "total_discoveries": p_total,
        "pending": p_pending,
        "integrated": p_integrated,
        "rejected": p_rejected,
        "proposed": p_proposed,
    }

    if "metadata" not in proposals_data: proposals_data["metadata"] = {"type": pillar, "schema_version": "1.0"}
    if "state" not in proposals_data: proposals_data["state"] = {}
    proposals_data["state"].setdefault("tracked_gaps", [])
    proposals_data["state"].setdefault("history", [])
    proposals_data["state"]["summary"] = {
        "active_gaps": p_active_gaps,
        "resolved_gaps": p_resolved_gaps,
        "proposed": p_proposed,
    }

    if not dry_run:
        # GAP-EXT-4: refresh metadata header timestamp on every save.
        _stamp_ledger_metadata(sources_data)
        _stamp_ledger_metadata(proposals_data)
        save_yaml(sources_path, sources_data)
        save_yaml(proposals_path, proposals_data)

    return {
        "total_discoveries": p_total,
        "pending": p_pending,
        "integrated": p_integrated,
        "rejected": p_rejected,
        "proposed": p_proposed,
        "active_gaps": p_active_gaps,
        "resolved_gaps": p_resolved_gaps,
    }


def process_mixed_inbox(dry_run):
    """Process the .scaler_mixed_inbox.ledger.yaml standalone file."""
    if not MIXED_INBOX_LEDGER.exists():
        return {"total_pending": 0, "total_cascaded": 0}

    data = load_yaml(MIXED_INBOX_LEDGER) or {}
    state = data.get("state") or {}
    tracked = state.get("tracked_items", []) or []
    history = state.get("history", []) or []

    pending = sum(1 for t in tracked if t.get("status") in (None, "PENDING"))
    cascaded = sum(1 for t in tracked if t.get("status") == "CASCADED") + len(history)

    if "state" not in data: data["state"] = {}
    data["state"]["summary"] = {
        "total_pending": pending,
        "total_cascaded": cascaded,
    }
    if not dry_run:
        _stamp_ledger_metadata(data)
        save_yaml(MIXED_INBOX_LEDGER, data)

    return {"total_pending": pending, "total_cascaded": cascaded}


def sync_ledgers(dry_run=False):
    print("\n[*] Synchronizing scaler_ledgers.yaml rollup (split-ledger model)...")
    if not LEDGERS_DIR.exists():
        print("  [ERR] scaler_ledgers directory not found.")
        return False

    sub_ledger_summaries = {}
    schema_warnings = []
    totals = dict(total_discoveries=0, total_integrated=0, total_pending=0,
                  total_rejected=0, total_proposed=0,
                  total_active_gaps=0, total_resolved_gaps=0)

    for p in PILLARS:
        summary = process_pillar(p, schema_warnings, dry_run)
        sub_ledger_summaries[p] = summary
        totals["total_discoveries"] += summary["total_discoveries"]
        totals["total_integrated"] += summary["integrated"]
        totals["total_pending"] += summary["pending"]
        totals["total_rejected"] += summary["rejected"]
        totals["total_proposed"] += summary["proposed"]
        totals["total_active_gaps"] += summary["active_gaps"]
        totals["total_resolved_gaps"] += summary["resolved_gaps"]
        print(f"  [OK]  Processed sub-ledger: {p} (Discoveries: {summary['total_discoveries']}, Gaps: {summary['active_gaps']}, Proposed: {summary['proposed']})")

    mixed = process_mixed_inbox(dry_run)
    print(f"  [OK]  Processed .scaler_mixed_inbox.ledger.yaml (Pending: {mixed['total_pending']}, Cascaded: {mixed['total_cascaded']})")

    if schema_warnings:
        print("  [WARN] Ledger schema validation reported issues:")
        for w in schema_warnings:
            print(f"         - {w}")

    print(f"  [OK]  Processed internal gaps summary: {{'active_gaps': {totals['total_active_gaps']}, 'resolved_gaps': {totals['total_resolved_gaps']}}}")

    # Auto-generated component router (the rollup — no separate master file)
    router = {
        "name": "scaler_ledgers_router",
        "schema_version": "2.0",
        "description": "Rollup index for the v5.4 split-ledger model. Aggregates per-pillar sources/proposals ledgers + the mixed-inbox ledger.",
        "external_discoveries": {
            "aggregates": {
                "total_discoveries": totals["total_discoveries"],
                "total_integrated": totals["total_integrated"],
                "total_pending": totals["total_pending"],
                "total_rejected": totals["total_rejected"],
                "total_proposed": totals["total_proposed"],
                "total_active_gaps": totals["total_active_gaps"],
                "total_resolved_gaps": totals["total_resolved_gaps"],
            },
            "pillars": sub_ledger_summaries,
        },
        "internal_gaps": {
            "active_gaps": totals["total_active_gaps"],
            "resolved_gaps": totals["total_resolved_gaps"],
        },
        "mixed_inbox": {
            "ledger_path": "_pipelines/_scaler/.scaler_brain/scaler_ledgers/.scaler_mixed_inbox.ledger.yaml",
            "pending": mixed["total_pending"],
            "cascaded": mixed["total_cascaded"],
        },
    }

    if dry_run:
        print("  [DRY-RUN] Would write scaler_ledgers.yaml component router.")
    else:
        # GAP-FRESH-INNER fix: stamp freshness on the rollup so the master
        # validate sweep treats it as a first-class router.
        if _stamp_freshness is not None:
            _stamp_freshness(router, threshold_seconds=1800)
        save_yaml(LEDGERS_ROUTER, router)
        print("  [+] Successfully synchronized and wrote scaler_ledgers.yaml component router.")

    return True


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    if run_under_workspace_lock is not None:
        sys.exit(run_under_workspace_lock(sync_ledgers, workspace_root=WORKSPACE_ROOT, dry_run=dry_run))
    ok = sync_ledgers(dry_run)
    sys.exit(0 if ok else 1)
