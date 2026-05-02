# The Substrate Engines

This directory contains the underlying execution environments (The Substrate) of the Agentic OS. These engines have been physically extracted from their upstream repositories, audited, and repurposed to provide the Senses, Memory, and Muscles for any world-class agent dropped into this workspace.

> **Crucial Rule:** Do NOT manually modify the core source code of these engines unless you are actively developing the Substrate OS. To utilize them, invoke them via their respective CLIs or APIs as defined in `.brain/.core_brain/Orchestration & Flow.md`.

## Engine Roster & Protocols

### 1. `orchestration_engine` (Derived from Dagster)
* **Role**: State and Trigger Management.
* **Usage**: Runs as a daemon watching the `.missions` directories. It executes sensors that trigger agentic pipelines whenever a new task is added or updated.

### 2. `agentic_engine` (Derived from Archon)
* **Role**: The core agent looping, workflow routing, and multi-agent communication bus.
* **Usage**: When the `orchestration_engine` triggers a task, this engine boots up to handle the "thinking" loop, tool calling, and action execution.

### 3. `map_engine` (Derived from Graphify)
* **Role**: Structural AST parsing and exact dependency graphing.
* **Usage**: Run this engine to generate precise `.json` and `.html` dependency maps of `.brain` or `.library`. It outputs to `.registry/.core_registry/structural_map/`.

### 4. `semantic_engine` (Derived from RAG-Anything)
* **Role**: Text embedding, fuzzy search, and semantic memory.
* **Usage**: Parses `.brain` rules and workspace text. Run its indexing script to build a vector database in `.registry/.core_registry/vector_db/`. Agents query this via its CLI to pull contextual knowledge.
