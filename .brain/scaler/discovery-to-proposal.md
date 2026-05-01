# PLAYBOOK: DISCOVERY TO PROPOSAL WORKFLOW

This playbook describes the process of ingesting raw discoveries and transforming them into formal system proposals.

## Workflow Steps

### 1. Ingestion & Monitoring
- Monitor `_discoveries/discoveries.json` for any new entries or updates.
- **Anti-Duplication Check**: Consult the `.brain/ledger.json` (or BOARD scratchpad) to ensure the discovery hasn't already been processed.

### 2. Conditional Multi-Level Analysis
Analyze each discovery based on its source directory:

- **From `_multi-level/`**: Apply the full **Tri-Lens** (Architecture + Business + Capability).
- **From `architecture-level/`**: Apply **Architecture Lens** only.
- **From `business-level/`**: Apply **Business Lens** only.

#### The Analysis Lenses:
- **Architecture Lens**: Can we improve the `open-workspace` structure? Does this discovery suggest a better way to organize files, logic, or agents?
- **Business Lens**: Is there a money-making opportunity here? How can this discovery be monetized using the current or expanded system?
- **Capability Lens**: Does this add a new "skill" or tool to the system? How can we expand what the agents can do?

### 3. Verification & Deep Dive
- Consult `proposals.json` to understand valid proposal types and routing.
- Read existing JSON indexes and MD files in the relevant areas (e.g., `_core`, `_tools`) to ensure the proposal is unique and complementary.

### 4. Proposal Generation
- Convert the discovery into a formal proposal.
- Assign the proposal a type (Architecture, Business, or Capability).
- Save the proposal to the correct subfolder in `_proposals/` based on the target area (Brain, Core, Departments, Tools, etc.).

### 5. Routing Rules
- **Brain**: Root system files and high-level architecture.
- **Core**: Reusable capability modules.
- **Departments**: Specialized domain structures.
- **Tools**: CLI tools, scripts, and utilities.
- **Self-Evolution**: Any proposals for improving the `AUTO_SKILLER` itself must be routed to `_proposals/AUTO_SKILLER-proposals/`.
- **System-Pipelines (HUSTLER)**: System-level enhancements for the HUSTLER pipeline.

## Prohibited Actions
- DO NOT propose new products or individual projects within the pipeline folders.
- DO NOT duplicate existing capabilities or tools.
- DO NOT propose changes that break the cascading logic of the `open-workspace`.
