# 🔍 Scaler Discovery Logic

## Objective
Define what constitutes an individual Discovery, a Sub-Discovery, and deeper levels — and how to process multi-depth discoveries before proposing. This is a mandatory reference for Phase 1 (Discovery) and Phase 2 (Mapping & Tracking) of every EXTERNAL Scaler execution cycle.

---

## 1. The 4 Boundary Signals

Apply these 4 signals to any folder or file to determine if it IS a discovery or CONTAINS discoveries. Read all 4 together — no single signal is conclusive alone.

| Signal | What to Look For | What It Means |
|---|---|---|
| **S1 — Entry File** | A primary contract file exists directly inside the folder: `SKILL.md`, `AGENT.md`, `README.md`, or a named root `.md` file | ✅ This folder IS a self-contained discovery unit — **but always check siblings before deciding if it stands alone or belongs to a grouped discovery** |
| **S2 — Sub-folders** | Subfolders exist inside a folder (e.g., `scripts/`, `references/`, `agents/`, `tests/`) | ⚠️ **Always check before assuming internal.** Read the sub-folder contents — it may be a support component (internal part of the discovery) OR a discovery collection of its own. Never classify based on name alone. |
| **S3 — Sibling Similarity** | All direct children of a folder share the same structural type (e.g., all are folders each with their own `SKILL.md`, or all are `.md` agent files at the same level) | 🔁 Each sibling is its own **Discovery or Sub-Discovery** — the parent is a **collection container**, not a discovery itself |
| **S4 — Thematic Grouping** | Items are clearly related: same source ecosystem, same tool, same author, same functional domain — even if structurally separate | 🔗 The group is **one Discovery** with **Sub-Discoveries** — analyse the parent/group first, then each member individually |
| **S5 — Functional Affinity** | Multiple items (files or folders) share a specific functional goal (e.g., "Browser Automation", "Coding Standards", "GAN logic") | 🎯 These **MUST** be treated as a single Discovery unit, regardless of structural separation. |

---

## 2. Discovery Depth Model

```
Discovery (D)
  └── Sub-Discovery (SD)
        └── Sub-Sub-Discovery (SSD)
              └── [further depth — always scan, never assume a cap]
```

**There is NO fixed maximum depth.** A discovery can be 1 level or 5+ levels deep.
At every level, scan the actual contents before deciding whether to go deeper or treat the remaining content as internal scaffolding (support files that are part of the parent, not separate discoveries).

### What Makes Content "Internal Scaffolding" vs. a Deeper Discovery
- **Internal scaffolding**: files/folders that only make sense as support for the parent (e.g., font files inside a design skill, test files inside a scripts folder, config files with no standalone value). These are NOT discoveries.
- **Deeper discovery**: a sub-folder that has its own contract file (`SKILL.md`, `AGENT.md`), its own functional identity, or its own collection of items — even inside an already-classified discovery. Scan it before deciding.

---

## 3. Discovery Boundary Decision Tree

For every folder or file encountered during Phase 1 scan:

```
Is this a single .md or .yaml file?
│
├── YES → It IS a Discovery unit (or Sub-Discovery).
│         Apply S4: check if it belongs to a thematic group with siblings.
│         If yes → it is an SD within a grouped D.
│         If no → it is a standalone D.
│
└── NO → It's a folder. Continue:
    │
    ├── Does it contain an entry file (SKILL.md / AGENT.md / root .md)? [S1]
    │   ├── YES → This folder IS a self-contained discovery unit.
    │   │         Check its sub-folders [S2]: read each one.
    │   │         If a sub-folder has its own entry file or collection → it is an SD (not internal).
    │   │         If a sub-folder is pure support (fonts, tests, config) → it is internal scaffolding.
    │   │         Check siblings [S3 + S4]: is this folder part of a grouped discovery?
    │   │
    │   └── NO → Continue:
    │
    ├── Do ALL direct children share the same structural type? [S3]
    │   ├── YES → This folder is a COLLECTION CONTAINER.
    │   │         It is NOT a discovery. Each child is a Discovery or Sub-Discovery.
    │   │
    │   └── NO → Continue:
    │
    ├── Are the children a mix of typed sub-collections (agents/, skills/, commands/, etc.)? [S2 + S4]
    │   ├── YES → This folder IS a Discovery (a toolbox or system).
    │   │         Each typed sub-collection is an SD.
    │   │         Items inside each sub-collection are SSDs (scan to verify depth).
    │   │
    │   └── NO → Flag for manual review. Post in CONTROLER.yaml scaler_review_queue.
```

### 3.2 Selection Criteria (The "Why")
When comparing Target (Ground Truth) vs. Source (Discovery), use these criteria to resolve the `Integration_Type`:

