# 🔄 Orchestration & Flow — 10-Step Execution
> **Version:** 5.1 | Status: Automated Sync Protocol Integrated

**Purpose:** Strict deterministic 10-step execution flow with input/output/gate contracts for every step.
**When to use:** Consult during any non-trivial task to confirm you've satisfied the gate of the current step before advancing, and during Step 2/Step 10 to trigger the sync engine.

This document outlines the strict deterministic 10-step execution flow for the Agentic OS v5, with rigorous verification gates and step contracts.

---

## 10-Step Contracts & Gates

Every step declares what it needs (inputs), what it produces (outputs), and what must be true to proceed (gate). If a gate fails, the step must fallback or escalate.

| Step | Inputs | Outputs | Gate (must be true to proceed) | On Fail |
|------|--------|---------|-------------------------------|---------|
| **1. Boot** | `.meta_brain/` directory | `identity{}` | `Persona.md` exists, `meta_router.yaml` is parsed. | ❌ HALT — brain broken |
| **2. State** | `CONTROLER.yaml` | `state{}` + `session{}` | `work_mode` valid, `action_gate` valid. **Session resolved.** | ❌ HALT — no state |
| **3. Task Resolution** | User prompt OR `state.goals[]` | `task{}` | `task.topic` is not empty. | ⏳ WAIT or **Blocker Triage** |
| **4. Context Scan** | `task{}` + `meta_router.yaml` | `context_scan[]` | — | ✅ PROCEED even if empty |
| **5. Goal Mgmt** | `task{}` + `context_scan[]` | `goal{}` | Goal exists in `.meta_brain/milestones/` | ❌ RETRY creation. |
| **6. Context Deep** | `goal{}` | `context_deep[]` | Goal folder exists in `.meta_brain/milestones/[SESSION]/[GOAL]/` | ✅ PROCEED even if empty |
| **7. Planning** | `goal{}` + context | `execution_plan{}` | Execution plan is formulated | 📝 CREATE plan. If fail → ESCALATE |
| **8. Route** | `execution_plan{}` + maps | `route{}` | ≥1 toolbox or pipeline matched via `meta_router.yaml` | 🔍 EXPAND search. |
| **9. Execute** | `route{}` + context | `result{}` | All `inputs` present before run. | 🔄 RETRY. |
| **10. Sync** | `result{}` | Sync actions | `CONTROLER.yaml` write succeeded. **Trigger `meta_sync.py` to re-assemble all routers.** | ❌ RETRY. |

---

## Session Management & Sync Engine (Step 2 & 10)

At boot and after every major operation, the agent MUST execute the **Sync Engine v5.3 Protocol**:

### 🛡️ Pre-Execution Sync
The agent MUST run the master sync via the cross-platform launcher to ensure all routers and milestones are synchronized with the on-disk state:
- Windows: `.\.meta_runtime\venv\meta_run.ps1 .meta_brain\meta_sync.py`
- Linux/macOS: `./.meta_runtime/venv/meta_run.sh .meta_brain/meta_sync.py`

For read-only drift detection (no mutations): append `--validate`.

### 🏷️ Naming Integrity (Step 5)
- **Sessions:** Follow the `SES-[ENTITY]-[ROLE]-[SUBJECT]` pattern when no clear sibling exists; otherwise mirror the closest sibling's pattern.
- **Goals:** Follow the `GOAL-[NAME]` pattern.
- **Numeric suffixes** are flagged by the milestones engine as anti-patterns.

### 🔄 Sync Components
- **meta_runtime_sync**: Verifies environment health and `.venv` pathing.
- **milestones_sync**: Enforces naming patterns and calculates `overall_health` (penalises blocked goals AND stale-pending goals).
- **toolboxes_sync**: Scans capability metadata, counts agents/skills, auto-tags empty toolboxes as `placeholder: true`.
- **pipelines_sync**: Reads each pipeline router's `engine` block (sync_script + state_file) and triggers the per-pipeline sync.
- **projects_sync**: Auto-catalogs standalone codebases.

### 🎬 Session Lifecycle
1. **START** → Generate a role-based session name. Create `.meta_brain/milestones/[SESSION_NAME]/` and its `SESSION.yaml`.
2. **WORK** → Update progress and statuses. Trigger `meta_sync.py` during Step 10.
3. **END** → Run a final sync. Move completed sessions to `.milestones_archive/`.

---

## Output Placement & Gate Logging

- **Events** → `CONTROLER.yaml` (`recent_events`)
- **Details & Artifacts** → Stored in the goal directory: `.meta_brain/milestones/[SESSION_ID]/[GOAL_ID]/`
- **Extra Files** → Use `artifacts/` sub-folder for produced deliverables.
