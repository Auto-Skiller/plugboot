# ⚡ Core Capabilities

## The Core Cognitive Loop (core.toolbox)

The core capabilities define the foundational cognitive loop available to all agents at all times. These are strictly separated from domain-specific skills.

| Capability | Role in Cognitive Loop | Toolbox Location |
|------------|------------------------|------------------|
| **Analysis** | Perceive and break down current state, context, user input, and data. | `.brain/.toolbox_library/core.toolbox/analysis/` |
| **Research** | Resolve knowledge gaps, find external info, read relevant docs. | `.brain/.toolbox_library/core.toolbox/research/` |
| **Planning** | Determine or adjust immediate next steps before taking action. | `.brain/.toolbox_library/core.toolbox/planning/` |
| **Brainstorming** | Generate ideas and explore multiple approaches. | `.brain/.toolbox_library/core.toolbox/brainstorming/` |
| **Benchmarking** | Measure, compare, and optimize choices. | `.brain/.toolbox_library/core.toolbox/benchmarking/` |
| **Documentation** | Produce written artifacts (READMEs, specs, guides). | `.brain/.toolbox_library/core.toolbox/documentation/` |
| **Evaluation** | Assess outcomes and quality of executed steps. | `.brain/.toolbox_library/core.toolbox/evaluation/` |
| **NotebookLM** | Full programmatic access to Google NotebookLM for deep research, audio/video generation, and multi-source synthesis. | `.brain/.toolbox_library/core.toolbox/notebooklm/` |

---

## The Sync Engine

The Sync Engine consists of three agentic protocols executed at boot and after any structural changes to ensure the workspace maps are always accurate.

| Protocol | Location | Purpose |
|----------|----------|---------|
| **sync_mission_board** | `.brain/meta.router/.sync_engine/sync_mission_board.md` | Keeps `.runtime/.mission_board/`, `CONTROLER.yaml`, and `mission_board.router.yaml` in sync. |
| **sync_toolbox** | `.brain/meta.router/.sync_engine/sync_toolbox.md` | Keeps `.brain/.toolbox_library/` and `toolbox_library.router.yaml` in sync. |
| **sync_pipelines** | `.brain/meta.router/.sync_engine/sync_pipelines.md` | Keeps pipeline runbooks, scratch, and tracker paths in sync with their routers. |

---

## The Engine System

We use four core engines to maintain structural awareness and deterministic execution without relying on heavy LLM reasoning for basic state management.

| Engine | Location | Type | Purpose |
|--------|----------|------|---------|
| **Navigator** | `.brain/.context_control.engine/navigator.engine.md` | Programmatic | Scans directories to output structure data (paths, types, sizes, last_modified) |
| **Cataloger** | `.brain/.context_control.engine/cataloger.engine.md` | Hybrid | Programmatically diffs against registries, then agent reads/writes descriptions |
| **Router** | `.brain/.context_control.engine/router.engine.md` | Agent Read | Reads registries to make deterministic routing decisions |
| **Orchestrator** | `.brain/orchestrator.engine.md` | Agent Protocol | Defines how and when to chain the engines |

### Engine Independence & Chaining

```text
Navigator (programmatic) → Cataloger (hybrid) → Router (agent read)
  scan dirs + timestamps     diff + flag + describe     read catalogs + decide
```

