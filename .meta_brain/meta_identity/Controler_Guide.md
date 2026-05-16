# 📋 Controler Guide

The `CONTROLER.yaml` is the **Central Command State** for Agentic OS v5. It provides a high-level, real-time snapshot of the system's active operations. 

## Core Rule: Strict Session Hierarchy
Unlike previous versions of the OS, there are no loose global goals. **Every single goal must be strictly nested inside a Session.**

---

## The Automated Synchronization Protocol (Sync Engine v5)

To ensure the OS never hallucinates its state, Agents are strictly bound to the **Sync Engine v5 Protocol**. `CONTROLER.yaml` (the high-level state) and `.meta_brain/milestones/` (the physical reality) MUST be kept in perfect synchronization.

While Agents must perform atomic updates during execution, the **Sync Engine v5** (`meta_sync.py`) acts as the authoritative truth-maker.

Whenever an Agent takes an action, they must write to both locations simultaneously, and then trigger the sync:

### 1. Creating Sessions & Goals
- **Naming Rule:** Sessions and Goals MUST be named by their **actual role** or **functional objective** (e.g., `SES-ARCHITECT-BRAIN`, `BRAIN-AUDIT`). **NEVER use numeric suffixes like `-001` or `-003`.**
- **Controler Action:** When generating a new Session or Goal, you must add it to the `sessions.active` list in `CONTROLER.yaml`.
- **Mission Board Action:** You MUST immediately create the corresponding physical structure (`.runtime/.mission_board/[SESSION_ROLE_NAME]/[SESSION_ROLE_NAME].yaml` and `.runtime/.mission_board/[SESSION_ROLE_NAME]/[GOAL_ROLE_NAME]/[GOAL_ROLE_NAME].yaml`) matching the expected file schemas.

### 2. Status Updates
- **Controler Action:** When a goal transitions to `in-progress 🔄` or `done ✅`, update its `status` field in `CONTROLER.yaml`.
- **Mission Board Action:** You MUST open the corresponding `[GOAL_ROLE_NAME].yaml` file and apply the exact same `status` update. 

### 3. Artifacts and Tracking
- **Mission Board Action (The Heavy Lifting):** All physical markdown files, reports, code outputs, and deep contextual tracking MUST be stored inside the specific goal directory (`.runtime/.mission_board/[SESSION_ROLE_NAME]/[GOAL_ROLE_NAME]/`).
- **Controler Action (The Summary):** You must add a short summary or file path reference into the `artifacts` array of that goal in `CONTROLER.yaml`. Do not bloat the Controler with full file contents.

### 4. Conflict Resolution
If an Agent detects a mismatch between `CONTROLER.yaml` and `.runtime/.mission_board/`:
- **The Physical Files Win:** `.runtime/.mission_board/` is always the ultimate source of truth. 
- **Self-Healing Action:** The Agent must immediately correct `CONTROLER.yaml` to reflect the physical reality of the Mission Board before proceeding with execution.

---

### Writing to the Controler (Checklist)
1. Ensure you are updating the goal *under the correct session*.
2. Update the `tracking` and `artifacts` fields with brief summaries.
3. If all goals in a session are completed, move the session from `sessions.active` to `sessions.history` in the `CONTROLER.yaml`.
4. Ensure the `.runtime/.mission_board/[SESSION_ROLE_NAME]/[SESSION_ROLE_NAME].yaml` status reflects `completed`.

