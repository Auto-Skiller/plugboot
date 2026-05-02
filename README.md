We are not building "an agent" - we are building the Substrate (The Agentic OS) that allows any world-class agent (Claude, Gemini, Hermes, etc.) to land in this workspace and immediately become 10x more autonimus and capable.

The "Perfect System" here is one where the workspace provides the Senses (Indexing), the Memory (Boards/Ledgers), and the Muscles (CLI Tools), while the agents provide the "Brain."

## Substrate Engines Lineage
To maintain the "Zero Drift" principle while keeping track of where our Substrate engines came from, they have been split by domain in `.library/.engines_library/`:

### The Missions Domain
The raw engines are in `.library/.engines_library/` while the wrappers are in `.library/.engines_library/missions_engine/`.
| New Engine Name | Original Repository | Purpose in Agentic OS Substrate |
| :--- | :--- | :--- |
| `agentic_engine` | `Archon` | The underlying loop, workflow routing, and communication bus. |
| `orchestration_engine`| `dagster` | State, trigger management, sensors, and the Mission Control UI. |

### The Registry Domain
The raw engines are in `.library/.engines_library/` while the wrappers are in `.library/.engines_library/registry_engine/`.
| New Engine Name | Original Repository | Purpose in Agentic OS Substrate |
| :--- | :--- | :--- |
| `map_engine` | `graphify` | Structural codebase AST parsing and exact dependency graphing. |
| `semantic_engine` | `RAG-Anything` | Text embeddings, semantic memory, and fuzzy search indexing. |