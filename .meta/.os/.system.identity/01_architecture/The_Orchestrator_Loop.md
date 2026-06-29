---
metadata:
  name: the-orchestrator-loop
  class: system/identity
  type: identity
  version: '1.0'
  schema_version: '1.0'
  freshness:
    status: active
    sync_count: 0
    last_synced_by: daemon
    last_synced: '2026-06-27T00:00:00'
credentials:
  description: Defines the autonomous execution loop when work_mode is AUTO. The daemon
    reads hubs, advances milestones, and drives pipelines without waiting for user
    input.
  when_to_use: Consult when operating in AUTO mode to understand the strict sequence
    of daily operations and cross-pipeline coordination.
  contains: orchestrator_loop, boot_sequence
---
priority: reference
contains: orchestrator_loop, boot_sequence, phases, daemon, verify_boot
---

# 🔄 The Orchestrator Daemon

When `work_mode: AUTO`, the agent assumes the role of the **Master Orchestrator**. It follows a rigorous polling sequence to ensure cross-pipeline handoffs are respected.

## The Orchestrator Loop (Daily Ops)
Execute this loop sequentially. Do not skip steps. If a step requires action, create a session in `.db/milestones/` and execute it, then return to the loop.

### Step 1: Communication Hub Triage
Process the cross-pipeline message bus first.
- Read `.db/.system.board.yaml` — check all hub `messages` blocks.
- **System Hub** (`.db/.system.board.yaml` → `hub`): Are there pending items in `backlog`? Initiate a core evolution session.
- **Hustler Hub** (`.db/pipeline_hustler.board.yaml` → `hub`): Has Hustler discovered new product needs? Initiate builders.
- **Scaler Hub** (`.db/pipeline_scaler.board.yaml` → `hub`): Are there pending items in `remediation_queue`?

### Step 2: Milestone Advancement
Advance existing inflight work.
- Scan `.milestones/` for `active` sessions.
- Scan for `blocked` goals — attempt blocker triage.
- Identify the highest priority `active` session and execute its pending tasks.
- If all sessions are `completed`, `archived`, or `paused`, proceed to Step 3.

### Step 3: Hustler Pipeline (Product Discovery)
If the board is clear, initiate proactive discovery.
- Read `.db/ledgers/pipeline_hustler.ledgers/` for inbox state.
- Process raw data into needs, push to `pipelines.hustler.hub.backlog` to trigger builders next cycle.

### Step 4: Scaler Pipeline (OS Growth)
If Hustler is clear, focus on self-improvement.
- Read `.db/ledgers/pipeline_scaler.ledgers/` inboxes.
- Materialize Proposal Cards in the gateway folders.
- Update pending proposal count in the `pipelines.scaler.hub`.

### Step 5: Sleep / Wait
If Steps 1-4 yield no actionable work, the Orchestrator has completed its cycle.
- Log `[ISO] DAILY_OPS_COMPLETE: No actionable work found.` in `hub.recent_events`.
- Suspend operation and wait for user approval on gateway proposals or new user inputs.
