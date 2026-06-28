"""
engine.py — Agentic OS Mega Engine (v5.3)

Combines sync engine + HTTP dashboard server into one process.
Replaces: sync_engine.py + server.py

Architecture:
  - All DBs loaded into memory at startup
  - Sync phases run on disk, update memory
  - HTTP API serves dashboard from memory (no file reads on GET)
  - Writes update both memory and disk (atomic)
  - No sync lag: dashboard reads from memory, engine writes to memory

Run modes:
  --daemon   Continuous sync + serve (default: sync every 5s, serve on :8000)
  --once     Single sync pass, then exit
  --serve    Serve only (no sync)
  --validate Schema validation only
"""

import os
import re
import sys
import time
import json
import socket
import signal
import argparse
import datetime
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from pathlib import Path
from ruamel.yaml import YAML

# ═══════════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════════

PORT = 8000
SUPERVISOR_LOCK_PORT = 49999

yaml = YAML()
yaml.preserve_quotes = True
yaml.indent(mapping=2, sequence=4, offset=2)

WORKSPACE = Path(__file__).parent.parent.resolve()
INFRA_DIR = WORKSPACE / '.infra'
CONFIG_DIR = INFRA_DIR / 'config'
DB_DIR = WORKSPACE / '.db'
TOOLBOXES_DIR = WORKSPACE / '.meta' / 'toolboxes'
MILESTONES_DIR = WORKSPACE / '.meta' / 'milestones'
IDENTITY_DIR = WORKSPACE / '.meta' / '.os' / '.system.identity'
STATIC_DIR = INFRA_DIR / 'dashboard' / 'frontend'

# ═══════════════════════════════════════════════════════════════════
# In-Memory State (loaded at startup, updated by sync)
# ═══════════════════════════════════════════════════════════════════

STATE = {
    'system': {},
    'scaler': {},
    'hustler': {},
    'assets': {},
    'ecoma': {},
    'toolboxes': {},
    'toolboxes.rollups': {},  # {category: {domain: data}}
    'milestones': {},    # {domain: {session: metadata}}
    'identity': {},      # {file: {path, description}}
    'indexes': {},       # {subsystem: {identity/ledgers/milestones}}
}

SYSTEM_ERRORS = []
LAST_SYNC_TIME = 0
"""
engine.py — Agentic OS Mega Engine (v5.3)

Combines sync engine + HTTP dashboard server into one process.
Replaces: sync_engine.py + server.py

Architecture:
  - All DBs loaded into memory at startup
  - Sync phases run on disk, update memory
  - HTTP API serves dashboard from memory (no file reads on GET)
  - Writes update both memory and disk (atomic)
  - No sync lag: dashboard reads from memory, engine writes to memory

Run modes:
  --daemon   Continuous sync + serve (default: sync every 5s, serve on :8000)
  --once     Single sync pass, then exit
  --serve    Serve only (no sync)
  --validate Schema validation only
"""

import os
import re
import sys
import time
import json
import socket
import signal
import argparse
import datetime
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from pathlib import Path
from ruamel.yaml import YAML

# ═══════════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════════

PORT = 8000
SUPERVISOR_LOCK_PORT = 49999

yaml = YAML()
yaml.preserve_quotes = True
yaml.indent(mapping=2, sequence=4, offset=2)

WORKSPACE = Path(__file__).parent.parent.resolve()
INFRA_DIR = WORKSPACE / '.infra'
CONFIG_DIR = INFRA_DIR / 'config'
DB_DIR = WORKSPACE / '.db'
TOOLBOXES_DIR = WORKSPACE / '.meta' / 'toolboxes'
MILESTONES_DIR = WORKSPACE / '.meta' / 'milestones'
IDENTITY_DIR = WORKSPACE / '.meta' / '.os' / '.system.identity'
STATIC_DIR = INFRA_DIR / 'dashboard' / 'frontend'

# ═══════════════════════════════════════════════════════════════════
# In-Memory State (loaded at startup, updated by sync)
# ═══════════════════════════════════════════════════════════════════

STATE = {
    'system': {},
    'scaler': {},
    'hustler': {},
    'assets': {},
    'ecoma': {},
    'toolboxes': {},
    'toolboxes.rollups': {},  # {category: {domain: data}}
    'milestones': {},    # {domain: {session: metadata}}
    'identity': {},      # {file: {path, description}}
    'indexes': {},       # {subsystem: {identity/ledgers/milestones}}
}

SYSTEM_ERRORS = []
LAST_SYNC_TIME = 0


# ═══════════════════════════════════════════════════════════════════
# Index Loading
# ═══════════════════════════════════════════════════════════════════

def load_index(domain, index_type):
    """Load a specific index file for a subsystem."""
    candidates = [
        DB_DIR / f'{domain}.index.yaml',
        DB_DIR / f'.{domain}.index.yaml',
        DB_DIR / f'pipeline_{domain}.index.yaml',
        DB_DIR / f'project_{domain}.index.yaml',
    ]
    for index_path in candidates:
        if index_path.exists():
            data = safe_read_yaml(index_path)
            if not data:
                return {}
            return data.get(index_type, {})
    return {}

def load_all_indexes():
    """Load all index files for all subsystems, merging with live frontmatter from source files."""
    indexes = {}
    configs = load_domain_configs()
    sys_idx = scan_identity_files(IDENTITY_DIR)
    if sys_idx:
        indexes['system'] = {'identity': sys_idx}
    for domain, cfg in configs.items():
        idx = {}
        for index_type in ['runbooks', 'identity', 'ledgers', 'milestones']:
            items = load_index(domain, index_type)
            if index_type == 'runbooks':
                items = enrich_from_frontmatter(items, cfg, domain)
            elif index_type == 'ledgers':
                items = enrich_from_metadata(items, cfg, domain)
            if items:
                idx[index_type] = items
        if idx:
            indexes[domain] = idx
    return indexes

def enrich_from_frontmatter(index_items, config, domain):
    """Enrich index entries with live frontmatter from .md runbook files."""
    runbooks_dir = Path(config.get('runbooks', ''))
    if not runbooks_dir or not runbooks_dir.exists():
        return index_items
    enriched = {}
    for name, info in index_items.items():
        fpath = runbooks_dir / name
        if fpath.exists():
            fm = extract_frontmatter(fpath)
            credentials = fm.get('credentials', {})
            if not credentials:
                credentials = fm
            for field in ['description', 'when_to_use', 'audience', 'priority', 'contains', 'role']:
                if credentials.get(field):
                    info[field] = credentials[field]
            for field in ['triggers', 'inputs', 'outputs']:
                if credentials.get(field):
                    info[field] = credentials[field]
        enriched[name] = info
    return enriched

def enrich_from_metadata(index_items, config, domain):
    """Enrich index entries with metadata from .yaml ledger files."""
    ledgers_dir = Path(config.get('ledgers', ''))
    if not ledgers_dir or not ledgers_dir.exists():
        return index_items
    enriched = {}
    for name, info in index_items.items():
        fpath = ledgers_dir / name
        if fpath.exists():
            data = safe_read_yaml(fpath)
            meta = data.get('metadata', {})
            # Support both flat metadata.description and metadata.credentials.description
            credentials = meta.get('credentials', {})
            if credentials:
                source = credentials
            else:
                source = meta
            for field in ['description', 'when_to_use', 'audience', 'priority', 'contains', 'role']:
                if source.get(field):
                    info[field] = source[field]
            for field in ['triggers', 'inputs', 'outputs']:
                if source.get(field):
                    info[field] = source[field]
        enriched[name] = info
    return enriched
