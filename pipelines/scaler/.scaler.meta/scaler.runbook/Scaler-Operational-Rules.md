# 📜 Scaler Operational Rules

## Objective
Define the operational rules and constraints for the Scaler pipeline.

## Steps

## 1. Core Principles

### Strict System Assimilation
When processing external discoveries (plugins, repos, tools), the Scaler MUST strictly adopt the logic to match the current Agentic OS system.
- **Eradicate External Terms**: Completely replace all terms, names, and structural references from the external source with the native Agentic OS terminology (e.g., Aspects, Toolboxes, Mission Board).
- **Expand, Don't Bolt-On**: Do not just drop external folders into the workspace. Analyze the relationships (Correlation), rewrite the architecture to fit natively, and actively expand existing OS features (like utilizing the `artifacts` array in goals) rather than creating conflicting external structures.

### Copy over Warp
When integrating new external capabilities (after Assimilation is complete), prioritize **copying** the deterministic logic exactly as it exists. Only "turn" (refactor or modify) the functional logic if it is fundamentally incompatible with the Agentic OS architecture.

---

## 2. Constraints & Prohibitions

- **No Product Builds**: The Scaler pipeline is strictly for **System-Level** evolution. Do not build individual products or projects here; those belong in `projects/` or `pipelines/hustler/`.
- **Zero-Drift Sync**: Never manually update the global `meta.router.yaml` from within the Scaler workspace. All changes must be routed through `EXTERNAL/proposals/` or `INTERNAL/solutions/` and synced via the Root OS protocols.
- **Atomic State**: Every operation must be preceded by a state update in `SCALER-STATE.yaml`.
- **Anti-Duplication**: Consult the `EXTERNAL-LEDGER.yaml` or `INTERNAL-LEDGER.yaml` inside `scaler.tracker/` before initiating any analysis to prevent processing duplicates.

---

## 3. Self-Evolution Protocol
The Scaler is a self-improving system. Any discoveries or ideas for enhancing the Scaler's own logic, speed, or accuracy must be converted into proposals and routed strictly to:
- **`INTERNAL/solutions/pipeline_scaler/`** (Self-Refactoring path, as the scaler itself falls under the `pipeline_scaler` aspect).

---

## 4. Conflict Resolution
In cases of mismatch between a discovery and the current architecture:
1. **Pillar Dominance**: The Core Pillar (`.core/`) rules always take precedence. you can adopt the discovery to become compatible with the current architecture.
2. **Deterministic Precedence**: The Master Index (`meta.router.yaml`) is the final authority. If a proposal contradicts the Index without a plan for a safe migration, it must be rejected. we need an adopting plan for a safe migration.

---

## 5. Architectural Portability Laws
When adapting external capabilities (especially Python tools, libraries, or SDKs) into the Agentic OS, you MUST force the adaptation into the **True Portability** framework:
- **Centralized Engine:** Never create isolated `.venv` folders for new capabilities. All dependencies must route to the master `open-workspace/.venv`.
- **Relative Execution:** Eradicate all instances of `Activate.ps1` or global commands (like `notebooklm login`). Rewrite all instructions and commands to use absolute relative paths (e.g., `.\.venv\Scripts\python.exe -m module_name`) so the OS remains clone-and-play across machines.
- **Manifest Tracking:** Before adopting a new pip package, check the root `requirements.txt`. If adding a new dependency, the proposal MUST include the command to freeze it: `.\.venv\Scripts\python.exe -m pip freeze > requirements.txt`.
- **Git State:** Acknowledge that the repo is private and fully portable. Do not strip `.env` secrets or active caches (like `.notebooklm/`) in your architecture proposals, as they are intentionally pushed to Git.
