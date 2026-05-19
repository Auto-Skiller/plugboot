# 🏗️ Hierarchy — Multi-Layer Architecture (v5)

**Purpose:** Defines the strict three-pillar hierarchy of Agentic OS v5 (Brain / Runtime / Workspaces) and how information flows between them.
**When to use:** Consult before creating a new top-level folder, moving a file across pillars, or deciding which pillar a new artifact belongs to.

Agentic OS v5 operates on a strict three-pillar hierarchy, segregated by permanence and role.

## Pillar 1: Brain (Logic & Routing)
- **Location:** `.meta_brain/`
- **Purpose:** Programmatic routing, tool execution, and architectural law. The brain holds the logic of the system.
- **Components:**
  - `meta_router.yaml` (The Master Index)
  - `.meta_routing/` (The specialized router YAMLs and `meta_sync_engines/` worker scripts)
  - `meta_identity/` (The absolute laws, standards, and persona)
  - `toolboxes/` (The execution muscles - agents and skills)
  - `milestones/` (The mission board tracking Sessions and Goals)

## Pillar 2: Runtime (State & Memory)
- **Location:** `.meta_runtime/`
- **Purpose:** Dynamic infrastructure and memory.
- **Components:**
  - `venv/`: The master portable Python environment.
  - `auth/`: Active session cookies and authenticated states.
  - `.meta_scratch/`: Ephemeral agent working space.
  - `.meta_archive/`: Old logs and deprecated files.

## Pillar 3: Workspaces (Execution)
- **Location:** `_pipelines/` and `projects/`
- **Purpose:** The battleground where work happens. 
- **Sub-divisions:**
  - `_pipelines/`: Continuous, ongoing workflows (e.g., `scaler`, `hustler`).
  - `projects/`: Finite, bounded codebases.

---

## The Information Flow

1. **Plan**: Define a role-based session and goals in `CONTROLER.yaml`.
2. **Execute**: Create physical goal directories in `.meta_brain/milestones/`.
3. **Sync**: Run `.meta_brain/meta_sync.py` (via the cross-platform launcher) to update all routing maps.
4. **Operate**: An Agent reads `meta_router.yaml`, finds its path, grabs a tool from `toolboxes/`, and executes code inside `_pipelines/` or `projects/`.
