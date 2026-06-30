# BREIF.md — DZ AGENTS Course Project

## 🎯 Vision

Create a comprehensive, Arabic-language course that teaches Algerian developers and students how to **build, deploy, and manage autonomous AI agents** using the Agentic OS v5.3 framework.

The course bridges the gap between global AI agent technology and the Algerian tech community, making agent development accessible to Arabic speakers.

---

## 📚 Course Structure

### Module 1: أساسيات الوكلاء الذكيين (Agent Fundamentals)
- What is an Autonomous Agent?
- Architecture of an Agent (Senses, Memory, Muscles)
- The Agentic OS v5.3 Three-Pillar Model
- Your First 10 Minutes with an Agent

### Module 2: بناء شخصية العامل (Agent Identity & Laws)
- meta_identity/ — Defining Who Your Agent Is
- Hard Laws vs. Soft Guidelines
- The Boot Sequence (BOOT-00 → BOOT-03)
- Permissions and Modes (AUTO, STRICT, COLLAB, MANUAL)

### Module 3: ذاكرة العامل (Memory & State)
- meta_os.yaml — The Master Index
- CONTROLER.yaml — Active Operational State
- Ledgers: Tracking Data Inward & Outward
- Freshness, Sync, and Health Checks

### Module 4: أدوات العامل (Toolboxes & Skills)
- Anatomy of a Toolbox
- SKILL.md and AGENT.md Standards
- Creating Your First Skill
- Domain Toolboxes: Engineering, Studio, Business, Life

### Module 5: خط أنابيب التوسع (Scaler Pipeline — System Evolution)
- 5-Phase Execution: Discovery → Mapping → Capability Engineering → Proposing → Integration
- Proposal Cards (v3.1 YAML)
- Mode-Aware Integration (PLANNING vs EXECUTION)
- Gateway Lifecycle

### Module 6: خط أنابيب الاكتشاف (Hustler Pipeline — Product Discovery)
- INGESTION → PROCESSING → Productization
- Gap Detection and Closure
- Product Cards and Feature Validation

### Module 7: بناء وإدارة المشروع (Projects in Agentic OS)
- Project Structure (.projects_identity, .projects_db, .projects_milestones)
- BREIF.md and AGENT.md for Projects
- Milestone-Driven Development
- Integration with Pipelines

### Module 8: التشغيل والصيانة (Operations & Self-Heal)
- The Meta Engine Sync Daemon
- System Errors and Repair Protocols
- Zero-Drift Audit Logic
- Portability Law (Cross-OS Deployment)

### Module 9: مشروع تطبيقي (Capstone Project)
- Build a Complete Agent from Scratch
- Compass Agent for Algerian Students
- Deploy with meta_engine.py
- Final Review and Showcase

---

## 🔧 Technical Stack

| Component | Technology |
|-----------|------------|
| Framework | Agentic OS v5.3 |
| Languages | Arabic (content), YAML (config), Python (engine) |
| Format | YAML frontmatter + Markdown body |
| Tools | VS Code, Git Bash, Hermes Agent |

## 📁 Project Layout

```
projects/dz-agents/
├── .projects_identity/    # Identity laws for the project
├── .projects_db/          # Runtime state DB
├── .projects_milestones/  # Course milestone tracking
├── .projects_runtime/     # Scratch/auth/archive
├── content/               # Written course content
├── lessons/               # Individual lesson files (AR)
├── templates/             # SKILL.md / AGENT.md templates
├── examples/              # Example agents and configs
└── BREIF.md               # This file
```

## 👥 Target Audience
- Algerian university students (CS/AI)
- Algerian startup founders
- Arabic-speaking developers worldwide
- No prior agent experience required

## 📅 Timeline
- Module 1-3: Foundation (Week 1-2)
- Module 4-6: Core Skills (Week 3-5)
- Module 7-8: Advanced (Week 6-7)
- Module 9: Capstone (Week 8)

## ✅ Success Criteria
- 9 complete modules with Arabic content
- Working example agents deployed in workspace
- Community contribution guidelines
- All lessons pass yaml.safe_load validation
