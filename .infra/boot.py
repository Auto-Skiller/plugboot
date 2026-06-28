import os
import sys

_VENV_PYTHON = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.venv', 'Scripts', 'python.exe')
if os.path.exists(_VENV_PYTHON) and not sys.executable.startswith(os.path.dirname(_VENV_PYTHON)):
    sys.executable = _VENV_PYTHON

import yaml
import subprocess
import time
import socket
import json
from datetime import datetime

WORKSPACE_ROOT = os.path.dirname(os.path.abspath(__file__))
PID_FILE = os.path.join(WORKSPACE_ROOT, '.infra', 'boot.pid')
ENGINE_SCRIPT = os.path.join(WORKSPACE_ROOT, '.infra', 'engine.py')

os.makedirs(os.path.join(WORKSPACE_ROOT, '.infra', 'logs'), exist_ok=True)
LOG_DIR = os.path.join(WORKSPACE_ROOT, '.infra', 'logs')


def status_is_on(value):
    if value is None:
        return False
    s = str(value).strip().lower()
    s = s.replace('\U0001f7e2', '').replace('\U0001f534', '').replace('\U0001f7e0', '').strip()
    return s in ('on', 'active', 'true', 'yes', '1')


def is_pid_alive(pid):
    if os.name == 'nt':
        try:
            output = subprocess.check_output(f'tasklist /FI "PID eq {pid}" /NH', shell=True).decode()
            return str(pid) in output
        except Exception:
            return True
    else:
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False


def acquire_lock():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(('127.0.0.1', 49999))
        s.listen(1)
        return s
    except OSError:
        if os.path.exists(PID_FILE):
            try:
                with open(PID_FILE, 'r', encoding='utf-8') as f:
                    pid_data = json.load(f)
                supervisor_pid = pid_data.get('supervisor_pid')
                if supervisor_pid and not is_pid_alive(supervisor_pid):
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


def main():
    print(f"[boot.py] Supervisor starting — PID {os.getpid()}, Python: {sys.executable}")

    lock_sock = acquire_lock()
    print("[boot.py] Lock acquired")

    # Pre-flight: clean stale PID files
    print("[boot.py] Cleaning stale PID files...")
    try:
        pid_dir = os.path.join(WORKSPACE_ROOT, '.infra', 'pids')
        if os.path.exists(pid_dir):
            for fname in os.listdir(pid_dir):
                if not fname.endswith('.pid'):
                    continue
                fpath = os.path.join(pid_dir, fname)
                try:
                    with open(fpath, 'r', encoding='utf-8') as f:
                        pdata = json.load(f)
                    pid = pdata.get('pid')
                    if pid and not is_pid_alive(pid):
                        os.remove(fpath)
                except Exception:
                    os.remove(fpath)
    except Exception:
        pass

    print("[boot.py] Starting engine...")
    processes = {}

    try:
        while True:
            try:
                core_modes = {}
                system_yaml = os.path.join(WORKSPACE_ROOT, '.db', 'system.yaml')
                if os.path.exists(system_yaml):
                    with open(system_yaml, 'r', encoding='utf-8') as f:
                        data = yaml.safe_load(f) or {}
                    core_modes = data.get('metadata', {}).get('modes', {})
            except Exception as e:
                print(f"[boot.py] Error reading modes: {e}")
                time.sleep(2)
                continue

            autosync_status = core_modes.get('autosync_status', 'off')
            is_autosync_on = status_is_on(autosync_status)

            # Kill old engine processes
            for name, proc in list(processes.items()):
                if proc and proc.poll() is not None:
                    del processes[name]

            # Start engine if needed
            if is_autosync_on and 'Engine' not in processes:
                print("[boot.py] Starting engine (daemon mode)...")
                log_file = open(os.path.join(LOG_DIR, 'engine.log'), 'a', encoding='utf-8')
                processes['Engine'] = subprocess.Popen(
                    [sys.executable, ENGINE_SCRIPT, '--daemon'],
                    stdout=log_file,
                    stderr=subprocess.STDOUT,
                    bufsize=1,
                    universal_newlines=True
                )

            # Save PID registry
            engines_data = {}
            for name, proc in processes.items():
                if proc and proc.poll() is None:
                    engines_data[name] = {
                        "pid": proc.pid,
                        "log": f".infra/logs/engine.log"
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

            time.sleep(2)

    except KeyboardInterrupt:
        print("\n[!] Shutting down Supervisor and engine.")
        for name, proc in processes.items():
            if proc and proc.poll() is None:
                proc.terminate()
        lock_sock.close()
        if os.path.exists(PID_FILE):
            os.remove(PID_FILE)
        sys.exit(0)


if __name__ == '__main__':
    main()
