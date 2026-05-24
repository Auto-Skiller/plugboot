# 🚦 Scaler Gateway — Proposal & Solution Card Lifecycle

## Objective
Single authoritative reference for the complete lifecycle of a Proposal Card (EXTERNAL) or Solution Card (INTERNAL) — from creation through integration and post-integration sync. All Scaler outputs MUST pass through this gateway. No direct path from analysis to integration exists.

> **PREVENTION RULE**: Before creating any card, check `.meta_os/meta_db/pipeline_scaler_os.yaml → gateway_metrics.pending_approvals_count`. If > 0, address or acknowledge pending cards first before creating new ones (unless unrelated scope).

---

## 1. Card Types & Where They Live

| Type | When to Create | Gateway Folder |
|------|---------------|----------------|
| **Proposal Card** | Any EXTERNAL output (direct moves, adaptations, partial extracts, architecture audits) | `[Pillar]_external_proposals/PROP-EXT-[ID].yaml` (flat at pipeline root) |
| **Internal Action Card (Mega-YAML)** | Any INTERNAL gap and solution combined | `[Pillar]_internal_proposals/MEGA-INT-[ID].yaml` (flat at pipeline root) |

**ID Naming Convention:**
- Proposal Cards: `PROP-EXT-[DESCRIPTIVE-NAME]` (e.g., `PROP-EXT-KARPATHY-GUIDELINES`)
- Internal Action Cards: `MEGA-INT-[DESCRIPTIVE-NAME]` (e.g., `MEGA-INT-UPDATE-SYNC-ENGINE`)

**PREVENTION**: Always use descriptive names that reflect the intent of the proposal/gap/solution. NEVER use numeric sequences (e.g., `-001`, `-002`) to ensure that users can understand the context of the card just by its ID.

---

## 2. Full Lifecycle — Step by Step

### Step 1: Pre-Card Checks (MANDATORY)
Before creating any card:
1. Read `.meta_os/meta_db/pipeline_scaler_os.yaml` → confirm current phase and gateway metrics.
2. Read the relevant `[Pillar].sources_ledger.yaml` (anti-duplication via content hash, tracked_discoveries) and `[Pillar].proposals_ledger.yaml` (existing gateway cards) inside `scaler_ledgers/` → confirm no duplicate processing (check `processed_matrix` or logged discoveries/gaps). For items in `.scaler_mixed_inbox/`, also consult `.scaler_mixed_inbox.ledger.yaml`.
3. For EXTERNAL: check all pending proposals for a `MERGE_WITH_PENDING` match.
4. Update `.meta_os/meta_db/pipeline_scaler_os.yaml → state.current_phase` to the appropriate phase.

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
- `toolbox_target` **(REQUIRED for `Operational_Muscles` proposals with INJECT type)** — see §5 below.

**PREVENTION**: Never use Markdown format for cards. All cards MUST be `.yaml` files. Markdown cards are a protocol violation.

### Step 3: Update the Ledger (ATOMIC — same moment as card creation)
Immediately after drafting the card:
- **EXTERNAL**: Update the EXISTING entry in `[Pillar].sources_ledger.yaml.state.tracked_discoveries[]` (using its content hash). Append the new card's ID to `proposal_ids[]` and set `integration_status: PENDING`. The auto-sync rolls this into the central `.db/` rollups.
- **INTERNAL (gap)**: Update the EXISTING gap entry in `[Pillar].proposals_ledger.yaml` under `state.tracked_gaps[]` (using its `gap_id`). Link the new `action_id` and set `integration_status: PENDING`.
- Update `.meta_os/meta_db/pipeline_scaler_os.yaml → gateway_metrics.pending_approvals_count` (increment by 1 if PLANNING mode).
- Update `.meta_os/meta_db/pipeline_scaler_os.yaml → gateway_metrics.last_gateway_action`.

**PREVENTION**: Ledger update is ATOMIC with card creation. Never create a card without immediately updating the ledger in the same operation. This is what prevents anti-duplication failures.

### Step 4: Granular Mode-Aware Gate
After card + ledger are both written, the Scaler checks the `action_gate` map in `CONTROLER.yaml` for the card's `integration_type`:

#### If Type is `EXECUTION`
- Perform self-review of the card.
- Set `user_decision: APPROVED` in the card file.
- Set `integration_status: PENDING_INTEGRATION` in the ledger.
- **Note**: `RESTRUCTURE_ARCHITECTURE` and new scope suggestions now follow the `action_gate` map like all other types.
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
- Update `.meta_os/meta_db/pipeline_scaler_os.yaml → active_triage[]` with the card.
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
3. **Sync Verification**: Run `meta_sync.py` to verify router paths.
4. **Failure Recovery**: If verification fails, auto-draft a **Remediation Action Card** in the pillar's `internal_proposals/` folder.
5. Update card `integration_status: INTEGRATED` and `integrated_at: [timestamp]`.
6. Update ledger entry `integration_status: INTEGRATED` and `integrated_at: [timestamp]`.

