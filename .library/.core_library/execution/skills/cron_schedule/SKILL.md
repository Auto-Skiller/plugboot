# SKILL: cron_schedule

**Engine:** `execution` (Custom Python Daemon)
**Runtime:** Python (Lightweight)
**Trigger:** `/cron-schedule` or running the `daemon.py`

## What This Skill Does

A highly lightweight, zero-dependency Python daemon that executes recurring tasks (like nightly graph rebuilds or workspace cleanup). Replaces the need for heavy frameworks like Dagster.

## Execution

```bash
# Start the scheduler daemon in the background:
python .library/.core_library/execution/skills/cron_schedule/scripts/daemon.py
```

## Adding Tasks

To add a new scheduled task, simply edit `scripts/daemon.py` and define the job. The daemon supports simple intervals (e.g., every 24 hours, every 60 minutes) or specific daily times.

Example job in the daemon:
```python
def rebuild_graph():
    print("Rebuilding workspace graph...")
    subprocess.run(["python", ".library/.core_library/graph/skills/graph_update/scripts/update.py", "."], check=True)

# Run every night at 2 AM
schedule.every().day.at("02:00").do(rebuild_graph)
```

## When To Use

- Nightly `cartographer` map rebuilds.
- Automated cleanup of stale git worktrees (`workflow_isolate cleanup`).
- Daily syncs or backups.

## Anti-Patterns
- DO NOT use this for complex dependency chains (e.g. "Task B runs only if Task A succeeds"). For that, define an Archon YAML workflow (`workflow_design`) and schedule the *workflow* via the cron daemon.
