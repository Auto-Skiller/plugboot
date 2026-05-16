import os
import sys
import pathlib
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent.parent
TOOLBOX_ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / ".meta_router" / "toolboxes.yaml"

def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def save_yaml(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: yaml.dump(data, f)

def sync_toolboxes(dry_run=False):
    print("\n[*] Synchronizing toolboxes.yaml...")
    router = load_yaml(TOOLBOX_ROUTER_PATH)
    if not router:
        print("  [ERR] toolboxes.yaml not found \u2014 skipping.")
        return

    router_modified = False

    def process_toolbox(tb_info, tb_path):
        nonlocal router_modified
        if not tb_path.exists(): return
        
        # Try to load the internal YAML for description/when_to_use
        inner_yaml_path = tb_path / f"{tb_path.name}.yaml"
        if inner_yaml_path.exists():
            inner_data = load_yaml(inner_yaml_path)
            if inner_data and "metadata" in inner_data:
                meta = inner_data["metadata"]
                if meta.get("description") and tb_info.get("description") != meta["description"]:
                    tb_info["description"] = meta["description"]
                    router_modified = True
                if meta.get("when_to_use") and tb_info.get("when_to_use") != meta["when_to_use"]:
                    tb_info["when_to_use"] = meta["when_to_use"]
                    router_modified = True

        agents_dir, skills_dir = tb_path / "agents", tb_path / "skills"
        agent_names = sorted([f.stem for f in agents_dir.glob("*.md")]) if agents_dir.exists() else []
        skill_names = sorted([d.name for d in skills_dir.iterdir() if d.is_dir()]) if skills_dir.exists() else []
            
        if tb_info.get("agent_count") != len(agent_names) or tb_info.get("skill_count") != len(skill_names):
            tb_info["agent_names"] = agent_names
            tb_info["agent_count"] = len(agent_names)
            tb_info["skill_names"] = skill_names
            tb_info["skill_count"] = len(skill_names)
            router_modified = True
            
        if "health" in tb_info:
            pct = sum([
                40 if len(skill_names) > 0 else 0,
                30 if len(agent_names) > 0 else 0,
                20 if (tb_path / "execution").exists() else 0,
                10 if (tb_path / "examples").exists() else 0
            ])
            
            if tb_info["health"].get("completion_pct") != pct:
                tb_info["health"]["completion_pct"] = pct
                tb_info["health"]["status"] = "empty" if pct == 0 else "partial" if pct < 50 else "functional" if pct < 90 else "complete"
                router_modified = True

    for name, info in (router.get("core_toolboxes") or {}).items():
        if not isinstance(info, dict): continue
        p = WORKSPACE_ROOT / info.get("path", "")
        if p.exists():
            print(f"  [OK]  core.{name}")
            process_toolbox(info, p)

    for domain, domain_info in (router.get("extended_toolboxes") or {}).items():
        if not isinstance(domain_info, dict): continue
        for sub_name, sub_info in (domain_info.get("sub_toolboxes") or {}).items():
            if not isinstance(sub_info, dict): continue
            p = WORKSPACE_ROOT / sub_info.get("path", "")
            if p.exists():
                print(f"  [OK]  {domain}/{sub_name}")
                process_toolbox(sub_info, p)

    if router_modified and not dry_run:
        save_yaml(TOOLBOX_ROUTER_PATH, router)
        print("  [+] Updated toolboxes.yaml with metadata from inner YAMLs.")

    print("[TOOLBOX] Done.")

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    sync_toolboxes(dry_run)
