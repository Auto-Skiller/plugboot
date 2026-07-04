<div align="center">
  <h1>🌌 Agentic OS v6.0</h1>
  <p><em>A workspace-as-operating-system that turns any LLM into a deterministic, self-healing, multi-session agent.</em></p>
  <p>
    <a href="#"><img alt="OS Version" src="https://img.shields.io/badge/OS-v6.0-brightgreen"></a>
    <a href="#"><img alt="Architecture" src="https://img.shields.io/badge/Architecture-3--Layer-blue"></a>
    <a href="#"><img alt="Identity" src="https://img.shields.io/badge/Identity_Files-10-orange"></a>
    <a href="#"><img alt="Toolboxes" src="https://img.shields.io/badge/Toolboxes-65+-purple"></a>
    <a href="#"><img alt="Portability" src="https://img.shields.io/badge/Portability-Clone--and--play-success"></a>
  </p>
</div>

---

## What is this?

Agentic OS is **a substrate, not an agent.**

You drop any frontier LLM into this workspace and it stops guessing. It reads a single root pointer file (`AGENTS.md`), picks up its laws from `_system/.system-meta/.system-os_prompts/`, maps the workspace using board and index files, follows a deterministic execution flow, and writes back to those files.

The workspace provides the **Senses** (os_prompts), the **Memory** (boards & indexes), and the **Muscles** (toolboxes & pipelines). The agents provide the Brain.

---

## Core Architecture — The 3 Layers

```
open-workspace/
├── AGENTS.md                              🤖 Root pointer for all agents
├── README.md                              📖 This file
├── index.yaml                             🗺️ Workspace map (infrastructure + all entities)
├── config.yaml                            ⚙️ Global config (modes, profiles, action gates)
│
├── _shared/                               📚 SHARED LIBRARY (used by _system and projects)
│   ├── .shared-pipelines/                 🔄 Shared pipeline definitions
│   │   ├── Scaler/                        📈 Systemic Growth Engine (runbooks, contracts)
│   │   └── Hustler/                       💼 Product Discovery Engine (runbooks, contracts)
│   ├── .shared-toolboxes/                 🧰 65+ skill folders across 5 domains
│   │   ├── agentic/                       🧠 Core cognitive skills
│   │   ├── engineering/                   ⚙️ Engineering skills
│   │   ├── business/                      💰 Business skills
│   │   ├── studio/                        🎨 Creative skills
│   │   └── life/                          🌱 Life skills
│   └── schemas/                           📋 YAML schema definitions
│       ├── board.schema.yaml
│       ├── config-schema.yaml
│       └── index-schema.yaml
│
├── _system/                               🏛️ ALWAYS-ON ORCHESTRATOR
│   ├── system.md                          📖 System overview and purpose
│   ├── system-board.yaml                  📊 System state (`live_state`, `live_hub`)
│   ├── system-index.yaml                  🗂️ System subsystem path map
│   ├── .system-meta/                      🧠 System's own brains
│   │   ├── .system-os_prompts/            📜 Identity laws (10 files)
│   │   ├── .system-pipelines/             🔄 System-only pipeline definitions
│   │   ├── .system-toolboxes/             🧰 System-only toolboxes
│   │   ├── system-archive/                🗃️ Archived system artifacts
│   │   └── system-scratch/                📝 Transient system drafts
│   ├── .system-missions/                  🎯 System-level goals
│   └── .system-pipelines_runtime/         ⚡ Pipeline execution for system work
│       ├── entity-scaler-runtime/         📈 Scaler runtime (INTERNAL/INBOX/RESEARCH)
│       └── entity-hustler-runtime/        💼 Hustler runtime (INTERNAL/INBOX/RESEARCH)
│
├── project_name/                          📦 A PROJECT (self-contained codebase)
│   ├── project_name.md                    📖 Project overview
│   ├── project_name-board.yaml            📊 Project state (`live_state`, `live_hub`)
│   ├── project_name-index.yaml            🗂️ Project subsystem path map
│   ├── .project_name-meta/                🧠 Project's own brains
│   │   ├── .project_name-os_prompts/      📜 Project-specific rules
│   │   ├── .project_name-pipelines/       🔄 Project-only pipeline definitions
│   │   ├── .project_name-toolboxes/       🧰 Project-only toolboxes
│   │   ├── .project_name-archive/         🗃️ Archived project artifacts
│   │   └── .project_name-scratch/         📝 Transient project drafts
│   ├── .project_name-missions/            🎯 Project-specific goals
│   └── .project_name-pipelines_runtime/   ⚡ Pipeline execution for this project
│       ├── entity-scaler-runtime/         📈 Scaler runtime (INTERNAL/INBOX/RESEARCH)
│       └── entity-hustler-runtime/        💼 Hustler runtime (INTERNAL/INBOX/RESEARCH)
│
├── .infra/                                🔧 INFRASTRUCTURE
│   ├── backend/                           ⚙️ Sync engine, boot, daemon scripts
│   └── frontend/                          🖥️ Dashboard UI (HTML/CSS/JS on :8000)
│
└── .stash/                                📦 RUNTIME EPHEMERAL
    ├── .venv/                             🐍 Python virtual environment
    ├── .env/                              🔐 Environment variables
    ├── logs/                              📋 Engine logs
    └── pids/                              🔒 Process PID files
```

