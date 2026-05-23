# 🔍 Scaler Discovery Logic

## Objective
Define how external items are **classified** into pillars, **categorised** into functional groups inside those pillars, and **tracked** through the discovery → proposal lifecycle. This is a mandatory reference for Phase 1 (Discovery) and Phase 2 (Mapping & Tracking) of every EXTERNAL Scaler execution cycle.

> **Vocabulary update (G-CATEGORISATION-MODEL).** This runbook used to encode discovery depth as `Discovery (D) → Sub-Discovery (SD) → Sub-Sub-Discovery (SSD)`. That fixed-depth model has been replaced with **Functional Groups + unbounded sub-grouping** — see §2 below. The `D / SD / SSD` vocabulary is no longer used; sub-ledger entries no longer carry `discovery_level` or `parent_discovery_id`. Existing rules that survive the rewrite are restated in their new form rather than removed (per P-LAW-010 logic preservation).

---

## 1. The Two Decisions: Classification vs Categorisation

Every item entering Scaler EXTERNAL flows through two distinct decisions, in order. Conflating them was a long-standing gap; separating them clarifies both audit and enforcement.

### Decision 1 — Classification (which pillar?)
Resolves: *Which of the 3 pillars does this item belong to?* Applied to **untyped** items in `_SCALER-EXTERNAL_SOURCES/.scaler_mixed_inbox/` and to typed-inbox items as a sanity check.

Outputs:
- One pillar (single-utility item), OR
- Multiple pillars via fan-out copies (multi-utility item — see §1.2), OR
- Rejection to `.scaler_USER-SPACE/.complex_inboxes/` (strong-source-identity item — see §1.3)

### Decision 2 — Categorisation (which functional group?)
Resolves: *Which functional group inside the resolved pillar does this item belong to?* Applied **after** classification, to every item that lands in a typed pillar discovery hub.

Output: a Functional Group folder path inside `_SCALER-EXTERNAL_SOURCES/<Pillar>_discoveries/`, with optional sub-grouping at any depth.

Items never appear in a discovery hub without both decisions resolved. This is the No-Inbox Processing Law (P-LAW-016) restated: classification + categorisation MUST complete before any Phase 2-4 work begins.

---

### 1.2 Multi-Pillar Fan-Out

A single source can carry **orthogonal utilities** that fit different pillars. Example: a "business strategy advisor" markdown file may contain both a reusable skill (Operational_Muscles) AND market ideas (Value_Generation). Each utility serves a different pillar's goal.

The rule:

