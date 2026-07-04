# 🌍 Hard Behavioral Laws

## 1. The Zero-Drift Audit Law
**NEVER rely on cached data.** STRICTLY read the target file's current content from disk immediately before making any changes. The OS can be operated by multiple agents and humans concurrently. If you assume you know what a file looks like from 10 minutes ago, you will overwrite someone else's work.

## 2. The Zero Guessing Law
**Never guess file paths.** All paths must come from a router/map (`index.yaml` at the root, `system-index.yaml`, or `<project>-index.yaml`) or a physical directory listing. Hallucinating a path is a critical protocol violation.

## 3. Localized Master Environments
We do NOT install global tools on the host OS. Every runtime must be self-contained.
*   **Python:** Use the master environment at `.stash/.venv/`.
*   **Why:** This prevents "It works on my machine" bugs and ensures the entire OS substrate moves as a single unit.

## 4. True Portable Execution (Cross-Platform Launcher)
We NEVER rely on system `PATH` variables, absolute paths (e.g., `C:\Users\...`), or direct interpreter calls. Direct calls break the moment the workspace moves between Windows and Linux/macOS.
*   **The Rule:** Always invoke tools via the cross-platform launcher at `.stash/.venv/`.
*   **Windows:** `.\.stash\.venv\meta_run.ps1 path\to\script.py <args>`
*   **Linux/macOS:** `./.stash/.venv/meta_run.sh path/to/script.py <args>`

## 5. Git-Persistence Posture (Recipe, Not Binaries)
The repository tracks requirements and the launcher. Compiled artifacts are NOT committed because they break cross-OS clones. The launcher auto-bootstraps missing environments on first run.

## 6. Logic Preservation Law
No existing operational logic should be deleted during evolution or structural refactors.
Foundational "Step-by-Step" instructions must be modernized rather than replaced. If you move a file, you must ensure 100% of its logical payload survives the move.

## 7. DNA Preservation (External Adoption)
When external sources (research drops, third-party tools, external code) are introduced into the workspace, they must adopt OUR architectural DNA.
*   **Tier 1 — Foundational Integrity:** Architectural DNA is immutable. Existing laws, schemas, vocabularies, the 3-layer architecture (`_shared/`, `_system/`, `projects/`), and the engine architecture MUST remain. We adopt the *idea* into our DNA — we do not contort our DNA to fit the idea.
*   **Tier 2 — Operational Muscles:** External proposals into execution spaces (like new Toolboxes or Projects) are highly permissive. Add as many toolboxes as makes sense, provided they honor the existing schema and don't contradict active laws.

## 8. Conflict Resolution Between Logic Sources
If new logic directly contradicts old logic, the new logic takes precedence, BUT the old logic must be gracefully adapted or archived, never silently erased.

## 9. Vocabulary Discipline
**Keep Comment-Enumerated Values As-Is.** The `board.schema.yaml` file is the absolute authoritative source for all vocabulary and enumerated values (e.g., `status: active | paused`). Do not invent new values; you MUST use the values explicitly defined in the comments of the board schema. The comments ARE the schema.
