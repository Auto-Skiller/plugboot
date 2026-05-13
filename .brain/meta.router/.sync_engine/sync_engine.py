import os
from ruamel.yaml import YAML
import pathlib
from datetime import datetime

yaml = YAML()
yaml.preserve_quotes = True

# Path Configuration (Relative to Workspace Root)
WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent
CONTROLER_PATH = WORKSPACE_ROOT / "CONTROLER.yaml"
ROUTER_PATH = WORKSPACE_ROOT / ".brain" / "meta.router" / "mission_board.router.yaml"
MISSION_BOARD_DIR = WORKSPACE_ROOT / ".runtime" / ".mission_board"

def load_yaml(path):
    if not path.exists():
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.load(f)

def save_yaml(path, data, header=""):
    with open(path, 'w', encoding='utf-8') as f:
        yaml.dump(data, f)

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
        sorted_session_names = sorted(sessions_found.keys(), key=lambda x: 0 if 'SCALER' in x else 1)
        controler_data["system_status"]["active_sessions"] = sorted_session_names
        
        # In-place update of active_sessions
        if "active_sessions" not in controler_data or not isinstance(controler_data["active_sessions"], list):
            controler_data["active_sessions"] = []
            
        existing_sessions = controler_data["active_sessions"]
        new_sessions_dict = {}
        
        for s_name in sorted_session_names:
            s_info = sessions_found[s_name]
            session_yaml_path = WORKSPACE_ROOT / s_info["yaml_path"]
            s_data = load_yaml(session_yaml_path)
            
            # Map goals for controler
            c_goals = []
            for g in s_info["goals"]:
                g_yaml_path = WORKSPACE_ROOT / g["yaml_path"]
                g_data = load_yaml(g_yaml_path)
                c_goals.append({
                    "goal_name": g["name"],
                    "goal_status": g["status"],
                    "goal_summary": g_data.get("metadata", {}).get("description", ""),
                    "tasks_tracking": g_data.get("execution", {}).get("state", {}).get("tracking", ""),
                    "artifacts": g_data.get("execution", {}).get("state", {}).get("artifacts", [])
                })
            
            new_sessions_dict[s_name] = {
                "session_name": s_name,
                "agent": s_data.get("metadata", {}).get("agent", "Unknown"),
                "started_at": s_data.get("metadata", {}).get("started_at", ""),
                "session_summary": s_data.get("execution", {}).get("summary", ""),
                "session_status": s_data.get("metadata", {}).get("status", "active"),
                "goals": c_goals
            }
            
        # Update existing items in place
        for i in range(len(existing_sessions) - 1, -1, -1):
            s_name = existing_sessions[i].get("session_name")
            if s_name not in new_sessions_dict:
                del existing_sessions[i]
            else:
                for k, v in new_sessions_dict[s_name].items():
                    existing_sessions[i][k] = v
                del new_sessions_dict[s_name]
                
        # Append remaining new sessions
        for s_name in sorted_session_names:
            if s_name in new_sessions_dict:
                existing_sessions.append(new_sessions_dict[s_name])
        controler_data["system_status"]["last_sync"] = datetime.now().isoformat()
        save_yaml(CONTROLER_PATH, controler_data, header="# 🛡️ CONTROLER - OPERATIONAL HUB")
        print(f"[+] Updated {CONTROLER_PATH.name}")

if __name__ == "__main__":
    sync()
    print("[!] Sync Complete.")
