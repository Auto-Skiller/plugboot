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

### 2.1 Input Modes (+ AUTO)
1. **INTERNAL**: Scan internal architectures and systems to identify systemic gaps and enhancement opportunities. Uses the `INTERNAL` profile settings for `target_pillars` and `action_gate`.
2. **EXTERNAL**: Scan external folders for new data. Uses the `EXTERNAL` profile settings for `target_pillars` and `action_gate`.
3. **AUTO**: System intelligently uses both INTERNAL and EXTERNAL based on state and availability. When in AUTO mode, the Scaler resolve the profile (`INTERNAL` or `EXTERNAL`) per operation based on the data source.

### Discovery Folder Structure
```
EXTERNAL/
├── _Foundational_Integrity/                 ← Core Pillar
│   ├── _Foundational_Integrity_inbox/       ← staging inbox for foundational-typed drops
│   ├── .Foundational_Integrity_proposals/   ← distributed gateway for Foundational proposals
│   ├── Foundational_Integrity.ledger.yaml   ← sub-ledger: tracks all Foundational discoveries
│   └── [actual discoveries]
├── _Operational_Muscles/                    ← Capability Pillar
│   ├── _Operational_Muscles_inbox/
│   ├── .Operational_Muscles_proposals/      ← distributed gateway for Capability proposals
│   ├── Operational_Muscles.ledger.yaml
│   └── [actual discoveries]
├── _Value_Generation/                       ← Business Pillar
│   ├── _Value_Generation_inbox/
│   ├── .Value_Generation_proposals/         ← distributed gateway for Business proposals
│   ├── Value_Generation.ledger.yaml
│   └── [actual discoveries]
├── complex_systems/                         ← Specialized Category
├── others/                            ← General Category
├── .mixed_inbox/                            ← untyped input; Scaler resolves type per-item
└── _mixed.ledger.yaml                        ← sub-ledger: tracks discoveries in EXTERNAL/ root
```

### Staging Folders (`_inbox/`) — User Drop Zones
Users have **2 valid drop paths**:
1. **Direct drop** — User places item in the correct pillar folder (e.g., `_Operational_Muscles/`) in the correct discovery location. Scaler picks it up immediately — no routing step needed.
2. **Staging drop** — User drops item in an `_inbox/` or `.mixed_inbox/`. Scaler scans it, applies Discovery Boundary Logic, determines which pillar folder it belongs to (or creates one), moves it there, then processes it normally.

> **Staging scan is Phase 1 priority**: Before processing any typed pillar folder, the Scaler MUST first check its corresponding `_inbox/` folder. Items in staging MUST be routed before the regular discovery scan begins.

### Distributed Tracking System
- **Sub-ledgers** (`[Pillar].ledger.yaml` in each pillar folder): Track full granular state for every discovery at all depths (D, SD, SSD, deeper) within that pillar folder.
- **Master EXTERNAL-LEDGER** (`scaler.tracker/EXTERNAL-LEDGER.yaml`): Aggregates counts from sub-ledgers + directly tracks D-level (parent) discoveries only. Does NOT duplicate sub-ledger detail.
- **Update order**: Sub-ledger MUST be updated first. Master is updated after, rolling up the new counts.

### Discovery Types & Target Pillars
The Scaler uses 3 discovery types for input classification and 3 matching target pillars for proposal/solution/gap folder routing. **If the global `target_pillar` is set to `AUTO`, the Scaler processes all three pillar roots in a single session. Note: Items already residing in a pillar root are never re-classified; only items in `.mixed_inbox/` undergo pillar resolution.**

| Type / Pillar | Discovery Definition (Foundational & Utility-First) | Target (.proposals/solutions/gaps/) |
|---|---|---|
| **Foundational_Integrity** | **Core Systems Utility.** Anything that helps, enhances, or defines our core architecture (routers, identity, mission board, pipelines, projects). Includes system designs, structural blueprints, routing schemes, and OS design docs. | Proposals that improve the foundational architecture or management systems of the OS. |
| **Operational_Muscles** | **Toolbox Utility.** Anything that can be placed in or converted into a toolbox item for the `.toolbox_library`. Includes tools, scripts, agents, skills, toolboxes, APIs, SDKs, and automation engines. | Proposals that expand the operational muscles and actionable toolsets of the agents. |
| **Value_Generation** | **Value Generation Utility.** Anything that can be used to make money for our systems and architecture (monetization, strategy, value generation). Includes market opportunities, product ideas, and revenue knowledge. | Proposals that drive financial growth, market value, or monetization strategies. |

### 2.4 Source-to-Aspect Alignment (System Matching)
Classification must align discovery sources with their relevant OS Pillars during Phase 3 System Matching:

| Source Hub | Valid Target Aspects (Pillars) |
|---|---|
| **Foundational_Integrity** | `routing_and_syncing`, `identity_rules`, `identity_architecture`, `identity_operational`, `mission_board`, `controller`, `pipeline_scaler`, `pipeline_hustler`. |
| **Operational_Muscles** | `identity_capabilities`, `core_toolbox`, `extended_toolbox_engineering`, `extended_toolbox_studio`, `extended_toolbox_life`, `extended_toolbox_business`. |
| **Value_Generation** | `extended_toolbox_business`, `identity_architecture` (if defining business structure). |

