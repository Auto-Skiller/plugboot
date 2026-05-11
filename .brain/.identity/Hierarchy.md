# 🏗️ Hierarchy — Multi-Layer Architecture

Agentic OS v5 operates on a strict three-pillar hierarchy. 

## Pillar 1: Brain (Logic & Routing)
- **Location:** `.brain/`
- **Purpose:** Programmatic routing, tool execution, and architectural law. The brain holds the logic of the system.
- **Components:**
  - `meta.router.yaml` (The Master Index)
  - `meta.router/` (The generated mapping catalogs and `.sync_engine/`)
  - `.identity/` (Architectural documentation and system rules)
  - `.toolbox_library/` (All executable agentic capabilities)

## Pillar 2: Runtime (State & Memory)
- **Location:** `.runtime/`
- **Purpose:** Dynamic, constantly changing state. The memory of the system.
- **Components:**
  - `.mission_board/`: The physical yaml files tracking `Sessions` and their nested `Goals`.
  - `.notebooklm/`: Active session cookies, authentication logic, and dynamic caches.

## Pillar 3: Workspaces (Execution)
- **Location:** `pipelines/` and `projects/`
- **Purpose:** The actual battleground where work happens. 
- **Sub-divisions:**
  - `pipelines/`: Continuous, ongoing workflows (e.g., `hustler`, `scaler`).
  - `projects/`: Finite, bounded builds.
- **Data Segregation Rule:** 
  - Execution files (code, assets, discoveries) live directly in the workspace root (e.g., `pipelines/hustler/`).
  - Operational rules (runbooks, scratchpads, trackers) live inside hidden localized context folders (`.hustler.meta/`) within that execution space.

---

## The Information Flow

1. You create a new session in `CONTROLER.yaml`.
2. You define the physical goals in `.runtime/.mission_board/`.
3. The engine in `.brain/meta.router/.sync_engine/` runs, updating the routing maps.
4. An Agent reads `CONTROLER.yaml`, checks `.brain/meta.router.yaml`, finds its mission, grabs a tool from `.brain/.toolbox_library/`, and executes code inside `pipelines/` or `projects/`.
