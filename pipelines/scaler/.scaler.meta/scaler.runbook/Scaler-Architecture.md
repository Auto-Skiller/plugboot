# 🏗️ Scaler Architecture

## Objective
Systemic Metabolism. The Scaler pipeline is the **Systemic Growth Engine** of the Agentic OS. Its mission is the continuous evaluation, enhancement, and extension of the workspace scopes. It utilizes a **5-Phase Execution Approach** (Discovery -> Mapping & Tracking -> Capability Engineering -> Architecting & Proposing -> Integration) to identify gaps or ingest external data, map and track them, engineer capabilities, architect proposals, and integrate permanent solutions across the entire architecture.

---

## 1. Pipeline Execution Layers
The Scaler pipeline execution strictly utilizes the global "Always-On" top-layer alongside localized pipeline layers:

### Global Always-On Layers (Must always be used for EVERY task)
- `.identity/`: Core identity, routing rules, and execution flow.
- `meta.router/` & `meta.router.yaml`: Central nervous system maps. All execution paths start here.
- `CONTROLER.yaml`: High-level configuration, scope modes, and session tracking.
- `.mission_board/[execution session]`: Active goal tracking via the Persistent Execution Sessions (e.g., `SES-EXECUTION-SCALER`).
- `scaler.router`: The localized index, mapping everything inside `.scaler.meta/`. Acts as the absolute pathfinder for the pipeline.
- `.toolbox_library/`: Core agentic and extended capabilities. **Toolboxes must be strictly used via meta routing during every single action in the pipeline execution (e.g., using specific tools for analytics, planning, drafting).**

### Localized Pipeline Layers (Mapped via meta.router)
- `scaler.runbook/`: The operational rules and workflows for scaling that need to be strictly read before any scaler execution (similar to `.identity/`).
- `scaler.scratch/`: Operational scripts and automation engines for the scaler. Not for drafting proposals or processing data.
- `scaler.tracker/`: Deep, granular tracking of every file, gap, and proposal processed during pipeline execution (similar to `meta.router/` mappings and `.mission_board/` trackers).

---

## 2. Inputs (Modes) & Outputs (Levels)
Controlled via `CONTROLER.yaml` configuration.

### 2 Input Modes (+ AUTO)
1. **INTERNAL**: Scan internal architectures and systems to identify systemic gaps and enhancement opportunities. Propose permanent solutions.
2. **EXTERNAL**: Scan external folders for new data. Draft proposals based on external discoveries.
3. **AUTO**: System intelligently uses both INTERNAL and EXTERNAL based on state and availability.

### 3 Output Levels
1. **ARCHITECTURE**: Modifying or Enhancing structure and systems, organization..
2. **CAPABILITYS**: Enhancing, extending or adding tools, skills, or agents...
3. **BUSSINESS**: Monetization, value extraction, or business logic. Look for any opportunity that can make actual money...

---

## 3. The Aspects of open-workspace
Any identified gap, discovery, proposal, or solution maps to one or more of these 6 core aspects:
1. `routing_and_syncing`
2. `identity`
3. `mission_board_and_controller`
4. `toolbox_library`
5. `pipeline_scaler`
6. `pipeline_hustler`

*Note: Scaler operations should span multiple aspects if necessary (e.g., updating `toolbox_library` architecture also requires updating `routing_and_syncing`).*

> **SCOPE CREATION LAW**: The Scaler MUST NOT create new scopes (aspects) autonomously. If a discovery or gap analysis reveals that a new scope is needed, the Scaler MUST suggest it in the `CONTROLER.yaml` communication block and await explicit user approval before creating or naming a new scope. This law holds regardless of the active `action_gate` mode.

---

## 4. The Proposals & Solutions Gateway (MANDATORY)

**Every single output of the Scaler — without exception — MUST pass through the gateway folders before being integrated into any target scope.** There is no direct path from discovery/analysis to integration. The gateway is the mandatory checkpoint.

### 4.1 External Gateway → `EXTERNAL/proposals/`
Used for: external direct integrations (moving skill folders, ready-to-use agents, external repos) and external inspirations (things taken from discoveries to add to or change existing files/architecture).

**Flow:**
1. Item is found in `EXTERNAL/discoveries/`.
2. Scaler analyzes and drafts a **Proposal Card** in `EXTERNAL/proposals/[aspect]/[level]/`.
3. Proposal Card must contain:
   - `source`: origin file or folder in discoveries.
   - `target_scope`: the exact aspect and destination path.
   - `integration_type`: `DIRECT_MOVE` | `ADAPT_AND_INTEGRATE` | `PARTIAL_EXTRACT` | `ARCHITECTURE_AUDIT`.
   - `description`: what will be done and why.
   - `files_involved`: list of all files/folders that will move or change.
   - `user_decision`: field for user to fill — `APPROVED` | `REJECTED` | `NOTES: [user text]`.
4. If `NOTES` found → apply notes, update proposal, then re-request approval.
5. If `APPROVED` → proceed to integration.

### 4.2 Internal Gateway → `INTERNAL/solutions/`
Used for: internal gaps, proposed changes to existing files, plans to audit or restructure existing architecture.

**Flow:**
1. Gap or opportunity is identified during internal audit.
2. Scaler drafts a **Solution Card** in `INTERNAL/solutions/[aspect]/[level]/`.
3. Solution Card must contain:
   - `gap_ref`: reference to the gap report in `INTERNAL/gaps/`.
   - `target_scope`: the exact aspect and files that will change.
   - `change_type`: `FILE_EDIT` | `STRUCTURAL_REFACTOR` | `NEW_FILE` | `ARCHITECTURE_AUDIT`.
   - `description`: what will be changed and why.
   - `files_involved`: list of all files that will be modified or created.
   - `user_decision`: field for user to fill — `APPROVED` | `REJECTED` | `NOTES: [user text]`.
4. If `NOTES` found → apply notes, update solution, then re-request approval.
5. If `APPROVED` → proceed to integration.

---

## 5. Planning vs. Execution Mode Behavior

The `action_gate` in `CONTROLER.yaml` controls how the Scaler behaves **after a proposal or solution passes through the gateway**:

| action_gate | Behavior |
|---|---|
| **EXECUTION** | After a proposal/solution is drafted in its gateway folder, the Scaler **directly integrates** it without requesting additional human approval. The gateway folder is the only checkpoint. |
| **PLANNING** | After a proposal/solution is drafted in its gateway folder, it **stays in the folder**. The Scaler posts a review request in the `CONTROLER.yaml` communication block. Integration only happens after explicit user approval. |

> **Note**: In ALL modes, the `user_decision` field in every Proposal/Solution Card must be present. In EXECUTION mode, the Scaler may auto-set it to `APPROVED` after self-review. In PLANNING mode, the field must be filled by the user.
