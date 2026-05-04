We are not building "an agent" — we are building the **Substrate** (The Agentic OS) that allows any world-class agent (Claude, Gemini, Hermes, etc.) to land in this workspace and immediately become 10x more autonomous and capable.

The "Perfect System" is one where the workspace provides the **Senses** (Toolbox Registry), the **Memory** (BOARD.yaml), and the **Muscles** (Toolbox Skills), while the agents provide the "Brain."

## Architecture Overview

### 🧠 IDENTITY (.brain)
All identity, operating rules, persona, modes, and orchestration logic. Always read first.
- Key files: `AGENTS.md`, `BOARD.yaml`, `.brain/Core Architecture.md`

### 🛠️ CAPABILITIES (.toolbox)
Modular skill folders organized by domain. The execution muscles of the system.
- `.toolbox/.agentic_toolbox/` — Core cognitive loop (analysis, planning, research, etc.)
- `.toolbox/business_toolbox/` — Business domains (sales, marketing, strategy, etc.)
- `.toolbox/engineering_toolbox/` — Technical domains (backend, devops, ai-and-ml, etc.)
- `.toolbox/life_toolbox/` — Personal & lifestyle domains
- `.toolbox/studio_toolbox/` — Creative & production domains

### 📋 STATE (BOARD.yaml)
The unified, real-time source of truth for session mode, active goals, events, and communication.
- Toolbox index: `.brain/.toolbox.control/.toolbox.registry/`