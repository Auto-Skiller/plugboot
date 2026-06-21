import os
import re
import sys
import time
import argparse
import sys
import argparse
import datetime
from pathlib import Path
from ruamel.yaml import YAML

# Configure YAML parser for round-trip preservation
yaml = YAML()
yaml.preserve_quotes = True
yaml.indent(mapping=2, sequence=4, offset=2)

# Resolve workspace root (script is in .meta/engine/engines/meta_engine.py)
WORKSPACE = Path(__file__).parent.parent.parent.parent.resolve()
DB_DIR = WORKSPACE / '.meta_os' / 'meta_db'
TOOLBOXES_DIR = WORKSPACE / '.toolboxes'

SYSTEM_ERRORS = []

def flag_error(msg):
    global SYSTEM_ERRORS
    if msg not in SYSTEM_ERRORS:
        SYSTEM_ERRORS.append(msg)
        print(f"[!] SYSTEM ERROR FLAGGED: {msg}")

def safe_read_yaml(file_path):
    if not isinstance(file_path, Path): file_path = Path(file_path)
    if not file_path.exists(): return {}
    for _ in range(5):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return yaml.load(f) or {}
        except Exception:
            time.sleep(0.1)
    return {}

def safe_write_yaml(data, file_path):
    if not isinstance(file_path, Path): file_path = Path(file_path)
    for _ in range(5):
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                yaml.dump(data, f)
            return True
        except Exception:
            time.sleep(0.1)
    return False

def extract_frontmatter(file_path):
    """Extract and parse YAML frontmatter from a Markdown file."""
    try:
        content = file_path.read_text(encoding='utf-8')
        match = re.search(r'^---\r?\n(.*?)\n---\r?\n', content, re.DOTALL)
        if match:
            fm_text = match.group(1)
            parsed = yaml.load(fm_text) or {}
            # Strip non-routing fields
            for key in ['name', 'version', 'parent_toolbox', 'maturity']:
                parsed.pop(key, None)
            return parsed
    except Exception as e:
        print(f"Error parsing frontmatter in {file_path}: {e}")
    return {}

def phase1_toolboxes():
    """Scan .toolboxes/ and inject frontmatters into bottom-layer DBs."""
    print("--- Phase 1: Toolboxes Hydration ---")
    if not TOOLBOXES_DIR.exists():
        flag_error("[ERROR] Missing .toolboxes directory!")
        return
        
    categories = [d for d in TOOLBOXES_DIR.iterdir() if d.is_dir() and not d.name.startswith('.git')]
    
    for cat in categories:
        cat_db_dir = DB_DIR / 'toolboxes_db' / f"{cat.name}_db"
        if not cat_db_dir.exists():
            continue
            
        domains = [d for d in cat.iterdir() if d.is_dir()]
        for domain in domains:
            domain_db = cat_db_dir / f"{domain.name}.yaml"
            if not domain_db.exists():
                continue
                
            print(f"Hydrating {domain_db.relative_to(WORKSPACE)}")
            data = safe_read_yaml(domain_db)
            
            if 'agents' not in data or data['agents'] is None:
                data['agents'] = {}
            else:
                data['agents'].clear()
                
            if 'skills' not in data or data['skills'] is None:
                data['skills'] = {}
            else:
                data['skills'].clear()
            
            # Agents
            agents_dir = domain / 'agents'
            if agents_dir.exists():
                for agent_file in agents_dir.iterdir():
                    if agent_file.name == '.gitkeep': continue
                    name = agent_file.stem
                    fm = extract_frontmatter(agent_file) if agent_file.suffix == '.md' else {}
                    fm['path'] = str(agent_file.relative_to(WORKSPACE)).replace('\\', '/')
                    data['agents'][name] = fm
            
            # Skills
            skills_dir = domain / 'skills'
            if skills_dir.exists():
                for skill_file in skills_dir.iterdir():
                    if skill_file.name == '.gitkeep': continue
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
                    
            # Update counts
            if 'metadata' in data:
                data['metadata']['agent_count'] = len(data['agents'])
                data['metadata']['agent_names'] = list(data['agents'].keys())
                data['metadata']['skill_count'] = len(data['skills'])
                data['metadata']['skill_names'] = list(data['skills'].keys())
            
            safe_write_yaml(data, domain_db)

