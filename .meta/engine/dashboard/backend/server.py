import os
import sys
import json
import threading
import time
import yaml
import subprocess
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = 8000
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DASHBOARD_DIR = os.path.dirname(BACKEND_DIR)
STATIC_DIR = os.path.join(DASHBOARD_DIR, 'frontend')
WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(DASHBOARD_DIR)))

# All editable DB files — relative to WORKSPACE_ROOT
DB_FILES = {
    'controler':      'CONTROLER.yaml',
    'meta_os':        '.meta_os/meta_db/meta_os.yaml',
    'scaler_os':      '.meta_os/meta_db/pipeline_scaler_os.yaml',
    'hustler_os':     '.meta_os/meta_db/pipeline_hustler_os.yaml',
    'projects_os':    '.meta_os/meta_db/projects_os.yaml',
    'toolboxes':      '.meta_os/meta_db/.toolboxes.yaml',
    # Scaler ledgers
    'scaler_inbox':   'pipeline_scaler/.scaler_os/scaler_db/.scaler_mixed_inbox.yaml',
    'fi_sources':     'pipeline_scaler/.scaler_os/scaler_db/Foundational_Integrity.sources.yaml',
    'fi_proposals':   'pipeline_scaler/.scaler_os/scaler_db/Foundational_Integrity.proposals.yaml',
    'om_sources':     'pipeline_scaler/.scaler_os/scaler_db/Operational_Muscles.sources.yaml',
    'om_proposals':   'pipeline_scaler/.scaler_os/scaler_db/Operational_Muscles.proposals.yaml',
    'vg_sources':     'pipeline_scaler/.scaler_os/scaler_db/Value_Generation.sources.yaml',
    'vg_proposals':   'pipeline_scaler/.scaler_os/scaler_db/Value_Generation.proposals.yaml',
    # Hustler ledgers
    'hustler_inbox':  'pipeline_hustler/.hustler_os/hustler_db/.hustler_mixed_inbox.yaml',
}


def load_yaml(path):
    if not os.path.exists(path):
        return {}
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f) or {}
    except Exception:
        return {}


