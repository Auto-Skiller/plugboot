# 🏗️ Scaler Architecture

## Objective
Systemic Metabolism. The Scaler pipeline is the **Systemic Growth Engine** of the Agentic OS. Its mission is the continuous evaluation, enhancement, and extension of the workspace scopes. It utilizes a **5-Phase Execution Approach** (Discovery -> Mapping & Tracking -> Capability Engineering -> Architecting & Proposing -> Integration) to identify gaps or ingest external data, map and track them, engineer capabilities, architect proposals, and integrate permanent solutions across the entire architecture.

---

## 1. Pipeline Execution Layers
The Scaler pipeline execution strictly utilizes the global "Always-On" top-layer alongside localized pipeline layers:

### Global Always-On Layers (Must always be used for EVERY task)
- `.identity/`: Core identity, routing rules, and execution flow.
- `meta.router/` & `meta.router.yaml`: Central nervous system maps. All execution paths start here.
- `CONTROLER.yaml`: High-level configuration, scope modes, and session tracking.
- `.mission_board/[execution session]`: Active goal tracking via the Persistent Execution Sessions (e.g., `SES-EXECUTION-SCALER`).
- `scaler.router`: The localized index, mapping everything inside `.scaler.meta/`. Acts as the absolute pathfinder for the pipeline.
- `.toolbox_library/`: Core agentic and extended capabilities. **Toolboxes must be strictly used via meta routing during every single action in the pipeline execution (e.g., using specific tools for analytics, planning, drafting).**

### Localized Pipeline Layers (Mapped via meta.router)
- `scaler.runbook/`: The operational rules and workflows for scaling that need to be strictly read before any scaler execution (similar to `.identity/`).
- `scaler.scratch/`: Operational scripts and automation engines for the scaler. Not for drafting proposals or processing data.
- `scaler.tracker/`: Deep, granular tracking of every file, gap, and proposal processed during pipeline execution (similar to `meta.router/` mappings and `.mission_board/` trackers).

---

## 2. Inputs (Modes), Discovery Structure & Outputs (Levels)
Controlled via `CONTROLER.yaml` configuration.

### 2 Input Modes (+ AUTO)
1. **INTERNAL**: Scan internal architectures and systems to identify systemic gaps and enhancement opportunities. Propose permanent solutions.
2. **EXTERNAL**: Scan external folders for new data. Draft proposals based on external discoveries.
3. **AUTO**: System intelligently uses both INTERNAL and EXTERNAL based on state and availability.

### Discovery Folder Structure
```
EXTERNAL/discoveries/
├── .mixed/                      ← untyped input; Scaler resolves type per-item
│   ├── .inbox/                  ← staging inbox: user drops anything unclassified
│   ├── mixed.ledger.yaml        ← sub-ledger: tracks all .mixed/ discoveries (D+SD+SSD)
│   └── [actual discoveries]
├── architecture/
│   ├── .inbox/                  ← staging inbox for architecture-typed drops
│   ├── architecture.ledger.yaml
│   └── [actual discoveries]
├── capabilitys/
│   ├── .inbox/
│   ├── capabilitys.ledger.yaml
│   └── [actual discoveries]
└── bussiness/
    ├── .inbox/
    ├── bussiness.ledger.yaml
    └── [actual discoveries]
```

### Staging Folders (`.inbox/`) — User Drop Zones
Users have **2 valid drop paths**:
1. **Direct drop** — User places item in the correct type folder (e.g., `capabilitys/`) in the correct discovery location. Scaler picks it up immediately — no routing step needed.
2. **Staging drop** — User drops item in `.inbox/`. Scaler scans it, applies Discovery Boundary Logic, determines which discovery folder it belongs to (or creates one), moves it there, then processes it normally.

> **Staging scan is Phase 1 priority**: Before processing any typed discovery folder, the Scaler MUST first check its corresponding `.inbox/` folder. Items in staging MUST be routed before the regular discovery scan begins.

### Distributed Tracking System
- **Sub-ledgers** (`[type].ledger.yaml` in each discovery folder): Track full granular state for every discovery at all depths (D, SD, SSD, deeper) within that type folder.
- **Master EXTERNAL-LEDGER** (`scaler.tracker/EXTERNAL-LEDGER.yaml`): Aggregates counts from sub-ledgers + directly tracks D-level (parent) discoveries only. Does NOT duplicate sub-ledger detail.
- **Update order**: Sub-ledger MUST be updated first. Master is updated after, rolling up the new counts.

