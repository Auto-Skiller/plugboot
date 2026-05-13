# 🔍 Scaler Discovery Logic

## Objective
Define what constitutes an individual Discovery, a Sub-Discovery, and deeper levels — and how to process multi-depth discoveries before proposing. This is a mandatory reference for Phase 1 (Discovery) and Phase 2 (Mapping & Tracking) of every EXTERNAL Scaler execution cycle.

> **PREVENTION**: Never assume discovery boundaries from folder names or structure alone. Always scan and read actual content before classifying.

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

---

## 4. Clustering & Synthesis (The "Cluster-First" Rule)

When a folder contains many files (collections like `_agents`, `_commands`, `_skills`) or multiple similar standalone files (like `.md` guidelines), do NOT treat each file as a separate discovery.

### 4.1 Cluster-First Rule for Collections
For high-volume collection folders, the Scaler must first perform a **Clustering Audit**:
1.  **Prefix Clustering**: Group by naming patterns (e.g., all `instinct-*` commands = 1 Group).
2.  **Domain Clustering**: Group by functional domain (e.g., all `browserbase` skills = 1 Group).
3.  **Synthesis**: Multiple similar standalone files (e.g., `CLAUDE.md`, `SKILL.md`, `EXAMPLES.md`) MUST be synthesized into one single "Guideline Collection" discovery.

### 4.2 Minimum Cohesion Law
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

## 6. Processing Strategy Table (Updated)

| Situation | Proposal Strategy |
|---|---|
| Similar standalone files (e.g., 3 guidelines) | **Synthesis**: 1 Discovery, 1 Proposal for all files. |
| Flat collection (e.g., `_agents`) | **Cluster-First**: 1 Proposal per functional group (e.g., `gan_agents`). |
| Complex Toolbox (e.g., `ecc`) | **Hierarchy**: 1 Master Proposal + 1 Sub-Proposal per major SD folder (`agents/`, `skills/`). |
| Massive Collection (e.g., `_skills`) | **Cluster-First**: Identify lead technologies (e.g., `browserbase`) into their own Primary Groups/Proposals. |

---

## 6. .inbox/ Staging — Routing Logic

When an item is found in an `.inbox/` staging folder, apply this before anything else:

1. Read the item's contents/structure fully.
2. Apply the Decision Tree (Section 3) to classify it as D, SD, or part of a group.
3. Determine its `discovery_type` (`architecture` | `capabilitys` | `bussiness`).
4. Find or create the correct discovery folder inside the matching type folder.
5. Move the item there.
6. Log the routing in the relevant sub-ledger (`[type].ledger.yaml`) with `routed_from_random: true`.
7. Continue processing from the new location as a normal discovery.

> **If the item's type is ambiguous after reading**: place it in `.mixed/` (not in `.inbox/` — that's for unread items). Log it as `discovery_type: needs_review` and flag in CONTROLER.yaml for user clarification.

---

# 📋 Sub-Ledger Entry Schema (v2.1)
# - discovery_id: string        # e.g., DISC-MIXED-ECC
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

## 7. Sub-Ledger Tracking Rule During Discovery

Every discovery identified during Phase 1 or Phase 2 MUST be logged in the correct sub-ledger before any proposal is created:

| Discovery Level | Where to Log |
|---|---|
| D (parent discovery) | Sub-ledger (`[type].ledger.yaml`) **AND** master `EXTERNAL-LEDGER.yaml` `tracked_discoveries` |
| SD (sub-discovery) | Sub-ledger only |
| SSD and deeper | Sub-ledger only |

---

## 8. Discovery Archiving Rule

A Discovery (D) and its Sub-Discoveries (SDs) must be archived once they are **Fully Assimilated**:
- **Definition of Fully Assimilated**: All proposals, capability engineering tasks, and architectural changes derived from the discovery are marked `INTEGRATED`.
- **Action**: Move the discovery folder/files from the active type folder (e.g., `.mixed/`, `architecture/`) to `EXTERNAL/discoveries/_archive/`.
- **Ledger Update**: Set `discovery_status: ARCHIVED` in the relevant sub-ledger and move the entry to the `history` section.

> **Update order is mandatory**: Sub-ledger written first → master updated after. Never reverse this.

