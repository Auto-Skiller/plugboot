import os
import yaml
import shutil
from pathlib import Path
from datetime import datetime

DISCOVERIES_DIR = Path("pipelines/scaler/EXTERNAL/discoveries/auto/skills")
FILES_DIR = Path("pipelines/scaler/EXTERNAL/discoveries/auto/files")
TOOLBOX_DIR = Path(".brain/.toolbox_library/extended.toolbox")
EXTERNAL_LEDGER_PATH = Path("pipelines/scaler/.scaler.meta/scaler.tracker/EXTERNAL-LEDGER.yaml")
SCALER_STATE_PATH = Path("pipelines/scaler/.scaler.meta/scaler.tracker/SCALER-STATE.yaml")
PROPOSALS_DIR = Path("pipelines/scaler/EXTERNAL/proposals/auto/stray_files")

def update_yaml_safe(path, update_func):
    if not path.exists():
        data = {}
    else:
        with open(path, 'r') as f:
            data = yaml.safe_load(f) or {}

    data = update_func(data)

    with open(path, 'w') as f:
        yaml.safe_dump(data, f, sort_keys=False, indent=2)

def process_skills():
    processed_files = []

    domain_map = {
        "business-skills": "business.toolbox",
        "engineering-skills": "engineering.toolbox"
    }

    for skill_file in DISCOVERIES_DIR.rglob("SKILL.md"):
        # e.g., auto/skills/business-skills/branding/00-brand/SKILL.md
        parts = skill_file.relative_to(DISCOVERIES_DIR).parts
        if len(parts) < 3:
            continue

        domain_raw = parts[0]
        category_raw = parts[1]

        # The skill name might be parts[2] or nested further. The folder containing SKILL.md is the skill
        skill_dir_src = skill_file.parent
        skill_name = skill_dir_src.name

        domain = domain_map.get(domain_raw)
        if not domain:
            continue

        category = category_raw.replace("-", "_")

        dest_category_dir = TOOLBOX_DIR / domain / category
        dest_skills_dir = dest_category_dir / "skills" / skill_name

        # Ensure category dir exists
        os.makedirs(dest_skills_dir, exist_ok=True)

        # Move all contents of skill_dir_src to dest_skills_dir
        for item in skill_dir_src.iterdir():
            shutil.move(str(item), str(dest_skills_dir / item.name))

        # Update category YAML
        category_yaml_path = dest_category_dir / f"{category}.yaml"

        def update_category_yaml(data):
            if "name" not in data:
                data["name"] = category.replace("_", " ").title()
                data["description"] = f"Toolbox for {category.replace('_', ' ')}."
                data["when_to_use"] = f"Use when the task involves {category.replace('_', ' ')}."

            if "skills" not in data:
                data["skills"] = []

            skill_entry = {
                "name": skill_name,
                "skill_file": {
                    "path": str(dest_skills_dir / "SKILL.md"),
                    "description": f"Skill for {skill_name}",
                    "when_to_use": f"Use to execute {skill_name} capabilities"
                },
                "extra_folders": []
            }

            # Find extra folders
            for item in dest_skills_dir.iterdir():
                if item.is_dir():
                    extra_folder_entry = {
                        "name": item.name,
                        "description": f"Extra folder {item.name}",
                        "when_to_use": "Always",
                        "extra_files": []
                    }
                    for sub_item in item.iterdir():
                        if sub_item.is_file():
                             extra_folder_entry["extra_files"].append({
                                 "name": sub_item.name,
                                 "path": str(sub_item),
                                 "description": f"Extra file {sub_item.name}",
                                 "when_to_use": "Always"
                             })
                    skill_entry["extra_folders"].append(extra_folder_entry)

            # Check if skill already exists
            existing_skill_idx = -1
            for i, s in enumerate(data.get("skills", [])):
                if s.get("name") == skill_name:
                    existing_skill_idx = i
                    break

            if existing_skill_idx >= 0:
                 data["skills"][existing_skill_idx] = skill_entry
            else:
                 data["skills"].append(skill_entry)

            return data

        update_yaml_safe(category_yaml_path, update_category_yaml)

        processed_files.append({
            "id": f"FILE-DISCOVERY-{len(processed_files)+1}",
            "path": str(skill_file),
            "status": "PROPOSED",
            "processed_matrix": [{"aspect": category, "level": "capabilitys"}]
        })

        # Clean up empty source directory
        try:
            os.rmdir(skill_dir_src)
        except OSError:
            pass # Not empty or other error

    return processed_files

def process_stray_files():
    processed_files = []
    os.makedirs(PROPOSALS_DIR, exist_ok=True)

    if not FILES_DIR.exists():
         return []

    for file_path in FILES_DIR.iterdir():
        if file_path.is_file() and file_path.name != ".gitkeep":
            dest_path = PROPOSALS_DIR / file_path.name
            shutil.move(str(file_path), str(dest_path))

            processed_files.append({
                "id": f"FILE-DISCOVERY-STRAY-{len(processed_files)+1}",
                "path": str(file_path),
                "status": "PROPOSED",
                "processed_matrix": [{"aspect": "pipeline_scaler", "level": "bussiness"}]
            })
    return processed_files


def main():
    print("Starting assimilation...")
    skills_processed = process_skills()
    files_processed = process_stray_files()

    all_processed = skills_processed + files_processed

    def update_ledger(data):
        if "tracked_files" not in data:
            data["tracked_files"] = []
        data["tracked_files"].extend(all_processed)
        return data

    update_yaml_safe(EXTERNAL_LEDGER_PATH, update_ledger)

    def update_state(data):
        data["current_phase"] = "PHASE-5-INTEGRATION 🟢"
        if "metrics" not in data:
            data["metrics"] = {}
        data["metrics"]["discoveries_processed"] = data["metrics"].get("discoveries_processed", 0) + len(all_processed)
        data["last_sync"] = datetime.now().isoformat()
        return data

    update_yaml_safe(SCALER_STATE_PATH, update_state)

    print(f"Assimilation complete. Processed {len(all_processed)} files.")

if __name__ == "__main__":
    main()
