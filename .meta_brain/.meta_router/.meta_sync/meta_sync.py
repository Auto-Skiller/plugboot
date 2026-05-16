import os
import sys
import pathlib
import argparse
import re
import subprocess
from datetime import datetime
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

SYNC_ENGINE_VERSION = "5.1" # Restoring lost logic

# --- Path Configuration ---
WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent
META_ROUTER_DIR = WORKSPACE_ROOT / ".meta_brain" / ".meta_router"
META_SYNC_DIR = META_ROUTER_DIR / ".meta_sync"
MASTER_ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / "meta_router.yaml"
CONTROLER_PATH = WORKSPACE_ROOT / "CONTROLER.yaml"
IDENTITY_DIR = WORKSPACE_ROOT / ".meta_brain" / "meta_identity"

HEALTH_HISTORY_MAX = 10

def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def save_yaml(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: yaml.dump(data, f)

def now_iso(): return datetime.now().isoformat()

def run_sub_sync(script_path, dry_run):
    print(f"[*] Running {script_path.name}...")
    cmd = [sys.executable, str(script_path)]
    if dry_run: cmd.append("--dry-run")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout: print(result.stdout.strip())
    if result.stderr: print(f"  [ERR] {result.stderr.strip()}")

def extract_identity_metadata(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        description = ""
        match_desc = re.search(r"\*\*(?:Purpose|Role|Description):\*\* (.*)", content, re.IGNORECASE)
        if match_desc:
            description = match_desc.group(1).strip()
        else:
            for line in content.split("\n"):
                line = line.strip()
                if not line or line.startswith("#") or line.startswith(">") or line.startswith("---"): continue
                description = line
                if len(description) > 200: description = description[:197] + "..."
                break
        
        when_to_use = ""
        match_wtu = re.search(r"\*\*(?:When to [Uu]se):\*\* (.*)", content, re.IGNORECASE)
        if match_wtu:
            when_to_use = match_wtu.group(1).strip()
            
        return {
            "path": str(file_path.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
            "description": description,
            "when_to_use": when_to_use
        }
    except:
        return None

def update_telemetry(controler_data, health, session_count, dry_run):
    if dry_run: return
    tel = controler_data.get("telemetry") or {}
    tel["sync_count"] = int(tel.get("sync_count", 0)) + 1
    
    # Rolling health history
    history = list(tel.get("health_history") or [])
    history.append({
        "ts": now_iso(),
        "health": health,
        "sessions": session_count
    })
    if len(history) > HEALTH_HISTORY_MAX:
        history = history[-HEALTH_HISTORY_MAX:]
    
    tel["health_history"] = history
    tel["last_sync"] = now_iso()
    
    # Peak tracking
    tel["peak_session_count"] = max(int(tel.get("peak_session_count", 0)), session_count)
    
    controler_data["telemetry"] = tel

def run_validate():
    """Read-only structural validation \u2014 checks all router paths exist on disk."""
    print("[VALIDATE] Agentic OS Router Validation")
    warnings = 0
    errors = 0

    def check_path(label, path, required=True):
        nonlocal warnings, errors
        if not path: return
        p = WORKSPACE_ROOT / path if not pathlib.Path(path).is_absolute() else pathlib.Path(path)
        if p.exists():
            print(f"  [OK]   {label} -> {path}")
        elif required:
            print(f"  [ERR]  {label} -> MISSING: {path}")
            errors += 1
        else:
            print(f"  [WARN] {label} -> not found (optional): {path}")
            warnings += 1

    # Master Router
    check_path("meta_router.yaml", ".meta_brain/meta_router.yaml")
    master = load_yaml(MASTER_ROUTER_PATH)
    if master and "routers" in master:
        # Check child routers
        for r_domain, r_data in master["routers"].items():
            if isinstance(r_data, dict):
                if "path" in r_data:
                    check_path(f"Router: {r_domain}", r_data["path"])
                else:
                    for sub_name, sub_data in r_data.items():
                        if isinstance(sub_data, dict) and "path" in sub_data:
                            check_path(f"Router: {r_domain}/{sub_name}", sub_data["path"])

    # Identity Files
    if IDENTITY_DIR.exists():
        for f in IDENTITY_DIR.glob("*.md"):
            check_path(f"Identity: {f.name}", str(f.relative_to(WORKSPACE_ROOT)))

    print(f"\n[VALIDATE] Done. {warnings} warning(s), {errors} error(s).")
    return errors == 0

def sync(dry_run=False):
    print(f"[*] Starting Agentic OS Sync Engine v{SYNC_ENGINE_VERSION}...")
    
    # 1. Run all sub-syncs
    sync_scripts = [
        META_SYNC_DIR / "meta_runtime_sync" / "meta_runtime_sync.py",
        META_SYNC_DIR / "milestones_sync" / "milestones_sync.py",
        META_SYNC_DIR / "toolboxes_sync" / "toolboxes_sync.py",
        META_SYNC_DIR / "pipelines_sync" / "pipelines_sync.py",
        META_SYNC_DIR / "projects_sync" / "projects_sync.py"
    ]
    
    for script in sync_scripts:
        if script.exists():
            run_sub_sync(script, dry_run)
        else:
            print(f"  [WARN] Sync script missing: {script}")

    # 2. Re-assemble meta_router.yaml
    print("\n[*] Re-assembling meta_router.yaml...")
    master = load_yaml(MASTER_ROUTER_PATH)
    if not master:
        print("  [ERR] master_router.yaml not found!")
        return

    runtime = load_yaml(META_ROUTER_DIR / "meta_runtime.yaml")
    milestones = load_yaml(META_ROUTER_DIR / "milestones.yaml")
    toolboxes = load_yaml(META_ROUTER_DIR / "toolboxes.yaml")
    pipelines = load_yaml(META_ROUTER_DIR / "pipelines.yaml")
    projects = load_yaml(META_ROUTER_DIR / "projects.yaml")

    routers = master.get("routers", {})
    
    if runtime and "runtime" in routers:
        routers["runtime"]["description"] = runtime.get("description", routers["runtime"].get("description"))
        routers["runtime"]["when_to_use"] = runtime.get("when_to_use", routers["runtime"].get("when_to_use"))

    if milestones and "brain" in routers and "milestones" in routers["brain"]:
        routers["brain"]["milestones"]["description"] = milestones.get("description", routers["brain"]["milestones"].get("description"))
        routers["brain"]["milestones"]["when_to_use"] = milestones.get("when_to_use", routers["brain"]["milestones"].get("when_to_use"))

    if toolboxes and "brain" in routers and "toolboxes" in routers["brain"]:
        routers["brain"]["toolboxes"]["description"] = toolboxes.get("description", routers["brain"]["toolboxes"].get("description"))
        routers["brain"]["toolboxes"]["when_to_use"] = toolboxes.get("when_to_use", routers["brain"]["toolboxes"].get("when_to_use"))

    if pipelines and "workspaces" in routers and "pipelines" in routers["workspaces"]:
        routers["workspaces"]["pipelines"]["description"] = pipelines.get("description", routers["workspaces"]["pipelines"].get("description"))
        routers["workspaces"]["pipelines"]["when_to_use"] = pipelines.get("when_to_use", routers["workspaces"]["pipelines"].get("when_to_use"))

    if projects and "workspaces" in routers and "projects" in routers["workspaces"]:
        routers["workspaces"]["projects"]["description"] = projects.get("description", routers["workspaces"]["projects"].get("description"))
        routers["workspaces"]["projects"]["when_to_use"] = projects.get("when_to_use", routers["workspaces"]["projects"].get("when_to_use"))

    # Sync Identity Files
    print("  [+] Syncing identity metadata...")
    identity_map = {}
    if IDENTITY_DIR.exists():
        for f in IDENTITY_DIR.glob("*.md"):
            meta = extract_identity_metadata(f)
            if meta: identity_map[f.stem] = meta
    
    if "brain" not in routers: routers["brain"] = {}
    routers["brain"]["identity_standards"] = {
        "description": "The absolute architectural rules and system laws for the Agentic OS.",
        "when_to_use": "Read before building new core components or changing system logic.",
        "files": identity_map
    }

    master["routers"] = routers
    master["generated_at"] = now_iso()

    if not dry_run:
        save_yaml(MASTER_ROUTER_PATH, master)
        print("  [+] meta_router.yaml re-assembled.")

    # 3. Update CONTROLER.yaml
    print("\n[*] Updating CONTROLER.yaml...")
    controler = load_yaml(CONTROLER_PATH)
    if controler:
        health = "100%"
        session_count = 0
        if milestones:
            health = milestones.get("index", {}).get("overall_health", "100%")
            session_count = len(milestones.get("sessions", {}))
        
        if "system_status" not in controler: controler["system_status"] = {}
        controler["system_status"]["last_sync"] = now_iso()
        controler["system_status"]["overall_health"] = health
        controler["system_status"]["session_count"] = session_count
        
        if milestones and "sessions" in milestones:
            active_sessions = []
            for s_name, s_info in milestones["sessions"].items():
                active_sessions.append({
                    "session_name": s_name,
                    "session_status": s_info.get("status"),
                    "session_summary": s_info.get("summary"),
                    "progress": s_info.get("progress_percentage"),
                    "goal_count": len(s_info.get("goals", []))
                })
            controler["active_sessions"] = active_sessions

        # Update telemetry (Restored Logic)
        update_telemetry(controler, health, session_count, dry_run)
        
        if toolboxes:
            total = 0
            functional = 0
            empty = 0
            for domain in ["core_toolboxes", "extended_toolboxes"]:
                d_data = toolboxes.get(domain, {})
                if domain == "core_toolboxes":
                    for t_name, t_info in d_data.items():
                        total += 1
                        status = t_info.get("health", {}).get("status")
                        if status in ["functional", "complete"]: functional += 1
                        elif status == "empty": empty += 1
                else:
                    for dom, dom_info in d_data.items():
                        for sub, sub_info in dom_info.get("sub_toolboxes", {}).items():
                            total += 1
                            status = sub_info.get("health", {}).get("status")
                            if status in ["functional", "complete"]: functional += 1
                            elif status == "empty": empty += 1
            
            controler["telemetry"]["toolbox_readiness"] = {
                "total": total,
                "functional": functional,
                "empty": empty
            }

        if pipelines:
            # We don't need to sync pipelines here as pipelines_sync.py already did it
            # But we can pull the latest state if needed
            pass

        if not dry_run:
            save_yaml(CONTROLER_PATH, controler)
            print(f"  [+] CONTROLER.yaml updated (Health: {health}, Sessions: {session_count}).")

    print("\n[!] Sync Complete.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Agentic OS Master Sync Engine")
    parser.add_argument("--dry-run", action="store_true", help="Preview mutations.")
    parser.add_argument("--validate", action="store_true", help="Read-only structural validation.")
    args = parser.parse_args()
    
    if args.validate:
        ok = run_validate()
        sys.exit(0 if ok else 1)
        
    sync(dry_run=args.dry_run)
