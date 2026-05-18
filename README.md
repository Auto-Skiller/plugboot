<div align="center">
  <h1>🌌 Agentic OS</h1>
  <p><em>A workspace any AI agent can land in and immediately know how to act.</em></p>

  <p>
    <a href="#"><img alt="Portability" src="https://img.shields.io/badge/Portability-Clone--and--play-success"></a>
    <a href="#"><img alt="Architecture" src="https://img.shields.io/badge/Architecture-Deterministic-blue"></a>
    <a href="#"><img alt="Pipelines" src="https://img.shields.io/badge/Pipelines-Scaler%20%2B%20Hustler-purple"></a>
    <a href="#"><img alt="Identity" src="https://img.shields.io/badge/Identity-Enforced-orange"></a>
  </p>
</div>

---

## What is this?

Agentic OS is **a substrate, not an agent.**

You drop any frontier LLM into this workspace — Claude, Gemini, GPT, whichever — and it stops guessing. It reads a single router file, picks up its laws, follows a deterministic flow, and writes back to a single source of truth. The whole repo is designed so that **two different agents working two days apart produce work that looks like it came from the same pair of hands.**

If you've ever felt the pain of *"my agent did something brilliant, then forgot it ever happened"*, this is the architecture for fixing that.

---

## Why it works

| What you get | What that buys you |
|---|---|
| 🗺️ **Master router** (`.meta_brain/meta_router.yaml`) | Zero path hallucinations. Every agent reads the same map of every file. |
| 🧠 **Codified identity** (`.meta_brain/meta_identity/`) | Behavioral laws that override the agent's defaults. Your conventions win. |
| 🧰 **Toolboxes** (`.meta_brain/toolboxes/`) | 65+ skill folders organized by domain (engineering, business, life, studio). Agents pull from them via meta-routing — no hardcoded prompts. |
| 🎛️ **CONTROLER** (`CONTROLER.yaml`) | The mission board. Active sessions, mode flags, action gates, communication hubs — all in one file the user actually reads. |
| ⚙️ **Two pipelines** (`_pipelines/`) | **Scaler** evolves the OS itself. **Hustler** turns market signals into products. Each has its own runbooks, ledgers, and gating mechanism. |
| 🔋 **Cross-OS launcher** (`.meta_runtime/venv/`) | Clone the repo on Windows, Linux, or macOS. First boot rebuilds the venv automatically. No manual setup. |
| 📋 **Auto-syncing ledgers** | Every operation atomically updates the relevant ledger + state + tracker. The router rebuilds itself on every sync. Drift gets caught, not ignored. |

---

## The two pipelines at a glance

```
┌─────────────────────────────────────────────────────────────────┐
│                       Agentic OS Substrate                       │
│  meta_identity   ·   meta_router   ·   toolboxes   ·  milestones │
└─────────────────────────────────────────────────────────────────┘
                               │
              ┌────────────────┴───────────────┐
              ▼                                ▼
   ┌────────────────────┐          ┌────────────────────┐
   │  ⚖️  Scaler         │          │  💼 Hustler        │
   │                    │          │                    │
   │  Evolves the OS.   │          │  Turns market      │
   │                    │          │  signals into      │
   │  Ingests external  │          │  monetizable       │
   │  discoveries (new  │          │  products via a    │
   │  skills, agents,   │          │  Focus → Product   │
   │  patterns) AND     │          │  → Feature         │
   │  internal gaps,    │          │  cascade with      │
   │  routes them via   │          │  threshold gates,  │
   │  Proposal/Action   │          │  quality bars,     │
   │  Cards, integrates │          │  and provenance    │
   │  with audit trail. │          │  tagging.          │
   └────────────────────┘          └────────────────────┘
   _pipelines/_scaler/             _pipelines/hustler/
```

The pipelines are **deliberately isolated**. They share no state, no event bus, no queues. The Scaler can modify the Hustler's runbooks (it owns OS evolution), but the Hustler never reaches into the Scaler. Each has its own laws (P-LAWs for Scaler, H-LAWs for Hustler), its own audit pass, its own event vocabulary.

---

## What's actually in the box

### 🧠 The Brain — `.meta_brain/`
The cognitive core. Read-only at runtime; mutated only via the Scaler pipeline.

```
.meta_brain/
├── meta_router.yaml             ← single source of truth for paths
├── meta_sync.py                 ← rebuilds the router from disk on every run
├── BOOT_CONTRACTS.yaml          ← global constants (no magic numbers in code)
├── meta_identity/               ← 18 identity files: laws, modes, persona, hierarchy
├── toolboxes/                   ← 65+ skill folders by domain
├── milestones/                  ← active sessions and goals (the mission board)
└── .meta_routing/               ← auto-generated component routers
    ├── pipelines.yaml
    ├── projects.yaml
    ├── toolboxes.yaml
    └── meta_sync_engines/       ← per-domain sync workers
```

### 🔋 The Runtime — `.meta_runtime/`
Ephemeral execution memory. Auth caches, scratch logs, archived runs.

```
.meta_runtime/
├── venv/                        ← cross-OS launcher: meta_run.{ps1,sh}
├── auth/                        ← active session cookies (NotebookLM, etc.)
├── .meta_scratch/               ← agent working files
└── .meta_archive/               ← rotated logs
```

### 🎛️ The Mission Board — `CONTROLER.yaml`
A single file that tracks everything happening right now: active sessions, current goals, mode flags (work mode, action gate, evolution mode), communication hubs (one per pipeline), and the global health snapshot.

You read this first. Always.

### ⚙️ The Pipelines — `_pipelines/`

- **`_scaler/`** — see [`_pipelines/_scaler/README.md`](./_pipelines/_scaler/README.md) for the Systemic Growth Engine.
- **`hustler/`** — see [`_pipelines/hustler/README.md`](./_pipelines/hustler/README.md) for the Product Discovery Engine.

### 📦 The Projects — `projects/`
Bounded codebase builds. Web apps, libraries, standalone software products. These are *finite*: they have a defined scope and a completion state. Pipelines never end; projects do.

---

## 🚀 Quick start (for agents)

> **Boot sequence** — every agent does this in order:
>
> 1. Read **`CONTROLER.yaml`** to sync with the active goal.
> 2. Read **`.meta_brain/meta_router.yaml`** to navigate the workspace.
> 3. Read **`.meta_brain/meta_identity/Rules_And_Considerations.md`** before taking any action.
> 4. Identify which pipeline (if any) the active goal lives under, and read its runbooks (`*_runbooks/*.md`) end-to-end.
> 5. Run the cross-OS sync via the launcher:
>    - Windows: `.\.meta_runtime\venv\meta_run.ps1 .meta_brain\meta_sync.py`
>    - Linux/macOS: `./.meta_runtime/venv/meta_run.sh .meta_brain/meta_sync.py`

## 🚀 Quick start (for humans)

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
| Add a new identity rule or law | `.meta_brain/meta_identity/Rules_And_Considerations.md` |
| See what's running right now | `CONTROLER.yaml` |
| Browse available skills | `.meta_brain/toolboxes/` and the `toolboxes.yaml` rollup |
| Track a goal | `.meta_brain/milestones/[SESSION]/[GOAL]/GOAL.yaml` |

---

<div align="center">
  <p><em>Built for the next decade of multi-agent work, where the agent is the variable and the substrate is the constant.</em></p>
</div>
