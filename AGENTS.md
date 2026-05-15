# 🤖 AGENTS

> [!IMPORTANT]
> This is the root pointer file for all agents landing in this workspace.
> **CRITICAL BOOT SEQUENCE:** Before taking any action, you MUST:
> 1. Read `.brain/BOOT_CONTRACT.yaml` for exact boot instructions.
> 2. Run `.\.runtime\venv\.venv\Scripts\python.exe .brain\.sync\sync_engine.py` to ensure all routers, CONTROLER, and mission board are synchronized.
> 3. Read `CONTROLER.yaml` to understand your current objective.
> 4. If the objective involves a specific pipeline (e.g., Scaler, Hustler), you MUST read its corresponding router and **ALL** referenced runbook files in full before providing any simulation, plan, or execution. Partial knowledge is a protocol violation.

> [!WARNING]
> **CORE LAW OF PORTABILITY:** All dependencies, scripts, binaries, and environment configurations MUST be installed and contained strictly **INSIDE** the `open-workspace` folder. NEVER install tools, pip packages, or npm modules globally on the host OS. ALWAYS use workspace-local virtual environments (`.venv`), local `node_modules`, or localized binaries. This ensures the entire workspace is 100% portable and functions immediately if moved to another machine.

> [!IMPORTANT]
> **OS RUNTIME EXECUTION (TRUE PORTABILITY):** To execute Python tools, NEVER use `Activate.ps1` (as it breaks on new machines due to hardcoded absolute paths). Always call the binary directly using relative paths from the workspace root:
> Example: `.\.runtime\venv\.venv\Scripts\python.exe -m notebooklm <command>`
> Example: `.\.runtime\venv\.venv\Scripts\pyragify.exe <command>`
> **ENVIRONMENT:** Always load the workspace `.env` file before executing tools. In PowerShell: `Get-Content .runtime\venv\.env | ForEach-Object { if ($_ -match '^([^#][^=]*)=(.*)$') { [System.Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim()) } }`
> **RUNTIME DEPENDENCIES:** Before installing new packages, ALWAYS check the `.runtime\venv\requirements.txt` file. If you install a new package, you MUST update the registry by running `.\.runtime\venv\.venv\Scripts\python.exe -m pip freeze > .runtime\venv\requirements.txt`.
> **SECRETS & AUTHENTICATION:** Because this repository is strictly private and designed for 100% portability, it is safe to store API keys in `.env` files and maintain active session cookies (like `.runtime/auth/notebooklm/`) directly inside the workspace.

We are not building "an agent" — we are building the **Substrate** (The Agentic OS v5) that allows any world-class agent (Claude, Gemini, Hermes, etc.) to land in this workspace and immediately become 10x more autonomous and capable.

The "Perfect System" is one where the workspace provides the **Senses** (meta.router maps), the **Memory** (`CONTROLER.yaml`), and the **Muscles** (Toolbox Library), while the agents provide the "Brain" to execute operations deterministically.

### The Four Pillars of Agentic OS v5:

1. **`.brain/` — The Central Nervous System & Logic**
   - `meta_router.yaml`: The ultimate Master Index. Contains the schemas, routing instructions, and paths to all specialized router maps.
   - `.sync/`: Automation protocols for self-healing and mapping the workspace.
   - `_identity/`: System laws and architectural standards.
   - `toolbox_library/`: The execution muscles. Contains agentic capabilities and extended domain toolboxes.
   - `sessions_goals/`: OS Internal State. Active operation tracking (sessions and goals).

2. **`.runtime/` — Execution Environment & Ephemeral State**
   - `venv/`: Local Python environment, requirements, and `.env` secrets.
   - `auth/`: Active external state (e.g. notebooklm session cookies).
   - `.scratch/`: Temporary agent working files.
   - `.archive/`: Old system logs and deprecated files.

3. **`_pipelines/` — Continuous Delivery**
   - Workspaces for non-finite processes (e.g., `hustler`, `_scaler`). Each contains its own `.meta` context, runbooks, scratchpads, and trackers.

4. **`projects/` — Finite Codebases**
   - Direct bounded builds and standalone applications.

**Note for Agents:** Start your turn by reading `CONTROLER.yaml` to understand your current objective, and `.brain/meta_router.yaml` to find the tools and context files necessary to achieve it.