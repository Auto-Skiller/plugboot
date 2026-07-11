#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
PlugBoot Daemon Manager (Supervisor).
Runs under pythoncore-3.14-64 interpreter.
Coordinates the background daemon.py subprocess.
"""

import sys
import os
import time
import json
import socket
import subprocess
import webbrowser
from pathlib import Path
from datetime import datetime, timezone
from ruamel.yaml import YAML

# Paths
WORKSPACE = Path(__file__).resolve().parents[2]
CONFIG = WORKSPACE / "config.yaml"
PIDFILE = WORKSPACE / ".stash" / "pids" / "daemon.pid"
MGRLOCK = WORKSPACE / ".stash" / "pids" / "manager.lock"
DAEMON = WORKSPACE / ".infra" / "backend" / "daemon.py"

# Interpreter lookup
PY = os.environ.get("PB_PYTHON", r"C:\Users\BAB AL SAFA\AppData\Local\Python\pythoncore-3.14-64\python.exe")
if not os.path.exists(PY):
    PY = sys.executable

yaml_parser = YAML()
yaml_parser.preserve_quotes = True
yaml_parser.default_flow_style = False


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def is_alive(pid):
    if pid is None or pid <= 0:
        return False
    try:
        # Check process table using tasklist on Windows
        res = subprocess.run(
            ["tasklist", "/FI", f"PID eq {pid}", "/FO", "CSV"],
            capture_output=True, text=True, timeout=3
        )
        lines = res.stdout.strip().splitlines()
        for line in lines:
            if line.startswith('"') and f'"{pid}"' in line:
                return True
        return False
    except Exception:
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False


def get_manager_pid():
    if not MGRLOCK.exists():
        return None
    try:
        content = MGRLOCK.read_text(encoding="utf-8").strip()
        if content.isdigit():
            return int(content)
    except Exception:
        pass
    return None


def read_config():
    with open(CONFIG, "r", encoding="utf-8") as f:
        return yaml_parser.load(f)


def desired_state(cfg):
    if not cfg.get("sync_daemon"):
        return ("off", None)
    port = int(cfg.get("dashboard", {}).get("port", 8000))
    if cfg.get("dashboard", {}).get("enabled"):
        return ("served", port)
    return ("headless", port)


def spawn_daemon(mode, port):
    LOGDIR = WORKSPACE / ".stash" / "logs"
    LOGDIR.mkdir(parents=True, exist_ok=True)
    PIDFILE.parent.mkdir(parents=True, exist_ok=True)

    env = os.environ.copy()
    env["PB_PORT"] = str(port)
    env["PYTHONIOENCODING"] = "utf-8"

    args = [PY, str(DAEMON)]
    if mode == "headless":
        args.append("--no-server")

    log_path = LOGDIR / "daemon_heartbeat.log"
    with open(log_path, "a", encoding="utf-8") as log_file:
        p = subprocess.Popen(
            args,
            cwd=str(WORKSPACE),
            env=env,
            stdout=log_file,
            stderr=subprocess.STDOUT,
            creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, "CREATE_NO_WINDOW") else 0
        )

    registry = {
        "pid": p.pid,
        "port": port,
        "mode": mode,
        "started": now_iso()
    }
    PIDFILE.write_text(json.dumps(registry), encoding="utf-8")
    print(f"[manager] Spawned daemon mode={mode} port={port} PID={p.pid}")

    if mode == "served":
        cfg = read_config()
        if cfg.get("dashboard", {}).get("auto_open"):
            opened = False
            for _ in range(10):
                time.sleep(0.5)
                probe = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                probe.settimeout(0.5)
                try:
                    probe.connect(("127.0.0.1", port))
                    probe.close()
                    opened = True
                    break
                except OSError:
                    probe.close()
            if opened:
                print(f"[manager] Port {port} accepts connections. Triggering auto-open.")
                # Try shell start command first (most robust on Windows terminal subprocesses)
                try:
                    subprocess.run(f"start http://127.0.0.1:{port}", shell=True, capture_output=True)
                except Exception:
                    pass
                try:
                    webbrowser.open(f"http://127.0.0.1:{port}")
                except Exception:
                    pass
            else:
                print(f"[manager] Port {port} did not become active in time.")


def stop_daemon():
    if not PIDFILE.exists():
        return
    try:
        data = json.loads(PIDFILE.read_text(encoding="utf-8"))
        pid = data.get("pid")
        if pid and is_alive(pid):
            print(f"[manager] Stopping daemon PID={pid}")
            subprocess.run(["taskkill", "/PID", str(pid), "/F"], capture_output=True)
    except Exception as e:
        print(f"[manager] Error stopping daemon: {e}")
    finally:
        if PIDFILE.exists():
            try:
                PIDFILE.unlink()
            except OSError:
                pass


def reconcile():
    try:
        cfg = read_config()
        desired_mode, desired_port = desired_state(cfg)
    except Exception as e:
        print(f"[manager] Error reading config: {e}")
        return

    current_pid = None
    current_mode = None
    current_port = None

    if PIDFILE.exists():
        try:
            data = json.loads(PIDFILE.read_text(encoding="utf-8"))
            pid = data.get("pid")
            if is_alive(pid):
                current_pid = pid
                current_mode = data.get("mode")
                current_port = data.get("port")
            else:
                PIDFILE.unlink()
        except Exception:
            pass

    if desired_mode == "off":
        if current_pid:
            stop_daemon()
    elif not current_pid:
        spawn_daemon(desired_mode, desired_port)
    elif current_mode != desired_mode or current_port != desired_port:
        print(f"[manager] Reshaping daemon {current_mode}@{current_port} -> {desired_mode}@{desired_port}")
        stop_daemon()
        spawn_daemon(desired_mode, desired_port)


def reap_rogues(tracked_pid):
    cmd = [
        "powershell", "-NoProfile", "-Command",
        "Get-CimInstance -Query 'SELECT ProcessId, CommandLine FROM Win32_Process WHERE CommandLine LIKE ''%daemon.py%''' | Select-Object ProcessId, CommandLine | ConvertTo-Json"
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        out = res.stdout.strip()
        if not out:
            return
        data = json.loads(out)
        if isinstance(data, dict):
            data = [data]

        my_pid = os.getpid()
        for proc in data:
            pid = proc.get("ProcessId")
            cmdline = proc.get("CommandLine") or ""
            if pid and cmdline and "daemon.py" in cmdline:
                if pid != tracked_pid and pid != my_pid:
                    print(f"[manager] Reaping rogue daemon: PID {pid} ({cmdline[:60]})")
                    subprocess.run(["taskkill", "/PID", str(pid), "/F"], capture_output=True)
    except Exception:
        pass


def run_reap_rogues():
    tracked_pid = None
    if PIDFILE.exists():
        try:
            data = json.loads(PIDFILE.read_text(encoding="utf-8"))
            tracked_pid = data.get("pid")
        except Exception:
            pass
    reap_rogues(tracked_pid)


def check_command_sentinel():
    cmdfile = WORKSPACE / ".stash" / "pids" / "daemon.cmd"
    if cmdfile.exists():
        try:
            data = json.loads(cmdfile.read_text(encoding="utf-8"))
            cmdfile.unlink()
            if data.get("cmd") == "restart_daemon":
                print("[manager] Restart sentinel detected. Restarting daemon.")
                stop_daemon()
                reconcile()
        except Exception as e:
            print(f"[manager] Error handling command sentinel: {e}")


def acquire_mgr_lock():
    pid = get_manager_pid()
    if pid and is_alive(pid):
        print("manager already running")
        sys.exit(0)
    MGRLOCK.parent.mkdir(parents=True, exist_ok=True)
    MGRLOCK.write_text(str(os.getpid()), encoding="utf-8")


def main():
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if arg == "--status":
            mgr_pid = get_manager_pid()
            mgr_live = is_alive(mgr_pid) if mgr_pid else False
            daemon_pid = None
            daemon_alive = False
            mode = None
            port = None
            if PIDFILE.exists():
                try:
                    data = json.loads(PIDFILE.read_text(encoding="utf-8"))
                    pid = data.get("pid")
                    if is_alive(pid):
                        daemon_pid = pid
                        daemon_alive = True
                        mode = data.get("mode")
                        port = data.get("port")
                except Exception:
                    pass
            status_data = {
                "manager_live": mgr_live,
                "daemon_pid": daemon_pid,
                "daemon_alive": daemon_alive,
                "port": port,
                "mode": mode
            }
            print(json.dumps(status_data))
            sys.exit(0)

        elif arg == "--stop":
            stop_daemon()
            if MGRLOCK.exists():
                try:
                    MGRLOCK.unlink()
                except OSError:
                    pass
            print("[manager] Stopped manager and daemon.")
            sys.exit(0)

        elif arg == "--restart":
            stop_daemon()
            reconcile()
            print("[manager] Daemon restarted.")
            sys.exit(0)

        else:
            print(f"Unknown argument: {arg}")
            sys.exit(1)

    acquire_mgr_lock()
    print("[manager] Watcher started.")
    try:
        while True:
            check_command_sentinel()
            reconcile()
            run_reap_rogues()
            time.sleep(5)
    except KeyboardInterrupt:
        pass
    finally:
        if MGRLOCK.exists():
            try:
                # Remove lock if we are the owner
                content = MGRLOCK.read_text(encoding="utf-8").strip()
                if content == str(os.getpid()):
                    MGRLOCK.unlink()
            except OSError:
                pass


if __name__ == "__main__":
    main()
