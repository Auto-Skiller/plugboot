import os
from pathlib import Path

WORKSPACE = Path("c:/Users/BAB AL SAFA/Desktop/open-workspace")
targets = [WORKSPACE / "pipeline_scaler", WORKSPACE / "pipeline_hustler"]

replacements = {
    "_pipelines/_scaler": "pipeline_scaler",
    "_pipelines/hustler": "pipeline_hustler",
    ".meta_brain/meta_identity": ".identity",
    ".meta_brain/toolboxes": "_toolboxes",
    ".meta_brain/milestones": ".milestones",
    ".meta_runtime/venv": "_os/venv",
    ".meta_runtime": "_os",
    ".meta_brain/meta_sync.py": "_os/engine/meta_sync.py",
    ".meta_brain/.meta_routing/toolboxes.yaml": ".db/.toolboxes.yaml",
    ".meta_brain/.meta_routing/pipelines.yaml": ".db/pipeline_scaler.yaml", # rough mapping
    ".meta_brain/meta_router.yaml": "CONTROLER.yaml",
    ".meta_brain": ".db",
    ".scaler_brain/scaler_runbooks": ".scaler_identity",
    ".scaler_brain/scaler_ledgers": ".scaler_db",
    ".scaler_brain/.scaler_routing": ".scaler_db",
    ".scaler_brain": ".scaler_identity",
    ".hustler_brain/hustler_runbooks": ".hustler_identity",
    ".hustler_brain/hustler_ledgers": ".hustler_db",
    ".hustler_brain/.hustler_routing": ".hustler_db",
    ".hustler_brain": ".hustler_identity"
}

count = 0
for d in targets:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith((".md", ".yaml")):
                p = Path(root) / file
                try:
                    content = p.read_text(encoding='utf-8')
                    original = content
                    for old, new in replacements.items():
                        content = content.replace(old, new)
                        # Also handle Windows slash variants just in case
                        content = content.replace(old.replace('/', '\\'), new.replace('/', '\\'))
                    if content != original:
                        p.write_text(content, encoding='utf-8')
                        print(f"Updated {p.relative_to(WORKSPACE)}")
                        count += 1
                except Exception as e:
                    print(f"Error on {p}: {e}")

print(f"Total files updated: {count}")
