import os
import yaml
from pathlib import Path

ROUTER_PATH = Path(".brain/meta.router/toolbox_library.router.yaml")
TOOLBOX_DIR = Path(".brain/.toolbox_library")

def main():
    if not ROUTER_PATH.exists():
        print("Router path not found")
        return

    with open(ROUTER_PATH, 'r') as f:
        router_data = yaml.safe_load(f)

    # Process extended toolboxes
    extended_toolboxes = router_data.get('extended_toolboxes', {})
    for domain_key, domain_data in extended_toolboxes.items():
        sub_toolboxes = domain_data.get('sub_toolboxes', {})
        for category_key, category_data in sub_toolboxes.items():
            yaml_path = category_data.get('yaml_path')
            if not yaml_path:
                continue

            yaml_file = Path(yaml_path)
            if yaml_file.exists():
                with open(yaml_file, 'r') as yf:
                    category_content = yaml.safe_load(yf) or {}

                agent_count = len(category_content.get('agents', []))
                skill_count = len(category_content.get('skills', []))

                category_data['agent_count'] = agent_count
                category_data['skill_count'] = skill_count

    with open(ROUTER_PATH, 'w') as f:
         yaml.safe_dump(router_data, f, sort_keys=False, indent=2)

    print("Sync complete.")

if __name__ == "__main__":
    main()
