# HIERARCHY: MULTI-LAYER SYSTEM

The `open-workspace` is organized into hierarchical layers to ensure modularity and centralized control.

## 🌌 Multi-Layer Architecture

1.  **Root Layer**: 
    - The definitive source of truth for the entire workspace.
    - Contains: `.brain/`, `_core/`, `_departments/`, `_tools/`.
    - Key Files: `AGENTS.md`, `BOARD.yaml`, `INDEX.json`.
    - Root rules and global overrides apply across all sub-layers.

## ⚓ The Anchor Principles

1.  **Zero Drift**: Sub-layers do not need to check if the root is "ready" or "compatible." They are built to be 100% compliant with the root's current state at all times.
2.  **Global Inheritance**: Sub-layers strictly inherit all root context. Any local rule in a sub-layer must be a **specialization**, never a duplication or contradiction of the root.

2.  **Sub-Layers**: 
    - Specialized environments (e.g., `AUTO_SKILLER`, `AUTO_HUSTLER`).
    - Each sub-layer maintains its own:
        - **Rulebook**: Minimal pointer MD file.
        - **Board**: `{layer}-BOARD.yaml` for local task tracking.
        - **Index**: `{layer}-brain.json` for local resource tracking.
    - Local modes are respected unless a Global Override is active.

## 🕹️ Operational Control

*   **Centralized Command**: The Root `BOARD.yaml`'s `active_mode` controls the global state.
*   **Individual Layer Control**: The `sub_layer_control` section in the root board specifies local modes for each individual layer.
*   **Global Precedence**: If `active_mode` is set to a `FULL-` mode (e.g., `FULL-AUTO`), it overrides all individual sub-layer settings.
