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
HUSTLER_DB = DB_DIR / 'pipeline_hustler_os.yaml'
HUSTLER_LEDGERS_DIR = WORKSPACE / 'pipeline_hustler' / '.hustler_os' / 'hustler_db'
HUSTLER_WORKSPACE = WORKSPACE / 'pipeline_hustler'
HUSTLER_MILESTONES_DIR = WORKSPACE / 'pipeline_hustler' / '.hustler_os' / 'hustler_milestones'

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
    """Atomic write: dump to temp file, then rename. Prevents corruption under contention."""
    for _ in range(5):
        try:
            tmp_path = file_path.with_suffix(file_path.suffix + '.tmp')
            with open(tmp_path, 'w', encoding='utf-8') as f:
                yaml.dump(data, f)
                f.flush()
                os.fsync(f.fileno())
            if os.name == 'nt':
                if file_path.exists():
                    os.replace(tmp_path, file_path)
                else:
                    tmp_path.replace(file_path)
            else:
                tmp_path.rename(file_path)
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
    data['metadata']['milestones'] = {}
    for session_dir in milestones_dir.iterdir():
        if session_dir.is_dir() and not session_dir.name.startswith('.'):
            session_yaml = session_dir / f"{session_dir.name}.yaml"
            if session_yaml.exists():
                sd = safe_read_yaml(session_yaml)
                if sd and 'metadata' in sd:
                    data['metadata']['milestones'][session_dir.name] = sd['metadata']

