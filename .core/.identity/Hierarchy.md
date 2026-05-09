# 🏗️ Hierarchy — Multi-Layer Architecture

Agentic OS v5 operates on a strict three-pillar hierarchy. 

## Pillar 1: Brain (Routing & Automation)
- **Location:** `.brain/`
- **Purpose:** Pure programmatic routing. The brain contains no actual tools or context. It strictly maps the rest of the workspace.
- **Components:**
  - `meta.router.yaml` (The Master Index)
  - `meta.router/` (The generated mapping catalogs)
  - `.sync_engine/` (The automation scripts that scan `.core/` and workspaces to build the routers)

## Pillar 2: Core (Always-On System)
- **Location:** `.core/`
- **Purpose:** System-wide identity, capabilities, and global mission tracking.
- **Components:**
  - `.identity/`: Architectural documentation and rules.
  - `toolbox_library/`: All executable agentic capabilities (Core Toolboxes and Extended Domains).
  - `mission_board/`: The physical yaml files tracking `Sessions` and their nested `Goals`.

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
2. You define the physical goals in `.core/mission_board/`.
3. The engine in `.brain/.sync_engine/` runs, updating `.brain/meta.router/`.
4. An Agent reads `CONTROLER.yaml`, checks `.brain/meta.router.yaml`, finds its mission, grabs a tool from `.core/toolbox_library/`, and executes code inside `pipelines/` or `projects/`.
