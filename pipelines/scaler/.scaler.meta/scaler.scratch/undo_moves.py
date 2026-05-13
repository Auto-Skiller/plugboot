import os
import shutil
from pathlib import Path

base_path = Path(r"c:\Users\BAB AL SAFA\Desktop\open-workspace\pipelines\scaler\EXTERNAL\discoveries")
mixed_main = base_path / ".mixed"
caps_path = base_path / "capabilitys"
biz_path = base_path / "bussiness"

def move_all_to_mixed(src_dir):
    for item in src_dir.iterdir():
        if item.name.startswith("."):
            continue
        if item.name.endswith(".ledger.yaml"):
            continue
        
        dest = mixed_main / item.name
        # if exists, we might need to merge or rename, but since they were empty before, simple move is fine
        if dest.exists():
            dest = mixed_main / f"{item.name}_merged"
            
        shutil.move(str(item), str(dest))
        print(f"Moved {item.name} from {src_dir.name} to .mixed")

move_all_to_mixed(caps_path)
move_all_to_mixed(biz_path)
print("Rollback and move to .mixed complete.")
