import os
import sys
import time
import json
import socket
import argparse
import datetime
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading

# Note: assuming ruamel.yaml is available in the venv as per the old engine
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True
yaml.indent(mapping=2, sequence=4, offset=2)

WORKSPACE = Path(__file__).parent.parent.parent.resolve()
CONFIG_FILE = WORKSPACE / 'config.yaml'
INDEX_FILE = WORKSPACE / 'index.yaml'

SHARED_DIR = WORKSPACE / '_shared'
SHARED_TOOLBOXES = SHARED_DIR / '.shared-toolboxes'
SHARED_PIPELINES = SHARED_DIR / '.shared-pipelines'
SHARED_SCHEMAS = SHARED_DIR / 'schemas'

STASH_DIR = WORKSPACE / '.stash'
PIDS_DIR = STASH_DIR / 'pids'

def safe_read_yaml(path):
    try:
        if path.exists():
            with open(path, 'r', encoding='utf-8') as f:
                return yaml.load(f) or {}
    except Exception as e:
        print(f"Error reading {path}: {e}")
    return {}

def safe_write_yaml(path, data):
    tmp_path = path.with_suffix('.yaml.tmp')
    try:
        with open(tmp_path, 'w', encoding='utf-8') as f:
            yaml.dump(data, f)
        os.replace(tmp_path, path)
    except Exception as e:
        print(f"Error writing {path}: {e}")
        if tmp_path.exists():
            tmp_path.unlink()

