# 🌍 Universal Portability & Integration Standard

> **Objective:** To maintain a 100% portable Agentic OS that can be "cloned and played" on any machine without configuration or external dependencies. Follow these strict architectural rules for all runtimes (Python, Node.js, Binaries, Go, etc.).

## 1. Localized Master Environments
We do NOT install global tools on the host OS. Every runtime must be self-contained within the `.meta_runtime/` directory.
*   **Python:** Use the master environment at `.meta_runtime/venv/.venv`.
*   **Node.js:** Use a localized `node_modules` inside `.meta_runtime/node/` (if applicable).
*   **Binaries:** Store standalone executables (e.g., `ffmpeg.exe`, `yt-dlp.exe`) in `.meta_runtime/bin/`.
*   **Why:** This prevents "It works on my machine" bugs and ensures that the entire OS substrate moves as a single unit.

## 2. True Portable Execution (Relative Paths Only)
We NEVER rely on system `PATH` variables or absolute paths (e.g., `C:\Users\...`).
*   **The Rule:** You must always execute binaries and modules using their relative path from the workspace root.
*   **Correct (Python):** `.\.meta_runtime\venv\.venv\Scripts\python.exe -m [module]`
*   **Correct (Node):** `.\.meta_runtime\node\node.exe [script]`
*   **Correct (Binary):** `.\.meta_runtime\bin\ffmpeg.exe [args]`
*   **Why:** Absolute paths break when the workspace is moved to a different user folder or drive. Relative paths remain valid regardless of the parent directory.

## 3. The Runtime Registry (Dependency Tracking)
Every environment must have a canonical manifest for version control.
*   **Rule:** Before adding a dependency, check the manifest. After adding, update the manifest.
*   **Python:** `.meta_runtime/venv/requirements.txt`
*   **Node.js:** `.meta_runtime/node/package.json`
*   **Freezing:** Always freeze your environment state after an install (e.g., `pip freeze` or `npm shrinkwrap`) to ensure deterministic behavior across clones.

## 4. Git-Persistence Posture
The Agentic OS is designed for "Instant Teleportation." 
*   **The Rule:** Entire environments (including `.venv`, `node_modules`, and binary caches) are intentionally PUSHED to the private repository.
*   **Secrets:** Active session cookies and `.env` secrets are also pushed to ensure that authenticated states (e.g., NotebookLM sessions) remain active after cloning.
*   **Gitignore:** Only ignore machine-specific junk or massive, non-portable temp files.

## 5. Skill Execution Contracts
Every new tool requires a `SKILL.md` file in its toolbox folder.
*   **The Rule:** The `SKILL.md` must provide copy-pasteable relative path commands for execution. Never assume the agent knows the environment path.