def scan_identity_files(identity_dir):
    """Scan an identity directory and return all .md files with credentials metadata."""
    if not identity_dir.exists():
        return {}
    indexes = {}
    for f in identity_dir.rglob('*.md'):
        try:
            rel_path = str(f.relative_to(WORKSPACE)).replace('\\', '/')
            fm = extract_frontmatter(f)
            creds = fm.get('credentials', fm)
            indexes[f.name] = {
                'path': rel_path,
                'description': creds.get('description', ''),
                'when_to_use': creds.get('when_to_use', ''),
                'audience': creds.get('audience', 'core_agent, all_agents'),
                'priority': creds.get('priority', 'reference'),
                'contains': creds.get('contains', ''),
                'role': creds.get('role', ''),
                'triggers': creds.get('triggers', []),
                'inputs': creds.get('inputs', []),
                'outputs': creds.get('outputs', []),
            }
        except Exception:
            pass
    return indexes

def validate_indexes():
    """Check that all files referenced in indexes actually exist on disk."""
    issues = []
    all_indexes = load_all_indexes()
    for domain, index_types in all_indexes.items():
        for index_type, items in index_types.items():
            if isinstance(items, dict):
                for name, info in items.items():
                    path = info.get('path', '')
                    if path and not (WORKSPACE / path).exists():
                        issues.append(f'{domain}.{index_type}: {name} -> {path} NOT FOUND')
    return issues


# ═══════════════════════════════════════════════════════════════════
# Domain Configs
# ═══════════════════════════════════════════════════════════════════

def load_domain_configs():
    configs = {}
    config_path = WORKSPACE / 'config.yaml'
    if not config_path.exists():
        return configs
    data = safe_read_yaml(config_path)
    modes = data.get('modes', {})
    sys_modes = modes.get('system', {})
    if sys_modes:
        configs['system'] = {
            'domain': 'system', 'modes': sys_modes, 'type': 'core',
            'db': '.db/.system.board.yaml', 'rollup': '.db/.system.rollup.yaml',
            'runbooks': '.meta/.os/.system.identity/',
        }
    db_map = {
        'scaler': '.db/pipeline_scaler.board.yaml',
        'hustler': '.db/pipeline_hustler.board.yaml',
        'assets': '.db/project_assets.board.yaml',
        'ecoma': '.db/project_ecoma.board.yaml',
    }
    rollup_map = {
        'scaler': '.db/pipeline_scaler.rollup.yaml',
        'hustler': '.db/pipeline_hustler.rollup.yaml',
        'assets': '.db/project_assets.rollup.yaml',
        'ecoma': '.db/project_ecoma.rollup.yaml',
        'system': '.db/.system.rollup.yaml',
    }
    ledgers_map = {
        'scaler': '.db/pipeline_scaler.ledgers/',
        'hustler': '.db/pipeline_hustler.ledgers/',
        'assets': '.db/project_assets.ledgers/',
        'ecoma': '.db/project_ecoma.ledgers/',
    }
    runbooks_map = {
        'scaler': '.meta/.os/pipeline_scaler.runbooks/',
        'hustler': '.meta/.os/pipeline_hustler.runbooks/',
    }
    pipelines = modes.get('pipelines', {}) or {}
    for domain, cfg in pipelines.items():
        if isinstance(cfg, dict):
            cfg['domain'] = domain
            cfg['type'] = 'pipeline'
            cfg.setdefault('db', db_map.get(domain, f'.db/{domain}.board.yaml'))
            cfg.setdefault('rollup', rollup_map.get(domain, f'.db/{domain}.rollup.yaml'))
            cfg.setdefault('ledgers', ledgers_map.get(domain, f'.db/{domain}.ledgers/'))
            cfg.setdefault('runbooks', runbooks_map.get(domain, f'.meta/.os/{domain}.runbooks/'))
            configs[domain] = cfg
    projects = modes.get('projects', {}) or {}
    for domain, cfg in projects.items():
        if isinstance(cfg, dict):
            cfg['domain'] = domain
            cfg['type'] = 'project'
            cfg.setdefault('db', db_map.get(domain, f'.db/{domain}.board.yaml'))
            cfg.setdefault('rollup', rollup_map.get(domain, f'.db/{domain}.rollup.yaml'))
            cfg.setdefault('ledgers', ledgers_map.get(domain, f'.db/{domain}.ledgers/'))
            configs[domain] = cfg
    for profile_key in ['pipelines_profiles', 'projects_profiles']:
        profiles = data.get(profile_key, {}) or {}
        for domain, profile in profiles.items():
            if domain in configs and isinstance(profile, dict):
                active = None
                for profile_data in profile.values():
                    if isinstance(profile_data, dict):
                        for sub_data in profile_data.values():
                            if isinstance(sub_data, dict) and 'status' in sub_data:
                                if str(sub_data.get('status', '')).lower() == 'on':
                                    active = sub_data
                                    break
                    if active:
                        break
                if active:
                    configs[domain]['pillars'] = active.get('pillars', [])
                    configs[domain]['action_gate'] = active.get('action_gate', [])
                configs[domain]['_profiles'] = profile
    return configs

# ═══════════════════════════════════════════════════════════════════
# Safe I/O
# ═══════════════════════════════════════════════════════════════════

def safe_read_yaml(file_path):
    if not isinstance(file_path, Path):
        file_path = Path(file_path)
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
    if not isinstance(file_path, Path):
        file_path = Path(file_path)
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

def load_yaml(path):
    return safe_read_yaml(path)

def save_yaml(path, data):
    safe_write_yaml(data, path)

def set_nested(data, key_path, value):
    keys = key_path.split('.')
    d = data
    for k in keys[:-1]:
        if k not in d or not isinstance(d, dict):
            d[k] = {}
        d = d[k]
    d[keys[-1]] = value

def extract_frontmatter(file_path):
    try:
        content = file_path.read_text(encoding='utf-8')
        match = re.search(r'^---\r?\n(.*?)\n---\r?\n', content, re.DOTALL)
        if match:
            fm_text = match.group(1)
            parsed = yaml.load(fm_text) or {}
            # Strip flat identity fields that conflict with metadata structure
            for key in ['name', 'version', 'parent_toolbox', 'maturity']:
                parsed.pop(key, None)
            # FIX 1: For agents, extract role from credentials if present
            creds = parsed.get('credentials', {})
            if creds and 'role' in creds:
                parsed['role'] = creds['role']
            return parsed
    except Exception as e:
        print(f"Error parsing frontmatter in {file_path}: {e}")
    return {}

def extract_frontmatter_full(file_path):
    """Extract full frontmatter including metadata: block."""
    try:
        content = file_path.read_text(encoding='utf-8')
        match = re.search(r'^---\r?\n(.*?)\n---\r?\n', content, re.DOTALL)
        if match:
            fm_text = match.group(1)
            return yaml.load(fm_text) or {}
    except Exception as e:
        print(f"Error parsing frontmatter in {file_path}: {e}")
    return {}

