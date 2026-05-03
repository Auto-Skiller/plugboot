# HIERARCHY: MULTI-LAYER SYSTEM

The `open-workspace` is organized into hierarchical layers to ensure modularity and centralized control.

## 🌌 Multi-Layer Architecture

1.  **Root Layer (The OS)**: 
    - The definitive source of truth for the entire workspace.
    - Contains: `.brain/` (Identity), `.library/` (Capabilities), `.missions/` (State), `.registry/` (Logic).
    - Key Files: `\.brain\.core_brain\AGENTS.md`, `\.brain\.core_brain\Hierarchy.md`.
    - Root rules and global overrides apply across all sub-layers.

## ⚓ The Anchor Principles

1.  **Zero Drift**: Sub-layers (Pipelines) do not need to check if the root is "ready." They are built to be 100% compliant with the root's current state.
2.  **Global Inheritance**: Sub-layers strictly inherit all root identity and capability stack. Any local rule in a sub-layer must be a **specialization**, never a duplication or contradiction of the root.

2.  **Execution Pipelines (The Agents)**: 
    - Specialized environments (`_pipelines/hustler`, `_pipelines/scaler`).
    - Each pipeline maintains its own logic in `.brain/pipelines-brain/` and tracks progress in `.missions/pipelines-missions/`.
    - Local modes are respected unless a Global Override is active.

## 🕹️ Operational Control

*   **Centralized Command**: The Root `core_missions.yaml`'s `active_mode` (in `.missions/.core_missions/`) controls the global state.
*   **Individual Layer Control**: The `sub_layer_control` section in the root board specifies local modes for each individual layer.
*   **Global Precedence**: If `active_mode` is set to a `FULL-` mode (e.g., `FULL-AUTO`), it overrides all individual sub-layer settings.
