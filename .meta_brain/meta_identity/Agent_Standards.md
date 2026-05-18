# 🤖 Agent Standards

This document defines the standards for creating and managing agent files in the Agentic OS.

## Agent Schema

All agent files must follow the `AGENT.md` schema. This ensures that the system can parse and understand the capabilities of each agent.

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