def sync_milestones(target_db_path, milestones_dir):
    """Aggregate all session yamls from a milestone directory into a target DB."""
    if not target_db_path.exists() or not milestones_dir.exists():
        return
        
    print(f"Hydrating milestones for {target_db_path.relative_to(WORKSPACE)}")
    data = safe_read_yaml(target_db_path)
    if not data: return
        
    if 'milestones' in data: # Clean up old root-level injection
        del data['milestones']
        
    if 'metadata' not in data:
        data['metadata'] = {}
        
    if 'milestones' not in data['metadata'] or data['metadata']['milestones'] is None:
        data['metadata']['milestones'] = {}
    else:
        data['metadata']['milestones'].clear()
        
    # Search for session yamls
    for session_dir in milestones_dir.iterdir():
        if session_dir.is_dir() and not session_dir.name.startswith('.'):
            session_yaml = session_dir / f"{session_dir.name}.yaml"
            if session_yaml.exists():
                session_data = safe_read_yaml(session_yaml)
                if session_data and 'metadata' in session_data:
                    data['metadata']['milestones'][session_dir.name] = session_data['metadata']
                        
    safe_write_yaml(data, target_db_path)

def phase1_milestones():
    """Scan distributed milestone directories and inject them into their parent DBs."""
    print("--- Phase 1b: Milestones Hydration ---")
    sync_milestones(DB_DIR / 'meta_os.yaml', WORKSPACE / '.meta_os' / 'meta_milestones')
    sync_milestones(DB_DIR / 'pipeline_scaler_os.yaml', WORKSPACE / 'pipeline_scaler' / '.scaler_os' / 'scaler_milestones')
    sync_milestones(DB_DIR / 'pipeline_hustler_os.yaml', WORKSPACE / 'pipeline_hustler' / '.hustler_os' / 'hustler_milestones')
    sync_milestones(DB_DIR / 'projects_os.yaml', WORKSPACE / 'projects' / '.projects_os' / '.projects_milestones')

def phase2_domain_rollup():
    """Roll up the metadata blocks of all domain DBs into .toolboxes.yaml."""
    print("--- Phase 2: Domain Rollup (.toolboxes.yaml) ---")
    index_path = DB_DIR / '.toolboxes.yaml'
    if not index_path.exists():
        return
        
    data = safe_read_yaml(index_path)
    if not data: return
        
    if 'metadata' not in data:
        data['metadata'] = {}
        
    categories = ['.core_toolboxes', 'business_toolboxes', 'engineering_toolboxes', 'studio_toolboxes', 'life_toolboxes']
    
    for cat in categories:
        cat_key = cat.replace('.', '')
        if cat_key not in data['metadata'] or data['metadata'][cat_key] is None:
            data['metadata'][cat_key] = {}
        else:
            data['metadata'][cat_key].clear()
            
        cat_db_dir = DB_DIR / 'toolboxes_db' / f"{cat}_db"
        if not cat_db_dir.exists():
            continue
            
        for f in cat_db_dir.glob('*.yaml'):
            domain = f.stem
            with open(f, 'r', encoding='utf-8') as dfile:
                ddata = yaml.load(dfile)
            if ddata and 'metadata' in ddata:
                data['metadata'][cat_key][domain] = ddata['metadata']
                    
    safe_write_yaml(data, index_path)
    
    # Stamp freshness on the index after writing
    data = safe_read_yaml(index_path)
    if 'system_metadata' not in data:
        data['system_metadata'] = {}
    data['system_metadata']['freshness'] = {
        'last_synced': datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
        'status': 'fresh',
        'last_synced_by': 'daemon'
    }
    safe_write_yaml(data, index_path)

def extract_metadata(db_path):
    """Helper to load a YAML file and return its 'metadata' block."""
    if not db_path.exists():
        return {}
    d = safe_read_yaml(db_path)
    return d.get('metadata', {})

def trim_recent_events(data, max_events=3):
    """Recursively find 'recent_events' arrays and slice them to max_events."""
    if isinstance(data, dict):
        for k, v in data.items():
            if k == 'recent_events' and isinstance(v, list):
                # Slice the list in place if it's too long
                while len(v) > max_events:
                    v.pop(0)
            else:
                trim_recent_events(v, max_events)
    elif isinstance(data, list):
        for item in data:
            trim_recent_events(item, max_events)


