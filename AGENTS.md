# 🤖 AGENTS

> [!IMPORTANT]
> This is the root pointer file for all agents landing in this workspace.
> **CRITICAL BOOT SEQUENCE:** Before taking any action, you MUST:
> 1. Read `.meta_brain/BOOT_CONTRACTS.yaml` for exact boot instructions.
> 2. Run the master sync via the cross-platform launcher (it auto-builds the workspace venv on first boot, then runs the sync engine):
>    - Windows: `.\.meta_runtime\venv\meta_run.ps1 .meta_brain\meta_sync.py`
>    - Linux/macOS: `./.meta_runtime/venv/meta_run.sh .meta_brain/meta_sync.py`
> 3. Read `CONTROLER.yaml` to understand your current objective.
> 4. If the objective involves a specific pipeline (e.g., Scaler, Hustler), you MUST read its corresponding router and **ALL** referenced runbook files in full before providing any simulation, plan, or execution. Partial knowledge is a protocol violation.

> [!WARNING]
> **CORE LAW OF PORTABILITY:** All dependencies, scripts, binaries, and environment configurations MUST be installed and contained strictly **INSIDE** the `open-workspace` folder. NEVER install tools, pip packages, or npm modules globally on the host OS. ALWAYS use workspace-local virtual environments (`.venv`), local `node_modules`, or localized binaries. This ensures the entire workspace is 100% portable and functions immediately if moved to another machine.

> [!IMPORTANT]
> **OS RUNTIME EXECUTION (TRUE PORTABILITY):** To execute Python tools, NEVER use `Activate.ps1` (it breaks on new machines due to hardcoded absolute paths) and NEVER call `.venv\Scripts\python.exe` directly (it breaks cross-OS — Windows `.exe` files won't run on Linux/macOS, and vice versa). Always use the cross-platform launcher, which loads `.env` and forwards args to the right interpreter:
> - Windows: `.\.meta_runtime\venv\meta_run.ps1 -m notebooklm <command>`
> - Linux/macOS: `./.meta_runtime/venv/meta_run.sh -m notebooklm <command>`
> **ENVIRONMENT:** The launcher auto-loads `.meta_runtime/venv/.env` before forwarding args. No manual env loading needed.
> **RUNTIME DEPENDENCIES:** Before installing new packages, ALWAYS check `.meta_runtime/venv/requirements.txt`. If you install a new package, update the registry: `meta_run -m pip freeze > .meta_runtime/venv/requirements.txt`.
> **CROSS-OS BOOTSTRAP:** The `.venv` itself is **not** committed to git (compiled `.exe`/ELF binaries are OS-specific). The launcher rebuilds it from `requirements.txt` on first boot using the host's Python 3 (`py -3` on Windows, `python3` on Unix). Bootstrap takes ~30s on a fresh clone; subsequent boots are instant.
> **SECRETS & AUTHENTICATION:** Because this repository is strictly private and designed for 100% portability, it is safe to store API keys in `.env` files and maintain active session cookies (like `.meta_runtime/auth/notebooklm/`) directly inside the workspace.

We are not building "an agent" — we are building the **Substrate** (Agentic OS v5.3) that allows any world-class agent (Claude, Gemini, GPT, Hermes, etc.) to land in this workspace and immediately become 10x more autonomous and capable.

The "Perfect System" is one where the workspace provides the **Senses** (`meta_router.yaml`), the **Memory** (`CONTROLER.yaml`), and the **Muscles** (`toolboxes/`), while the agents provide the "Brain" to execute operations deterministically.

---

### The Three Pillars of Agentic OS v5.3:

1. **`.meta_brain/` — The Central Nervous System & Logic**
   - `meta_router.yaml`: The Master Index. Single source of truth for every path in the workspace.
   - `.meta_routing/meta_sync_engines/`: 6 worker engines + 10 shared modules for self-healing sync.
   - `meta_identity/`: 19 identity files — laws, modes, persona, concurrency model, evolution protocol.
   - `toolboxes/`: 65+ skill folders organized across 5 domains (core, business, engineering, life, studio).
   - `milestones/`: Active sessions and goals with auto-promotion and auto-archival.

2. **`.meta_runtime/` — Execution Environment & Ephemeral State**
   - `venv/`: Cross-platform launcher (`meta_run.{ps1,sh}`) with auto-bootstrap.
   - `auth/`: Active session cookies (e.g., NotebookLM).
   - `.meta_scratch/`: Temporary agent working files.
   - `.meta_archive/`: Rotated logs and deprecated files.

3. **`_pipelines/` + `projects/` — Execution Workspaces**
   - `_pipelines/`: Continuous workflows — **Scaler** (23 P-LAWs, 6 runbooks) and **Hustler** (15 H-LAWs, 6 runbooks).
   - `projects/`: Finite, bounded codebases with defined scope and completion state.

---

### Key System Contracts:

- **Multi-session concurrency**: Advisory file locking + atomic YAML writes + vocabulary discipline. See `Concurrency_Model.md`.
- **Freshness contracts**: Every router stamps `last_synced / fresh_until / status`. Stale routers fail `--validate`.
- **Schema allow-list**: CONTROLER keys not declared in `BOOT_CONTRACTS.controler_schema` are swept on every sync cycle.
- **Self-evolution**: Proposals queue in `pending_evolutions.yaml` at workspace root. Governed by the Non-Loss Principle.
- **Deprecated-token sweep**: `--validate` flags stale path references in identity docs using the `BOOT_CONTRACTS.deprecated_path_tokens` list.

**Note for Agents:** Start your turn by reading `CONTROLER.yaml` to understand your current objective, and `.meta_brain/meta_router.yaml` to find the tools and context files necessary to achieve it.