# 🌍 Universal Portability & Integration Standard

> **Objective:** To maintain a 100% portable Agentic OS that can be "cloned and played" on any machine without configuration or external dependencies. Follow these strict architectural rules for all runtimes (Python, Node.js, Binaries, Go, etc.).

**When to use:** Consult before installing any dependency, adding a new runtime language, committing build artifacts, or invoking an interpreter directly.

## 1. Localized Master Environments
We do NOT install global tools on the host OS. Every runtime must be self-contained within the `.meta_runtime/` directory.
*   **Python:** Use the master environment at `.meta_runtime/venv/.venv`.
*   **Node.js:** When a Node runtime is added, place a localized `node_modules` inside `.meta_runtime/node/`. The folder is intentionally absent until the first Node-based tool lands; do not pre-create it.
*   **Binaries:** Store standalone executables (e.g., `ffmpeg.exe`, `yt-dlp.exe`) in `.meta_runtime/bin/` (created on demand).
*   **Why:** This prevents "It works on my machine" bugs and ensures that the entire OS substrate moves as a single unit.

## 2. True Portable Execution (Cross-Platform Launcher)
We NEVER rely on system `PATH` variables, absolute paths (e.g., `C:\Users\...`), or direct interpreter calls (e.g., `.venv\Scripts\python.exe`). Direct interpreter calls break the moment the workspace moves between Windows and Linux/macOS, because compiled `.exe` files don't run on Linux and ELF binaries don't run on Windows.
*   **The Rule:** Always invoke Python via the cross-platform launcher in `.meta_runtime/venv/`. The launcher auto-builds the `.venv` on first boot, loads the workspace `.env`, then forwards args to the correct interpreter.
*   **Correct (Windows):** `.\.meta_runtime\venv\meta_run.ps1 .meta_brain\meta_sync.py`
*   **Correct (Linux/macOS):** `./.meta_runtime/venv/meta_run.sh .meta_brain/meta_sync.py`
*   **Correct (modules):** `meta_run -m notebooklm <command>` (same on all OSes after the prefix)
*   **Why:** The launcher is the only path that works identically across Windows, Linux, and macOS. Hardcoded interpreter paths are an anti-pattern.

## 3. The Runtime Registry (Dependency Tracking)
Every environment must have a canonical manifest for version control.
*   **Rule:** Before adding a dependency, check the manifest. After adding, update the manifest.
*   **Python:** `.meta_runtime/venv/requirements.txt`
*   **Node.js:** `.meta_runtime/node/package.json`
*   **Freezing:** Always freeze your environment state after an install (e.g., `pip freeze` or `npm shrinkwrap`) to ensure deterministic behavior across clones.
*   **Bytecode cache:** the launcher unconditionally sets `PYTHONPYCACHEPREFIX=.meta_runtime/__pycache__` so Python writes its bytecode into a single workspace-local dir under the Runtime pillar instead of scattering it across `.meta_brain/`. Assignment is unconditional (G-PYCACHE-LEAK fix) — earlier versions guarded it for theoretical `.env` overrides, but that also let stale values leak in from the parent shell session. The consolidation keeps the logic pillar clean and makes the bytecode trivially safe to wipe (`rm -rf .meta_runtime/__pycache__`).

## 4. Git-Persistence Posture (Recipe, Not Binaries)
The Agentic OS is designed for "Instant Teleportation" across **any** OS — Windows, Linux, or macOS.
*   **Commit the recipe, not the binaries.** The repository tracks `requirements.txt`, `package.json`, lock files, bootstrap scripts (`bootstrap.{ps1,sh}`), and the cross-platform launcher (`meta_run.{ps1,sh}`). Compiled artifacts like `.venv/Scripts/*.exe`, `.venv/bin/python`, and `.venv/Lib/site-packages/` are **not** committed because they are platform-specific (Windows PE vs Linux ELF) and break cross-OS clones.
*   **First-boot bootstrap.** On a fresh clone, the launcher detects the missing or stale `.venv` and rebuilds it from `requirements.txt` using the host's Python 3 (`py -3` on Windows, `python3` on Unix). This takes ~30s once; subsequent boots reuse the local `.venv` instantly.
*   **Stale-venv detection.** The bootstrapper inspects `pyvenv.cfg` for cross-OS pollution (e.g., Linux paths showing up on a Windows host) and silently rebuilds when detected. Agents never need to manually clean a broken venv.
*   **Tracked, platform-neutral state.** Auth cookies (`.meta_runtime/auth/`), `.env` secrets, and ephemeral configs (`.meta_runtime/.meta_scratch/`) are committed because they are platform-neutral and required for the "clone and play" experience.
*   **The one allowed host dependency.** The launcher needs *some* Python 3 on the host to bootstrap from. This is a build-tool prerequisite (same role as `git` itself), not a runtime dependency. Every modern Linux/macOS ships with `python3`; Windows users install via `winget install Python.Python.3.12` or python.org once.

## 5. Skill Execution Contracts
Every new tool requires a `SKILL.md` file in its toolbox folder.
*   **The Rule:** The `SKILL.md` must provide copy-pasteable relative path commands for execution. Never assume the agent knows the environment path.
