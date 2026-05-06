# ARCH-04 Capabilities & Modularity Boundaries Audit Report

## Audit Scope
This report reviews the `.toolbox/` architecture for interface leaks, execution isolation issues, and structural dependency flaws as per the ARCH-04 goal.

## Findings

### 1. Structure Adherence & Completeness
The `.toolbox/` architecture correctly adheres to the rules defined in `.brain/.toolbox.context_control/toolbox.rules.yaml`. It correctly branches into `.agentic_toolbox`, `business_toolbox`, `engineering_toolbox`, `life_toolbox`, and `studio_toolbox`, with each domain containing `agents/` and `skills/` directories. Note that many directories contain only `.gitkeep` files, which is expected for scaffolding and is not considered a missing tool flaw.

### 2. Interface Leaks & Namespace Collisions
The current architecture relies heavily on agent adherence and the Router engine reading `description` and `triggers` from the `SKILL.md` frontmatter. There is no strict namespace isolation structurally enforced. For example, a `write-docs` skill in `.agentic_toolbox/documentation/skills/` could easily conflict with a potential `write-docs` skill in `engineering_toolbox/frontend/skills/` if the triggers overlap. This is an interface leak where the boundaries between toolboxes are not hard-enforced.
**Proposed System-Level Code Fix:**
Update `.brain/.toolbox.context_control/toolbox.rules.yaml` to enforce unique namespace-prefixed naming conventions for skills (e.g., `agentic.documentation.write-docs`) or enforce validation on triggers to ensure cross-domain uniqueness.

### 3. Execution Isolation
The architecture defines skills as modular directories containing a `SKILL.md` file. Execution isolation relies purely on the agent interpreting the `SKILL.md` independently. There are no structural sandboxes or execution wrappers preventing a skill execution context from polluting another.
**Proposed System-Level Code Fix:**
Introduce an execution boundary protocol in `.engines/` that creates a strict, temporary workspace in `scratch/` or memory constraints for each skill invocation to prevent cross-skill state leakage.

### 4. Structural Dependencies
There is no explicit structural mechanism to declare dependencies between skills (e.g., skill A relies on skill B). Currently, `SKILL.md` only lists `inputs` and `outputs`. This makes the toolbox flat and modular, but complex capabilities that require composing multiple skills have no structural map.
**Proposed System-Level Code Fix:**
Expand the `SKILL.md` frontmatter schema in `toolbox.rules.yaml` to optionally include a `dependencies` array.

## Conclusion
The `.toolbox/` directory is well-organized and modular, but its boundaries are "soft", relying on agent interpretation rather than strict systemic enforcement. Namespace collision prevention and structural execution isolation are the primary gaps.
