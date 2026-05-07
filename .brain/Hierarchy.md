# 🏗️ Hierarchy — Multi-Layer Inheritance

Agentic OS v5 operates on a strict three-layer hierarchy. Configurations, context, and rules inherit downwards but never upwards.

## Layer 1: Core (Global)

- **Location:** `.brain/`, `.toolbox/`, `.scope/.core/`
- **Purpose:** System-wide identity, global capabilities, and evergreen operational knowledge.
- **Inheritance:** Everything here applies to all pipelines and projects automatically.
- **Registries:**
  - `core_toolbox.catalog.yaml`
  - `extended_toolbox.catalog.yaml`
  - `core.knowledge.catalog.yaml`
  - `core.missions.catalog.yaml`

## Layer 2: Pipelines (Execution Workflows)

- **Location:** `_pipelines/[name]/`, `.scope/pipelines/[name]/`
- **Purpose:** Large-scale, continuous workflows (e.g., `hustler`, `scaler`) aiming at broad objectives.
- **Inheritance:** Inherits from Core. Pipeline context/missions apply ONLY to that specific pipeline.
- **Registries (centralized in `.brain/`):**
  - `.brain/.knowledge.context_control/pipelines/[name].context.catalog.yaml`
  - `.brain/.missions.context_control/pipelines/[name].missions.catalog.yaml`

## Layer 3: Projects (Direct Builds)

- **Location:** `_projects/[name]/`, `.scope/projects/[name]/`
- **Purpose:** Finite, bounded builds or codebases (e.g., custom apps, specific tools).
- **Inheritance:** Inherits from Core. Project context/missions apply ONLY to that specific project.
- **Registries (centralized in `.brain/`):**
  - `.brain/.knowledge.context_control/projects/[name].context.catalog.yaml`
  - `.brain/.missions.context_control/projects/[name].missions.catalog.yaml`

---

## Data Segregation Rule

- **Workspace Data:** Deliverables, code, and direct outputs live in `_pipelines/` or `_projects/`.
- **Operational Data:** Knowledge, metadata, run logs, and mission definitions live in `.scope/`.
- **Identity & Control:** Engines, rules, and registries live in `.brain/`.
