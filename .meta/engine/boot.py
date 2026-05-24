import os
import sys
import yaml
import subprocess
import time
import socket

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CONTROLER_PATH = os.path.join(WORKSPACE_ROOT, 'CONTROLER.yaml')

# Define paths
engines_dir = os.path.join(WORKSPACE_ROOT, '.meta', 'engine', 'engines')
meta_sync_script = os.path.join(engines_dir, 'meta_engine.py')
scaler_script = os.path.join(engines_dir, 'pipeline_scaler_engine.py')
hustler_script = os.path.join(engines_dir, 'pipeline_hustler_engine.py')
projects_script = os.path.join(engines_dir, 'projects_engine.py')
server_script = os.path.join(WORKSPACE_ROOT, '.meta', 'engine', 'dashboard', 'backend', 'server.py')

def read_controller():
    if not os.path.exists(CONTROLER_PATH):
        return {}
    try:
        with open(CONTROLER_PATH, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f) or {}
    except Exception:
        return {}

def acquire_lock():
    """Ensure only one bootloader supervisor runs at a time."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        # Bind to a specific localhost port to act as a system-wide single-instance lock
        s.bind(('127.0.0.1', 49999))
        s.listen(1)
        return s
    except OSError:
        print("[!] Agentic OS Bootloader is already running. Exiting to prevent duplicate daemons.")
        sys.exit(0)

def manage_process(processes, name, should_run, command):
    proc = processes.get(name)
    is_running = proc is not None and proc.poll() is None
    
    if should_run and not is_running:
        print(f"[*] Starting {name}...")
        processes[name] = subprocess.Popen(command)
    elif not should_run and is_running:
        print(f"[*] Stopping {name}...")
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()

def main():
    print("🚀 Agentic OS Bootloader Supervisor Initiated")
    lock_sock = acquire_lock()
    
    processes = {}
    
    try:
        while True:
            controller_data = read_controller()
            if not controller_data:
                time.sleep(2)
                continue
                
            # Safely extract statuses
            try:
                core_modes = controller_data.get('core', {}).get('modes', {})
                autosync_status = core_modes.get('autosync_status', 'off')
                dashboard_status = core_modes.get('dashboard_status', 'off')
                
                scaler_status = controller_data.get('pipelines', {}).get('scaler', {}).get('modes', {}).get('pipeline_status', 'off')
                hustler_status = controller_data.get('pipelines', {}).get('hustler', {}).get('modes', {}).get('pipeline_status', 'off')
                projects_status = controller_data.get('projects', {}).get('modes', {}).get('project_status', 'off')
            except AttributeError:
                time.sleep(2)
                continue
                
            is_dashboard_on = 'on' in str(dashboard_status).lower()
            is_autosync_on = 'on' in str(autosync_status).lower()
            
            is_scaler_on = 'on' in str(scaler_status).lower()
            is_hustler_on = 'on' in str(hustler_status).lower()
            is_projects_on = 'on' in str(projects_status).lower()
            
            # 1. Manage Dashboard Server
            manage_process(processes, 'Dashboard Server', is_dashboard_on, [sys.executable, server_script])
            
            # 2. Manage Core Engine Daemon
            manage_process(processes, 'Core Meta Engine', is_autosync_on, [sys.executable, meta_sync_script, '--daemon'])
            
            # 3. Manage Pipeline and Project Daemons
            manage_process(processes, 'Scaler Engine', is_autosync_on and is_scaler_on, [sys.executable, scaler_script, '--daemon'])
            manage_process(processes, 'Hustler Engine', is_autosync_on and is_hustler_on, [sys.executable, hustler_script, '--daemon'])
            manage_process(processes, 'Projects Engine', is_autosync_on and is_projects_on, [sys.executable, projects_script, '--daemon'])
            
            time.sleep(2)
            
    except KeyboardInterrupt:
        print("\n[!] Shutting down Master Supervisor and all daemons.")
        for name, proc in processes.items():
            if proc and proc.poll() is None:
                proc.terminate()
        lock_sock.close()
        sys.exit(0)

if __name__ == '__main__':
    main()
