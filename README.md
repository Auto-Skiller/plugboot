<div align="center">
  <h1>Agentic OS v7</h1>
  <p><em>A portable workspace-as-operating-system. Any LLM or agent harness lands in it and becomes your project manager — without taking control of the workspace itself.</em></p>
</div>

---

## What is this?

Agentic OS is a portable workspace, not an agent. Point any frontier harness at it (Claude Code, Hermes, Codex, Antigravity, Gemini CLI) and it becomes the manager under your hands.

The harness brings the brain (reasoning, planning, memory, tools). We bring the workspace: structure, laws, missions, toolboxes, projects, and a dashboard to control it all. The harness's capabilities are a layer BELOW our workspace — we borrow its power for planning and execution, but every plan and every piece of state strictly stays inside our structure under our rules. The agent never owns our files; it operates them.

This is for business owners, project managers, and data analysts. A project is anything: a business needing growth strategy, a YouTube channel, a codebase, a legal-documents procedure, a content op spanning multiple accounts.

## The core idea

While others build bigger harnesses and train stronger LLMs, we build what plugs into all of them: a portable OS that turns any agent into a persistent, structured, controllable manager that runs for days across many projects without losing the thread.

- YAMLs are the control plane, the memory, and the brain. They track everything, let the dashboard view/switch/edit everything, and pre-fill descriptions of files so agents know what they have without re-reading raw files every time.
- A sync daemon keeps YAMLs aligned with disk and flags gaps for agents to fill.
- A dashboard (htmx + Alpine + Cytoscape + SSE) previews, controls, and edits everything.
- An os_prompt tells the agent exactly what it can do, how, when, and why.

## Architecture

```
open-workspace/
  AGENTS.md            Root pointer, agent boot authority
  README.md            This file
  index.yaml           Workspace map (infra + all entities)
  config.yaml          Global control (activation, autonomy, mission automation)

  _os/                 THE ALWAYS-ON ORCHESTRATOR ENTITY
    os-board.md        Human-facing identity (editable)
    os-runtime.yaml    Live values: pillars, evolution_objectives, queues
    os_prompts.yaml    Machine index of the law files
    os-missions.yaml   Missions (standard / research / evolution)
    os-toolboxes.yaml  Toolbox activation + metadata
    os-inbox.yaml      Inbox + gateway tracker
    os_prompts/        The laws
    os-inbox/          Raw drops + .gateway/ (pillars -> functional groups)

  project_name/        A PROJECT (repeatable)
    project_name-board.md
    project_name-runtime.yaml
    project_name-missions.yaml
    project_name-toolboxes.yaml
    project_name-inbox.yaml
    project_name-data.yaml     Brain over the data folder
    project_name-data/         Anything: code, business DB, content accounts, docs

  .infra/
    backend/           Sync daemon + dashboard server (Starlette, one process)
    frontend/          Dashboard UI (htmx + Alpine + Cytoscape + SSE)
    schemas/           YAML schema definitions (the contract)
    templates/         Board + mission templates
```

Two entity kinds: `_os` (always-on orchestrator) and projects (one folder each). Every entity shares the same anatomy: board, runtime, missions, toolboxes, inbox, and (projects) a data folder + brain.

## The three systems

1. Missions — standard (with rounds/persistent for recurring long-running work), research (parameterized), evolution (sets the parameters for the evolution workflow and tracks it).
2. Evolution — self-improvement folded into the os_prompt. Modes: FAST, DEEP, RESEARCH, INBOX. Detects gaps/best-practices/opportunities, scores by benefit/cost/worth-it.
3. Toolboxes — domains -> toolboxes -> agents + skills, maturity stub -> functional -> hardened -> battle-tested.

## Pillars vs Aspects
- Pillars are dynamic, per entity in its runtime YAML.
- Aspects are fixed, in the os_prompt: Architecture, Capabilities (toolboxes), Monetization. Aspects steer evolution/research focus.

## Quick start

```bash
git clone <repo-url> open-workspace
cd open-workspace
python .infra/backend/daemon.py   # sync + dashboard on :8000
```

Then point your harness at the workspace and read AGENTS.md.
