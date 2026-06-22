import os
import sys
import time
import datetime
from pathlib import Path
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True
yaml.indent(mapping=2, sequence=4, offset=2)

WORKSPACE = Path(__file__).parent.parent.parent.parent.resolve()
DB_DIR = WORKSPACE / '.meta_os' / 'meta_db'
SCALER_DB = DB_DIR / 'pipeline_scaler_os.yaml'
SCALER_LEDGERS_DIR = WORKSPACE / 'pipeline_scaler' / '.scaler_os' / 'scaler_db'
SCALER_WORKSPACE = WORKSPACE / 'pipeline_scaler'
SCALER_MILESTONES_DIR = WORKSPACE / 'pipeline_scaler' / '.scaler_os' / 'scaler_milestones'

def safe_read_yaml(file_path):
    if not file_path.exists(): return {}
    for _ in range(5):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return yaml.load(f) or {}
        except Exception:
            time.sleep(0.1)
    return {}

def safe_write_yaml(data, file_path):
    for _ in range(5):
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                yaml.dump(data, f)
            return True
        except Exception:
            time.sleep(0.1)
    return False

def touch_freshness(data, actor='daemon'):
    """Update the freshness block on a DB dict. All pillar engines keep this in sync."""
    if 'system_metadata' not in data:
        data['system_metadata'] = {}
    if 'freshness' not in data['system_metadata']:
        data['system_metadata']['freshness'] = {}
    f = data['system_metadata']['freshness']
    f['last_synced'] = datetime.datetime.now().isoformat()
    f['status'] = 'fresh'
    f['last_synced_by'] = actor

def aggregate_milestones(data, milestones_dir):
    """Walk a pipeline's milestones dir and roll session metadata into data['metadata']['milestones']."""
    if not milestones_dir.exists():
        return
    if 'metadata' not in data:
        data['metadata'] = {}
    if data['metadata'].get('milestones') is None:
        data['metadata']['milestones'] = {}
    # Refresh: rebuild from disk so deleted sessions disappear
    data['metadata']['milestones'] = {}
    for session_dir in milestones_dir.iterdir():
        if session_dir.is_dir() and not session_dir.name.startswith('.'):
            session_yaml = session_dir / f"{session_dir.name}.yaml"
            if session_yaml.exists():
                sd = safe_read_yaml(session_yaml)
                if sd and 'metadata' in sd:
                    data['metadata']['milestones'][session_dir.name] = sd['metadata']

