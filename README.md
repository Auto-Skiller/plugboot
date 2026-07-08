<div align="center">
<h1>🧠 Agentic OS</h1>
<p><em>A portable, declarative workspace + dashboard that turns any LLM or agent
harness into your project manager — while all state stays under the OS's rules.</em></p>
</div>

---

## What is this?

A **portable operating-system workspace** for business owners, project managers,
and data analysts. Drop any harness (Claude Code, Hermes, Codex, Antigravity,
Gemini CLI, …) into it and it becomes the manager of your projects. A "project"
can be anything: a codebase, a business needing growth/marketing, a YouTube
channel, legal/land documents with procedures — anything that needs managing.

The harness is a **layer below** the OS. We borrow its intelligence (planning,
memory, tools); the OS keeps every plan and all state under its own structure.

## Architecture

```
open-workspace/
├── AGENTS.md            # boot pointer for any agent
├── config.yaml          # global control + entity activation
├── index.yaml           # workspace map (engine-maintained)
│
├── .infra/
│   ├── backend/         # single Python process: sync daemon + Starlette dashboard
│   ├── frontend/        # htmx + Alpine + Cytoscape + SSE dashboard
│   ├── schemas/         # YAML schemas (the contracts)
│   └── templates/       # board templates
│
├── _os/                 # the always-on orchestrator entity
│   ├── os-board.md       #   dashboard / identity (editable)
│   ├── os-runtime.yaml   #   live values, fill_queue, pillars, evolution objectives
│   ├── os_prompts/       #   the agent laws (identity, behavior, missions, evolution…)
│   ├── os-missions.yaml  #   standard | research | evolution missions
│   ├── os-toolboxes.yaml #   capabilities (domains -> toolboxes -> agents/skills)
│   └── os-inbox.yaml     #   brain over os-inbox/ (raw + .gateway pillars)
│
└── <project>/          # same shape as _os, per project
```

## How it works

- **YAMLs are the control plane AND the agents' memory/brain.** The daemon keeps a
  pre-filled index so agents know what they have without re-reading every file.
- **The daemon** (`.infra/backend/daemon.py`) syncs every few seconds: stamps
  freshness, reconciles the machine-index, and flags new files in `fill_queue`
  for the agent to describe.
- **The dashboard** previews every YAML, toggles controls, edits boards, and shows
  agent output live via SSE.
- **Missions** drive work: standard (with rounds), research, and evolution
  (parameters for the OS's self-improvement — the old Scaler, now dissolved into
  `_os/os_prompts/04_evolution.md`).

## Run

```bash
pip install -r .infra/backend/requirements.txt
python .infra/backend/daemon.py     # dashboard on http://127.0.0.1:8000
```

## Design decisions

See the decision records: single-process Python daemon + dashboard, simple writes
with git as the recovery net, convention-first harness bridge, htmx+Alpine+
Cytoscape+SSE dashboard. Concurrency posture: free editing, no locks — revisit
only if a real clobber appears during a long autonomous run.