def touch_freshness(data, actor='daemon'):
    if 'metadata' not in data:
        data['metadata'] = {}
    freshness = data['metadata'].get('freshness', {})
    freshness['sync_count'] = int(freshness.get('sync_count', 0)) + 1
    freshness['last_synced_by'] = actor
    freshness['last_synced'] = datetime.datetime.now().isoformat()
    freshness['status'] = 'active'
    data['metadata']['freshness'] = freshness

def trim_recent_events(data, max_events=3):
    if isinstance(data, dict):
        for k, v in data.items():
            if k == 'recent_events' and isinstance(v, list) and len(v) > max_events:
                data[k] = v[-max_events:]
            else:
                trim_recent_events(v, max_events)
    elif isinstance(data, list):
        for item in data:
            trim_recent_events(item, max_events)

def scan_identity_index(identity_dir):
    if not identity_dir.exists():
        return {}
    indexes = {}
    for f in identity_dir.rglob('*.md'):
        try:
            content = f.read_text(encoding='utf-8')[:500]
            desc = ''
            lines = content.split('\n')
            for line in lines:
                line = line.strip().lstrip('#').strip()
                if line and not line.startswith('---'):
                    desc = line[:100]
                    break
            rel_path = str(f.relative_to(WORKSPACE)).replace('\\', '/')
            indexes[f.name] = {'path': rel_path, 'description': desc}
        except Exception:
            pass
    return indexes

def status_is_on(value):
    if value is None:
        return False
    s = str(value).strip().lower()
    s = s.replace('\U0001f7e2', '').replace('\U0001f534', '').replace('\U0001f7e0', '').strip()
    return s in ('on', 'active', 'true', 'yes', '1')

def send_json(handler, code, payload):
    body = json.dumps(payload, ensure_ascii=False, default=str).encode('utf-8')
    handler.send_response(code)
    handler.send_header('Content-type', 'application/json; charset=utf-8')
    handler.send_header('Content-Length', len(body))
    handler.end_headers()
    handler.wfile.write(body)


# ═══════════════════════════════════════════════════════════════════
# Phase 0: Health Check
# ═══════════════════════════════════════════════════════════════════

def phase0_health_check():
    print("--- Phase 0: Health Check ---")
    critical_files = [
        WORKSPACE / 'AGENTS.md',
        DB_DIR / '.system.board.yaml',
        DB_DIR / 'pipeline_scaler.board.yaml',
        DB_DIR / 'pipeline_hustler.board.yaml',
        DB_DIR / 'project_assets.board.yaml',
        DB_DIR / 'project_ecoma.board.yaml',
    ]
    all_ok = True
    for f in critical_files:
        if not f.exists():
            print(f"[!] Critical file missing: {f.name}")
            all_ok = False
    if all_ok:
        print("  [OK] All critical files present.")
    return all_ok

# ═══════════════════════════════════════════════════════════════════
# Phase 1: Hydration
# ═══════════════════════════════════════════════════════════════════

def phase1_toolboxes():
    print("--- Phase 1: Toolboxes Hydration ---")
    if not TOOLBOXES_DIR.exists():
        print("[!] Missing .meta/toolboxes/ directory!")
        return

    categories = [d for d in TOOLBOXES_DIR.iterdir() if d.is_dir() and not d.name.startswith('.git')]
    toolboxes_state = {}

    for cat in categories:
        cat_db_dir = DB_DIR / 'toolboxes.rollups' / f"{cat.name}.rollups"
        if not cat_db_dir.exists():
            continue
        cat_state = {}
        domains = [d for d in cat.iterdir() if d.is_dir()]
        for domain in domains:
            domain_db = cat_db_dir / f"{domain.name}.yaml"
            if not domain_db.exists():
                continue
            data = safe_read_yaml(domain_db)
            if 'agents' not in data or data['agents'] is None:
                data['agents'] = {}
            else:
                data['agents'].clear()
            if 'skills' not in data or data['skills'] is None:
                data['skills'] = {}
            else:
                data['skills'].clear()
            agents_dir = domain / 'agents'
            if agents_dir.exists():
                for agent_file in agents_dir.iterdir():
                    if agent_file.name == '.gitkeep':
                        continue
                    name = agent_file.stem
                    fm = {}
                    if agent_file.is_dir():
                        agent_md = agent_file / 'AGENT.md'
                        if agent_md.exists():
                            fm = extract_frontmatter(agent_md)
                    elif agent_file.suffix == '.md':
                        fm = extract_frontmatter(agent_file)
                    fm['path'] = str(agent_file.relative_to(WORKSPACE)).replace('\\', '/')
                    creds = fm.get('credentials', {})
                    if creds:
                        fm['role'] = creds.get('role', name)
                        fm['maturity'] = creds.get('maturity', 'stub')
                        fm['description'] = creds.get('description', '')
                        fm['when_to_use'] = creds.get('when_to_use', '')
                    data['agents'][name] = fm
            else:
                # No 'agents/' subdir — scan domain directory recursively for AGENT.md files
                for agent_md in domain.rglob('AGENT.md'):
                    name = agent_md.parent.name
                    fm = extract_frontmatter(agent_md)
                    fm['path'] = str(agent_md.parent.relative_to(WORKSPACE)).replace('\\', '/')
                    creds = fm.get('credentials', {})
                    if creds:
                        fm['role'] = creds.get('role', name)
                        fm['maturity'] = creds.get('maturity', 'stub')
                        fm['description'] = creds.get('description', '')
                        fm['when_to_use'] = creds.get('when_to_use', '')
                    data['agents'][name] = fm
            skills_dir = domain / 'skills'
            if skills_dir.exists():
                for skill_file in skills_dir.iterdir():
                    if skill_file.name == '.gitkeep':
                        continue
                    name = skill_file.stem
                    is_dir = skill_file.is_dir()
                    fm = {}
                    if is_dir:
                        skill_md = skill_file / 'SKILL.md'
                        if skill_md.exists():
                            fm = extract_frontmatter(skill_md)
                    else:
                        if skill_file.suffix == '.md':
                            fm = extract_frontmatter(skill_file)
                    fm['path'] = str(skill_file.relative_to(WORKSPACE)).replace('\\', '/')
                    data['skills'][name] = fm

            # Build the per-domain rollup with new credentials structure
            agents_count = len(data['agents'])
            skills_count = len(data['skills'])
            # Derive domain-level credentials from first skill/agent or defaults
            domain_description = ""
            domain_when_to_use = ""
            for skill_fm in data['skills'].values():
                creds = skill_fm.get('credentials', {})
                if creds.get('description'):
                    domain_description = creds['description']
                if creds.get('when_to_use'):
                    domain_when_to_use = creds['when_to_use']
                if domain_description and domain_when_to_use:
                    break
            if not domain_description:
                for agent_fm in data['agents'].values():
                    creds = agent_fm.get('credentials', {})
                    if creds.get('description'):
                        domain_description = creds['description']
                    if creds.get('when_to_use'):
                        domain_when_to_use = creds['when_to_use']
                    if domain_description and domain_when_to_use:
                        break

            data['metadata'] = {
                'name': domain.name,
                'class': 'toolboxes',
                'type': 'rollup',
                'version': '1.0',
                'schema_version': '1.0',
                'freshness': {
                    'status': 'active',
                    'sync_count': 0,
                    'last_synced_by': 'daemon',
                    'last_synced': datetime.datetime.now().isoformat(),
                },
                'agent_count': agents_count,
                'agent_names': list(data['agents'].keys()),
                'skill_count': skills_count,
                'skill_names': list(data['skills'].keys()),
            }
            data['credentials'] = {
                'description': domain_description,
                'when_to_use': domain_when_to_use,
                'agents_count': agents_count,
                'skills_count': skills_count,
            }
            # Normalize agents output: {name: {maturity, role, description, path}}
            data['agents'] = {
                k: {
                    'maturity': v.get('maturity', 'stub'),
                    'role': v.get('role', k),
                    'description': v.get('description', ''),
                    'path': v.get('path', ''),
                }
                for k, v in data['agents'].items()
            }
            # Normalize skills output: {name: {maturity, description, path}}
            data['skills'] = {
                k: {
                    'maturity': v.get('credentials', {}).get('maturity', 'stub'),
                    'description': v.get('credentials', {}).get('description', ''),
                    'path': v.get('path', ''),
                }
                for k, v in data['skills'].items()
            }
            safe_write_yaml(data, domain_db)
            cat_state[domain.name] = data
        toolboxes_state[cat.name] = cat_state

    STATE['toolboxes.rollups'] = toolboxes_state
    print("  [OK] Toolboxes hydration complete.")