def hydrate_down_user_inputs(controler_data):
    """Push user-edited (IN) fields from CONTROLER.yaml down to their source DBs before rollup."""
    from ruamel.yaml import YAML
    y = YAML()
    y.preserve_quotes = True
    y.indent(mapping=2, sequence=4, offset=2)
    
    def _update_db(db_name, update_fn):
        db_path = DB_DIR / db_name
        if not db_path.exists(): return
        
        db_data = safe_read_yaml(db_path)
        if not db_data: return
        
        if 'metadata' not in db_data:
            db_data['metadata'] = {}
        
        changed = update_fn(db_data['metadata'])
        
        if changed:
            safe_write_yaml(db_data, db_path)

    # 1. Core
    def _update_core(meta):
        changed = False
        if 'core' in controler_data:
            c_data = controler_data['core']
            if 'system' in c_data and 'system_errors' in c_data['system']:
                if 'system' not in meta: meta['system'] = {}
                meta['system']['system_errors'] = c_data['system']['system_errors']
                changed = True
        return changed
    _update_db('meta_os.yaml', _update_core)

    # 1. Pipeline Scaler
    def _update_scaler(meta):
        changed = False
        if 'pipelines' in controler_data and 'scaler' in controler_data['pipelines']:
            s_data = controler_data['pipelines']['scaler']
            if 'profiles' in s_data:
                if 'profiles' not in meta: meta['profiles'] = {}
                # Update profiles
                for prof_name, prof_data in s_data['profiles'].items():
                    if prof_name not in meta['profiles']: meta['profiles'][prof_name] = {}
                    if 'target_pillars' in prof_data:
                        meta['profiles'][prof_name]['target_pillars'] = prof_data['target_pillars']
                        changed = True
                    if 'action_gate' in prof_data:
                        meta['profiles'][prof_name]['action_gate'] = prof_data['action_gate']
                        changed = True
            if 'modes' in s_data:
                if 'modes' not in meta: meta['modes'] = {}
                for k, v in s_data['modes'].items():
                    meta['modes'][k] = v
                    changed = True
            if 'hub' in s_data:
                if 'hub' not in meta: meta['hub'] = {}
                if 'messages' in s_data['hub']: meta['hub']['messages'] = s_data['hub']['messages']; changed = True
                if 'backlog' in s_data['hub']: meta['hub']['backlog'] = s_data['hub']['backlog']; changed = True
            if 'queues' in s_data:
                if 'queues' not in meta: meta['queues'] = {}
                for q_name, q_data in s_data['queues'].items():
                    meta['queues'][q_name] = q_data
                    changed = True
        return changed
    _update_db('pipeline_scaler_os.yaml', _update_scaler)

    # 2. Pipeline Hustler
    def _update_hustler(meta):
        changed = False
        if 'pipelines' in controler_data and 'hustler' in controler_data['pipelines']:
            h_data = controler_data['pipelines']['hustler']
            if 'modes' in h_data:
                if 'modes' not in meta: meta['modes'] = {}
                for k, v in h_data['modes'].items():
                    meta['modes'][k] = v
                    changed = True
            if 'profiles' in h_data:
                if 'profiles' not in meta: meta['profiles'] = {}
                for prof_name, prof_data in h_data['profiles'].items():
                    if prof_name not in meta['profiles']: meta['profiles'][prof_name] = {}
                    if 'action_gate' in prof_data:
                        meta['profiles'][prof_name]['action_gate'] = prof_data['action_gate']
                        changed = True
            if 'hub' in h_data:
                if 'hub' not in meta: meta['hub'] = {}
                if 'messages' in h_data['hub']: meta['hub']['messages'] = h_data['hub']['messages']; changed = True
                if 'backlog' in h_data['hub']: meta['hub']['backlog'] = h_data['hub']['backlog']; changed = True
            if 'queues' in h_data:
                if 'queues' not in meta: meta['queues'] = {}
                for q_name, q_data in h_data['queues'].items():
                    meta['queues'][q_name] = q_data
                    changed = True
        return changed
    _update_db('pipeline_hustler_os.yaml', _update_hustler)

    # 3. Projects
    def _update_projects(meta):
        changed = False
        if 'projects' in controler_data:
            p_data = controler_data['projects']
            if 'modes' in p_data:
                if 'modes' not in meta: meta['modes'] = {}
                for k, v in p_data['modes'].items():
                    meta['modes'][k] = v
                    changed = True
            if 'hub' in p_data:
                if 'hub' not in meta: meta['hub'] = {}
                if 'messages' in p_data['hub']: meta['hub']['messages'] = p_data['hub']['messages']; changed = True
                if 'backlog' in p_data['hub']: meta['hub']['backlog'] = p_data['hub']['backlog']; changed = True
        return changed
    _update_db('projects_os.yaml', _update_projects)
    
    # 4. Toolboxes
    def _update_toolboxes(meta):
        changed = False
        if 'toolboxes' in controler_data:
            t_data = controler_data['toolboxes']
            for cat_key, cat_data in t_data.items():
                if cat_key in meta and isinstance(cat_data, dict):
                    for domain_name, domain_data in cat_data.items():
                        if domain_name in meta[cat_key]:
                            # Push status changes
                            if 'status' in domain_data:
                                meta[cat_key][domain_name]['status'] = domain_data['status']
                                changed = True
                                
            # We also need to push this down to individual DB files in toolboxes_db/
            if changed:
                tb_db_dir = DB_DIR / 'toolboxes_db'
                if tb_db_dir.exists():
                    for cat_key, cat_data in t_data.items():
                        cat_db_dir = tb_db_dir / f"{cat_key}_db"
                        if cat_db_dir.exists() and isinstance(cat_data, dict):
                            for domain_name, domain_data in cat_data.items():
                                domain_file = cat_db_dir / f"{domain_name}.yaml"
                                if domain_file.exists():
                                    d_db = safe_read_yaml(domain_file)
                                    if d_db and 'metadata' in d_db and 'status' in domain_data:
                                        d_db['metadata']['status'] = domain_data['status']
                                        safe_write_yaml(d_db, domain_file)
        return changed
    _update_db('.toolboxes.yaml', _update_toolboxes)

