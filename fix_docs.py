import re
from pathlib import Path

WORKSPACE = Path("c:/Users/BAB AL SAFA/Desktop/open-workspace")
docs = list(WORKSPACE.glob("**/*.md"))

for doc in docs:
    if '.runtime/venv' in doc.read_text(encoding='utf-8') or '.runtime\\venv' in doc.read_text(encoding='utf-8'):
        content = doc.read_text(encoding='utf-8')
        content = content.replace('.runtime/venv', '_os/venv')
        content = content.replace('.runtime\\venv', '_os\\venv')
        doc.write_text(content, encoding='utf-8')
        print(f"Updated {doc.name}")

