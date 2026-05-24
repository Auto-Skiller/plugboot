# 📜 Hustler Operational Rules

## Objective
**Purpose:** Define the operational rules and constraints for the Hustler pipeline. This document codifies all 15 H-LAWs governing the pipeline's behavior. The original H-LAW-001 / H-LAW-002 / H-LAW-003 are preserved verbatim from v1.0 (Logic Preservation Law). H-LAW-004 through H-LAW-012 are additions inspired by Scaler P-LAWs and adapted to Hustler's product-discovery domain. H-LAW-013 through H-LAW-015 are added in v2.1 to close the action-gate granularity, re-scoping, and source-quality gaps identified in the cross-pollination audit (the Hustler keeps its own laws independently — there is no runtime coupling with the Scaler).

---

## 1. Core Principles

### Cascading Integrity
The Focus → Product → Feature hierarchy is a strict ordering. Sources cascade *down* through threshold checks, never sideways or up. A signal that doesn't pass a Focus threshold stays in the discovery holding folder until it does.

### Tag Lifecycle Preservation
Every file in a feature's `00-data/` carries a tag indicating its state. Every section in a feature's `[feature].yaml` carries a status tag. Tags are immutable except via the documented transitions in `Hustler-Tagging-System.md`.

---

## 2. Constraints & Prohibitions

- **No Premature Validation**: A new Focus, Product, or Feature MUST NOT be created without the cascading threshold being met. This prevents the directory tree from thrashing on every inbound signal.
- **Anti-Duplication via Ledger**: The same source file MUST NEVER be cascaded twice. Anti-duplication is enforced via `.hustler_mixed_inbox.ledger.yaml` content hashes for items in the mixed inbox, plus `[focus].sources_ledger.yaml` for items already cascaded into a focus.
- **Mandatory Tracker Updates**: Every cascade move MUST update the source ledger AND the target tracker AND the relevant focus ledger atomically.
- **No `.USER-SPACE` Touching**: Items inside `_HUSTLER-EXTERNAL_SOURCES/.hustler_USER-SPACE/` are user-managed staging — the Hustler MUST NOT scan, route, or process these files.
- **Mandatory Gateway**: Every cascade decision in `PLANNING` mode MUST be materialized as a review request in `CONTROLER.yaml.communication_hubs.hustler_hub.messages` before any move is committed.
- **Bundle Completeness**: When processing a folder source (e.g., a folder dropped into `.hustler_mixed_inbox/` containing multiple files), every file inside MUST be either read into the cascade analysis OR explicitly logged as deferred in the relevant `[focus].sources_ledger.yaml.unread_assets[]` with a reason (`unsupported_format`, `tool_missing`, `binary_blob`). Skipping a file purely because of its extension (`.json`, `.csv`, `.png`, `.svg`, etc.) is forbidden — many product signals live inside attached assets (screenshots, ad creative, analytics CSVs).

---

## 3. Governance: The 15 H-LAWs

### Original Foundation (preserved verbatim from v1.0)

#### H-LAW-001 — Hustle Naming Standard
All Hustle sessions must follow the pattern: `HUSTLE-[Market]-[ID]`.
**Enforced:** true.

#### H-LAW-002 — Value-First Protocol (ROI Verification)
No campaign execution can begin without a documented ROI projection in the session goal.
**Enforced:** true.

#### H-LAW-003 — Market Sanity Check
Every hustle must perform a market research step before building final assets.
**Enforced:** true.

---

### Integrity Invariants (added in v2.0 — codify behaviors the system already depends on)

#### H-LAW-004 — Cascading Threshold Integrity
A new Focus / Product / Feature MUST NEVER be created (Focus folder at pipeline root, or product/feature folders inside it) until the cascading threshold (defined per-level in `Hustler-Cascading-Logic.md`) has been met. Premature validation creates folder thrashing and fragments the audit trail.
**Enforced:** true.

#### H-LAW-005 — Tag Lifecycle Preservation
Every file inside a feature's `00-data/` MUST carry exactly one of `[new-data]`, `[processed-data]`, `[new-scraped]`. Every section in `[feature].yaml` MUST carry one of `[new-def]`, `[new-needs]`, or no tag (validated). Tag transitions follow the documented Step 2.1/2.2/2.3 sequence in `Hustler-Tagging-System.md` and may not skip steps.
**Enforced:** true.

#### H-LAW-006 — Atomic Tracker Update
A cascade or processing operation MUST NEVER be committed without simultaneous updates to the relevant ledger (sub-ledger first, then master), the target tracker, and the source's status. Card-and-ledger or move-and-tracker pairs are a single atomic operation. Failure = anti-duplication violation.
**Enforced:** true.

