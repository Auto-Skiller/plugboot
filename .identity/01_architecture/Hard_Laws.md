---
metadata:
  purpose: "The absolute behavioral laws that every agent must follow at all times — covering zero-drift, portability, logic preservation, and DNA integrity."
  when_to_use: "Consult this before modifying any existing code, adopting external tools, or making structural changes."
---
# 🌍 Hard Behavioral Laws

## 1. The Zero-Drift Audit Law
**NEVER rely on cached data.** STRICTLY read the target file's current content from disk immediately before making any changes. The OS can be operated by multiple agents and humans concurrently. If you assume you know what a file looks like from 10 minutes ago, you will overwrite someone else's work.

## 2. The Zero Guessing Law
**Never guess file paths.** All paths must come from a router (`CONTROLER.yaml`, a `.db/` file) or a physical directory listing. Hallucinating a path is a critical protocol violation.

## 3. Localized Master Environments
We do NOT install global tools on the host OS. Every runtime must be self-contained.
*   **Python:** Use the master environment at `_os/venv/`.
*   **Why:** This prevents "It works on my machine" bugs and ensures the entire OS substrate moves as a single unit.

## 4. True Portable Execution (Cross-Platform Launcher)
We NEVER rely on system `PATH` variables, absolute paths (e.g., `C:\Users\...`), or direct interpreter calls. Direct calls break the moment the workspace moves between Windows and Linux/macOS.
*   **The Rule:** Always invoke tools via the cross-platform launcher at `_os/venv/`.
*   **Windows:** `.\_os\venv\meta_run.ps1 -m script_name`
*   **Linux/macOS:** `./_os/venv/meta_run.sh -m script_name`

## 5. Git-Persistence Posture (Recipe, Not Binaries)
The repository tracks `requirements.txt`, lock files, and the launcher. Compiled artifacts (like `.exe` or `site-packages`) are NOT committed because they break cross-OS clones. The launcher auto-bootstraps missing environments on first run.

## 6. Logic Preservation Law
No existing operational logic should be deleted during evolution or structural refactors.
Foundational "Step-by-Step" instructions must be modernized rather than replaced. If you move a file, you must ensure 100% of its logical payload survives the move.

## 7. DNA Preservation (External Adoption)
When external sources (research drops, third-party tools, external code) are introduced into the workspace, they must adopt OUR architectural DNA.
*   **Tier 1 — Foundational Integrity:** Architectural DNA is immutable. Existing laws, schemas, vocabularies, the three-pillar hierarchy, and the engine architecture MUST remain. We adopt the *idea* into our DNA — we do not contort our DNA to fit the idea. If an external tool cannot be adopted without breaking existing DNA, it must be rewritten or rejected.
*   **Tier 2 — Operational Muscles:** External proposals into execution spaces (like new Toolboxes or Projects) are highly permissive. Add as many toolboxes as makes sense, provided they honor the existing schema and don't contradict active laws.

## 8. Conflict Resolution Between Logic Sources
If new logic directly contradicts old logic, the new logic takes precedence, BUT the old logic must be gracefully adapted or archived, never silently erased.
