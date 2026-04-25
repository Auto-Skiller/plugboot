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

**Active Mode:** `COLLAB` *(update this when mode changes)*

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

- [ ] Structure validation for `agents/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Read files contents. Check that names reflect actual content. Ensure correct files are in correct domains, including `_core-agents/` for system-level files. Skip subfolders: `_custom-agents/`, `_pipelines-agents/`, `_projects-agents/`. For both names and contents: remove plugin references like "gsd" or similar legacy terms, changing them to be standard to our open-workspace.
- [ ] Structure validation for `rules/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Read files contents. Check that names reflect actual content. Ensure correct files are in correct domains, including `_core-rules/` for system-level files. Skip subfolders: `_custom-rules/`, `_pipelines-rules/`, `_projects-rules/`. For both names and contents: remove plugin references like "gsd" or similar legacy terms, changing them to be standard to our open-workspace.
- [ ] Structure validation for `templates/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Read files contents. Check that names reflect actual content. Ensure correct files are in correct domains, including `_core-templates/` for system-level files. Skip subfolders: `_custom-templates/`, `_pipelines-templates/`, `_projects-templates/`. For both names and contents: remove plugin references like "gsd" or similar legacy terms, changing them to be standard to our open-workspace.
- [ ] Structure validation for `scripts/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Read files contents. Check that names reflect actual content. Ensure correct files are in correct domains, including `_core-scripts/` for system-level files. Skip subfolders: `_custom-scripts/`, `_pipelines-scripts/`, `_projects-scripts/`. For both names and contents: remove plugin references like "gsd" or similar legacy terms, changing them to be standard to our open-workspace.

- [ ] Structure validation for `skills/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Read `skills/` folders contents. Check that skill folder names reflect actual content. Ensure correct skills are in correct domains, including `_core-skills/` for system-level skills, `_pipelines-skills/`, and `_projects-skills/`. Skip `_custom-skills/`. For both names and contents: remove plugin references like "gsd" or similar legacy terms, standardizing to open-workspace. Check if any file actually belongs to other folders (`agents/`, `knowledge/`, `rules/`, `templates/`, `scripts/`) - only if not skill-specific (like general ts/python rules).

- [ ] Cross Merging for `agents/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Minimize folders and files strictly without losing any line of logic. Merge files/folders that complement each other, extend the same functionality, or serve the same role.
- [ ] Cross Merging for `knowledge/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Minimize folders and files strictly without losing any line of logic. Merge files/folders that complement each other, extend the same functionality, or serve the same role.
- [ ] Cross Merging for `rules/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Minimize folders and files strictly without losing any line of logic. Merge files/folders that complement each other, extend the same functionality, or serve the same role.
- [ ] Cross Merging for `templates/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Minimize folders and files strictly without losing any line of logic. Merge files/folders that complement each other, extend the same functionality, or serve the same role.
- [ ] Cross Merging for `scripts/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Minimize folders and files strictly without losing any line of logic. Merge files/folders that complement each other, extend the same functionality, or serve the same role.
- [ ] Cross Merging for `skills/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Minimize folders and files strictly without losing any line of logic. Merge files/folders that complement each other, extend the same functionality, or serve the same role.

- [ ] Cross-Folders Pointing Check for `agents/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Update all broken links or outdated references within the `agents/` folder or referencing cross-folders.
- [ ] Cross-Folders Pointing Check for `knowledge/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Update all broken links or outdated references within the `knowledge/` folder or referencing cross-folders.
- [ ] Cross-Folders Pointing Check for `rules/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Update all broken links or outdated references within the `rules/` folder or referencing cross-folders.
- [ ] Cross-Folders Pointing Check for `templates/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Update all broken links or outdated references within the `templates/` folder or referencing cross-folders.
- [ ] Cross-Folders Pointing Check for `scripts/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Update all broken links or outdated references within the `scripts/` folder or referencing cross-folders.
- [ ] Cross-Folders Pointing Check for `skills/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Update all broken links or outdated references within the `skills/` folder or referencing cross-folders.

- [ ] Enhancement & Updating for `agents/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Analyze all files in the folder. Maximize capabilities usage. If a file uses some skills/features from a domain, ensure it leverages everything available from that domain perfectly.
- [ ] Enhancement & Updating for `knowledge/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Analyze all files in the folder. Maximize capabilities usage. If a file uses some skills/features from a domain, ensure it leverages everything available from that domain perfectly.
- [ ] Enhancement & Updating for `rules/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Analyze all files in the folder. Maximize capabilities usage. If a file uses some skills/features from a domain, ensure it leverages everything available from that domain perfectly.
- [ ] Enhancement & Updating for `templates/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Analyze all files in the folder. Maximize capabilities usage. If a file uses some skills/features from a domain, ensure it leverages everything available from that domain perfectly.
- [ ] Enhancement & Updating for `scripts/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Analyze all files in the folder. Maximize capabilities usage. If a file uses some skills/features from a domain, ensure it leverages everything available from that domain perfectly.
- [ ] Enhancement & Updating for `skills/`
  - Status: BACKLOG
  - Project: Workspace Maintenance
  - Notes: Analyze all files in the folder. Maximize capabilities usage. If a file uses some skills/features from a domain, ensure it leverages everything available from that domain perfectly.

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
- [x] Structure validation for `knowledge/`
  - Status: Completed
  - Project: Workspace Maintenance
  - Notes: Removed legacy 'gsd' references, moved system files to `_core-knowledge/` and domain files to new domain folders. Updated `knowledge-index.yaml`.

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

---
