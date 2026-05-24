# 🤖 AGENTS

> [!IMPORTANT]
> This is the root pointer file for all agents landing in this workspace. It is the absolute authority for agent behavior, architecture structure, and initialization. We are not building "an agent" — we are building the **Substrate** (Agentic OS v5.3) that allows any world-class agent to land in this workspace and immediately become 10x more autonomous and capable.
>
> The "Perfect System" is one where the workspace provides the **Senses** (`.meta_os/meta_identity/`), the **Memory** (`.meta_os/meta_db/` and `CONTROLER.yaml`), and the **Muscles** (`.toolboxes/`), while the agents provide the "Brain" to execute operations deterministically.

---

## 🛑 CRITICAL BOOT SEQUENCE
Before taking ANY action, you MUST execute these steps in exact order. Skipping steps is a protocol violation.

> **BOOT-00: Grounded Identity Initialization**
> Read `.meta_os/meta_identity/01_architecture/` and other files across the `.meta_os/meta_identity/` subgroups to map the identity laws and understand the operating standards.

> **BOOT-01: Load Master Map**
> Read `.meta_os/meta_db/meta_os.yaml`. This is the Master Index mapping every subsystem, pipeline, and toolbox to its exact physical path.

> **BOOT-02: Zero-Drift Audit (The Sync Daemon)**
> Ensure `.meta/engine/boot.py` is running in the background via the cross-platform launcher. It acts as a continuous daemon that synchronizes physical disk state into the granular ledgers and rolls them up into `CONTROLER.yaml`.

> **BOOT-03: Load Active State**
> Read `CONTROLER.yaml` to load current operational state, active modes (`work_mode`, `evolution_mode`), action gates, and communication hubs.

> **BOOT-04: Pipeline Immersion (Conditional)**
> If the task involves a pipeline (Scaler or Hustler), read its master routing db (`.meta_os/meta_db/pipeline_scaler_os.yaml` or `pipeline_hustler_os.yaml`) AND the specific granular ledger for the target pillar/focus (e.g., `.scaler_os/scaler_db/Foundational_Integrity.proposals.yaml`). You must respect the strict split between `state` (physical work) and `metadata` (communication) in these ledgers.

> **BOOT-05: Muscle Loading**
> Read `.meta_os/meta_db/.toolboxes.yaml` to locate specific skills before use. Use internal logic to select between domains based on task context.

> **BOOT-06: Project Mapping (Conditional)**
> If the task involves project modification, read `.meta_os/meta_db/projects_os.yaml` to understand the stack and registered entry points.

---

## ⚖️ CORE LAWS ENFORCED AT BOOT

> [!WARNING]
> You are bound by the following laws at all times:
> - **Zero-Drift Audit:** Always perform a fresh disk read (`view_file`) of any file before editing it. Never rely on context from earlier in the conversation for file state.
> - **Zero-Guess Law:** Never guess file paths. All paths must come from a DB file or a physical directory listing.
> - **Logic Preservation Law:** During structural moves or refactors, NO existing logic, rules, or content may be deleted without explicit user confirmation and a no-loss warning.
> - **Portability Law:** All dependencies must be installed inside the workspace (`.meta/.venv/`). Never install globally on the host OS.

---

## 💻 OS RUNTIME EXECUTION (TRUE PORTABILITY)

> [!CAUTION]
> To execute Python tools, NEVER use `Activate.ps1` (it breaks on new machines due to hardcoded paths) and NEVER call `.venv\Scripts\python.exe` directly (it breaks cross-OS). 
> 
> Always use the cross-platform launcher, which auto-bootstraps the venv, loads `.env` secrets, and forwards args to the right interpreter:
> - **Windows:** `.\.meta\.venv\meta_run.ps1 -m script_name <args>`
> - **Linux/macOS:** `./.meta/.venv/meta_run.sh -m script_name <args>`
> 
> **SECRETS:** Because this repository is designed for 100% portability, it is safe to store API keys in `.env` files and maintain active session cookies directly inside the workspace.

---

## 🏛️ THE THREE PILLARS OF AGENTIC OS v5.3

### 1. `.meta_os/meta_identity/` & Context — The Central Nervous System & Logic
Static instructions, governance laws, and identity rules. **Never modified by the sync engine.**
- **`.meta_os/meta_identity/`**: Identity files — laws, modes, persona, concurrency model, execution operations.
- **`pipeline_hustler/.hustler_os/hustler_identity/`**: Runbooks and cascading logic for Hustler.
- **`pipeline_scaler/.scaler_os/scaler_identity/`**: Runbooks and gateway logic for Scaler.

### 2. `.meta_os/meta_db/` & `CONTROLER.yaml` — The Memory & State
The active memory. Maps the physical workspace so agents don't have to guess paths.
- **`.meta_os/meta_db/meta_os.yaml`**: Core OS DB.
- **`CONTROLER.yaml`**: The active state. Tracks global telemetry, active milestones, hubs, and modes.
- **`.meta_os/meta_db/.db_shemas_db/`**: Strict YAML schemas enforcing the exact structural contracts of the DB files.

### 3. Execution Workspaces — The Muscles
The physical folders where actual work is done. Agents create code, data, and milestone YAMLs here.
- **`.meta_os/meta_milestones/`**: Active milestones and goals with auto-promotion and auto-archival.
- **`.toolboxes/`**: Skill folders organized across domains.
- **`pipelines/`**: Continuous workflows — **Scaler** (System Evolution) and **Hustler** (Product Discovery).
- **`projects/`**: Finite, bounded codebases with defined scope and completion state.
- **`.meta/engine/`**: The daemon Python engine responsible for synchronizing state.

---

## 🦠 DAEMON HEALTH & SYSTEM ERRORS

> [!CAUTION]
> The Sync Daemon (`boot.py` -> `meta_engine.py`) continuously monitors the structural health of the OS. If it detects missing DB files, corrupted schemas, or missing identity pointers, it will append an `[ERROR]` string into `CONTROLER.yaml` under `core.system.system_errors: []`.
>
> **Agent Responsibility:**
> 1. You MUST periodically check `core.system.system_errors` when reading `CONTROLER.yaml`.
> 2. If errors exist, treating and repairing them is your **ABSOLUTE HIGHEST PRIORITY** before executing any other task.
> 3. Once you have repaired the missing/broken component, you MUST manually remove the error string from the `system_errors` array. The daemon does not auto-clear errors.

---

## 🚨 FALLBACK PROTOCOL
If the sync engine fails or you encounter an architectural blockage:
1. **HALT** immediately and report the failure to the user if in `STRICT`, `COLLAB`, or `MANUAL` mode.
2. If in `AUTO` mode, attempt Autonomous Self-Repair:
   - Search `.meta_os/meta_identity/` for structural laws.
   - Scan pipeline runbooks for similar successful states.
   - Re-run `boot.py` or restore `CONTROLER.yaml` from healthy patterns.
   - Report the fix to the user and resume boot.

**Note for Agents:** Start your turn by adhering strictly to the BOOT SEQUENCE defined at the top of this file.