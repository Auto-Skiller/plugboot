---
name: INDEX
type: Navigation
description: Master navigation index and structure reference for the open-workspace
---

## Root Structure

```
open-workspace/
|
├── AGENTS.md           # Agent identity, Behaviors + routings
├── INDEX.md            # Navigation Structure index
├── BOARD.md            # Task and goal management board
│
├── _projects/          # Projects OS — project management
├── _pipelines/         # Pipeline OS — product pipeline management
│
├── agents/             # AI role definitions (domain-partitioned)
├── knowledge/          # General reference materials
├── skills/             # Domain skills, knowledge and workflows
├── commands/           # Executable prompts (slash commands)
├── rules/              # Coding standards (flat, language-prefixed)
├── templates/          # Reusable scaffolding templates
├── scripts/            # Workspace utilities and automation
|
└── _archive/           # Archived content (deleted items go here)
```

---

## Navigation & Usage Guide

To saves tokens and reduces hallucination:

- Read index files first to decide whether to explore deeper, Every folder root must have a `INDEX.md` that answers:
1. **What** is in this folder?
2. **When** should the AI read files from here?
3. **How** to navigate and use the contents?

- Use the correct Navigation Behavior for each Structure Pattern:
**Domain** -> Semantic routing → prune search space
**Nested** -> Encapsulated context → read as module
**Flat** -> Single list_dir → global visibility

| Folder | Content Type | When to read | Structure | AI Navigation Pattern |
|--------|--------------|--------------|-----------|-----------------------|
| `agents/` | AI role definitions | When task requires delegating to a specialized agent role | **Domain** | Semantic routing by domain |
| `knowledge/` | Reference Materials (docs, ADRs, guides) | When task requires architectural context, historical decisions, or deep domain knowledge | **Nested** | Encapsulated execution context |
| `skills/` | Capabilities and workflows | When task requires specific capability or domain knowledge | **Domain** | Semantic routing by task type |
| `commands/` | Executable prompts| When user invokes a slash command or task matches a known command pattern | **Domain**  | Semantic routing by tool/action |
| `rules/` | Language/framework Coding standards | Before writing or modifying code — check applicable rules for the target language/framework | **Flat** | Single list_dir — global visibility |
| `templates/` | Reusable Scaffolding templates | When scaffolding new files, components, or project structures | **Domain** | Semantic routing by output type |
| `scripts/` | Automation & Workspace utilities | When task requires automation or custom tooling | **Flat** or **Nested** | Direct execution or module-based |
| `_projects/` | Project data | When managing Gustom projects, personal initiatives | **Nested** | Encapsulated project context |
| `_pipelines/` | Product pipeline data | When managing product pipelines, revenue-generating focuses, or automated production workflows | **Nested** | Encapsulated pipeline context |

---

## Detailed Core Structures

### `/agents/` — AI Role Definitions
```
agents/
├── INDEX.md                   # Index: agent routing schema and frontmatter spec
├── domain/                     # Domain partition (e.g., frontend, backend, data)
│   └── `[domain]-[role].md`    # Agent definition with YAML frontmatter (Semantic routing by role and domain naming)
```

### `/knowledge/` — Reference Materials
```
knowledge/
├── INDEX.md                   # THE MASTER MAP — crucial for AI RAG
├── architecture/
│   ├── adrs/                   # Architecture Decision Records
│   ├── diagrams/               # Visual architecture references
│   └── docs/                   # Living docs
├── domain-guides/
|   └── [domain].md             # Deep-dive domain knowledge
```

### `/skills/` — Domain Skills and Workflows
```
skills/
├── INDEX.md                   # Index: skill discovery and usage patterns
├── domain/                     # Domain partition (e.g., api, testing, devops)
│   └── skill-name/             # Skill module (may include multiple files)
│       ├── skill.md            # Main skill definition
│       └── helpers/            # Optional helper files
```

### `/commands/` — Executable Prompts
```
commands/
├── INDEX.md                   # Index: command catalog and invocation patterns
├── domain/                     # Domain partition (e.g., git, docker, review)
│   └── `[action]-[target].md`  # Slash command definition (Action-oriented naming)
```

### `/rules/` — Coding Standards (FLAT)
```
rules/
├── INDEX.md                   # Index: rules matrix and applicability
├── `common-[category].md`      # Applies to ALL code
├── `[language]-[category].md`  # Only for .language files (Alphabetical clustering, clear applicability)
```

### `/templates/` — Reusable Scaffolding
```
templates/
├── INDEX.md              # Index: template catalog and usage
├── domain/                # Domain partition (e.g., api, component, test)
|   └── `[output-type].md` # Template with placeholders (Clear output expectation)
```

### `/scripts/` — Workspace Utilities
```
scripts/
├── INDEX.md              # Index: available scripts and usage
├── utils/                 # Utility scripts
└── automation/            # Automated workflows
```

---

## Detailed `/_projects/` OS Structure
```
_projects/ 
├── _archive-projects/     # Archived projects
|        
├── PROJECTS.md            # Active projects registry
├── PROJECTS-MANAGMENT.md  # Projects orchestration guide
|
├── projects-managment/    # Active projects orchestration
└── projects/              # Active projects instances
    └── [project-name]/
        └── PROJECT.md     # Project documentation
```

---

## Detailed `/_pipelines/` OS Structure

```
_pipelines/
├── _archive-pipelines/    # Archived pipelines
|
├── PIPELINES.md           # Active pipelines registry
├── PIPELINES-MANAGMENT.md # Pipelines orchestration guide
|
├── pipelines-managment/   # Active pipelines orchestration
└── pipelines/             # Active pipelines instances
    └── [pipeline-name]/
        └── PIPELINE.md    # Pipeline documentation

```

---