| Integration Type | Selection Criteria (The "Why") | Rule (The Law) | Workflow (The Path) |
| :--- | :--- | :--- | :--- |
| **INJECT** | Target exists and is missing specific logic found in source. | **Logic Preservation:** Never overwrite; append/prepend only. | 1. Find Injection Points → 2. Apply Enrichment → 3. Verify Sync. |
| **UPGRADE** | Target exists but source logic is technically superior/more modern. | **DNA Preservation:** Merge superior logic; preserve foundational OS DNA. | 1. Create Bridge → 2. Execute Swap → 3. Archive Old. |
| **BUILD_NEW** | No matching target exists in the interrogated Pillar. | **Registry Compliance:** Must be registered in Correct Routers. | 1. Define Structure → 2. Create Files → 3. Register in `.meta_brain/` routers. |
| **EXTEND** | Target exists but source provides a new sibling component/feature. | **Cohesive Expansion:** Use inheritance/extension patterns. | 1. Map Extension Points → 2. Build Sub-Component → 3. Update Docs. |

---

### 3.3 The Laws of DNA Preservation (UPGRADE Protocol)
When performing an **UPGRADE**, these laws are non-negotiable to prevent DNA corruption:

1.  **Parity Audit**: Before deprecating old logic, you MUST audit its full functionality. The new logic MUST cover 100% of the old use cases unless explicitly authorized to drop them.
2.  **Modular Merging**: Prefer merging superior functions into the existing structure over total file replacement. If the structure changes, the core logic "DNA" must be migrated to the new schema.
3.  **Deprecation Bridge**: Old logic is moved to `_archive/` or marked `@deprecated` but never deleted until the new system is verified in 3+ successful missions.
4.  **No Logic Loss**: If the source discovery is missing a feature present in the target, that feature MUST be ported over to the "upgraded" version. Total replacement with an inferior feature-set is a protocol violation.

## 4. Clustering & Synthesis (The "Cluster-First" Rule)

When a folder contains many files (collections like `_agents`, `_commands`, `_skills`) or multiple similar standalone files (like `.md` guidelines), do NOT treat each file as a separate discovery.

### 4.1 Cluster-First Rule for Collections
For high-volume collection folders (including staging inboxes), the Scaler must first perform a **Clustering Audit**:
1.  **Prefix Clustering**: Group by naming patterns (e.g., all `instinct-*` commands = 1 Group).
2.  **Functional Classification**: Read the content of every item and classify it into the correct logical group (e.g., all "Browser Automation" items).
3.  **Domain Hub Match**: Search across ALL existing Domain Hubs for a match. If a matching Hub exists, the item MUST be routed there. 
4.  **Hub Creation**: Add a new Domain Hub ONLY if no functional matches exist across all existing domains in the discovery set.
5.  **Synthesis**: Multiple similar standalone files (e.g., `CLAUDE.md`, `SKILL.md`, `EXAMPLES.md`) MUST be synthesized into one single "Guideline Collection" discovery.

### 4.2 The Top-Level Residency Law
Everything sourced from `_SCALER-EXTERNAL_SOURCES/.scaler_mixed_inbox/` MUST be organized into one of the 3 typed discovery hubs. There is no general "category" outlet — items that don't cleanly fit a pillar must still be assigned to the closest pillar hub (use a "miscellaneous" sub-group if needed). User-space content (`_SCALER-EXTERNAL_SOURCES/.scaler_USER-SPACE/`) is OUT OF SCOPE for routing — never push items into it. Valid routing destinations from `.scaler_mixed_inbox/`:
- `_SCALER-EXTERNAL_SOURCES/Foundational_Integrity_discoveries/`
- `_SCALER-EXTERNAL_SOURCES/Operational_Muscles_discoveries/`
- `_SCALER-EXTERNAL_SOURCES/Value_Generation_discoveries/`
Any item routed from `.scaler_mixed_inbox/` MUST be placed in its corresponding typed discovery hub.

### 4.3 Minimum Cohesion Law
One proposal per logical cluster. A proposal should represent a coherent, actionable unit of value. Single-file proposals are only permitted if the file is truly unique and has zero functional affinity with any other item in the discovery set.

---

## 5. Analysis & Proposal Model for Multi-Depth Discoveries

When a Discovery has deep recursive Sub-Discoveries (e.g., a complex toolbox like `ecc/` with its own `agents/`, `commands/`, and `skills/`), follow this strict top-down analysis and proposal sequence:

### 5.1 Analysis Phase (Top-Down Reading)
Process in strict order to ensure the big picture is understood before the details are carded:

1.  **Step 1 — Read the Discovery (D level)**: Read the parent's full structure. Determine the overall system identity, resolved `discovery_type`, and the high-level OS aspects it impacts.
2.  **Step 2 — Read each Sub-Discovery (SD level)**: For each major sub-folder (e.g., `agents/`, `skills/`), read its unique value. Determine if it has a divergent type or aspect from the parent.
3.  **Step 3 — Read deeper levels (SSD, etc.)**: Scan to confirm content is functional or internal scaffolding. Stop recursing once internal scaffolding is reached.

### 5.2 Proposal Phase (Hierarchical Modeling)
Once analysis is complete, generate the card hierarchy:

*   **Master Proposal (Parent)**: Based on **Step 1**. Creates the high-level architectural overview and integration strategy for the entire tool/system.
*   **Sub-Proposals (Children)**: Based on **Step 2 & 3**. Created for each significant functional Sub-Discovery (e.g., `ecc/agents/`).
    *   **Linkage**: MUST use the `parent_proposal_id` field to link back to the Master Proposal ID.

