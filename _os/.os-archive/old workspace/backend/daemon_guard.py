"""
daemon_guard.py — Singleton daemon lifecycle management for Agentic OS.

Provides:
  - PID file management (write, read, check alive, remove)
  - Port binding check (prevent duplicate servers on same port)
  - Orphan process detection (find engine processes not tracked by supervisor)
  - Cross-platform Windows/Linux/macOS support

Import this module in each engine and server.py to prevent:
  - Duplicate daemons running concurrently
  - Multiple servers binding the same port
  - Orphaned processes surviving supervisor shutdown
"""

import os
import sys
import json
import time
import socket
import signal
import platform
import subprocess
from pathlib import Path
from datetime import datetime

# ──────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────

ENGINE_SCRIPT_MAP = {
    'engine': '.infra/backend/engine.py',
}

ENGINE_PID_FILES = {
    'engine': '.stash/pids/engine.pid',
    'boot': '.stash/pids/boot.pid',
}

DASHBOARD_PORT = 8000
SUPERVISOR_LOCK_PORT = 49999

# ──────────────────────────────────────────────
# PID File Management
# ──────────────────────────────────────────────

def get_pid_file(engine_name: str) -> Path:
    """Resolve the absolute path for an engine's PID file."""
    workspace = Path(__file__).parent.parent.parent.resolve()
    relative = ENGINE_PID_FILES.get(engine_name, f'.infra/pids/{engine_name}.pid')
    return workspace / relative


def write_pid_file(engine_name: str) -> Path:
    """Write the current process PID to the engine's PID file.

    Returns the path written.
    """
    pid_file = get_pid_file(engine_name)
    pid_file.parent.mkdir(parents=True, exist_ok=True)
    pid_data = {
        'pid': os.getpid(),
        'started_at': datetime.now().isoformat(),
        'engine': engine_name,
        'cmdline': ' '.join(sys.argv),
    }
    with open(pid_file, 'w', encoding='utf-8') as f:
        json.dump(pid_data, f, indent=2)
    return pid_file