### Discovery Types & Output Levels
The Scaler uses 3 discovery types for input classification and 3 matching output levels for proposal/solution/gap folder routing. **They are the same 3 names — the output level always mirrors the resolved discovery type.**

| Type / Level | Input (discoveries/) | Output (proposals/solutions/gaps/) |
|---|---|---|
| **architecture** | System designs, structural blueprints, routing schemes, OS design docs | Proposals that enhance or restructure systems, routing, syncing, or structural organization |
| **capabilitys** | Tools, scripts, agents, skills, toolboxes, APIs, SDKs, automation engines | Proposals that add or upgrade tools, agents, skills, or operational muscles |
| **bussiness** | Market opportunities, monetization strategies, product ideas, revenue knowledge | Proposals that generate revenue, add hustler operations, or audit money-making systems |

> **`.mixed` Rule**: `MIXED` or `AUTO` is only a valid value in `CONTROLER.yaml → output_level` as a trigger meaning "process all types from `.mixed/` discoveries". It is NEVER a valid `output_level` on any card (proposal, solution, or gap). Each `.mixed/` item must be individually analysed and its `output_level` resolved to `architecture`, `capabilitys`, or `bussiness` before a card is created. If an item qualifies for multiple types, a **separate card is generated for each qualifying type**.

---

## 3. The Aspects of open-workspace
Any identified gap, discovery, proposal, or solution maps to one or more of these 14 granular aspects. A single discovery MUST be linked to ALL relevant aspects — do not limit to one if multiple apply.

| Aspect ID | What It Targets | Key Paths |
|---|---|---|
| `routing_and_syncing` | Master router, sync engine scripts, auto-generated router YAMLs | `.brain/meta.router.yaml`, `.brain/meta.router/`, `.brain/meta.router/.sync_engine/` |
| `identity_rules` | OS behavioral laws, modes, decision-making, communication style, personas | `.brain/.identity/Modes.md`, `Decision_Making.md`, `Rules_And_Considerations.md`, `Communication_Style.md`, `Persona.md` |
| `identity_architecture` | OS structural docs, naming conventions, architecture diagrams, hierarchy definitions | `.brain/.identity/Core_Architecture.md`, `Hierarchy.md`, `Naming-Conventions.md`, `Orchestration_And_Flow.md` |
| `identity_capabilities` | Agent behavioral guides, coding guidelines, skill contracts, Python standards, quick-start refs | `.brain/.identity/Core_Capabilities.md`, `Quick_Start.md`, `python_integration_standard.md`, `orchestrator.engine.md` |
| `identity_operational` | Controller guide, session template, pipeline-aware operational guides | `.brain/.identity/Controler_Guide.md`, `Session_Template.md` |
| `core_toolbox` | Core cognitive loop toolboxes: analysis, research, planning, brainstorming, benchmarking, documentation, evaluation, notebooklm | `.brain/.toolbox_library/core.toolbox/` |
| `extended_toolbox_business` | Business domain toolboxes (selling, acquisition, monetization tools) | `.brain/.toolbox_library/extended.toolbox/business.toolbox/` |
| `extended_toolbox_engineering` | Engineering domain toolboxes (coding, devops, automation) | `.brain/.toolbox_library/extended.toolbox/engineering.toolbox/` |
| `extended_toolbox_life` | Life domain toolboxes | `.brain/.toolbox_library/extended.toolbox/life.toolbox/` |
| `extended_toolbox_studio` | Studio/creative domain toolboxes | `.brain/.toolbox_library/extended.toolbox/studio.toolbox/` |
| `mission_board` | Session and goal tracking files, runtime state | `.runtime/.mission_board/` |
| `controller` | CONTROLER.yaml structure, review queue, session management schema | `CONTROLER.yaml` |
| `pipeline_scaler` | Scaler runbooks, tracker, gateway schemas, operational rules | `pipelines/scaler/`, `.scaler.meta/` |
| `pipeline_hustler` | Hustler runbooks, tracker, operational knowledge, business execution | `pipelines/hustler/`, `.hustler.meta/` |

### Multi-Aspect Rule
**A discovery or gap MUST be linked to every aspect it genuinely enhances or extends.** Do not artificially limit to one aspect. A card has a `primary_aspect` (which determines its gateway folder location) and an `aspects` list (all applicable aspects including the primary). Both fields are mandatory.

