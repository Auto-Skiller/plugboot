# Engine Architecture & Context Control Audit (AUDIT-01)

## Overview
This audit examines the `context_control` system architecture across `.engines`, `.brain/` configuration folders, and the master routing map `.brain/.catalogs.index.yaml`.

## Gaps Identified

### 1. Cataloger Engine Protocol Hardcoding
**Location:** `.engines/.context_control.engine/cataloger.engine.md` (Phase 2)
**Issue:** The Cataloger specifies that it filters to target "only individual `.md` files within `skills/` and `agents/` subdirectories". This explicitly hardcodes the `.toolbox` directory structure. As a result, the Cataloger engine will fail or incorrectly filter when attempting to catalog `.knowledge`, `.engines`, or `.missions` directories which have entirely different structures (e.g., `definitions/`, `runs/`, or simple hierarchical `.md` files).
**Solution:** Make the Cataloger dynamically read filtering criteria from the respective `*.rules.yaml` file instead of hardcoding `skills/` and `agents/`. Introduce a `target_structure` or `include_patterns` field in the rules files.

### 2. Missing Files and Broken References in Master Index
**Location:** `.brain/.catalogs.index.yaml` vs `.brain/.missions.context_control/`
**Issue:** The Master Index contains paths that do not exist or are misplaced in the file system.
- It references `.missions.context_control/definitions.missions.catalog.yaml`, which is completely missing from the directory.
- It references `.missions.context_control/runs/core.missions.catalog.yaml`, but the actual file is located at `.missions.context_control/core.missions.catalog.yaml` (the `runs/` subdirectory is missing).
**Solution:** Fix the directory structures to match `.catalogs.index.yaml`, creating the missing `definitions.missions.catalog.yaml` and moving `core.missions.catalog.yaml` into a `runs/` subdirectory. Alternately, update `.catalogs.index.yaml` to reflect the actual file locations.

### 3. Inconsistent Path Resolution
**Location:** `.brain/.catalogs.index.yaml`
**Issue:** The paths in `.catalogs.index.yaml` are relative to the `.brain/` directory (e.g., `.knowledge.context_control/core.knowledge.catalog.yaml`), whereas inside the catalogs themselves (e.g., `core.knowledge.catalog.yaml`), paths are root-relative (e.g., `source: ".scope/.core/.knowledge/"`).
**Solution:** Standardize all path references across the OS to be root-relative (e.g., `.brain/.knowledge.context_control/...`). This avoids execution-context bugs depending on where the orchestration scripts are run from.

### 4. Context Control Fragmentation
**Location:** `.brain/*_context_control/`
**Issue:** Having 4 separate `context_control` folders in `.brain/` (`.engines.context_control`, `.knowledge.context_control`, `.missions.context_control`, `.toolbox.context_control`) fragments the rules and registries unnecessarily, especially when their schemas are fundamentally similar.
**Solution:** Consolidate all context control configuration into a single `.brain/.context_control/` directory with subdirectories for each domain. This creates a more cohesive "Senses" registry system for the OS.

## Conclusion
The `context_control` subsystem requires immediate decoupling of its cataloging logic from `.toolbox` structures, and a cleanup of broken references in `.catalogs.index.yaml`. Implementing root-relative paths and unifying the configuration directories will significantly improve the substrate's stability.