### Step 6: Post-Integration Sync (MANDATORY)
After every successful integration:
1. Update `.meta_os/meta_db/pipeline_scaler_os.yaml`:
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
4. Trigger `meta_sync.py` to re-assemble all routers and identity metadata.
5. Update `.milestones/` goal `artifacts[]` with the integrated file paths.
### Step 7: Archiving (Fresh Start Law)
To maintain a clean and actionable gateway, ALL cards and their source materials must be moved to the archive once fully integrated. The archive is **date-bucketed by quarter** for chronological scan; pillar + type are encoded in the filename, not the path:
- **Path**: `.scaler_runtime/.scaler_archive/YYYY-QQ/`
- **Filename**: `[TYPE]-[Pillar]-[CardID].yaml`
  - `[TYPE]`: `EXTERNAL` (proposal cards) or `INTERNAL` (mega-yaml action cards)
  - `[Pillar]`: `Foundational_Integrity` | `Operational_Muscles` | `Value_Generation`
  - `[CardID]`: the card's `proposal_id` or `action_id`
- **Examples**:
  - `.scaler_archive/2026-Q2/EXTERNAL-Operational_Muscles-PROPOSAL-EXT-KARPATHY-GUIDELINES.yaml`
  - `.scaler_archive/2026-Q2/INTERNAL-Foundational_Integrity-MEGA-INT-LEDGERS.yaml`
- **EXTERNAL Source Archiving & Ledger Update**: When ALL cards associated with an external discovery are `INTEGRATED` (fully assimilated), the functional group folder MUST also be moved to `.scaler_archive/YYYY-QQ/EXTERNAL-discoveries-<pillar>-<group>.yaml`. At this exact moment, move the corresponding `sources_ledger` entry from `tracked_discoveries[]` to `history[]` with `discovery_status: ARCHIVED`.
- **Goal**: Active gateway folders (`[Pillar]_external_proposals/`, `[Pillar]_internal_proposals/`) MUST only contain pending work.

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
- [ ] `.meta_os/meta_db/pipeline_scaler_os.yaml` updated (phase, metrics, gateway_metrics)

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

---

## 5. Toolbox Delivery Protocol (Enhancement-4) — OPERATIONAL_MUSCLES Only

> This protocol closes the loop between Scaler discovery and `.toolboxes/` population.
> Applies exclusively to `Operational_Muscles` proposals with integration types `INJECT_INTO_EXISTING`, `BUILD_NEW_COMPONENT`, or `EXTEND_EXISTING_SYSTEM`.

### 5.1 The `toolbox_target` Field

All `Operational_Muscles` INJECT/BUILD/EXTEND proposals MUST include a `toolbox_target` block inside `integration_strategy`:

```yaml
integration_strategy:
  type: INJECT_INTO_EXISTING      # or BUILD_NEW_COMPONENT / EXTEND_EXISTING_SYSTEM
  toolbox_target:
    toolbox_path: ".toolboxes/engineering/coding"
    toolbox_yaml: ".toolboxes/engineering/coding/coding.yaml"
    skill_name: "write-clean-code"   # The skill folder name to create
    agent_name: null                 # Set if proposal creates an agent, else null
    target_maturity: "functional"    # Expected maturity after integration
  target_scan_results:
    existing_skills: []              # Skills already in the target toolbox (read live before drafting)
    existing_agents: []              # Agents already in the target toolbox
    current_health_status: "empty"   # Read from toolbox router before writing
  execution_plan:
    - step: 1
      action: "CREATE skill directory at toolbox_path/skills/[skill_name]/"
    - step: 2
      action: "WRITE SKILL.md with frontmatter (name, maturity, triggers, inputs, outputs, cataloger_lock)"
    - step: 3
      action: "UPDATE toolbox .yaml file — increment skill_count, add to skill_names[]"
    - step: 4
      action: "RUN meta_sync.py → toolboxes_router.yaml health block auto-updates"
    - step: 5
      action: "VERIFY health.status changed from 'empty' to 'partial' or 'functional'"
```

### 5.2 Post-Integration Health Update

After Gateway Step 5 (Integration & Verification) for `Operational_Muscles` proposals:
1. Run `meta_sync.py` to remap `toolboxes.yaml`.
2. Verify `health.status` block updated (empty → partial → functional).
3. If the toolbox has a `CHANGELOG.md` next to its manifest, append the
   integration entry there. The engine auto-resolves the `changelog:`
   field from disk on every sync — never hand-edit the router's value.
