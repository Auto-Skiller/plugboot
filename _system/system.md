# 🏛️ System

The `_system/` entity is the **Always-On Orchestrator** of this workspace.

It does not build products. It does not execute business pipelines.
It manages, audits, orchestrates, and maintains — the projects, the shared infrastructure, and the core OS itself.

---

## What the System Does

| Role | Description |
|------|-------------|
| **Orchestrator** | Drives and coordinates other project entities toward their goals |
| **Auditor** | Monitors health of projects, pipelines, toolboxes, and state files |
| **Evolution Owner** | Uses the Scaler pipeline (from `_shared/`) to evolve the OS itself |
| **Mission Runner** | Executes system-level missions in `.system-missions/` |
| **Gatekeeper** | Enforces OS laws from `.system-os_prompts/` across all agents |

---

## Structure

```
_system/
├── system.md                              ← This file
├── system-board.yaml                      ← System state, metrics, pipeline/toolbox control
├── system-index.yaml                      ← Full path map + machine-indexed metadata
│
└── .system-meta/
    ├── .system-os_prompts/                ← 10 identity law files (read at every boot)
    ├── .system-pipelines/                 ← System-only pipeline definitions (if any)
    ├── .system-toolboxes/                 ← System-only toolboxes (if any)
    ├── system-archive/                    ← Archived system artifacts
    └── system-scratch/                    ← Transient drafts

_system/.system-missions/                  ← System-level goals and missions
_system/.system-pipelines_runtime/        ← Where shared/system pipelines execute for system work
```

---

## Shared Resources the System Uses

The system can use any resource from `_shared/`:

| Resource | Path | Usage |
|----------|------|-------|
| Scaler pipeline | `_shared/.shared-pipelines/Scaler/` | Evolve the OS, audit internal architecture |
| Hustler pipeline | `_shared/.shared-pipelines/Hustler/` | (optional) Product intelligence for system context |
| All toolbox domains | `_shared/.shared-toolboxes/` | 65+ toolboxes across 5 domains |

Pipeline execution for system work happens in `_system/.system-pipelines_runtime/`, not in the shared definition folder.

---

## Key Files

| File | Purpose |
|------|---------|
| [`system-board.yaml`](system-board.yaml) | Control plane: what's on/off, metrics, missions status |
| [`system-index.yaml`](system-index.yaml) | Path map: where everything lives, machine-indexed metadata |
| [`.system-meta/.system-os_prompts/`](.system-meta/.system-os_prompts/) | Identity laws — read at every agent boot |
| [`.system-missions/`](.system-missions/) | System-level goals and orchestration missions |

---

## How Agents Interact with the System

1. **Boot**: Read all 10 files in `.system-meta/.system-os_prompts/`
2. **Orient**: Read `system-board.yaml` (state) and `system-index.yaml` (paths)
3. **Act**: Control everything from `system-board.yaml` — missions, pipeline activations, toolbox on/off. The board is the only control plane.
4. **Write back**: Update `system-board.yaml` metrics and `system-index.yaml` as state changes
