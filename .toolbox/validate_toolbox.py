#!/usr/bin/env python3
import os
import sys

def validate_toolbox():
    violations = []
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # Toolboxes mapping to their required prefix
    toolbox_prefixes = {
        ".agentic_toolbox": "agentic",
        "business_toolbox": "business",
        "engineering_toolbox": "engineering",
        "life_toolbox": "life",
        "studio_toolbox": "studio"
    }

    for toolbox, prefix in toolbox_prefixes.items():
        toolbox_path = os.path.join(base_dir, toolbox)
        if not os.path.isdir(toolbox_path):
            continue

        for domain in os.listdir(toolbox_path):
            domain_path = os.path.join(toolbox_path, domain)
            if not os.path.isdir(domain_path) or domain.startswith('.'):
                continue

            # Check required subdirectories
            agents_path = os.path.join(domain_path, "agents")
            skills_path = os.path.join(domain_path, "skills")

            if not os.path.isdir(agents_path):
                violations.append(f"Missing required 'agents' directory in {domain_path}")
            if not os.path.isdir(skills_path):
                violations.append(f"Missing required 'skills' directory in {domain_path}")
                continue

            # Check skill directory names
            for skill_dir in os.listdir(skills_path):
                skill_dir_path = os.path.join(skills_path, skill_dir)
                if not os.path.isdir(skill_dir_path) or skill_dir.startswith('.'):
                    continue

                expected_prefix = f"{prefix}.{domain}."
                if not skill_dir.startswith(expected_prefix):
                    violations.append(
                        f"Skill directory naming violation: {skill_dir_path}\n"
                        f"Expected prefix: {expected_prefix}"
                    )

    if violations:
        print("Toolbox Validation Failed. The following violations were found:\n")
        for v in violations:
            print(f"- {v}")
        sys.exit(1)
    else:
        print("Toolbox Validation Passed. No architecture violations found.")
        sys.exit(0)

if __name__ == "__main__":
    validate_toolbox()
