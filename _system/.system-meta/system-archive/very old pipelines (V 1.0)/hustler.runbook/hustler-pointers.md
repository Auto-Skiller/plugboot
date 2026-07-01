# Hustler Pipeline — Operational Pointers

> [!IMPORTANT]
> This is the operational pointer file for the HUSTLER pipeline scope.
> **Operational Status**: This sub-layer is controlled by the root `BOARD.yaml`.

## Key References

- **Local Board**: `_pipelines/hustler/HUSTLER-BOARD.yaml` (relative to workspace root)
- **Global Hierarchy**: `.brain/Hierarchy.md` — Multi-Layer inheritance details
- **Pipeline Scope**: `.scope/pipelines/hustler/`

## Core Operational Rules

- For operational rules and capabilities, refer to `.brain/` (core rules apply to all scopes).
- Pipeline-specific knowledge lives in `.scope/pipelines/hustler/.knowledge/`.
- Cross-scope access is **prohibited** — knowledge elevates to `.scope/.core/` via distillation only.
- This scope operates under `scope_modes` as defined in root `BOARD.yaml`.