### 2.5 Conflict Resolution: The Evolution Law
When a discovery overlaps with an existing system:
- **Never Fully Replace**: Direct deletion or total replacement of existing operational logic is prohibited.
- **Evolve & Merge**: New discoveries must be merged, injected, or adapted to expand the existing system while preserving foundational logic.
- **Modernization**: Use the discovery to modernize the system, not to overwrite it.

### 2.3 Strategic Interrogation (The Smart Analytical Engine)
The Scaler identifies specific target files by performing a deep cross-reference of the workspace "Ground Truth" based on the Pillar (discovery source). It must follow the meta-routing chain and never guess paths.

- **Foundational_Integrity** (Goal: Stability): Consult `meta.router.yaml` and specialized pipeline routers in `.brain/meta.router/pipelines.router/`. Read relevant laws in `.brain/.identity/` and workflow logic in `runbooks/`.
- **Operational_Muscles** (Goal: Power): Consult `toolbox_library.router.yaml`. Read relevant `yaml_path` entries to see if discovery matches existing descriptions or triggers.
- **Value_Generation** (Goal: Growth): Applies BOTH Foundational and Operational scans with a **Value Generation Vision** (monetization logic or business strategy).

**MANDATORY:** Always perform a full read of target files to establish the "Base State" before drafting.

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

### 4.1 External Gateway → `EXTERNAL/[Pillar]/. [Pillar]_proposals/`
Used for: external direct integrations (moving skill folders, ready-to-use agents, external repos) and external inspirations (things taken from discoveries to add to or change existing files/architecture).

**Flow:**
1. Item is found in `EXTERNAL/_Foundational_Integrity/`, `_Operational_Muscles/`, or `_Value_Generation/`.
2. Scaler analyzes and drafts a **Proposal Card** in the relevant pillar's `. [Pillar]_proposals/` folder.
3. Proposal Card must contain:
   - `source`: origin file or folder in discoveries.
   - `primary_aspect`: the main aspect that determined the classification.
   - `aspects`: list of ALL aspects this discovery enhances (must include `primary_aspect`).
   - `output_level`: resolved pillar — `Foundational_Integrity` | `Operational_Muscles` | `Value_Generation` (NEVER `auto`).
   - `integration_type`: `INJECT_INTO_EXISTING` | `REPLACE_OR_UPGRADE` | `BUILD_NEW_COMPONENT` | `EXTEND_EXISTING_SYSTEM` | `RESTRUCTURE_ARCHITECTURE` | `MIGRATE_AND_REPOSITION` | `MERGE_WITH_PENDING`.
   - `description`: what will be done and why.
   - `files_involved`: list of all files/folders that will move or change.
   - `user_decision`: field for user to fill — `APPROVED` | `REJECTED` | `NOTES: [user text]`.
4. If `NOTES` found → apply notes, update proposal, then re-request approval.
5. If `APPROVED` → proceed to integration.

### 4.2 Internal Gateway → `INTERNAL/[Pillar]/`
Used for: internal gaps, proposed changes to existing files, plans to audit or restructure existing architecture.

**Flow:**
1. Gap or opportunity is identified during internal audit.
2. Scaler drafts an **Internal Action Card** (Mega-YAML) in `INTERNAL/[target_pillar]/MEGA-INT-[ID].yaml`.
3. The Action Card must contain:
   - `schema_version`: `"4.0"`
   - `action_id`: unique ID (e.g., MEGA-INT-[ID])
   - `primary_aspect`: the main aspect this action touches.
   - `aspects`: list of ALL aspects this solution touches (must include `primary_aspect`).
   - `target_pillar`: resolved pillar — `Foundational_Integrity` | `Operational_Muscles` | `Value_Generation`.
   - `gap` block: contains `gap_id` and `description`.
   - `solution` block: contains `solution_id`, `change_type`, `integration_strategy`, and `files_involved`.
   - `user_decision`: field for user to fill — `APPROVED` | `REJECTED` | `NOTES: [user text]`.
4. If `NOTES` found → apply notes, update the mega card, then re-request approval.
5. If `APPROVED` → proceed to integration.

---

## 5. Granular Action Gate Behavior

The `action_gate` in `CONTROLER.yaml` is controlled via **Profiles** (`INTERNAL` | `EXTERNAL`). Each profile contains lists that define how the Scaler behaves per `Integration_Type`:

| Behavior | Description |
|---|---|
| **EXECUTION** | If the `integration_type` is found in the `EXECUTION` list of the active profile, the Scaler **directly integrates** it without requesting human approval. The gateway folder is the only checkpoint. |
| **PLANNING** | If the `integration_type` is found in the `PLANNING` list, it **stays in the folder**. The Scaler posts a review request in the `CONTROLER.yaml`. Integration only happens after explicit user approval. |

**Selection Logic:**
- The Scaler determines the source of the operation (`INTERNAL` or `EXTERNAL`).
- It loads the corresponding profile from `CONTROLER.yaml`.
- It checks if the resolved `integration_type` is present in the `EXECUTION` or `PLANNING` list.
- **MANDATORY**: If a type is missing from BOTH lists, the Scaler MUST default to **PLANNING** for safety.

> **Note**: In EXECUTION mode, the Scaler auto-sets `user_decision: APPROVED` in the card file after self-review. In PLANNING mode, the field must be filled by the user.
