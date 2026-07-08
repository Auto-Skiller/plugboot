---
metadata:
  name: scaler-discovery-logic
  class: system/runbook
  type: runbook
  version: '2.0'
  schema_version: '2.0'
  freshness:
    status: active
    sync_count: 0
    last_synced_by: daemon
    last_synced: '2026-07-04T00:00:00'
credentials:
  description: Scaler discovery logic — classification, categorisation, cluster intake protocol, functional groups (aligned with Pipelines_Architecture.md v2.0)
  when_to_use: Read when new external sources arrive via INBOX or RESEARCH profiles — defines how to classify and route them through the gateway
  contains: classification, clustering, functional_groups, gateway_delivery
---

# 🔍 Scaler Discovery Logic

## Objective
Define how external items entering via the **INBOX** or **RESEARCH** profiles are **classified** into pillars, **categorised** into functional groups inside the gateway, and **tracked** through the discovery → run lifecycle. This is a mandatory reference for Phase 1 (Discovery/Delivery) and Phase 2 (Mapping & Tracking) of every Scaler execution cycle.

> **Architecture Alignment**: This runbook aligns with `Pipelines_Architecture.md` — the standard runtime layout (`entity-scaler-runtime/`) with profile-based zones (INTERNAL, INBOX, RESEARCH), gateway delivery, and run-based execution. The old `.scaler_runtime/`, `.scaler_mixed_inbox/`, and `[Pillar]_discoveries/` paths are deprecated.

---

## 1. The Two Decisions: Classification vs Categorisation

Every item entering Scaler EXTERNAL flows (via `INBOX-inboxing/` or `RESEARCH-researching/`) goes through two distinct decisions, in order.

### Decision 1 — Classification (Which Pillar?)
Resolves: *Which of the 3 pillars does this item belong to?* Applied to **untyped** items in `entity-scaler-runtime/INBOX-inboxing/` (INBOX profile) or `entity-scaler-runtime/RESEARCH-researching/` (RESEARCH profile).

**Outputs:**
- **Single pillar** (single-utility item) → COPY to `INBOX-gateway/<Pillar>/` or `RESEARCH-gateway/<Pillar>/`
- **Multiple pillars** (orthogonal utilities) → COPY to N pillar subfolders via **Multi-Pillar Fan-Out** (§1.2)
- **Rejection** → Move to `entity-scaler-runtime/.complex_inboxes/<source-name>/` (Strong-Source-Identity §1.3)

### Decision 2 — Categorisation (Which Functional Group?)
Resolves: *Which functional group inside the resolved pillar gateway does this item belong to?* Applied **after** classification, to every item that lands in a pillar's gateway subfolder.

**Output:** A Functional Group folder path inside the pillar gateway (e.g., `INBOX-gateway/Foundational_Integrity/system_reviewers/`), with optional sub-grouping at any depth.

> **Rule (No-Inbox Processing)**: Classification + Categorisation MUST complete before any Phase 2–4 work begins. Items are never processed directly from `INBOX-inboxing/` or `RESEARCH-researching/`.

---

### 1.2 Multi-Pillar Fan-Out

A single source can carry **orthogonal utilities** fitting different pillars. Example: a "business strategy advisor" markdown containing both a reusable skill (Operational_Muscles) AND market ideas (Value_Generation).

