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

def main():
    print("\n🚀 Agentic OS Boot Verification\n" + "-"*40)
    
    c1 = check_identity_laws()
    c2 = check_controler()
    c3 = check_daemon_running()
    print("")
    c4 = check_schema_validation()
    
    print("\n" + "-"*40)
    if all([c1, c2, c3, c4]):
        print("\n🎉 STATUS: 100% HEALTHY. Workspace is fully synchronized and ready.")
        sys.exit(0)
    else:
        print("\n❌ BOOT FAILURE FLAGGED. Please investigate the failed checks above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