def sync_milestones_for_db(db_path, milestones_dir):
    if not db_path.exists() or not milestones_dir.exists():
        return
    data = safe_read_yaml(db_path)
    if not data:
        return
    if 'milestones' not in data or data['milestones'] is None:
        data['milestones'] = {}
    data['milestones'].clear()
    result = {}
    for item in milestones_dir.iterdir():
        if item.name.startswith('.'):
            continue
        if item.is_file() and item.suffix == '.yaml':
            session_data = safe_read_yaml(item)
            if session_data and 'metadata' in session_data:
                name = item.stem
                data['milestones'][name] = session_data['metadata']
                result[name] = session_data['metadata']
        elif item.is_dir():
            session_yaml = item / f"{item.name}.yaml"
            if session_yaml.exists():
                session_data = safe_read_yaml(session_yaml)
                if session_data and 'metadata' in session_data:
                    data['milestones'][item.name] = session_data['metadata']
                    result[item.name] = session_data['metadata']
    safe_write_yaml(data, db_path)
    return result

def phase1_milestones(configs):
    print("--- Phase 1b: Milestones Hydration ---")
    result = {}
    result['system'] = sync_milestones_for_db(
        DB_DIR / '.system.board.yaml',
        MILESTONES_DIR / '.system.milestones'
    )
    for domain in ['system', 'scaler', 'hustler', 'assets', 'ecoma']:
        if domain in configs:
            board_file = f'{domain}.board.yaml' if domain != 'system' else '.system.board.yaml'
            r = sync_milestones_for_db(
                DB_DIR / board_file,
                MILESTONES_DIR / f'{domain}.milestones'
            )
            result[domain] = r
    STATE['milestones'] = result
    print("  [OK] Milestones hydration complete.")

# ═══════════════════════════════════════════════════════════════════
# Phase 2: Domain Rollup
# ═══════════════════════════════════════════════════════════════════

def phase2_domain_rollup():
    """Build toolboxes.board.yaml — user controller: status: true/false per domain.
    
    Structure: metadata, state, sync_requests, [category]_toolboxes.
    No hub, no milestones.
    Each domain has: status, rollup_path, description, when_to_use, agents_count, skills_count, agents, skills.
    """
    print("--- Phase 2: Domain Rollup (toolboxes.board.yaml) ---")
    index_path = DB_DIR / 'toolboxes.board.yaml'
    if not index_path.exists():
        return
    data = safe_read_yaml(index_path)
    if not data:
        return
    if 'metadata' not in data:
        data['metadata'] = {}

    # Ensure state and sync_requests exist
    if 'state' not in data or data['state'] is None:
        data['state'] = {'metrics': {}, 'recent_events': []}
    if 'sync_requests' not in data:
        data['sync_requests'] = []

    categories = ['agentic_toolboxes', 'business_toolboxes', 'engineering_toolboxes', 'studio_toolboxes', 'life_toolboxes']
    for cat in categories:
        cat_key = cat
        rollup = f".db/toolboxes.rollups/{cat_key}.rollups"
        if cat_key not in data or data[cat_key] is None:
            data[cat_key] = {'rollup_path': rollup}
        else:
            data[cat_key]['rollup_path'] = rollup
        cat_db_dir = DB_DIR / 'toolboxes.rollups' / f"{cat_key}.rollups"
        disk_domains = set()
        if cat_db_dir.exists():
            for f in cat_db_dir.glob('*.yaml'):
                disk_domains.add(f.stem)
        for domain in list(data[cat_key].keys()):
            if domain == 'rollup_path':
                continue
            domain_entry = data[cat_key].get(domain, {})
            user_status = domain_entry.get('status', False)
            if not status_is_on(user_status):
                data[cat_key][domain] = {
                    'status': False,
                    'rollup_path': f"{rollup}/{domain}.yaml",
                }
                continue
            rollup_path = cat_db_dir / f"{domain}.yaml"
            if rollup_path.exists():
                rollup_data = safe_read_yaml(rollup_path)
                creds = rollup_data.get('credentials', {})
                agents = rollup_data.get('agents', {})
                skills = rollup_data.get('skills', {})
                data[cat_key][domain] = {
                    'status': True,
                    'rollup_path': f"{rollup}/{domain}.yaml",
                    'description': creds.get('description', ''),
                    'when_to_use': creds.get('when_to_use', ''),
                    'agents_count': len(agents),
                    'skills_count': len(skills),
                    'agents': agents,
                    'skills': skills,
                }
            else:
                data[cat_key][domain] = {
                    'status': True,
                    'rollup_path': f"{rollup}/{domain}.yaml",
                }
        for domain in disk_domains:
            if domain not in data[cat_key]:
                data[cat_key][domain] = {
                    'status': False,
                    'rollup_path': f"{rollup}/{domain}.yaml",
                }
    # Remove hub/milestones from board (not needed)
    data.pop('hub', None)
    data.pop('milestones', None)
    safe_write_yaml(data, index_path)
    touch_freshness(data, actor='daemon')
    safe_write_yaml(data, index_path)
    STATE['toolboxes'] = data
    print("  [OK] Domain rollup complete.")

