#!/usr/bin/env python3
"""
sync_indexes.py

Regenerates department JSON index files from the actual filesystem.
Also generates _agents_brain/system_brain.json using the same strategy.

STRATEGY: REGENERATE
  The JSON content is 100% filesystem-derived (folder/file names only).
  There is no human-authored metadata to preserve, so regenerating from
  scratch on every run is always accurate and never drifts from reality.
  Keep/add/remove would only be worth it if we were preserving hand-written
  descriptions (like index.yaml does) — we are not.

OUTPUT FORMAT per department (skills/<domain>/<dept>/<dept>.json):
  {
    "name": "<dept>",
    "domain": "<domain>",
    "resources": {
      "_experience": ["relative/path/to/file", "subfolder/", ...],
      "_context":    [...],
      "_formats":    [...],
      "_playbooks":  [...],
      "_tools":      [...]
    },
    "skills": {
      "<skill-folder>": ["SKILL.md", "subfolder/file.md", ...],
      ...
    }
  }

OUTPUT FORMAT for system brain (_agents_brain/system_brain.json):
  {
    "name": "system_brain",
    "path": "_agents_brain/",
    "resources": {
      "_experience": [...],
      "_context":    [...],
      "_formats":    [...],
      "_playbooks":  [...],
      "_tools":      [...]
    },
    "workspace": {
      "scratch": [...]
    }
  }

  - resources: one key per _ folder at the root level
  - skills / workspace: one key per non-_ folder at the root level
  - Both sections list ALL nested folders and files at any depth,
    as paths relative to the respective section's root folder.
  - .gitkeep entries are excluded from all listings.
"""

import json
import os
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
WORKSPACE  = Path(__file__).resolve().parents[2]  # two levels up from _tools/
SKILLS_DIR = WORKSPACE / "skills"
DOMAINS    = ["agentic", "engineering", "business", "studio", "life"]

# Files to silently skip everywhere
IGNORED_FILES = {".gitkeep", ".DS_Store", "Thumbs.db"}


# ── Helpers ───────────────────────────────────────────────────────────────────

def collect_contents(root: Path) -> list[str]:
    """
    Recursively collect every folder and file under `root`.
    Returns paths relative to `root`, forward-slash separated, sorted.
    Folders are listed with a trailing `/` so you can tell them apart from files.
    Skips IGNORED_FILES.
    """
    if not root.exists():
        return []

    entries: list[str] = []

    for item in sorted(root.rglob("*")):
        if item.name in IGNORED_FILES:
            continue
        rel = item.relative_to(root).as_posix()
        if item.is_dir():
            rel += "/"
        entries.append(rel)

    return entries


def sync_department(domain: str, dept_path: Path) -> dict:
    """
    Scan one department folder and write (or overwrite) its JSON file.
    Returns a summary dict for reporting.
    """
    dept_name = dept_path.name

    resources: dict[str, list[str]] = {}
    skills:    dict[str, list[str]] = {}

    for child in sorted(dept_path.iterdir()):
        # Skip hidden / system items at the department root
        if child.name.startswith("."):
            continue
        # Skip any existing JSON / YAML index files at root level
        if child.is_file() and child.suffix in (".json", ".yaml", ".yml"):
            continue
        # Only process directories
        if not child.is_dir():
            continue

        if child.name.startswith("_"):
            resources[child.name] = collect_contents(child)
        else:
            skills[child.name] = collect_contents(child)

    payload = {
        "name":      dept_name,
        "domain":    domain,
        "resources": resources,
        "skills":    skills,
    }

    json_path = dept_path / f"{dept_name}.json"
    with open(json_path, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(payload, fh, indent=2, ensure_ascii=False)
        fh.write("\n")  # POSIX trailing newline

    # Remove legacy YAML file if present
    removed_yaml = False
    for ext in (".yaml", ".yml"):
        yaml_path = dept_path / f"{dept_name}{ext}"
        if yaml_path.exists():
            yaml_path.unlink()
            removed_yaml = True

    return {
        "dept":         f"{domain}/{dept_name}",
        "json":         json_path.relative_to(WORKSPACE).as_posix(),
        "removed_yaml": removed_yaml,
        "resources":    list(resources.keys()),
        "skills":       list(skills.keys()),
    }


def sync_system_brain() -> dict:
    """
    Scan _agents_brain/ and write _agents_brain/system_brain.json.
    Same logic as sync_department but:
      - Non-_ folders go under "workspace" instead of "skills"
      - The JSON file itself is named system_brain.json
    Returns a summary dict for reporting.
    """
    brain_path = WORKSPACE / "_agents_brain"
    json_path  = brain_path / "system_brain.json"

    resources: dict[str, list[str]] = {}
    workspace: dict[str, list[str]] = {}

    for child in sorted(brain_path.iterdir()):
        if child.name.startswith("."):
            continue
        # Skip any existing JSON files at root level
        if child.is_file() and child.suffix in (".json", ".yaml", ".yml"):
            continue
        if not child.is_dir():
            continue

        if child.name.startswith("_"):
            resources[child.name] = collect_contents(child)
        else:
            workspace[child.name] = collect_contents(child)

    payload = {
        "name":      "system_brain",
        "path":      "_agents_brain/",
        "resources": resources,
        "workspace": workspace,
    }

    with open(json_path, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(payload, fh, indent=2, ensure_ascii=False)
        fh.write("\n")

    return {
        "json":      json_path.relative_to(WORKSPACE).as_posix(),
        "resources": list(resources.keys()),
        "workspace": list(workspace.keys()),
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    print("=" * 60)
    print("  sync_indexes.py  |  strategy: REGENERATE")
    print("=" * 60)

    # ── System Brain ─────────────────────────────────────────────────────────
    print("\n[SYSTEM BRAIN] _agents_brain/")
    sb = sync_system_brain()
    print(
        f"  [OK] {sb['json']}"
        f"  [{len(sb['resources'])} resource section(s),"
        f" {len(sb['workspace'])} workspace folder(s)]"
    )

    # ── Skill Domains ─────────────────────────────────────────────────────────
    results:   list[dict] = []
    skipped:   list[str]  = []

    for domain in DOMAINS:
        domain_path = SKILLS_DIR / domain
        if not domain_path.exists():
            skipped.append(domain)
            continue

        print(f"\n[DOMAIN] {domain}")

        for dept_path in sorted(domain_path.iterdir()):
            if not dept_path.is_dir():
                continue

            info = sync_department(domain, dept_path)
            results.append(info)

            yaml_tag  = "  (removed legacy .yaml)" if info["removed_yaml"] else ""
            res_count = len(info["resources"])
            skl_count = len(info["skills"])
            print(
                f"  [OK] {info['dept']}.json"
                f"  [{res_count} resource section(s), {skl_count} skill(s)]"
                f"{yaml_tag}"
            )

    print()
    print("=" * 60)
    print(f"  DONE — 1 system_brain + {len(results)} department JSON files regenerated.")
    if skipped:
        print(f"  SKIPPED domains (folder not found): {', '.join(skipped)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
