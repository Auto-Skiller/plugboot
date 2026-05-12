import os
import yaml
import pathlib
from datetime import datetime

# Path Configuration (Relative to Workspace Root)
WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent
CONTROLER_PATH = WORKSPACE_ROOT / "CONTROLER.yaml"
ROUTER_PATH = WORKSPACE_ROOT / ".brain" / "meta.router" / "mission_board.router.yaml"
MISSION_BOARD_DIR = WORKSPACE_ROOT / ".runtime" / ".mission_board"

def load_yaml(path):
    if not path.exists():
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def save_yaml(path, data, header=""):
    with open(path, 'w', encoding='utf-8') as f:
        if header:
            f.write(header + "\n")
        yaml.dump(data, f, sort_keys=False, allow_unicode=True)

def sync():
    print(f"[*] Starting Agentic OS Sync Engine...")
    
    # 1. Discover physical sessions
    sessions_found = {}
    for item in MISSION_BOARD_DIR.iterdir():
        if item.is_dir() and not item.name.startswith("_") and not item.name.startswith("."):
            session_name = item.name
            session_yaml = item / f"{session_name}.yaml"
            if session_yaml.exists():
                session_data = load_yaml(session_yaml)
                goals = []
                # Discover goals
                for subitem in item.iterdir():
                    if subitem.is_dir() and not subitem.name.startswith("_") and not subitem.name.startswith("."):
                        goal_name = subitem.name
                        goal_yaml = subitem / "GOAL.yaml"
                        if not goal_yaml.exists():
                            goal_yaml = subitem / f"{goal_name}.yaml" # fallback
                        
                        if goal_yaml.exists():
                            goal_data = load_yaml(goal_yaml)
                            goals.append({
                                "name": goal_name,
                                "folder_path": str(subitem.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
                                "yaml_path": str(goal_yaml.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
                                "status": goal_data.get("metadata", {}).get("status", "active 🟢"),
                                "progress_percentage": "0%", # Placeholder
                                "extra_files": []
                            })
                
                sessions_found[session_name] = {
                    "folder_path": str(item.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
                    "yaml_path": str(session_yaml.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
                    "status": session_data.get("metadata", {}).get("status", "active"),
                    "progress_percentage": "0%",
                    "goals": goals
                }

    # 2. Update mission_board.router.yaml
    router_data = load_yaml(ROUTER_PATH) or {}
    router_data["sessions"] = sessions_found
    save_yaml(ROUTER_PATH, router_data)
    print(f"[+] Updated {ROUTER_PATH.name}")

    # 3. Update CONTROLER.yaml (Optional but recommended for consistency)
    controler_data = load_yaml(CONTROLER_PATH)
    if controler_data:
        # Sync active_sessions list
        controler_data["system_status"]["active_sessions"] = list(sessions_found.keys())
        
        # Sync sessions block
        new_sessions_block = []
        for s_name, s_info in sessions_found.items():
            session_yaml_path = WORKSPACE_ROOT / s_info["yaml_path"]
            s_data = load_yaml(session_yaml_path)
            
            # Map goals for controler
            c_goals = []
            for g in s_info["goals"]:
                g_yaml_path = WORKSPACE_ROOT / g["yaml_path"]
                g_data = load_yaml(g_yaml_path)
                c_goals.append({
                    "goal_name": g["name"],
                    "details": g_data.get("metadata", {}).get("description", ""),
                    "status": g["status"],
                    "tasks": g_data.get("execution", {}).get("plan", {}).get("tasks", []),
                    "tracking": g_data.get("execution", {}).get("state", {}).get("tracking", ""),
                    "artifacts": g_data.get("execution", {}).get("state", {}).get("artifacts", [])
                })
            
            new_sessions_block.append({
                "session_name": s_name,
                "details": {
                    "agent": s_data.get("metadata", {}).get("agent", "Unknown"),
                    "started_at": s_data.get("metadata", {}).get("started_at", ""),
                    "summary": s_data.get("execution", {}).get("summary", ""),
                    "status": s_data.get("metadata", {}).get("status", "active")
                },
                "goals": c_goals
            })
        
        controler_data["sessions"]["active"] = new_sessions_block
        controler_data["system_status"]["last_sync"] = datetime.now().isoformat()
        save_yaml(CONTROLER_PATH, controler_data, header="# 🛡️ CONTROLER - OPERATIONAL HUB")
        print(f"[+] Updated {CONTROLER_PATH.name}")

if __name__ == "__main__":
    sync()
    print("[!] Sync Complete.")
