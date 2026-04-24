---
name: BOARD
type: Operations
description: Real-time session board for mode tracking, goal management, and agent-user communication
---

## Current Mode

| Mode | Status |
|------|--------|
| NORMAL 🔴 | Follow director commands |
| COLLAB 🟡 | Partner on decisions |
| AUTO 🟢 | Act autonomously |

**Active Mode:** `AUTO` *(update this when mode changes)*

---

## A2U / U2A Notes

### Agent Notes → User

<!-- Agent: Leave questions, findings, or decisions here -->

### User Notes → Agent

<!-- User: Leave instructions, feedback, or context here -->

---

## Tracker

### Backlog

<!-- Future goals, not yet started -->

### Active Goals

- [x] Restructure `rules/` directory
  - Status: Completed
  - Project: Workspace Structural Alignment
  - Notes: Convert from Nested (e.g. `rules/cpp/coding-style.md`) to Flat (`rules/cpp-coding-style.md`).
- [x] Restructure `agents/` directory
  - Status: Completed
  - Project: Workspace Structural Alignment
  - Notes: Convert from Flat to Domain partitioned (`agents/[domain]/[role].md`).
- [x] Restructure `commands/` directory
  - Status: Completed
  - Project: Workspace Structural Alignment
  - Notes: Convert from Flat to Domain partitioned (`commands/[domain]/[action]-[target].md`).
- [x] Restructure `templates/` directory
  - Status: Completed
  - Project: Workspace Structural Alignment
  - Notes: Convert from Flat to Domain partitioned (`templates/[domain]/[output-type].md`).
- [x] Restructure `knowledge/` directory
  - Status: Completed
  - Project: Workspace Structural Alignment
  - Notes: Convert from Flat to Nested, organizing files into `knowledge/architecture/` and `knowledge/domain-guides/`.

<!-- Format:
- [ ] Goal description
  - Status: PHASE
  - Project: project-name
  - Notes: ...
-->

### Completed

<!-- Recently completed goals (archive periodically) -->

---

## Session Log

<!-- Log session outcomes, blockers, next steps -->

--- 

## Context

- Location: Algeria
- Timezone: GMT+1, Africa/Algiers
- Languages: English/French/Arabic/Darija

**Strengths:** What am I best at?
- Agentic System Design, Workflow Architecture, Agentic skills
- Business Automations, Product Pipelines Managment
- Research Synthesis, Coding, Images Generation

**Backgrounds:** What am I interested in ?
- Trending Frelance Services, Automation Business, AI Tools
- Trending Github Repos 
- Social Media and Youtube Trends

**Windows Compatibility**
- No WSL or Unix-only tools, Use PowerShell or cross-platform tools
- No symlinks (break on Windows)
- No reserved names: `CON`, `PRN`, `AUX`, `NUL`, `COM1-9`, `LPT1-9`
- Max path length: 260 characters (use short folder names, avoid deep nesting)
- Case-insensitive: `Agents/` = `agents/` — be consistent

---