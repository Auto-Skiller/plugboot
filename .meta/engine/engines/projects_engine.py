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
PROJECTS_OS_DB = DB_DIR / 'projects_os.yaml'
PROJECTS_DIR = WORKSPACE / 'projects'
PROJECTS_MILESTONES_DIR = WORKSPACE / 'projects' / '.projects_os' / '.projects_milestones'

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
    """Walk a projects milestones dir and roll session metadata into data['metadata']['milestones']."""
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
    if not PROJECTS_OS_DB.exists():
        return

    data = safe_read_yaml(PROJECTS_OS_DB)
    if not data: return

    modes = data.get('metadata', {}).get('modes', {})
    project_status = modes.get('project_status', 'off')
    autosync_status = modes.get('autosync_status', 'on')
    if 'off' in str(project_status).lower():
        return # Engine is off
    if 'off' in str(autosync_status).lower():
        return # Autosync disabled by user

    print("[*] Projects Engine: Running exhaustive file sync...")

    active_projects = 0
    paused_projects = 0
    completed_projects = 0
    projects_registry = {}
    
    if PROJECTS_DIR.exists():
        for proj_folder in PROJECTS_DIR.iterdir():
            if proj_folder.is_dir() and not proj_folder.name.startswith('.'):
                proj_yaml = proj_folder / 'PROJECT.yaml'
                if proj_yaml.exists():
                    try:
                        p_data = safe_read_yaml(proj_yaml)
                        meta = p_data.get('metadata', {})
                        status = meta.get('status', 'paused')
                        
                        # Add to registry
                        projects_registry[proj_folder.name] = {
                            'status': status,
                            'path': str(proj_yaml.relative_to(WORKSPACE)).replace('\\', '/')
                        }
                        
                        status_lower = str(status).lower()
                        if 'on' in status_lower:
                            active_projects += 1
                        elif 'paused' in status_lower:
                            paused_projects += 1
                        elif 'completed' in status_lower:
                            completed_projects += 1
                    except Exception as e:
                        pass
                
    # Update projects registry and metrics
    if 'metadata' not in data: data['metadata'] = {}
    
    old_registry = data['metadata'].get('projects', {})
    data['metadata']['projects'] = projects_registry
    
    if 'state' not in data['metadata']:
        data['metadata']['state'] = {}
    if 'metrics' not in data['metadata']['state']:
        data['metadata']['state']['metrics'] = {}
    
    metrics = data['metadata']['state']['metrics']
    old_metrics = dict(metrics)

    metrics['active_projects'] = active_projects
    metrics['paused_projects'] = paused_projects
    metrics['completed_projects'] = completed_projects

    # --- Consume backlog: fan-out matching items to project PROJECT.yaml files ---
    hub = data.get('metadata', {}).get('hub', {})
    backlog_items = hub.get('backlog', [])
    if backlog_items:
        consumed = []
        remaining = []
        for item in backlog_items:
            matched = False
            for proj_name in projects_registry:
                if proj_name.lower() in str(item).lower():
                    proj_yaml = PROJECTS_DIR / proj_name / 'PROJECT.yaml'
                    if proj_yaml.exists():
                        p_data = safe_read_yaml(proj_yaml) or {}
                        if 'metadata' not in p_data: p_data['metadata'] = {}
                        p_data['metadata']['backlog'] = [item]
                        safe_write_yaml(p_data, proj_yaml)
                    consumed.append(item)
                    matched = True
                    break
            if not matched:
                remaining.append(item)
        data['metadata']['hub']['backlog'] = remaining

    # --- Log recent_events for this sync cycle ---
    if 'hub' not in data['metadata']: data['metadata']['hub'] = {}
    events = data['metadata']['hub'].setdefault('recent_events', [])
    ts = datetime.datetime.now().strftime('%H:%M')
    events.append(f"[{ts}] Registry: {active_projects} active, {paused_projects} paused, {completed_projects} completed projects")

    # Always aggregate this domain's own milestones + refresh freshness.
    aggregate_milestones(data, PROJECTS_MILESTONES_DIR)
    touch_freshness(data, actor='daemon')

    if metrics != old_metrics or projects_registry != old_registry:
        safe_write_yaml(data, PROJECTS_OS_DB)
        print("[*] Projects Engine: Sync complete (Registry/Metrics Updated).")
    else:
        # Still persist freshness + milestone rollup even if metrics unchanged.
        safe_write_yaml(data, PROJECTS_OS_DB)

def main():
    if '--daemon' in sys.argv:
        print("Projects Engine running in daemon mode (5s polling)...")
        while True:
            run_sync()
            time.sleep(5)
    else:
        run_sync()

if __name__ == '__main__':
    main()