def run_sync():
    if not SCALER_DB.exists():
        return
        
    data = safe_read_yaml(SCALER_DB)
    if not data: return
        
    modes = data.get('metadata', {}).get('modes', {})
    pipeline_status = modes.get('pipeline_status', 'off')
    autosync_status = modes.get('autosync_status', 'on')
    # Pipeline must be on AND autosync must be on (consistency with core engine gate).
    if 'off' in str(pipeline_status).lower():
        return # Pipeline is off
    if 'off' in str(autosync_status).lower():
        return # Autosync disabled by user

    print("[*] Pipeline Scaler Engine: Running exhaustive ledger hydration & sync...")
    
    # Initialize metrics
    global_systems_scaled = 0
    global_proposals_generated = 0
    global_solutions_generated = 0
    global_group_items_logged = 0
    
    pillars = ['Foundational_Integrity', 'Operational_Muscles', 'Value_Generation']
    
    if SCALER_WORKSPACE.exists() and SCALER_LEDGERS_DIR.exists():
        for pillar in pillars:
            proposals_ledger = SCALER_LEDGERS_DIR / f"{pillar}.proposals.yaml"
            if not proposals_ledger.exists(): continue
            
            p_data = safe_read_yaml(proposals_ledger)
            if not p_data: continue
            
            if 'state' not in p_data: p_data['state'] = {}
            if 'metadata' not in p_data: p_data['metadata'] = {}
            if 'metrics' not in p_data['metadata']: p_data['metadata']['metrics'] = {}
            
            # Step A: Scan physical folders
            pillar_dir_internal = SCALER_WORKSPACE / f"{pillar}_internal_proposals"
            pillar_dir_external = SCALER_WORKSPACE / f"{pillar}_external_proposals"
            
            discovered_gaps = []
            discovered_solutions = []
            
            for p_dir in [pillar_dir_internal, pillar_dir_external]:
                if p_dir.exists() and p_dir.is_dir():
                    for card_file in p_dir.glob('**/*.yaml'):
                        rel_path = str(card_file.relative_to(WORKSPACE)).replace('\\', '/')
                        if card_file.name.startswith('MEGA-INT-') or card_file.name.endswith('_solution.yaml'):
                            discovered_solutions.append(rel_path)
                        elif card_file.name.startswith('PROP-EXT-') or card_file.name.endswith('_proposal.yaml'):
                            discovered_gaps.append(rel_path)
                            
            # Step A (cont): Hydrate Ledger State (Actual Work)
            # Physical files dictate state
            p_data['state']['tracked_gaps'] = discovered_gaps
            p_data['state']['history'] = discovered_solutions
            
            # Step B: Ledger State -> Ledger Metadata (OUT Communication)
            metrics = p_data['metadata']['metrics']
            metrics['active_gaps'] = len(discovered_gaps)
            metrics['proposed'] = len(discovered_gaps)
            metrics['resolved_gaps'] = len(discovered_solutions)
            
            # Step D: Pipeline OS DB -> Ledger Metadata (IN Communication)
            if 'hub' in data.get('metadata', {}):
                # Pass targeted messages down
                if 'messages' in data['metadata']['hub']:
                    targeted = [m for m in data['metadata']['hub']['messages'] if pillar in str(m)]
                    if targeted:
                        if 'hub' not in p_data['metadata']: p_data['metadata']['hub'] = {}
                        p_data['metadata']['hub']['messages'] = targeted
                # Pass targeted backlog items down
                if 'backlog' in data['metadata']['hub']:
                    targeted_bl = [b for b in data['metadata']['hub']['backlog'] if pillar in str(b)]
                    if targeted_bl:
                        if 'hub' not in p_data['metadata']: p_data['metadata']['hub'] = {}
                        p_data['metadata']['hub']['backlog'] = targeted_bl

            safe_write_yaml(p_data, proposals_ledger)
            
            # Aggregate to global (Step C)
            global_proposals_generated += metrics['proposed']
            global_solutions_generated += metrics['resolved_gaps']
            global_systems_scaled += len(discovered_solutions)
            
        # Also sum up group_items_logged from sources ledgers
        for sources_ledger in SCALER_LEDGERS_DIR.glob('*.sources.yaml'):
            s_data = safe_read_yaml(sources_ledger)
            if s_data and 'metadata' in s_data and 'metrics' in s_data['metadata']:
                global_group_items_logged += s_data['metadata']['metrics'].get('total_sources', 0)
                
    # Step C (cont): Rollup to pipeline OS DB
    if 'state' not in data['metadata']:
        data['metadata']['state'] = {}
    if 'metrics' not in data['metadata']['state']:
        data['metadata']['state']['metrics'] = {}

    metrics = data['metadata']['state']['metrics']
    old_metrics = dict(metrics)

    metrics['systems_scaled'] = global_systems_scaled
    metrics['proposals_generated'] = global_proposals_generated
    metrics['solutions_generated'] = global_solutions_generated
    metrics['group_items_logged'] = global_group_items_logged

    # --- Log recent_events for this sync cycle ---
    if 'hub' not in data['metadata']: data['metadata']['hub'] = {}
    events = data['metadata']['hub'].setdefault('recent_events', [])
    ts = datetime.datetime.now().strftime('%H:%M')
    events.append(f"[{ts}] Scanned 3 pillars: {global_proposals_generated} gaps, {global_solutions_generated} solutions, {global_systems_scaled} systems scaled")

    # Always aggregate this pipeline's own milestones + refresh freshness.
    # (Previously only the core engine reached in here — a hidden cross-pillar coupling.)
    aggregate_milestones(data, SCALER_MILESTONES_DIR)
    touch_freshness(data, actor='daemon')

    if metrics != old_metrics:
        safe_write_yaml(data, SCALER_DB)
        print("[*] Pipeline Scaler Engine: Sync complete (Metrics & Ledgers Hydrated).")
    else:
        # Still persist freshness + milestone rollup even if metrics unchanged.
        safe_write_yaml(data, SCALER_DB)

def main():
    if '--daemon' in sys.argv:
        print("Pipeline Scaler Engine running in daemon mode (5s polling)...")
        while True:
            run_sync()
            time.sleep(5)
    else:
        run_sync()

if __name__ == '__main__':
    main()
