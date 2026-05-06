# 🧠 Core Knowledge Base

This file contains evergreen domain knowledge that applies globally across all pipelines and projects.

*Currently empty. Populate as system-wide discoveries are made.*

## Agentic OS v5 System Gaps (Found 2026-05-05)

During the CORE-01 System Gap Analysis, the following structural gaps were discovered in the OS setup:

1. **Empty Toolboxes**: The `.toolbox/` domain directories lack actual `.md` skill files and agent files in their `skills/` and `agents/` subdirectories. They are structurally empty.
2. **Registry/Rules Mismatch**: `.brain/.toolbox.context_control/toolbox.rules.yaml` defines that skills and agents should be `.md` files in `skills/` and `agents/` directories. However, the index currently indexes the root of the domain folder (e.g., `.toolbox/.agentic_toolbox/analysis/`), instead of the specific `.md` files. This breaks the Router Engine.

**Required Fixes**:
- Define standardized `.md` skill and agent files in the toolboxes.
- Update the Cataloger engine to correctly index individual `.md` files.
- Refresh all registries.
