# 🚦 Scaler Gateway — Proposal & Solution Card Lifecycle

## Objective
Single authoritative reference for the complete lifecycle of a Proposal Card (EXTERNAL) or Solution Card (INTERNAL) — from creation through integration and post-integration sync. All Scaler outputs MUST pass through this gateway. No direct path from analysis to integration exists.

> **PREVENTION RULE**: Before creating any card, check `SCALER-STATE.yaml → gateway_metrics.pending_approvals_count`. If > 0, address or acknowledge pending cards first before creating new ones (unless unrelated scope).

---

## 1. Card Types & Where They Live

| Type | When to Create | Gateway Folder |
|------|---------------|----------------|
| **Proposal Card** | Any EXTERNAL output (direct moves, adaptations, partial extracts, architecture audits) | `. [Pillar]_proposals/PROPOSAL-[ID].yaml` |
| **Internal Action Card (Mega-YAML)** | Any INTERNAL gap and solution combined | `INTERNAL/[target_pillar]/MEGA-INT-[ID].yaml` |

**ID Naming Convention:**
- Proposal Cards: `PROP-EXT-[DESCRIPTIVE-NAME]` (e.g., `PROP-EXT-KARPATHY-GUIDELINES`)
- Internal Action Cards: `MEGA-INT-[DESCRIPTIVE-NAME]` (e.g., `MEGA-INT-UPDATE-SYNC-ENGINE`)

**PREVENTION**: Always use descriptive names that reflect the intent of the proposal/gap/solution. NEVER use numeric sequences (e.g., `-001`, `-002`) to ensure that users can understand the context of the card just by its ID.

---

## 2. Full Lifecycle — Step by Step

### Step 1: Pre-Card Checks (MANDATORY)
Before creating any card:
1. Read `SCALER-STATE.yaml` → confirm current phase and gateway metrics.
2. Read the relevant ledger (`EXTERNAL-LEDGER.yaml` or `INTERNAL-LEDGER.yaml`) → confirm no duplicate processing (check `processed_matrix`).
3. For EXTERNAL: check all pending proposals for a `MERGE_WITH_PENDING` match.
4. Update `SCALER-STATE.yaml → state.current_phase` to the appropriate phase.

### Step 2: Draft the Card
Create the card file using the schemas from `Scaler-Operational-Rules.md §7`.

**Required fields — never omit:**
- `proposal_id` / `action_id`
- `schema_version` (`"3.1"` for proposals, `"4.0"` for internal action cards)
- `target_pillar` (for Proposals)
- `integrations` (list for Proposals)
- `integration_strategy` (including `target_scan_results` and `execution_plan`)
- `user_decision`
- `action_gate_at_creation`

**PREVENTION**: Never use Markdown format for cards. All cards MUST be `.yaml` files. Markdown cards are a protocol violation.

### Step 3: Update the Ledger (ATOMIC — same moment as card creation)
Immediately after drafting the card:
- **EXTERNAL**: Add entry to the relevant pillar sub-ledger AND `EXTERNAL-LEDGER.yaml → tracked_discoveries[]`.
- **INTERNAL (gap)**: Add entry to `INTERNAL-LEDGER.yaml → state.tracked_gaps[]`.
- Set `integration_status: PENDING`.
- Update `SCALER-STATE.yaml → gateway_metrics.pending_approvals_count` (increment by 1 if PLANNING mode).
- Update `SCALER-STATE.yaml → gateway_metrics.last_gateway_action`.

**PREVENTION**: Ledger update is ATOMIC with card creation. Never create a card without immediately updating the ledger in the same operation. This is what prevents anti-duplication failures.

### Step 4: Granular Mode-Aware Gate
After card + ledger are both written, the Scaler checks the `action_gate` map in `CONTROLER.yaml` for the card's `integration_type`:

#### If Type is `EXECUTION`
- Perform self-review of the card.
- Set `user_decision: APPROVED` in the card file.
- Set `integration_status: PENDING_INTEGRATION` in the ledger.
- **Exception — `ARCHITECTURE_AUDIT` or new scope suggestion**: STOP. Post in `CONTROLER.yaml → communication.scaler_review_queue` and halt integration. Set `user_decision: PENDING`. Await user approval.
- Proceed directly to Step 5.

#### If Type is `PLANNING` (or missing from map)
- Leave `user_decision: PENDING` in the card.
- Post a review request in `CONTROLER.yaml → communication.scaler_review_queue`:
  ```yaml
  - id: [card_id]
    type: PROPOSAL | SOLUTION
    path: [card_path]
    summary: [one-line description]
    status: PENDING
  ```
- Update `SCALER-STATE.yaml → active_triage[]` with the card.
- **DO NOT proceed to Step 5.** Pivot to other unblocked work (per AUTO + PLANNING rule in `Modes.md`).
- Resume at Step 4b when user approves.

#### Step 4b: Handling User Response (PLANNING mode)
- **`APPROVED`**: Set `user_decision: APPROVED` in the card. Update review queue entry `status: APPROVED`. Proceed to Step 5.
- **`REJECTED`**: Set `user_decision: REJECTED` in the card. Update ledger `integration_status: REJECTED`. Update review queue `status: REJECTED`. Remove from `active_triage`. No further action.
- **`NOTES: [text]`**: Apply the user's notes to the card. Update the card. Re-post the updated card in `scaler_review_queue` with `status: PENDING`. Do NOT proceed to Step 5 until re-approved.