def save_yaml(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
    os.replace(tmp, path)


def set_nested(data, key_path, value):
    """Set a value in nested dict given a dot-separated key path."""
    keys = key_path.split('.')
    d = data
    for k in keys[:-1]:
        if k not in d or not isinstance(d[k], dict):
            d[k] = {}
        d = d[k]
    d[keys[-1]] = value


def send_json(handler, code, payload):
    body = json.dumps(payload, ensure_ascii=False, default=str).encode('utf-8')
    handler.send_response(code)
    handler.send_header('Content-type', 'application/json; charset=utf-8')
    handler.send_header('Content-Length', len(body))
    handler.end_headers()
    handler.wfile.write(body)


class DashboardHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def log_message(self, format, *args):
        # Suppress noisy request logs unless errors
        if args and str(args[1]) not in ('200', '304'):
            super().log_message(format, *args)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
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
        elif path == '/api/archives':
            self.handle_api_archives()
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

    # ──────────────────────────────────────────────
    # GET /api/state  — full controller state
    # ──────────────────────────────────────────────
    def handle_api_state(self):
        try:
            ctrl_path = os.path.join(WORKSPACE_ROOT, 'CONTROLER.yaml')
            payload = {'controller': load_yaml(ctrl_path), 'db_files': list(DB_FILES.keys())}
            send_json(self, 200, payload)
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    # ──────────────────────────────────────────────
    # GET /api/db?file=<key>  — read any DB YAML
    # ──────────────────────────────────────────────
    def handle_api_db_read(self, parsed):
        try:
            qs = parse_qs(parsed.query)
            file_key = qs.get('file', [None])[0]
            if not file_key or file_key not in DB_FILES:
                send_json(self, 400, {'error': f'Unknown file key: {file_key}. Valid: {list(DB_FILES.keys())}'})
                return
            full_path = os.path.join(WORKSPACE_ROOT, DB_FILES[file_key])
            data = load_yaml(full_path)
            send_json(self, 200, {'file': file_key, 'path': DB_FILES[file_key], 'data': data})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    # ──────────────────────────────────────────────
    # GET /api/archives — read all archived proposals
    # ──────────────────────────────────────────────
    def handle_api_archives(self):
        try:
            archives_dir = os.path.join(WORKSPACE_ROOT, 'pipeline_scaler', '.scaler_runtime', '.scaler_archive')
            archives = []
            if os.path.exists(archives_dir):
                for root, _, files in os.walk(archives_dir):
                    for file in files:
                        if file.endswith('.yaml'):
                            data = load_yaml(os.path.join(root, file))
                            if data:
                                archives.append(data)
            
            # Sort by created_at descending if possible
            archives.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            send_json(self, 200, {'archives': archives})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    # ──────────────────────────────────────────────
    # POST /api/update_db  — write any field in any DB YAML
    # Body: { file: str, key_path: str, value: any }
    # ──────────────────────────────────────────────
    def handle_api_update_db(self):
        try:
            params = self._read_body()
            file_key = params.get('file')
            key_path = params.get('key_path')
            value = params.get('value')
            if not file_key or file_key not in DB_FILES:
                send_json(self, 400, {'error': f'Unknown file key: {file_key}'})
                return
            if not key_path:
                send_json(self, 400, {'error': 'key_path is required'})
                return
            full_path = os.path.join(WORKSPACE_ROOT, DB_FILES[file_key])
            data = load_yaml(full_path)
            set_nested(data, key_path, value)
            save_yaml(full_path, data)
            send_json(self, 200, {'success': True, 'file': file_key, 'key_path': key_path, 'value': value})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    # ──────────────────────────────────────────────
    # POST /api/proposal_action
    # Body: { proposal_id: str, action: 'APPROVE'|'REJECT', reason?: str }
    # ──────────────────────────────────────────────
    def handle_api_proposal_action(self):
        try:
            params = self._read_body()
            proposal_id = params.get('proposal_id')
            action = params.get('action', '').upper()  # APPROVE or REJECT
            reason = params.get('reason', '')

            if not proposal_id or action not in ('APPROVE', 'REJECT'):
                send_json(self, 400, {'error': 'proposal_id and action (APPROVE|REJECT) required'})
                return

            # Update status in both scaler_os and CONTROLER.yaml
            new_status = 'APPROVED' if action == 'APPROVE' else 'REJECTED'

            for file_key in ('scaler_os', 'controler'):
                full_path = os.path.join(WORKSPACE_ROOT, DB_FILES[file_key])
                data = load_yaml(full_path)
                # Walk scaler_review_queue in both files
                queue = None
                if file_key == 'scaler_os':
                    queue = (data.get('metadata', {}).get('queues', {}).get('scaler_review_queue') or [])
                elif file_key == 'controler':
                    queue = (data.get('pipelines', {}).get('scaler', {}).get('queues', {}).get('scaler_review_queue') or [])

                if isinstance(queue, list):
                    for item in queue:
                        if isinstance(item, dict) and item.get('id') == proposal_id:
                            item['status'] = new_status
                            if reason:
                                item['rejection_reason'] = reason
                            break
                    # Write back
                    if file_key == 'scaler_os':
                        if 'metadata' not in data: data['metadata'] = {}
                        if 'queues' not in data['metadata']: data['metadata']['queues'] = {}
                        data['metadata']['queues']['scaler_review_queue'] = queue
                    elif file_key == 'controler':
                        if 'pipelines' not in data: data['pipelines'] = {}
                        if 'scaler' not in data['pipelines']: data['pipelines']['scaler'] = {}
                        if 'queues' not in data['pipelines']['scaler']: data['pipelines']['scaler']['queues'] = {}
                        data['pipelines']['scaler']['queues']['scaler_review_queue'] = queue
                    save_yaml(full_path, data)

            send_json(self, 200, {'success': True, 'proposal_id': proposal_id, 'new_status': new_status})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    # ──────────────────────────────────────────────
    # POST /api/update_mode  — legacy compat
    # ──────────────────────────────────────────────
    def handle_api_update_mode(self):
        try:
            params = self._read_body()
            subsystem = params.get('subsystem')
            key = params.get('key')
            value = params.get('value')
            if not subsystem or not key or value is None:
                send_json(self, 400, {'error': 'Missing parameters'})
                return
            ctrl_path = os.path.join(WORKSPACE_ROOT, 'CONTROLER.yaml')
            data = load_yaml(ctrl_path)
            if subsystem in ('system', 'core'):
                data.setdefault('core', {}).setdefault('modes', {})[key] = value
            elif subsystem in ('scaler', 'hustler'):
                data.setdefault('pipelines', {}).setdefault(subsystem, {}).setdefault('modes', {})[key] = value
            else:
                data.setdefault('modes', {}).setdefault(subsystem, {})[key] = value
            save_yaml(ctrl_path, data)
            send_json(self, 200, {'success': True})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    # ──────────────────────────────────────────────
    # GET /api/law?name=<name>
    # ──────────────────────────────────────────────
    def handle_api_law(self, parsed):
        try:
            qs = parse_qs(parsed.query)
            law_name = qs.get('name', [None])[0]
            if not law_name:
                send_json(self, 400, {'error': "'name' param required"})
                return
            clean = "".join(c for c in law_name if c.isalnum() or c in ('_', '-'))
            identity_dir = os.path.join(WORKSPACE_ROOT, '.meta_os', 'meta_identity')
            law_path = None
            for root, dirs, files in os.walk(identity_dir):
                if f"{clean}.md" in files:
                    law_path = os.path.join(root, f"{clean}.md")
                    break
            if not law_path:
                send_json(self, 404, {'error': f"Law '{clean}' not found"})
                return
            with open(law_path, 'r', encoding='utf-8') as f:
                content = f.read()
            send_json(self, 200, {'name': clean, 'content': content})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    # ──────────────────────────────────────────────
    # POST /api/sync
    # ──────────────────────────────────────────────
    def handle_api_sync(self):
        try:
            engines_dir = os.path.join(WORKSPACE_ROOT, '.meta', 'engine', 'engines')
            scripts = [
                os.path.join(engines_dir, 'pipeline_scaler_engine.py'),
                os.path.join(engines_dir, 'pipeline_hustler_engine.py'),
                os.path.join(engines_dir, 'projects_engine.py'),
                os.path.join(engines_dir, 'meta_engine.py'),
            ]
            for script in scripts:
                if os.path.exists(script):
                    subprocess.run([sys.executable, script], check=True, cwd=WORKSPACE_ROOT)
            send_json(self, 200, {'returncode': 0, 'stdout': 'Sync complete', 'stderr': ''})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    # ──────────────────────────────────────────────
    # POST /api/triage
    # ──────────────────────────────────────────────
    def handle_api_triage(self):
        try:
            params = self._read_body()
            filename = params.get('filename')
            if not filename:
                send_json(self, 400, {'error': "'filename' required"})
                return
            clean = os.path.basename(filename)
            inbox = os.path.join(WORKSPACE_ROOT, 'pipeline_hustler', '_HUSTLER-EXTERNAL_SOURCES', '.hustler_mixed_inbox')
            target = os.path.join(WORKSPACE_ROOT, 'pipeline_hustler', '_HUSTLER-EXTERNAL_SOURCES', '_algerian-ecommerce_inbox')
            src = os.path.join(inbox, clean)
            dst = os.path.join(target, clean)
            if not os.path.exists(src):
                send_json(self, 404, {'error': f"{clean} not found"})
                return
            os.makedirs(target, exist_ok=True)
            os.rename(src, dst)
            send_json(self, 200, {'success': True, 'moved': clean})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    # ──────────────────────────────────────────────
    # POST /api/update_session
    # ──────────────────────────────────────────────
    def handle_api_update_session(self):
        try:
            params = self._read_body()
            session_name = params.get('session_name')
            status = params.get('status')
            if not session_name or not status:
                send_json(self, 400, {'error': 'Missing params'})
                return
            roots = [
                os.path.join(WORKSPACE_ROOT, '.meta_os', 'meta_milestones'),
                os.path.join(WORKSPACE_ROOT, 'pipeline_scaler', '.scaler_os', 'scaler_milestones'),
                os.path.join(WORKSPACE_ROOT, 'pipeline_hustler', '.hustler_os', 'hustler_milestones'),
                os.path.join(WORKSPACE_ROOT, 'projects', '.projects_os', '.projects_milestones'),
            ]
            session_dir = None
            for root in roots:
                if os.path.exists(root):
                    for r, dirs, _ in os.walk(root):
                        if session_name in dirs:
                            session_dir = os.path.join(r, session_name)
                            break
                if session_dir:
                    break
            if not session_dir:
                send_json(self, 404, {'error': f"Session {session_name} not found"})
                return
            sess_path = os.path.join(session_dir, 'SESSION.yaml')
            data = load_yaml(sess_path)
            data.setdefault('metadata', {})['status'] = status
            save_yaml(sess_path, data)
            send_json(self, 200, {'success': True})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})

    # ──────────────────────────────────────────────
    # POST /api/update_goal
    # ──────────────────────────────────────────────
    def handle_api_update_goal(self):
        try:
            from datetime import datetime
            params = self._read_body()
            session_name = params.get('session_name')
            goal_name = params.get('goal_name')
            status = params.get('status')
            if not session_name or not goal_name or not status:
                send_json(self, 400, {'error': 'Missing params'})
                return
            roots = [
                os.path.join(WORKSPACE_ROOT, '.meta_os', 'meta_milestones'),
                os.path.join(WORKSPACE_ROOT, 'pipeline_scaler', '.scaler_os', 'scaler_milestones'),
                os.path.join(WORKSPACE_ROOT, 'pipeline_hustler', '.hustler_os', 'hustler_milestones'),
                os.path.join(WORKSPACE_ROOT, 'projects', '.projects_os', '.projects_milestones'),
            ]
            session_dir = None
            for root in roots:
                if os.path.exists(root):
                    for r, dirs, _ in os.walk(root):
                        if session_name in dirs:
                            session_dir = os.path.join(r, session_name)
                            break
                if session_dir:
                    break
            if not session_dir:
                send_json(self, 404, {'error': f"Session {session_name} not found"})
                return
            goal_path = os.path.join(session_dir, goal_name, 'GOAL.yaml')
            data = load_yaml(goal_path)
            data.setdefault('metadata', {})['status'] = status
            data.setdefault('execution', {}).setdefault('state', {})['last_progress_at'] = datetime.now().isoformat()
            save_yaml(goal_path, data)
            send_json(self, 200, {'success': True})
        except Exception as e:
            send_json(self, 500, {'error': str(e)})


def monitor_dashboard_status(httpd):
    while True:
        try:
            ctrl_path = os.path.join(WORKSPACE_ROOT, 'CONTROLER.yaml')
            if os.path.exists(ctrl_path):
                data = load_yaml(ctrl_path)
                status = data.get('core', {}).get('modes', {}).get('dashboard_status', 'off')
                if 'off' in str(status).lower():
                    print("\n[!] Dashboard turned off — shutting down.")
                    threading.Thread(target=httpd.shutdown).start()
                    break
        except Exception:
            pass
        time.sleep(5)


def run_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, DashboardHandler)
    print(f"[*] Agentic OS Dashboard → http://localhost:{PORT}")
    monitor_thread = threading.Thread(target=monitor_dashboard_status, args=(httpd,), daemon=True)
    monitor_thread.start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] Shutting down.")
    finally:
        httpd.server_close()


if __name__ == '__main__':
    run_server()