def run_sync():
    if not HUSTLER_DB.exists():
        return

    data = safe_read_yaml(HUSTLER_DB)
    if not data: return

    modes = data.get('metadata', {}).get('modes', {})
    pipeline_status = modes.get('pipeline_status', 'off')
    autosync_status = modes.get('autosync_status', 'on')
    if 'off' in str(pipeline_status).lower():
        return # Engine is off
    if 'off' in str(autosync_status).lower():
        return # Autosync disabled by user

    print("[*] Pipeline Hustler Engine: Running exhaustive ledger hydration & sync...")
    
    global_throughput = 0
    global_active_pipelines = 0
    
    # 1. Hydrate Focus Ledgers
    if HUSTLER_WORKSPACE.exists() and HUSTLER_LEDGERS_DIR.exists():
        for focus_ledger in HUSTLER_LEDGERS_DIR.glob('*.focus.yaml'):
            focus_name = focus_ledger.name.replace('.focus.yaml', '')
            
            p_data = safe_read_yaml(focus_ledger)
            if not p_data: continue
            
            if 'state' not in p_data: p_data['state'] = {}
            if 'metadata' not in p_data: p_data['metadata'] = {}
            if 'metrics' not in p_data['metadata']: p_data['metadata']['metrics'] = {}
            
            focus_dir = HUSTLER_WORKSPACE / focus_name
            if focus_dir.exists() and focus_dir.is_dir():
                global_active_pipelines += 1
                
                tracked_products = []
                for md_file in focus_dir.glob('**/*.md'):
                    # Skip sources
                    if 'source' in md_file.name.lower() or 'lead' in md_file.name.lower():
                        continue
                    rel_path = str(md_file.relative_to(WORKSPACE)).replace('\\', '/')
                    tracked_products.append(rel_path)
                    
                p_data['state']['tracked_products'] = tracked_products
                
                # Step B: Update ledger metrics
                metrics = p_data['metadata']['metrics']
                metrics['total_products'] = len(tracked_products)
                metrics['pending_products'] = len(tracked_products)
                
            # Step D: Targeted IN commands
            if 'hub' in data.get('metadata', {}):
                if 'messages' in data['metadata']['hub']:
                    targeted = [m for m in data['metadata']['hub']['messages'] if focus_name in str(m)]
                    if targeted:
                        if 'hub' not in p_data['metadata']: p_data['metadata']['hub'] = {}
                        p_data['metadata']['hub']['messages'] = targeted
                if 'backlog' in data['metadata']['hub']:
                    targeted_bl = [b for b in data['metadata']['hub']['backlog'] if focus_name in str(b)]
                    if targeted_bl:
                        if 'hub' not in p_data['metadata']: p_data['metadata']['hub'] = {}
                        p_data['metadata']['hub']['backlog'] = targeted_bl
                    
            safe_write_yaml(p_data, focus_ledger)
            
        # Hydrate Sources Ledgers
        for source_ledger in HUSTLER_LEDGERS_DIR.glob('*.sources.yaml'):
            source_name = source_ledger.name.replace('.sources.yaml', '')
            
            s_data = safe_read_yaml(source_ledger)
            if not s_data: continue
            
            if 'state' not in s_data: s_data['state'] = {}
            if 'metadata' not in s_data: s_data['metadata'] = {}
            if 'metrics' not in s_data['metadata']: s_data['metadata']['metrics'] = {}
            
            # Count sources
            tracked_sources = []
            focus_dir = HUSTLER_WORKSPACE / source_name
            if focus_dir.exists() and focus_dir.is_dir():
                for md_file in focus_dir.glob('**/*.md'):
                    if 'source' in md_file.name.lower() or 'lead' in md_file.name.lower():
                        rel_path = str(md_file.relative_to(WORKSPACE)).replace('\\', '/')
                        tracked_sources.append(rel_path)
                        
            # Also external sources
            ext_sources = HUSTLER_WORKSPACE / '_HUSTLER-EXTERNAL_SOURCES'
            if ext_sources.exists() and ext_sources.is_dir():
                for md_file in ext_sources.glob('**/*.md'):
                    if source_name in md_file.name:
                        rel_path = str(md_file.relative_to(WORKSPACE)).replace('\\', '/')
                        if rel_path not in tracked_sources:
                            tracked_sources.append(rel_path)
                            
            s_data['state']['tracked_sources'] = tracked_sources
            metrics = s_data['metadata']['metrics']
            metrics['total_sources'] = len(tracked_sources)
            
            # Step D: Targeted IN commands
            if 'hub' in data.get('metadata', {}):
                if 'messages' in data['metadata']['hub']:
                    targeted = [m for m in data['metadata']['hub']['messages'] if source_name in str(m)]
                    if targeted:
                        if 'hub' not in s_data['metadata']: s_data['metadata']['hub'] = {}
                        s_data['metadata']['hub']['messages'] = targeted
                if 'backlog' in data['metadata']['hub']:
                    targeted_bl = [b for b in data['metadata']['hub']['backlog'] if source_name in str(b)]
                    if targeted_bl:
                        if 'hub' not in s_data['metadata']: s_data['metadata']['hub'] = {}
                        s_data['metadata']['hub']['backlog'] = targeted_bl
            
            safe_write_yaml(s_data, source_ledger)
            
            global_throughput += len(tracked_sources)
                
    # Update global state metrics
    if 'state' not in data['metadata']:
        data['metadata']['state'] = {}
    if 'metrics' not in data['metadata']['state']:
        data['metadata']['state']['metrics'] = {}
    if 'gateway' not in data['metadata']['state']:
        data['metadata']['state']['gateway'] = {}
        
    metrics = data['metadata']['state']['metrics']
    gateway = data['metadata']['state']['gateway']
    
    old_metrics = dict(metrics)
    old_gateway = dict(gateway)
    
    metrics['throughput'] = f"{global_throughput} sources logged"
    gateway['active_pipelines'] = global_active_pipelines

    # --- Log recent_events for this sync cycle ---
    if 'hub' not in data['metadata']: data['metadata']['hub'] = {}
    events = data['metadata']['hub'].setdefault('recent_events', [])
    ts = datetime.datetime.now().strftime('%H:%M')
    events.append(f"[{ts}] Hustler: {global_active_pipelines} active pipelines, {global_throughput} sources indexed")

    # Always aggregate this pipeline's own milestones + refresh freshness.
    aggregate_milestones(data, HUSTLER_MILESTONES_DIR)
    touch_freshness(data, actor='daemon')

    if metrics != old_metrics or gateway != old_gateway:
        safe_write_yaml(data, HUSTLER_DB)
        print("[*] Pipeline Hustler Engine: Sync complete (Metrics & Ledgers Hydrated).")
    else:
        # Still persist freshness + milestone rollup even if metrics unchanged.
        safe_write_yaml(data, HUSTLER_DB)

def main():
    if '--daemon' in sys.argv:
        print("Pipeline Hustler Engine running in daemon mode (5s polling)...")
        while True:
            run_sync()
            time.sleep(5)
    else:
        run_sync()

if __name__ == '__main__':
    # Self-guard: prevent duplicate daemon execution
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from daemon_guard import engine_self_guard

    guard = engine_self_guard('pipeline_hustler_engine')
    guard(main)()
