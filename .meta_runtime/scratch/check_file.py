import os

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FILE_PATH = os.path.join(WORKSPACE_ROOT, 'pipeline_hustler', '.hustler_os', 'hustler_identity', 'Hustler-Operational-Rules.md')

with open(FILE_PATH, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'meta_identity' in line or 'meta_os' in line or 'identity' in line:
        print(f"Line {idx+1}: {line.strip()}")
