# ⚡ Core Capabilities

## The Core Cognitive Loop (toolboxes)

The core capabilities define the foundational cognitive loop available to all agents at all times. These are strictly separated from domain-specific skills.

| Capability | Role in Cognitive Loop | Toolbox Location |
|------------|------------------------|------------------|
| **Analysis** | Perceive and break down current state, context, user input, and data. | `.meta_brain/toolboxes/core/analysis/` |
| **Research** | Resolve knowledge gaps, find external info, read relevant docs. | `.meta_brain/toolboxes/core/research/` |
| **Planning** | Determine or adjust immediate next steps before taking action. | `.meta_brain/toolboxes/core/planning/` |
| **Brainstorming** | Generate ideas and explore multiple approaches. | `.meta_brain/toolboxes/core/brainstorming/` |
| **Benchmarking** | Measure, compare, and optimize choices. | `.meta_brain/toolboxes/core/benchmarking/` |
| **Documentation** | Produce written artifacts (READMEs, specs, guides). | `.meta_brain/toolboxes/core/documentation/` |
| **Evaluation** | Assess outcomes and quality of executed steps. | `.meta_brain/toolboxes/core/evaluation/` |
| **NotebookLM** | Full programmatic access to Google NotebookLM for deep research, audio/video generation, and multi-source synthesis. | `.meta_brain/toolboxes/core/notebooklm/` |

---

## The Sync Engine

The Sync Engine consists of three agentic protocols executed at boot and after any structural changes to ensure the workspace maps are always accurate.

| Protocol | Location | Purpose |
|----------|----------|---------|
| **sync_mission_board** | `.meta_brain/.meta_router/.meta_sync/sync_mission_board.md` | Keeps `.meta_brain/milestones/`, `CONTROLER.yaml`, and `milestones.yaml` in sync. |
| **sync_toolbox** | `.meta_brain/.meta_router/.meta_sync/sync_toolbox.md` | Keeps `.meta_brain/toolboxes/` and `toolboxes.yaml` in sync. |
| **sync_pipelines** | `.meta_brain/.meta_router/.meta_sync/sync_pipelines.md` | Keeps pipeline runbooks, scratch, and tracker paths in sync with their routers. |

---

## The Engine System

We use four core engines to maintain structural awareness and deterministic execution without relying on heavy LLM reasoning for basic state management.

| Engine | Location | Type | Purpose |
|--------|----------|------|---------|
| **Navigator** | `.meta_brain/.meta_router/.meta_sync/navigator.md` | Programmatic | Scans directories to output structure data (paths, types, sizes, last_modified) |
| **Cataloger** | `.meta_brain/.meta_router/.meta_sync/cataloger.md` | Hybrid | Programmatically diffs against registries, then agent reads/writes descriptions |
| **Router** | `.meta_brain/.meta_router/.meta_sync/router.md` | Agent Read | Reads registries to make deterministic routing decisions |
| **Orchestrator** | `.meta_brain/meta_identity/System-Orchestrator-Loop.md` | Agent Protocol | Defines how and when to chain the engines |

### Engine Independence & Chaining

```text
Navigator (programmatic) → Cataloger (hybrid) → Router (agent read)
  scan dirs + timestamps     diff + flag + describe     read catalogs + decide
```