*Example: A new sync protocol discovery touches `routing_and_syncing` (structural change to sync engine) AND `pipeline_scaler` (the scaler's own operational rules reference it). Both aspects must be listed.*

> **SCOPE CREATION LAW**: The Scaler MUST NOT create new scopes (aspects) autonomously. If a discovery or gap analysis reveals that a new scope is needed, the Scaler MUST suggest it in the `CONTROLER.yaml → system_status.scope_suggestions[]` block and await explicit user approval before creating or naming a new scope. This law holds regardless of the active `action_gate` mode.

---

## 4. The Proposals & Solutions Gateway (MANDATORY)

**Every single output of the Scaler — without exception — MUST pass through the gateway folders before being integrated into any target scope.** There is no direct path from discovery/analysis to integration. The gateway is the mandatory checkpoint.

### 4.1 External Gateway → `EXTERNAL/proposals/`
Used for: external direct integrations (moving skill folders, ready-to-use agents, external repos) and external inspirations (things taken from discoveries to add to or change existing files/architecture).

**Flow:**
1. Item is found in `EXTERNAL/discoveries/`.
2. Scaler analyzes and drafts a **Proposal Card** in `EXTERNAL/proposals/[aspect]/[level]/`.
3. Proposal Card must contain:
   - `source`: origin file or folder in discoveries.
   - `primary_aspect`: the main aspect that determines the gateway folder location.
   - `aspects`: list of ALL aspects this discovery enhances (must include `primary_aspect`).
   - `output_level`: resolved discovery type — `architecture` | `capabilitys` | `bussiness` (NEVER `auto`).
   - `integration_type`: `INJECT_INTO_EXISTING` | `REPLACE_OR_UPGRADE` | `BUILD_NEW_COMPONENT` | `EXTEND_EXISTING_SYSTEM` | `RESTRUCTURE_ARCHITECTURE` | `MIGRATE_AND_REPOSITION` | `MERGE_WITH_PENDING`.
   - `description`: what will be done and why.
   - `files_involved`: list of all files/folders that will move or change.
   - `user_decision`: field for user to fill — `APPROVED` | `REJECTED` | `NOTES: [user text]`.
4. If `NOTES` found → apply notes, update proposal, then re-request approval.
5. If `APPROVED` → proceed to integration.

### 4.2 Internal Gateway → `INTERNAL/solutions/`
Used for: internal gaps, proposed changes to existing files, plans to audit or restructure existing architecture.

**Flow:**
1. Gap or opportunity is identified during internal audit.
2. Scaler drafts a **Solution Card** in `INTERNAL/solutions/[aspect]/[level]/`.
3. Solution Card must contain:
   - `gap_ref`: reference to the gap report in `INTERNAL/gaps/`.
   - `primary_aspect`: the main aspect that determines the gateway folder location.
   - `aspects`: list of ALL aspects this solution touches (must include `primary_aspect`).
   - `output_level`: resolved level — `architecture` | `capabilitys` | `bussiness`.
   - `change_type`: `PATCH_FILE` | `ENRICH_FILE` | `REPLACE_SCHEMA` | `RESTRUCTURE_SYSTEM` | `CREATE_MISSING_COMPONENT` | `AUDIT_AND_REMEDIATE`.
   - `description`: what will be changed and why.
   - `files_involved`: list of all files that will be modified or created.
   - `user_decision`: field for user to fill — `APPROVED` | `REJECTED` | `NOTES: [user text]`.
4. If `NOTES` found → apply notes, update solution, then re-request approval.
5. If `APPROVED` → proceed to integration.

---

## 5. Planning vs. Execution Mode Behavior

The `action_gate` in `CONTROLER.yaml` controls how the Scaler behaves **after a proposal or solution passes through the gateway**:

| action_gate | Behavior |
|---|---|
| **EXECUTION** | After a proposal/solution is drafted in its gateway folder, the Scaler **directly integrates** it without requesting additional human approval. The gateway folder is the only checkpoint. |
| **PLANNING** | After a proposal/solution is drafted in its gateway folder, it **stays in the folder**. The Scaler posts a review request in the `CONTROLER.yaml` communication block. Integration only happens after explicit user approval. |

> **Note**: In ALL modes, the `user_decision` field in every Proposal/Solution Card must be present. In EXECUTION mode, the Scaler may auto-set it to `APPROVED` after self-review. In PLANNING mode, the field must be filled by the user.

