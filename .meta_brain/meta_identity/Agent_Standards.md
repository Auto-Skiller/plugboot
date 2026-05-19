# 🤖 Agent Standards

**Purpose:** Schema and standards for agent and skill files inside `.meta_brain/toolboxes/`, plus the toolbox dependency graph and changelog conventions.
**When to use:** Consult before creating, scoring, or refactoring any agent/skill file under a toolbox folder.

This document defines the standards for creating and managing agent files in the Agentic OS.

## Agent Schema

All agent files must follow the `AGENT.md` schema. This ensures that the system can parse and understand the capabilities of each agent.

### Canonical Location & Validation Owner

Agent files live alongside the toolbox they belong to:
- **Path pattern:** `.meta_brain/toolboxes/<domain>/<area>/<toolbox>/agents/<AGENT_NAME>/AGENT.md`
- **Skill files:** sit beside agents under the same toolbox in a `skills/` subfolder, with their own `SKILL.md` (see `Universal_Portability_Standard §5`).
- **Validator:** `.meta_brain/.meta_routing/meta_sync_engines/toolboxes_sync.py` reads each `AGENT.md` on every master sync, projects the frontmatter into `.meta_routing/toolboxes.yaml`, and flags any required field that is empty or missing. Anything tagged `placeholder: true` in the router was caught by this sweep.
- **Maturity score** is computed by the same engine from `BOOT_CONTRACTS.constants.toolbox_completion_weights` (skills 40, agents 30, execution 20, examples 10) — do not hand-edit `maturity` in the router; fix the source files and re-sync.

### Frontmatter Fields:
- **name**: String. The name of the agent.
- **version**: String. The version of the agent prompt.
- **specialization**: String. The primary role or domain of the agent.
- **parent_toolbox**: String. The toolbox this agent belongs to.
- **model_preference**: String. Preferred AI model (e.g., Gemini, Claude).
- **maturity**: stub | partial | functional | complete.
- **capabilities**: List of strings. What the agent can do.
- **invocation_trigger**: String. When this agent should be used.
- **required_skills**: List of strings. Skills this agent relies on.
- **required_env_vars**: List of strings. Environment variables needed.

---

## Scaler Delivery Protocol

When a Scaler Proposal Card is APPROVED with action INJECT:
1. Write skill files to target toolbox's `skills/` directory.
2. Run sync_engine to remap the router.
3. Health status auto-updates from 'empty' → 'partial' or 'functional'.

---

## Dependency Graph

Cross-toolbox relationships are tracked in the `dependency_graph:` block of `.meta_brain/.meta_routing/toolboxes.yaml`. Edges are validated against the live toolbox set on every sync; broken references are surfaced under `dependency_graph.metadata.broken_references` so agents see them immediately. Add new edges via Scaler `UPGRADE` cards — the toolboxes_sync engine recomputes `total_edges` and the validation timestamp every cycle.

## Toolbox Changelogs

A toolbox's changelog (when one exists) lives next to its manifest as `CHANGELOG.md`. The router's `changelog:` field per toolbox is auto-derived from disk on every sync — if the file isn't there, the field is `null`. Never hand-edit the router's `changelog:` value; create the markdown file and let the engine pick it up.