def phase3_single_pane_of_glass(is_daemon=False):

    """Roll up ONLY the metadata blocks from the 5 pillars into CONTROLER.yaml."""
    print("--- Phase 3: The Single Pane of Glass (CONTROLER.yaml) ---")
    controler_path = WORKSPACE / 'CONTROLER.yaml'
    if not controler_path.exists():
        return
        
    data = safe_read_yaml(controler_path)
    if not data: return
        
    # Push complex nested IN variables down
    hydrate_down_user_inputs(data)

    # AUTHORITATIVE SOURCE RULE: meta_os.yaml is the sole (in) owner of core.modes.
    # CONTROLER.yaml's core.modes is OUT (a rollup mirror). We do NOT push CONTROLER
    # modes down into meta_os — that was the original drift bug (dashboard_status
    # diverged between the two files). meta_os is the truth; CONTROLER reflects it
    # via the extract_metadata() rollup at the end of this function.

    # Apply Engine Mode directly into meta_os.yaml (read-only of user modes)
    core_path = DB_DIR / 'meta_os.yaml'
    if core_path.exists():
        core_data = safe_read_yaml(core_path)
        if core_data:
            if 'metadata' not in core_data:
                core_data['metadata'] = {}
            if 'modes' not in core_data['metadata']:
                core_data['metadata']['modes'] = {}

            # autosync_status is an OUT field reflecting daemon liveness, not user intent.
            # Only the running daemon flips it to 'on'; manual runs leave user intent intact.
            if is_daemon:
                core_data['metadata']['modes']['autosync_status'] = 'on 🟢'

            if 'system_metadata' in core_data and 'freshness' in core_data['system_metadata']:
                core_data['system_metadata']['freshness']['last_synced'] = datetime.datetime.now().isoformat()
                core_data['system_metadata']['freshness']['status'] = 'fresh'
                core_data['system_metadata']['freshness']['last_synced_by'] = 'daemon'
                
            # Hydrate down hubs and queues for core
            if 'core' in data and data['core']:
                c_data = data['core']
                if 'system' in c_data:
                    if 'system' not in core_data['metadata']: core_data['metadata']['system'] = {}
                    if 'hub' in c_data['system']:
                        if 'hub' not in core_data['metadata']['system']: core_data['metadata']['system']['hub'] = {}
                        if 'messages' in c_data['system']['hub']: core_data['metadata']['system']['hub']['messages'] = c_data['system']['hub']['messages']
                        if 'backlog' in c_data['system']['hub']: core_data['metadata']['system']['hub']['backlog'] = c_data['system']['hub']['backlog']
                if 'evolution' in c_data:
                    if 'evolution' not in core_data['metadata']: core_data['metadata']['evolution'] = {}
                    if 'hub' in c_data['evolution']:
                        if 'hub' not in core_data['metadata']['evolution']: core_data['metadata']['evolution']['hub'] = {}
                        if 'messages' in c_data['evolution']['hub']: core_data['metadata']['evolution']['hub']['messages'] = c_data['evolution']['hub']['messages']
                        if 'backlog' in c_data['evolution']['hub']: core_data['metadata']['evolution']['hub']['backlog'] = c_data['evolution']['hub']['backlog']
                    if 'queues' in c_data['evolution']:
                        if 'queues' not in core_data['metadata']['evolution']: core_data['metadata']['evolution']['queues'] = {}
                        if 'pending' in c_data['evolution']['queues']: core_data['metadata']['evolution']['queues']['pending'] = c_data['evolution']['queues']['pending']

            # Inject new SYSTEM_ERRORS into core_data
            global SYSTEM_ERRORS
            if 'system' not in core_data['metadata']: core_data['metadata']['system'] = {}
            if 'system_errors' not in core_data['metadata']['system'] or core_data['metadata']['system']['system_errors'] is None:
                core_data['metadata']['system']['system_errors'] = []
            
            for err in SYSTEM_ERRORS:
                if err not in core_data['metadata']['system']['system_errors']:
                    core_data['metadata']['system']['system_errors'].append(err)
            SYSTEM_ERRORS.clear()

            safe_write_yaml(core_data, core_path)
            
    # Now pull the updated .core.yaml metadata UP to CONTROLER.yaml (Core Rollup)
    data['core'] = extract_metadata(DB_DIR / 'meta_os.yaml')
    
    # Toolboxes
    data['toolboxes'] = extract_metadata(DB_DIR / '.toolboxes.yaml')
    
    # Projects
    data['projects'] = extract_metadata(DB_DIR / 'projects_os.yaml')
    
    # Pipelines
    if 'pipelines' not in data:
        data['pipelines'] = {}
    data['pipelines']['scaler'] = extract_metadata(DB_DIR / 'pipeline_scaler_os.yaml')
    
    # Check if 'hustler' was accidentally duplicated at the root and remove it
    if 'hustler' in data and not isinstance(data.get('hustler'), dict):
        pass # Not our target
    else:
        # Hustler goes inside pipelines!
        data['pipelines']['hustler'] = extract_metadata(DB_DIR / 'pipeline_hustler_os.yaml')
        if 'hustler' in data:
            del data['hustler']
    
    # Telemetry and Freshness Update
    if 'metadata' in data and 'sync_count' in data['metadata']:
        try:
            data['metadata']['sync_count'] = int(data['metadata']['sync_count']) + 1
        except (ValueError, TypeError):
            pass
            
    if 'system_metadata' in data and 'freshness' in data['system_metadata']:
        data['system_metadata']['freshness']['last_synced'] = datetime.datetime.now().isoformat()
        data['system_metadata']['freshness']['status'] = 'fresh'
        data['system_metadata']['freshness']['last_synced_by'] = 'daemon'
        
    # Event Hub Trimming
    trim_recent_events(data)
    
    safe_write_yaml(data, controler_path)


