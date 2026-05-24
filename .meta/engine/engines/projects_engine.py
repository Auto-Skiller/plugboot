import os
import sys
import time
from pathlib import Path
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True
yaml.indent(mapping=2, sequence=4, offset=2)

WORKSPACE = Path(__file__).parent.parent.parent.parent.resolve()
DB_DIR = WORKSPACE / '.meta_os' / 'meta_db'
PROJECTS_OS_DB = DB_DIR / 'projects_os.yaml'
PROJECTS_DIR = WORKSPACE / 'projects'

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

def run_sync():
    if not PROJECTS_OS_DB.exists():
        return
        
    data = safe_read_yaml(PROJECTS_OS_DB)
    if not data: return
        
    modes = data.get('metadata', {}).get('modes', {})
    project_status = modes.get('project_status', 'off')
    if 'off' in str(project_status).lower():
        return # Engine is off
        
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
    
    if metrics != old_metrics or projects_registry != old_registry:
        safe_write_yaml(data, PROJECTS_OS_DB)
        print("[*] Projects Engine: Sync complete (Registry/Metrics Updated).")
    else:
        pass # No change

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
