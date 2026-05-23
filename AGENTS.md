# 🤖 AGENTS

> [!IMPORTANT]
> This is the root pointer file for all agents landing in this workspace. It is the absolute authority for agent behavior, architecture structure, and initialization. We are not building "an agent" — we are building the **Substrate** (Agentic OS v5.3) that allows any world-class agent to land in this workspace and immediately become 10x more autonomous and capable.
>
> The "Perfect System" is one where the workspace provides the **Senses** (`_context/`), the **Memory** (`.db/` and `CONTROLER.yaml`), and the **Muscles** (`_toolboxes/`), while the agents provide the "Brain" to execute operations deterministically.

---

## 🛑 CRITICAL BOOT SEQUENCE
Before taking ANY action, you MUST execute these steps in exact order. Skipping steps is a protocol violation.

> **BOOT-00: Grounded Identity Initialization**
> Read `.identity/01_architecture/` and other files across the `.identity/` subgroups to map the identity laws and understand the operating standards.

> **BOOT-01: Load Master Map**
> Read `MASTER_INDEX.yaml`. This is the Master Index mapping every subsystem, pipeline, and toolbox to its exact physical path.

> **BOOT-02: Zero-Drift Audit (The Sync Daemon)**
> Execute `_os/engine/meta_sync.py` via the cross-platform launcher (see Portability Law below). This synchronizes all DB files, `CONTROLER.yaml`, and milestones.

> **BOOT-03: Load Active State**
> Read `CONTROLER.yaml` to load current operational state, active modes (`work_mode`, `evolution_mode`), action gates, and communication hubs.

> **BOOT-04: Pipeline Immersion (Conditional)**
> If the task involves a pipeline (Scaler or Hustler), read its routing db (`.db/pipeline_scaler.yaml` or `.db/pipeline_hustler.yaml`) and its specific identity laws (e.g., `pipeline_hustler/.hustler_identity/`) before providing any simulation, plan, or execution. Partial knowledge is forbidden.

> **BOOT-05: Muscle Loading**
> Read `.db/_toolboxes.yaml` to locate specific skills before use. Use internal logic to select between domains based on task context.

> **BOOT-06: Project Mapping (Conditional)**
> If the task involves project modification, read `.db/projects.yaml` to understand the stack and registered entry points.

---

## ⚖️ CORE LAWS ENFORCED AT BOOT

> [!WARNING]
> You are bound by the following laws at all times:
> - **Zero-Drift Audit:** Always perform a fresh disk read (`view_file`) of any file before editing it. Never rely on context from earlier in the conversation for file state.
> - **Zero-Guess Law:** Never guess file paths. All paths must come from a DB file or a physical directory listing.
> - **Logic Preservation Law:** During structural moves or refactors, NO existing logic, rules, or content may be deleted without explicit user confirmation and a no-loss warning.
> - **Portability Law:** All dependencies must be installed inside the workspace (`_os/venv/`). Never install globally on the host OS. 

---

## 💻 OS RUNTIME EXECUTION (TRUE PORTABILITY)

> [!CAUTION]
> To execute Python tools, NEVER use `Activate.ps1` (it breaks on new machines due to hardcoded paths) and NEVER call `.venv\Scripts\python.exe` directly (it breaks cross-OS). 
> 
> Always use the cross-platform launcher, which auto-bootstraps the venv, loads `.env` secrets, and forwards args to the right interpreter:
> - **Windows:** `.\_os\venv\meta_run.ps1 -m script_name <args>`
> - **Linux/macOS:** `./_os/venv/meta_run.sh -m script_name <args>`
> 
> **SECRETS:** Because this repository is designed for 100% portability, it is safe to store API keys in `.env` files and maintain active session cookies directly inside the workspace.

---

## 🏛️ THE THREE PILLARS OF AGENTIC OS v5.3

### 1. `.identity/` & Context — The Central Nervous System & Logic
Static instructions, governance laws, and identity rules. **Never modified by the sync engine.**
- **`.identity/`**: Identity files — laws, modes, persona, concurrency model, execution operations.
- **`pipeline_hustler/.hustler_identity/`**: Runbooks and cascading logic for Hustler.
- **`pipeline_scaler/.scaler_identity/`**: Runbooks and gateway logic for Scaler.

### 2. `.db/` & `CONTROLER.yaml` — The Memory & State
The active memory. Maps the physical workspace so agents don't have to guess paths.
- **`MASTER_INDEX.yaml`** (at root): The Master Index. Single source of truth for the workspace.
- **`CONTROLER.yaml`**: The active state. Tracks global telemetry, active milestones, hubs, and modes.
- **`_shemas_db/`**: Strict YAML schemas enforcing the exact structural contracts of the DB files.

### 3. Execution Workspaces — The Muscles
The physical folders where actual work is done. Agents create code, data, and milestone YAMLs here.
- **`_milestones/`**: Active milestones and goals with auto-promotion and auto-archival.
- **`_toolboxes/`**: Skill folders organized across domains.
- **`pipelines/`**: Continuous workflows — **Scaler** (System Evolution) and **Hustler** (Product Discovery).
- **`projects/`**: Finite, bounded codebases with defined scope and completion state.
- **`_os/engine/`**: The daemon Python engine responsible for synchronizing state.

---

## 🚨 FALLBACK PROTOCOL
If the sync engine fails or you encounter an architectural blockage:
1. **HALT** immediately and report the failure to the user if in `STRICT`, `COLLAB`, or `MANUAL` mode.
2. If in `AUTO` mode, attempt Autonomous Self-Repair:
   - Search `.identity/` for structural laws.
   - Scan pipeline runbooks for similar successful states.
   - Re-run `meta_sync.py` or restore `CONTROLER.yaml` from healthy patterns.
   - Report the fix to the user and resume boot.

**Note for Agents:** Start your turn by adhering strictly to the BOOT SEQUENCE defined at the top of this file.