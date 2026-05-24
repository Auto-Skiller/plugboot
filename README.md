<div align="center">
  <h1>🌌 Agentic OS v5.3</h1>
  <p><em>A workspace-as-operating-system that turns any LLM into a deterministic, self-healing, multi-session agent.</em></p>

  <p>
    <a href="#"><img alt="OS Version" src="https://img.shields.io/badge/OS-v5.3-brightgreen"></a>
    <a href="#"><img alt="Sync Engine" src="https://img.shields.io/badge/Sync_Engine-v5.4-blue"></a>
    <a href="#"><img alt="Identity" src="https://img.shields.io/badge/Identity_Files-19-orange"></a>
    <a href="#"><img alt="Toolboxes" src="https://img.shields.io/badge/Toolboxes-65+-purple"></a>
    <a href="#"><img alt="Portability" src="https://img.shields.io/badge/Portability-Clone--and--play-success"></a>
    <a href="#"><img alt="Concurrency" src="https://img.shields.io/badge/Concurrency-Multi--session_safe-critical"></a>
  </p>
</div>

---

## What is this?

Agentic OS is **a substrate, not an agent.**

You drop any frontier LLM into this workspace — Claude, Gemini, GPT, Hermes, whichever — and it stops guessing. It reads a single root pointer file (`AGENTS.md`), picks up its laws from `.meta_os/meta_identity/`, maps the workspace using `.meta_os/meta_db/`, follows a deterministic execution flow, and writes back to a single source of truth (`CONTROLER.yaml`). The whole repo is designed so that **two different agents working two days apart produce work that looks like it came from the same pair of hands.**

The workspace provides the **Senses** (`.meta_os/meta_identity/`), the **Memory** (`.meta_os/meta_db/` and `CONTROLER.yaml`), and the **Muscles** (`.toolboxes/`). The agents provide the Brain.

---

## Core Architecture

The OS is segregated into strict pillars — Logic, State, Runtime, and Execution — with a central command state bridging them:

```
open-workspace/
├── CONTROLER.yaml                        📋 Central Command — the mission board
├── AGENTS.md                             🤖 Root pointer for all agents
│
├── .meta_os/meta_identity/               🧠 PILLAR 1: LOGIC
│   ├── 01_architecture/                  Structural laws and workspace mapping
│   ├── 02_behavior/                      Agent persona and conflict resolution
│   ├── 03_state_and_memory/              Dual-Entry state flow rules
│   └── 04_execution/                     Operational guides for pipelines & toolboxes
│
├── .meta_os/meta_db/                     🗃️ PILLAR 2: STATE & MEMORY
│   ├── meta_os.yaml                        Core DB holding hubs and global modes
│   ├── .toolboxes.yaml                   Skill domain rollups
│   ├── projects_os.yaml                     Standalone project tracking
│   ├── pipeline_scaler_os.yaml              Scaler pipeline state
│   ├── pipeline_hustler_os.yaml             Hustler pipeline state
│   └── .db_shemas_db/                    Strict schemas enforcing DB structure
│
├── .meta/                                ⚙️ PILLAR 3: RUNTIME & ENGINE
│   ├── engine/                           The Sync Daemon (boot.py & meta_engine.py)
│   ├── venv/                             Cross-OS launcher & Python master environment
│   └── dashboard/                        Control & Telemetry Web UI
│
├── .meta_runtime/                        🗑️ PILLAR 4: EPHEMERAL
│   ├── scratch/                          Transient working files
│   ├── archive/                          Rotated logs
│   └── .auth/                            Session cookies
│
├── .toolboxes/                           🧰 PILLAR 5: MUSCLES
│   └── [domain]_toolboxes/               65+ skill folders across 5 domains
│
├── pipeline_scaler/                      📈 PILLAR 6a: EXECUTION (Systemic Growth)
├── pipeline_hustler/                     💼 PILLAR 6b: EXECUTION (Product Discovery)
└── projects/                             📦 PILLAR 6c: EXECUTION (Finite Codebases)
```

---

## What makes it work

