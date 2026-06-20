import os
import re

files_to_fix = [
    r"c:\Users\BAB AL SAFA\Desktop\open-workspace\CONTROLER.yaml",
    r"c:\Users\BAB AL SAFA\Desktop\open-workspace\.meta_os\meta_db\meta_os.yaml",
    r"c:\Users\BAB AL SAFA\Desktop\open-workspace\.meta_os\meta_db\.toolboxes.yaml",
    r"c:\Users\BAB AL SAFA\Desktop\open-workspace\.meta_os\meta_db\pipeline_scaler_os.yaml",
    r"c:\Users\BAB AL SAFA\Desktop\open-workspace\.meta_os\meta_db\projects_os.yaml"
]

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        continue
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Fix evolution_status
    content = re.sub(r"evolution_status:\s*true", "evolution_status: active", content)
    content = re.sub(r"evolution_status:\s*false", "evolution_status: paused", content)
    
    # Fix pipeline_status
    content = re.sub(r"pipeline_status:\s*true", "pipeline_status: active", content)
    content = re.sub(r"pipeline_status:\s*false", "pipeline_status: paused", content)
    
    # Fix project_status
    content = re.sub(r"project_status:\s*true", "project_status: active", content)
    content = re.sub(r"project_status:\s*false", "project_status: paused", content)
    
    # Fix generic status: true in toolboxes.yaml and CONTROLER.yaml
    content = re.sub(r"status:\s*true", "status: active", content)
    content = re.sub(r"status:\s*false", "status: archived", content)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Fixed {filepath}")
