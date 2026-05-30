import os
import sys
import yaml
import subprocess
import time
import socket
import json
from datetime import datetime

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CONTROLER_PATH = os.path.join(WORKSPACE_ROOT, 'CONTROLER.yaml')
LOG_DIR = os.path.join(WORKSPACE_ROOT, '.meta', 'logs')
PID_FILE = os.path.join(WORKSPACE_ROOT, '.meta', 'boot.pid')

# Define paths
engines_dir = os.path.join(WORKSPACE_ROOT, '.meta', 'engine', 'engines')
meta_sync_script = os.path.join(engines_dir, 'meta_engine.py')
scaler_script = os.path.join(engines_dir, 'pipeline_scaler_engine.py')
hustler_script = os.path.join(engines_dir, 'pipeline_hustler_engine.py')
projects_script = os.path.join(engines_dir, 'projects_engine.py')
server_script = os.path.join(WORKSPACE_ROOT, '.meta', 'engine', 'dashboard', 'backend', 'server.py')

os.makedirs(LOG_DIR, exist_ok=True)

def read_controller():
    if not os.path.exists(CONTROLER_PATH):
        return {}
    try:
        with open(CONTROLER_PATH, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f) or {}
    except Exception:
        return {}

def is_pid_running(pid):
    if os.name == 'nt':
        try:
            output = subprocess.check_output(f'tasklist /FI "PID eq {pid}" /NH', shell=True).decode()
            return str(pid) in output
        except Exception:
            return True # Conservative fallback
    else:
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False

def acquire_lock():
    """Ensure only one bootloader supervisor runs at a time. Reclaim if stale."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(('127.0.0.1', 49999))
        s.listen(1)
        return s
    except OSError:
        # Lock is held. Is it a zombie?
        if os.path.exists(PID_FILE):
            try:
                with open(PID_FILE, 'r', encoding='utf-8') as f:
                    pid_data = json.load(f)
                supervisor_pid = pid_data.get('supervisor_pid')
                if supervisor_pid and not is_pid_running(supervisor_pid):
                    print(f"[!] Stale bootloader lock detected (PID {supervisor_pid} dead). Reclaiming...")
                    if os.name == 'nt':
                        subprocess.call(f'taskkill /F /PID {supervisor_pid}', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    
                    time.sleep(1)
                    try:
                        s.bind(('127.0.0.1', 49999))
                        s.listen(1)
                        return s
                    except OSError:
                        pass
            except Exception:
                pass
                
        print("[!] Agentic OS Bootloader is already running. Exiting to prevent duplicate daemons.")
        sys.exit(0)

def manage_process_with_logs(processes, name, should_run, command, log_filename):
    proc = processes.get(name)
    is_running = proc is not None and proc.poll() is None
    
    if should_run and not is_running:
        print(f"[*] Starting {name} (logging to {log_filename})...")
        log_file_path = os.path.join(LOG_DIR, log_filename)
        log_file = open(log_file_path, 'a', encoding='utf-8')
        processes[name] = subprocess.Popen(
            command, 
            stdout=log_file, 
            stderr=subprocess.STDOUT, 
            bufsize=1, # Line buffered
            universal_newlines=True
        )
    elif not should_run and is_running:
        print(f"[*] Stopping {name}...")
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()

def save_pid_registry(processes):
    log_map = {
        'Dashboard Server': 'dashboard_server.log',
        'Core Meta Engine': 'meta_engine.log',
        'Scaler Engine': 'scaler_engine.log',
        'Hustler Engine': 'hustler_engine.log',
        'Projects Engine': 'projects_engine.log'
    }
    engines_data = {}
    for name, proc in processes.items():
        if proc and proc.poll() is None:
            log_name = log_map.get(name, name.lower().replace(' ', '_') + ".log")
            engines_data[name] = {
                "pid": proc.pid,
                "log": f".meta/logs/{log_name}"
            }
            
    pid_data = {
        "supervisor_pid": os.getpid(),
        "booted_at": datetime.now().isoformat(),
        "port": 49999,
        "engines": engines_data
    }
    
    try:
        with open(PID_FILE, 'w', encoding='utf-8') as f:
            json.dump(pid_data, f, indent=2)
    except Exception as e:
        print(f"[!] Failed to write PID registry: {e}")

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
            
            manage_process_with_logs(processes, 'Dashboard Server', is_dashboard_on, [sys.executable, server_script], 'dashboard_server.log')
            manage_process_with_logs(processes, 'Core Meta Engine', is_autosync_on, [sys.executable, meta_sync_script, '--daemon'], 'meta_engine.log')
            manage_process_with_logs(processes, 'Scaler Engine', is_autosync_on and is_scaler_on, [sys.executable, scaler_script, '--daemon'], 'scaler_engine.log')
            manage_process_with_logs(processes, 'Hustler Engine', is_autosync_on and is_hustler_on, [sys.executable, hustler_script, '--daemon'], 'hustler_engine.log')
            manage_process_with_logs(processes, 'Projects Engine', is_autosync_on and is_projects_on, [sys.executable, projects_script, '--daemon'], 'projects_engine.log')
            
            save_pid_registry(processes)
            
            time.sleep(2)
            
    except KeyboardInterrupt:
        print("\n[!] Shutting down Master Supervisor and all daemons.")
        for name, proc in processes.items():
            if proc and proc.poll() is None:
                proc.terminate()
        lock_sock.close()
        if os.path.exists(PID_FILE):
            os.remove(PID_FILE)
        sys.exit(0)

if __name__ == '__main__':
    main()