def phase2b_toolboxes_rollup():
    """Build toolboxes.rollup.yaml — agent-facing index.
    
    Only includes toolboxes with status: true in the board.
    Copies credentials from per-domain rollup files.
    """
    print("--- Phase 2b: Toolboxes Rollup ---")
    board_path = DB_DIR / 'toolboxes.board.yaml'
    rollup_path = DB_DIR / 'toolboxes.rollup.yaml'
    if not board_path.exists():
        return
    board_data = safe_read_yaml(board_path)
    if not board_data:
        return

    rollup_output = {
        'metadata': {
            'name': 'toolboxes.rollup',
            'class': 'toolboxes',
            'type': 'rollup',
            'version': '2.0',
            'schema_version': '2.0',
        },
        'credentials': {
            'description': 'Toolboxes rollup — aggregated index of active toolboxes and their skills/agents',
            'when_to_use': 'Read to discover available toolboxes, skills, and agents for task assignment',
            'contains': [],
        },
    }

    categories = ['agentic_toolboxes', 'business_toolboxes', 'engineering_toolboxes', 'studio_toolboxes', 'life_toolboxes']
    for cat in categories:
        if cat not in board_data or board_data[cat] is None:
            continue
        cat_output = {}
        for domain, domain_data in board_data[cat].items():
            if domain == 'rollup_path':
                continue
            if not status_is_on(domain_data.get('status', False)):
                continue
            # Read the per-domain rollup file for full credentials
            rollup_file = DB_DIR / 'toolboxes.rollups' / f"{cat}.rollups" / f"{domain}.yaml"
            if rollup_file.exists():
                domain_rollup = safe_read_yaml(rollup_file)
                creds = domain_rollup.get('credentials', {})
                agents = domain_rollup.get('agents', {})
                skills = domain_rollup.get('skills', {})
                cat_output[domain] = {
                    'status': True,
                    'maturity': creds.get('maturity', 'stub'),
                    'description': creds.get('description', ''),
                    'when_to_use': creds.get('when_to_use', ''),
                    'agents_count': len(agents),
                    'skills_count': len(skills),
                    'agents': agents,
                    'skills': skills,
                }
            else:
                # Fallback to board data
                cat_output[domain] = {
                    'status': True,
                    'maturity': 'stub',
                    'description': domain_data.get('description', ''),
                    'when_to_use': domain_data.get('when_to_use', ''),
                    'agents_count': domain_data.get('agents_count', 0),
                    'skills_count': domain_data.get('skills_count', 0),
                    'agents': domain_data.get('agents', {}),
                    'skills': domain_data.get('skills', {}),
                }
        if cat_output:
            rollup_output[cat] = cat_output
            rollup_output['credentials']['contains'].append(cat)

    safe_write_yaml(rollup_output, rollup_path)
    touch_freshness(rollup_output, actor='daemon')
    safe_write_yaml(rollup_output, rollup_path)
    print("  [OK] Toolboxes rollup complete.")


# ═══════════════════════════════════════════════════════════════════
# Phase 3: Domain Sync
# ═══════════════════════════════════════════════════════════════════

def phase3_core_sync(config):
    print("--- Phase 3a: Core Sync ---")
    db_path = WORKSPACE / config.get('db', '.db/.system.board.yaml')
    if not db_path.exists():
        return
    data = safe_read_yaml(db_path)
    if not data:
        return
    if 'state' not in data:
        data['state'] = {'metrics': {}, 'recent_events': []}
    if 'hub' not in data:
        data['hub'] = {'messages': [], 'backlog': []}
    if 'runtime' not in data:
        data['runtime'] = {'evolution_queue': []}
    global SYSTEM_ERRORS
    sync_requests = data.get('sync_requests', [])
    for err in SYSTEM_ERRORS:
        if err not in sync_requests:
            sync_requests.append(err)
    if SYSTEM_ERRORS:
        ts = datetime.datetime.now().strftime('%H:%M')
        sync_requests.append(f"[{ts}] Error gate: {len(SYSTEM_ERRORS)} system error(s) flagged")
    data['sync_requests'] = sync_requests
    SYSTEM_ERRORS.clear()
    touch_freshness(data, actor='daemon')
    safe_write_yaml(data, db_path)
    STATE['system'] = data
    print("  [OK] Core sync complete.")

def phase3_pipeline_sync(config):
    print(f"--- Phase 3b: Pipeline {config['domain'].title()} Sync ---")
    db_path = WORKSPACE / config['db']
    if not db_path.exists():
        return
    data = safe_read_yaml(db_path)
    if not data:
        return
    modes = config.get('modes', {})
    if config.get('type') == 'project':
        status = modes.get('status', config.get('status', 'off'))
        if 'off' in str(status).lower():
            print(f"  [SKIP] Project is off ({status})")
            return
    else:
        pipeline_status = modes.get('pipeline_status', config.get('status', 'off'))
        if 'off' in str(pipeline_status).lower():
            print(f"  [SKIP] Pipeline is off ({pipeline_status})")
            return
    if 'hub' not in data:
        data['hub'] = {'messages': [], 'backlog': []}
    if 'messages' not in data['hub']:
        data['hub']['messages'] = []
    if 'backlog' not in data['hub']:
        data['hub']['backlog'] = []
    if 'state' not in data or not data['state']:
        data['state'] = {'metrics': {}, 'recent_events': []}
    if config['domain'] == 'scaler':
        _sync_scaler(data, config)
    elif config['domain'] == 'hustler':
        _sync_hustler(data, config)
    elif config['domain'] in ('assets', 'ecoma'):
        _sync_project(data, config)
    state = data.get('state') or data.setdefault('state', {})
    recent = state.get('recent_events') or []
    if len(recent) > 3:
        state['recent_events'] = recent[-3:]
    touch_freshness(data, actor='daemon')
    safe_write_yaml(data, db_path)
    STATE[config['domain']] = data
    print(f"  [OK] {config['domain'].title()} sync complete.")

def _sync_scaler(data, config):
    ledgers_dir = WORKSPACE / config['ledgers']
    if not ledgers_dir.exists():
        return
    global_scaled = 0
    global_proposals = 0
    global_solutions = 0
    global_sources = 0
    pillars = config.get('pillars', [])
    for pillar in pillars:
        proposals_ledger = ledgers_dir / f"{pillar}.proposals.yaml"
        sources_ledger = ledgers_dir / f"{pillar}.sources.yaml"
        if proposals_ledger.exists():
            p_data = safe_read_yaml(proposals_ledger)
            if p_data:
                tracked = p_data.get('tracked_gaps', [])
                history = p_data.get('history', [])
                global_proposals += len(tracked) if isinstance(tracked, list) else 0
                global_solutions += len(history) if isinstance(history, list) else 0
                global_scaled += len(history) if isinstance(history, list) else 0
                metrics = p_data.get('metadata', {}).get('metrics', {})
                metrics['active'] = global_proposals
                metrics['resolved'] = global_solutions
                metrics['proposed'] = global_proposals
                if 'metadata' not in p_data:
                    p_data['metadata'] = {}
                p_data['metadata']['metrics'] = metrics
                safe_write_yaml(p_data, proposals_ledger)
        if sources_ledger.exists():
            s_data = safe_read_yaml(sources_ledger)
            if s_data:
                tracked = s_data.get('tracked_sources', s_data.get('tracked_discoveries', []))
                global_sources += len(tracked) if isinstance(tracked, list) else 0
                metrics = s_data.get('metadata', {}).get('metrics', {})
                metrics['total'] = global_sources
                if 'metadata' not in s_data:
                    s_data['metadata'] = {}
                s_data['metadata']['metrics'] = metrics
                safe_write_yaml(s_data, sources_ledger)
    metrics = data.setdefault('state', {}).setdefault('metrics', {})
    metrics['scaled'] = global_scaled
    metrics['proposals'] = global_proposals
    metrics['solutions'] = global_solutions
    metrics['sources'] = global_sources
    state = data.setdefault('state', {})
    events = state.setdefault('recent_events', [])
    ts = datetime.datetime.now().strftime('%H:%M')
    events.append(f"[{ts}] Scanned 3 pillars: {global_proposals} gaps, {global_solutions} solutions, {global_scaled} systems scaled")
    data['state'] = state

