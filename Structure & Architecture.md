
```
open-workspace/
|
├── AGENTS.md           # Agent identity, behaviors, and core system rules
├── board.yaml          # Real-time session board for goals and mode tracking (Master State)
├── Board Guide.md      # Master Guide for board operations and goal schema
├── index.yaml          # The Library Domain/Department index for Agents & Skills
│
├── _agents_brain/      # The Factory Floor (Execution & Orchestration): Where agents operate and think
├── _projects/          # Operations: Resulting work, pipelines, and projects
|   ├── _custom_projects/
|   └── _pipeline_projects/
├── _archive/           # History: Preserved deprecated content
│
├── agents/             # Personas: {domain}/{department}.md
└── skills/             # Capabilities: {domain}/{department}/
    ├── _rules/         # Shared departmental constraints
    ├── _knowledge/     # The Agentic Database (facts, gaps, blueprints)
    ├── _templates/     # Standard output formats
    ├── _scripts/       # Automation logic
    ├── _workflows/     # Step-by-step departmental processes
    ├── {department}.yaml # Master guide & resource index
    └── {skill-name}/   # Optional standard skills (contains SKILL.md)
```

## Core Philosophy
- Autonomous Goals-powered workspace for AI agents (Claude Code, Cursor, Codex, Jules, Antigravity, OpenClaw) to Amplify human vision so they can focus on strategy and direction.
- Agents can manage projects and build products using a pipeline system and massive powers (agents and skills with RAG knowledge, Executable commands, Coding rules, Reusable templates, Automation scripts ...)
- This workspace is designed for **autonomous operation**. Human operators set strategic direction and goals, while AI agents execute autonomously to deliver revenue-generating products and services.


## Indexing System

You have an automated indexing system to track contents of `agents/` and `skills/` using a unified `index.yaml` tracking file.

## Skills Architecture

The `skills/` directory is the core of the system's capability and memory. It follows a strict **Domain/Department** taxonomy.

### 1. Department Structure
Each department folder (e.g., `skills/engineering/devops/`) is a self-contained unit:
- **Resource Folders (`_`)**: Standardized repositories for shared assets (`_rules`, `_knowledge`, `_templates`, `_scripts`, `_workflows`) for department-spesific Blueprints, Facts and references.
- **Master Guide (`{department}.yaml`)**: The source of truth for the department. It contains a detailed index of all resources (files and folders within `_` directories) and optional standard skills, each with descriptions of their role and utility.
- **Standard Skills**: Sub-folders containing a `SKILL.md` file and optional resources for extra capabilities.
