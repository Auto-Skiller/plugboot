# 🔄 System Orchestrator Loop

**Location:** `.meta_brain/meta_identity/System-Orchestrator-Loop.md`
**Purpose:** Defines the daily autonomous execution loop for an Agent operating the Agentic OS in `work_mode: AUTO`.

When the system is in `AUTO` mode and an agent boots without a specific user prompt, the agent MUST assume the role of the **Master Orchestrator**. The Orchestrator does not blindly jump into the first session it sees. It follows a rigorous polling sequence to ensure cross-pipeline handoffs are respected and system health is maintained.

## The Orchestrator Loop (Daily Ops)

Execute this loop sequentially. Do not skip steps. If a step requires action, create a Goal on the `.meta_brain/milestones/` and execute it, then return to the loop.

### Step 1: Communication Hub Triage
The Orchestrator must process the cross-pipeline message bus first.
- **Action:** Read `CONTROLER.yaml` -> `communication_hubs`.
- **Logic:**
  - Check `scaler_hub`: Are there pending remediation tasks? 
  - Check `hustler_hub.product_gaps_queue`: Has Hustler discovered new product needs? If yes, execute handoff by generating a new entry in `projects.yaml` router and a `GOAL` to build it.
  - Check `core_hub.architecture_queue`: Are there system-level flaws blocking pipelines? If yes, initiate a `SES-CORE-EVOLUTION` to resolve them.
- **Completion:** Empty the queues by assigning them to active sessions or creating new ones.

### Step 2: Mission Board Advancement
The Orchestrator must advance existing inflight work.
- **Action:** Read `.meta_brain/.meta_routing/milestones.yaml`.
- **Logic:**
  - Scan for `blocked` goals. Attempt Blocker Triage. Can the blocker be resolved?
  - Identify the highest priority `active` session. 
  - Execute pending tasks for that session's goals.
- **Completion:** If all sessions are `completed`, `archived`, or `paused`, proceed to Step 3.

### Step 3: Hustler Pipeline (Product Discovery)
If the board is clear, the Orchestrator initiates proactive discovery.
- **Action:** Read `_pipelines/hustler/.hustler.meta/runbook/discovery.md`.
- **Logic:**
  - Scan Hustler inboxes for new data.
  - Process raw data into `[new-def]` and `[new-needs]`.
  - Push resulting `[new-needs]` to `hustler_hub.product_gaps_queue` in `CONTROLER.yaml` to trigger builders in the next cycle.
- **Completion:** Inbox is empty.

### Step 4: Scaler Pipeline (OS Growth)
If Hustler has nothing to process, the OS focuses on self-improvement.
- **Action:** Read `_pipelines/_scaler/.scaler_brain/scaler_runbooks/Scaler-Workflows.md`.
- **Logic:**
  - Scan Scaler `EXTERNAL/` and `INTERNAL/` inboxes.
  - Execute Phase 1 (Discovery) through Phase 4 (Proposing).
  - Materialize Proposal Cards in the gateway folders.
  - Run `meta_sync.py` to update the pending proposal count in `CONTROLER.yaml` for user review.
- **Completion:** Scaler inbox is empty.

### Step 5: Sleep / Wait
If Steps 1-4 yield no actionable work, the Orchestrator has completed its cycle.
- **Action:** Log "Daily Ops Complete" in `CONTROLER.yaml` `recent_events`.
- **Logic:** Suspend operation and wait for user approval on gateway proposals or new user inputs.
