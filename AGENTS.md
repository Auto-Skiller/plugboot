# 🤖 AGENTS

> [!IMPORTANT]
> This is the root pointer file for all agents landing in this workspace. It is the absolute authority for agent behavior, architecture structure, and initialization. We are not building "an agent" — we are building the **Substrate** (Agentic OS v5.3) that allows any world-class agent to land in this workspace and immediately become 10x more autonomous and capable.
>
> The "Perfect System" is one where the workspace provides the **Senses** (`.meta_os/meta_identity/`), the **Memory** (`.meta_os/meta_db/` and `CONTROLER.yaml`), and the **Muscles** (`.toolboxes/`), while the agents provide the "Brain" to execute operations deterministically.

---

## 🛑 CRITICAL BOOT SEQUENCE
Before taking ANY action, you MUST execute these steps in exact order. Skipping steps is a protocol violation.

> **BOOT-00: Grounded Identity Initialization**
> Read **ALL** identity law files under `.meta_os/meta_identity/`. These are static operational laws — not optional context — and are mandatory every turn regardless of task. Read every file in every subdirectory (`01_architecture/`, `02_behavior/`, `03_state_and_memory/`, `04_execution/`). No file may be skipped.

> **BOOT-01: Pre-flight Health Check**
> Run the automated diagnostic tool:
> - **Windows:** `.\.meta\.venv\meta_run.ps1 .meta\engine\verify_boot.py`
> - **Linux/macOS:** `./.meta/.venv/meta_run.sh .meta/engine/verify_boot.py`
>
> If any check fails — **HALT IMMEDIATELY** and repair the flagged issue before proceeding. You already have the identity laws loaded from BOOT-00 to guide the repair. Do not proceed on a broken substrate.

> **BOOT-01.5: Daemon Singleton Sanity Check**
> After verify_boot passes, verify the daemon set is clean:
> 1. Read `.meta/boot.pid` — confirm supervisor PID and all engine PIDs are alive.
> 2. Run a duplicate scan: `powershell -Command "Get-Process python | Where-Object { $_.CommandLine -match 'daemon|server.py' } | Select-Object Id, ProcessName, @{N='Cmd';E={$_.CommandLine}}"`
> 3. If any duplicate/orphan processes found (not tracked in boot.pid), run `.meta/engine/stop_all.ps1` then `.meta/engine/start_all.ps1` to get a clean slate.
> 4. Verify exactly one `server.py` is listening on port 8000: `powershell -Command "Get-NetTCPConnection -LocalPort 8000 | Select-Object LocalPort, OwningProcess, State"`
>
> If duplicates persist after restart — **HALT** and report to user before proceeding.

> **BOOT-02: Load Master Map + Error Gate**
> Read `.meta_os/meta_db/meta_os.yaml`. This is the Master Index — it holds the active state (`modes`, `system_errors`, `evolution queues`, `milestones`), and maps every subsystem to its physical path. `CONTROLER.yaml` is an aggregated rollup synced from this and other DB files — do NOT read it separately; `meta_os.yaml` is the authoritative source.
> Immediately after reading, perform the **Error Gate**:
> 1. Check `metadata.system.system_errors`. If the array is non-empty — **HALT and repair all errors before any other action**. This is your highest priority. Remove each error from the array only after the underlying issue is physically fixed.
> 2. Acknowledge and internalize the active `work_mode` and `action_gate` — these govern every subsequent action you take.

> **BOOT-03: Contextual Immersion (Conditional)**
> Load task-specific context in this order — skip any sub-step that does not apply:
> 1. **Pipeline context:** If the task involves Scaler or Hustler, read `.meta_os/meta_db/pipeline_scaler_os.yaml` or `.meta_os/meta_db/pipeline_hustler_os.yaml` AND the specific granular ledger for the target pillar. Respect the strict split between `state` (physical work) and `metadata` (communication).
> 2. **Project context:** If the task involves a project, read `.meta_os/meta_db/projects_os.yaml` to understand the stack and registered entry points.
> 3. **Muscle loading:** Read `.meta_os/meta_db/.toolboxes.yaml` last, after all context is loaded. Use the `when_to_use` field to select only the domains relevant to this specific task.

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
> - **Windows:** `.\.meta\.venv\meta_run.ps1 path\to\script.py <args>`
> - **Linux/macOS:** `./.meta/.venv/meta_run.sh path/to/script.py <args>`
>
> **NEVER use `-m` flag** — pass the script path directly. The `-m` flag is a Python module loader flag and is NOT supported by `meta_run`.
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