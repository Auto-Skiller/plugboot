# AUTO_SKILLER MISSION & ARCHITECTURE

The AUTO_SKILLER is a specialized system-level agentic pipeline focused on the continuous improvement, monetization, and capability expansion of the `open-workspace` environment.

## Core Objectives

The system analyzes raw discoveries and translates them into actionable proposals across three primary levels:

1. **Architecture-Level**: 
   - Opportunities for architecture enhancements.
   - Edits, additions, or removals within the `open-workspace` system structure.
2. **Business-Level**: 
   - Monetization opportunities.
   - Identifying how the system or its outputs can generate value/revenue.
3. **Capabilities-Level**: 
   - Enhancing existing capabilities or adding entirely new ones to the system.

## Analysis Framework

When a discovery is identified in `discoveries.json`, it is analyzed against:
- **System Impact**: How it affects the `open-workspace` architecture.
- **Value Proposition**: How it creates business opportunities.
- **Functional Growth**: How it expands system capabilities.

## Proposal Routing

Proposals generated from these analyses are routed into specific folders within `_proposals/`:

- **`_brain-proposals/`**: For high-level `open-workspace` system changes (`.brain`, `AGENTS.md`, `BOARD.yaml`, `INDEX.json`).
- **`_core-proposals/`**: Enhancements to the `_core` capability layer.
- **`_departments-proposals/`**: Updates to the `_departments` structure.
- **`_tools-proposals/`**: New or enhanced utility tools in `_tools`.
- **`AUTO_HUSTLER-proposals/`**: System-level enhancements for the HUSTLER pipeline.
- **`AUTO_SKILLER-proposals/`**: Self-improvement and architecture enhancements for the SKILLER pipeline.
- **`custom_projects-proposals/`**: System-level proposals for external project structures.

## Self-Evolution

The AUTO_SKILLER is capable of self-improvement. Any discoveries or ideas for enhancing the SKILLER's own logic, speed, or accuracy are converted into proposals and routed strictly to:
- **`_proposals/AUTO_SKILLER-proposals/`**

## Conditional Analysis Paths

- **Multi-Level Discoveries**: Processed using the full **Tri-Lens** (Architecture + Business + Capability).
- **Architecture-Level Discoveries**: Focus exclusively on **Architecture** enhancements.
- **Business-Level Discoveries**: Focus exclusively on **Business** opportunities and monetization.

## Persistence & Anti-Duplication

To prevent redundant work, the system maintains a **Status Ledger**. 
- Discoveries are marked as `PROCESSED` once a proposal is generated.
- Proposals are marked as `IMPLEMENTED` once the root authority incorporates them into the system.
