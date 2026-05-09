# 🚀 Agentic OS v5 Substrate

We are not building "an agent" — we are building the **Substrate** (The Agentic OS) that allows any world-class agent (Claude, Gemini, Hermes, etc.) to land in this workspace and immediately become 10x more autonomous and capable.

The "Perfect System" is one where the workspace provides the **Senses** (meta.router maps), the **Memory** (`CONTROLER.yaml`), and the **Muscles** (Toolbox Library), while the agents provide the "Brain" to follow deterministic execution flows.

## Architecture Overview

### 🧠 THE BRAIN (.brain/)
The cognitive core of the OS.
- `meta.router.yaml` — The Master Index map. Start here to understand schemas and target paths.
- `meta.router/` — Specialized map fragments (mission board, toolboxes, pipelines).
- `.sync_engine/` — Internal automation protocols that ensure the maps stay perfectly synced with the physical files.

### 🛠️ CORE DOMAIN (.core/)
The memory and capabilities of the system.
- `mission_board/` — All active sessions and granular goals (e.g., `SES-ALPHA`).
- `toolbox_library/` — Modular skill folders organized into `core.toolbox` (Agentic operations) and `extended.toolbox` (Business, Engineering, Life, Studio domains).

### ⚙️ CONTINUOUS PIPELINES (pipelines/)
Infinite, ongoing business workflows.
- `hustler/` — Product discovery and processing.
- `scaler/` — Business scaling and deployment.
- (Each contains its own `.meta` folder with runbooks, trackers, and scratchpads).

### 📦 FINITE PROJECTS (projects/)
Bounded codebase builds, application repos, and standalone assets.

### 📋 CENTRAL COMMAND (CONTROLER.yaml)
The unified, real-time source of truth for session tracking, active goals, and OS-level communication.

---
**Note for Agents:** Start your turn by reading `CONTROLER.yaml` to sync with your current objective, and reference `.brain/meta.router.yaml` to navigate the workspace without guessing paths.