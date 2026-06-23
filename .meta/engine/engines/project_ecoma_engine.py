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
PROJECT_DIR = WORKSPACE / 'project_ecoma'
PROJECT_OS_DB = PROJECT_DIR / '.ecoma_os' / '.ecoma_db' / 'project_ecoma_os.yaml'
PROJECT_MILESTONES_DIR = PROJECT_DIR / '.ecoma_os' / '.ecoma_milestones'


def safe_read_yaml(file_path):
    if not file_path.exists():
        return {}
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
    if 'system_metadata' not in data:
        data['system_metadata'] = {}
    if 'freshness' not in data['system_metadata']:
        data['system_metadata']['freshness'] = {}
    f = data['system_metadata']['freshness']
    f['last_synced'] = datetime.datetime.now().isoformat()
    f['status'] = 'fresh'
    f['last_synced_by'] = actor


def aggregate_milestones(data, milestones_dir):
    """Walk milestones dir and roll session metadata into data['metadata']['milestones']."""
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
    if not PROJECT_OS_DB.exists():
        return

    data = safe_read_yaml(PROJECT_OS_DB)
    if not data:
        return

    modes = data.get('metadata', {}).get('modes', {})
    project_status = modes.get('project_status', 'off')
    if 'off' in str(project_status).lower():
        return

    print("[*] Project Ecoma Engine: Running sync...")

    # Update metrics
    if 'metadata' not in data:
        data['metadata'] = {}
    if 'state' not in data['metadata']:
        data['metadata']['state'] = {}
    if 'metrics' not in data['metadata']['state']:
        data['metadata']['state']['metrics'] = {}

    metrics = data['metadata']['state']['metrics']

    # Log recent_events
    if 'hub' not in data['metadata']:
        data['metadata']['hub'] = {}
    events = data['metadata']['hub'].setdefault('recent_events', [])
    ts = datetime.datetime.now().strftime('%H:%M')
    events.append(f"[{ts}] Project Ecoma sync complete")

    # Aggregate milestones + refresh freshness
    aggregate_milestones(data, PROJECT_MILESTONES_DIR)
    touch_freshness(data, actor='daemon')

    safe_write_yaml(data, PROJECT_OS_DB)


def main():
    if '--daemon' in sys.argv:
        print("Project Ecoma Engine running in daemon mode (5s polling)...")
        while True:
            run_sync()
            time.sleep(5)
    else:
        run_sync()


if __name__ == '__main__':
    # Self-guard: prevent duplicate daemon execution
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from daemon_guard import engine_self_guard

    guard = engine_self_guard('project_ecoma_engine')
    guard(main)()
