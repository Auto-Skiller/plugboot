import subprocess
import sys
import os

# Run boot.py and capture output
python_exe = r'C:\Users\BAB AL SAFA\Desktop\open-workspace\.meta\.venv\Scripts\python.exe'
boot_script = r'C:\Users\BAB AL SAFA\Desktop\open-workspace\.meta\engine\boot.py'
log_file = r'C:\Users\BAB AL SAFA\Desktop\open-workspace\tmp_boot.log'
err_file = r'C:\Users\BAB AL SAFA\Desktop\open-workspace\tmp_boot.err'

# Run with timeout
try:
    result = subprocess.run(
        [python_exe, boot_script],
        capture_output=True,
        text=True,
        timeout=10,
        cwd=r'C:\Users\BAB AL SAFA\Desktop\open-workspace'
    )
    with open(log_file, 'w') as f:
        f.write(f"STDOUT:\n{result.stdout}\n")
        f.write(f"RETURN CODE: {result.returncode}\n")
    with open(err_file, 'w') as f:
        f.write(f"STDERR:\n{result.stderr}\n")
except subprocess.TimeoutExpired:
    with open(log_file, 'w') as f:
        f.write("TIMEOUT: boot.py ran for 10s (expected - it's a daemon)\n")
except Exception as e:
    with open(log_file, 'w') as f:
        f.write(f"ERROR: {e}\n")

print("Done - check tmp_boot.log")
