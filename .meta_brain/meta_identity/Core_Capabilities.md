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
| **milestones_sync** | `.meta_brain/.meta_routing/meta_sync_engines/milestones_sync.py` | Keeps `.meta_brain/milestones/`, `CONTROLER.yaml`, and `milestones.yaml` in sync. |
| **toolboxes_sync** | `.meta_brain/.meta_routing/meta_sync_engines/toolboxes_sync.py` | Keeps `.meta_brain/toolboxes/` and `toolboxes.yaml` in sync. |
| **pipelines_sync** | `.meta_brain/.meta_routing/meta_sync_engines/pipelines_sync.py` | Keeps pipeline runbooks, scratch, and tracker paths in sync with their routers. |

---

## The Engine System

Five worker engines maintain structural awareness without burning LLM tokens on basic state management. They are orchestrated by `.meta_brain/meta_sync.py` and each one self-validates against the schema declared in Part 2 of its router.

| Engine | Location | Role |
|--------|----------|------|
| **meta_sync** | `.meta_brain/meta_sync.py` | Master orchestrator — triggers all sub-syncs, re-assembles `meta_router.yaml`, updates `CONTROLER.yaml`. |
| **milestones_sync** | `.meta_brain/.meta_routing/meta_sync_engines/milestones_sync.py` | Sessions and goals. |
| **toolboxes_sync** | `.meta_brain/.meta_routing/meta_sync_engines/toolboxes_sync.py` | Capabilities. |
| **pipelines_sync** | `.meta_brain/.meta_routing/meta_sync_engines/pipelines_sync.py` | Pipeline routers and ledgers. |
| **projects_sync** | `.meta_brain/.meta_routing/meta_sync_engines/projects_sync.py` | Standalone codebases. |
| **meta_runtime_sync** | `.meta_brain/.meta_routing/meta_sync_engines/meta_runtime_sync.py` | Runtime infrastructure. |

### Engine Independence & Chaining

Each worker engine is independent and idempotent. The master `meta_sync.py` runs them in dependency order:

```text
meta_runtime_sync → milestones_sync → toolboxes_sync → pipelines_sync → projects_sync
       ↓                                                       ↓
       └─────────────► meta_router.yaml (re-assembled) ◄──────┘
                                ↓
                         CONTROLER.yaml
```

Run via the cross-platform launcher:
- Windows: `.\.meta_runtime\venv\meta_run.ps1 .meta_brain\meta_sync.py`
- Linux/macOS: `./.meta_runtime/venv/meta_run.sh .meta_brain/meta_sync.py`

Read-only validation (bidirectional drift detection):
- `.\.meta_runtime\venv\meta_run.ps1 .meta_brain\meta_sync.py --validate`
