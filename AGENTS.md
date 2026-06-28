# 🤖 AGENTS

> [!IMPORTANT]
> This is the root pointer file for all agents landing in this workspace. It is the absolute authority for agent behavior, architecture structure, and initialization.
>
> The "Perfect System" is one where the workspace provides the **Senses** (), the **Memory** (), and the **Muscles** (), while the agents provide the "Brain" to execute operations deterministically.

---

## 🛑 CRITICAL BOOT SEQUENCE
Before taking ANY action, you MUST execute these steps in exact order. Skipping steps is a protocol violation.

> **BOOT-00: Grounded Identity Initialization**
> Read **ALL** identity law files under . These are static operational laws — not optional context — and are mandatory every turn regardless of task. Read every file in every subdirectory (, , , ). No file may be skipped.

> **BOOT-01: Pre-flight Health Check**
> Verify structural integrity:
> 1. Read  — confirm all referenced pipelines and projects exist on disk.
> 2. Read  — confirm all  paths exist and all / DB files exist.
> 3. Check that each project has its own runtime directory.
>
> If any check fails — **HALT IMMEDIATELY** and repair the flagged issue before proceeding.

> **BOOT-02: Load Master Map & Error Gate**
> Read  and . These are the Master Index — they hold the active state (, , ), and map every subsystem to its physical path.
> Immediately after reading, perform the **Error Gate**:
> 1. Cross-reference every  and  path in  against disk. Any missing file is a CRITICAL error.
> 2. Cross-reference every  path in  against disk. Any missing folder is a CRITICAL error.
> 3. Check  — every project/pipeline with  must have a corresponding disk folder.
>
> If errors exist, treating and repairing them is your **ABSOLUTE HIGHEST PRIORITY** before executing any other task.

> **BOOT-03: Contextual Immersion (Conditional)**
> Load task-specific context in this order — skip any sub-step that does not apply:
> 1. **Pipeline context:** If the task involves Scaler or Hustler, read the relevant runbooks in  or .
> 2. **Project context:** If the task involves a project, read the project board YAML from  and its tasks from  if it exists.
> 3. **Muscle loading:** Read  first for the overview, then  for the agent-facing rollup of active toolboxes/skills/agents.

---

## ⚖️ CORE LAWS ENFORCED AT BOOT

> [!WARNING]
> You are bound by the following laws at all times:
> - **Zero-Drift Audit:** Always perform a fresh disk read of any file before editing it.
> - **Zero-Guess Law:** Never guess file paths. All paths must come from a DB file or a physical directory listing.
> - **Logic Preservation Law:** During structural moves or refactors, NO existing logic may be deleted without explicit user confirmation and a no-loss warning.
> - **Portability Law:** All dependencies must be installed inside the workspace.

---

## 🏛️ THE THREE PILLARS OF AGENTIC OS v5.3

### 1.  — The Central Nervous System & Logic
Static instructions, governance laws, and identity rules. **Never modified by the sync engine.**
- ****: Identity files — laws, modes, persona, concurrency model.
  -  — Structural laws and workspace mapping
  -  — Agent persona and conflict resolution
  -  — Dual-Entry state flow rules
  -  — Operational guides for pipelines & toolboxes

### 2.  — The Memory & State
The active memory. Maps the physical workspace so agents don't have to guess paths.
- ****: High-level configuration, scope modes, and session tracking.
- ****: System rollup (aggregated state).
- ****: All toolbox domains with status and maturity.
- ****: Agent-facing rollup — which toolboxes, skills, and agents are available.
- ****: Per-domain detailed rollup files.
- ****: Scaler pipeline state.
- ****: Hustler pipeline state.
- ****: Per-project runtime state.
- ****: Per-project task boards.
- ****: Per-project rollups.
- ****: Per-project granular tracking.
- ****: Strict YAML schemas enforcing DB structure.

### 3. Execution Workspaces — The Muscles
- ****: Active milestones and goals.
- ****: Skill folders organized across 5 domains.
  -  — Core cognitive skills
  -  — Engineering skills
  -  — Business skills
  -  — Creative skills
  -  — Life skills
- ****: Continuous workflow — **Scaler** (System Evolution).
- ****: Continuous workflow — **Hustler** (Product Discovery).
- **Project folders**: Finite, bounded codebases.
  -  — DZ AGENTS Course
  -  — Street Food Kiosk El Cap
  -  — Real Estate Assets
  -  — E-commerce

---

## 📂 RUNTIME DIRECTORIES

Each workspace entity has its own runtime directory:

| Entity | Runtime Dir | Contents |
|--------|-------------|----------|
|  |  | ,  |
|  |  | ,  |
|  |  | ,  |
|  |  | ,  |
|  |  | ,  |
|  |  | ,  |

> **Convention:** Runtime dirs live inside each entity's folder. Course/plan projects share . Others use the entity name prefix.

---

## 🚨 FALLBACK PROTOCOL
If you encounter a broken reference or missing path:
1. **HALT** immediately and report the failure to the user.
2. Attempt Autonomous Self-Repair:
   - Read  to find the canonical path for the subsystem.
   - Read  to check if the subsystem is enabled.
   - Scan  for structural laws.
   - Scan pipeline runbooks for similar successful states.

**Note for Agents:** Start your turn by adhering strictly to the BOOT SEQUENCE defined at the top of this file.
