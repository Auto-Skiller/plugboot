# 🏗️ Scaler Architecture

## 1. Objective: Systemic Metabolism
The Scaler pipeline is the **Systemic Growth Engine** of the Agentic OS. Its mission is the continuous evaluation, enhancement, and extension of the workspace scopes. It identifies gaps or ingests external data to propose and implement permanent solutions across the entire architecture.

---

## 2. Pipeline Execution Layers
The Scaler pipeline execution strictly utilizes the global "Always-On" top-layer alongside localized pipeline layers:

### Global Always-On Layers (Must always be used for EVERY task)
- `.identity/`: Core identity, routing rules, and execution flow.
- `meta.router/` & `meta.router.yaml`: Central nervous system maps. All execution paths start here.
- `CONTROLER.yaml`: High-level configuration, scope modes, and session tracking.
- `mission_board/[execution session]`: Active goal tracking via the Persistent Execution Sessions (e.g., `SES-EXECUTION-SCALER`).
- `scaler.router`: The localized index, mapping everything inside `.scaler.meta/`. Acts as the absolute pathfinder for the pipeline.
- `toolbox_library/`: Core agentic capabilities. **Toolboxes must be strictly used via meta routing during every single action in the pipeline execution (e.g., using specific tools for analytics, planning, drafting).**

### Localized Pipeline Layers (Mapped via meta.router)
- `scaler.runbook/`: The operational rules and workflows for scaling (similar to `.identity/`).
- `scaler.scratch/`: Operational scripts and automation engines for the scaler (similar to `.sync_engine/`). Not for drafting proposals or processing data.
- `scaler.tracker/`: Deep, granular tracking of every file, gap, and proposal processed during pipeline execution (similar to `meta.router/` mappings and `mission_board/` trackers).

---

## 3. Inputs (Modes) & Outputs (Levels)
Controlled via `CONTROLER.yaml` configuration.

### 2 Input Modes (+ AUTO)
1. **INTERNAL**: Scan internal architectures to identify systemic gaps. Propose permanent solutions.
2. **EXTERNAL**: Scan external folders for new data. Draft proposals based on external discoveries.
3. **AUTO**: System intelligently switches between INTERNAL and EXTERNAL based on state and backlog.

### 3 Output Levels (+ AUTO)
1. **ARCHITECTURE**: Modifying structure, organization, or routing.
2. **CAPABILITYS**: Enhancing tools, skills, or agentic engines.
3. **BUSSINESS**: Monetization, value extraction, or business logic.
4. **AUTO**: Automatically categorizes the output level.

---

## 4. The Aspects of open-workspace
Any identified gap, discovery, proposal, or solution maps to one or more of these core aspects:
1. `syncing`
2. `routing`
3. `identity`
4. `mission_board_and_controller`
5. `toolbox_library`
6. `[spesific-pipeline]_meta`
7. `[spesific-pipeline]_runbook`
8. `[spesific-pipeline]_scratch`
9. `[spesific-pipeline]_tracker`
10. `[spesific-pipeline]_execution`

*Note: Scaler operations should span multiple aspects if necessary (e.g., updating `toolbox_library` architecture also requires updating `routing` and `syncing`).*
