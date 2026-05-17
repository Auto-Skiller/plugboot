import os
import sys
import pathlib
import argparse
import re
import subprocess
from datetime import datetime
from ruamel.yaml import YAML
from ruamel.yaml.scalarstring import PreservedScalarString

yaml = YAML()
yaml.preserve_quotes = True
yaml.indent(mapping=2, sequence=4, offset=2) # Enforce consistent indentation

SYNC_ENGINE_VERSION = "5.1" # Restoring lost logic

# --- Path Configuration ---
WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent
META_ENGINE_DIR = pathlib.Path(__file__).parent / ".meta_routing" / "meta_sync_engines"
MASTER_ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / "meta_router.yaml"
CONTROLER_PATH = WORKSPACE_ROOT / "CONTROLER.yaml"
IDENTITY_DIR = WORKSPACE_ROOT / ".meta_brain" / "meta_identity"

HEALTH_HISTORY_MAX = 10

def load_yaml(path, sanitize=False):
    if not path.exists(): return None
    
    # Use 'safe' type to load without comments/anchors
    safe_yaml = YAML(typ='safe')
    with open(path, "r", encoding="utf-8") as f:
        data = safe_yaml.load(f)
        
    if not sanitize:
        return data

    # Convert back to CommentedMap for sync engine compatibility
    from ruamel.yaml.comments import CommentedMap
    def to_commented(d):
        if isinstance(d, dict):
            cm = CommentedMap()
            for k, v in d.items():
                cm[k] = to_commented(v)
            return cm
        elif isinstance(d, list):
            return [to_commented(i) for i in d]
        return d
        
    return to_commented(data)

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
    
    if result.returncode != 0:
        print(f"  [FAIL] {script_path.name} failed with exit code {result.returncode}")
        return False
    return True

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
        META_ENGINE_DIR / "meta_runtime_sync.py",
        META_ENGINE_DIR / "milestones_sync.py",
        META_ENGINE_DIR / "toolboxes_sync.py",
        META_ENGINE_DIR / "pipelines_sync.py",
        META_ENGINE_DIR / "projects_sync.py"
    ]
    
    for script in sync_scripts:
        if script.exists():
            ok = run_sub_sync(script, dry_run)
            if not ok:
                print(f"\n[ERR] Master Sync aborted because {script.name} reported warnings or errors.")
                print("[!] Please fix the mismatches and rerun.")
                sys.exit(1)
        else:
            print(f"  [WARN] Sync script missing: {script}")

    # 2. Re-assemble meta_router.yaml
    print("\n[*] Re-assembling meta_router.yaml...")
    # Load master with sanitization to clear old markers
    master = load_yaml(MASTER_ROUTER_PATH, sanitize=True)
    if not master:
        print("  [ERR] master_router.yaml not found!")
        return

    runtime = load_yaml(pathlib.Path(__file__).parent / ".meta_routing" / "meta_runtime.yaml")
    milestones = load_yaml(pathlib.Path(__file__).parent / ".meta_routing" / "milestones.yaml")
    toolboxes = load_yaml(pathlib.Path(__file__).parent / ".meta_routing" / "toolboxes.yaml")
    pipelines = load_yaml(pathlib.Path(__file__).parent / ".meta_routing" / "pipelines.yaml")
    projects = load_yaml(pathlib.Path(__file__).parent / ".meta_routing" / "projects.yaml")

    routers = master.get("routers", {})
    
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

    # Sync Infrastructure (Re-assembled from meta_runtime.yaml)
    print("  [+] Syncing infrastructure...")
    infra = master.get("infrastructure", {})
    if runtime:
        runtime_infra = runtime.get("infrastructure", {})
        for key, data in runtime_infra.items():
            clean_key = key.lstrip(".").replace("meta_", "")
            if clean_key in infra:
                infra[clean_key]["path"] = data.get("path", infra[clean_key].get("path"))
            else:
                infra[clean_key] = data
        master["infrastructure"] = infra

    # Re-order Brain Routers: Identity First
    print("  [+] Syncing identity metadata...")
    identity_map = {}
    if IDENTITY_DIR.exists():
        for f in IDENTITY_DIR.glob("*.md"):
            meta = extract_identity_metadata(f)
            if meta: identity_map[f.stem] = meta
    
    # Create a new brain dict to force order (Milestones, Toolboxes, then Identity)
    new_brain = yaml.map()
    old_brain = routers.get("brain", {})
    for key in ["milestones", "toolboxes", "runtime"]:
        if key in old_brain:
            new_brain[key] = old_brain[key]
            
    new_brain["identity"] = {
        "path": ".meta_brain/meta_identity/",
        "description": "The absolute architectural rules and system laws for the Agentic OS.",
        "when_to_use": "Loaded automatically via BOOT-00 for system grounding.",
        "files_count": len(identity_map),
        "files": identity_map
    }
            
    routers["brain"] = new_brain

    # Final Re-assembly with Style Enforcement
    # --- STYLE ENFORCEMENT ---
    def set_section_marker(obj, key, marker_text, spacing="\n"):
        if key in obj:
            # Clear existing comments for this key
            obj.ca.items.pop(key, None)
            # Set fresh marker
            obj.yaml_set_comment_before_after_key(key, before=f"{spacing}{marker_text}")

    # Ensure Router Map Separator
    set_section_marker(master, "routers", "─── Router Map ───────────────────────────────────────────────────────────────")

    # Ensure Workspaces Separator
    set_section_marker(routers, "workspaces", "─── Workspaces ─────────────────────────────────────────────────────────────")

    # Sync Protocol Reference
    print("  [+] Syncing protocol reference...")
    boot = load_yaml(WORKSPACE_ROOT / ".meta_brain" / "BOOT_CONTRACTS.yaml")
    if boot and "protocols" in master:
        master["protocols"]["boot"]["version"] = boot.get("schema_version", master["protocols"]["boot"].get("version"))
        master["protocols"]["boot"]["os_version"] = boot.get("os_version", "5.2")
        set_section_marker(master, "protocols", "─── Protocol & State Reference ───────────────────────────────────────────────", spacing="")
    
    # Ensure Infrastructure Separator
    set_section_marker(master, "infrastructure", "─── Infrastructure — Supporting Subsystems ──────────────────────────────────")

    # Flow Style for Vocabulary
    if "brain" in routers and "milestones" in routers["brain"]:
        vocab = routers["brain"]["milestones"].get("status_vocabulary", {})
        from ruamel.yaml.comments import CommentedSeq
        for k, v in vocab.items():
            if isinstance(v, list) and not isinstance(v, CommentedSeq):
                vocab[k] = CommentedSeq(v)
            if isinstance(vocab[k], CommentedSeq):
                vocab[k].fa.set_flow_style()

    master["routers"] = routers
    master["generated_at"] = now_iso()
    
    # Ensure Header
    master.yaml_set_start_comment("🧠 MASTER ROUTER INDEX\n")

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

                goals_details = []
                for g in s_info.get("goals", []):
                    goals_details.append({
                        "name": g.get("name"),
                        "status": g.get("status"),
                        "progress": g.get("progress_percentage")
                    })

                # Fetch session yaml to get round details
                session_yaml_path = WORKSPACE_ROOT / s_info.get("yaml_path", "")
                round_info = None
                if session_yaml_path.exists():
                    import ruamel.yaml
                    y = ruamel.yaml.YAML()
                    with open(session_yaml_path) as sf:
                        sdata = y.load(sf)
                        persistence = sdata.get("metadata", {}).get("persistence", {})
                        if persistence and persistence.get("enabled", False):
                            round_info = f"Round {persistence.get('current_round', 1)}/{persistence.get('max_rounds', 'unlimited')}"

                session_obj = {
                    "session_name": s_name,
                    "session_status": s_info.get("status"),
                    "session_summary": s_info.get("summary"),
                    "progress": s_info.get("progress_percentage"),
                    "goals": goals_details
                }
                if round_info:
                    session_obj["round_info"] = round_info

                active_sessions.append(session_obj)

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
