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
WORKSPACE_ROOT = os.path.dirname(os.path.dirname(DASHBOARD_DIR))

class DashboardHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def end_headers(self):
        # Allow CORS for clean development and testing
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_GET(self):
        if self.path == '/api/state':
            self.handle_api_state()
        elif self.path.startswith('/api/law'):
            self.handle_api_law()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/sync':
            self.handle_api_sync()
        elif self.path == '/api/update_mode':
            self.handle_api_update_mode()
        elif self.path == '/api/triage':
            self.handle_api_triage()
        elif self.path == '/api/update_session':
            self.handle_api_update_session()
        elif self.path == '/api/update_goal':
            self.handle_api_update_goal()
        else:
            self.send_error(404, "Not Found")

    def handle_api_update_mode(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            params = json.loads(post_data)
            
            subsystem = params.get('subsystem') # e.g., 'system', 'scaler', 'hustler'
            key = params.get('key')             # e.g., 'work_mode', 'evolution_mode'
            value = params.get('value')
            
            if not subsystem or not key or value is None:
                self.send_error(400, "Bad Request: Missing parameters.")
                return

            controller_path = os.path.join(WORKSPACE_ROOT, 'CONTROLER.yaml')
            if not os.path.exists(controller_path):
                self.send_error(404, "CONTROLER.yaml not found.")
                return

            with open(controller_path, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f) or {}

            if subsystem == 'system' or subsystem == 'core':
                if 'core' not in data: data['core'] = {}
                if 'modes' not in data['core']: data['core']['modes'] = {}
                data['core']['modes'][key] = value
            elif subsystem == 'scaler' or subsystem == 'hustler':
                if 'pipelines' not in data: data['pipelines'] = {}
                if subsystem not in data['pipelines']: data['pipelines'][subsystem] = {}
                if 'modes' not in data['pipelines'][subsystem]: data['pipelines'][subsystem]['modes'] = {}
                data['pipelines'][subsystem]['modes'][key] = value
            else:
                if 'modes' not in data: data['modes'] = {}
                if subsystem not in data['modes']: data['modes'][subsystem] = {}
                data['modes'][subsystem][key] = value

            # Save back safely using atomic replacement
            temp_path = controller_path + '.tmp'
            with open(temp_path, 'w', encoding='utf-8') as f:
                yaml.safe_dump(data, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
            os.replace(temp_path, controller_path)

            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}, ensure_ascii=False).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

    def handle_api_triage(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            params = json.loads(post_data)
            
            filename = params.get('filename')
            if not filename:
                self.send_error(400, "Bad Request: 'filename' is required.")
                return

            # Sanitize filename
            clean_filename = os.path.basename(filename)
            inbox_dir = os.path.join(WORKSPACE_ROOT, 'pipeline_hustler', '_HUSTLER-EXTERNAL_SOURCES', '.hustler_mixed_inbox')
            target_dir = os.path.join(WORKSPACE_ROOT, 'pipeline_hustler', '_HUSTLER-EXTERNAL_SOURCES', '_algerian-ecommerce_inbox')
            
            source_file = os.path.join(inbox_dir, clean_filename)
            dest_file = os.path.join(target_dir, clean_filename)

            if not os.path.exists(source_file):
                self.send_error(404, f"File {clean_filename} not found in staging inbox.")
                return

            os.makedirs(target_dir, exist_ok=True)
            os.rename(source_file, dest_file)

            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'moved': clean_filename}, ensure_ascii=False).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

    def handle_api_update_session(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            params = json.loads(post_data)
            
            session_name = params.get('session_name')
            status = params.get('status')
            
            if not session_name or not status:
                self.send_error(400, "Bad Request: Missing parameters.")
                return

            # Find session folder
            milestones_roots = [
                os.path.join(WORKSPACE_ROOT, '.meta_os', 'meta_milestones'),
                os.path.join(WORKSPACE_ROOT, 'pipeline_scaler', '.scaler_os', 'scaler_milestones'),
                os.path.join(WORKSPACE_ROOT, 'pipeline_hustler', '.hustler_os', 'hustler_milestones'),
                os.path.join(WORKSPACE_ROOT, 'projects', '.projects_os', '.projects_milestones')
            ]
            session_dir = None
            for m_root in milestones_roots:
                if os.path.exists(m_root):
                    for root, dirs, files in os.walk(m_root):
                        if session_name in dirs:
                            session_dir = os.path.join(root, session_name)
                            break
                if session_dir:
                    break

            if not session_dir:
                self.send_error(404, f"Session {session_name} folder not found.")
                return

            session_yaml_path = os.path.join(session_dir, 'SESSION.yaml')
            if not os.path.exists(session_yaml_path):
                self.send_error(404, f"SESSION.yaml not found for {session_name}.")
                return

            with open(session_yaml_path, 'r', encoding='utf-8') as f:
                sess_data = yaml.safe_load(f) or {}

            if 'metadata' not in sess_data:
                sess_data['metadata'] = {}
                
            sess_data['metadata']['status'] = status

            # Save back safely using atomic replacement
            temp_path = session_yaml_path + '.tmp'
            with open(temp_path, 'w', encoding='utf-8') as f:
                yaml.safe_dump(sess_data, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
            os.replace(temp_path, session_yaml_path)

            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}, ensure_ascii=False).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

    def handle_api_update_goal(self):
        try:
            from datetime import datetime
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            params = json.loads(post_data)
            
            session_name = params.get('session_name')
            goal_name = params.get('goal_name')
            status = params.get('status')
            
            if not session_name or not goal_name or not status:
                self.send_error(400, "Bad Request: Missing parameters.")
                return

            # Find session folder
            milestones_roots = [
                os.path.join(WORKSPACE_ROOT, '.meta_os', 'meta_milestones'),
                os.path.join(WORKSPACE_ROOT, 'pipeline_scaler', '.scaler_os', 'scaler_milestones'),
                os.path.join(WORKSPACE_ROOT, 'pipeline_hustler', '.hustler_os', 'hustler_milestones'),
                os.path.join(WORKSPACE_ROOT, 'projects', '.projects_os', '.projects_milestones')
            ]
            session_dir = None
            for m_root in milestones_roots:
                if os.path.exists(m_root):
                    for root, dirs, files in os.walk(m_root):
                        if session_name in dirs:
                            session_dir = os.path.join(root, session_name)
                            break
                if session_dir:
                    break

            if not session_dir:
                self.send_error(404, f"Session {session_name} folder not found.")
                return

            goal_yaml_path = os.path.join(session_dir, goal_name, 'GOAL.yaml')
            if not os.path.exists(goal_yaml_path):
                self.send_error(404, f"GOAL.yaml not found for goal {goal_name} in session {session_name}.")
                return

            with open(goal_yaml_path, 'r', encoding='utf-8') as f:
                goal_data = yaml.safe_load(f) or {}

            if 'metadata' not in goal_data:
                goal_data['metadata'] = {}
                
            goal_data['metadata']['status'] = status
            
            if 'execution' not in goal_data:
                goal_data['execution'] = {}
            if 'state' not in goal_data['execution']:
                goal_data['execution']['state'] = {}
                
            goal_data['execution']['state']['last_progress_at'] = datetime.now().isoformat()

            # Save back safely using atomic replacement
            temp_path = goal_yaml_path + '.tmp'
            with open(temp_path, 'w', encoding='utf-8') as f:
                yaml.safe_dump(goal_data, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
            os.replace(temp_path, goal_yaml_path)

            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}, ensure_ascii=False).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

    def handle_api_state(self):
        try:
            # 1. Load CONTROLER.yaml
            controller_path = os.path.join(WORKSPACE_ROOT, 'CONTROLER.yaml')
            controller_data = {}
            if os.path.exists(controller_path):
                with open(controller_path, 'r', encoding='utf-8') as f:
                    controller_data = yaml.safe_load(f) or {}

            # Consolidated payload
            payload = {
                'controller': controller_data
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(payload, ensure_ascii=False).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

    def handle_api_law(self):
        try:
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            law_name = query_params.get('name', [None])[0]

            if not law_name:
                self.send_error(400, "Bad Request: 'name' parameter is required.")
                return

            # Sanitize law_name to prevent directory traversal
            clean_name = "".join(c for c in law_name if c.isalnum() or c in ('_', '-'))
            if not clean_name:
                self.send_error(400, "Bad Request: Invalid law name.")
                return

            identity_dir = os.path.join(WORKSPACE_ROOT, '.meta_os', 'meta_identity')
            law_file_path = None
            if os.path.exists(identity_dir):
                for root, dirs, files in os.walk(identity_dir):
                    if f"{clean_name}.md" in files:
                        law_file_path = os.path.join(root, f"{clean_name}.md")
                        break

            if not law_file_path or not os.path.exists(law_file_path):
                self.send_error(404, f"Not Found: Law file for '{clean_name}' does not exist.")
                return

            with open(law_file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            response = {
                'name': clean_name,
                'content': content
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

    def handle_api_sync(self):
        try:
            # Execute one-time sync by calling the individual scripts sequentially
            engines_dir = os.path.join(WORKSPACE_ROOT, '.meta', 'engine', 'engines')
            meta_script = os.path.join(engines_dir, 'meta_engine.py')
            scaler_script = os.path.join(engines_dir, 'pipeline_scaler_engine.py')
            hustler_script = os.path.join(engines_dir, 'pipeline_hustler_engine.py')
            projects_script = os.path.join(engines_dir, 'projects_engine.py')

            # We don't read modes for one-time manual sync, we just sync everything
            for script in [scaler_script, hustler_script, projects_script, meta_script]:
                if os.path.exists(script):
                    subprocess.run([sys.executable, script], check=True, cwd=WORKSPACE_ROOT)
            
            result_stdout = "Sync completed successfully across all engines."
            result_returncode = 0
            
            response = {
                'returncode': result_returncode,
                'stdout': result_stdout,
                'stderr': ''
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

def monitor_dashboard_status(httpd):
    """Background thread to check dashboard_status and shutdown if off."""
    while True:
        try:
            controller_path = os.path.join(WORKSPACE_ROOT, 'CONTROLER.yaml')
            if os.path.exists(controller_path):
                with open(controller_path, 'r', encoding='utf-8') as f:
                    data = yaml.safe_load(f) or {}
                    
                status = data.get('core', {}).get('modes', {}).get('dashboard_status', 'off')
                if 'off' in str(status).lower():
                    print("\n[!] Dashboard status turned off. Initiating graceful shutdown...")
                    threading.Thread(target=httpd.shutdown).start()
                    break
        except Exception as e:
            pass
        time.sleep(5)

def run_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, DashboardHandler)
    print(f"[*] Agentic OS Dashboard serving on http://localhost:{PORT}")
    
    monitor_thread = threading.Thread(target=monitor_dashboard_status, args=(httpd,), daemon=True)
    monitor_thread.start()
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] Shutting down server.")
    finally:
        httpd.server_close()

if __name__ == '__main__':
    run_server()