### Step 5: Integration & Verification
Only execute if `user_decision: APPROVED`:
1. **Integration**: Execute all `files_involved` actions (`MOVE`, `COPY`, `EDIT`, `CREATE`, `DELETE`, `RESTRUCTURE`, `ADAPT`). Apply Strict System Assimilation rules.
2. **Verification Scan**: Re-read target files to confirm integration matches the `execution_plan`.
3. **Sync Verification**: Run `.sync_engine` to verify router paths.
4. **Failure Recovery**: If verification fails, auto-draft a **Remediation Solution Card** in `INTERNAL/solutions/`.
5. Update card `integration_status: INTEGRATED` and `integrated_at: [timestamp]`.
6. Update ledger entry `integration_status: INTEGRATED` and `integrated_at: [timestamp]`.

### Step 6: Post-Integration Sync (MANDATORY)
After every successful integration:
1. Update `SCALER-STATE.yaml`:
   - `metrics.systems_scaled` += 1 (if applicable)
   - `metrics.proposals_generated` or `solutions_generated` += 1
   - `gateway_metrics.pending_approvals_count` -= 1 (if was PLANNING)
   - `gateway_metrics.integration_queue_count` -= 1 (if was in queue)
   - `gateway_metrics.last_gateway_action` → update to this card
   - Remove from `active_triage[]`
2. Update the Ledger:
   - Move the entry from `tracked_gaps` to `history` if it's an internal gap/solution.
   - For external proposals, update `integration_status` in the ledger.
3. Update `CONTROLER.yaml`:
   - Add to `recent_events`.
   - Update current goal's `tracking` field.
   - Update `system_status.last_sync` to current timestamp.
   - If PLANNING mode: update `scaler_review_queue` entry `status: INTEGRATED`.
4. Trigger `.brain/.sync_engine/` protocols if meta.router.yaml was modified.
5. Update `.runtime/.mission_board/` goal `artifacts[]` with the integrated file paths.

### Step 7: Archiving (Fresh Start Law)
To maintain a clean and actionable gateway, ALL cards and their source materials must be moved to the archive once fully integrated:
- **PROPOSALS**: Move to `pipelines/scaler/EXTERNAL/_archive/[Pillar]/proposals/`
- **INTERNAL**: Move to `pipelines/scaler/INTERNAL/.archive/[target_pillar]/`
- **Goal**: Active folders MUST only contain pending work.

**PREVENTION**: Steps 5 and 6 must never be separated. A card marked `INTEGRATED` without a `last_sync` update is a sync violation.

---

## 3. Card Validation Checklist
Before finalizing any card, verify:
- [ ] Schema version is `"3.1"`
- [ ] Card is a `.yaml` file (not Markdown)
- [ ] All required fields present (especially `integrations` and `integration_strategy`)
- [ ] `files_involved` lists every file that will change
- [ ] `action_gate_at_creation` mirrors current CONTROLER value
- [ ] Ledger entry created in same operation
- [ ] `SCALER-STATE.yaml` updated (phase, metrics, gateway_metrics)

---

## 4. Aspect & Level Folder Reference
Valid combinations for card file paths:

**Primary Aspect (determines classification — 14 valid values):**
`routing_and_syncing` | `identity_rules` | `identity_architecture` | `identity_capabilities` | `identity_operational` | `core_toolbox` | `extended_toolbox_business` | `extended_toolbox_engineering` | `extended_toolbox_life` | `extended_toolbox_studio` | `mission_board` | `controller` | `pipeline_scaler` | `pipeline_hustler`

**`aspects` list (all applicable aspects — always a list, always includes primary_aspect):**
Any combination of the 14 valid aspect IDs above.

**Levels:** `Foundational_Integrity` | `Operational_Muscles` | `Value_Generation`

**Integration Types (EXTERNAL):** `INJECT_INTO_EXISTING` | `REPLACE_OR_UPGRADE` | `BUILD_NEW_COMPONENT` | `EXTEND_EXISTING_SYSTEM` | `RESTRUCTURE_ARCHITECTURE` | `MIGRATE_AND_REPOSITION` | `MERGE_WITH_PENDING`

**Change Types (INTERNAL):** `PATCH_FILE` | `ENRICH_FILE` | `REPLACE_SCHEMA` | `RESTRUCTURE_SYSTEM` | `CREATE_MISSING_COMPONENT` | `AUDIT_AND_REMEDIATE`

> **PREVENTION — New Aspect Rule**: If analysis reveals a need for a new aspect/scope, NEVER create it directly. Post in `CONTROLER.yaml → system_status.scope_suggestions[]` and halt. Await explicit user approval before creating any folder structure for a new aspect. This applies in ALL modes (PLANNING and EXECUTION).

> **PREVENTION — New Level Rule**: If a new output level is needed (beyond the 3 defined), treat same as a new scope — requires user approval.

> **PREVENTION — Pillar Completeness**: INTERNAL outputs map to `Foundational_Integrity/`, `Operational_Muscles/`, or `Value_Generation/`.

> **PREVENTION — Multi-Aspect Required**: Every card MUST have both `primary_aspect` (single string) and `aspects` (list). A card with only one aspect in the list is acceptable only when the discovery genuinely affects one aspect. Never leave `aspects` empty or omit it.