##### Recovery from Partial Failure (H7 closure)
If any write in the atomic trio fails (disk error, schema validation, race with another agent, etc.), the Hustler MUST:
1. **ABORT the entire operation immediately.** No partial state is committed.
2. **Leave the source file untouched in its origin folder** (e.g., `.hustler_mixed_inbox/` or upstream `_[focus]_inbox/`). The source ledger entry MUST NOT be written if the move did not complete.
3. **Roll back any successful writes from the same operation.** If `[feature].yaml` was updated but `[product]-FEATURES.yaml` failed, revert the `[feature].yaml` change to its pre-operation state. The atomic trio is all-or-nothing.
4. **Log the failure** to `CONTROLER.yaml.communication_hubs.hustler_hub.messages` with:
   - the operation type (cascade move | feature validation | tag transition)
   - which writes succeeded vs failed
   - the underlying error
   - the reverted target state
5. **Surface to the user** in `STRICT` or `COLLAB` work_mode. In `AUTO` mode, log and continue with the next item.
6. **Never re-attempt automatically.** A partial-failure operation is queued for human review unless the runbook explicitly authorizes retry (none currently do).

This rule prevents the failure mode where anti-duplication is broken by a half-cascaded source: the source file landed in the focus folder but the ledger never recorded the hash, so the next cascade pass would try to move it again.

#### H-LAW-007 — Anti-Duplication via Ledger
Before cascading any item out of `_HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/`, the Hustler MUST consult `.hustler_mixed_inbox.ledger.yaml.state.tracked_items` for a matching content hash. When cascading INTO a focus, the Hustler MUST also log the hash in the target focus's `[focus].sources_ledger.yaml`. The same source file MUST NEVER be cascaded twice.
**Enforced:** true.

#### H-LAW-008 — Logic Preservation
No existing operational logic in the Hustler runbooks may be deleted during evolution if it does not directly conflict with new logic. Foundational step-by-step instructions (e.g., the Phase 3 Step 2.1 / 2.2 / 2.3 processing playbook) MUST be modernized rather than replaced. The system's "DNA" remains intact across iterations. (Mirror of the workspace-level Evolution Protocol §1 Non-Loss Principle.)
**Enforced:** true.

#### H-LAW-009 — Cross-OS Launcher Execution
All Python tooling for the Hustler MUST be invoked via the workspace cross-OS launcher (`_os/venv/meta_run.{ps1,sh}`). Direct `.venv/Scripts/python.exe` calls are prohibited because they break cross-OS portability. (Mirror of Scaler-Operational-Rules §5.)
**Enforced:** true.

#### H-LAW-010 — Mandatory Runbook Immersion
Before ANY Hustler execution cycle or providing ANY simulation, the agent MUST confirm it has fresh context from all **five** runbook files in `hustler_runbooks/`: `Hustler-Architecture.md`, `Hustler-Workflows.md`, `Hustler-Operational-Rules.md`, `Hustler-Cascading-Logic.md`, `Hustler-Tagging-System.md`.

> **Known limitation (audit-acknowledged).** Like Scaler P-LAW-008, this rule is currently honor-system: no programmatic gate verifies the read. A future enhancement could store per-session runbook acknowledgements (timestamp + content-hash) in `.meta_os/meta_db/pipeline_hustler_os.yaml.runbook_readiness` and enforce pre-flight refusal on missing/stale acks. Until enforced, agents are bound by H-LAW-010 on trust.

**Enforced:** false (honor-system; see caveat).

#### H-LAW-011 — Mode-Aware Action Gate
The Hustler MUST consult `CONTROLER.yaml.modes.hustler.action_gate` before any cascade or processing action. If `action_gate: EXECUTION`, the Hustler proceeds autonomously. If `action_gate: PLANNING` (default), the Hustler MUST post the proposed action to `communication_hubs.hustler_hub.messages` and wait. (Mirror of Scaler P-LAW-018.)
**Enforced:** true.

#### H-LAW-012 — Mandatory Sync Engine v5 Execution
All agents MUST execute the master sync via the cross-OS launcher at the start and end of every session:
- Windows: `.\_os\venv\meta_run.ps1 _os\engine\meta_sync.py`
- Linux/macOS: `./_os/venv/meta_run.sh _os/engine/meta_sync.py`

This ensures that the global sync workers have updated their respective YAMLs and that `MASTER_INDEX.yaml` and `CONTROLER.yaml` reflect the absolute truth of the on-disk state. Direct interpreter invocation (`.venv\Scripts\python.exe`) is prohibited per the cross-OS portability law.

