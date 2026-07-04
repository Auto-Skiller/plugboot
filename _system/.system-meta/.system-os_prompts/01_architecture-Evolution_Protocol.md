---
metadata:
  name: evolution-protocol
  class: system
  type: os_prompt
  version: "2.0"
  description: System-owned constitutional amendment process — evolution proposals via board control plane
  when_to_use: Read when board evolution is enabled; defines proposal lifecycle for system-level changes
  contains: evolution_trigger, proposal_structure, lifecycle, anti_recurrence, documentation
---

# 🧬 Evolution Protocol v2.0

## 1. Overview
This protocol governs **system-level constitutional amendments** — changes to OS prompts, schemas, board structure, pipeline runbooks, and fundamental rules. It is **system-owned** and **completely separate from Scaler pipeline**.

> **Board Control:** `control.evolution.status: on|off` (class:system only) enables/disables the evolution engine.

---

## 2. The Evolution Trigger (Proactivity Law)
When `control.evolution.status: on`, the agent is **PROHIBITED** from waiting for a user prompt to initiate an evolution. If a task results in:
- A new structural pattern
- A new logic preference
- A systemic refinement
- A detected gap or drift

...the agent **MUST** proactively draft an evolution proposal.

---

## 3. Proposal Location: Top-Level Board Section
Proposals go into the **entity's board file** (e.g., `_system/system-board.yaml`) under the new top-level `evolution:` section:

```yaml
evolution:
  "proposal_name":
    proposal_id: string
    target_file: string
    rationale: string
    status: pending | accepted | rejected
    created_at: timestamp
    resolved_at: timestamp
```

**NOT** in pipeline profile ledgers. The board's `evolution:` section is the single control plane for all evolution proposals.

---

## 4. Proposal Structure
Every proposal in `evolution:` MUST contain:

| Field | Description |
|-------|-------------|
| `proposal_id` | Unique identifier (e.g., `EVOL-2026-001`) |
| `target_file` | Workspace-relative path to file being changed |
| `rationale` | Why this change; what problem it solves |
| `status` | `pending` | `accepted` | `rejected` |
| `created_at` | ISO timestamp when drafted |
| `resolved_at` | ISO timestamp when accepted/rejected |

---

## 5. Proposal Lifecycle
```
pending → accepted  → apply change to target_file, update status to accepted, resolved_at = now
      → rejected  → annotate with rejection reason, update status to rejected, resolved_at = now
```

1. **Agent drafts** proposal in `evolution:` with `status: pending`.
2. **Reviewer** (user or Orchestrator Daemon in AUTO mode) reads pending entries.
3. **If accepted:** apply the change to `target_file`, update proposal `status: accepted`, `resolved_at`.
4. **If rejected:** annotate with rejection reason, update `status: rejected`, `resolved_at`.

> **COLLAB mode:** User reviews/refines/approves each pending proposal.
> **AUTO mode:** Orchestrator Daemon auto-approves pending proposals after self-review.

---

## 6. Artifact Drafting
When a proposal is drafted (`status: pending`), the agent **MUST** also draft the artifact file in `_system/evolution/`:

```
_system/evolution/
├── pending/
│   ├── EVOL-2026-001.yaml          # Proposal metadata
│   └── EVOL-2026-001.draft.md      # Draft of target_file changes
├── accepted/
│   └── EVOL-2026-001.yaml          # Archived accepted proposal
└── rejected/
    └── EVOL-2026-001.yaml          # Archived rejected proposal
```

> **No paths in board:** The `evolution:` section references artifacts by name only. Paths live in index.

---

## 7. The Evolution Loop (Executing Accepted Proposals)
When a proposal is `accepted`:

1. **Detect Logic Shifts:** Confirm the accepted proposal's rationale still holds.
2. **Target Selection:** Identify which OS prompt files, runbooks, schemas, or board structure need updating.
3. **Apply Logic Preservation:** Merge new logic carefully. Do NOT destructively overwrite old logic unless directly contradicted.
4. **Anti-Recurrence Law:** Whenever fixing a bug or logical gap, ask *"How do I ensure this NEVER happens again?"* and immediately codify the preventive logic into the relevant OS prompt file or runbook. A fix is not complete until the system's DNA has been hardened against recurrence.

---

## 8. Documentation Requirements
Every applied evolution **MUST** be logged in the entity's board file (`system-board.yaml` or `<project>-board.yaml`) under `state.recent_events`.

The format MUST strictly follow the standardized event convention:
`[DATE] EVENT_TYPE: Description — Details`

For evolution events, this will look like:
`[DATE] EVOLUTION: Updated [File Path] with new logic — [Brief Description]`

---

## 9. Separation from Scaler
This protocol is **completely independent** of the Scaler pipeline:
- Scaler evolves **its own runbooks** via `Foundational_Integrity_internal_proposals/`
- Evolution Protocol evolves **OS prompts, schemas, board structure, all pipeline runbooks**
- Scaler may **propose** changes via Evolution Protocol, but does not control it

---

## 10. Hard Rules
1. **No direct edits** to OS prompts/schemas/runbooks without a proposal in `evolution:`
2. **Board is the only path** — pipeline ledgers are not used for evolution
3. **Artifacts in `_system/evolution/`** — never in pipeline runtime
4. **`control.evolution.status: off`** = evolution engine disabled entirely
5. **Projects do not use this** — class:system only (projects evolve via Scaler)

---

> **Remember:** The evolution protocol is the system's constitutional amendment process. It exists to ensure every structural change is deliberate, auditable, and preserves the system's DNA.