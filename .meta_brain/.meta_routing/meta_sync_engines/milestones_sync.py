import os
import sys
import shutil
import pathlib
import re
from datetime import datetime
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent
MISSION_BOARD_DIR = WORKSPACE_ROOT / ".meta_brain" / "milestones"
ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "milestones.yaml"
SCHEMA_PATH = pathlib.Path(__file__).parent / "milestones_schemas.yaml"

ARCHIVE_DIR = MISSION_BOARD_DIR / ".milestones_archive"

def validate(data, schema):
    """
    Validates a data dictionary against a schema dictionary.
    Supports nested dicts, lists, enums (pipe-separated), and basic types.
    Returns (is_valid, error_message).
    """
    if isinstance(schema, dict):
        if not isinstance(data, dict):
            return False, f"Expected dict, got {type(data).__name__}"
        for key, type_def in schema.items():
            if key not in data:
                return False, f"Missing required key: {key}"
            valid, err = validate(data[key], type_def)
            if not valid:
                return False, f"{key} -> {err}"
        return True, ""
        
    elif isinstance(schema, list):
        if not isinstance(data, list):
            return False, f"Expected list, got {type(data).__name__}"
        if len(schema) > 0:
            type_def = schema[0]
            for i, item in enumerate(data):
                valid, err = validate(item, type_def)
                if not valid:
                    return False, f"Index {i} -> {err}"
        return True, ""
        
    elif isinstance(schema, str):
        if schema == "string":
            if not isinstance(data, str):
                return False, f"Expected string, got {type(data).__name__}"
            if not data.strip():
                return False, f"Field is empty"
        elif schema == "timestamp":
            if not isinstance(data, str):
                return False, f"Expected timestamp string, got {type(data).__name__}"
        elif schema == "string | dict":
            if not isinstance(data, (str, dict)):
                return False, f"Expected string or dict, got {type(data).__name__}"
            return True, ""
        
        if "|" in schema:
            allowed = [s.strip() for s in schema.split("|")]
            if str(data) not in allowed:
                return False, f"Value '{data}' not in allowed list: {allowed}"
            return True, ""
        
        return True, ""
        
    return True, ""
HISTORY_LOG_PATH = ARCHIVE_DIR / "milestones_history.yaml"

def load_schema_from_yaml(yaml_path, schema_key):
    if not yaml_path.exists(): return None
    with open(yaml_path, "r", encoding="utf-8") as f:
        data = yaml.load(f)
    if not data: return None
    schema_str = data.get(schema_key)
    if not schema_str: return None
    # Parse the schema string as YAML
    from ruamel.yaml import YAML as YAML_safe; return YAML_safe(typ='safe').load(schema_str)

VALID_SESSION_STATUSES = {"active", "paused", "completed", "archived"}
VALID_GOAL_STATUSES = {"pending", "in-progress", "blocked", "done", "archived"}
DONE_STATUSES = {"done", "archived"}