**Verification Protocols:**
- **Pre-Flight Check**: Verify `.meta_os/meta_db/pipeline_hustler_os.yaml` exists and has a valid current_phase before initiating sync.
- **Post-Flight Check**: Confirm `.meta_os/meta_db/meta_os.yaml` is dynamically re-assembled and verified by the master sync engine.
**Enforced:** true.

---

### Granularity & Re-Scoping Invariants (added in v2.1 — close action-gate, DNA-preservation, and source-quality gaps)

#### H-LAW-013 — Granular Action-Gate Profiles (per cascade transition type)
H-LAW-011 defines a binary EXECUTION / PLANNING gate for all cascade and processing actions. H-LAW-013 refines this into a **per-transition-type profile map** so the cost-of-being-wrong is tuned per operation. The Hustler MUST consult `CONTROLER.yaml.modes.hustler.profiles[<phase>].action_gate` matching the active phase before any cascade or processing action.

**Profile structure (CONTROLER.yaml block):**
```yaml
hustler:
  work_mode: STRICT 🟢 | COLLAB 🟡 | AUTO 🟢
  profiles:
    INGESTION:
      action_gate:
        EXECUTION:
          - cascade_into_existing_feature
          - cascade_into_existing_product
        PLANNING:
          - validate_new_feature
          - validate_new_product
          - validate_new_focus
          - cluster_first_audit
    PROCESSING:
      action_gate:
        EXECUTION:
          - definition_extraction              # Phase 3 Step 2.1
          - tag_transition_new_data_to_processed
          - extract_need_from_processed_data   # Phase 4 Step 2.3 EXTRACT branch
        PLANNING:
          - scrape_for_data_gap                # Phase 4 Step 2.3 SCRAPE branch
          - productization_marking             # Phase 5 promotion
```

**Resolution rules:**
- The Hustler determines its current **phase** (`INGESTION` for Phase 1+2 work; `PROCESSING` for Phase 3-5 work) and matches the proposed action against the profile's `EXECUTION` / `PLANNING` lists.
- If the action is in `EXECUTION` → proceed autonomously, log to `hustler_hub.recent_events`.
- If the action is in `PLANNING` → post a review request in `CONTROLER.yaml.communication_hubs.hustler_hub.messages` and wait.
- **Safety default**: If the action type is **missing from BOTH lists**, the Hustler MUST default to **PLANNING** behavior (mirror of Scaler P-LAW-018 safety default).
- The legacy single-list `action_gate: [PLANNING|EXECUTION]` form remains supported as a fallback: if `profiles` is absent, the legacy gate applies uniformly to all transitions (preserves H-LAW-011 backward compatibility).

**Why granularity matters:**
- Auto-cascading a single source into an existing feature's `00-data/` is low-risk: the move is reversible via the source ledger.
- Auto-validating a brand-new **Focus** is high-risk: it scaffolds a pipeline-root folder, creates split ledgers, and takes a strategic stance — this should default to PLANNING regardless of the active work_mode.
- Auto-fulfilling a `[new-needs]` via internet scrape is medium-risk: it writes external data into the workspace and warrants user-visible review.

**Enforced:** true.

#### H-LAW-014 — DNA Preservation in Re-Scoping
When a Focus, Product, or Feature is re-scoped, retired, merged, or superseded, the Hustler MUST preserve the lineage and operational logic accumulated under it. Total replacement that drops prior coverage is a protocol violation. (Conceptual mirror of Scaler-Discovery-Logic.md §3.3 DNA Preservation, adapted to focus/product/feature artifacts.)

**Four sub-rules:**
1. **Parity Audit**: Before retiring a Product, audit which Features it parents and which Focus it sits under. The retirement entry in `[focus].focus_ledger.yaml.history[]` MUST list every dependent feature and the disposition (migrated to which product, archived, or explicitly dropped with reason).
2. **Modular Merging**: Prefer **merging** a new Product into an existing one (extending its feature set) over creating a parallel Product. The same applies one level up — prefer merging two pending focuses over splitting them — and one level down — prefer extending an existing feature with a new `[new-def]` over creating a sibling feature for the same capability.
3. **Deprecation Bridge**: A retired focus/product/feature folder MUST be MOVED (never deleted) to `.hustler_runtime/.hustler_archive/YYYY-QQ/RETIRED-[level]-[name]/`. The matching tracker entry's `status: RETIRED` is set with `retired_at` + `retired_reason` + `successor_id` (if any).
4. **No Logic Loss**: A new `[new-def]` that supersedes an old definition MUST either include the old definition's coverage or document explicitly in the definition's `supersedes` block what was dropped and why. Definitions cannot silently overwrite predecessors.

