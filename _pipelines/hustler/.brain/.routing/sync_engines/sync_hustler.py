import os
import sys
import pathlib
from ruamel.yaml import YAML

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent.parent.parent
HUSTLER_STATE_PATH = WORKSPACE_ROOT / "_pipelines" / "hustler" / ".brain" / ".routing" / "HUSTLER-STATE.yaml"

def load_yaml(path):
    if not path.exists(): return None
    with open(path, "r", encoding="utf-8") as f: return yaml.load(f)

def sync_hustler_state(dry_run=False):
    """Ensures HUSTLER-STATE.yaml exists and parses its state."""
    hustler_status = "idle"
    if HUSTLER_STATE_PATH.exists():
        try:
            hustler_state = load_yaml(HUSTLER_STATE_PATH)
            if hustler_state and "state" in hustler_state:
                hustler_status = hustler_state["state"].get("current_phase", "active")
        except Exception as e:
            print(f"  [WARN] Failed to parse HUSTLER-STATE.yaml: {e}")
            
    print(f"[HUSTLER] State is {hustler_status}")
    return hustler_status

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    sync_hustler_state(dry_run)