def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def save_yaml(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: yaml.dump(data, f)

def now_iso(): return datetime.now().isoformat()

def append_log_event(event: dict, dry_run: bool):
    if dry_run: return
    log = load_yaml(HISTORY_LOG_PATH) or {"events": []}
    if "events" not in log: log["events"] = []
    log["events"].append(event)
    save_yaml(HISTORY_LOG_PATH, log)

def compute_progress(tasks):
    if not tasks: return "0%"
    done = sum(1 for t in tasks if isinstance(t, dict) and t.get("status") in DONE_STATUSES)
    return f"{int((done / len(tasks)) * 100)}%"

def compute_overall_health(sessions_found) -> str:
    all_goals = []
    for s in sessions_found.values():
        all_goals.extend(s.get("goals", []))
    
    blocked_count = sum(1 for g in all_goals if (g.get("status") or "").split()[0] == "blocked")
    # Health starts at 100%, drops 10% for each blocked goal
    health = max(0, 100 - (10 * blocked_count))
    return f"{health}%"

def should_auto_archive(session_data, goals_data):
    status = (session_data.get("metadata", {}).get("status", "") or "").split()[0]

    # NEW LOGIC: A round should only increase (or be evaluated for persistence/archiving)
    # if ALL session goals are marked completed/done 100%. If they are not, they should continue in same round.
    if not goals_data:
        all_completed = True
    else:
        all_completed = all((g.get("metadata", {}).get("status", "") or "").split()[0] in DONE_STATUSES for g in goals_data)

    if not all_completed:
        return False

    if status != "completed": return False

    return True

def archive_session(session_dir, dry_run):
    timestamp = datetime.now().strftime("%Y%m%d")
    archive_target = ARCHIVE_DIR / f"{session_dir.name}_{timestamp}"
    if dry_run:
        print(f"  [DRY-RUN] Would archive {session_dir.name} \u2192 _archive/{archive_target.name}")
        return
    shutil.copytree(str(session_dir), str(archive_target))
    shutil.rmtree(str(session_dir))
    print(f"  [AUTO-ARCHIVE] {session_dir.name} \u2192 _archive/{archive_target.name}")
    append_log_event({
        "ts": now_iso(),
        "type": "SESSION_ARCHIVED",
        "session": session_dir.name,
        "note": "auto-archived \u2014 all goals completed"
    }, dry_run=False)

def validate_naming(name, is_session=True):
    if is_session:
        if not name.startswith("SES-"):
            print(f"  [WARN] Naming violation: Session '{name}' must start with 'SES-'.")
        if any(char.isdigit() for char in name.split("-")[-1]):
            # Check for trailing numeric suffixes like -001
            if re.search(r"-\d+$", name):
                print(f"  [WARN] Naming violation: Session '{name}' uses a prohibited numeric suffix.")
    else:
        if not name.startswith("GOAL-"):
            print(f"  [WARN] Naming violation: Goal '{name}' must start with 'GOAL-'.")
        if re.search(r"-\d+$", name):
            print(f"  [WARN] Naming violation: Goal '{name}' uses a prohibited numeric suffix.")

def sync_milestones(dry_run=False):
    print("\n[*] Synchronizing milestones.yaml...")
    session_schema = load_schema_from_yaml(ROUTER_PATH, "session_schema")
    goal_schema = load_schema_from_yaml(ROUTER_PATH, "goal_schema")
    warnings_found = False
    if not MISSION_BOARD_DIR.exists():
        print("  [WARN] .meta_brain/milestones/ directory not found.")
        return

    sessions_found = {}
    all_goals_flat = []

    for item in sorted(MISSION_BOARD_DIR.iterdir()):
        if not item.is_dir() or item.name.startswith("_") or item.name.startswith("."): continue
        validate_naming(item.name, is_session=True)
        session_yaml = item / "SESSION.yaml"
        if not session_yaml.exists(): continue
        session_data = load_yaml(session_yaml)
        if not session_data: continue

        # Validate against schema
        if session_schema:
            is_valid, err = validate(session_data, session_schema)
            if not is_valid:
                print(f"  [WARN] Session {item.name} failed schema validation: {err}")
                warnings_found = True

        s_status = session_data.get("metadata", {}).get("status", "active")
        goals_raw_data = []
        goals_for_router = []

        for subitem in sorted(item.iterdir()):
            if not subitem.is_dir() or subitem.name.startswith(".") or subitem.name.startswith("_"): continue
            if not subitem.name.startswith("GOAL-"):
                print(f"  [WARN] Folder '{subitem.name}' in session '{item.name}' is not a valid Goal (missing 'GOAL-' prefix).")
                warnings_found = True
                continue
            validate_naming(subitem.name, is_session=False)
            goal_yaml = subitem / "GOAL.yaml"
            if not goal_yaml.exists(): continue
            goal_data = load_yaml(goal_yaml)
            if not goal_data: continue

            # Validate against schema
            if goal_schema:
                is_valid, err = validate(goal_data, goal_schema)
                if not is_valid:
                    print(f"  [WARN] Goal {subitem.name} failed schema validation: {err}")
                    warnings_found = True

            g_status = goal_data.get("metadata", {}).get("status", "pending")
            tasks = goal_data.get("execution", {}).get("plan", {}).get("tasks", [])
            progress = compute_progress(tasks)

            if not dry_run:
                if "execution" not in goal_data: goal_data["execution"] = {}
                if "state" not in goal_data["execution"]: goal_data["execution"]["state"] = {}
                goal_data["execution"]["state"]["progress_percentage"] = progress
                save_yaml(goal_yaml, goal_data)

            # Extract artifacts and scratch files
            artifacts = goal_data.get("execution", {}).get("state", {}).get("artifacts", [])
            
            goals_raw_data.append(goal_data)
            all_goals_flat.append(goal_data)
            goals_for_router.append({
                "name": subitem.name,
                "summary": goal_data.get("metadata", {}).get("description", ""),
                "status": g_status,
                "priority": goal_data.get("metadata", {}).get("priority", "MEDIUM"),
                "progress_percentage": progress,
                "blocked": g_status.split()[0] == "blocked",
                "folder_path": str(subitem.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
                "yaml_path": str(goal_yaml.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
                "artifacts": artifacts
            })

        # Ensure SESSION.yaml execution -> active_goals is updated
        discovered_goal_names = [g["name"] for g in goals_for_router]
        if "execution" not in session_data:
            session_data["execution"] = {}
        if session_data["execution"].get("active_goals") != discovered_goal_names:
            session_data["execution"]["active_goals"] = discovered_goal_names
            if not dry_run:
                save_yaml(session_yaml, session_data)
                print(f"  [+] Updated active_goals in {item.name}/SESSION.yaml")

        if should_auto_archive(session_data, goals_raw_data):
            persistence = session_data.get("metadata", {}).get("persistence", {})
            if persistence and persistence.get("enabled", False):
                current_round = persistence.get("current_round", 1)
                max_rounds = persistence.get("max_rounds", "unlimited")

                if max_rounds == "unlimited" or current_round < max_rounds:
                    # Reset session
                    session_data["metadata"]["status"] = "active"
                    session_data["metadata"]["persistence"]["current_round"] = current_round + 1
                    save_yaml(session_yaml, session_data)
                    s_status = "active"

                    # Reset goals
                    for subitem in sorted(item.iterdir()):
                        if not subitem.is_dir() or subitem.name.startswith(".") or subitem.name.startswith("_"): continue
                        if not subitem.name.startswith("GOAL-"): continue
                        goal_yaml = subitem / "GOAL.yaml"
                        if not goal_yaml.exists(): continue
                        goal_data = load_yaml(goal_yaml)
                        if not goal_data: continue

                        goal_data["metadata"]["status"] = "pending"
                        if "execution" in goal_data and "plan" in goal_data["execution"] and "tasks" in goal_data["execution"]["plan"]:
                            for task in goal_data["execution"]["plan"]["tasks"]:
                                task["status"] = "pending"
                        if "execution" in goal_data and "state" in goal_data["execution"]:
                            goal_data["execution"]["state"]["progress_percentage"] = "0%"
                        save_yaml(goal_yaml, goal_data)

                        # Update goals_for_router for this item so that progress correctly computes
                        for g in goals_for_router:
                            if g["name"] == subitem.name:
                                g["status"] = "pending"
                                g["progress_percentage"] = "0%"

                    append_log_event({
                        "ts": now_iso(),
                        "type": "SESSION_ROUND_INCREMENTED",
                        "session": item.name,
                        "note": f"Completed round {current_round}, moving to round {current_round + 1}"
                    }, dry_run=False)
                    print(f"  [PERSISTENCE] Session {item.name} completed round {current_round}. Started round {current_round + 1}.")
                else:
                    session_data["metadata"]["status"] = "pended"
                    save_yaml(session_yaml, session_data)
                    s_status = "pended"
                    print(f"  [PERSISTENCE] Session {item.name} reached max rounds ({max_rounds}). Status set to pended.")
                    append_log_event({
                        "ts": now_iso(),
                        "type": "SESSION_PENDED",
                        "session": item.name,
                        "note": f"Reached max rounds ({max_rounds})"
                    }, dry_run=False)
            else:
                archive_session(item, dry_run)
                continue


        total_goals = len(goals_for_router)
        done_goals = sum(1 for g in goals_for_router if g["status"].split()[0] in DONE_STATUSES)
        s_progress = f"{int((done_goals / total_goals) * 100)}%" if total_goals else "0%"

        sessions_found[item.name] = {
            "summary": session_data.get("execution", {}).get("summary", ""),
            "pipeline": session_data.get("metadata", {}).get("pipeline", "unknown"),
            "status": s_status,
            "priority": session_data.get("metadata", {}).get("priority", "MEDIUM"),
            "progress_percentage": s_progress,
            "folder_path": str(item.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
            "yaml_path": str(session_yaml.relative_to(WORKSPACE_ROOT)).replace("\\", "/"),
            "goals": goals_for_router
        }
        print(f"  [OK]  {item.name}")

    # Health Calculation
    overall_health = compute_overall_health(sessions_found)

    # Index for fast lookup
    index_data = {
        "generated_at": now_iso(),
        "overall_health": overall_health,
        "sessions": {name: {"status": info["status"], "progress": info["progress_percentage"], "goal_count": len(info["goals"])} for name, info in sessions_found.items()},
        "goals": {g["name"]: {"status": g["status"], "progress": g["progress_percentage"], "blocked": g["blocked"]} for s in sessions_found.values() for g in s["goals"]}
    }

    milestones_data = load_yaml(ROUTER_PATH) or {
        "name": "milestones_router",
        "schema_version": "1.0",
        "description": "Catalogs all active execution sessions and goals.",
    }
    milestones_data["generated_at"] = now_iso()
    milestones_data["index"] = index_data
    milestones_data["sessions"] = sessions_found

    if dry_run:
        print(f"  [DRY-RUN] Would update milestones.yaml (Health: {overall_health})")
    else:
        save_yaml(ROUTER_PATH, milestones_data)
        print(f"[+] Updated milestones.yaml (Health: {overall_health})")
        
    return not warnings_found

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    ok = sync_milestones(dry_run)
    sys.exit(0 if ok else 1)
