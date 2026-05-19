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

You drop any frontier LLM into this workspace — Claude, Gemini, GPT, Hermes, whichever — and it stops guessing. It reads a single router file, picks up its laws, follows a deterministic 10-step execution flow, and writes back to a single source of truth. The whole repo is designed so that **two different agents working two days apart produce work that looks like it came from the same pair of hands.**

The workspace provides the **Senses** (`meta_router.yaml`), the **Memory** (`CONTROLER.yaml`), and the **Muscles** (`toolboxes/`). The agents provide the Brain.

---

## Core Architecture

The OS is segregated into **three strict pillars** — Logic, Runtime, and Workspaces — with a central command state bridging them:

```
open-workspace/
├── CONTROLER.yaml                        📋 Central Command — the mission board
├── AGENTS.md                             🤖 Root pointer for all agents
├── pending_evolutions.yaml               🧬 System-level evolution queue
│
├── .meta_brain/                          🧠 PILLAR 1: LOGIC
│   ├── BOOT_CONTRACTS.yaml               Boot sequence + runtime constants
│   ├── meta_router.yaml                  Master routing index (single source of truth)
│   ├── meta_sync.py                      Master orchestrator engine (v5.4)
│   ├── meta_identity/                    19 codified identity files (laws, modes, persona)
│   ├── toolboxes/                        65+ skill folders across 5 domains
│   ├── milestones/                       Active sessions and goals
│   └── .meta_routing/                    Auto-generated component routers
│       ├── milestones.yaml
│       ├── toolboxes.yaml
│       ├── pipelines.yaml
│       ├── projects.yaml
│       ├── meta_runtime.yaml
│       └── meta_sync_engines/            6 worker engines + 10 shared modules
│
├── .meta_runtime/                        🔋 PILLAR 2: RUNTIME
│   ├── venv/                             Cross-OS launcher (meta_run.{ps1,sh})
│   ├── auth/                             Session cookies (NotebookLM, etc.)
│   ├── .meta_scratch/                    Ephemeral working files
│   └── .meta_archive/                    Rotated logs
│
├── _pipelines/                           ⚙️ PILLAR 3a: EXECUTION (Infinite)
│   ├── _scaler/                          Systemic Growth Engine (23 P-LAWs)
│   └── hustler/                          Product Discovery Engine (15 H-LAWs)
│
└── projects/                             📦 PILLAR 3b: EXECUTION (Finite)
```

---

## What makes it work

| Capability | What it buys you |
|---|---|
| 🗺️ **Master Router** | Zero path hallucinations. Every agent reads the same map of every file. Rebuilt from disk on every sync. |
| 🧠 **19 Identity Files** | Behavioral laws that override the agent's defaults — modes, persona, concurrency model, evolution protocol, naming rules, decision-making, event vocabulary. |
| 🧰 **65+ Toolboxes** | Organized by domain (core, business, engineering, life, studio). Agents pull capabilities via meta-routing. Maturity-scored by the engine. |
| 🎛️ **CONTROLER.yaml** | The mission board. Active sessions, mode flags, per-pipeline action gates, communication hubs, telemetry — all in one file with a strict schema allow-list. |
| ⚙️ **Sync Engine v5.4** | 6 worker engines + 10 shared modules. Atomic writes, advisory locking, freshness contracts, bidirectional drift detection, deprecated-token sweep, schema validation. |
| 🔒 **Multi-Session Concurrency** | Advisory file locks, atomic YAML writes (`tmp + os.replace`), vocabulary discipline, progress provenance. Two agents can never corrupt shared state. |
| 🌍 **Cross-OS Portability** | Clone on Windows, Linux, or macOS. First boot rebuilds `.venv` from `requirements.txt`. No global installs, no manual config. |
| 🧬 **Self-Evolution** | The system proposes improvements to its own identity and rules via `pending_evolutions.yaml`, governed by the Non-Loss Principle and DNA Preservation Laws. |
| 📋 **Auto-Syncing Ledgers** | Every operation atomically updates ledger + state + tracker. The router rebuilds itself. Drift gets caught, never ignored. |

---

