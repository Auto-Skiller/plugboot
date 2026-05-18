# 🏗️ Scaler Architecture

## Objective
Systemic Metabolism. The Scaler pipeline is the **Systemic Growth Engine** of the Agentic OS. Its mission is the continuous evaluation, enhancement, and extension of the workspace scopes. It utilizes a **5-Phase Execution Approach** (Discovery -> Mapping & Tracking -> Capability Engineering -> Architecting & Proposing -> Integration) to identify gaps or ingest external data, map and track them, engineer capabilities, architect proposals, and integrate permanent solutions across the entire architecture.

---

## 1. Pipeline Execution Layers
The Scaler pipeline execution strictly utilizes the global "Always-On" top-layer alongside localized pipeline layers:

### Global Always-On Layers (Must always be used for EVERY task)
- `meta_identity/`: Core identity, routing rules, and execution flow (located in `.meta_brain/meta_identity/`).
- `meta_router.yaml`: Central nervous system maps. All execution paths start here.
- `CONTROLER.yaml`: High-level configuration, scope modes, and session tracking.
- `.meta_brain/milestones/`: Active session and goal operation tracking.
- `scaler_router.yaml`: The localized index inside `.scaler_brain/`. Acts as the absolute pathfinder for the pipeline.
- `.meta_brain/toolboxes/`: Core agentic and extended capabilities. **Toolboxes must be strictly used via meta routing during every single action in the pipeline execution (e.g., using specific tools for analytics, planning, drafting).**

### Localized Pipeline Layers (Mapped via meta_router)
- `scaler_runbooks/`: The operational rules and workflows for scaling that need to be strictly read before any scaler execution.
- `.scaler_runtime/`: Local execution environment, requirements, and transient scratch files for the Scaler.
- `scaler_ledgers/`: Deep, granular tracking ledgers of every file, gap, and proposal processed during pipeline execution (mapped via `scaler_ledgers.yaml`).

---

## 2. Inputs (Modes), Discovery Structure & Outputs (Levels)
Controlled via `CONTROLER.yaml` configuration.

### 2.1 Input Modes (+ AUTO)
1. **INTERNAL**: Scan internal architectures and systems to identify systemic gaps and enhancement opportunities. Uses the `INTERNAL` profile settings for `target_pillars` and `action_gate`.
2. **EXTERNAL**: Scan external folders for new data. Uses the `EXTERNAL` profile settings for `target_pillars` and `action_gate`.
3. **AUTO**: System intelligently uses both INTERNAL and EXTERNAL based on state and availability. When in AUTO mode, the Scaler resolve the profile (`INTERNAL` or `EXTERNAL`) per operation based on the data source.

### Discovery Folder Structure
```
_pipelines/_scaler/
├── _SCALER-EXTERNAL_SOURCES/                      ← all incoming external data
│   ├── _Foundational_Integrity_inbox/             ← staging inbox for foundational-typed drops
│   ├── _Operational_Muscles_inbox/                ← staging inbox for capability-typed drops
│   ├── _Value_Generation_inbox/                   ← staging inbox for business-typed drops
│   ├── .scaler_mixed_inbox/                       ← untyped drops; Scaler resolves type per-item
│   ├── Foundational_Integrity_discoveries/        ← typed discovery hub (Foundational)
│   ├── Operational_Muscles_discoveries/           ← typed discovery hub (Capabilities)
│   ├── Value_Generation_discoveries/              ← typed discovery hub (Business)
│   └── .scaler_USER-SPACE/                        ← user-only zone (Scaler MUST NOT scan)
│       ├── complex_systems/
│       └── others/
├── Foundational_Integrity_external_proposals/     ← flat gateway: external Foundational proposals
├── Foundational_Integrity_internal_proposals/     ← flat gateway: internal Foundational mega-yamls
├── Operational_Muscles_external_proposals/        ← flat gateway: external Capability proposals
├── Operational_Muscles_internal_proposals/        ← flat gateway: internal Capability mega-yamls
├── Value_Generation_external_proposals/           ← flat gateway: external Business proposals
├── Value_Generation_internal_proposals/           ← flat gateway: internal Business mega-yamls
└── .scaler_brain/scaler_ledgers/                  ← split sub-ledgers + mixed-inbox ledger
    ├── Foundational_Integrity.sources_ledger.yaml ← per-pillar: tracked_discoveries[] (anti-duplication)
    ├── Foundational_Integrity.proposals_ledger.yaml ← per-pillar: tracked_gaps[] + history[] (gateway cards)
    ├── Operational_Muscles.sources_ledger.yaml
    ├── Operational_Muscles.proposals_ledger.yaml
    ├── Value_Generation.sources_ledger.yaml
    ├── Value_Generation.proposals_ledger.yaml
    └── .scaler_mixed_inbox.ledger.yaml            ← anti-duplication tracker for .scaler_mixed_inbox/
```