def extract_frontmatter(file_path):
    """Extracts YAML frontmatter from a markdown file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if content.startswith('---'):
                parts = content.split('---', 2)
                if len(parts) >= 3:
                    import yaml as pyyaml # using standard yaml for safe loading
                    try:
                        return pyyaml.safe_load(parts[1]) or {}
                    except:
                        pass
    except:
        pass
    return {}

def scan_toolboxes(toolboxes_dir):
    """Scans a toolboxes directory (shared or local) and returns (index_structure, board_metadata)."""
    index_res = {}
    board_res = {}
    if not toolboxes_dir.exists():
        return index_res, board_res
    
    for domain_dir in toolboxes_dir.iterdir():
        if domain_dir.is_dir() and not domain_dir.name.startswith('.'):
            domain_name = domain_dir.name
            index_res[domain_name] = {
                "path": str(domain_dir.relative_to(WORKSPACE)).replace('\\', '/'),
            }
            board_res[domain_name] = {}
            
            for toolbox_dir in domain_dir.iterdir():
                if toolbox_dir.is_dir() and not toolbox_dir.name.startswith('.'):
                    toolbox_name = toolbox_dir.name
                    index_res[domain_name][toolbox_name] = {
                        "path": str(toolbox_dir.relative_to(WORKSPACE)).replace('\\', '/'),
                        "toolbox_agents": {},
                        "toolbox_skills": {}
                    }
                    board_res[domain_name][toolbox_name] = {
                        "toolbox_agents": {},
                        "toolbox_skills": {}
                    }
                    
                    agents_dir = toolbox_dir / "agents"
                    if agents_dir.exists():
                        for agent_file in agents_dir.glob("*.md"):
                            fm = extract_frontmatter(agent_file)
                            creds = fm.get('credentials', {})
                            index_res[domain_name][toolbox_name]["toolbox_agents"][agent_file.name] = {
                                "path": str(agent_file.relative_to(WORKSPACE)).replace('\\', '/')
                            }
                            board_res[domain_name][toolbox_name]["toolbox_agents"][agent_file.name] = {
                                "role": creds.get('role', ''),
                                "description": creds.get('description', ''),
                                "when_to_use": creds.get('when_to_use', ''),
                                "maturity": creds.get('maturity', 'stub'),
                                "triggers": creds.get('triggers', [])
                            }
                            
                    skills_dir = toolbox_dir / "skills"
                    if skills_dir.exists():
                        for skill_dir in skills_dir.iterdir():
                            if skill_dir.is_dir():
                                skill_file = skill_dir / "SKILL.md"
                                if skill_file.exists():
                                    fm = extract_frontmatter(skill_file)
                                    creds = fm.get('credentials', {})
                                    
                                    index_res[domain_name][toolbox_name]["toolbox_skills"][skill_dir.name] = {
                                        "path": str(skill_dir.relative_to(WORKSPACE)).replace('\\', '/'),
                                        "skill_references": {}
                                    }
                                    board_res[domain_name][toolbox_name]["toolbox_skills"][skill_dir.name] = {
                                        "description": creds.get('description', ''),
                                        "when_to_use": creds.get('when_to_use', ''),
                                        "maturity": creds.get('maturity', 'stub'),
                                        "triggers": creds.get('triggers', []),
                                        "inputs": creds.get('inputs', []),
                                        "outputs": creds.get('outputs', []),
                                        "skill_references": {}
                                    }
                                    
                                    refs_dir = skill_dir / "references"
                                    if refs_dir.exists():
                                        for ref_file in refs_dir.glob("*.md"):
                                            ref_fm = extract_frontmatter(ref_file)
                                            ref_creds = ref_fm.get('credentials', {})
                                            index_res[domain_name][toolbox_name]["toolbox_skills"][skill_dir.name]["skill_references"][ref_file.name] = {
                                                "path": str(ref_file.relative_to(WORKSPACE)).replace('\\', '/')
                                            }
                                            board_res[domain_name][toolbox_name]["toolbox_skills"][skill_dir.name]["skill_references"][ref_file.name] = {
                                                "description": ref_creds.get('description', ''),
                                                "when_to_use": ref_creds.get('when_to_use', '')
                                            }
    return index_res, board_res

def scan_pipelines(pipelines_dir, entity_root=None):
    """Scans a pipelines directory."""
    result = {}
    if not pipelines_dir.exists():
        return result
    
    pipelines_runtime_dir = None
    if entity_root:
        name = entity_root.name.replace('_', '', 1) if entity_root.name == '_system' else entity_root.name
        pipelines_runtime_dir = entity_root / f".{name}-pipelines_runtime"
    
    for pipeline_dir in pipelines_dir.iterdir():
        if pipeline_dir.is_dir() and not pipeline_dir.name.startswith('.'):
            pipeline_name = pipeline_dir.name
            pipeline_data = {
                "path": str(pipeline_dir.relative_to(WORKSPACE)).replace('\\', '/'),
                "pipeline_runbooks": {},
                "pipeline_profiles": {}
            }
            
            readme = pipeline_dir / f"{pipeline_name.upper()}.md"
            if readme.exists():
                pipeline_data["readme"] = str(readme.relative_to(WORKSPACE)).replace('\\', '/')
                
            contracts = pipeline_dir / f"{pipeline_name.upper()}-CONTRACTS.yaml"
            if contracts.exists():
                pipeline_data["contracts"] = str(contracts.relative_to(WORKSPACE)).replace('\\', '/')
                
            runbooks_dir = pipeline_dir / f"{pipeline_name.lower()}-runbooks"
            if runbooks_dir.exists():
                pipeline_data["runbooks_path"] = str(runbooks_dir.relative_to(WORKSPACE)).replace('\\', '/')
                for runbook in runbooks_dir.glob("*.md"):
                    pipeline_data["pipeline_runbooks"][runbook.name] = {
                        "path": str(runbook.relative_to(WORKSPACE)).replace('\\', '/'),
                        "description": "",
                        "when_to_use": "",
                        "contains": []
                    }
                    
            if pipelines_runtime_dir and pipelines_runtime_dir.exists():
                pipeline_rt = pipelines_runtime_dir / pipeline_name
                if pipeline_rt.exists():
                    for profile_dir in pipeline_rt.iterdir():
                        if profile_dir.is_dir():
                            prof_name = profile_dir.name
                            if prof_name not in pipeline_data["pipeline_profiles"]:
                                pipeline_data["pipeline_profiles"][prof_name] = {
                                    "path": str(profile_dir.relative_to(WORKSPACE)).replace('\\', '/'),
                                    "PLANNING_runs": {},
                                    "EXECUTION_runs": {}
                                }
                            for run_dir in profile_dir.iterdir():
                                if run_dir.is_dir():
                                    run_type = "PLANNING_runs" if "PLANNING" in run_dir.name or "planning" in run_dir.name else "EXECUTION_runs"
                                    pipeline_data["pipeline_profiles"][prof_name][run_type][run_dir.name] = {
                                        "path": str(run_dir.relative_to(WORKSPACE)).replace('\\', '/')
                                    }
                                    
            result[pipeline_name.lower()] = pipeline_data
    return result

def scan_os_prompts(prompts_dir):
    result = {}
    if prompts_dir.exists():
        for prompt in prompts_dir.glob("*.md"):
            result[prompt.name] = {
                "path": str(prompt.relative_to(WORKSPACE)).replace('\\', '/'),
                "role": "",
                "description": "",
                "when_to_use": "",
                "contains": []
            }
    return result

def scan_missions(missions_dir):
    result = {}
    if missions_dir.exists():
        for mission in missions_dir.iterdir():
            if mission.is_dir() and not mission.name.startswith('.'):
                result[mission.name] = {
                    "path": str(mission.relative_to(WORKSPACE)).replace('\\', '/'),
                    "status": "active",
                    "started_at": ""
                }
    return result

def scan_ledgers(entity_root):
    """Scans non-hidden folders in entity root for content files."""
    result = {}
    for item in entity_root.iterdir():
        if item.is_dir() and not item.name.startswith('.') and item.name not in ['_shared', '_system']:
            # Avoid the core folders
            if entity_root.name == '_system' and item.name == 'system-scratch':
                continue
                
            folder_name = item.name
            result[folder_name] = {
                "path": str(item.relative_to(WORKSPACE)).replace('\\', '/')
            }
            
            for content_file in item.rglob("*.*"):
                if content_file.is_file() and not content_file.name.startswith('.'):
                    # exclude standard entity files
                    if content_file.name.endswith('-board.yaml') or content_file.name.endswith('-index.yaml'):
                        continue
                    result[folder_name][content_file.name] = {
                        "path": str(content_file.relative_to(WORKSPACE)).replace('\\', '/'),
                        "description": "",
                        "when_to_use": "",
                        "contains": []
                    }
    return result

def sync_entity(entity_name, entity_root, is_system=False):
    """Syncs a single entity (system or project)."""
    board_path = entity_root / f"{entity_name}-board.yaml"
    index_path = entity_root / f"{entity_name}-index.yaml"
    
    meta_dir = entity_root / f".{entity_name}-meta"
    prompts_dir = meta_dir / f".{entity_name}-os_prompts"
    local_pipelines_dir = meta_dir / f".{entity_name}-pipelines"
    local_toolboxes_dir = meta_dir / f".{entity_name}-toolboxes"
    archive_dir = meta_dir / f"{entity_name}-archive"
    scratch_dir = meta_dir / f"{entity_name}-scratch"
    missions_dir = entity_root / f".{entity_name}-missions"
    pipelines_runtime_dir = entity_root / f".{entity_name}-pipelines_runtime"
    
    prompts_dir.mkdir(parents=True, exist_ok=True)
    local_pipelines_dir.mkdir(parents=True, exist_ok=True)
    local_toolboxes_dir.mkdir(parents=True, exist_ok=True)
    archive_dir.mkdir(parents=True, exist_ok=True)
    scratch_dir.mkdir(parents=True, exist_ok=True)
    missions_dir.mkdir(parents=True, exist_ok=True)
    pipelines_runtime_dir.mkdir(parents=True, exist_ok=True)
    
    readme_path = entity_root / f"{entity_name}.md"
    if not readme_path.exists():
        template_name = "system-readme.md" if is_system else "project-readme.md"
        template_path = SHARED_DIR / "templates" / template_name
        if template_path.exists():
            with open(template_path, 'r', encoding='utf-8') as tf, open(readme_path, 'w', encoding='utf-8') as rf:
                rf.write(tf.read().replace("<project_name>", entity_name).replace("[entity]", entity_name))
        else:
            with open(readme_path, 'w', encoding='utf-8') as f:
                f.write(f"# {entity_name}\n\nOverview for {entity_name}.")
                
    def seed_meta_file(target_path, template_name):
        if not target_path.exists():
            tmpl = SHARED_DIR / "templates" / template_name
            if tmpl.exists():
                with open(tmpl, 'r', encoding='utf-8') as tf, open(target_path, 'w', encoding='utf-8') as rf:
                    rf.write(tf.read().replace("[entity]", entity_name))

    seed_meta_file(prompts_dir / "01_overview-Project.md", "meta-os_prompts-readme.md")
    seed_meta_file(local_pipelines_dir / "README.md", "meta-pipelines-readme.md")
    seed_meta_file(local_toolboxes_dir / "README.md", "meta-toolboxes-readme.md")
    
    board = safe_read_yaml(board_path)
    if not board:
        board = {
            "metadata": {}, 
            "metrics": {}, 
            "control": {"status": "on", "auto_mode": False, "pipelines_control": {}, "toolboxes_control": {}},
            "state": {"last_progress_at": "", "recent_events": [], "review_queue": [], "backlog": []},
            "missions": {}, 
            "pipelines": {}, 
            "toolboxes": {"shared_toolboxes": {}, "local_toolboxes": {}}
        }
        
    board.setdefault('state', {"last_progress_at": "", "recent_events": [], "review_queue": [], "backlog": []})
    board.setdefault('control', {"status": "on", "auto_mode": False, "pipelines_control": {}, "toolboxes_control": {}})
    board.setdefault('metrics', {})
    board.setdefault('toolboxes', {"shared_toolboxes": {}, "local_toolboxes": {}})
    board['toolboxes'].setdefault('shared_toolboxes', {})
    board['toolboxes'].setdefault('local_toolboxes', {})
    
    board['metadata']['name'] = entity_name
    board['metadata']['class'] = 'system' if is_system else 'project'
    board['metadata']['freshness'] = {
        'sync_status': 'syncing',
        'last_synced': datetime.datetime.utcnow().isoformat() + 'Z',
        'fill_queue': {"os_prompts": [], "ledgers": [], "missions": [], "pipelines": [], "toolboxes": []}
    }
    
    shared_tb_index, shared_tb_board = scan_toolboxes(SHARED_TOOLBOXES)
    local_tb_index, local_tb_board = scan_toolboxes(local_toolboxes_dir)
    
    shared_pipelines_index = scan_pipelines(SHARED_PIPELINES, entity_root)
    local_pipelines_index = scan_pipelines(local_pipelines_dir, entity_root)
    
    index = {
        "metadata": {
            "name": board['metadata']['name'],
            "class": board['metadata']['class'],
            "freshness": {
                'sync_status': 'syncing',
                'last_synced': board['metadata']['freshness']['last_synced']
            }
        },
        "entity": {
            "root": str(entity_root.relative_to(WORKSPACE)).replace('\\', '/'),
            "readme": f"{entity_root.relative_to(WORKSPACE)}/{entity_name}.md".replace('\\', '/'),
            "board": str(board_path.relative_to(WORKSPACE)).replace('\\', '/'),
            "index": str(index_path.relative_to(WORKSPACE)).replace('\\', '/'),
        },
        "shared": {
            "root": "_shared/",
            "pipelines": "_shared/.shared-pipelines/",
            "toolboxes": "_shared/.shared-toolboxes/",
            "schemas": "_shared/schemas/"
        },
        "os_prompts": scan_os_prompts(prompts_dir),
        "pipelines": {
            "shared_pipelines": shared_pipelines_index,
            "local_pipelines": local_pipelines_index
        },
        "toolboxes": {
            "shared_toolboxes": shared_tb_index,
            "local_toolboxes": local_tb_index
        },
        "missions": scan_missions(missions_dir),
        "ledgers": scan_ledgers(entity_root)
    }
    
    metrics = board['metrics']
    metrics['os_prompts'] = len(index['os_prompts'])
    
    board_missions = board.setdefault('missions', {})
    metrics['missions_metrics'] = {
        'total': len(board_missions),
        'active': sum(1 for m in board_missions.values() if m.get('mission_control', {}).get('status') == 'active'),
    }
    
    # Flatten Pipelines into board
    board_pipelines = board.setdefault('pipelines', {})
    pipelines_metrics = {'total': 0, 'active': 0}
    for p_name in shared_pipelines_index.keys():
        p_obj = board_pipelines.setdefault(p_name, {})
        p_obj['source'] = 'shared'
        p_obj.setdefault('status', 'off')
        pipelines_metrics['total'] += 1
        if p_obj.get('status') == 'on':
            pipelines_metrics['active'] += 1
            
    for p_name in local_pipelines_index.keys():
        p_obj = board_pipelines.setdefault(p_name, {})
        p_obj['source'] = 'local'
        p_obj.setdefault('status', 'off')
        pipelines_metrics['total'] += 1
        if p_obj.get('status') == 'on':
            pipelines_metrics['active'] += 1
            
    metrics['pipelines_metrics'] = pipelines_metrics
    
    tb_metrics = {'total': 0, 'active': 0, 'stub': 0, 'functional': 0, 'hardened': 0, 'battle-tested': 0}
    
    def apply_toolbox_board_data(target_board_tb, scanned_board_data):
        for domain, domain_data in scanned_board_data.items():
            board_domain = target_board_tb.setdefault(domain, {"status": "on", "maturity": "functional", "total_toolboxes": 0, "active_toolboxes": 0})
            for tb_name, tb_data in domain_data.items():
                board_tb_obj = board_domain.setdefault(tb_name, {"status": "on", "maturity": "functional", "agents_count": 0, "skills_count": 0, "toolbox_agents": {}, "toolbox_skills": {}})
                board_tb_obj.setdefault('toolbox_agents', {})
                board_tb_obj.setdefault('toolbox_skills', {})
                
                # Delete legacy keys
                if 'agents' in board_tb_obj:
                    del board_tb_obj['agents']
                if 'skills' in board_tb_obj:
                    del board_tb_obj['skills']
                
                for agent_name, agent_meta in tb_data.get('toolbox_agents', {}).items():
                    if agent_name not in board_tb_obj['toolbox_agents']:
                        board_tb_obj['toolbox_agents'][agent_name] = agent_meta
                        
                for skill_name, skill_meta in tb_data.get('toolbox_skills', {}).items():
                    if skill_name not in board_tb_obj['toolbox_skills']:
                        board_tb_obj['toolbox_skills'][skill_name] = skill_meta
                
                board_domain['total_toolboxes'] = len(domain_data)
                if board_tb_obj.get('status') == 'on':
                    board_domain['active_toolboxes'] = board_domain.get('active_toolboxes', 0) + 1
                tb_metrics['total'] += 1
                if board_tb_obj.get('status') == 'on':
                    tb_metrics['active'] += 1
                    
    apply_toolbox_board_data(board['toolboxes']['shared_toolboxes'], shared_tb_board)
    apply_toolbox_board_data(board['toolboxes']['local_toolboxes'], local_tb_board)
    
    metrics['toolboxes_metrics'] = tb_metrics
    metrics['ledgers'] = {'total': sum(len(files) - 1 for files in index['ledgers'].values()), 'indexed': 0}
    
    board['metadata']['freshness']['sync_status'] = 'fresh'
    index['metadata']['freshness']['sync_status'] = 'fresh'
    
    # Migrate legacy state
    if 'live_state' in board:
        if 'recent_events' in board['live_state']:
            board['state']['recent_events'] = board['live_state']['recent_events']
        if 'fill_queue' in board['live_state']:
            # Migrate old fill_queue array to new freshness block (if applicable, else skip as it's structurally different)
            pass
        del board['live_state']
        
    if 'live_hub' in board:
        if 'review_queue' in board['live_hub']:
            board['state']['review_queue'] = board['live_hub']['review_queue']
        if 'backlog' in board['live_hub']:
            board['state']['backlog'] = board['live_hub']['backlog']
        del board['live_hub']
        
    if 'hub' in board:
        del board['hub']
        
    if 'runtime' in board:
        del board['runtime']
        
    # Remove old pipeline structures
    if 'shared_pipelines' in board['pipelines']:
        del board['pipelines']['shared_pipelines']
    if 'local_pipelines' in board['pipelines']:
        del board['pipelines']['local_pipelines']
    
    safe_write_yaml(index_path, index)
    safe_write_yaml(board_path, board)
    print(f"Synced entity: {entity_name}")

def engine_sync_loop():
    print("Starting sync cycle...")
    config = safe_read_yaml(CONFIG_FILE)
    if not config:
        print("No config.yaml found.")
        return
        
    modes = config.get('modes', {})
    
    # Ensure root index exists
    root_index = safe_read_yaml(INDEX_FILE)
    if not root_index:
        root_index = {"metadata": {"name": "workspace-index", "class": "workspace", "version": "1.0"}, "projects": {}}
        
    # Sync System
    if modes.get('system', {}).get('status') == True:
        sync_entity('system', WORKSPACE / '_system', is_system=True)
        
    # Sync Projects
    root_projects = root_index.setdefault('projects', {})
    for mode_name, mode_config in modes.items():
        if mode_name.startswith('project-') and mode_config.get('status') == True:
            project_name = mode_name.replace('project-', '', 1)
            project_root = WORKSPACE / project_name
            project_root.mkdir(exist_ok=True)
            sync_entity(project_name, project_root)
            
            if project_name not in root_projects:
                root_projects[project_name] = {
                    "root": f"{project_name}/",
                    "readme": f"{project_name}/{project_name}.md",
                    "board": f"{project_name}/{project_name}-board.yaml",
                    "index": f"{project_name}/{project_name}-index.yaml",
                    "status": "active"
                }
                
    safe_write_yaml(INDEX_FILE, root_index)
    print("Sync cycle complete.")

def run_server():
    print(f"Starting dashboard server on port {PORT}...")
    # placeholder for dashboard server
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()

def write_pid():
    PIDS_DIR.mkdir(parents=True, exist_ok=True)
    pid_file = PIDS_DIR / 'engine.pid'
    with open(pid_file, 'w') as f:
        json.dump({"pid": os.getpid(), "started_at": datetime.datetime.utcnow().isoformat()}, f)
    return pid_file

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Agentic OS Sync Engine v6.0")
    parser.add_argument("--once", action="store_true", help="Run one sync cycle and exit")
    parser.add_argument("--daemon", action="store_true", help="Run continuous sync loop")
    args = parser.parse_args()

    pid_file = write_pid()
    try:
        if args.once:
            engine_sync_loop()
        elif args.daemon:
            # start server in thread
            server_thread = threading.Thread(target=run_server, daemon=True)
            server_thread.start()
            while True:
                engine_sync_loop()
                time.sleep(5)
        else:
            engine_sync_loop()
    finally:
        if pid_file.exists():
            pid_file.unlink()
