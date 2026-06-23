import subprocess
import sys

result = subprocess.run(
    [r'C:\Users\BAB AL SAFA\Desktop\open-workspace\.meta\.venv\Scripts\python.exe', '-c',
     'import sys; sys.stdout.write("hello\\n"); sys.stdout.flush()'],
    capture_output=True, text=True, timeout=10
)
with open(r'C:\Users\BAB AL SAFA\Desktop\open-workspace\test.log', 'w') as f:
    f.write(f"stdout: {result.stdout}\n")
    f.write(f"stderr: {result.stderr}\n")
    f.write(f"returncode: {result.returncode}\n")
