# HIERARCHY: MULTI-LAYER SYSTEM

The `open-workspace` is organized into hierarchical layers to ensure modularity and centralized control.

## 🌌 Multi-Layer Architecture

1.  **Root Layer (The OS)**:
    - The definitive source of truth for the entire workspace.
    - Contains: `.brain/` (Identity), `.toolbox/` (Capabilities), `BOARD.yaml` (State).
    - Key Files: `AGENTS.md`, `.brain/Core Architecture.md`, `BOARD.yaml`.
    - Root rules and global overrides apply across all sub-layers.

2.  **Execution Pipelines (The Agents)**:
    - Specialized environments (`_pipelines/hustler`, `_pipelines/scaler`).
    - Each pipeline has its own workspace under `_pipelines/` and scoped content (discoveries, proposals, projects).
    - Local modes are respected unless a Global Override is active in `BOARD.yaml`.

3.  **Custom Projects**:
    - Direct builds and standalone deliverables under `_projects/`.
    - Inherit all root identity and capabilities from `.brain/` and `.toolbox/`.

## ⚓ The Anchor Principles

1.  **Zero Drift**: Sub-layers (Pipelines, Projects) do not need to check if the root is "ready." They are built to be 100% compliant with the root's current state.
2.  **Global Inheritance**: Sub-layers strictly inherit all root identity and capability stack. Any local rule in a sub-layer must be a **specialization**, never a duplication or contradiction of the root.
3.  **Archive, Never Delete**: Deprecated content is moved to `archive/` preserving structure. Nothing is permanently deleted without explicit instruction.

## 🕹️ Operational Control

*   **Centralized Command**: `BOARD.yaml`'s `active_mode` (at root level) controls the global session state.
*   **Individual Layer Control**: The `sub_layer_control` section in `BOARD.yaml` specifies local modes for each individual layer (hustler, scaler, custom_projects).
*   **Global Precedence**: If `active_mode` is set to a `FULL-` mode (e.g., `FULL-AUTO`), it overrides all individual sub-layer settings.