---

## What makes it work

| Capability | What it buys you |
|---|---|
| 🏛️ **3-Layer Architecture** | Clean separation: shared resources, system orchestration, project execution. No cross-contamination. |
| 📊 **Board & Index Files** | Zero path hallucinations. Every entity has a board (state) and index (path map). |
| 📜 **Identity Laws** | 10 behavioral law files overriding default agent persona. Located in `_system/.system-meta/.system-os_prompts/`. |
| 🧰 **65+ Shared Toolboxes** | Organized by domain. Discoverable via board files. Available to system and all projects. |
| 🔄 **Pipeline Blueprints** | Pipelines are definitions, not folders. They execute inside each entity's `pipelines_runtime/` in a named `entity-<pipeline>-runtime/` folder. |
| 🔒 **Multi-Session Concurrency** | Zero-Drift protocol. Agents must read fresh disk state before edits. |
| 🌍 **Cross-OS Portability** | Clone on Windows, Linux, or macOS. No global installs. Venv in `.stash/`. |

---

## The Pipeline Execution Model

Pipelines are **blueprints** (definitions + runbooks + contracts) that live in a shared or entity-specific library. They execute **inside the consuming entity's runtime folder**, in a **named runtime folder per pipeline**.

```
Pipeline Definition (blueprint):
  _shared/.shared-pipelines/Scaler/       ← Scaler logic, runbooks, contracts
  _shared/.shared-pipelines/Hustler/      ← Hustler logic, runbooks, contracts

Pipeline Execution (runtime):
  _system/.system-pipelines_runtime/
  ├── entity-scaler-runtime/              ← Scaler running for system work
  └── entity-hustler-runtime/             ← Hustler running for system work

  project_foo/.project_foo-pipelines_runtime/
  ├── entity-scaler-runtime/              ← Scaler running for project_foo
  └── entity-hustler-runtime/             ← Hustler running for project_foo
```

- **Shared pipelines** (`_shared/.shared-pipelines/`) — available to all entities.
- **System pipelines** (`_system/.system-meta/.system-pipelines/`) — system-only.
- **Project pipelines** (`<project>/.<project>-meta/.<project>-pipelines/`) — project-only.

---

## Standard Runtime Layout (per pipeline)

Every pipeline runtime folder (`entity-<pipeline>-runtime/`) follows the same 4-zone layout (`Pipelines_Architecture.md`):

