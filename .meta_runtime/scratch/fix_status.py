import os
import glob

base_dir = r"c:\Users\BAB AL SAFA\Desktop\open-workspace\.meta_os\meta_db\toolboxes_db"
for filepath in glob.glob(os.path.join(base_dir, "**", "*.yaml"), recursive=True):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    if "status: true" in content or "status: false" in content:
        content = content.replace("status: true", "status: active").replace("status: false", "status: archived")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed {filepath}")
