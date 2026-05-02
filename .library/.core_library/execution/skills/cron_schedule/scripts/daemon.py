"""
daemon.py — Substrate OS cron_schedule skill
A highly lightweight Python daemon for executing recurring OS maintenance tasks.
Replaces Dagster with zero dependencies (using standard lib or a lightweight schedule module).

Usage:
    pip install schedule
    python daemon.py
"""
import time
import subprocess
from datetime import datetime

try:
    import schedule
except ImportError:
    print("Error: 'schedule' package is required. Run: pip install schedule")
    exit(1)


# ==========================================
# DEFINE JOBS HERE
# ==========================================

def nightly_graph_rebuild():
    """Runs cartographer's graph_update on the workspace to keep the structural map fresh."""
    print(f"[{datetime.now().isoformat()}] Starting nightly graph rebuild...")
    try:
        # Assuming the command is run from the workspace root
        subprocess.run(
            ["python", ".library/.core_library/graph/skills/graph_update/scripts/update.py", "."],
            check=True
        )
        print(f"[{datetime.now().isoformat()}] Graph rebuild complete.")
    except subprocess.CalledProcessError as e:
        print(f"[{datetime.now().isoformat()}] ERROR during graph rebuild: {e}")

def cleanup_stale_worktrees():
    """Cleans up abandoned Archon git worktrees."""
    print(f"[{datetime.now().isoformat()}] Cleaning up stale worktrees...")
    # Add Archon cleanup command here when implemented
    pass


# ==========================================
# SCHEDULE REGISTRATION
# ==========================================

# Run graph rebuild every day at 02:00 AM
schedule.every().day.at("02:00").do(nightly_graph_rebuild)

# Cleanup worktrees every 12 hours
schedule.every(12).hours.do(cleanup_stale_worktrees)


if __name__ == "__main__":
    print(f"Substrate OS Scheduler Daemon started at {datetime.now().isoformat()}")
    print("Registered jobs:")
    for job in schedule.jobs:
        print(f" - {job}")
        
    print("\nRunning... (Press Ctrl+C to stop)")
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(60) # Sleep for a minute between checks
    except KeyboardInterrupt:
        print("\nScheduler daemon stopped.")
