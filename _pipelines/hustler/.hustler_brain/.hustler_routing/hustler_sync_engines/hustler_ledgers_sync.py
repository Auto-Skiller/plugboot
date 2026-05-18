"""
hustler_ledgers_sync.py
=======================
v5.4 path-aligned. Reads per-focus split ledgers in hustler_ledgers/:
  - [focus].focus_ledger.yaml    → strategic rollup (products/features + market context)
  - [focus].sources_ledger.yaml  → anti-duplication tracker for sources cascaded into focus
Plus the .hustler_mixed_inbox.ledger.yaml for items in
_HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/. Aggregates totals into the
auto-generated component router at .hustler_routing/hustler_ledgers.yaml.
There is no separate master rollup file — the router IS the rollup.
"""
import re
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

LEDGERS_DIR = WORKSPACE_ROOT / "_pipelines" / "hustler" / ".hustler_brain" / "hustler_ledgers"
MIXED_INBOX_LEDGER = LEDGERS_DIR / ".hustler_mixed_inbox.ledger.yaml"
LEDGERS_ROUTER = WORKSPACE_ROOT / "_pipelines" / "hustler" / ".hustler_brain" / ".hustler_routing" / "hustler_ledgers.yaml"
MIXED_INBOX_DIR = WORKSPACE_ROOT / "_pipelines" / "hustler" / "_HUSTLER-EXTERNAL_SOURCES" / ".hustler_mixed_inbox"
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
    """GAP-EXT-4 (Hustler symmetric): refresh metadata.last_updated on every
    save so the timestamp can't rot under hand-edits. The summary block
    already updates every cycle; without this stamp, the metadata header
    lies about it."""
    if not isinstance(data, dict):
        return
    meta = data.setdefault("metadata", {})
    meta["last_updated"] = datetime.now().isoformat()


def discover_focuses():
    """Return list of focus_ids based on focus_ledger files in hustler_ledgers/.
    A focus exists iff [focus].focus_ledger.yaml exists in the ledgers folder."""
    if not LEDGERS_DIR.exists():
        return []
    focuses = []
    pat = re.compile(r"^([\w-]+)\.focus_ledger\.yaml$")
    for item in sorted(LEDGERS_DIR.iterdir()):
        if not item.is_file(): continue
        m = pat.match(item.name)
        if m:
            focuses.append(m.group(1))
    return focuses


def process_focus(focus_id, dry_run):
    focus_path = LEDGERS_DIR / f"{focus_id}.focus_ledger.yaml"
    sources_path = LEDGERS_DIR / f"{focus_id}.sources_ledger.yaml"

    focus_data = load_yaml(focus_path) or {}
    sources_data = load_yaml(sources_path) or {}

    # Focus ledger holds tracked_products + tracked_features (strategic)
    focus_state = focus_data.get("state") or {}
    products = focus_state.get("tracked_products", []) or []
    features = focus_state.get("tracked_features", []) or []

    # Sources ledger holds tracked_sources (anti-duplication for inbound cascades)
    sources_state = sources_data.get("state") or {}
    tracked_sources = sources_state.get("tracked_sources", []) or []

    # Update focus summary
    if "state" not in focus_data: focus_data["state"] = {}
    focus_data["state"].setdefault("tracked_products", [])
    focus_data["state"].setdefault("tracked_features", [])
    focus_data["state"]["summary"] = {
        "total_products": len(products),
        "pending_products": sum(1 for p in products if p.get("status") in (None, "PENDING")),
        "validated_products": sum(1 for p in products if p.get("status") == "VALIDATED"),
        "total_features": len(features),
        "pending_features": sum(1 for f in features if f.get("status") in (None, "PENDING")),
        "validated_features": sum(1 for f in features if f.get("status") == "VALIDATED"),
    }

    # Update sources summary
    if "state" not in sources_data: sources_data["state"] = {}
    sources_data["state"].setdefault("tracked_sources", [])
    sources_data["state"]["summary"] = {
        "total_sources": len(tracked_sources),
    }

    if not dry_run:
        # GAP-EXT-4: refresh metadata header timestamp on every save.
        _stamp_ledger_metadata(focus_data)
        _stamp_ledger_metadata(sources_data)
        save_yaml(focus_path, focus_data)
        save_yaml(sources_path, sources_data)

    return {
        "products": len(products),
        "features": len(features),
        "tracked_sources": len(tracked_sources),
    }


def process_mixed_inbox(dry_run):
    if not MIXED_INBOX_LEDGER.exists():
        return {"total_pending": 0, "total_cascaded": 0}

    data = load_yaml(MIXED_INBOX_LEDGER) or {}
    state = data.get("state") or {}
    tracked = state.get("tracked_items", []) or []
    history = state.get("history", []) or []

    # Count on-disk pending too — fallback if tracked_items wasn't populated
    on_disk_pending = 0
    if MIXED_INBOX_DIR.exists():
        on_disk_pending = sum(1 for f in MIXED_INBOX_DIR.iterdir() if f.is_file() and f.name != ".gitkeep")

    pending = max(
        sum(1 for t in tracked if t.get("status") in (None, "PENDING")),
        on_disk_pending,
    )
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
    print("\n[*] Synchronizing hustler_ledgers.yaml rollup (v5.4 split-ledger model)...")
    if not LEDGERS_DIR.exists():
        print("  [ERR] hustler_ledgers directory not found.")
        return False

    focuses = discover_focuses()
    summaries = {}
    total_products = 0
    total_features = 0

    for f_id in focuses:
        s = process_focus(f_id, dry_run)
        summaries[f_id] = s
        total_products += s["products"]
        total_features += s["features"]
        print(f"  [OK]  Processed focus: {f_id} (Products: {s['products']}, Features: {s['features']}, Sources: {s['tracked_sources']})")

    mixed = process_mixed_inbox(dry_run)
    print(f"  [OK]  Processed .hustler_mixed_inbox.ledger.yaml (Pending: {mixed['total_pending']}, Cascaded: {mixed['total_cascaded']})")

    # Component router (the rollup — no separate master file)
    router = {
        "name": "hustler_ledgers_router",
        "schema_version": "2.0",
        "description": "Rollup index for the v5.4 split-ledger model. Aggregates per-focus focus/sources ledgers + the mixed-inbox ledger.",
        "discoveries": {
            "aggregates": {
                "total_focuses": len(focuses),
                "total_products": total_products,
                "total_features": total_features,
                # mixed_inbox count lives only under the canonical mixed_inbox block below (H9 dedup)
            },
            "focuses": summaries,
        },
        "mixed_inbox": {
            "ledger_path": "_pipelines/hustler/.hustler_brain/hustler_ledgers/.hustler_mixed_inbox.ledger.yaml",
            "pending": mixed["total_pending"],
            "cascaded": mixed["total_cascaded"],
        },
    }

    if dry_run:
        print("  [DRY-RUN] Would write hustler_ledgers.yaml component router.")
    else:
        # GAP-FRESH-INNER fix: stamp freshness on the rollup so the master
        # --validate sweep treats it as a first-class router.
        if _stamp_freshness is not None:
            _stamp_freshness(router, threshold_seconds=1800)
        save_yaml(LEDGERS_ROUTER, router)
        print("  [+] Successfully synchronized and wrote hustler_ledgers.yaml component router.")

    return True


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    if run_under_workspace_lock is not None:
        sys.exit(run_under_workspace_lock(sync_ledgers, workspace_root=WORKSPACE_ROOT, dry_run=dry_run))
    ok = sync_ledgers(dry_run)
    sys.exit(0 if ok else 1)