```
entity-scaler-runtime/
├── INTERNAL-PLANNING_runs/        # Runs in PLANNING phase (INTERNAL profile)
├── INTERNAL-EXECUTION_runs/       # Runs in EXECUTION phase (INTERNAL profile)
│
├── INBOX-inboxing/                # 📥 User drops files here (raw — agent does NOT scan directly)
├── INBOX-gateway/                 # 📦 Agent COPIes from INBOX-inboxing/ into pillar subfolders
│   ├── Foundational_Integrity/
│   ├── Operational_Muscles/
│   └── Value_Generation/
├── INBOX-PLANNING_runs/           # Runs in PLANNING phase (INBOX profile)
├── INBOX-EXECUTION_runs/          # Runs in EXECUTION phase (INBOX profile)
├── INBOX-tracker.yaml             # Tracks all items in INBOX-inboxing/ and INBOX-gateway/
│
├── RESEARCH-researching/          # 🔬 Agent writes web research results here
├── RESEARCH-gateway/              # 📦 Agent COPIes from RESEARCH-researching/ into pillar subfolders
│   ├── Foundational_Integrity/
│   ├── Operational_Muscles/
│   └── Value_Generation/
├── RESEARCH-PLANNING_runs/        # Runs in PLANNING phase (RESEARCH profile)
├── RESEARCH-EXECUTION_runs/       # Runs in EXECUTION phase (RESEARCH profile)
├── RESEARCH-tracker.yaml          # Tracks all items in RESEARCH-researching/ and RESEARCH-gateway/
│
└── .archived_runs/                # Terminal resting place for rejected and archived runs
    ├── INTERNAL-archived_runs/
    ├── INBOX-archived_runs/
    └── RESEARCH-archived_runs/
```

**Key Rules:**
- **COPY, never move** from `INBOX-inboxing/` or `RESEARCH-researching/` to gateway — source files immutable in landing zones
- **Gateway drives planning** — Runs are generated from gateway content, never directly from inboxing/researching
- **One run = one folder** — Each run has its own named folder with `<run_name>.yaml` + optional artifacts
- **Board + folder in sync** — Every status change updates BOTH the board and moves the folder
- **Archive header** — `run_name:` key promoted to top of run file before archiving
- **Archived runs leave the board** — Only PLANNING, EXECUTION, and completed runs appear in board

---

## The Two Shared Pipelines

- **Scaler** — The Systemic Growth Engine. Evolves the OS via external assimilation and internal audits. See `_shared/.shared-pipelines/Scaler/SCALER.md`.
- **Hustler** — The Product Discovery Engine. Cascades raw market signals into validated products. See `_shared/.shared-pipelines/Hustler/HUSTLER.md`.

---

## Quick Start (for agents)

1. Read **`index.yaml`** (root) — get the full workspace map.
2. Read **`AGENTS.md`** for the absolute authority on agent behavior.
3. Read the laws inside **`_system/.system-meta/.system-os_prompts/`**.
4. Read **`_system/system-board.yaml`** and **`_system/system-index.yaml`** to map the workspace.
5. Read **`config.yaml`** for modes and profiles.
6. Verify all paths exist on disk.

## Quick Start (for humans)

```bash
git clone <repo-url> open-workspace
cd open-workspace
```

---

## Where to go next

| If you want to... | Read this |
|---|---|
| Understand the absolute laws | `AGENTS.md` and `_system/.system-meta/.system-os_prompts/` |
| Understand how the Scaler evolves the OS | `_shared/.shared-pipelines/Scaler/SCALER.md` |
| Understand how the Hustler builds products | `_shared/.shared-pipelines/Hustler/HUSTLER.md` |
| See what's running right now | `config.yaml` and `_system/system-board.yaml` |
| Browse available shared skills | `_shared/.shared-toolboxes/` |
| Track a system goal | `_system/.system-missions/` |
| Understand a project | `<project>/<project>.md` and `<project>/<project>-board.yaml` |

---

<div align="center">
  <p><em>Built for the next decade of multi-agent work, where the agent is the variable and the substrate is the constant.</em></p>
  <p><sub>Agentic OS v6.0 · 3-Layer Architecture · 10 Identity Files · 65+ Shared Toolboxes</sub></p>
</div>