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

### Agent Notes → User <!-- Agent: Leave questions, findings, or decisions here -->



### User Notes → Agent 



<!-- User: Leave instructions, feedback, or context here -->
---

## Tracker

### Active Goals 

- [ ] `skills/` Mingration.
  - Status: BACKLOG
  - Project: Skills Mingration
  - Notes: Move every file from every folder from `skills/` Directly to `_custom/`, if its named as SKILL.md, rename it based on the skill name and move it to `_custom/`.
    
- [ ] Domains folders creation.
 create new folders directly inside the _custom/ directory for each domain : design, project_management, compliance_and_review, quality_assurance, engineering, planning, devops_and_infrastructure, research, ai_and_models, security, multimedia_production, business_and_ops, marketing, tokens_and_crypto, data_engineering, content_and_writing.
 
- [ ] Domains Triage.
  - Status: BACKLOG
  - Project: Domains-relevents Triage
  - Notes: move the related files in `_custom/` into these new folders:
  Read the actual content of the file (not just the name) to understand the logic and accurately determine the correct domain, Group files that complement each other, extend the same functionality, serve the same role or just belongs to the same domain.
  stricly Ensure all correct files are in correct domains.
  change files names to stricly reflect actual content logics.
For design: Focus on UI/UX, branding, typography, components, and static visual design.
For multimedia_production: Focus on video, audio, media generation, animations (lottie/gifs), and presentation generation.
For content_and_writing: Focus on article writing, copywriting, content engines, and presentation/pitch writing.
For marketing: Focus on pitch decks, investor outreach, sales, and SEO.
For other domains: Use the established topical logic.

- [ ] Domains (agents vs skills) Triage.
  - Status: BACKLOG
  - Project: Role-Definition Triage
  - Notes: Domain by Domain : Creat 2 files inside each domain ([domain]-agents/ and [domain]-skills/) :
    Read all files in same domain, identify 2 types of files - agents for files that act as agents, and skills for anything else (skills files, knowlege, workflows, rules, templates and scripts ...) and move them to each ([domain]-agents/ or [domain]-skills/)


<!-- Format: 
- [ ] Goal description  
- Status: PHASE  
- Project: project-name  
- Notes: ... -->

### Completed <!-- Recently completed goals (archive periodically) -->



### Backlog <!-- Future goals, not yet started -->

- [ ] Domains agents.
  - Status: BACKLOG
  - Project: agents Consolidation
  - Notes: Domain by Domain : Read all files in same [domain]-agents/ : 
    in order to consolidate agents Minimize files strictly without losing any line of logic. Merge files that complement each other, extend the same functionality, or serve the same role.
    you can change names to reflect actual content.

- [ ] Domains skills.
  - Status: BACKLOG
  - Project: skills Consolidation
  - Notes: Domain by Domain : Read all files in same [domain]-skills/ : 
    structure : inside each [domain]-skills/ we should have others skills for spesific things as a folder that have a SKILL.md file + optional (knowledge/, rules/, templates/, scripts/) 
    First, Group files that complement each other, extend the same functionality, serve the same role in a skill folder - you can move contents from files to others if it belong to it . stricly Ensure all correct files are in correct skills.
    then, start skill by skill Consolidate contents in a SKILL.md file strictly without losing any line of logic and move others to the optional (knowledge/, rules/, templates/, scripts/) - the SKILL.md file stricly should include pointers to those others same skill files + how, when and why to use them and everything that a SKILL.md file should include - Merge files that complement each other, extend the same functionality, or serve the same role. you can change names to reflect actual content.
    
- [ ] Domains Cross agents/skills usage.
  - Status: BACKLOG
  - Project: Maximize cross capabilities
  - Notes: Domain by Domain : Read all files in ([domain]-agents/ and [domain]-skills/) 
  Maximize capabilities usage. If a file uses some skills/features from a domain, ensure it leverages everything available from that domain perfectly.
  cross-referencing checks : make sure all agents and SKILL.md file mention the domain it belongs to - also all agents should have a note to check all avaiable skills in the [domain]-skills/ folder and pick what need to be used , same for SKILL.md files should mention to see what agents are avaiable for the same doamin in [domain]-agents/ - do not add pathes , just the ([domain-name]-agents/ and [domain-name]-skills/) 

- [ ] projects and pipeline agents and skills TRIAGE
- [ ] Updating and enhancing AGENTS.md, BOARD.md and all core systems
- [ ] crating the README
- [ ] implimenting the pipeline system + adding data types (knowlege, scripts ...)/(youtube-scripts, ...)
- [ ] implimenting the project system
- [ ] adding the tools preferences bellow
- [ ] adding a autoskiller system to eather extand_enhance/adopt_to_bussines skills/agents using the 00-data

---

## Session Log <!-- Log session outcomes, blockers, next steps -->


--- 

## Extra Context (notes To remember)

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

**tools preferences**
https://notebooklm.google.com/
https://www.odoo.com/
https://teable.ai/
https://obsidian.md/

---
