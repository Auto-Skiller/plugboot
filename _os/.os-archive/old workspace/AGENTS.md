# 🤖 AGENTS

> [!IMPORTANT]
> This is the root pointer file for all agents landing in this workspace. It is the absolute authority for agent behavior, architecture structure, and initialization.
>
> The "Perfect System" is one where the workspace provides the **Senses** (os_prompts), the **Memory** (boards & indexes), and the **Muscles** (toolboxes & pipelines), while the agents provide the "Brain" to execute operations deterministically.

---

## 🛑 CRITICAL BOOT SEQUENCE
Before taking ANY action, you MUST execute these steps in exact order. Skipping steps is a protocol violation.

> **BOOT-00: Workspace Orientation**
> Read `index.yaml` (root level). This is the workspace map — it tells you where every entity, infrastructure folder, and key file lives. No guessing from here forward.

> **BOOT-01: Grounded Identity Initialization**
> Read **ALL** identity law files under `_system/.system-meta/.system-os_prompts/`. These are static operational laws — not optional context — and are mandatory every turn regardless of task. Read every file. No file may be skipped.

> **BOOT-02: Pre-flight Health Check**
> Verify structural integrity:
> 1. Read `config.yaml` — confirm all referenced entities exist on disk.
> 2. Read `_system/system-board.yaml` — confirm system state is populated.
> 3. Check that each project has its own board, index, meta, missions, and pipelines_runtime directories.
>
> If any check fails — **HALT IMMEDIATELY** and repair the flagged issue before proceeding.

> **BOOT-03: Load Entity State & Error Gate**
> Read `_system/system-board.yaml` and `_system/system-index.yaml`. These hold the active state, map every subsystem to its physical path, and track metrics.
> Immediately after reading, perform the **Error Gate**:
> 1. Cross-reference every path in `system-index.yaml` against disk. Any missing file is a CRITICAL error.
> 2. Cross-reference every entity in `config.yaml` against disk. Any missing folder is a CRITICAL error.
>
> If errors exist, treating and repairing them is your **ABSOLUTE HIGHEST PRIORITY** before executing any other task.

> **BOOT-04: Contextual Immersion (Conditional)**
> Load task-specific context in this order — skip any sub-step that does not apply:
> 1. **Pipeline context:** If the task involves a pipeline (Scaler, Hustler, etc.), read the relevant pipeline definition in `_shared/.shared-pipelines/` or the entity's own `.XXX-meta/.XXX-pipelines/`.
> 2. **Project context:** If the task involves a project, read `<project>/<project>-board.yaml` and `<project>/<project>-index.yaml`.
> 3. **System context:** If orchestrating or auditing, read `_system/system-board.yaml` and `_system/.system-meta/.system-os_prompts/`.

---

## ⚖️ CORE LAWS ENFORCED AT BOOT

> [!WARNING]
> You are bound by the following laws at all times:
> - **Zero-Drift Audit:** Always perform a fresh disk read of any file before editing it.
> - **Zero-Guess Law:** Never guess file paths. All paths must come from a board/index file or a physical directory listing.
> - **Logic Preservation Law:** During structural moves or refactors, NO existing logic may be deleted without explicit user confirmation and a no-loss warning.
> - **Portability Law:** All dependencies must be installed inside the workspace (`.stash/.venv/`).

---

## 🏛️ THE THREE LAYERS

### 1. `_shared/` — The Shared Library
Reusable resources available to **both** `_system/` and **any project**.
- **`_shared/.shared-pipelines/`** — Shared pipeline definitions (Scaler, Hustler, etc.). Each pipeline folder contains its runbooks, contracts, and logic. Pipelines are **blueprints** — they execute inside the consuming entity's `pipelines_runtime/` folder.
- **`_shared/.shared-toolboxes/`** — Shared toolbox domains (5 domains: `agentic/`, `business/`, `engineering/`, `life/`, `studio/`). Each contains skills and agents.
- **`_shared/schemas/`** — YAML schema definitions governing board, index, and config file structure.

### 2. `_system/` — The Always-On Orchestrator
The core operating system layer. It orchestrates, manages, and audits projects and itself.
- **`_system/system-board.yaml`** — System-level board: global control plane, holding `state` and `metrics`.
- **`_system/system-index.yaml`** — System-level index: maps all subsystems to their physical disk paths.
- **`_system/.system-meta/`** — System's own brains:
  - `.system-os_prompts/` — Identity laws and behavioral rules (10 files across architecture, behavior, state, execution).
  - `.system-pipelines/` — System-specific pipeline definitions (if any).
  - `.system-toolboxes/` — System-specific toolboxes (if any).
  - `system-archive/` — Archived system artifacts.
  - `system-scratch/` — Transient system drafts.
- **`_system/.system-missions/`** — System-level missions and goals.
- **`_system/.system-pipelines_runtime/`** — Where shared or system pipelines **execute** for system-level work.
  - `entity-scaler-runtime/` — Scaler runtime for system work
  - `entity-hustler-runtime/` — Hustler runtime for system work

