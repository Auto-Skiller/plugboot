<div align="center">
  <h1>🌌 Agentic OS v5.3</h1>
  <p><em>A workspace-as-operating-system that turns any LLM into a deterministic, self-healing, multi-session agent.</em></p>
  <p>
    <a href="#"><img alt="OS Version" src="https://img.shields.io/badge/OS-v5.3-brightgreen"></a>
    <a href="#"><img alt="Sync Engine" src="https://img.shields.io/badge/Sync_Engine-v5.4-blue"></a>
    <a href="#"><img alt="Identity" src="https://img.shields.io/badge/Identity_Files-19-orange"></a>
    <a href="#"><img alt="Toolboxes" src="https://img.shields.io/badge/Toolboxes-65+-purple"></a>
    <a href="#"><img alt="Portability" src="https://img.shields.io/badge/Portability-Clone--and--play-success"></a>
  </p>
</div>

---

## What is this?

Agentic OS is **a substrate, not an agent.**

You drop any frontier LLM into this workspace and it stops guessing. It reads a single root pointer file (`AGENTS.md`), picks up its laws from `.meta/.os/.system.identity/`, maps the workspace using `.db/`, follows a deterministic execution flow, and writes back to the DB files.

The workspace provides the **Senses** (`.meta/.os/.system.identity/`), the **Memory** (`.db/`), and the **Muscles** (`.meta/toolboxes/`). The agents provide the Brain.

---

## Core Architecture

```
open-workspace/
├── AGENTS.md                             🤖 Root pointer for all agents
├── config.yaml                           ⚙️ Top-level config (modes, profiles, status)
├── index.yaml                            🗂️ Master index (maps all subsystems to disk paths)
├── .meta/                                ⚙️ RUNTIME & METADATA
│   ├── .os/
│   │   ├── .system.identity/             🧠 Identity laws (BOOT-00 reads here)
│   │   ├── pipeline_scaler.runbooks/     📈 Scaler runbooks (7 files)
│   │   ├── pipeline_hustler.runbooks/    💼 Hustler runbooks (8 files)
│   │   ├── project_assets.docs/
│   │   └── project_ecoma.docs/
│   ├── milestones/                       🎯 Active goals with auto-promotion
│   └── toolboxes/                        🧰 65+ skill folders across 5 domains
├── .db/                                  🗃️ STATE & MEMORY (source of truth)
│   ├── .system.board.yaml                System-level config & session tracking
│   ├── toolboxes.board.yaml              All toolbox domains + status
│   ├── toolboxes.rollup.yaml             Agent-facing rollup (skills & agents index)
│   ├── pipeline_scaler.*                 Scaler pipeline state/rollup/ledgers
│   ├── pipeline_hustler.*                Hustler pipeline state/rollup/ledgers
│   ├── project_assets.*                  Assets project state/rollup/ledgers
│   ├── project_ecoma.*                   Ecoma project state/rollup/ledgers
│   ├── project_dz_agents.*               DZ Agents project state/tasks
│   ├── project_street_food_elcap.*       Street Food project state/tasks
│   └── .schemas/                         YAML structure schemas
├── pipeline_scaler/                      📈 Scaler pipeline (Systemic Growth Engine)
├── pipeline_hustler/                     💼 Hustler pipeline (Product Discovery Engine)
└── projects/                             📦 FINITE CODEBASES
    ├── project_dz-agents-course/         DZ AGENTS Course (with .projects_runtime/)
    ├── project_street-food-elcap/        Street Food Kiosk (with .projects_runtime/)
    ├── project_assets/                   Real Estate Assets (with .assets_runtime/)
    └── project_ecoma/                    E-commerce (with .ecoma_runtime/)
```

---

## What makes it work

| Capability | What it buys you |
|---|---|
| 🗺️ **Memory & DBs** | Zero path hallucinations. Agents use `.db/` schemas to track active state. |
| 🧠 **Identity Files** | Behavioral laws overriding default persona. |
| 🧰 **65+ Toolboxes** | Organized by domain. Discover via `.db/toolboxes.rollup.yaml`. |
| 📈 **Scaler Pipeline** | The systemic growth engine. See `pipeline_scaler/README.md`. |
| 💼 **Hustler Pipeline** | The product discovery engine. See `pipeline_hustler/README.md`. |
| 🔒 **Multi-Session Concurrency** | Zero-Drift protocol. Agents must read fresh disk state before edits. |
| 🌍 **Cross-OS Portability** | Clone on Windows, Linux, or macOS. No global installs. |

---

## The Two Pipelines

The pipelines are **deliberately isolated**. They share no state, no event bus, no queues.

- **Scaler** — see `pipeline_scaler/README.md` for the Systemic Growth Engine.
- **Hustler** — see `pipeline_hustler/README.md` for the Product Discovery Engine.

---

## The Sync Engine

The workspace uses a file-based sync approach where agents update `.db/` YAML files directly. The `.infra/` directory contains daemon infrastructure for automated synchronization.

---

## Quick Start (for agents)

1. Read **`AGENTS.md`** for the absolute authority on agent behavior.
2. Read the laws inside **`.meta/.os/.system.identity/`**.
3. Read **`index.yaml`** and **`config.yaml`** to map the workspace.
4. Verify all paths exist on disk.

## Quick Start (for humans)

```bash
git clone <repo-url> open-workspace
cd open-workspace
```

---

## Where to go next

| If you want to... | Read this |
|---|---|
| Understand the absolute laws | `AGENTS.md` and `.meta/.os/.system.identity/01_architecture/` |
| Understand how the Scaler evolves the OS | `pipeline_scaler/README.md` |
| Understand how the Hustler builds products | `pipeline_hustler/README.md` |
| See what's running right now | `config.yaml` and `index.yaml` |
| Browse available skills | `.db/toolboxes.rollup.yaml` then `.meta/toolboxes/` |
| Track a core goal | `.meta/milestones/[SESSION]/[GOAL]/GOAL.yaml` |

---

<div align="center">
  <p><em>Built for the next decade of multi-agent work, where the agent is the variable and the substrate is the constant.</em></p>
  <p><sub>Agentic OS v5.3 · Sync Engine v5.4 · Identity files · 65+ toolboxes</sub></p>
</div>
