from pathlib import Path
from ruamel.yaml import YAML
import re

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE = Path("c:/Users/BAB AL SAFA/Desktop/open-workspace")
core_yaml = WORKSPACE / '.db' / '.core.yaml'
core_schemas = WORKSPACE / '.db' / '.db_shemas_db' / 'core_shemas.yaml'

# Clean .core.yaml
if core_yaml.exists():
    with open(core_yaml, 'r', encoding='utf-8') as f:
        data = yaml.load(f)
        
    meta = data.get('metadata', {})
    
    # 1. Add autosync_status under modes
    if 'modes' in meta:
        meta['modes']['autosync_status'] = 'manual 🟡'
        
    # 2. Remove system.state and system.queues
    if 'system' in meta:
        meta['system'].pop('state', None)
        meta['system'].pop('queues', None)
        
    # 3. Remove evolution.state
    if 'evolution' in meta:
        meta['evolution'].pop('state', None)
        
    # 4. Remove duplicate milestones outside metadata
    if 'milestones' in data:
        del data['milestones']
        
    # 5. Remove db: from indexes
    if 'indexes' in data and 'db' in data['indexes']:
        del data['indexes']['db']
        
    with open(core_yaml, 'w', encoding='utf-8') as f:
        yaml.dump(data, f)
        
# Clean core_shemas.yaml
if core_schemas.exists():
    text = core_schemas.read_text(encoding='utf-8')
    
    # Add autosync_status
    text = text.replace('evolution_status: string       # (in) — set by user', 
                        'evolution_status: string       # (in) — set by user\n      autosync_status: string        # OUT — daemon | manual')
    
    # We will do a simple file rewrite for schemas since they are plain strings
    
    # Remove system.queues and system.state blocks
    text = re.sub(r'^\s*queues:\s*# \(in-out\) — future system queues\n\s*state:\n(?:\s+.*?\n)*?(?=\s*evolution:)', '', text, flags=re.MULTILINE)
    
    # Remove evolution.state block
    text = re.sub(r'^\s*state:\n(?:\s+.*?\n)*?(?=\s*milestones:)', '', text, flags=re.MULTILINE)
    
    # Remove db from indexes
    text = re.sub(r'^\s*db:\s*# OUT — from \.db/.*?(?=\n\n|\Z)', '', text, flags=re.MULTILINE|re.DOTALL)
    
    core_schemas.write_text(text, encoding='utf-8')

print("Cleanup script executed.")
