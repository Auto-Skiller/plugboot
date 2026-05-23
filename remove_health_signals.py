import re
from pathlib import Path
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE = Path("c:/Users/BAB AL SAFA/Desktop/open-workspace")
db_files = [
    WORKSPACE / '.db' / 'pipeline_scaler.yaml',
    WORKSPACE / '.db' / 'pipeline_hustler.yaml',
    WORKSPACE / '.db' / 'projects.yaml'
]

schema_files = [
    WORKSPACE / '.db' / '.db_shemas_db' / 'pipelines_shemas.yaml',
    WORKSPACE / '.db' / '.db_shemas_db' / 'projects_shemas.yaml'
]

def remove_from_dict(d):
    if isinstance(d, dict):
        if 'health_signals' in d:
            del d['health_signals']
        for v in d.values():
            remove_from_dict(v)
    elif isinstance(d, list):
        for item in d:
            remove_from_dict(item)

for f in db_files:
    if f.exists():
        with open(f, 'r', encoding='utf-8') as file:
            data = yaml.load(file)
        remove_from_dict(data)
        with open(f, 'w', encoding='utf-8') as file:
            yaml.dump(data, file)
        print(f"Cleaned {f.name}")

for f in schema_files:
    if f.exists():
        text = f.read_text(encoding='utf-8')
        # match health_signals: and its comment on the same line
        text = re.sub(r'^\s*health_signals:.*?$\n?', '', text, flags=re.MULTILINE)
        f.write_text(text, encoding='utf-8')
        print(f"Cleaned {f.name}")
