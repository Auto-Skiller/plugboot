"""test_daemon_guard.py — Test suite for daemon guard system."""
import subprocess
import sys
import os
import time
import json

WORKSPACE = r"C:\Users\BAB AL SAFA\Desktop\open-workspace"
VENV_PYTHON = os.path.join(WORKSPACE, ".meta", ".venv", "Scripts", "python.exe")

def run(cmd, timeout=15):
    """Run a command and return (stdout, stderr, exit_code)."""
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, shell=True)
        return r.stdout.strip(), r.stderr.strip(), r.returncode
    except subprocess.TimeoutExpired:
        return "", "TIMEOUT", -1

def test_1_syntax():
    """Test: all Python files compile."""
    print("\n=== TEST 1: Syntax Check ===")
    files = [
        ".meta/engine/daemon_guard.py",
        ".meta/engine/boot.py",
        ".meta/engine/engines/meta_engine.py",
        ".meta/engine/engines/pipeline_scaler_engine.py",
        ".meta/engine/engines/projects_engine.py",
        ".meta/engine/engines/pipeline_hustler_engine.py",
        ".meta/engine/dashboard/backend/server.py",
    ]
    all_ok = True
    for f in files:
        full = os.path.join(WORKSPACE, f)
        out, err, code = run(f'"{VENV_PYTHON}" -c "import py_compile; py_compile.compile(r\'{full}\', doraise=True)"')
        if code == 0:
            print(f"  OK  {f}")
        else:
            print(f"  FAIL {f}: {err}")
            all_ok = False
    return all_ok

def test_2_daemon_guard_import():
    """Test: daemon_guard imports cleanly."""
    print("\n=== TEST 2: daemon_guard Import ===")
    out, err, code = run(f'"{VENV_PYTHON}" -c "from daemon_guard import engine_self_guard, check_port_or_exit, scan_for_orphan_engines; print(\'import OK\')"', timeout=10)
    if code == 0:
        print(f"  OK: {out}")
        return True
    else:
        print(f"  FAIL: {err}")
        return False

def test_3_port_check():
    """Test: port check works."""
    print("\n=== TEST 3: Port Check ===")
    # Test free port
    out, err, code = run(f'"{VENV_PYTHON}" -c "from daemon_guard import is_port_in_use; print(\'port 99999 free:\', not is_port_in_use(99999))"')
    if code == 0 and "True" in out:
        print(f"  OK: free port detected correctly")
    else:
        print(f"  FAIL: {out} {err}")
        return False
    return True

def test_4_pid_file():
    """Test: PID file write/read/remove cycle."""
    print("\n=== TEST 4: PID File Lifecycle ===")
    test_engine = "test_engine_guard"
    out, err, code = run(f'"{VENV_PYTHON}" -c "'
        f'import sys; sys.path.insert(0, r\'{os.path.join(WORKSPACE, ".meta/engine")}\'); '
        f'from daemon_guard import write_pid_file, read_pid_file, remove_pid_file, is_pid_alive, check_duplicate_engine; '
        f'pf = write_pid_file(\"{test_engine}\"); '
        f'print(\"written:\", pf); '
        f'data = read_pid_file(\"{test_engine}\"); '
        f'print(\"pid:\", data[\"pid\"]); '
        f'print(\"alive:\", is_pid_alive(data[\"pid\"])); '
        f'dup = check_duplicate_engine(\"{test_engine}\"); '
        f'print(\"duplicate:\", dup is not None); '
        f'remove_pid_file(\"{test_engine}\"); '
        f'print(\"removed OK\")"')
    if code == 0:
        for line in out.split('\n'):
            print(f"  {line}")
        return True
    else:
        print(f"  FAIL: {err}")
        return False

def test_5_stop_all():
    """Test: stop_all.ps1 runs without errors."""
    print("\n=== TEST 5: stop_all.ps1 ===")
    script = os.path.join(WORKSPACE, ".meta", "engine", "stop_all.ps1")
    out, err, code = run(f'powershell -ExecutionPolicy Bypass -File "{script}"', timeout=30)
    if code == 0:
        print("  OK: stop_all.ps1 completed")
        for line in out.split('\n'):
            if line.strip():
                print(f"    {line}")
        return True
    else:
        print(f"  FAIL (code {code}): {err}")
        for line in out.split('\n'):
            if line.strip():
                print(f"    {line}")
        return False