| Item shape | Routing |
|---|---|
| Single utility (one pillar serves the whole item's value) | **MOVE** to that pillar's discoveries hub. Original removed from inbox. |
| N orthogonal utilities (item is genuinely useful in N pillars in different ways) | **COPY** the item into N pillars, each tagged with the specific utility being extracted there. **Then remove the original** from the inbox to keep it clean. |

**Tracking:**
- A multi-pillar item gets a single `multi_pillar_ref_id: <uuid>` shared across all copies in the sources_ledger.
- Each pillar's copy carries an `extracted_concern: <one-line>` describing what utility this pillar extracted.
- All copies share the same content hash for anti-duplication purposes — same hash, different `extracted_concern`, same `multi_pillar_ref_id`.

The fan-out is recorded once in the originating pillar's ledger entry as `multi_pillar_siblings: [<other pillar ledger entry IDs>]`, so a reviewer reading any one entry can trace the rest.

> **Why MOVE for single-utility instead of COPY:** keeps the on-disk discovery layout free of duplicates that serve no purpose. The fan-out only happens when there is actual value to fan out.

---

### 1.3 Strong-Source-Identity Rejection (`.complex_inboxes/`)

Some external drops are coherent pieces of a single named ecosystem (Claude Code extensions, Hermes Agent bundles, a specific tool's plugin pack, etc.). External cannot cleanly classify these into our pillars without losing the source's coherence — they need human triage before any per-item extraction.

When a drop matches the **strong-source-identity** signature, the agent rejects it from the External path and moves it whole to `_SCALER-EXTERNAL_SOURCES/.scaler_USER-SPACE/.complex_inboxes/<source-name>/`. The user later decides how to extract individual concerns.

#### Detection signature (count-based + complexity-based)

A drop triggers rejection if **any** of the following are true:

| Signal | Threshold |
|---|---|
| **Count** | More than **5 items** share the same source-ecosystem signature (folder named after a tool, header references one tool, vocabulary dominated by one ecosystem). |
| **Structural complexity** | Drop has internal structure (sub-folders + contract files like `SKILL.md` / `AGENT.md` / `package.json`) AND is bound to one named ecosystem — even with fewer than 5 items. |
| **Size** | Single file > **50 KB** OR folder total > **200 KB**, AND content is one ecosystem's coherent piece. |
| **Cross-reference coherence** | Items share an internal cross-reference graph (file A references file B references file C) AND all references resolve to the same external system. |

Thresholds are tuneable via `Scaler-Operational-Rules.md#constants` (added in Pass 2).

#### What `.complex_inboxes/` is — and isn't

- **Is**: a parking lot under `.scaler_USER-SPACE/` that the user owns. Scaler writes here; Scaler never reads back.
- **Is**: namespaced by source — one subfolder per identified ecosystem.
- **Isn't**: a Scaler discovery hub. Items here have no `sources_ledger` entry except the rejection marker explaining why they were bounced.
- **Isn't**: a re-routing destination. Items don't get auto-extracted; the user has to decide.

#### Exception to P-LAW-015

P-LAW-015 (Strict User-Space Exclusion) says Scaler never touches `.scaler_USER-SPACE/`. The single, narrow exception: **Scaler MAY write into `.scaler_USER-SPACE/.complex_inboxes/<source-name>/` from the External path when the strong-source-identity signature triggers**. This is a write-only direction. Reads remain forbidden.

The rejection writes:
1. The item(s) moved to `.complex_inboxes/<source-name>/`.
2. A rejection marker `.complex_inboxes/<source-name>/.rejection.yaml` containing: source signature, trigger signal, item count, total size, agent reasoning, timestamp.
3. A line in the originating ledger (mixed_inbox.ledger.yaml or `_<Pillar>_inbox` source) marking the item with `rejected_to_complex_inboxes: true` + the rejection marker path.

---

## 2. The Functional Group Model (replaces D / SD / SSD)

Inside each pillar discovery hub, items live in **functional groups**. Sub-grouping is **optional and unbounded** — the agent uses it only when items inside a group naturally separate into recognisable sub-domains.

```
_SCALER-EXTERNAL_SOURCES/<Pillar>_discoveries/
├── <functional-group-1>/                    ← coherent topic ("system_reviewers")
│   ├── <item>                               ← any depth, any structure
│   ├── <sub-group-A>/                       ← optional sub-cluster
│   │   ├── <item>
│   │   └── <sub-sub-group>/                 ← unbounded depth
│   │       └── <item>
│   └── <item>
├── <functional-group-2>/
│   └── <item>
└── ...
```

### Rules

1. **Functional Group = unit of analysis.** When drafting a proposal, the agent reads the **entire group together** to get the full picture. No proposal scans only part of a group.
2. **Same-pillar grouping only.** A functional group never crosses pillars. Multi-pillar items become separate group memberships in each pillar via fan-out (§1.2).
3. **Functional naming, not source naming.** Groups are named by what items DO, not where they came from. Good: `system_reviewers/`, `browser_automation/`, `coding_standards/`. Bad: `karpathy_files/`, `claude_code_extensions/` (the latter would have triggered §1.3 rejection in the first place).
4. **Sub-grouping is optional.** A group with 3 items and no clear sub-clustering stays flat. A group with 30 items where 12 form a coherent sub-domain gets a sub-group folder.
5. **Sub-grouping depth is unbounded.** No D/SD/SSD cap. The agent goes as deep as the items naturally separate.
6. **Sibling-respecting (P-LAW-009 restated).** Before creating a new group, scan existing groups in the same hub for a functional match. Creating `coding_guidelines/` next to `coding_standards/` is a fragmentation violation.
7. **Lazy scaffolding (P-LAW-014 + §7.3 carry-over).** Group folders are created only when the first item routes there, atomically with the move + ledger entry.
8. **Internal scaffolding is not a sub-group.** Files that exist only as support for a parent item (font assets inside a UI skill, test fixtures inside a script bundle, config files with no standalone value) stay flat inside the item's folder. They are NOT sub-groups; they have no ledger entries of their own.

### Distinguishing a sub-group from internal scaffolding

| Looks like | Is a sub-group when... | Is internal scaffolding when... |
|---|---|---|
| `<item>/scripts/` | Each script has standalone functional value | Scripts only run as part of the parent item's pipeline |
| `<item>/agents/` | Each agent is a complete contract (`AGENT.md` + capabilities) | Agents are private helpers inside the parent system |
| `<item>/tests/` | Tests document a contract usable independently | Tests only validate the parent item |
| `<item>/references/` | References are reusable content (e.g., reusable patterns) | References only document the parent item |

When unclear, **treat as internal scaffolding** (smaller-footprint default per P-LAW-009 anti-fragmentation).

---

## 3. The Cluster Intake Protocol (chaos → order)

When an inbox or hub holds chaotic input — multiple folders with random unrelated files mixed with related sub-folders — the agent runs the **Cluster Intake Protocol** to organise it. This is the algorithmic core of categorisation.

### 3.1 Inputs that trigger the protocol
- Items in `_SCALER-EXTERNAL_SOURCES/.scaler_mixed_inbox/` (untyped, need classification first)
- Items in `_SCALER-EXTERNAL_SOURCES/_<Pillar>_inbox/` (typed, need categorisation only)
- Re-organisation of items already inside a pillar discovery hub when fragmentation is detected
- Pre-grouped folders dropped by the user inside `<Pillar>_discoveries/` when the user's grouping fails the same-pillar / functional-coherence audit

### 3.2 The 6-step protocol

1. **Atomic read.** Read the full content of every file in the chaotic input — not just names. Names lie; content classifies.
2. **Functional cluster mining.** Group items by what they DO, not where they came from. Cross-folder clustering is mandatory: files in different source folders that share function MUST end up in the same destination group. Files in the same source folder that have no functional relationship MUST be split apart.
3. **Pillar split** (only for `.scaler_mixed_inbox/`). Within each functional cluster, separate items by pillar. A cluster that spans pillars becomes 2-3 clusters, one per pillar. Apply LAW-005 Tier 1 strict-preservation reasoning for Foundational_Integrity items.
4. **Strong-source-identity check.** For each cluster, run the §1.3 detection signature. If triggered, reject the cluster whole to `.complex_inboxes/<source-name>/`; do NOT split it across the substrate.
5. **Group naming.** Name each surviving cluster by its functional purpose. Verify against existing groups in the destination pillar (sibling-respecting rule #6) — if a functional match exists, use that group instead of creating a new one.
6. **Atomic move + ledger.** For each item in each cluster: create the group folder if it doesn't exist (lazy scaffolding), move the item, write the sources_ledger entry. All three (folder + move + ledger) succeed together or roll back per P-LAW-019.

### 3.3 Error modes during intake

| Failure | Action |
|---|---|
| Cluster is genuinely ambiguous (could fit two pillars equally) | Apply tie-breaking from §3.4 below; if still tied, post to `scaler_review_queue` with `status: classification_undecided` |
| Cluster fails strong-source-identity but no clear `<source-name>` exists | Use the dominant ecosystem signature as the folder name; if none, post to `scaler_review_queue` with `status: source_identity_unclear` |
| Mid-protocol crash leaves group folder created but item not moved | P-LAW-019 rollback: remove the empty group folder, restore item to inbox, no ledger entry |
| Cross-folder cluster spans 30+ items | Continue — large clusters are valid, they just generate Master + Sub-Proposals later (§5) |

---

## 4. Inheritance from the Old 5 Boundary Signals

The old §1 "5 Boundary Signals" (S1-S5) drove the D/SD/SSD depth decision. Under the Functional Group model, depth is no longer fixed, so the signals serve a different purpose: they help the agent **distinguish one analysable item from many** during step 2 of the Cluster Intake Protocol.

| Old Signal | Repurposed role under the new model |
|---|---|
| **S1 — Entry File** (`SKILL.md`, `AGENT.md`, root `.md`) | Marks a folder as one analysable item (a single thing the proposal will reason about). Doesn't mean "Discovery vs Sub-Discovery" anymore — just "this folder is one unit." |
| **S2 — Sub-folders** | Helps decide: are these sub-folders **internal scaffolding** of the parent item (stay flat) OR **sub-groups** of a larger functional cluster (get their own group folders)? |
| **S3 — Sibling Similarity** | All siblings sharing structural type → the parent is a **collection container**, not a single item. The collection contents go through Cluster Intake Protocol §3.2 step 2. |
| **S4 — Thematic Grouping** | Items related by source ecosystem → trigger §1.3 strong-source-identity check. If no rejection, items become one functional group. |
| **S5 — Functional Affinity** | Items related by what they DO → mandatory single functional group regardless of where they sourced from. The strongest signal under the new model. |

Read all 5 together — no single signal is conclusive alone. The signals are descriptive, not prescriptive: they describe what an agent observes, the Functional Group decision is what the agent does.

---

## 3.2 Selection Criteria (The "Why")

> Preserved verbatim from the prior runbook. Governs Phase 4 drafting, not categorisation. Untouched by the categorisation rewrite.

When comparing Target (Ground Truth) vs. Source (Discovery), use these criteria to resolve the `Integration_Type`:

| Integration Type | Selection Criteria (The "Why") | Rule (The Law) | Workflow (The Path) |
| :--- | :--- | :--- | :--- |
| **INJECT** | Target exists and is missing specific logic found in source. | **Logic Preservation:** Never overwrite; append/prepend only. | 1. Find Injection Points → 2. Apply Enrichment → 3. Verify Sync. |
| **UPGRADE** | Target exists but source logic is technically superior/more modern. | **DNA Preservation:** Merge superior logic; preserve foundational OS DNA. | 1. Create Bridge → 2. Execute Swap → 3. Archive Old. |
| **BUILD_NEW** | No matching target exists in the interrogated Pillar. | **Registry Compliance:** Must be registered in Correct Routers. | 1. Define Structure → 2. Create Files → 3. Register in `.db/` routers. |
| **EXTEND** | Target exists but source provides a new sibling component/feature. | **Cohesive Expansion:** Use inheritance/extension patterns. | 1. Map Extension Points → 2. Build Sub-Component → 3. Update Docs. |

---

### 3.3 The Laws of DNA Preservation (UPGRADE Protocol)

> Preserved verbatim. Governs Phase 4 drafting, not categorisation. Reinforces LAW-005 Tier 1 from the substrate level.

When performing an **UPGRADE**, these laws are non-negotiable to prevent DNA corruption:

1.  **Parity Audit**: Before deprecating old logic, you MUST audit its full functionality. The new logic MUST cover 100% of the old use cases unless explicitly authorized to drop them.
2.  **Modular Merging**: Prefer merging superior functions into the existing structure over total file replacement. If the structure changes, the core logic "DNA" must be migrated to the new schema.
3.  **Deprecation Bridge**: Old logic is moved to `_archive/` or marked `@deprecated` but never deleted until the new system is verified in 3+ successful missions.
4.  **No Logic Loss**: If the source discovery is missing a feature present in the target, that feature MUST be ported over to the "upgraded" version. Total replacement with an inferior feature-set is a protocol violation.

### 3.4 Tie-Breaking Order (when multiple Integration Types are equally plausible)

> Preserved verbatim. Governs Phase 4 drafting tie-breaks.

The selection criteria in §3.2 resolve most cases unambiguously. When two integration types still rank equal — typically `INJECT` vs `EXTEND` for an existing pillar, or `EXTEND` vs `BUILD_NEW` when target proximity is borderline — apply this strict ordering:

1. **Specificity wins** — prefer the smallest-scope change that still delivers the discovery's value:
   - `INJECT_INTO_EXISTING` (smallest: appends inside an existing file) >
   - `EXTEND_EXISTING_SYSTEM` (medium: adds a sibling component to a known system) >
   - `BUILD_NEW_COMPONENT` (largest: creates new system surface).
   The smaller the structural footprint, the lower the risk of architectural drift; choose smaller when in doubt.

2. **Recency wins** — if specificity ties, prefer the integration type whose target file (or sibling file in the target system) was most recently modified per `git log`. The recently-touched file is likely to be the active locus of related work; layering changes on cold targets risks creating parallel codepaths.

3. **Pending-merge wins** — before specificity/recency, if any pending Proposal Card under the same target pillar already touches the target file or system, the resolution is `MERGE_WITH_PENDING` regardless of the original tie. This rule out-ranks (1) and (2).

4. **Human gate (last resort)** — if specificity AND recency tie AND no pending merge candidate exists, the Scaler MUST stop, post the tie in `CONTROLER.yaml.communication_hubs.scaler_hub.scaler_review_queue` with `status: TIE_PENDING_RESOLUTION`, and resume only after the user picks a type. Never coin-flip; never default-bias to one type silently.

5. **Document the resolution** — once the tie is broken (by any of rules 1-4), the chosen type's card MUST list the tie-break path in `scaler_notes`, e.g., `"Tie between INJECT and EXTEND on target X — INJECT chosen by specificity (rule 1)"`. This produces an audit trail when later cards revisit the same target.

> **Why this matters**: today, two equally-plausible types resolve by whichever the agent typed first. That's an invisible bias toward whatever vocabulary the prompt happened to surface. §3.4 forces a deterministic, auditable path for ambiguity.

---

## 5. Hierarchical Proposal Modeling for Multi-Item Functional Groups

When a functional group is large or has nested sub-groups, drafting one monolithic proposal loses fidelity. Use the **Master + Sub-Proposals** pattern — same idea as the old D/SD model, restated for the new vocabulary.

### 5.1 Analysis Phase (Top-Down Reading)
Process in strict order so the big picture is understood before the details are carded:

1. **Step 1 — Read the Group**: Read the full structure of the functional group folder. Determine the overall system identity, resolved `discovery_type`, and the high-level OS aspects it impacts.
2. **Step 2 — Read each Sub-Group**: For each sub-group folder (if any), read its unique value. Determine if it has a divergent type or aspect from the parent.
3. **Step 3 — Read deeper levels**: Continue recursing through any further sub-grouping. Stop when you hit individual items or internal scaffolding.

### 5.2 Proposal Phase (Hierarchical Modeling)
Once analysis is complete:

- **Master Proposal (Parent)**: Based on Step 1. Creates the high-level architectural overview and integration strategy for the entire group.
- **Sub-Proposals (Children)**: Based on Steps 2-3. Created for each significant sub-group when the sub-group has its own divergent integration type or aspect.
  - **Linkage**: Sub-Proposals MUST use the `parent_proposal_id` field to link back to the Master Proposal ID.

When NOT to split: a functional group with all-uniform items and one consistent integration type stays as one proposal. Splitting solely for size is a P-LAW-009 violation.

---

## 6. Processing Strategy Table

| Situation | Proposal Strategy |
|---|---|
| Several similar standalone files (e.g., 3 guidelines) | **Synthesis**: 1 functional group, 1 proposal for all files. |
| Flat collection (e.g., a folder of agents) | **Cluster Intake**: 1 functional group with sub-groups per cluster; 1 proposal per cluster. |
| Complex toolbox with multiple typed sub-folders | **Master + Sub-Proposals**: 1 Master Proposal + 1 Sub-Proposal per significant sub-group. |
| Massive collection (e.g., 100 skills) | **Cluster Intake**: identify lead technologies/topics into their own sub-groups; one proposal per sub-group; Master Proposal if the whole collection has overarching integration logic. |
| Coherent ecosystem bundle (>5 items, named source) | **Reject to `.complex_inboxes/`** per §1.3. No proposal until user triages. |
| Multi-pillar item | **Fan-out copies** per §1.2; each pillar produces its own proposal, linked by `multi_pillar_ref_id` in scaler_notes. |

---

## 7. The Two-Layered Organisation Protocol (P-LAW-013, restated)

> P-LAW-013 in `Scaler-Operational-Rules.md` defines the two organisational decisions. This section is the operational expansion of that law. If P-LAW-013 and §7 ever disagree, the law in `Scaler-Operational-Rules.md` is canonical.

### 7.1 Layer 1 — Classification (Utility-First Routing)
Used for: untyped items in `_SCALER-EXTERNAL_SOURCES/.scaler_mixed_inbox/`. (USER-SPACE content under `.scaler_USER-SPACE/` is OUT OF SCOPE per P-LAW-015 — exception only for the §1.3 write into `.complex_inboxes/`.)

**Algorithm:**
1. Read the item fully.
2. Run the strong-source-identity check (§1.3). If triggered, route to `.complex_inboxes/`.
3. Determine the item's `discovery_type` based on **Utility** (regardless of file format):
   - **Foundational_Integrity**: core OS systems (toolbox system, meta_identity, routers, milestones, pipelines, projects). System designs, structural blueprints, routing schemes.
   - **Operational_Muscles**: anything that becomes a toolbox item (tools, scripts, agents, skills, automation engines).
   - **Value_Generation**: anything that makes money for our systems and architecture (monetization, strategy, business ideas).
4. Run the multi-pillar fan-out check (§1.2). If the item carries N orthogonal utilities, plan N copies.
5. **MOVE** (single-utility) or **COPY** (multi-utility) into the matching `<Pillar>_discoveries/` hub. For multi-utility, remove the original from the inbox after all copies land.

### 7.2 Layer 2 — Categorisation (Functional Grouping)
Used for: items in typed inboxes, items routed by Layer 1 into typed hubs, or re-organisation inside an existing hub.

**Zero Loose Files Law (P-LAW-014)**: discovery hubs MUST NOT contain loose files at the hub root. Every item — regardless of count — lives in a functional group folder. A group can contain a single item.

**No-Inbox Processing Law (P-LAW-016)**: items MUST be moved + grouped into their parent discovery hub before any Phase 2-4 processing begins.

**Algorithm:**
1. Run the Cluster Intake Protocol (§3.2).
2. Log each routing decision in the relevant `<Pillar>.sources_ledger.yaml` with `routed_from_random: true` (when re-grouping flat input) or `routed_from_typed_inbox: true` (when ingesting a pre-typed inbox drop).

### 7.3 Lazy Group Scaffolding

The 3 typed discovery hubs themselves (`Foundational_Integrity_discoveries/`, `Operational_Muscles_discoveries/`, `Value_Generation_discoveries/`) are core OS structure and exist eagerly — they MUST be scaffolded on workspace bootstrap. **Functional group folders inside those hubs**, however, are scaffolded **lazily** and only when an item routes there for the first time.

**Rules:**
1. **Hub-level eagerness**: the 3 pillar hubs always exist with at least a `.gitkeep`. They are never lazy.
2. **Group-level laziness**: a functional group folder (e.g., `Operational_Muscles_discoveries/agent_personas/`, `Foundational_Integrity_discoveries/coding_standards/`) is created **only at the moment the first item is routed into it** — not pre-created on bootstrap and not pre-created during the Cluster Intake audit.
3. **Atomic with routing**: the group folder creation is part of the same atomic operation as the first item's move + sub-ledger entry (per P-LAW-001 + P-LAW-019). A half-created group with no item is a rollback target.
4. **Empty-group pruning**: if a group folder ends up empty after item migrations or archivings, the next Audit Pass (`Scaler-Workflows.md §7`) flags it for removal. Empty group folders are NOT auto-deleted by the cascade engine; deletion flows through the standard gateway.
5. **Naming on creation**: the agent picks a group name that captures the **functional cluster**, not the source ecosystem (P-LAW-013 Layer 2 Relevance-First). Bad: `karpathy_files/`. Good: `coding_standards/`. Source-named items would have triggered §1.3 rejection.
6. **Sibling-respecting**: before creating a new group, the agent MUST scan existing groups in the same hub for a functional match. Creating `coding_guidelines/` next to an existing `coding_standards/` is a fragmentation violation (P-LAW-009).

> **Why lazy at group level only**: Eager group scaffolding noise-pollutes the discovery tree with empty folders for groups that may never receive items. Lazy scaffolding keeps the discovery hubs visually accurate to what the workspace actually has accumulated, which makes Cluster Intake audits cheaper to run.

> **Why eager at hub level**: The 3 hubs are part of the routing contract — `.scaler_mixed_inbox/` resolution depends on all 3 hub paths existing. Making them lazy would break Phase 1 routing.

---

# 📋 Sub-Ledger Entry Schema (v3.0 — Functional Group Model)

```yaml
# - discovery_id: string                   # e.g., system_reviewers/security-reviewer.md
#   discovery_status: string               # PENDING | ARCHIVED
#   source_path: string                    # absolute path inside <Pillar>_discoveries/
#   group_path: string                     # <pillar>/<group>/<optional-subgroup>/
#                                          # Replaces the legacy discovery_level field.
#   content_hash: string                   # sha256 of the item's content (anti-duplication)
#   discovery_type: string                 # Foundational_Integrity | Operational_Muscles | Value_Generation
#   primary_aspect: string
#   aspects: [string]
#
#   # Multi-pillar fan-out (set only when the item lives in N pillars)
#   multi_pillar_ref_id: string            # uuid shared across all fan-out copies
#   multi_pillar_siblings: [string]        # ledger entry IDs in other pillars
#   extracted_concern: string              # what this pillar extracted from the item
#
#   # Origin tracking
#   routed_from_random: bool               # routed via Cluster Intake from chaos
#   routed_from_typed_inbox: bool          # arrived via _<Pillar>_inbox
#   rejected_to_complex_inboxes: bool      # bounced to .scaler_USER-SPACE/.complex_inboxes/
#   rejection_reason: string               # set when rejected_to_complex_inboxes is true
#
#   proposal_ids: [string]                 # cards generated from this item
#   integration_status: string             # PENDING | INTEGRATED | REJECTED
```

**Migration from v2.2 → v3.0:**
- `discovery_level: D | SD | SSD` → REMOVED (replaced by `group_path`)
- `parent_discovery_id` → REMOVED (group hierarchy is encoded in `group_path` directly)
- `multi_pillar_ref_id`, `multi_pillar_siblings`, `extracted_concern` → NEW
- `rejected_to_complex_inboxes`, `rejection_reason` → NEW
- `content_hash` → made explicit (was implied; now part of the schema for anti-dup checks)

The migration is auto-applied by the next sync cycle: existing entries get their `discovery_level` and `parent_discovery_id` fields stripped (no data loss since the current ledgers are empty of typed entries), and the new fields are added with safe defaults (`null` / `false`).

---

## 8. Sub-Ledger Tracking Rule

Every item that lands in a pillar discovery hub MUST be logged in that pillar's `<Pillar>.sources_ledger.yaml.tracked_discoveries[]` before any proposal is created. The single content-hash entry (per pillar copy in the multi-pillar case) is the anti-duplication contract: same hash → never reprocessed.

**Update order is mandatory**: pillar `sources_ledger` written first → master rollup at `.scaler_routing/scaler_ledgers.yaml` re-aggregated by sync after.

For multi-pillar items, the order is:
1. Write the first pillar's ledger entry.
2. Write each subsequent pillar's ledger entry, each carrying the same `multi_pillar_ref_id` and a `multi_pillar_siblings: [...]` list referencing the others.
3. Once all entries land, remove the original from the inbox.

---

## 9. Discovery Archiving Rule

A functional group (and any items inside it) is archived once **Fully Assimilated**:

- **Definition of Fully Assimilated**: All proposals derived from the group are marked `INTEGRATED`. For multi-pillar items, all sibling copies' proposals are also `INTEGRATED`.
- **Action**: Move the group folder from the active discovery hub to `.scaler_runtime/.scaler_archive/YYYY-QQ/EXTERNAL-discoveries-<pillar>-<group>.yaml` (or a corresponding quarter-bucketed subfolder for multi-file groups).
- **Ledger Update**: Set `discovery_status: ARCHIVED` in the relevant sub-ledger and move the entry to the `history` section.

> **Update order is mandatory**: Sub-ledger written first → master updated after. Never reverse this.

For multi-pillar items, archiving is per-copy: each pillar's ledger entry is archived independently as that pillar's proposals integrate. The `multi_pillar_ref_id` link survives archiving so a reviewer can still trace siblings across the archive.

---

## 10. Anti-Reprocess and Match-to-Pending

Two related but distinct concerns.

### 10.1 Anti-Reprocess (already enforced)
Every item carries a `content_hash` in its ledger entry. An item with a hash already logged in the destination pillar's ledger is **never reprocessed** — the routing skips it. Renames and moves don't break dedup; the hash is the identity.

For multi-pillar items, anti-reprocess is **per-pillar**: the same hash can appear in 3 pillars' ledgers (one per copy), each with a different `extracted_concern`. Trying to add a 4th identical entry in a pillar already holding the hash is rejected.

### 10.2 Match-to-Pending (new, enforces non-fragmentation across cycles)

When a NEW item is being analysed in Phase 2 / 3, the agent checks pending proposals (`integration_status: PENDING`) under the same pillar. If a match is found AND the proposal is **not yet integrated**, the new item folds into the existing card via `MERGE_WITH_PENDING` rather than spawning a new card.

**Matching criteria** (in order — first match wins):
1. Same `target_path` in `files_involved[]`.
2. ≥50% overlap in `aspects[]`.
3. Functional similarity in the proposed change (toolbox call: keyword/embedding match).

**Re-audit on merge** (LAW-005 enforcement):
- After folding, the merged proposal is re-audited under LAW-005.
- For Foundational_Integrity (Tier 1 strict): if the merged card now proposes anything that would replace existing DNA, split the new item back out and post both cards in `scaler_review_queue` with `status: merge_violates_dna` for human resolution.
- For Operational_Muscles / Value_Generation (Tier 2 permissive): the merge proceeds; the merged card's `merge_history[]` records what was folded and when.

**No-touch rule**: if the matching pending proposal is already INTEGRATED, do NOT modify it. The new item starts a fresh proposal cycle (it can extend the integrated work via a new INJECT or EXTEND card per Phase 4 logic).

`merge_history[]` schema added to the proposal card v3.1+ (will land in Pass 2):
```yaml
merge_history:
  - merged_at: <ISO timestamp>
    folded_discovery_id: <the new item's ledger ID>
    folded_content_hash: <sha256>
    re_audit_outcome: clean | violations_resolved | violations_pending
    merge_notes: <one-line rationale>
```