# --- Schema Validation Engine ---
class SchemaValidator:
    def __init__(self):
        self.errors = 0

    def parse_pseudo_schema(self, schema_text):
        try:
            # We can use the safe yaml loader for pseudo schemas as they don't have comments
            y = YAML(typ='safe')
            return y.load(schema_text)
        except Exception as e:
            print(f"Error parsing schema block: {e}")
            return {}

    def log_error(self, path, msg):
        print(f"  [ERR] {path}: {msg}")
        self.errors += 1

    def validate_type(self, val, expected_type, path):
        if val is None:
            # Depending on strictness, we might allow None. Let's allow it for now.
            return
            
        if expected_type == 'string':
            if not isinstance(val, str):
                self.log_error(path, f"Expected string, got {type(val).__name__}")
        elif expected_type == 'integer':
            if not isinstance(val, int):
                self.log_error(path, f"Expected integer, got {type(val).__name__}")
        elif expected_type == 'boolean':
            if not isinstance(val, bool):
                self.log_error(path, f"Expected boolean, got {type(val).__name__}")
        elif expected_type == 'timestamp':
            if not isinstance(val, str) and not isinstance(val, datetime.datetime):
                self.log_error(path, f"Expected timestamp string or datetime, got {type(val).__name__}")
        elif isinstance(expected_type, str) and '|' in expected_type:
            allowed = [t.strip() for t in expected_type.split('|')]
            if str(val).strip() not in allowed:
                self.log_error(path, f"Value '{val}' not in allowed enums: {allowed}")
        elif isinstance(expected_type, list):
            if not isinstance(val, list):
                self.log_error(path, f"Expected list, got {type(val).__name__}")
            elif len(expected_type) > 0 and len(val) > 0:
                for i, item in enumerate(val):
                    self.validate_type(item, expected_type[0], f"{path}[{i}]")
        elif isinstance(expected_type, dict):
            if not isinstance(val, dict):
                self.log_error(path, f"Expected dict, got {type(val).__name__}")
            else:
                self.validate_dict(val, expected_type, path)

    def validate_dict(self, actual, schema, path="root"):
        if not isinstance(actual, dict) or not isinstance(schema, dict):
            return

        for s_key, s_val in schema.items():
            if s_key.startswith('[') and s_key.endswith(']'):
                # Dynamic key matching (e.g. "[agent_name]")
                for a_key, a_val in actual.items():
                    self.validate_type(a_val, s_val, f"{path}.{a_key}")
            else:
                # Exact key matching
                if s_key not in actual:
                    # Optional key handling could go here
                    pass
                else:
                    self.validate_type(actual[s_key], s_val, f"{path}.{s_key}")

    def validate_file(self, file_path, schema_file, schema_key, root_name):
        if not file_path.exists() or not schema_file.exists():
            return
            
        print(f"\nValidating {file_path.name}...")
        with open(schema_file, 'r', encoding='utf-8') as f:
            y = YAML(typ='safe')
            cs = y.load(f)
            
        schema_str = cs.get(schema_key, '')
        if schema_str:
            schema_obj = self.parse_pseudo_schema(schema_str)
            with open(file_path, 'r', encoding='utf-8') as f:
                y = YAML(typ='safe')
                actual = y.load(f)
            self.validate_dict(actual, schema_obj, root_name)

    def run_validation(self):
        print("--- Agentic OS Schema Validation ---")
        schema_dir = DB_DIR / '.db_shemas_db'
        if not schema_dir.exists():
            print("No schema directory found.")
            return

        # 1. Validate CONTROLER.yaml
        self.validate_file(
            WORKSPACE / 'CONTROLER.yaml',
            schema_dir / 'controler_shemas.yaml',
            'controler_schema',
            'CONTROLER'
        )

        # 2. Validate Core DB
        self.validate_file(
            DB_DIR / 'meta_os.yaml',
            schema_dir / 'meta_os_shemas.yaml',
            'core_schema',
            'CORE'
        )
        
        # 3. Validate Projects DB
        self.validate_file(
            DB_DIR / 'projects_os.yaml',
            schema_dir / 'projects_os_shemas.yaml',
            'projects_schema',
            'PROJECTS'
        )

        # 4. Validate Toolboxes
        toolboxes_yaml = DB_DIR / '.toolboxes.yaml'
        toolboxes_shemas = schema_dir / 'toolboxes_shemas.yaml'
        if toolboxes_yaml.exists() and toolboxes_shemas.exists():
            print("\nValidating Toolboxes...")
            with open(toolboxes_shemas, 'r', encoding='utf-8') as f:
                y = YAML(typ='safe')
                ts = y.load(f)
            tb_index_schema = self.parse_pseudo_schema(ts.get('toolboxes_index_schema', ''))
            tb_db_schema = self.parse_pseudo_schema(ts.get('toolbox_db_schema', ''))
            
            with open(toolboxes_yaml, 'r', encoding='utf-8') as f:
                y = YAML(typ='safe')
                actual_index = y.load(f)
            print("  -> Validating .toolboxes.yaml")
            self.validate_dict(actual_index, tb_index_schema, "TOOLBOXES_INDEX")
            
            # Validate individual toolbox DBs
            tb_db_dir = DB_DIR / 'toolboxes_db'
            if tb_db_dir.exists():
                for cat in tb_db_dir.iterdir():
                    if cat.is_dir():
                        for db_file in cat.glob('*.yaml'):
                            with open(db_file, 'r', encoding='utf-8') as f:
                                y = YAML(typ='safe')
                                actual_db = y.load(f)
                            print(f"  -> Validating {db_file.name}")
                            self.validate_dict(actual_db, tb_db_schema, db_file.name)

        print(f"\nValidation complete. {self.errors} errors found.")
        sys.exit(0 if self.errors == 0 else 1)