## The Two Pipelines

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Agentic OS Substrate                          │
│  meta_identity  ·  meta_router  ·  toolboxes  ·  milestones  ·  sync │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┴────────────────┐
                ▼                                 ▼
     ┌─────────────────────┐          ┌─────────────────────┐
     │  ⚖️  Scaler           │          │  💼 Hustler          │
     │                     │          │                     │
     │  Evolves the OS.    │          │  Turns market       │
     │  23 P-LAWs.        │          │  signals into       │
     │  5-phase flow.      │          │  products.          │
     │  7 integration      │          │  15 H-LAWs.         │
     │  types.             │          │  5-phase cascade.   │
     │  Per-pillar split   │          │  Focus → Product    │
     │  ledgers.           │          │  → Feature with     │
     │  14 structural      │          │  threshold gates    │
     │  aspects.           │          │  and quality bars.  │
     │  Audit pass with    │          │  Lineage graphs.    │
     │  6 checks.          │          │  Agent-judged       │
     │                     │          │  quality scoring.   │
     └─────────────────────┘          └─────────────────────┘
     _pipelines/_scaler/              _pipelines/hustler/
```

The pipelines are **deliberately isolated**. They share no state, no event bus, no queues. The Scaler can modify the Hustler's runbooks (it owns OS evolution), but the Hustler never reaches into the Scaler. Each has its own laws, its own audit pass, its own event vocabulary.

- **Scaler** — see [`_pipelines/_scaler/README.md`](./_pipelines/_scaler/README.md) for the Systemic Growth Engine (23 P-LAWs, 6 runbooks).
- **Hustler** — see [`_pipelines/hustler/README.md`](./_pipelines/hustler/README.md) for the Product Discovery Engine (15 H-LAWs, 6 runbooks).

---

## The Sync Engine (v5.4)

The engine is the heartbeat. It ensures every YAML map matches physical disk state with zero drift.

### 6 Worker Engines
| Engine | Role |
|---|---|
| `meta_sync.py` | Master orchestrator — triggers all sub-syncs, rebuilds `meta_router.yaml`, updates `CONTROLER.yaml` |
| `milestones_sync.py` | Sessions, goals, health scoring, auto-promotion, auto-archival |
| `toolboxes_sync.py` | Capabilities, maturity scoring, dependency graph validation |
| `pipelines_sync.py` | Pipeline router + ledger + state file sync |
| `projects_sync.py` | Standalone codebase cataloging |
| `meta_runtime_sync.py` | Runtime infrastructure indexing |

### 10 Shared Modules (`_shared/`)
| Module | Purpose |
|---|---|
| `atomic_io.py` | Crash-safe YAML writes (tmp + `os.replace`) |
| `sync_lock.py` | Advisory file locking for concurrent agents |
| `freshness.py` | Router freshness stamping and evaluation |
| `boot_contracts.py` | Single-source constant loader |
| `engine_bootstrap.py` | Path resolution + return code vocabulary |
| `state_helpers.py` | Pipeline state auditing + evolution queueing |
| `event_emitter.py` | Milestone lifecycle event emission |
| `validators.py` | Schema validation against router Part 2 |
| `log_retention.py` | FIFO log pruning |
| `__init__.py` | Package init |

### Key Invariants
- **Atomic writes only** — no half-written files, ever
- **Lock before mutate** — advisory lock at `.sync.lock` with stale-detection
- **Freshness contracts** — every router stamps `last_synced / fresh_until / status`
- **Schema allow-list** — CONTROLER keys not in the allow-list are swept on every cycle
- **Deprecated token sweep** — `--validate` flags stale path references in identity docs
- **Bidirectional drift detection** — router→disk AND disk→router checks

---

## The 19 Identity Files

Every agent loads these at boot. They are the OS's DNA.

| File | Purpose |
|---|---|
| `Core_Architecture.md` | Pillar layout, directory roles, sync engine architecture |
| `Core_Capabilities.md` | Cognitive toolbox catalog and engine system |
| `Rules_And_Considerations.md` | 14 hard laws + naming conventions + machine-readable LAW blocks |
| `Evolution_Protocol.md` | Self-improvement cycle, 8 critical laws (Non-Loss, Zero-Drift, Anti-Recurrence…) |
| `Concurrency_Model.md` | 5 invariants for multi-session safety |
| `Modes.md` | 3 operational dimensions: `work_mode`, `action_gate`, `evolution_mode` |
| `Controler_Guide.md` | CONTROLER.yaml schema, anti-bloat rules, engine-owned rollups |
| `Session_Template.md` | SESSION.yaml / GOAL.yaml structure and validation rules |
| `Orchestration_And_Flow.md` | 10-step deterministic execution flow with gate contracts |
| `System-Orchestrator-Loop.md` | Autonomous daily ops loop for AUTO mode |
| `Decision_Making.md` | Conflict resolution, escalation, action constraint enforcement |
| `Event_Vocabulary.md` | OS-wide event catalog (live + reserved) |
| `Hierarchy.md` | Three-pillar information flow |
| `Agent_Standards.md` | AGENT.md / SKILL.md schemas and dependency graph |
| `Universal_Portability_Standard.md` | Cross-OS execution, git persistence, runtime registry |
| `Communication_Style.md` | Status text patterns, hub message format, error reports |
| `Persona.md` | Default persona (Piper) + spawning schema |
| `Quick_Start.md` | First-touch agent onboarding |
| `Orchestrator_Engine.md` | Sync engine protocols and self-healing rules |

---

## 🚀 Quick Start (for agents)

> **Boot sequence** — every agent does this in order:
>
> 1. Read **`.meta_brain/BOOT_CONTRACTS.yaml`** for the canonical boot protocol.
> 2. Run the master sync via the cross-platform launcher:
>    - Windows: `.\.meta_runtime\venv\meta_run.ps1 .meta_brain\meta_sync.py`
>    - Linux/macOS: `./.meta_runtime/venv/meta_run.sh .meta_brain/meta_sync.py`
> 3. Read **`CONTROLER.yaml`** to sync with the active mission.
> 4. If the task involves a pipeline, read its runbooks end-to-end — **no partial knowledge**.
> 5. Follow the 10-step execution flow in `Orchestration_And_Flow.md`.

## 🚀 Quick Start (for humans)

```bash
# Clone the repo
git clone <repo-url> open-workspace
cd open-workspace