---

## 6. Processing Strategy Table

| Situation | Proposal Strategy |
|---|---|
| Similar standalone files (e.g., 3 guidelines) | **Synthesis**: 1 Discovery, 1 Proposal for all files. |
| Flat collection (e.g., `_agents`) | **Cluster-First**: 1 Proposal per functional group (e.g., `gan_agents`). |
| Complex Toolbox (e.g., `ecc`) | **Hierarchy**: 1 Master Proposal + 1 Sub-Proposal per major SD folder (`agents/`, `skills/`). |
| Massive Collection (e.g., `_skills`) | **Cluster-First**: Identify lead technologies (e.g., `browserbase`) into their own Primary Groups/Proposals. |

---

## 7. The Two-Layered Organization Protocol

Classification and organization follow a strict two-layered metabolic process.

### Layer 1: Utility-First Routing (The Classification)
Used when moving items from the **`_SCALER-EXTERNAL_SOURCES/.scaler_mixed_inbox/`** into the 3 typed discovery hubs. (User-space content under `_SCALER-EXTERNAL_SOURCES/.scaler_USER-SPACE/` is OUT OF SCOPE per P-LAW-015 and never participates in routing.)
1. Read the item fully.
2. Determine its `discovery_type` based on **Utility** (Regardless of whether it is a skill, agent, script, or image):
   - **Foundational_Integrity**: Anything related to core OS systems (toolboxes system, meta_identity, routers, milestones, pipelines, projects). This includes structural blueprints, system designs, and routing schemes.
   - **Operational_Muscles**: Anything that can be placed or converted into a toolbox item for the `.meta_brain/toolboxes/`. This includes tools, scripts, agents, skills, and automation engines.
   - **Value_Generation**: Anything that can make money for our systems and architecture (monetization, strategy, value generation).
3. **MOVE** to the matching `_SCALER-EXTERNAL_SOURCES/[Pillar]_discoveries/` hub.

### Layer 2: Relevance-First Grouping (The Organization)
Used for grouping items **from typed inboxes** (`_SCALER-EXTERNAL_SOURCES/_[Pillar]_inbox/`) into the matching `_SCALER-EXTERNAL_SOURCES/[Pillar]_discoveries/` hub, or for re-grouping items **within** a discovery hub.
- **Zero Loose Files Law**: Discovery hubs MUST NOT contain any loose files at the hub root.
- Every single discovery item — regardless of count — MUST be grouped into a **Functional Relevance** folder (e.g., "System Reviewers", "UI/UX", "Market Strategy"). A folder can contain a single item.
- **No-Inbox Law**: Items MUST be moved and grouped into their parent discovery hub before any formal Phase 2-4 processing begins. Processing directly from an inbox is prohibited.
- Log the routing in the relevant `[Pillar].sources_ledger.yaml` with `routed_from_random: true`.

> **Note**: Staging inboxes MUST be cleared and items moved into their parent typed discovery hubs before Phase 2 Mapping & Tracking is considered complete.

---

# 📋 Sub-Ledger Entry Schema (v2.2)
# - discovery_id: string        # e.g., DISC-FOUND-ECC
#   discovery_status: string    # PENDING | ARCHIVED
#   source_path: string         # path relative to workspace root
#   discovery_level: string     # D | SD | SSD
#   parent_discovery_id: string # parent id or ''
#   routed_from_random: bool
#   discovery_type: string
#   primary_aspect: string
#   aspects: [string]
#   proposal_ids: [string]      # List of all proposals generated from this discovery
#   integration_status: string  # PENDING | INTEGRATED | REJECTED
#   ... (rest of fields)

## 8. Sub-Ledger Tracking Rule During Discovery

Every discovery identified during Phase 1 or Phase 2 MUST be logged in the correct sub-ledger before any proposal is created:

| Discovery Level | Where to Log |
|---|---|
| D (parent discovery) | Pillar `[Pillar].sources_ledger.yaml.tracked_discoveries[]` (auto-aggregated into the `.scaler_routing/scaler_ledgers.yaml` rollup by sync) |
| SD (sub-discovery) | Pillar `[Pillar].sources_ledger.yaml` only |
| SSD and deeper | Pillar `[Pillar].sources_ledger.yaml` only |

---

## 9. Discovery Archiving Rule

A Discovery (D) and its Sub-Discoveries (SDs) must be archived once they are **Fully Assimilated**:
- **Definition of Fully Assimilated**: All proposals, capability engineering tasks, and architectural changes derived from the discovery are marked `INTEGRATED`.
- **Action**: Move the discovery folder/files from the active pillar folder (e.g., `_Foundational_Integrity/`, `_Operational_Muscles/`) to `.scaler_runtime/.scaler_archive/YYYY-QQ/EXTERNAL-discoveries-[name].yaml` (or a corresponding quarter-bucketed subfolder for multi-file discoveries).
- **Ledger Update**: Set `discovery_status: ARCHIVED` in the relevant sub-ledger and move the entry to the `history` section.
> **Update order is mandatory**: Sub-ledger written first → master updated after. Never reverse this.

