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
PROJECT_DIR = WORKSPACE / 'project_assets'
PROJECT_OS_DB = PROJECT_DIR / '.assets_os' / '.assets_db' / 'project_assets_os.yaml'
PROJECT_MILESTONES_DIR = PROJECT_DIR / '.assets_os' / '.assets_milestones'


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


def scan_project_items():
    """Scan project data folders (Homes, Lands) and return item counts."""
    active_items = 0
    completed_items = 0
    pending_items = 0

    # Scan Homes folder
    homes_dir = PROJECT_DIR / 'Homes'
    if homes_dir.exists():
        for item in homes_dir.iterdir():
            if item.is_dir() and not item.name.startswith('.'):
                active_items += 1

    # Scan Lands folder
    lands_dir = PROJECT_DIR / 'Lands'
    if lands_dir.exists():
        for item in lands_dir.iterdir():
            if item.is_file() and not item.name.startswith('.'):
                pending_items += 1

    return active_items, completed_items, pending_items


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

    print("[*] Project Assets Engine: Running sync...")

    # Scan project data
    active_items, completed_items, pending_items = scan_project_items()

    # Update metrics
    if 'metadata' not in data:
        data['metadata'] = {}
    if 'state' not in data['metadata']:
        data['metadata']['state'] = {}
    if 'metrics' not in data['metadata']['state']:
        data['metadata']['state']['metrics'] = {}

    metrics = data['metadata']['state']['metrics']
    old_metrics = dict(metrics)

    metrics['active_items'] = active_items
    metrics['completed_items'] = completed_items
    metrics['pending_items'] = pending_items

    # Log recent_events
    if 'hub' not in data['metadata']:
        data['metadata']['hub'] = {}
    events = data['metadata']['hub'].setdefault('recent_events', [])
    ts = datetime.datetime.now().strftime('%H:%M')
    events.append(
        f"[{ts}] Scanned: {active_items} homes, {pending_items} land docs, {completed_items} completed"
    )

    # Aggregate milestones + refresh freshness
    aggregate_milestones(data, PROJECT_MILESTONES_DIR)
    touch_freshness(data, actor='daemon')

    if metrics != old_metrics:
        safe_write_yaml(data, PROJECT_OS_DB)
        print("[*] Project Assets Engine: Sync complete (Metrics Updated).")
    else:
        safe_write_yaml(data, PROJECT_OS_DB)


def main():
    if '--daemon' in sys.argv:
        print("Project Assets Engine running in daemon mode (5s polling)...")
        while True:
            run_sync()
            time.sleep(5)
    else:
        run_sync()


if __name__ == '__main__':
    # Self-guard: prevent duplicate daemon execution
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from daemon_guard import engine_self_guard

    guard = engine_self_guard('project_assets_engine')
    guard(main)()