4. New cross-toolbox edges are added via UPGRADE cards under the
   `dependency_graph.edges` block of `.meta_os/meta_db/.toolboxes.yaml`.
   Edges are validated against the live toolbox set; broken refs surface in
   `dependency_graph.metadata.broken_references`.

### 5.3 Health Status Thresholds

| Health Status | Condition |
|---|---|
| `empty` | skill_count = 0 |
| `partial` | skill_count ≥ 1 but all skills are `stub` maturity |
| `functional` | skill_count ≥ 1, at least one skill is `functional`+ maturity |
| `complete` | skill_count ≥ 3, has agent(s), has execution/ surfaces, all skills ≥ functional |

> **PREVENTION**: Never mark a toolbox `complete` without verified `execution/` directories and at least one registered agent.

---

## 6. Atomic Update Cross-Reference

This section is the single source-of-truth grid for the atomic-write contract. Per **P-LAW-001** (Atomic Ledger Update) and **P-LAW-019** (Atomic Trio Recovery), every gateway operation writes to a fixed set of stores within one transaction. Any write failure aborts the transaction and triggers the P-LAW-019 rollback procedure.

> **How to read this table**: each row is one Scaler operation. The columns list every store touched in the same transaction. ✅ = MUST be written. ➕ = written conditionally (footnote). — = not touched. The "Recovery" column points to the rollback path defined in P-LAW-019.

### 6.1 EXTERNAL — Discovery & Proposal Operations

| Operation | Card file | `[Pillar].sources_ledger.yaml` | `[Pillar].proposals_ledger.yaml` | `.scaler_mixed_inbox.ledger.yaml` | `.meta_os/meta_db/pipeline_scaler_os.yaml` | `CONTROLER.yaml` | `meta_os.yaml` (via sync) | Recovery |
|---|---|---|---|---|---|---|---|---|
| Route item from `.scaler_mixed_inbox/` to a typed discovery hub | — | — | — | ✅ append hash + routed_to | ✅ `state.current_phase` | — | — | rollback move; clear `.scaler_mixed_inbox.ledger` entry |
| Log new EXTERNAL discovery (functional group root) | — | ✅ append `tracked_discoveries[]` (hash + `group_path`) | — | ➕¹ | ✅ `state.current_phase` + `metrics` | — | — | revert ledger append; revert state |
| Log additional item under existing functional group | — | ✅ append `tracked_discoveries[]` with same `group_path` (sub-grouped path if applicable) | — | — | ✅ `metrics.group_items_logged` | — | — | revert ledger append |
| Draft Proposal Card (Step 2 + 3) | ✅ CREATE `[Pillar]_external_proposals/PROP-EXT-*.yaml` | ✅ append card ID to `proposal_ids[]`, set `integration_status: PENDING` | — | — | ✅ `gateway_metrics.pending_approvals_count` ++ if PLANNING; `gateway_metrics.last_gateway_action` | ➕² scaler_review_queue if PLANNING | — | DELETE card; revert ledger; revert state metrics; remove review-queue entry |
| Apply user `NOTES` and re-submit | ✅ EDIT card | — | — | — | ✅ `gateway_metrics.last_gateway_action` | ✅ scaler_review_queue entry refreshed | — | revert card edit; restore prior review-queue entry |
| Mark card `REJECTED` | ✅ EDIT `user_decision` + `integration_status` | ✅ entry `integration_status: REJECTED` | — | — | ✅ `gateway_metrics.pending_approvals_count` --; remove from `active_triage[]` | ✅ scaler_review_queue → `REJECTED` | — | revert all three; restore card to PENDING |
| Integrate Proposal Card (Step 5) | ✅ EDIT `integration_status: INTEGRATED` + `integrated_at` | ✅ entry `integration_status: INTEGRATED` | — | — | ✅ `metrics.proposals_generated`++; `gateway_metrics.integration_queue_count`-- | ✅ `recent_events`, `last_sync`, goal `tracking` | ✅ triggered after | per-action reverse of `files_involved` (see P-LAW-019 step 3) |
| Archive integrated card (Step 7) | ✅ MOVE card → `.scaler_archive/YYYY-QQ/EXTERNAL-[Pillar]-[CardID].yaml` | ✅ IF fully assimilated: MOVE entry from `tracked_discoveries[]` → `history[]` with `discovery_status: ARCHIVED` | — | — | ✅ `gateway_metrics.last_gateway_action` | — | — | move card back to gateway folder; move entry back |

¹ Only when the discovery originated from `.scaler_mixed_inbox/` — the `.scaler_mixed_inbox.ledger` entry is updated in the same transaction with `routed_to: [Pillar]` to close the cascade-in record.
² Required only when `action_gate_at_creation: PLANNING`.

