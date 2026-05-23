from pathlib import Path

WORKSPACE = Path("c:/Users/BAB AL SAFA/Desktop/open-workspace")
ps1 = WORKSPACE / '_os' / 'venv' / 'meta_run.ps1'
sh = WORKSPACE / '_os' / 'venv' / 'meta_run.sh'

if ps1.exists():
    content = ps1.read_text(encoding='utf-8')
    content = content.replace('".venv\\Scripts\\python.exe"', '"Scripts\\python.exe"')
    content = content.replace('".venv\\.bootstrap_failed"', '".bootstrap_failed"')
    content = content.replace('".meta_runtime\\__pycache__"', '"_os\\__pycache__"')
    content = content.replace('".venv"', '""') # For Remove-Item logs
    ps1.write_text(content, encoding='utf-8')

if sh.exists():
    content = sh.read_text(encoding='utf-8')
    content = content.replace('.venv/bin/python', 'bin/python')
    content = content.replace('.venv/.bootstrap_failed', '.bootstrap_failed')
    content = content.replace('.meta_runtime/__pycache__', '_os/__pycache__')
    content = content.replace('.venv', '') # For rm logs
    sh.write_text(content, encoding='utf-8')

print("Fixed meta_run scripts.")
