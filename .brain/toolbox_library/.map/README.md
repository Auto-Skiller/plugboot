# 🧰 Toolbox Library — Agentic OS v5

The **muscles** of the Agentic OS. This library provides all cognitive capabilities and domain skills
available to any agent landing in this workspace.

> [!IMPORTANT]
> **Never navigate this directory by guessing paths.**
> Always enter via `.brain/meta.router/toolbox_library.router.yaml` — it is the authoritative index.

---

## Architecture: Two Tiers

### Tier 1 — Core Toolboxes (`core.toolbox/`)

Universal cognitive primitives available to **all agents in all contexts**, regardless of domain.
These are the foundational thinking muscles of the OS.

| Toolbox | Primary Skill | Maturity |
|---|---|---|
| `analysis` | `analyze-context` | functional |
| `benchmarking` | `compare-options` | functional |
| `brainstorming` | `generate-ideas` | functional |
| `communication` | `format-output` | functional |
| `documentation` | `write-docs` | functional |
| `evaluation` | `assess-quality` | functional |
| `notebooklm` | `notebooklm-py` | battle-tested |
| `planning` | `determine-next-steps` | functional |
| `rag` | `pyragify` | hardened |
| `research` | `resolve-knowledge-gaps` | functional |
| `synthesis` | `synthesize-findings` | functional |
| `validation` | `validate-schema` | functional |

### Tier 2 — Extended Toolboxes (`extended.toolbox/`)

Domain-specialized capabilities, grouped by domain wrapper. Each domain contains sub-toolboxes.

| Domain | Sub-toolboxes | Status |
|---|---|---|
| `business.toolbox/` | 13 sub-toolboxes | 🔴 Empty — awaiting Scaler population |
| `engineering.toolbox/` | 15 sub-toolboxes | 🔴 Empty — awaiting Scaler population |
| `life.toolbox/` | 13 sub-toolboxes | 🔴 Empty — awaiting Scaler population |
| `studio.toolbox/` | 11 sub-toolboxes | 🔴 Empty — awaiting Scaler population |

---

## Skill Maturity Scale

Every skill has a `maturity` field in its `SKILL.md` frontmatter:

| Level | Meaning | Agent Guidance |
|---|---|---|
| `stub` | Steps defined, no real execution logic | Use only for low-stakes, exploratory tasks |
| `functional` | Steps work reliably for common cases | Safe for most tasks |
| `hardened` | Edge cases handled, tested against real inputs | Preferred for complex tasks |
| `battle-tested` | Production-proven, real usage history | Use for mission-critical execution |

---

## Skill File Structure

Each skill lives in:
```
[toolbox]/skills/[skill-name]/
├── SKILL.md          ← Schema + steps (frontmatter + body)
└── execution/        ← Optional: prompt templates, scripts, examples
    ├── prompt.md
    ├── script.py
    └── examples/
```

---

## Agent File Structure

Each agent lives in:
```
[toolbox]/agents/
└── [agent-name].md   ← AGENT.md schema: name, specialization, capabilities, triggers
```

---

## Navigation

```
.brain/
└── meta.router/
    └── toolbox_library.router.yaml   ← START HERE
```

The router lists every toolbox with its `path`, `yaml_path`, `description`, `when_to_use`,
`skill_count`, `agent_count`, and `health` block.