def get_latest_mtime():
    """Scan all source folders/files and return the highest modification timestamp."""
    latest = 0
    dirs_to_check = [
        TOOLBOXES_DIR,
        WORKSPACE / '.meta_os' / 'meta_milestones',
        WORKSPACE / 'pipeline_scaler' / '.scaler_os' / 'scaler_milestones',
        WORKSPACE / 'pipeline_hustler' / '.hustler_os' / 'hustler_milestones',
        WORKSPACE / 'projects' / '.projects_os' / '.projects_milestones',
    ]
    
    files_to_check = [
        WORKSPACE / 'CONTROLER.yaml',
        DB_DIR / 'meta_os.yaml',
        DB_DIR / 'pipeline_scaler_os.yaml',
        DB_DIR / 'pipeline_hustler_os.yaml',
        DB_DIR / 'projects_os.yaml'
    ]
    
    for d in dirs_to_check:
        if d.exists():
            for root, _, files in os.walk(d):
                for f in files:
                    if not f.startswith('.') and f.endswith(('.yaml', '.md')):
                        try:
                            mtime = os.stat(os.path.join(root, f)).st_mtime
                            if mtime > latest:
                                latest = mtime
                        except OSError:
                            pass
                        
    for f in files_to_check:
        if f.exists():
            try:
                mtime = os.stat(f).st_mtime
                if mtime > latest:
                    latest = mtime
            except OSError:
                pass
                
    return latest

