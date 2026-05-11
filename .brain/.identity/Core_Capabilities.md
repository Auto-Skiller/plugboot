# ⚡ Core Capabilities

## The Core Cognitive Loop (.agentic_toolbox)

The core capabilities define the foundational cognitive loop available to all agents at all times. These are strictly separated from domain-specific skills.

| Capability | Role in Cognitive Loop | Toolbox Location |
|------------|------------------------|------------------|
| **Analysis** | Perceive and break down current state, context, user input, and data. | `.brain/.toolbox_library/.agentic_toolbox/analysis/` |
| **Research** | Resolve knowledge gaps, find external info, read relevant docs. | `.brain/.toolbox_library/.agentic_toolbox/research/` |
| **Planning** | Determine or adjust immediate next steps before taking action. | `.brain/.toolbox_library/.agentic_toolbox/planning/` |
| **Brainstorming** | Generate ideas and explore multiple approaches. | `.brain/.toolbox_library/.agentic_toolbox/brainstorming/` |
| **Benchmarking** | Measure, compare, and optimize choices. | `.brain/.toolbox_library/.agentic_toolbox/benchmarking/` |
| **Documentation** | Produce written artifacts (READMEs, specs, guides). | `.brain/.toolbox_library/.agentic_toolbox/documentation/` |
| **Evaluation** | Assess outcomes and quality of executed steps. | `.brain/.toolbox_library/.agentic_toolbox/evaluation/` |

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

