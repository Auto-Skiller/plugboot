import os
import sys
import pathlib
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent.parent.parent
LEDGERS_DIR = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain" / "scaler_ledgers"
LEDGERS_ROUTER = WORKSPACE_ROOT / "_pipelines" / "_scaler" / ".scaler_brain" / ".scaler_routing" / "scaler_ledgers.yaml"

def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def save_yaml(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: yaml.dump(data, f)

def sync_ledgers(dry_run=False):
    print("\n[*] Synchronizing scaler_ledgers.yaml rollup...")
    if not LEDGERS_DIR.exists():
        print("  [ERR] scaler_ledgers directory not found.")
        return False

    pillars = ["Foundational_Integrity", "Operational_Muscles", "Value_Generation"]
    sub_ledger_summaries = {}
    
    total_discoveries = 0
    total_integrated = 0
    total_pending = 0
    total_rejected = 0
    total_proposed = 0

    total_active_gaps = 0
    total_resolved_gaps = 0

    # 1. Process each pillar sub-ledger
    for p in pillars:
        ledger_path = LEDGERS_DIR / f"{p}.ledger.yaml"
        ledger_data = load_yaml(ledger_path)
        
        if not ledger_data:
            print(f"  [WARN] Sub-ledger for {p} not found or empty.")
            sub_ledger_summaries[p] = {
                "total_discoveries": 0, "pending": 0, "integrated": 0, "rejected": 0, "proposed": 0,
                "active_gaps": 0, "resolved_gaps": 0
            }
            continue

        state = ledger_data.get("state", {})
        tracked = state.get("tracked_discoveries", [])
        tracked_gaps = state.get("tracked_gaps", [])
        history = state.get("history", [])
        
        # Calculate discoveries states
        p_total = len(tracked)
        p_pending = sum(1 for d in tracked if d.get("discovery_status") == "PENDING" or d.get("integration_status") == "PENDING")
        p_integrated = sum(1 for d in tracked if d.get("integration_status") == "INTEGRATED")
        p_rejected = sum(1 for d in tracked if d.get("integration_status") == "REJECTED")
        p_proposed = sum(1 for d in tracked if d.get("proposal_ids"))

        # Gaps states
        p_active_gaps = len(tracked_gaps)
        p_resolved_gaps = len(history)

        # Write calculations back to sub-ledger state to keep it fully synced
        if "summary" not in state: state["summary"] = {}
        state["summary"]["total_discoveries"] = p_total
        state["summary"]["pending"] = p_pending
        state["summary"]["integrated"] = p_integrated
        state["summary"]["rejected"] = p_rejected
        
        state["summary"]["active_gaps"] = p_active_gaps
        state["summary"]["resolved_gaps"] = p_resolved_gaps

        if "summary" in ledger_data:
            ledger_data["summary"]["proposed"] = p_proposed
        else:
            ledger_data["summary"] = {"proposed": p_proposed}

        if not dry_run:
            save_yaml(ledger_path, ledger_data)

        sub_ledger_summaries[p] = {
            "total_discoveries": p_total,
            "pending": p_pending,
            "integrated": p_integrated,
            "rejected": p_rejected,
            "proposed": p_proposed,
            "active_gaps": p_active_gaps,
            "resolved_gaps": p_resolved_gaps
        }

        total_discoveries += p_total
        total_pending += p_pending
        total_integrated += p_integrated
        total_rejected += p_rejected
        total_proposed += p_proposed

        total_active_gaps += p_active_gaps
        total_resolved_gaps += p_resolved_gaps
        
        print(f"  [OK]  Processed sub-ledger: {p} (Discoveries: {p_total}, Gaps: {p_active_gaps})")

    # 2. Update Master Rollup Ledger: EXTERNAL_INBOX-LEDGER.yaml
    master_ledger_path = LEDGERS_DIR / "EXTERNAL_INBOX-LEDGER.yaml"
    master_data = load_yaml(master_ledger_path)
    if not master_data:
        master_data = {
            "aggregates": {},
            "metadata": {
                "description": "Master rollup ledger. Tracks top-level (D-level) discoveries directly.",
                "schema_version": "3.1"
            },
            "sub_ledgers": {},
            "tracked_discoveries": []
        }

    master_data["aggregates"] = {
        "total_discoveries": total_discoveries,
        "total_integrated": total_integrated,
        "total_pending": total_pending,
        "total_rejected": total_rejected,
        "total_proposed": total_proposed,
        "total_active_gaps": total_active_gaps,
        "total_resolved_gaps": total_resolved_gaps
    }

    # Populate sub_ledgers info inside master rollup
    if "sub_ledgers" not in master_data: master_data["sub_ledgers"] = {}
    for p in pillars:
        if p not in master_data["sub_ledgers"]:
            master_data["sub_ledgers"][p] = {}
        master_data["sub_ledgers"][p]["summary"] = sub_ledger_summaries[p]
        master_data["sub_ledgers"][p]["path"] = f"_pipelines/_scaler/.scaler_brain/scaler_ledgers/{p}.ledger.yaml"

    if not dry_run:
        save_yaml(master_ledger_path, master_data)
        print("  [+] Saved updated EXTERNAL_INBOX-LEDGER.yaml rollup.")

    # 3. Aggregated Gaps Summary
    gaps_summary = {
        "active_gaps": total_active_gaps,
        "resolved_gaps": total_resolved_gaps
    }
    print(f"  [OK]  Processed internal gaps summary: {gaps_summary}")

    # 4. Save component router: scaler_ledgers.yaml
    ledgers_router_data = {
        "name": "scaler_ledgers_router",
        "schema_version": "1.0",
        "description": "Rollup index of all Scaler active ledgers, external discoveries, and internal action paths.",
        "external_discoveries": {
            "aggregates": master_data["aggregates"],
            "pillars": sub_ledger_summaries
        },
        "internal_gaps": gaps_summary
    }

    if dry_run:
        print("  [DRY-RUN] Would write scaler_ledgers.yaml component router.")
    else:
        save_yaml(LEDGERS_ROUTER, ledgers_router_data)
        print("  [+] Successfully synchronized and wrote scaler_ledgers.yaml component router.")

    return True

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    ok = sync_ledgers(dry_run)
    sys.exit(0 if ok else 1)