### Staging Folders (`_inbox/`) — User Drop Zones
Users have **2 valid drop paths**:
1. **Direct drop** — User places item in the correct typed discovery hub (e.g., `_SCALER-EXTERNAL_SOURCES/Operational_Muscles_discoveries/<group>/`). Scaler picks it up immediately — no routing step needed.
2. **Staging drop** — User drops item in an `_SCALER-EXTERNAL_SOURCES/_[Pillar]_inbox/` or `_SCALER-EXTERNAL_SOURCES/.scaler_mixed_inbox/`. Scaler scans it, applies Discovery Boundary Logic, determines which discovery hub it belongs to (or creates a new functional group inside the right hub), moves it there, then processes it normally.

> **Staging scan is Phase 1 priority**: Before processing any typed discovery hub, the Scaler MUST first check the corresponding `_SCALER-EXTERNAL_SOURCES/_[Pillar]_inbox/` and `_SCALER-EXTERNAL_SOURCES/.scaler_mixed_inbox/`. Items in staging MUST be routed before the regular discovery scan begins.

### Distributed Tracking System
Per-pillar ledgers are **split** into two files for clean separation of concerns:

- **`[Pillar].sources_ledger.yaml`** — anti-duplication tracker for raw EXTERNAL discoveries cascaded into this pillar. Holds `tracked_discoveries[]` with content hashes. The single source-of-truth for "have we seen this source before?".
- **`[Pillar].proposals_ledger.yaml`** — gateway-card audit trail for this pillar. Holds `tracked_gaps[]` (active internal gaps awaiting cards) and `history[]` (integrated/rejected gaps and proposals). The single source-of-truth for "what work has flowed through this pillar's gateway?".
- **`.scaler_mixed_inbox.ledger.yaml`** — anti-duplication tracker for items in `.scaler_mixed_inbox/`. Each entry records the file's content hash and timestamp so the same source is never cascaded twice.

The auto-generated **component router** at `.scaler_routing/scaler_ledgers.yaml` aggregates totals across all per-pillar split files. There is no separate "master rollup" file — the router IS the rollup.

- **Update order**: When ingesting a discovery, write `sources_ledger` first; the auto-sync re-aggregates the router. When drafting/integrating a card, write `proposals_ledger` first.

### Discovery Types & Target Pillars
The Scaler uses 3 discovery types for input classification and 3 matching target pillars for proposal/solution/gap folder routing. **If the global `target_pillar` is set to `AUTO`, the Scaler processes all three pillar discovery hubs in a single session. Note: Items already residing in a typed `[Pillar]_discoveries/` hub are never re-classified; only items in `_SCALER-EXTERNAL_SOURCES/.scaler_mixed_inbox/` undergo pillar resolution.**

| Type / Pillar | Discovery Definition (Foundational & Utility-First) | Target ([Pillar]_external_proposals/ + [Pillar]_internal_proposals/) |
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

- **Foundational_Integrity** (Goal: Stability): Consult `.meta_brain/meta_router.yaml` and the pipelines router at `.meta_brain/.meta_routing/pipelines.yaml`. Read relevant laws in `.meta_brain/meta_identity/` and workflow logic in `_pipelines/_scaler/.scaler_brain/scaler_runbooks/`.
- **Operational_Muscles** (Goal: Power): Consult `.meta_brain/.meta_routing/toolboxes.yaml`. Read relevant `yaml_path` entries to see if discovery matches existing descriptions or triggers.
- **Value_Generation** (Goal: Growth): Applies BOTH Foundational and Operational scans with a **Value Generation Vision** (monetization logic or business strategy).

**MANDATORY:** Always perform a full read of target files to establish the "Base State" before drafting.

---

## 3. The Aspects of open-workspace
Any identified gap, discovery, proposal, or solution maps to one or more of these 14 granular aspects. A single discovery MUST be linked to ALL relevant aspects — do not limit to one if multiple apply.