# First boot — rebuild the venv for your OS
./.meta_runtime/venv/bootstrap.sh        # Linux/macOS
.\.meta_runtime\venv\bootstrap.ps1       # Windows

# Run a sync to verify the substrate is healthy
./.meta_runtime/venv/meta_run.sh .meta_brain/meta_sync.py
# → expects "[!] Sync Complete." with Health: 100%

# Open CONTROLER.yaml and pick your starting point
```

The repo is private and self-contained. Cookies, caches, secrets, and dependencies all travel with it. Nothing to install, nothing to configure — clone, boot, work.

---

## Where to go next

| If you want to… | Read this |
|---|---|
| Understand how the Scaler evolves the OS | [`_pipelines/_scaler/README.md`](./_pipelines/_scaler/README.md) |
| Understand how the Hustler builds products | [`_pipelines/hustler/README.md`](./_pipelines/hustler/README.md) |
| See what's running right now | `CONTROLER.yaml` |
| Add a new identity rule or law | `.meta_brain/meta_identity/Rules_And_Considerations.md` |
| Browse available skills | `.meta_brain/toolboxes/` and `toolboxes.yaml` |
| Track a goal | `.meta_brain/milestones/[SESSION]/[GOAL]/GOAL.yaml` |
| Understand concurrency safety | `.meta_brain/meta_identity/Concurrency_Model.md` |
| Validate the workspace | `.meta_runtime/venv/meta_run.sh .meta_brain/meta_sync.py --validate` |
| Propose a system evolution | Add to `pending_evolutions.yaml` at workspace root |

---

<div align="center">
  <p><em>Built for the next decade of multi-agent work, where the agent is the variable and the substrate is the constant.</em></p>
  <p><sub>Agentic OS v5.3 · Sync Engine v5.4 · 19 identity files · 65+ toolboxes · 38 P-LAWs + H-LAWs · 10 shared engine modules</sub></p>
</div>