| Item Shape | Routing |
|---|---|
| Single utility (one pillar serves the whole item's value) | **COPY** to that pillar's gateway subfolder. Original stays in inboxing/researching (source folders are immutable). |
| N orthogonal utilities (genuinely useful in N pillars in different ways) | **COPY** the item into N pillar gateway subfolders, each tagged with the specific utility extracted there. Original stays in inboxing/researching. |

**Tracking (mandatory in `INBOX-tracker.yaml` / `RESEARCH-tracker.yaml`):**
- A multi-pillar item gets a single `multi_pillar_ref_id: <uuid>` shared across all copies
- Each pillar's copy carries `extracted_concern: <one-line>` describing what utility this pillar extracted
- All copies share the same content hash for anti-duplication
- Fan-out recorded in tracker with `delivered_to[]` entries per pillar

> **Why COPY never MOVE**: Per `Pipelines_Architecture.md` — source files in `INBOX-inboxing/` and `RESEARCH-researching/` are **immutable landing zones**. Only copies go to gateway. Tracker records what was delivered where.

---

### 1.3 Strong-Source-Identity Rejection (`.complex_inboxes/`)

Some external drops are coherent pieces of a single named ecosystem (Claude Code extensions, Hermes Agent bundles, a specific tool's plugin pack). They cannot be cleanly classified into our pillars without losing the source's coherence — they need human triage first.

When a drop matches the **strong-source-identity signature**, the agent rejects it from the External path and moves it whole to `entity-scaler-runtime/.complex_inboxes/<source-name>/`.

#### Detection Signature (count + complexity based)

A drop triggers rejection if **ANY** of the following is true:

| Signal | Default Threshold (tuneable in `Scaler-Operational-Rules.md §10`) |
|---|---|
| **Count** | More than `complex_inbox_item_count_threshold` (default **5**) items share the same source-ecosystem signature |
| **Structural complexity** | Drop has internal structure (sub-folders + contract files like `SKILL.md` / `AGENT.md` / `package.json`) AND is bound to one named ecosystem |
| **Size** | Single file > `complex_inbox_single_file_size_kb` (default **50 KB**) OR folder total > `complex_inbox_folder_size_kb` (default **200 KB**), AND content is one ecosystem's coherent piece |
| **Cross-reference coherence** | Items share an internal cross-reference graph (file A → file B → file C) AND all references resolve to the same external system |

#### What `.complex_inboxes/` Is — And Isn't

| Is | Isn't |
|---|---|
| A parking lot under `entity-scaler-runtime/` that the **user** owns | A Scaler discovery hub |
| Namespaced by source — one subfolder per identified ecosystem | A re-routing destination (items don't get auto-extracted) |
| Written by Scaler (single narrow exception to P-LAW-015) | Read by Scaler — reads remain forbidden |

**Rejection writes (atomic):**
1. Item(s) moved to `.complex_inboxes/<source-name>/`
2. Rejection marker `.complex_inboxes/<source-name>/.rejection.yaml` with: source signature, trigger signal, item count, total size, agent reasoning, timestamp
3. Tracker entry (`INBOX-tracker.yaml` or `RESEARCH-tracker.yaml`) updated with `rejected_to_complex_inboxes: true` + rejection marker path

---

## 2. The Functional Group Model

Inside each pillar's gateway folder (`INBOX-gateway/<Pillar>/` or `RESEARCH-gateway/<Pillar>/`), items live in **functional groups**. Sub-grouping is **optional and unbounded** — the agent uses it only when items naturally separate into recognisable sub-domains.

```
entity-scaler-runtime/
├── INBOX-gateway/
│   ├── Foundational_Integrity/
│   │   ├── system_reviewers/                    ← functional group
│   │   │   ├── security-reviewer.md
│   │   │   ├── architecture-reviewer.md
│   │   │   └── coding-standards/                ← optional sub-group
│   │   │       ├── style-guide.md
│   │   │       └── naming-conventions.md
│   │   └── browser_automation/
│   ├── Operational_Muscles/
│   │   └── agent_personas/
│   └── Value_Generation/
│       └── monetization_strategies/
└── RESEARCH-gateway/
    └── (same three pillar structure)
```

### Rules

1. **Functional Group = unit of analysis.** When drafting a run, the agent reads the **entire group together** to get the full picture. No run scans only part of a group.
2. **Same-pillar grouping only.** A functional group never crosses pillars. Multi-pillar items become separate group memberships in each pillar via fan-out (§1.2).
3. **Functional naming, not source naming.** Groups named by what items DO, not where they came from.
   - Good: `system_reviewers/`, `browser_automation/`, `coding_standards/`
   - Bad: `karpathy_files/`, `claude_code_extensions/` (would have triggered §1.3 rejection)
4. **Sub-grouping is optional.** A group with 3 items and no clear sub-clustering stays flat. A group with 30 items where 12 form a coherent sub-domain gets a sub-group folder.
5. **Sub-grouping depth is unbounded.** No D/SD/SSD cap. Agent goes as deep as items naturally separate.
6. **Sibling-respecting (P-LAW-009).** Before creating a new group, scan existing groups in the same gateway pillar for a functional match. Creating `coding_guidelines/` next to `coding_standards/` is a fragmentation violation.
7. **Lazy scaffolding.** Group folders created only when first item routes there, atomically with the copy + tracker entry.
8. **Internal scaffolding ≠ sub-group.** Support files (fonts in a UI skill, test fixtures, config with no standalone value) stay flat inside the item's folder. They are NOT sub-groups and have no tracker entries.

### Distinguishing Sub-Group from Internal Scaffolding

| Looks Like | Is a Sub-Group When... | Is Internal Scaffolding When... |
|---|---|---|
| `<item>/scripts/` | Each script has standalone functional value | Scripts only run as part of parent item's pipeline |
| `<item>/agents/` | Each agent is a complete contract (`AGENT.md` + capabilities) | Agents are private helpers inside parent system |
| `<item>/tests/` | Tests document a contract usable independently | Tests only validate the parent item |
| `<item>/references/` | References are reusable content (patterns) | References only document the parent item |

**When unclear → treat as internal scaffolding** (smaller footprint per P-LAW-009 anti-fragmentation).

---

## 3. The Cluster Intake Protocol (Chaos → Order)

When an inbox or gateway holds chaotic input — multiple folders with random unrelated files mixed with related sub-folders — the agent runs the **Cluster Intake Protocol** to organise it. This is the algorithmic core of categorisation.

### 3.1 Inputs That Trigger the Protocol

- Items in `entity-scaler-runtime/INBOX-inboxing/` (untyped, need classification first)
- Items in `entity-scaler-runtime/RESEARCH-researching/` (untyped, need classification first)
- Re-organisation of items already inside a pillar gateway when fragmentation is detected
- Pre-grouped folders dropped by the user inside a pillar gateway when the user's grouping fails the same-pillar / functional-coherence audit

### 3.2 The 6-Step Protocol

1. **Atomic read.** Read the full content of every file in the chaotic input — not just names. Names lie; content classifies.
2. **Functional cluster mining.** Group items by what they DO, not where they came from. Cross-folder clustering is mandatory: files in different source folders that share function MUST end up in the same destination group. Files in the same source folder with no functional relationship MUST be split apart.
3. **Pillar split** (only for `INBOX-inboxing/` and `RESEARCH-researching/`). Within each functional cluster, separate items by pillar. A cluster that spans pillars becomes 2–3 clusters, one per pillar. Apply DNA Preservation Tier 1 strict-preservation reasoning for Foundational_Integrity items.
4. **Strong-source-identity check.** For each cluster, run the §1.3 detection signature. If triggered, reject the cluster whole to `.complex_inboxes/<source-name>/`; do NOT split it across the substrate.
5. **Group naming.** Name each surviving cluster by its functional purpose. Verify against existing groups in the destination pillar gateway (sibling-respecting rule #6) — if a functional match exists, use that group instead of creating a new one.
6. **Atomic copy + tracker.** For each item in each cluster: ensure the group folder exists (lazy scaffolding), COPY the item, write the tracker entry (`INBOX-tracker.yaml` or `RESEARCH-tracker.yaml`). All three (folder + copy + tracker) succeed together or roll back per `Scaler-Operational-Rules.md` P-LAW-019.

### 3.3 Error Modes During Intake

| Failure | Action |
|---|---|
| Cluster genuinely ambiguous (could fit two pillars equally) | Apply tie-breaking §3.4; if still tied, post to board `review_queue` with `status: classification_undecided` |
| Cluster fails strong-source-identity but no clear `<source-name>` | Use dominant ecosystem signature as folder name; if none, post to `review_queue` with `status: source_identity_unclear` |
| Mid-protocol crash leaves group folder created but item not copied | P-LAW-019 rollback: remove empty group folder, restore item to inboxing/researching, no tracker entry |
| Cross-folder cluster spans 30+ items | Continue — large clusters are valid, they just generate Master + Sub-Runs later (§5) |

### 3.4 Tie-Breaking Order (When Multiple Integration Types Equally Plausible)

> Governs Phase 4 run drafting tie-breaks. Preserved verbatim from v1.

When two integration types still rank equal — typically `INJECT_INTO_EXISTING` vs `EXTEND_EXISTING_SYSTEM` for an existing pillar, or `EXTEND_EXISTING_SYSTEM` vs `BUILD_NEW_COMPONENT` when target proximity is borderline — apply this strict ordering:

1. **Specificity wins** — prefer the smallest-scope change that still delivers the discovery's value:
   - `INJECT_INTO_EXISTING` (smallest: appends inside existing file) >
   - `EXTEND_EXISTING_SYSTEM` (medium: adds sibling component to known system) >
   - `BUILD_NEW_COMPONENT` (largest: creates new system surface)
   The smaller the structural footprint, the lower the risk of architectural drift; choose smaller when in doubt.

2. **Recency wins** — if specificity ties, prefer the integration type whose target file (or sibling file in the target system) was most recently modified per `git log`. The recently-touched file is likely the active locus of related work; layering changes on cold targets risks creating parallel codepaths.

3. **Pending-merge wins** — before specificity/recency, if any pending run under the same target pillar already touches the target file or system, the resolution is `MERGE_WITH_PENDING` regardless of the original tie. This rule out-ranks (1) and (2).

4. **Human gate (last resort)** — if specificity AND recency tie AND no pending merge candidate exists, the Scaler MUST stop, post the tie in board `review_queue` with `status: TIE_PENDING_RESOLUTION`, and resume only after the user picks a type. Never coin-flip; never default-bias to one type silently.

5. **Document the resolution** — once the tie is broken (by any of rules 1–4), the chosen type's run MUST list the tie-break path in `execution_notes`, e.g., `"Tie between INJECT and EXTEND on target X — INJECT chosen by specificity (rule 1)"`. This produces an audit trail when later runs revisit the same target.

---

## 4. Inheritance from the Old 5 Boundary Signals

The old "5 Boundary Signals" (S1–S5) drove the D/SD/SSD depth decision. Under the Functional Group model, depth is no longer fixed, so the signals serve a different purpose: they help the agent **distinguish one analysable item from many** during step 2 of the Cluster Intake Protocol.

| Old Signal | Repurposed Role Under New Model |
|---|---|
| **S1 — Entry File** (`SKILL.md`, `AGENT.md`, root `.md`) | Marks a folder as one analysable item (a single thing the run will reason about). Doesn't mean "Discovery vs Sub-Discovery" anymore — just "this folder is one unit." |
| **S2 — Sub-folders** | Helps decide: are these sub-folders **internal scaffolding** of the parent item (stay flat) OR **sub-groups** of a larger functional cluster (get their own group folders)? |
| **S3 — Sibling Similarity** | All siblings sharing structural type → the parent is a **collection container**, not a single item. The collection contents go through Cluster Intake Protocol §3.2 step 2. |
| **S4 — Thematic Grouping** | Items related by source ecosystem → trigger §1.3 strong-source-identity check. If no rejection, items become one functional group. |
| **S5 — Functional Affinity** | Items related by what they DO → mandatory single functional group regardless of where they sourced from. The strongest signal under the new model. |

**Read all 5 together** — no single signal is conclusive alone. The signals are descriptive, not prescriptive: they describe what an agent observes; the Functional Group decision is what the agent does.

---

## 5. Hierarchical Run Modeling for Multi-Item Functional Groups

When a functional group is large or has nested sub-groups, drafting one monolithic run loses fidelity. Use the **Master + Sub-Runs** pattern — same idea as the old D/SD model, restated for the new vocabulary.

### 5.1 Analysis Phase (Top-Down Reading)

Process in strict order so the big picture is understood before details are run-carded:

1. **Step 1 — Read the Group**: Read the full structure of the functional group folder. Determine the overall system identity, resolved `integration_type`, and the high-level OS aspects it impacts.
2. **Step 2 — Read each Sub-Group**: For each sub-group folder (if any), read its unique value. Determine if it has a divergent type or aspect from the parent.
3. **Step 3 — Read deeper levels**: Continue recursing through any further sub-grouping. Stop when you hit individual items or internal scaffolding.

### 5.2 Run Phase (Hierarchical Modeling)

Once analysis is complete:

- **Master Run (Parent)**: Based on Step 1. Creates the high-level architectural overview and integration strategy for the entire group.
- **Sub-Runs (Children)**: Based on Steps 2–3. Created for each significant sub-group when the sub-group has its own divergent integration type or aspect.
  - **Linkage**: Sub-Runs MUST use the `parent_run_id` field in their run YAML to link back to the Master Run ID.

**When NOT to split**: a functional group with all-uniform items and one consistent integration type stays as one run. Splitting solely for size is a P-LAW-009 violation.

---

## 6. Processing Strategy Table

| Situation | Run Strategy |
|---|---|
| Several similar standalone files (e.g., 3 guidelines) | **Synthesis**: 1 functional group, 1 run for all files |
| Flat collection (e.g., a folder of agents) | **Cluster Intake**: 1 functional group with sub-groups per cluster; 1 run per cluster |
| Complex toolbox with multiple typed sub-folders | **Master + Sub-Runs**: 1 Master Run + 1 Sub-Run per significant sub-group |
| Massive collection (e.g., 100 skills) | **Cluster Intake**: identify lead technologies/topics into sub-groups; one run per sub-group; Master Run if whole collection has overarching integration logic |
| Coherent ecosystem bundle (>5 items, named source) | **Reject to `.complex_inboxes/`** per §1.3. No run until user triages. |
| Multi-pillar item | **Fan-out copies** per §1.2; each pillar produces its own run, linked by `multi_pillar_ref_id` in `execution_notes` |

---

## 7. The Two-Layered Organisation Protocol (P-LAW-013 Restated)

> `Scaler-Operational-Rules.md` P-LAW-013 defines the two organisational decisions. This section is the operational expansion. If P-LAW-013 and §7 ever disagree, the law in `Scaler-Operational-Rules.md` is canonical.

### 7.1 Layer 1 — Classification (Utility-First Routing)

**Used for**: untyped items in `entity-scaler-runtime/INBOX-inboxing/` or `RESEARCH-researching/`. (USER-SPACE content under `.complex_inboxes/` is OUT OF SCOPE per P-LAW-015 — exception only for the §1.3 write into `.complex_inboxes/`.)

**Algorithm:**
1. Read the item fully.
2. Run the strong-source-identity check (§1.3). If triggered, route to `.complex_inboxes/`.
3. Determine the item's `discovery_type` based on **Utility** (regardless of file format):
   - **Foundational_Integrity**: core OS systems (toolbox system, meta_identity, routers, milestones, pipelines, projects). System designs, structural blueprints, structural blueprints, routing schemes.
   - **Operational_Muscles**: anything that becomes a toolbox item (tools, scripts, agents, skills, automation engines).
   - **Value_Generation**: anything that makes money for our systems and architecture (monetization, strategy, business ideas).
4. Run the multi-pillar fan-out check (§1.2). If the item carries N orthogonal utilities, plan N copies.
5. **COPY** (single-utility or multi-utility) into the matching pillar's gateway subfolder (`INBOX-gateway/<Pillar>/` or `RESEARCH-gateway/<Pillar>/`). Source files in inboxing/researching are never moved.

### 7.2 Layer 2 — Categorisation (Functional Grouping)

**Used for**: items in gateway folders, items routed by Layer 1 into pillar gateways, or re-organisation inside an existing gateway.

**Zero Loose Files Law (P-LAW-014)**: Gateway pillar subfolders MUST NOT contain loose files at the hub root. Every item — regardless of count — lives in a functional group folder. A group can contain a single item.

**No-Inbox Processing Law (P-LAW-016)**: Items MUST be copied + grouped into their parent gateway pillar subfolder before any Phase 2–4 processing begins.

**Algorithm:**
1. Run the Cluster Intake Protocol (§3.2).
2. Log each routing decision in the relevant tracker (`INBOX-tracker.yaml` / `RESEARCH-tracker.yaml`) with `delivered_to[]` entries capturing pillar, gateway path, timestamp, and `extracted_concern`.

### 7.3 Lazy Group Scaffolding

The **3 pillar gateway subfolders** (`Foundational_Integrity/`, `Operational_Muscles/`, `Value_Generation/`) are core OS structure and exist eagerly — they MUST be scaffolded on workspace bootstrap (at least `.gitkeep`).

**Functional group folders inside those hubs**, however, are scaffolded **lazily** and only when an item routes there for the first time.

**Rules:**
1. **Hub-level eagerness**: the 3 pillar hubs always exist with at least a `.gitkeep`. They are never lazy.
2. **Group-level laziness**: a functional group folder (e.g., `Operational_Muscles/agent_personas/`, `Foundational_Integrity/coding_standards/`) is created **only at the moment the first item is routed into it** — not pre-created on bootstrap and not pre-created during the Cluster Intake audit.
3. **Atomic with routing**: the group folder creation is part of the same atomic operation as the first item's copy + tracker entry (per P-LAW-001 + P-LAW-019). A half-created group with no item is a rollback target.
3. **Empty-group pruning**: if a group folder ends up empty after item migrations or archivings, the next Audit Pass (`Scaler-Workflows.md §8`) flags it for removal. Empty group folders are NOT auto-deleted by the cascade engine; deletion flows through the standard gateway.
4. **Naming on creation**: the agent picks a group name that captures the **functional cluster**, not the source ecosystem (P-LAW-013 Layer 2). Bad: `karpathy_files/`. Good: `coding_standards/`. Source-named items would have triggered §1.3 rejection.
5. **Sibling-respecting**: before creating a new group, the agent MUST scan existing groups in the same hub for a functional match. Creating `coding_guidelines/` next to an existing `coding_standards/` is a fragmentation violation (P-LAW-009).

---

## 8. Tracker Entry Schema (INBOX-tracker.yaml / RESEARCH-tracker.yaml)

Per `Pipelines_Architecture.md §6`, both trackers follow the same schema:

```yaml
tracker:
  pipeline: scaler
  last_updated: timestamp
  total_items: integer
  items:
    "<item_name>":
      source_folder: INBOX-inboxing/ | RESEARCH-researching/
      delivered_to:              # Which gateway pillars received a copy
        - pillar: string
          gateway_path: string
          delivered_at: timestamp
          extracted_concern: string
      status: pending | delivered | processed
      processed_by_runs: [string]  # run_names that consumed this item
      action_gate_used: string
      focused_pillar: string
      focused_objective: all | Link | Fix | Enhance
      content_hash: string         # sha256 for anti-duplication
      multi_pillar_ref_id: string  # uuid (only for multi-pillar items)
      multi_pillar_siblings: [string]  # other pillar tracker entry IDs
```

**Migration from v2.2 → v3.0:**
- `discovery_level: D | SD | SSD` → REMOVED (replaced by gateway folder structure)
- `parent_discovery_id` → REMOVED (group hierarchy encoded in gateway path)
- `multi_pillar_ref_id`, `multi_pillar_siblings`, `extracted_concern` → NEW
- `rejected_to_complex_inboxes`, `rejection_reason` → NEW
- `content_hash` → made explicit (was implied; now part of schema for anti-dup)
- `source_folder` values updated to `INBOX-inboxing/` / `RESEARCH-researching/`

---

## 9. Gateway Delivery Rule (Phase 1 Mandatory)

**Before any planning runs are generated**, the agent MUST complete gateway delivery for ALL pending items in `INBOX-inboxing/` and `RESEARCH-researching/`:

1. Read tracker for items with `status: pending`
2. For each: classify (§7.1), categorise (§7.2), COPY to gateway pillar subfolder(s)
3. Update tracker `status: delivered` with `delivered_to[]` records
4. **Only after delivery is complete** — scan gateway pillar subfolders for unprocessed content to drive Phase 2 (Mapping & Tracking) and Phase 4 (Run creation)

> **Hard Rule (Pipelines_Architecture.md §8.8)**: Never generate runs directly from `INBOX-inboxing/` or `RESEARCH-researching/`. Runs are generated from gateway content only.

---

## 10. Anti-Reprocess and Match-to-Pending

### 10.1 Anti-Reprocess (Enforced by Tracker)

Every item carries a `content_hash` in its tracker entry. An item with a hash already logged in the destination pillar's tracker is **never reprocessed** — the delivery skips it. Renames and moves don't break dedup; the hash is the identity.

For multi-pillar items, anti-reprocess is **per-pillar**: the same hash can appear in 3 pillar tracker entries (one per copy), each with a different `extracted_concern`. Trying to add a 4th identical entry in a pillar already holding the hash is rejected.

### 10.2 Match-to-Pending (New, Enforces Non-Fragmentation Across Cycles)

When a NEW item is being analysed in Phase 2/4, before drafting a fresh run the agent checks **pending runs** (`status: PLANNING`) under the same pillar. If a match is found AND the run is **not yet integrated** (`status != completed/archived`), the new item folds into the existing run via `MERGE_WITH_PENDING` rather than spawning a new run.

**Matching Criteria** (in order — first match wins):
1. Same `target_files.path` in run's `target_files[]`
2. ≥50% overlap in `focused_pillars[]` / `aspects[]`
3. Functional similarity in the proposed change (toolbox call: keyword/embedding match)

**Re-audit on Merge** (LAW-005 / DNA Preservation enforcement):
- After folding, the merged run is re-audited under LAW-005.
- For **Foundational_Integrity** (Tier 1 strict): if the merged run now proposes anything that would replace existing DNA, **split the new item back out** and post both runs in board `review_queue` with `status: merge_violates_dna` for human resolution.
- For **Operational_Muscles / Value_Generation** (Tier 2 permissive): the merge proceeds; the merged run's `merge_history[]` records what was folded and when.

**No-touch rule for integrated runs**: if the matching pending run is already `completed` or `archived`, do NOT modify it. The new item starts a fresh run cycle (it can extend the integrated work via a new `INJECT` or `EXTEND` run per Phase 4 logic).

**`merge_history[]` Schema** (added to run YAML v2.0+):
```yaml
merge_history:
  - merged_at: <ISO timestamp>
    folded_item_name: <the new item's tracker key>
    folded_content_hash: <sha256>
    re_audit_outcome: clean | violations_resolved | violations_pending
    merge_notes: <one-line rationale>
```

---

## 11. Discovery Archiving Rule

A functional group (and items inside it) is archived once **Fully Assimilated**:

- **Definition of Fully Assimilated**: All runs derived from the group are marked `archived` (i.e., completed + user reviewed + archived). For multi-pillar items, all sibling copies' runs are also `archived`.
- **Action**: Move the group folder from the active gateway to `.archived_runs/<PROFILE>-archived_runs/EXTERNAL-discoveries-<pillar>-<group>.yaml` (or corresponding quarter-bucketed subfolder for multi-file groups).
- **Tracker Update**: Set `status: processed` for all items in the group; group folder removed from active gateway.

> **Update order mandatory**: Tracker written first → gateway folder moved after. Never reverse this.

For multi-pillar items, archiving is per-copy: each pillar's tracker entries are archived independently as that pillar's runs integrate. The `multi_pillar_ref_id` link survives archiving so a reviewer can still trace siblings across the archive.