def read_pid_file(engine_name: str) -> dict | None:
    """Read an engine's PID file. Returns None if not found or invalid."""
    pid_file = get_pid_file(engine_name)
    if not pid_file.exists():
        return None
    try:
        with open(pid_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def remove_pid_file(engine_name: str) -> None:
    """Remove an engine's PID file (on clean shutdown)."""
    pid_file = get_pid_file(engine_name)
    try:
        pid_file.unlink(missing_ok=True)
    except OSError:
        pass


def is_pid_alive(pid: int) -> bool:
    """Check if a process with the given PID is currently running.

    Works on Windows, Linux, and macOS.
    """
    if pid is None or pid <= 0:
        return False

    system = platform.system().lower()

    if system == 'windows':
        try:
            result = subprocess.run(
                ['tasklist', '/FI', f'PID eq {pid}', '/NH'],
                capture_output=True, text=True, timeout=5
            )
            return str(pid) in result.stdout
        except Exception:
            return True  # Conservative: assume alive if we can't check
    else:
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False


def check_duplicate_engine(engine_name: str) -> dict | None:
    """Check if an engine is already running.

    Returns the PID file data if a live instance exists, None otherwise.

    Also cleans up stale PID files (where the tracked PID is dead).
    """
    pid_data = read_pid_file(engine_name)
    if pid_data is None:
        return None

    pid = pid_data.get('pid')
    if pid and is_pid_alive(pid):
        return pid_data  # Live instance found

    # Stale PID file — the tracked process is dead. Clean up.
    remove_pid_file(engine_name)
    return None


# ──────────────────────────────────────────────
# Port Binding Guard
# ──────────────────────────────────────────────

def is_port_in_use(port: int) -> bool:
    """Check if a TCP port is currently bound on localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('127.0.0.1', port))
            return False
        except OSError:
            return True


def check_port_or_exit(port: int, service_name: str = "service") -> None:
    """If the port is already in use, print a clear error and exit.

    This is the last-line defense against duplicate servers.
    """
    if is_port_in_use(port):
        print(f"[!] ERROR: Port {port} is already in use.")
        print(f"     Cannot start {service_name} — another instance is bound to 127.0.0.1:{port}.")
        print(f"     Fix: stop the existing instance first, or run stop_all.ps1")
        sys.exit(1)


# ──────────────────────────────────────────────
# Orphan Process Detection
# ──────────────────────────────────────────────

def scan_for_orphan_engines() -> list[dict]:
    """Scan the system for engine processes not tracked by the supervisor.

    Returns a list of dicts: [{pid, name, cmdline, script}]
    """
    orphans = []
    system = platform.system().lower()

    if system != 'windows':
        # Unix-like: use /proc or ps
        try:
            result = subprocess.run(
                ['ps', 'aux'], capture_output=True, text=True, timeout=5
            )
            for line in result.stdout.splitlines():
                if '--daemon' not in line:
                    continue
                if 'python' not in line.lower():
                    continue
                if 'grep' in line or 'ps aux' in line:
                    continue
                parts = line.split(None, 10)
                if len(parts) < 11:
                    continue
                pid = int(parts[1])
                cmdline = parts[10]
                for script_name in ENGINE_SCRIPT_MAP:
                    if script_name in cmdline:
                        orphans.append({
                            'pid': pid,
                            'name': script_name,
                            'cmdline': cmdline[:200],
                        })
                        break
        except Exception:
            pass

    else:
        # Windows: use tasklist + wmic for command lines (fast, no WMI hangs)
        try:
            # First get all python PIDs with --daemon via tasklist
            result = subprocess.run(
                ['tasklist', '/FO', 'CSV', '/NH', '/FI', 'IMAGENAME eq python.exe'],
                capture_output=True, text=True, timeout=5
            )
            import csv as _csv, io as _io
            reader = _csv.reader(_io.StringIO(result.stdout))
            python_pids = []
            for row in reader:
                if len(row) >= 2:
                    try:
                        python_pids.append(int(row[1].strip('"')))
                    except ValueError:
                        pass

            # For each python PID, check if it's an engine by looking at /proc or wmic
            # But this is expensive — instead, just check PID files
            # The start_all.ps1 already does the heavy orphan cleanup
            # This function is a safety net for the verify_boot check
            for pid in python_pids:
                if is_pid_alive(pid):
                    # Check if this PID is tracked in any engine PID file
                    tracked = False
                    for eng_name in ENGINE_PID_FILES:
                        pd = read_pid_file(eng_name)
                        if pd and pd.get('pid') == pid:
                            tracked = True
                            break
                    if not tracked:
                        # Untracked python process — potential orphan
                        orphans.append({
                            'pid': pid,
                            'name': 'unknown',
                            'cmdline': f'PID {pid} (untracked)',
                        })
        except Exception:
            pass

    return orphans


def kill_orphans(orphans: list[dict], exclude_pids: set[int] | None = None) -> list[dict]:
    """Kill orphaned engine processes.

    Args:
        orphans: list from scan_for_orphan_engines()
        exclude_pids: PIDs to skip (e.g. current supervisor's children)

    Returns:
        List of orphans that were killed.
    """
    killed = []
    exclude = exclude_pids or set()

    for orphan in orphans:
        pid = orphan['pid']
        if pid in exclude:
            continue
        if pid == os.getpid():
            continue  # Don't kill ourselves

        name = orphan.get('name', 'unknown')
        try:
            if platform.system().lower() == 'windows':
                subprocess.run(
                    ['taskkill', '/F', '/PID', str(pid)],
                    capture_output=True, timeout=5
                )
            else:
                os.kill(pid, signal.SIGTERM)
            killed.append(orphan)
            print(f"  ↳ Killed orphan {name} (PID {pid})")
        except Exception as e:
            print(f"  ✗ Failed to kill {name} (PID {pid}): {e}")

    return killed


# ──────────────────────────────────────────────
# Supervisor Lock
# ──────────────────────────────────────────────

def acquire_supervisor_lock() -> socket.socket | None:
    """Try to acquire the supervisor singleton lock on port 49999.

    Returns the bound socket if successful, None if lock is held by another process.
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(('127.0.0.1', SUPERVISOR_LOCK_PORT))
        s.listen(1)
        return s
    except OSError:
        s.close()
        return None


def is_supervisor_alive() -> bool:
    """Check if a supervisor currently holds the lock port."""
    return is_port_in_use(SUPERVISOR_LOCK_PORT)


# ──────────────────────────────────────────────
# Self-Guard Decorator (for use in engines)
# ──────────────────────────────────────────────

def engine_self_guard(engine_name: str):
    """Decorator/wrapper for engine main() that prevents duplicate execution.

    Usage in each engine:
        from daemon_guard import engine_self_guard

        if __name__ == '__main__':
            engine_self_guard('meta_engine')(main)()
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # 1. Check for duplicate
            existing = check_duplicate_engine(engine_name)
            if existing:
                print(f"[!] {engine_name} is already running (PID {existing['pid']}, started {existing.get('started_at', '?')}).")
                print(f"     To force restart, run stop_all.ps1 first.")
                sys.exit(1)

            # 2. Write PID file
            pid_file = write_pid_file(engine_name)
            print(f"[{engine_name}] PID file: {pid_file}")

            # 3. Run the engine
            try:
                return func(*args, **kwargs)
            finally:
                # 4. Clean up PID file on exit
                remove_pid_file(engine_name)
                print(f"[{engine_name}] PID file removed. Clean shutdown.")
        return wrapper
    return decorator


# ──────────────────────────────────────────────
# Health Check Utilities
# ──────────────────────────────────────────────

def get_engine_status() -> dict:
    """Get the status of all engines: running, stopped, stale_pid."""
    status = {}
    for engine_name in ENGINE_PID_FILES:
        pid_data = read_pid_file(engine_name)
        if pid_data is None:
            status[engine_name] = {'state': 'stopped', 'pid': None}
        elif is_pid_alive(pid_data['pid']):
            status[engine_name] = {'state': 'running', **pid_data}
        else:
            status[engine_name] = {'state': 'stale_pid', **pid_data}
    return status


def print_engine_status() -> None:
    """Print a formatted status table of all engines."""
    status = get_engine_status()
    print("\n╔══════════════════════════════════════════════════╗")
    print("║         Agentic OS — Engine Status              ║")
    print("╠══════════════════════════════════════════════════╣")

    for name, info in status.items():
        state = info['state']
        pid = info.get('pid', '')
        if state == 'running':
            state_str = f"🟢 RUNNING (PID {pid})"
        elif state == 'stale_pid':
            state_str = f"🟠 STALE PID {pid}"
        else:
            state_str = "🔴 STOPPED"

        padding = 48 - len(name) - len(state_str)
        padding = max(1, padding)
        print(f"║ {name} {'·' * padding} {state_str} ║")

    print("╚══════════════════════════════════════════════════╝\n")
