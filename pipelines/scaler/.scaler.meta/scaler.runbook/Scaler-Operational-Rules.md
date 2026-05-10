# 📜 Scaler Operational Rules

## Objective
Define the operational rules and constraints for the Scaler pipeline.

## Steps

## 1. Core Principles

### Strict Adoption & Translation
When integrating new external capabilities, prioritize **copying** the deterministic logic, but you MUST strictly adopt it to match the current Agentic OS architecture.
- Replace all external terms, plugin names, and repository references with native equivalents that fit our OS map.
- Remove outdated plugin/repo references once they are translated into our native logic.

### Architecture Enhancement
When integrating new tools, agents, or systems, dynamically **enhance** our current architectures to accommodate them seamlessly. For example, if adding new planning capabilities, expand our existing goal YAMLs or optional artifact tracking structures to inherently support those new capabilities rather than building redundant, disconnected systems.

---

## 2. Constraints & Prohibitions

- **No Product Builds**: The Scaler pipeline is strictly for **System-Level** evolution. Do not build individual products or projects here; those belong in `projects/` or `pipelines/hustler/`.
- **Zero-Drift Sync**: Never manually update the global `.router.yaml` from within the Scaler workspace. All changes must be routed through `_proposals/` and synced via the Root OS protocols.
- **Atomic State**: Every operation must be preceded by a state update in `SCALER-STATE.yaml`.
- **Anti-Duplication**: Consult the **Status Ledger** and `TRIAGE-LEDGER.yaml` before initiating any analysis.

---

## 3. Self-Evolution Protocol
The Scaler is a self-improving system. Any discoveries or ideas for enhancing the Scaler's own logic, speed, or accuracy must be converted into proposals and routed strictly to:
- **`_proposals/AUTO_SKILLER-proposals/`** (Self-Refactoring path).

---

## 4. Conflict Resolution
In cases of mismatch between a discovery and the current architecture:
1. **Pillar Dominance**: The Core Pillar (`.core/`) rules always take precedence.
2. **Deterministic Precedence**: The Master Index (`meta.router.yaml`) is the final authority. If a proposal contradicts the Index without a plan for a safe migration, it must be rejected.
