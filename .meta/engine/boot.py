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

def read_db_modes(db_relative_path):
    """Read the modes block from an authoritative pillar DB.

    boot.py is the single spawn authority. It must NOT rely on CONTROLER.yaml
    (a daemon-written rollup) for spawn decisions — that creates a chicken-and-egg
    loop where no daemon can start until a daemon has written the rollup.
    Each pillar's own DB under .meta_os/meta_db/ is the authoritative (in) source.
    """
    db_path = os.path.join(WORKSPACE_ROOT, db_relative_path)
    if not os.path.exists(db_path):
        return {}
    try:
        with open(db_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f) or {}
        return data.get('metadata', {}).get('modes', {}) or {}
    except Exception:
        return {}

def status_is_on(value):
    """A status string counts as 'on' if it is in the active vocabulary.

    Resolves the vocabulary drift between schemas (which say 'on|idle|paused|archived')
    and current data (which uses 'active'). Both mean 'running' here. Anything in
    the off-set (off, paused, idle, archived, stopped) suppresses the engine.
    """
    if value is None:
        return False
    s = str(value).strip().lower()
    # Strip emoji indicators and whitespace for matching
    s = s.replace('🟢', '').replace('🔴', '').replace('🟠', '').strip()
    return s in ('on', 'active', 'true', 'yes', '1')

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
            # AUTHORITY: read modes directly from each pillar's authoritative DB.
            # CONTROLER.yaml is a daemon-written rollup — relying on it for spawn
            # gating creates a deadlock if the daemon isn't up yet to write it.
            try:
                core_modes = read_db_modes('.meta_os/meta_db/meta_os.yaml')
                autosync_status = core_modes.get('autosync_status', 'off')
                dashboard_status = core_modes.get('dashboard_status', 'off')

                scaler_modes = read_db_modes('.meta_os/meta_db/pipeline_scaler_os.yaml')
                hustler_modes = read_db_modes('.meta_os/meta_db/pipeline_hustler_os.yaml')
                projects_modes = read_db_modes('.meta_os/meta_db/projects_os.yaml')

                scaler_status = scaler_modes.get('pipeline_status', 'off')
                hustler_status = hustler_modes.get('pipeline_status', 'off')
                projects_status = projects_modes.get('project_status', 'off')
            except Exception:
                time.sleep(2)
                continue

            is_dashboard_on = status_is_on(dashboard_status)
            is_autosync_on = status_is_on(autosync_status)

            is_scaler_on = status_is_on(scaler_status)
            is_hustler_on = status_is_on(hustler_status)
            is_projects_on = status_is_on(projects_status)

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
