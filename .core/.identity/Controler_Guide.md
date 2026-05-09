# 📋 Controler Guide

The `CONTROLER.yaml` is the **Central Command State** for Agentic OS v5. It provides a high-level, real-time snapshot of the system's active operations. 

## Core Rule: Strict Session Hierarchy
Unlike previous versions of the OS, there are no loose global goals. **Every single goal must be strictly nested inside a Session.**

---

## The Double-Entry Synchronization Protocol

To ensure the OS never hallucinates its state, Agents are strictly bound to a **Double-Entry Bookkeeping** protocol. `CONTROLER.yaml` (the high-level state) and `.core/mission_board/` (the physical reality) MUST be kept in perfect synchronization. 

Whenever an Agent takes an action, they must write to both locations simultaneously:

### 1. Creating Sessions & Goals
- **Naming Rule:** Sessions and Goals MUST be named by their **actual role** or **functional objective** (e.g., `SES-ARCHITECT-BRAIN`, `BRAIN-AUDIT`). **NEVER use numeric suffixes like `-001` or `-003`.**
- **Controler Action:** When generating a new Session or Goal, you must add it to the `sessions.active` list in `CONTROLER.yaml`.
- **Mission Board Action:** You MUST immediately create the corresponding physical structure (`.core/mission_board/[SESSION_ROLE_NAME]/[SESSION_ROLE_NAME].yaml` and `.core/mission_board/[SESSION_ROLE_NAME]/[GOAL_ROLE_NAME]/[GOAL_ROLE_NAME].yaml`) matching the expected file schemas.

### 2. Status Updates
- **Controler Action:** When a goal transitions to `in-progress 🔄` or `done ✅`, update its `status` field in `CONTROLER.yaml`.
- **Mission Board Action:** You MUST open the corresponding `[GOAL_ROLE_NAME].yaml` file and apply the exact same `status` update. 

### 3. Artifacts and Tracking
- **Mission Board Action (The Heavy Lifting):** All physical markdown files, reports, code outputs, and deep contextual tracking MUST be stored inside the specific goal directory (`.core/mission_board/[SESSION_ROLE_NAME]/[GOAL_ROLE_NAME]/`).
- **Controler Action (The Summary):** You must add a short summary or file path reference into the `artifacts` array of that goal in `CONTROLER.yaml`. Do not bloat the Controler with full file contents.

### 4. Conflict Resolution
If an Agent detects a mismatch between `CONTROLER.yaml` and `.core/mission_board/`:
- **The Physical Files Win:** `.core/mission_board/` is always the ultimate source of truth. 
- **Self-Healing Action:** The Agent must immediately correct `CONTROLER.yaml` to reflect the physical reality of the Mission Board before proceeding with execution.

---

### Writing to the Controler (Checklist)
1. Ensure you are updating the goal *under the correct session*.
2. Update the `tracking` and `artifacts` fields with brief summaries.
3. If all goals in a session are completed, move the session from `sessions.active` to `sessions.history` in the `CONTROLER.yaml`.
4. Ensure the `.core/mission_board/[SESSION_ROLE_NAME]/[SESSION_ROLE_NAME].yaml` status reflects `completed`.
