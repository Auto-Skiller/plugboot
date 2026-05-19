# 🚀 Quick Start — Agent Landing Protocol

**Purpose:** First-touch onboarding playbook for any agent landing in this workspace.
**When to use:** Read at the very start of a fresh session, before BOOT-00 if you've never landed in this workspace before. Skip on subsequent boots.

Welcome to Agentic OS v5.3. When you land in this workspace, follow this exact sequence:

## 1. The Boot Sequence (MANDATORY)
1. Read `.meta_brain/BOOT_CONTRACTS.yaml`.
2. Run the master sync via the cross-platform launcher (auto-bootstraps `.venv` on first boot, then forwards to the right Python):
   - Windows: `.\.meta_runtime\venv\meta_run.ps1 .meta_brain\meta_sync.py`
   - Linux/macOS: `./.meta_runtime/venv/meta_run.sh .meta_brain/meta_sync.py`
3. Read `CONTROLER.yaml` to identify your objective and current session.

## 2. Navigating the Substrate
- **Need Rules?** Read `meta_identity/`.
- **Need Capabilities?** Check `meta_router.yaml` -> `routers.brain.toolboxes`.
- **Need Context on your Goal?** Go to `.meta_brain/milestones/[SESSION]/[GOAL]/`.

## 3. Execution Rules
- **Environment**: Always invoke Python via the launcher. Never call `.venv\Scripts\python.exe` or `.venv/bin/python` directly — those break across OSes.
- **Naming**: Mirror the closest sibling pattern in the same folder. Hard anti-patterns (numeric session/goal suffixes, missing `SES-`/`GOAL-` prefix, route collisions) are detailed in `Rules_And_Considerations.md` §5.
- **Workflow**: Follow the 10-Step Execution Flow in `Orchestration_And_Flow.md`.

## 4. The Sync Loop
After every task, or whenever you modify the structure (create folders, move files):
- **Run the Master Sync.** Always via the launcher.
- Verify `CONTROLER.yaml` updates correctly.
- For read-only drift detection: append `--validate` to the master sync command.