**Audit trail requirement:**
Every re-scoping operation appends one entry to `.meta_os/meta_db/pipeline_hustler_os.yaml.state.rescoping_history[]` with: `level: focus|product|feature`, `before_id`, `after_id` (or null for retirement), `reason`, `dependent_artifacts`, `timestamp`.

**Enforced:** true.

#### H-LAW-015 — Source Quality Bar (agent-judged 5-criteria gate before threshold counting)
A source MUST pass at least **3 of 5** quality criteria before it counts toward any cascade threshold (Focus / Product / Feature) defined in `Hustler-Cascading-Logic.md §3`. Sources below the bar may still be logged in `.hustler_mixed_inbox.ledger.yaml` for traceability but are tagged `quality: REJECTED` and do not increment threshold counters.

**Scoring authority — semantic, not regex.**
The scoring is performed by the agent (LLM) reading the source end-to-end. **Regex-style or keyword-list scoring is explicitly forbidden** — it produces both false negatives (e.g., a Darija/Arabic transcript about Algerian Facebook Ads gets marked low-specificity because it never types the literal word "Algeria") and false positives (e.g., a generic "make money online" pitch passes specificity because it mentions "DZD" once). The agent reads the source, assigns each criterion a boolean using the rubric below, then writes the per-criterion judgment + a short rationale into the ledger entry.

This rule was revised after the 2026-05-18 cross-pollination simulation surfaced regex misses on real Algerian e-commerce transcripts. See `.scaler_runtime/.scaler_scratch/h_law_013_simulations/sim_1_cascade.report.md` for the failure cases that motivated the revision.

**The 5 criteria — agent rubric:**

