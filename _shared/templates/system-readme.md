# 🧠 System Overview (`_system`)

> [!IMPORTANT]
> This is the entry point for the `_system` orchestrator entity.
> This layer is ALWAYS ON. It orchestrates, manages, and audits both itself and all projects.

## 📌 System Identity
- **Name:** System Orchestrator
- **Description:** The central nervous system of the Agentic OS v6.0. It oversees pipeline execution, state syncing, and entity index management.

## ⚖️ The 3-Layer Paradigm
1. **`_shared/`**: The Shared Library. Contains universal schemas, shared pipelines (Scaler, Hustler), and shared toolboxes.
2. **`_system/`**: The Always-On Orchestrator (this entity). Governed by its own `system-board.yaml` and `system-index.yaml`.
3. **`[Projects]/`**: Bounded codebases, each with its own isolated board, index, and `.meta` brains.

## 📂 System Infrastructure
- `.system-meta/.system-os_prompts/` — The hard laws, architecture rules, and behavior guidelines that bind the agent.
- `.system-missions/` — System-level goals (e.g., core OS refactoring, infrastructure scaling).
- `system-board.yaml` — The Control Plane. Dictates active modes and pipelines.
- `system-index.yaml` — The Path Map. Catalogs all system-level resources.

## 🔄 Engine Cycle
The backend sync engine (`.infra/backend/engine.py`) continuously scans `config.yaml`, discovers entities, and builds out their respective index and board files to keep the system state perfectly aligned with disk reality.
