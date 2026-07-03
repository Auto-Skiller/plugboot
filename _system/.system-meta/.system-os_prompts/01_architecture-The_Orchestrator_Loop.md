# 🔄 The Orchestrator Daemon

When `system.auto_mode: true` (in `config.yaml`), the daemon assumes the role of the **Master Orchestrator**. It follows a rigorous polling sequence to ensure cross-pipeline handoffs are respected.

## The Orchestrator Loop (Daily Ops)
Execute this loop sequentially. Do not skip steps. If a step requires action, create a task in the relevant mission in `system-board.yaml` and execute it, then return to the loop.

### Step 1: Communication Hub Triage
Process the cross-pipeline message bus first by checking the `state` and `freshness.fill_queue` in `system-board.yaml` and `<project>-board.yaml`.
- **System Hub** (`system-board.yaml` → `state`): Are there pending items in `review_queue`? Address them.
- **Project Hubs**: Check project boards for pending items in their respective `freshness.fill_queue` or `state.review_queue`.

### Step 2: Mission Advancement
Advance existing inflight work.
- Scan boards for `active` missions.
- Scan for `blocked` goals or tasks — attempt blocker triage.
- Identify the highest priority `active` mission and execute its pending tasks.
- If all missions are `completed`, `archived`, or `paused`, proceed to Step 3.

### Step 3: Pipeline Execution
If the board is clear, initiate proactive discovery and work generation by executing active pipelines.
- Iterate through `board.pipelines` where `status: on`.
- Execute each active pipeline by reading its specific logic and ledgers located in its `.shared-pipelines/<pipeline_name>` or `.meta/.pipelines/<pipeline_name>` directory.
- Check the pipeline's Runbooks to determine its precise loop mechanics and inbox state handling.

### Step 4: Sleep / Wait
If Steps 1-3 yield no actionable work, the Orchestrator has completed its cycle.
- Log `[ISO] DAILY_OPS_COMPLETE: No actionable work found.` in `state.recent_events`.
- Suspend operation and wait for user approval on gateway proposals or new user inputs.