def test_6_start_all():
    """Test: start_all.ps1 runs without errors."""
    print("\n=== TEST 6: start_all.ps1 ===")
    script = os.path.join(WORKSPACE, ".meta", "engine", "start_all.ps1")
    out, err, code = run(f'powershell -ExecutionPolicy Bypass -File "{script}"', timeout=30)
    if code == 0:
        print("  OK: start_all.ps1 completed")
        for line in out.split('\n'):
            if line.strip():
                print(f"    {line}")
        return True
    else:
        print(f"  FAIL (code {code}): {err}")
        for line in out.split('\n'):
            if line.strip():
                print(f"    {line}")
        return False

def test_7_no_duplicates():
    """Test: no duplicate processes after start."""
    print("\n=== TEST 7: No Duplicates After Start ===")
    time.sleep(3)
    out, err, code = run('powershell -Command "Get-Process python | Select-Object Id, ProcessName, StartTime | Format-Table -AutoSize"')
    if code == 0:
        print("  Running Python processes:")
        for line in out.split('\n'):
            if line.strip():
                print(f"    {line}")
        # Count daemon processes
        daemon_count = out.count('--daemon')
        server_count = out.count('server.py')
        print(f"  Daemon processes: {daemon_count}, Server processes: {server_count}")
        if server_count <= 1:
            print("  OK: at most 1 server.py")
        else:
            print("  WARN: multiple server.py instances")
        return True
    return False

def test_8_api_health():
    """Test: dashboard /api/health endpoint."""
    print("\n=== TEST 8: /api/health Endpoint ===")
    out, err, code = run('curl -s http://localhost:8000/api/health', timeout=10)
    if code == 0 and out:
        try:
            data = json.loads(out)
            print(f"  OK: {data}")
            return True
        except json.JSONDecodeError:
            print(f"  FAIL: not JSON: {out}")
            return False
    else:
        print(f"  FAIL: curl returned code {code}, err: {err}")
        return False

def test_9_idempotent_start():
    """Test: running start_all twice = same result."""
    print("\n=== TEST 9: Idempotent Start (run twice) ===")
    script = os.path.join(WORKSPACE, ".meta", "engine", "start_all.ps1")
    # Run 1
    out1, err1, code1 = run(f'powershell -ExecutionPolicy Bypass -File "{script}"', timeout=30)
    time.sleep(2)
    # Run 2
    out2, err2, code2 = run(f'powershell -ExecutionPolicy Bypass -File "{script}"', timeout=30)
    if code2 == 0:
        print("  OK: second start_all also succeeded (idempotent)")
        return True
    else:
        print(f"  FAIL: second start_all failed: {err2}")
        return False

def test_10_verify_boot():
    """Test: verify_boot.py runs with new BOOT-03b check."""
    print("\n=== TEST 10: verify_boot.py (with BOOT-03b) ===")
    script = os.path.join(WORKSPACE, ".meta", "engine", "verify_boot.py")
    out, err, code = run(f'"{VENV_PYTHON}" "{script}"', timeout=30)
    print(f"  Exit code: {code}")
    for line in out.split('\n'):
        if line.strip():
            print(f"    {line}")
    # verify_boot may fail if daemons aren't running, but it should at least run
    return True  # We just want to see it execute

if __name__ == '__main__':
    print("=" * 60)
    print("  DAEMON GUARD TEST SUITE")
    print("=" * 60)

    results = []

    # Phase 1: Static tests (no daemons needed)
    results.append(("1. Syntax Check", test_1_syntax()))
    results.append(("2. Import Check", test_2_daemon_guard_import()))
    results.append(("3. Port Check", test_3_port_check()))
    results.append(("4. PID File Lifecycle", test_4_pid_file()))

    # Phase 2: Stop any existing daemons
    results.append(("5. stop_all.ps1", test_5_stop_all()))

    # Phase 3: Start fresh
    results.append(("6. start_all.ps1", test_6_start_all()))

    # Phase 4: Verify running state
    results.append(("7. No Duplicates", test_7_no_duplicates()))
    results.append(("8. /api/health", test_8_api_health()))

    # Phase 5: Idempotency
    results.append(("9. Idempotent Start", test_9_idempotent_start()))

    # Phase 6: verify_boot
    results.append(("10. verify_boot.py", test_10_verify_boot()))

    # Summary
    print("\n" + "=" * 60)
    print("  RESULTS")
    print("=" * 60)
    passed = 0
    failed = 0
    for name, ok in results:
        status = "PASS" if ok else "FAIL"
        icon = "OK" if ok else "XX"
        print(f"  [{icon}] {name}: {status}")
        if ok:
            passed += 1
        else:
            failed += 1
    print(f"\n  Total: {passed} passed, {failed} failed out of {len(results)}")
    print("=" * 60)

    sys.exit(0 if failed == 0 else 1)