| Criterion | What the agent decides (PASS condition) |
|---|---|
| **Recency** | Reading the source, is the content current for the focus's market? Pass if produced within ~12 months OR if the content is explicitly evergreen for the domain (e.g., a foundational regulatory rule, a tax-rate doc, a market structure that doesn't churn). The agent considers cues holistically: filename hints (`2026`, `V2`), platform references (current Facebook Ads UI, current Shopify features), tone, and any explicit dates inside the content. **Stale signal language** ("back in 2018, we used…") fails unless the source is comparing then-vs-now to make a current point. |
| **Authority** | Reading the source, does an identifiable producer with relevant credibility stand behind it? Pass if a named author / verified channel / registered domain is identifiable AND that producer demonstrates either (a) demonstrated expertise (specific operational detail, named tools, real numbers) OR (b) firsthand market access (lives/works in the focus's market, runs a business there, has shipped product in it). Anonymous viral teasers fail. A pseudo-anonymous channel with rich operational specificity passes — the *content* establishes credibility even when the producer is one-name-only. |
| **Specificity** | Reading the source, does it address a concrete focus / product / feature angle, or is it generic? Pass if the agent can extract **at least one named market constraint** from the content — a currency, region, payment rail, audience segment, regulatory rule, named platform, named tool, or named workflow step. **Crucial:** the constraint may be implicit and non-English — a Darija transcript about Facebook Pixel setup that never types "Algeria" but discusses local delivery (`Yalidine`, `Flash Delivery`), local payment (cash on delivery, COD culture), and local language (Darija itself signals Algeria/Maghreb) is **specific** and passes. The agent's job is to read for substance, not match keywords. |
| **Relevance** | Reading the source, does it overlap with this focus's reason for existing? Pass if the content overlaps ≥1 of the existing focus's `market_context` themes in `[focus].focus_ledger.yaml` (currency / language / delivery / payment / advertising / product_strategy fields), OR if the source matches a proto-focus theme already accumulating in `.hustler_mixed_inbox.ledger.yaml` cluster groupings. The agent uses the ledger as a reference point, not a regex target. |
| **Completeness** | Reading the source, is it consumable end-to-end without going elsewhere? Pass if a reader who has only this file walks away with the argument intact. A 30-second teaser clip with no follow-up fails. A multi-part series passes only when all parts are present. A transcript truncated mid-sentence fails. The agent checks for both length AND argumentative closure — long but disjointed content fails as readily as short content. |

**Scoring procedure (per source):**
1. Read the source completely. For long sources, read the full body — skimming the first 200 words and concluding from genre alone is forbidden.
2. Cross-reference the focus's `market_context` block (when an existing focus is candidate-matched) and the inbox ledger's existing cluster groupings.
3. For each criterion, write `true | false` plus a 1-sentence rationale citing concrete evidence from the source.
4. Compute the score (0–5) and verdict (PASS ≥4, BORDERLINE =3, REJECTED ≤2).
5. Write the structured `quality_scoring` block into the source's ledger entry — see schema below.

**Ledger entry schema (under `quality_scoring`):**
```yaml
quality_scoring:
  scored_by: agent_semantic           # always; regex/keyword scoring is forbidden
  scored_at: '<ISO 8601>'
  score: 0..5
  verdict: PASS | BORDERLINE | REJECTED
  rubric:
    recency:        {pass: true|false, rationale: "1-sentence cite from content"}
    authority:      {pass: true|false, rationale: "..."}
    specificity:    {pass: true|false, rationale: "..."}
    relevance:      {pass: true|false, rationale: "..."}
    completeness:   {pass: true|false, rationale: "..."}
```

**Scoring rules:**
- **PASS (4–5)** → counts toward threshold.
- **BORDERLINE (3)** → counts toward threshold AND flagged `quality: BORDERLINE` for human spot-check during the next Audit Pass.
- **REJECTED (≤2)** → NOT counted toward threshold; logged with `quality: REJECTED` and the failing criteria; archived in `.hustler_runtime/.hustler_archive/YYYY-QQ/REJECTED-quality/`.

**Why this rule:**
Without a quality bar, threshold-counting alone scaffolds focuses on noise — five low-credibility Arabic Facebook ads about "drop-shipping in Algeria" would validate a Focus by count alone. With H-LAW-015 those sources mostly fail Authority + Completeness and the cascade correctly holds. The semantic-judgment requirement (no regex) closes the false-negative gap surfaced by Sim 1: 2 of 23 real Darija transcripts that a regex scored REJECTED would now correctly score PASS once the agent reads them in language and market context.

**Enforced:** true. Specifically: any cascade or threshold-promotion operation that reads a `quality_scoring` entry where `scored_by != agent_semantic` MUST treat the entry as missing and re-score before counting.

---

## 4. Conflict Resolution
1. **Pillar Dominance**: The identity context (`_context/.meta_os/meta_identity/`) rules always take precedence. Hustler logic adapts; system laws do not.
2. **Deterministic Precedence**: The Master DB Index (`.meta_os/meta_db/meta_os.yaml`) is the final authority. If a Hustler operation contradicts the master index, the operation is rejected pending an Internal Action Card via the Scaler.

---

## 5. Self-Evolution Protocol
The Hustler is a self-improving system. Discoveries that reveal new patterns in product-discovery (e.g., new tag types, new cascading dimensions, new monetization vectors) must be converted into Internal Action Cards routed via the **Scaler INTERNAL pipeline** to `Foundational_Integrity_internal_proposals/`. The Hustler does not self-modify its own runbooks — that is Scaler territory.

---

## 6. Pipeline Routing Instructions

These mandatory routing rules govern how agents navigate and operate within the Hustler pipeline:

1. The Hustler pipeline operates on a Focus → Product → Feature hierarchy. Items cascade from `_HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/` down through threshold checks in the Cascading Discovery workflow until they reach a validated focus folder at the pipeline root.

2. When executing a discovery, the Hustler operates in INGESTION mode by default. The 5-Phase Workflow (Ingestion → Cascading Discovery → Definition → Needs Fulfillment → Productization) governs every operation cycle.

3. **MANDATORY:** Read all FIVE runbook files before any Hustler execution — Architecture, Workflows, Operational-Rules, Cascading-Logic, Tagging-System.

4. **MANDATORY:** Update `.meta_os/meta_db/pipeline_hustler_os.yaml` at the start AND end of every operation cycle.

5. **MANDATORY:** Check `_HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/` AND `_HUSTLER-EXTERNAL_SOURCES/_[focus]_inbox/` FIRST in Phase 1 (Ingestion) before scanning validated focus folders at pipeline root. Cascade staged items before processing validated discoveries.

6. **MANDATORY:** For every cascading decision — consult the relevant focus tracker (`[focus]-PRODUCTS.yaml`) and product tracker (`[product]-FEATURES.yaml`) BEFORE creating any new Focus, Product, or Feature (anti-thrashing).

7. Tag taxonomy: items in feature `00-data/` folders use `[new-data]` | `[processed-data]` | `[new-scraped]`; feature trackers use `[new-def]` | `[new-needs]`. See `Hustler-Tagging-System.md`.

8. **CRITICAL:** Never guess file paths. Always use the absolute paths explicitly provided within DB files or directory listings.

9. **Governance Laws Reference:** See `Hustler-Governance-Laws.yaml` for the machine-readable H-LAW definitions.
