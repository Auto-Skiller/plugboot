# 🤖 AGENTS

> [!IMPORTANT]
> This is the root pointer file for all agents landing in this workspace.
> The full operating system context lives inside `.brain/`.
>
> **The Core System:**
> - `.brain/` — Identity, rules, persona, engines, and control registries
> - `.toolbox/` — Capability stack (agentic, business, engineering, life, studio)
> - `.scope/` — Operational data (context and missions) segregated by workflow
> - `BOARD.yaml` — Central Command (mode, goals, active scopes, comms)
>
> **Registries & Routing** (Index for finding context and skills):
> - Toolbox Registries: `.brain/.toolbox.control/`
> - Context Registries: `.brain/.context.control/`
> - Missions Registries: `.brain/.missions.control/`
>
> **Execution Workspaces**:
> - `_pipelines/` — Continuous workflow deliverables (e.g. hustler, scaler)
> - `_projects/` — Direct bounded builds (codebases, assets)

We are not building "an agent" — we are building the **Substrate** (The Agentic OS v5) that allows any world-class agent (Claude, Gemini, Hermes, etc.) to land in this workspace and immediately become 10x more autonomous and capable.

The "Perfect System" is one where the workspace provides the **Senses** (Registries), the **Memory** (`BOARD.yaml`), and the **Muscles** (Toolbox Skills), while the agents provide the "Brain" to follow the 10-step Execution Flow defined in `.brain/Orchestration & Flow.md`.