| Capability | What it buys you |
|---|---|
| 🗺️ **Memory & DBs** | Zero path hallucinations. Agents use `.meta_os/meta_db/` schemas to track active state. Rebuilt from disk on every sync. |
| 🧠 **Identity Files** | Behavioral laws overriding default persona (`.meta_os/meta_identity/`) — modes, concurrency model, evolution protocol, naming rules. |
| 🧰 **65+ Toolboxes** | Organized by domain (core, business, engineering, life, studio). |
| 🎛️ **CONTROLER.yaml** | The mission board. Active sessions, modes, action gates, communication hubs, telemetry — mapped via a strict schema. |
| ⚙️ **Sync Engine** | The daemon (`.meta/engine/boot.py`) syncs the DB files into CONTROLER.yaml, ensuring zero-drift between disk and memory. |
| 🔒 **Multi-Session Concurrency** | Zero-Drift protocol. Agents must read fresh disk state before edits. |
| 🌍 **Cross-OS Portability** | Clone on Windows, Linux, or macOS. Run `.meta/.venv/meta_run.ps1` (or `.sh`). No global installs, no manual config. |
| 🧬 **Self-Evolution** | The system proposes improvements to its own identity and rules via the Scaler pipeline. |

---

## The Two Pipelines

The pipelines are **deliberately isolated**. They share no state, no event bus, no queues. The Scaler can modify the Hustler's runbooks (it owns OS evolution), but the Hustler never reaches into the Scaler. Each has its own laws, its own audit pass, its own event vocabulary.

- **Scaler** — see `pipeline_scaler/README.md` for the Systemic Growth Engine.
- **Hustler** — see `pipeline_hustler/README.md` for the Product Discovery Engine.

---

## The Sync Engine & Ledger Synchronization

The engine (`.meta/engine/boot.py`) is the heartbeat. It ensures every YAML DB matches physical disk state with **zero drift**, and rolls them up into the single pane of glass: `CONTROLER.yaml`.

For the pipelines, the engine enforces a strict **State vs Metadata** split inside the granular ledgers:
- **State (Physical Work):** The engine dynamically forces ledger tracking arrays to match the raw physical files on disk exactly (INward flow).
- **Metadata (Communication):** The engine calculates metrics from the State, stores them in the ledger's metadata, and aggregates them UP to the global OS DBs. Conversely, targeted commands from the OS DB are routed DOWN into specific ledgers.

---

## 🚀 Quick Start (for agents)

> **Boot sequence** — every agent does this in order:
>
> 1. Read **`AGENTS.md`** for the absolute authority on agent behavior.
> 2. Read the laws inside **`.meta_os/meta_identity/`**.
> 3. Check the single source of truth: **`CONTROLER.yaml`**.
> 4. Trigger a zero-drift audit via the cross-platform launcher (if running manually):
>    - Windows: `.\.meta\.venv\meta_run.ps1 .meta\engine\boot.py`
>    - Linux/macOS: `./.meta/.venv/meta_run.sh .meta/engine/boot.py`

## 🚀 Quick Start (for humans)

```bash
# Clone the repo
git clone <repo-url> open-workspace
cd open-workspace

# Run a sync to verify the substrate is healthy
./.meta/.venv/meta_run.sh .meta/engine/boot.py      # Linux/macOS
.\.meta\.venv\meta_run.ps1 .meta\engine\boot.py     # Windows
# → Expects "Sync complete. Zero-drift state verified."

# Open CONTROLER.yaml and pick your starting point
```

---

## Where to go next

| If you want to… | Read this |
|---|---|
| Understand the absolute laws | `AGENTS.md` and `.meta_os/meta_identity/01_architecture/Hard_Laws.md` |
| Understand how the Scaler evolves the OS | `pipeline_scaler/README.md` |
| Understand how the Hustler builds products | `pipeline_hustler/README.md` |
| See what's running right now | `CONTROLER.yaml` |
| Browse available skills | `.toolboxes/` and `.meta_os/meta_db/.toolboxes.yaml` |
| Track a core goal | `.meta_os/meta_milestones/[SESSION]/[GOAL]/GOAL.yaml` |
| Validate the workspace schemas | `.\.meta\.venv\meta_run.ps1 .meta\engine\engines\meta_engine.py --validate` |

---

<div align="center">
  <p><em>Built for the next decade of multi-agent work, where the agent is the variable and the substrate is the constant.</em></p>
  <p><sub>Agentic OS v5.3 · Sync Engine v5.4 · Identity files · 65+ toolboxes</sub></p>
</div>