def _sync_hustler(data, config):
    ledgers_dir = WORKSPACE / config['ledgers']
    if not ledgers_dir.exists():
        return
    global_products = 0
    global_features = 0
    global_active_pipelines = 0
    for focus_ledger in ledgers_dir.glob('*.focus.yaml'):
        focus_name = focus_ledger.name.replace('.focus.yaml', '')
        p_data = safe_read_yaml(focus_ledger)
        if not p_data:
            continue
        global_active_pipelines += 1
        if 'tracked_products' in p_data:
            global_products += len(p_data['tracked_products'])
        if 'tracked_features' in p_data:
            global_features += len(p_data['tracked_features'])
        if 'metadata' not in p_data:
            p_data['metadata'] = {}
        if 'metrics' not in p_data['metadata']:
            p_data['metadata']['metrics'] = {}
        p_data['metadata']['metrics']['products'] = global_products
        p_data['metadata']['metrics']['pending_products'] = global_products
        p_data['metadata']['metrics']['features'] = global_features
        p_data['metadata']['metrics']['pending_features'] = global_features
        safe_write_yaml(p_data, focus_ledger)
    for source_ledger in ledgers_dir.glob('*.sources.yaml'):
        s_data = safe_read_yaml(source_ledger)
        if not s_data:
            continue
        if 'metadata' not in s_data:
            s_data['metadata'] = {}
        if 'metrics' not in s_data['metadata']:
            s_data['metadata']['metrics'] = {}
        tracked = s_data.get('tracked_sources', [])
        s_data['metadata']['metrics']['total'] = len(tracked) if isinstance(tracked, list) else 0
        safe_write_yaml(s_data, source_ledger)
    if not isinstance(data.get('state'), dict):
        data['state'] = {'metrics': {}, 'recent_events': []}
    state = data['state']
    state.setdefault('metrics', {})
    state['metrics']['throughput'] = global_products
    state['metrics']['active_pipelines'] = global_active_pipelines
    if not isinstance(state.get('recent_events'), list):
        state['recent_events'] = []
    events = state['recent_events']
    ts = datetime.datetime.now().strftime('%H:%M')
    events.append(f"[{ts}] Hustler: {global_active_pipelines} active pipelines, {global_products} products indexed")
    data['state'] = state

def _sync_project(data, config):
    scan_folders = config.get('scan_folders', {})
    if not scan_folders:
        return
    domain = config.get('domain', 'assets')
    active = 0
    completed = 0
    pending = 0
    for folder_name, folder_type in scan_folders.items():
        folder_path = WORKSPACE / f'project_{domain}' / folder_name
        if folder_path.exists() and folder_path.is_dir():
            for item in folder_path.iterdir():
                if item.is_dir() and not item.name.startswith('.'):
                    if folder_type == 'active':
                        active += 1
                    elif folder_type == 'pending':
                        pending += 1
    metrics = data.setdefault('state', {}).setdefault('metrics', {})
    metrics['active'] = active
    metrics['completed'] = completed
    metrics['pending'] = pending
    events = data.setdefault('state', {}).setdefault('recent_events', [])
    ts = datetime.datetime.now().strftime('%H:%M')
    events.append(f"[{ts}] Scanned: {active} active, {pending} pending, {completed} completed")

# ═══════════════════════════════════════════════════════════════════
# Phase 4: Telemetry
# ═══════════════════════════════════════════════════════════════════

def phase4_telemetry():
    print("--- Phase 4: Telemetry Update ---")
    db_path = DB_DIR / '.system.board.yaml'
    if not db_path.exists():
        return
    data = safe_read_yaml(db_path)
    if not data:
        return
    if 'metadata' not in data:
        data['metadata'] = {}
    freshness = data.get('metadata', {}).get('freshness', {})
    freshness['sync_count'] = int(freshness.get('sync_count', 0)) + 1
    if 'metadata' not in data:
        data['metadata'] = {}
    data['metadata']['freshness'] = freshness
    safe_write_yaml(data, db_path)
    STATE['system'] = data
    print("  [OK] Telemetry updated.")

# ═══════════════════════════════════════════════════════════════════
# Full Sync
# ═══════════════════════════════════════════════════════════════════

def run_sync():
    print("═══════════════════════════════════════")
    print("  Agentic OS Sync Starting...")
    print("═══════════════════════════════════════")

    if not phase0_health_check():
        print("[!] Health check failed. Aborting sync.")
        return False

    configs = load_domain_configs()

    STATE['indexes'] = load_all_indexes()
    index_issues = validate_indexes()
    if index_issues:
        for issue in index_issues:
            print(f"  [WARN] {issue}")

    phase1_toolboxes()
    phase1_milestones(configs)
    phase2_domain_rollup()
    phase2b_toolboxes_rollup()

    for domain, config in configs.items():
        if config.get('type') == 'core':
            phase3_core_sync(config)
        elif config.get('type') in ('pipeline', 'project'):
            phase3_pipeline_sync(config)

    phase4_telemetry()

    print("═══════════════════════════════════════")
    print("  Sync complete.")
    print("═══════════════════════════════════════")
    return True


# ═══════════════════════════════════════════════════════════════════
# HTTP Server (Dashboard API)
# ═══════════════════════════════════════════════════════════════════

EDITABLE_DB_FILES = {
    'system': '.db/.system.board.yaml',
    'system_identity': '.db/.system.index.yaml',
    'config': 'config.yaml',
    'index': 'index.yaml',
    'system_index': '.db/.system.index.yaml',
    'scaler': '.db/pipeline_scaler.board.yaml',
    'scaler_index': '.db/pipeline_scaler.index.yaml',
    'hustler': '.db/pipeline_hustler.board.yaml',
    'hustler_index': '.db/pipeline_hustler.index.yaml',
    'assets': '.db/project_assets.board.yaml',
    'assets_index': '.db/project_assets.index.yaml',
    'ecoma': '.db/project_ecoma.board.yaml',
    'ecoma_index': '.db/project_ecoma.index.yaml',
    'toolboxes': '.db/toolboxes.board.yaml',
    'scaler_inbox': '.db/pipeline_scaler.ledgers/.mixed_inbox.yaml',
    'fi_sources': '.db/pipeline_scaler.ledgers/Foundational_Integrity.sources.yaml',
    'fi_proposals': '.db/pipeline_scaler.ledgers/Foundational_Integrity.proposals.yaml',
    'om_sources': '.db/pipeline_scaler.ledgers/Operational_Muscles.sources.yaml',
    'om_proposals': '.db/pipeline_scaler.ledgers/Operational_Muscles.proposals.yaml',
    'vg_sources': '.db/pipeline_scaler.ledgers/Value_Generation.sources.yaml',
    'vg_proposals': '.db/pipeline_scaler.ledgers/Value_Generation.proposals.yaml',
    'hustler_inbox': '.db/pipeline_hustler.ledgers/.mixed_inbox.yaml',
    'algerian_ecommerce_focus': '.db/pipeline_hustler.ledgers/algerian-ecommerce.focus.yaml',
    'algerian_ecommerce_sources': '.db/pipeline_hustler.ledgers/algerian-ecommerce.sources.yaml',
}

class DashboardHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def log_message(self, format, *args):
        if args and str(args[1]) not in ('200', '304'):
            super().log_message(format, *args)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path == '/api/state':
            self.handle_api_state()
        elif path == '/api/db':
            self.handle_api_db_read(parsed)
        elif path == '/api/system_archives':
            self.handle_api_archives()
        elif path == '/api/index':
            self.handle_api_index()
        elif path.startswith('/api/law'):
            self.handle_api_law(parsed)
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path == '/api/sync':
            self.handle_api_sync()
        elif path == '/api/update_mode':
            self.handle_api_update_mode()
        elif path == '/api/update_db':
            self.handle_api_update_db()
        elif path == '/api/proposal_action':
            self.handle_api_proposal_action()
        elif path == '/api/triage':
            self.handle_api_triage()
        elif path == '/api/update_session':
            self.handle_api_update_session()
        elif path == '/api/update_goal':
            self.handle_api_update_goal()
        else:
            self.send_error(404, "Not Found")

    def _read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        return json.loads(self.rfile.read(length).decode('utf-8')) if length else {}

    def handle_api_state(self):
        try:
            configs = load_domain_configs()
            sys_config = configs.get('system', {})
            sys_modes = sys_config.get('modes', {})
            all_indexes = STATE.get('indexes', {})
            sys_data = STATE.get('system', {})
            controller = {
                'metadata': sys_data.get('metadata', {}),
                'system': {
                    'sync_errors': sys_data.get('system', {}).get('sync_errors', []),
                    'evolution_queue': sys_data.get('system', {}).get('evolution_queue', []),
                },
                'core': {
                    'recent_events': sys_data.get('state', {}).get('recent_events', []),
                    'modes': sys_modes,
                    'milestones': sys_data.get('milestones', {}),
                },
                'pipelines': {
                    'scaler': STATE.get('scaler', {}),
                    'hustler': STATE.get('hustler', {}),
                },
                'projects': {
                    'modes': sys_config.get('projects', {}),
                    'projects': {
                        'project_assets': STATE.get('assets', {}),
                        'project_ecoma': STATE.get('ecoma', {}),
                    },
                },
                'toolboxes': STATE.get('toolboxes', {}),
                'indexes': all_indexes,
            }
            send_json(self, 200, {'controller': controller, 'db_files': list(EDITABLE_DB_FILES.keys())})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    def handle_api_db_read(self, parsed):
        try:
            qs = parse_qs(parsed.query)
            file_key = qs.get('file', [None])[0]
            if not file_key or file_key not in EDITABLE_DB_FILES:
                send_json(self, 400, {'error': f'Unknown file key: {file_key}. Valid: {list(EDITABLE_DB_FILES.keys())}'})
                return
            full_path = WORKSPACE / EDITABLE_DB_FILES[file_key]
            data = load_yaml(full_path)
            send_json(self, 200, {'file': file_key, 'path': EDITABLE_DB_FILES[file_key], 'data': data})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    def handle_api_archives(self):
        try:
            archives_dir = WORKSPACE / 'pipeline_scaler' / '.scaler_runtime' / '.scaler_archive'
            archives = []
            if archives_dir.exists():
                for root, _, files in os.walk(archives_dir):
                    for file in files:
                        if file.endswith('.yaml'):
                            data = load_yaml(os.path.join(root, file))
                            if data:
                                archives.append(data)
            archives.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            send_json(self, 200, {'archives': archives})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    def handle_api_law(self, parsed):
        try:
            qs = parse_qs(parsed.query)
            law_name = qs.get('name', [None])[0]
            if not law_name:
                send_json(self, 400, {'error': "'name' param required"})
                return
            clean = "".join(c for c in law_name if c.isalnum() or c in ('_', '-'))
            sys_index = load_index('system', 'identity')
            if clean + '.md' in sys_index:
                law_path = WORKSPACE / sys_index[clean + '.md']['path']
                if law_path.exists():
                    content = law_path.read_text(encoding='utf-8')
                    send_json(self, 200, {'name': clean, 'content': content})
                    return
            identity_dir = IDENTITY_DIR
            for root, dirs, files in os.walk(identity_dir):
                if f"{clean}.md" in files:
                    law_path = os.path.join(root, f"{clean}.md")
                    with open(law_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    send_json(self, 200, {'name': clean, 'content': content})
                    return
            send_json(self, 404, {'error': f"Law '{clean}' not found"})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    def handle_api_update_db(self):
        try:
            params = self._read_body()
            file_key = params.get('file')
            key_path = params.get('key_path')
            value = params.get('value')
            if not file_key or file_key not in EDITABLE_DB_FILES:
                send_json(self, 400, {'error': f'Unknown file key: {file_key}'})
                return
            if not key_path:
                send_json(self, 400, {'error': 'key_path is required'})
                return
            full_path = WORKSPACE / EDITABLE_DB_FILES[file_key]
            data = load_yaml(full_path)
            set_nested(data, key_path, value)
            save_yaml(full_path, data)
            STATE[file_key] = data
            send_json(self, 200, {'success': True, 'file': file_key, 'key_path': key_path, 'value': value})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    def handle_api_update_mode(self):
        try:
            params = self._read_body()
            subsystem = params.get('subsystem')
            key = params.get('key')
            value = params.get('value')
            if not subsystem or not key or value is None:
                send_json(self, 400, {'error': 'Missing parameters'})
                return
            config_path = WORKSPACE / 'config.yaml'
            config_data = load_yaml(config_path)
            if subsystem == 'system':
                config_data.setdefault('modes', {}).setdefault('system', {})[key] = value
            else:
                config_data.setdefault('modes', {}).setdefault('system', {})[key] = value
            save_yaml(config_path, config_data)
            send_json(self, 200, {'success': True, 'subsystem': subsystem, 'key': key, 'value': value})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    def handle_api_proposal_action(self):
        try:
            params = self._read_body()
            proposal_id = params.get('proposal_id')
            action = params.get('action', '').upper()
            reason = params.get('reason', '')
            if not proposal_id or action not in ('APPROVE', 'REJECT'):
                send_json(self, 400, {'error': 'proposal_id and action (APPROVE|REJECT) required'})
                return
            new_status = 'APPROVED' if action == 'APPROVE' else 'REJECTED'
            file_key = 'scaler'
            full_path = WORKSPACE / EDITABLE_DB_FILES[file_key]
            data = load_yaml(full_path)
            queue = (data.get('runtime', {}).get('review_queue') or [])
            if isinstance(queue, list):
                for item in queue:
                    if isinstance(item, dict) and item.get('id') == proposal_id:
                        item['status'] = new_status
                        if reason:
                            item['rejection_reason'] = reason
                        break
                if 'runtime' not in data: data['runtime'] = {}
                data['runtime']['review_queue'] = queue
                save_yaml(full_path, data)
                STATE[file_key] = data
            send_json(self, 200, {'success': True, 'proposal_id': proposal_id, 'new_status': new_status})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    def handle_api_triage(self):
        try:
            params = self._read_body()
            filename = params.get('filename')
            if not filename:
                send_json(self, 400, {'error': "'filename' required"})
                return
            clean = os.path.basename(filename)
            inbox = WORKSPACE / 'pipeline_hustler' / '_HUSTLER-EXTERNAL_SOURCES' / '.hustler_mixed_inbox'
            target = WORKSPACE / 'pipeline_hustler' / '_HUSTLER-EXTERNAL_SOURCES' / '_algerian-ecommerce_inbox'
            src = inbox / clean
            dst = target / clean
            if not src.exists():
                send_json(self, 404, {'error': f"{clean} not found"})
                return
            os.makedirs(target, exist_ok=True)
            os.rename(src, dst)
            send_json(self, 200, {'success': True, 'moved': clean})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    def handle_api_update_session(self):
        try:
            params = self._read_body()
            session_name = params.get('session_name')
            status = params.get('status')
            if not session_name or not status:
                send_json(self, 400, {'error': 'Missing params'})
                return
            roots = [
                WORKSPACE / '.system_milestones',
                MILESTONES_DIR / 'pipeline_scaler_milestones',
                MILESTONES_DIR / 'pipeline_hustler_milestones',
                MILESTONES_DIR / 'project_assets_milestones',
                MILESTONES_DIR / 'project_ecoma_milestones',
            ]
            session_dir = None
            for root in roots:
                if root.exists():
                    for r, dirs, _ in os.walk(root):
                        if session_name in dirs:
                            session_dir = r / session_name
                            break
                if session_dir:
                    break
            if not session_dir:
                send_json(self, 404, {'error': f"Session {session_name} not found"})
                return
            sess_path = session_dir / f'{session_name}.yaml'
            data = load_yaml(sess_path)
            data.setdefault('metadata', {})['status'] = status
            save_yaml(sess_path, data)
            signal_sync()
            send_json(self, 200, {'success': True})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    def handle_api_update_goal(self):
        try:
            params = self._read_body()
            session_name = params.get('session_name')
            goal_name = params.get('goal_name')
            status = params.get('status')
            if not session_name or not goal_name or not status:
                send_json(self, 400, {'error': 'Missing params'})
                return
            roots = [
                WORKSPACE / '.system_milestones',
                MILESTONES_DIR / 'pipeline_scaler_milestones',
                MILESTONES_DIR / 'pipeline_hustler_milestones',
                MILESTONES_DIR / 'project_assets_milestones',
                MILESTONES_DIR / 'project_ecoma_milestones',
            ]
            session_dir = None
            for root in roots:
                if root.exists():
                    for r, dirs, _ in os.walk(root):
                        if session_name in dirs:
                            session_dir = r / session_name
                            break
                if session_dir:
                    break
            if not session_dir:
                send_json(self, 404, {'error': f"Session {session_name} not found"})
                return
            goal_path = session_dir / goal_name / 'GOAL.yaml'
            data = load_yaml(goal_path)
            data.setdefault('metadata', {})['status'] = status
            data.setdefault('execution', {}).setdefault('state', {})['last_progress_at'] = datetime.datetime.now().isoformat()
            save_yaml(goal_path, data)
            signal_sync()
            send_json(self, 200, {'success': True})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    def handle_api_sync(self):
        try:
            signal_sync()
            send_json(self, 200, {'message': ' Sync signaled — will run within 5s'})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    def handle_api_index(self):
        try:
            all_indexes = load_all_indexes()
            send_json(self, 200, {'data': all_indexes, 'path': 'index.yaml'})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})