| Aspect ID | What It Targets | Key Paths |
|---|---|---|
| `routing_and_syncing` | Master router, sync engine scripts, auto-generated router YAMLs | `.meta_brain/meta_router.yaml`, `.meta_brain/.meta_routing/`, `.meta_brain/.meta_routing/meta_sync_engines/` |
| `identity_rules` | OS behavioral laws, modes, decision-making, communication style, personas | `.meta_brain/meta_identity/Modes.md`, `Decision_Making.md`, `Rules_And_Considerations.md`, `Communication_Style.md`, `Persona.md` |
| `identity_architecture` | OS structural docs, naming conventions, architecture diagrams, hierarchy definitions | `.meta_brain/meta_identity/Core_Architecture.md`, `Hierarchy.md`, `Naming-Conventions.md`, `Orchestration_And_Flow.md` |
| `identity_capabilities` | Agent behavioral guides, coding guidelines, skill contracts, Python standards, quick-start refs | `.meta_brain/meta_identity/Core_Capabilities.md`, `Quick_Start.md`, `Universal_Portability_Standard.md`, `Orchestrator_Engine.md` |
| `identity_operational` | Controller guide, session template, pipeline-aware operational guides | `.meta_brain/meta_identity/Controler_Guide.md`, `Session_Template.md` |
| `core_toolbox` | Core cognitive loop toolboxes: analysis, research, planning, brainstorming, benchmarking, documentation, evaluation, notebooklm | `.meta_brain/toolboxes/` |
| `extended_toolbox_business` | Business domain toolboxes (selling, acquisition, monetization tools) | `.meta_brain/toolboxes/` |
| `extended_toolbox_engineering` | Engineering domain toolboxes (coding, devops, automation) | `.meta_brain/toolboxes/` |
| `extended_toolbox_life` | Life domain toolboxes | `.meta_brain/toolboxes/` |
| `extended_toolbox_studio` | Studio/creative domain toolboxes | `.meta_brain/toolboxes/` |
| `mission_board` | Session and goal tracking files, runtime state | `.meta_brain/milestones/` |
| `controller` | CONTROLER.yaml structure, review queue, session management schema | `CONTROLER.yaml` |
| `pipeline_scaler` | Scaler runbooks, tracker, gateway schemas, operational rules | `_pipelines/_scaler/` |
| `pipeline_hustler` | Hustler runbooks, tracker, operational knowledge, business execution | `_pipelines/hustler/` |


### Multi-Aspect Rule
**A discovery or gap MUST be linked to every aspect it genuinely enhances or extends.** Do not artificially limit to one aspect. A card has a `primary_aspect` (which determines its gateway folder location) and an `aspects` list (all applicable aspects including the primary). Both fields are mandatory.

