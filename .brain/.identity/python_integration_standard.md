# 🐍 Python Toolbox Integration Standard

> **Objective:** To maintain a 100% portable Agentic OS. Follow these strict architectural rules when adding any new Python-based tools (like `notebooklm-py`, web scrapers, data analyzers) to the workspace.

## 1. The Central OS Engine
We do NOT create isolated `.venv` folders for each skill.
*   **The Rule:** All Python dependencies must be installed into the single master environment located at `open-workspace\.venv`.
*   **Why:** This saves disk space, prevents downloading massive binaries (like Chromium) multiple times, and allows agents to seamlessly chain tools from different toolboxes without switching environments.

## 2. True Portable Execution
We NEVER use the standard PowerShell activation script (`.\.venv\Scripts\Activate.ps1`).
*   **The Rule:** You must always execute Python modules using their absolute relative path from the workspace root.
*   **Correct:** `.\.venv\Scripts\python.exe -m notebooklm`
*   **Incorrect:** `notebooklm login`
*   **Why:** Activation scripts hardcode the original host's absolute path (e.g., `C:\Users\John\...`). By using relative paths, the `.venv` can be moved to any new Windows PC via GitHub and executed instantly without crashing.

## 3. The Runtime Registry
We must maintain a perfect map of installed dependencies.
*   **The Rule:** Before installing a new package, read `requirements.txt` at the root. If you install a new package into `.venv`, you MUST freeze the state:
    `.\.venv\Scripts\python.exe -m pip freeze > requirements.txt`

## 4. Git and Security Posture
The user has opted for **Absolute Portability** via a Private GitHub Repo.
*   **The Rule:** The `.venv`, temporary `.scratch` folders, `.env` secrets, and hidden cookie caches (like `.runtime/.notebooklm/`) are intentionally PUSHED to GitHub. 
*   **Why:** This allows the user to clone the repo on a new laptop and have all API keys and authenticated sessions work instantly, zero setup required.
*   **Gitignore:** We only ignore dynamically generated junk that corrupts git history (`__pycache__`, `*.pyc`, `.DS_Store`).

## 5. Skill Documentation
Every new tool requires a `SKILL.md` file in its toolbox folder.
*   **The Rule:** The `SKILL.md` must explicitly write out the CLI bash commands using the "True Portable Execution" syntax. Do not assume the agent knows how to run the tool. Provide copy-pasteable relative paths.

