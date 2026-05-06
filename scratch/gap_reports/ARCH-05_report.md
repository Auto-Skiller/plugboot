# ARCH-05: Data Segregation & Persistence Audit 📊

## Goal
Audit `.scope/` structure to prevent cross-scope data leakage and ensure knowledge distillation mechanisms are architecturally sound.

## Findings
1. **Directory Structure Validation**:
   - The overall `.scope/` directory properly isolates operational data structurally by separating `pipelines/`, `projects/`, and `.core/`. Each scope contains isolated `.knowledge/` and `.missions/` directories.

2. **Cross-Scope Data Leakage Risks**:
   - There are currently no explicit programmatic boundary rules defined in `.brain/Rules_And_Considerations.md` to prevent one pipeline (e.g., `hustler`) from directly reading/writing to the operational scope of another pipeline (e.g., `scaler`) or directly modifying `.core`.

3. **Persistence and Portability Violations**:
   - The file `.scope/pipelines/hustler/.knowledge/.hustler.md` contains absolute paths specific to a Windows host (`C:/Users/...`) pointing to `_pipelines/hustler/HUSTLER-BOARD.yaml`. This violates the OS v5 portability requirement and contradicts the centralized `BOARD.yaml` design.
   - Files like `.hustler.md` and `.scaler.md` violate the naming standards established in `.brain/.knowledge.context_control/knowledge.rules.yaml` which mandates `kebab-case.md` for context files.

4. **Knowledge Distillation Enforcement**:
   - The "Post-Mission Distillation Protocol" is documented in `.brain/Orchestration_And_Flow.md`, however, there are no structural guards ensuring this process appends safely to `.scope/.core/.knowledge/knowledge.md` without arbitrarily rewriting existing global knowledge.

## Proposed System-Level Code Fixes

1. **Standardize Naming and Portability**:
   - Rename `.scope/pipelines/hustler/.knowledge/.hustler.md` to a compliant format (e.g., `hustler-pointers.md`) or remove it if redundant.
   - Clean up absolute OS-specific paths in any knowledge files to use relative paths anchored to the workspace root.

2. **Enforce Isolation Rules**:
   - Update `.brain/Rules_And_Considerations.md` to explicitly forbid cross-scope file access (e.g., "Agents operating in `.scope/pipelines/hustler/` MUST NOT read or write to `.scope/pipelines/scaler/` or `.scope/projects/` directly. Knowledge must be passed up to `.core/` via distillation").

3. **Secure Distillation Process**:
   - Define strict constraints on how Step 10 interacts with `.scope/.core/.knowledge/knowledge.md` (e.g., "append only", "use atomic locks") in the domain-specific rules.