*Example: A new sync protocol discovery touches `routing_and_syncing` (structural change to sync engine) AND `pipeline_scaler` (the scaler's own operational rules reference it). Both aspects must be listed.*

> **SCOPE CREATION LAW**: The Scaler MUST suggest any new scopes (aspects) in the `CONTROLER.yaml → system_status.scope_suggestions[]` block. If `system.action_gate` is `EXECUTION`, the Scaler may proceed with the creation if the task is part of an approved session. If `PLANNING`, it MUST await explicit user approval.

---

## 4. The Proposals & Solutions Gateway (MANDATORY)

**Every single output of the Scaler — without exception — MUST pass through the gateway folders before being integrated into any target scope.** There is no direct path from discovery/analysis to integration. The gateway is the mandatory checkpoint.

### 4.1 External Gateway → `[Pillar]_external_proposals/` (flat at pipeline root)

Used for: external direct integrations (moving skill folders, ready-to-use agents, external repos) and external inspirations (things taken from discoveries to add to or change existing files/architecture).

**Flow:**
1. Item is found in `_SCALER-EXTERNAL_SOURCES/Foundational_Integrity_discoveries/`, `Operational_Muscles_discoveries/`, or `Value_Generation_discoveries/`.
2. Scaler analyzes and drafts a **Proposal Card** in the flat `[Pillar]_external_proposals/` folder at the pipeline root.
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

### 4.2 Internal Gateway → `[Pillar]_internal_proposals/` (flat at pipeline root)
Used for: internal gaps, proposed changes to existing files, plans to audit or restructure existing architecture.

**Flow:**
1. Gap or opportunity is identified during internal audit.
2. Scaler drafts an **Internal Action Card** (Mega-YAML) in `[target_pillar]_internal_proposals/MEGA-INT-[ID].yaml` at the pipeline root.
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

---

## 6. Brain ↔ Runtime ↔ Workspace Separation

The Scaler workspace is partitioned into four zones with strictly disjoint purposes. Each zone has explicit "Contains" and "Does NOT contain" rules so an agent can place every file unambiguously. (Conceptual mirror of `Hustler-Architecture.md §5`, scoped to Scaler artifacts.)

| Layer | Purpose | Contains | Does NOT contain |
|---|---|---|---|
| `.scaler_brain/` | **Logic, routing, runbooks, ledgers** | `SCALER_CONTRACTS.yaml`, `scaler_router.yaml`, `scaler_sync.py`, `scaler_runbooks/`, `scaler_ledgers/` (per-pillar `sources_ledger` + `proposals_ledger` + `.scaler_mixed_inbox.ledger.yaml`), `.scaler_routing/` auto-generated component routers + sync engines | Active discoveries, raw external data, scratch drafts, integrated cards (those archive to runtime), user-space content |
| `.scaler_runtime/` | **Ephemeral runtime** | `.scaler_archive/YYYY-QQ/` (integrated/rejected cards bucketed by quarter), `.scaler_scratch/` (transient drafts during Phase 3 Capability Engineering) | System rules, ledgers, runbooks, in-flight active cards, source discoveries |
| `_SCALER-EXTERNAL_SOURCES/` | **Inbound holding** | `_[Pillar]_inbox/` (typed staging), `.scaler_mixed_inbox/` (untyped staging), `[Pillar]_discoveries/` (typed discovery hubs), `.scaler_USER-SPACE/` (user-only zone — Scaler MUST NOT scan, per P-LAW-015) | Drafted/integrated cards, ledgers, runbooks, sync engines |
| `[Pillar]_external_proposals/` and `[Pillar]_internal_proposals/` (flat at pipeline root) | **Active gateway folders** | In-flight `.yaml` cards awaiting decision or pending integration | Archived cards (those move to `.scaler_runtime/.scaler_archive/`), source data, scratch drafts |

### 6.1 Placement Rules
- A new **runbook** belongs in `.scaler_brain/scaler_runbooks/` — never in runtime, never in EXTERNAL_SOURCES.
- A new **scratch draft** during Phase 3 Capability Engineering belongs in `.scaler_runtime/.scaler_scratch/` — never in `.scaler_brain/`, never in a gateway folder.
- A new **discovery item** routed from `.scaler_mixed_inbox/` lands in the matching `_SCALER-EXTERNAL_SOURCES/[Pillar]_discoveries/` group folder — never directly in a gateway folder (P-LAW-016 No-Inbox Processing).
- A new **draft card** during Phase 4 Architecting & Proposing lands in `[Pillar]_external_proposals/` or `[Pillar]_internal_proposals/` — never in `.scaler_brain/`, never in `.scaler_runtime/`.
- An **integrated card** moves from a gateway folder to `.scaler_runtime/.scaler_archive/YYYY-QQ/` per `Scaler-Gateway.md` Step 7 — never stays in the active gateway after `integration_status: INTEGRATED`.
- A new **ledger entry** is appended to the matching `[Pillar].sources_ledger.yaml` or `[Pillar].proposals_ledger.yaml` inside `.scaler_brain/scaler_ledgers/` — never to a runtime file, never to an auto-generated rollup directly (the rollup is read-only product of `meta_sync.py`).

### 6.2 Cross-Layer Reads (allowed)
The four zones are write-disjoint but read-permissive:
- `.scaler_brain/scaler_runbooks/` may freely reference any path for documentation purposes.
- The sync engines in `.scaler_routing/scaler_sync_engines/` read from all four zones to assemble the routers.
- Audit Pass (`Scaler-Workflows.md §7`) reads across all four zones — but only writes back to `scaler_state.yaml` and (conditionally) a new INTERNAL Mega-YAML in a gateway folder.

> **Why this matters**: Without explicit "Does NOT contain" rules, agents periodically drop scratch files into `.scaler_brain/`, leak runbook fragments into `.scaler_runtime/`, or draft cards in `.scaler_scratch/`. §6 makes the negative space explicit so placement violations surface during the Audit Pass instead of silently bloating the wrong zone.
