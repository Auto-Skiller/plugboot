# 🔄 The Orchestrator Daemon

When `system.auto_mode: true` (in `config.yaml`), the daemon assumes the role of the **Master Orchestrator**. It follows a rigorous polling sequence to ensure cross-pipeline handoffs are respected.

## The Orchestrator Loop (Daily Ops)
Execute this loop sequentially. Do not skip steps. If a step requires action, create a task in the relevant mission in `system-board.yaml` and execute it, then return to the loop.

### Step 1: Communication Hub Triage
Process the cross-pipeline message bus first by checking the `hub` in `system-board.yaml` and `<project>-board.yaml`.
- **System Hub** (`system-board.yaml` → `hub`): Are there pending items in `review_queue`? Address them.
- **Project Hubs**: Check project boards for pending items in their respective `fill_queue` or `review_queue`.

### Step 2: Mission Advancement
Advance existing inflight work.
- Scan boards for `active` missions.
- Scan for `blocked` goals or tasks — attempt blocker triage.
- Identify the highest priority `active` mission and execute its pending tasks.
- If all missions are `completed`, `archived`, or `paused`, proceed to Step 3.

### Step 3: Hustler Pipeline (Product Discovery)
If the board is clear, initiate proactive discovery if Hustler is active for the entity.
- Read the relevant pipeline ledgers for inbox state.
- Process raw data into needs, push to `hub.backlog` to trigger builders next cycle.

### Step 4: Scaler Pipeline (OS Growth)
If Hustler is clear, focus on self-improvement using Scaler.
- Read the relevant pipeline ledgers for inbox state.
- Materialize Proposal Cards in the gateway folders.
- Update pending proposal count.

### Step 5: Sleep / Wait
If Steps 1-4 yield no actionable work, the Orchestrator has completed its cycle.
- Log `[ISO] DAILY_OPS_COMPLETE: No actionable work found.` in `live_state.recent_events`.
- Suspend operation and wait for user approval on gateway proposals or new user inputs.