def signal_sync():
    """Signal the sync thread to run."""
    global LAST_SYNC_TIME
    LAST_SYNC_TIME = 0


def monitor_dashboard_status(httpd):
    """Watch dashboard_status in memory, shut down server if turned off."""
    while True:
        try:
            configs = load_domain_configs()
            sys_config = configs.get('system', {})
            status = sys_config.get('modes', {}).get('dashboard_status', 'on')
            if 'off' in str(status).lower():
                print("\n[!] Dashboard turned off — shutting down.")
                threading.Thread(target=httpd.shutdown).start()
                break
        except Exception:
            pass
        time.sleep(5)


# ═══════════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════════

def run_once():
    """Single sync pass."""
    run_sync()

def run_daemon():
    """Continuous sync + serve."""
    print(f"Agentic OS Engine running (sync every 5s, dashboard on :{PORT})...")
    print("Press Ctrl+C to stop.")

    pid_file = WORKSPACE / '.infra' / 'boot.pid'
    pid_file.write_text(json.dumps({
        'pid': os.getpid(),
        'started_at': datetime.datetime.now().isoformat(),
        'engine': 'main',
        'mode': 'daemon'
    }))

    run_sync()

    httpd = HTTPServer(('0.0.0.0', PORT), DashboardHandler)
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()

    monitor_thread = threading.Thread(target=monitor_dashboard_status, args=(httpd,), daemon=True)
    monitor_thread.start()

    try:
        while True:
            time.sleep(5)
            run_sync()
    except KeyboardInterrupt:
        print("\n[!] Shutting down Engine.")
        httpd.shutdown()
        pid_file = WORKSPACE / '.infra' / 'boot.pid'
        if pid_file.exists():
            pid_file.unlink()

def main():
    parser = argparse.ArgumentParser(description="Agentic OS Engine")
    parser.add_argument("--once", action="store_true", help="Single sync pass")
    parser.add_argument("--serve", action="store_true", help="Serve only (no sync)")
    parser.add_argument("--validate", action="store_true", help="Run schema validation only")
    parser.add_argument("--daemon", action="store_true", help="Continuous sync + serve")
    args = parser.parse_args()

    if args.validate:
        from pathlib import Path as P2
        schema_dir = DB_DIR / '.schemas'
        if not schema_dir.exists():
            print("No schema directory found.")
            sys.exit(1)
        print("--- Schema Validation ---")
        errors = 0
        required_dbs = ['.system.board.yaml', 'pipeline_scaler.board.yaml', 'pipeline_hustler.board.yaml', 'project_assets.board.yaml', 'project_ecoma.board.yaml']
        required_keys = ['metadata', 'state']
        for db_name in required_dbs:
            db_path = DB_DIR / db_name
            if not db_path.exists():
                print(f"  [ERR] Missing: {db_name}")
                errors += 1
            else:
                data = safe_read_yaml(db_path)
                if 'metadata' not in data:
                    print(f"  [ERR] {db_name}: missing metadata")
                    errors += 1
                elif 'state' not in data:
                    print(f"  [ERR] {db_name}: missing state")
                    errors += 1
                else:
                    print(f"  [OK] {db_name}")
        if errors:
            print(f"\nValidation failed: {errors} error(s)")
            sys.exit(1)
        else:
            print("\nValidation passed: all DBs conform.")
            sys.exit(0)
    elif args.once:
        run_once()
    elif args.serve:
        print(f"Dashboard serving on :{PORT}...")
        httpd = HTTPServer(('0.0.0.0', PORT), DashboardHandler)
        monitor_thread = threading.Thread(target=monitor_dashboard_status, args=(httpd,), daemon=True)
        monitor_thread.start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            httpd.shutdown()
    else:
        run_daemon()

if __name__ == '__main__':
    main()
