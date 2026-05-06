import os
import re

def check_structure():
    toolbox_dir = ".toolbox"
    domains = [d for d in os.listdir(toolbox_dir) if os.path.isdir(os.path.join(toolbox_dir, d))]

    for category in domains:
        category_path = os.path.join(toolbox_dir, category)
        subdomains = [d for d in os.listdir(category_path) if os.path.isdir(os.path.join(category_path, d))]
        for sub in subdomains:
            sub_path = os.path.join(category_path, sub)
            agents = os.path.join(sub_path, "agents")
            skills = os.path.join(sub_path, "skills")

            if not os.path.exists(agents):
                print(f"Missing agents/ in {sub_path}")
            if not os.path.exists(skills):
                print(f"Missing skills/ in {sub_path}")

            if os.path.exists(agents):
                for f in os.listdir(agents):
                    if f.endswith('.md'):
                        # Check kebab case
                        if not re.match(r'^[a-z0-9-]+$', f[:-3]):
                            print(f"Agent naming violation: {f} in {agents}")

            if os.path.exists(skills):
                for f in os.listdir(skills):
                    if os.path.isdir(os.path.join(skills, f)):
                        if not re.match(r'^[a-z0-9-]+$', f):
                            print(f"Skill naming violation: {f} in {skills}")
                        skill_md = os.path.join(skills, f, "SKILL.md")
                        if not os.path.exists(skill_md):
                            print(f"Missing SKILL.md in {os.path.join(skills, f)}")

check_structure()