### 3. `project_name/` — A Project (Bounded Codebase)
Each project is **self-contained** with its own complete infrastructure. Replace `project_name` with the actual project name.
- **`project_name/project_name.md`** — Project overview, stack, and entry point.
- **`project_name/project_name-board.yaml`** — Project board: local control plane with `state` and `metrics`.
- **`project_name/project_name-index.yaml`** — Project index: maps project subsystems to disk paths.
- **`project_name/.project_name-meta/`** — Project's own brains:
  - `.project_name-os_prompts/` — Project-specific rules and prompts.
  - `.project_name-pipelines/` — Project-specific pipeline definitions.
  - `.project_name-toolboxes/` — Project-specific toolboxes.
  - `.project_name-archive/` — Archived project artifacts.
  - `.project_name-scratch/` — Transient project drafts.
- **`project_name/.project_name-missions/`** — Project-specific missions and goals.
- **`project_name/.project_name-pipelines_runtime/`** — Where pipelines **execute** for this project.
  - `entity-scaler-runtime/` — Scaler runtime for this project
  - `entity-hustler-runtime/` — Hustler runtime for this project

---

## 🔧 INFRASTRUCTURE

| Path | Role |
|------|------|
| `.infra/backend/` | Sync engine (`engine.py`), boot supervisor (`boot.py`), daemon guard, verification scripts |
| `.infra/frontend/` | Dashboard UI (HTML/CSS/JS served on `:8000`) |
| `.stash/` | Runtime ephemeral: `.venv/`, `logs/`, `pids/`, `.env/` |
| `config.yaml` | Global config: modes per entity, profiles, action gates |

---

## 🔄 PIPELINE EXECUTION MODEL

Pipelines are **definitions** (blueprints), not execution folders. They live in:
- `_shared/.shared-pipelines/` — available to all entities
- `_system/.system-meta/.system-pipelines/` — system-only pipelines
- `<project>/.project_name-meta/.project_name-pipelines/` — project-only pipelines

When an entity (system or project) **uses** a pipeline, execution happens inside that entity's own `pipelines_runtime/` folder, in a named runtime folder per pipeline:

- System uses Scaler → executes in `_system/.system-pipelines_runtime/entity-scaler-runtime/`
- System uses Hustler → executes in `_system/.system-pipelines_runtime/entity-hustler-runtime/`
- Project uses Scaler → executes in `project_name/.project_name-pipelines_runtime/entity-scaler-runtime/`
- Project uses Hustler → executes in `project_name/.project_name-pipelines_runtime/entity-hustler-runtime/`

---

## 📂 ENTITY STRUCTURE CONVENTION

Every entity (_system or project) follows the same structural pattern:

| Component | System | Project |
|-----------|--------|---------|
| **Overview** | `_system/system.md` | `<project>/<project>.md` |
| **Board** | `_system/system-board.yaml` | `<project>/<project>-board.yaml` |
| **Index** | `_system/system-index.yaml` | `<project>/<project>-index.yaml` |
| **OS Prompts** | `_system/.system-meta/.system-os_prompts/` | `<project>/.<project>-meta/.<project>-os_prompts/` |
| **Pipelines (definitions)** | `_system/.system-meta/.system-pipelines/` | `<project>/.<project>-meta/.<project>-pipelines/` |
| **Toolboxes** | `_system/.system-meta/.system-toolboxes/` | `<project>/.<project>-meta/.<project>-toolboxes/` |
| **Missions** | `_system/.system-missions/` | `<project>/.<project>-missions/` |
| **Pipelines Runtime** | `_system/.system-pipelines_runtime/` | `<project>/.<project>-pipelines_runtime/` |
| **Scaler Runtime** | `_system/.system-pipelines_runtime/entity-scaler-runtime/` | `<project>/.<project>-pipelines_runtime/entity-scaler-runtime/` |
| **Hustler Runtime** | `_system/.system-pipelines_runtime/entity-hustler-runtime/` | `<project>/.<project>-pipelines_runtime/entity-hustler-runtime/` |
| **Archive** | `_system/.system-meta/system-archive/` | `<project>/.<project>-meta/.<project>-archive/` |
| **Scratch** | `_system/.system-meta/system-scratch/` | `<project>/.<project>-meta/.<project>-scratch/` |

---

## 🚨 FALLBACK PROTOCOL
If you encounter a broken reference or missing path:
1. **HALT** immediately and report the failure to the user.
2. Attempt Autonomous Self-Repair:
   - Read `_system/system-index.yaml` to find the canonical path for the subsystem.
   - Read `config.yaml` to check if the entity is enabled.
   - Scan `_system/.system-meta/.system-os_prompts/` for structural laws.
   - Scan shared pipeline runbooks for similar successful states.

**Note for Agents:** Start your turn by adhering strictly to the BOOT SEQUENCE defined at the top of this file.