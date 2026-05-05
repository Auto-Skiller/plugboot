# 🏗️ Hierarchy — Multi-Layer Inheritance

Agentic OS v5 operates on a strict three-layer hierarchy. Configurations, context, and rules inherit downwards but never upwards.

## Layer 1: Core (Global)

- **Location:** `.brain/`, `.toolbox/`, `.scope/.core/`
- **Purpose:** System-wide identity, global capabilities, and evergreen operational knowledge.
- **Inheritance:** Everything here applies to all pipelines and projects automatically.
- **Registries:**
  - `core_toolbox.registry`
  - `extended_toolbox.registry`
  - `core.context.registry`
  - `core.missions.registry`

## Layer 2: Pipelines (Execution Workflows)

- **Location:** `_pipelines/[name]/`, `.scope/pipelines/[name]/`
- **Purpose:** Large-scale, continuous workflows (e.g., `hustler`, `scaler`) aiming at broad objectives.
- **Inheritance:** Inherits from Core. Pipeline context/missions apply ONLY to that specific pipeline.
- **Registries:**
  - `pipelines.context.registry/[name].context.registry`
  - `pipelines.missions.registry/[name].missions.registry`

## Layer 3: Projects (Direct Builds)

- **Location:** `_projects/[name]/`, `.scope/projects/[name]/`
- **Purpose:** Finite, bounded builds or codebases (e.g., custom apps, specific tools).
- **Inheritance:** Inherits from Core. Project context/missions apply ONLY to that specific project.
- **Registries:**
  - `projects.context.registry/[name].context.registry`
  - `projects.missions.registry/[name].missions.registry`

---

## Data Segregation Rule

- **Workspace Data:** Deliverables, code, and direct outputs live in `_pipelines/` or `_projects/`.
- **Operational Data:** Knowledge, metadata, run logs, and mission definitions live in `.scope/`.
- **Identity & Control:** Engines, rules, and registries live in `.brain/`.
