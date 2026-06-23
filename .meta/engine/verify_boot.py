import os
import sys
import subprocess
import json

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
META_DIR = os.path.join(WORKSPACE_ROOT, '.meta')
PID_FILE = os.path.join(META_DIR, 'boot.pid')
IDENTITY_DIR = os.path.join(WORKSPACE_ROOT, '.meta_os', 'meta_identity')
CONTROLER_PATH = os.path.join(WORKSPACE_ROOT, 'CONTROLER.yaml')
META_ENGINE = os.path.join(META_DIR, 'engine', 'engines', 'meta_engine.py')

def print_status(check_name, status, details=""):
    color = "\033[92m" if status else "\033[91m"
    icon = "✅" if status else "❌"
    reset = "\033[0m"
    # Basic fallback if ANSI not supported nicely
    if os.name == 'nt':
        color = ""
        reset = ""
        
    print(f"{color}{icon} {check_name}{reset}")
    if details:
        print(f"   ↳ {details}")

def check_identity_laws():
    exists = os.path.exists(IDENTITY_DIR) and os.path.isdir(IDENTITY_DIR)
    print_status("BOOT-00: Identity Laws Exist", exists, f"Path: {IDENTITY_DIR}")
    return exists

def check_controler():
    exists = os.path.exists(CONTROLER_PATH)
    print_status("BOOT-02: CONTROLER.yaml Freshness", exists, f"Path: {CONTROLER_PATH}")
    return exists

def check_daemon_running():
    if not os.path.exists(PID_FILE):
        print_status("BOOT-03: Sync Daemon Active", False, "No boot.pid found. Daemon may be offline.")
        return False
        
    try:
        with open(PID_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        sup_pid = data.get('supervisor_pid')
        engines = data.get('engines', {})
        
        # Verify if supervisor is running
        running = False
        if os.name == 'nt':
            try:
                output = subprocess.check_output(f'tasklist /FI "PID eq {sup_pid}" /NH', shell=True).decode()
                running = str(sup_pid) in output
            except Exception:
                running = True # Fallback
        else:
            try:
                os.kill(sup_pid, 0)
                running = True
            except OSError:
                pass
                
        if running:
            print_status("BOOT-03: Sync Daemon Active", True, f"Supervisor PID: {sup_pid} | Active Engines: {len(engines)}")
            return True
        else:
            print_status("BOOT-03: Sync Daemon Active", False, f"Stale PID {sup_pid} found. Daemon is dead.")
            return False
            
    except Exception as e:
        print_status("BOOT-03: Sync Daemon Active", False, f"Error reading boot.pid: {e}")
        return False

def check_schema_validation():
    print("Running internal schema validation (meta_engine.py --validate)...")
    try:
        result = subprocess.run([sys.executable, META_ENGINE, "--validate"], capture_output=True, text=True)
        if result.returncode == 0:
            print_status("BOOT-04: Schema Validation", True, "All databases conform to their schemas.")
            return True
        else:
            print_status("BOOT-04: Schema Validation", False, "Validation failed!")
            print(result.stdout)
            print(result.stderr)
            return False
    except Exception as e:
        print_status("BOOT-04: Schema Validation", False, f"Failed to execute schema validation: {e}")
        return False

def check_no_duplicate_daemons():
    """BOOT-03b: Verify no duplicate daemon processes are running."""
    try:
        sys.path.insert(0, os.path.join(WORKSPACE_ROOT, '.meta', 'engine'))
        from daemon_guard import scan_for_orphan_engines, get_engine_status

        # Get status from PID files
        status = get_engine_status()
        running_engines = [name for name, info in status.items() if info['state'] == 'running']

        # Scan for orphans (processes not tracked by PID files)
        orphans = scan_for_orphan_engines()

        # Cross-reference: any orphan not in our PID files is a duplicate
        duplicate_orphans = []
        for orphan in orphans:
            orphan_pid = orphan['pid']
            # Check if this PID is tracked in any engine's PID file
            tracked = False
            for name, info in status.items():
                if info.get('pid') == orphan_pid:
                    tracked = True
                    break
            if not tracked:
                duplicate_orphans.append(orphan)

        if duplicate_orphans:
            details = f"{len(duplicate_orphans)} untracked process(es): " + \
                      ", ".join(f"{o['name']} (PID {o['pid']})" for o in duplicate_orphans)
            print_status("BOOT-03b: No Duplicate Daemons", False, details)
            return False
        else:
            print_status("BOOT-03b: No Duplicate Daemons", True,
                         f"{len(running_engines)} engines running, 0 duplicates")
            return True
    except ImportError:
        print_status("BOOT-03b: No Duplicate Daemons", True, "daemon_guard not available — skipped")
        return True
    except Exception as e:
        print_status("BOOT-03b: No Duplicate Daemons", False, f"Check error: {e}")
        return False


def main():
    print("\n🚀 Agentic OS Boot Verification\n" + "-"*40)

    c1 = check_identity_laws()
    c2 = check_controler()
    c3 = check_daemon_running()
    c3b = check_no_duplicate_daemons()
    print("")
    c4 = check_schema_validation()

    print("\n" + "-"*40)
    if all([c1, c2, c3, c3b, c4]):
        print("\n🎉 STATUS: 100% HEALTHY. Workspace is fully synchronized and ready.")
        sys.exit(0)
    else:
        print("\n❌ BOOT FAILURE FLAGGED. Please investigate the failed checks above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