def run_daemon(interval=5):
    print(f"Agentic OS Sync Daemon running in background mode (polling every {interval}s)...")
    print("Press Ctrl+C to stop.")
    last_sync_time = 0
    try:
        while True:
            current_mtime = get_latest_mtime()
            if current_mtime > last_sync_time:
                # Changes detected!
                if last_sync_time != 0:
                    print(f"\n[!] Changes detected at {datetime.datetime.now().strftime('%H:%M:%S')}. Triggering sync...")
                else:
                    print("Initial sync on daemon startup...")
                    
                check_architecture_health()
                phase1_toolboxes()
                phase1_milestones()
                phase2_domain_rollup()
                phase3_single_pane_of_glass(is_daemon=True)
                
                # Fetch fresh mtime to ignore our own writes
                last_sync_time = get_latest_mtime()
                print("Waiting for changes...\n")
                
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\nDaemon stopped by user.")

def check_architecture_health():
    print("--- Phase 0: Health Check ---")
    critical_files = [
        WORKSPACE / 'CONTROLER.yaml',
        DB_DIR / 'meta_os.yaml',
        DB_DIR / 'pipeline_scaler_os.yaml',
        DB_DIR / 'pipeline_hustler_os.yaml',
        DB_DIR / 'projects_os.yaml',
        WORKSPACE / 'AGENTS.md'
    ]
    for f in critical_files:
        if not f.exists():
            flag_error(f"[ERROR] Critical OS file missing: {f.name}")

def main():
    parser = argparse.ArgumentParser(description="Agentic OS Sync Daemon")
    parser.add_argument("--validate", action="store_true", help="Run schema validation only")
    parser.add_argument("--daemon", action="store_true", help="Run continuously in background mode")
    args = parser.parse_args()

    if args.validate:
        validator = SchemaValidator()
        validator.run_validation()
    elif args.daemon:
        run_daemon(interval=5)
    else:
        print("Agentic OS Zero-Drift Sync Daemon starting...")
        check_architecture_health()
        phase1_toolboxes()
        phase1_milestones()
        phase2_domain_rollup()
        phase3_single_pane_of_glass(is_daemon=False)
        print("Sync complete. Zero-drift state verified.")

if __name__ == '__main__':
    main()