### 6.2 INTERNAL — Gap & Solution Operations

| Operation | Card file | `[Pillar].proposals_ledger.yaml` | `[Pillar].sources_ledger.yaml` | `.meta_os/meta_db/pipeline_scaler_os.yaml` | `CONTROLER.yaml` | `meta_os.yaml` (via sync) | Recovery |
|---|---|---|---|---|---|---|---|
| Identify internal gap (Step 1) | — | ✅ append `state.tracked_gaps[]` (gap entry) | — | ✅ `state.current_phase` | — | — | revert ledger append |
| Draft Internal Action Card (Step 2 + 3) | ✅ CREATE `[Pillar]_internal_proposals/MEGA-INT-*.yaml` | ✅ link `gap_id` → `action_id` in same `tracked_gaps[]` row | — | ✅ `gateway_metrics.pending_approvals_count` ++ if PLANNING; `gateway_metrics.last_gateway_action` | ➕² scaler_review_queue if PLANNING | — | DELETE card; revert ledger linkage; revert state; remove review-queue entry |
| Apply user `NOTES` and re-submit | ✅ EDIT card | — | — | ✅ `gateway_metrics.last_gateway_action` | ✅ scaler_review_queue entry refreshed | — | revert card edit; restore prior review-queue entry |
| Mark card `REJECTED` | ✅ EDIT `user_decision` + `integration_status` | ✅ MOVE entry from `tracked_gaps[]` → `history[]` with `integration_status: REJECTED` | — | ✅ `gateway_metrics.pending_approvals_count` --; remove from `active_triage[]` | ✅ scaler_review_queue → `REJECTED` | — | move entry back to `tracked_gaps[]`; revert state; restore card |
| Integrate Internal Action Card (Step 5) | ✅ EDIT `integration_status: INTEGRATED` + `integrated_at` | ✅ MOVE entry from `tracked_gaps[]` → `history[]` with `integration_status: INTEGRATED` | ➕³ if solution touched files referenced by an EXTERNAL discovery | ✅ `metrics.solutions_generated`++; `gateway_metrics.integration_queue_count`-- | ✅ `recent_events`, `last_sync`, goal `tracking` | ✅ triggered after | per-action reverse of `files_involved` (P-LAW-019 step 3) |
| Archive integrated card (Step 7) | ✅ MOVE card → `.scaler_archive/YYYY-QQ/INTERNAL-[Pillar]-[CardID].yaml` | — (entry already in `history[]`) | — | ✅ `gateway_metrics.last_gateway_action` | — | — | move card back to gateway folder |

³ Only when the integrated solution modifies a file that is referenced as a `target_files` entry in any EXTERNAL Proposal Card; the corresponding `[Pillar].sources_ledger` entry's `processed_matrix` gets a co-touch flag for audit trail.

### 6.3 Sync & Maintenance Operations

| Operation | `.meta_os/meta_db/pipeline_scaler_os.yaml` | `CONTROLER.yaml` | `meta_os.yaml` (via `.meta/engine/meta_sync.py`) | `.meta_os/meta_db/.toolboxes.yaml` (auto) | `.meta_os/meta_db/.core.yaml` (auto) | Recovery |
|---|---|---|---|---|---|---|
| Pre-cycle state sync (P-LAW-007) | ✅ `state.active_mode` mirrors CONTROLER | ✅ read-only | — | — | — | abort cycle; force re-read |
| Post-integration sync (Step 6) | ✅ all `metrics` + `gateway_metrics` recomputed | ✅ `last_sync`, `recent_events`, goal artifacts | ✅ re-assembled | ✅ rolled up from per-pillar splits | ✅ rolled up from disk | log to scaler_hub.messages; do not partially commit any of the three rollups |
| Audit Pass (`Scaler-Workflows.md §6`) | ✅ `state.last_audit` + drift counters | ➕ Remediation Action Card if drift detected | ✅ verify post-audit | ✅ verify post-audit | ✅ verify post-audit | abort audit; surface findings without writing remediation card |
| Quarter-end archive rotation | ✅ `gateway_metrics.last_archive_rotation` | ✅ `recent_events` | — | — | — | restore cards from new quarter bucket back to gateway folders |

### 6.4 Mandatory Cross-Reference Rule

Any new gateway operation introduced via INTERNAL Mega-YAML MUST include an explicit row in §6.1, §6.2, or §6.3 of this table as part of its `solution.execution_plan.steps`. A solution that touches multiple stores without updating this grid is rejected by self-review per P-LAW-001 + P-LAW-019.

> **Verification at Step 4 (Gate)**: Before proceeding past the gate in any mode, the Scaler MUST confirm the operation it is about to execute has a corresponding row in this grid. Operations without a documented atomic contract are blocked.
