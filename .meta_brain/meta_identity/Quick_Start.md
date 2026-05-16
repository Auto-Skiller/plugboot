# 🚀 Quick Start — Agent Landing Protocol

Welcome to Agentic OS v5. When you land in this workspace, follow this exact sequence:

## 1. The Boot Sequence (MANDATORY)
1. Read `.meta_brain/BOOT_CONTRACTS.yaml`.
2. Run the master sync to ensure you are viewing the live state:
   `.\.meta_runtime\venv\.venv\Scripts\python.exe .meta_brain\.meta_router\.meta_sync\meta_sync.py`
3. Read `CONTROLER.yaml` to identify your objective and current session.

## 2. Navigating the Substrate
- **Need Rules?** Read `meta_identity/`.
- **Need Capabilities?** Check `meta_router.yaml` -> `brain/toolboxes`.
- **Need Context on your Goal?** Go to `.meta_brain/milestones/[SESSION]/[GOAL]/`.

## 3. Execution Rules
- **Environment**: Always use the master venv at `.meta_runtime/venv/.venv`.
- **Naming**: No numeric suffixes on sessions or goals.
- **Workflow**: Follow the 10-Step Execution Flow in `Orchestration_And_Flow.md`.

## 4. The Sync Loop
After every task, or whenever you modify the structure (create folders, move files):
- **Run the Master Sync.**
- Verify `CONTROLER.yaml` updates correctly.
