# ⚙️ Scaler Workflows

## Objective
Implement a structured 5-phase execution approach for the Scaler pipelines, with mandatory gateway routing, discovery intelligence, and mode-aware integration behavior.

---

## 1. The 5-Phase Scaler Approach
All Scaler execution strictly adheres to the 5-phase system approach for systems scaling.

### Phase 1: Discovery
- **EXTERNAL — Staging Scan (FIRST PRIORITY)**: Before scanning any typed discovery hub, check the corresponding inboxes inside `_SCALER-EXTERNAL_SOURCES/`. For each item found:
  1. Apply Discovery Boundary Logic to determine what it is and where it belongs.
  2. **GROUP AND MOVE**: Move it out of the inbox and into the correct, logically grouped folder strictly inside the parent matching `_SCALER-EXTERNAL_SOURCES/[Pillar]_discoveries/` hub. **We NEVER draft proposals directly from an inbox.** Items from the inboxes MUST be grouped into the relevant typed discovery hub first. The mapping is absolute:
     - Items in `_SCALER-EXTERNAL_SOURCES/.scaler_mixed_inbox/` MUST be resolved and moved to `_SCALER-EXTERNAL_SOURCES/Foundational_Integrity_discoveries/`, `_SCALER-EXTERNAL_SOURCES/Operational_Muscles_discoveries/`, or `_SCALER-EXTERNAL_SOURCES/Value_Generation_discoveries/` (NEVER routed into `_SCALER-EXTERNAL_SOURCES/.scaler_USER-SPACE/`).
     - Items in `_SCALER-EXTERNAL_SOURCES/_Foundational_Integrity_inbox/` MUST be grouped into new folders inside `_SCALER-EXTERNAL_SOURCES/Foundational_Integrity_discoveries/`.
     - Items in `_SCALER-EXTERNAL_SOURCES/_Value_Generation_inbox/` MUST be grouped into new folders inside `_SCALER-EXTERNAL_SOURCES/Value_Generation_discoveries/`.
     - Items in `_SCALER-EXTERNAL_SOURCES/_Operational_Muscles_inbox/` MUST be grouped into new folders inside `_SCALER-EXTERNAL_SOURCES/Operational_Muscles_discoveries/`.
  3. Log the routing in the relevant pillar `sources_ledger` (atomic with the move) before proceeding. Items from `.scaler_mixed_inbox/` are first logged in `.scaler_mixed_inbox.ledger.yaml` for anti-duplication.
- **EXTERNAL — Discovery Scan**: After clearing staging, scan the typed discovery hubs (`_SCALER-EXTERNAL_SOURCES/Foundational_Integrity_discoveries/`, `_SCALER-EXTERNAL_SOURCES/Operational_Muscles_discoveries/`, `_SCALER-EXTERNAL_SOURCES/Value_Generation_discoveries/`) for new, unprocessed discoveries. Apply **Discovery Boundary Logic** (see Section 5) to determine Discovery / Sub-Discovery / Sub-Sub-Discovery depth — never assume, always scan. **NEVER scan `_SCALER-EXTERNAL_SOURCES/.scaler_USER-SPACE/`** (per P-LAW-015).
- **INTERNAL**: Audit the top-layer OS components (`meta_identity/`, `meta_router.yaml`, `toolboxes/`, etc.) to identify structural, capability, or business gaps.

### Phase 2: Mapping & Tracking (The Double-Scan Protocol)
Mandatory pre-drafting logic to determine the Integration Type after identifying targets.
- **Step 1: Strategic Interrogation (Identify Targets)**: Resolve the target Pillar and specific target files using meta-routing. **MANDATORY:** Perform a full read of target files to establish the "Base State."
- **Step 2: Source Scan**: Analyze the discovery logic, structure, and technical maturity.
- **Step 3: Cluster-First Audit**: Group standalone files and flat collection items by functional affinity (S5). Actively apply **Cross-Folder Clustering** to merge related items from disparate folders into cohesive domain groups.
- **Step 4: Resolve Type**: Read the Selection Criteria in `Scaler-Discovery-Logic.md`. Compare Target (Ground Truth) vs. Source (Discovery) to decide the best-fit `Integration_Type` (INJECT, UPGRADE, BUILD_NEW, EXTEND).
- **Step 5: Map ALL Aspects**: Identify every OS aspect this discovery enhances. Assign `primary_aspect` and populate the full `aspects` list.
- **Step 6: Track (sources_ledger first)**: Log in `[Pillar].sources_ledger.yaml` (anti-duplication via content hash). The auto-sync re-aggregates the `.scaler_routing/scaler_ledgers.yaml` rollup.

### Phase 3: Capability Engineering
- **Assess**: Determine if new or enhanced agentic skills, tools, or toolboxes from `.meta_brain/toolboxes/` are required to architect the solution.
- **Build**: Draft temporary or foundational logic in `.scaler_runtime/.scaler_scratch/` before finalizing the architecture.

### Phase 4: Architecting & Proposing (Strategic Gateway Phase)
- **Formulate**: Draft the permanent, deterministic solution using the resolved Integration Type and Workflow.
- **Multi-Target Logic**: A single discovery can route to multiple Integration Types with different targets in the same Proposal Card (v3.1). Grouped discoveries should have grouped proposals.
- **Gateway**: ALL outputs MUST be routed through the gateway:
  - External outputs → relevant pillar's proposals folder as a **Proposal Card (v3.1)**.
  - Internal outputs → `INTERNAL/[Pillar]/` as an **Internal Action Card**.
- **Review**: Address all cross-aspect requirements.
- **Mode Behavior**: Apply planning/execution mode rules from `Scaler-Architecture.md` Section 5.

### Phase 5: Integration
- **Gate Check**: Verify the proposal/solution has passed the gateway (is present in the proposals folder or `INTERNAL/` with `APPROVED` user_decision).
- **Merge**: Implement the drafted proposals and solutions directly into the Agentic OS Substrate.
- **Sync**: Update `.meta_brain/meta_router.yaml` and all needed scaler related files (e.g. scaler_state.yaml) and trigger `meta_sync.py` to self-heal the system map.

---

## 2. EXTERNAL Execution Path
**Objective**: Scan external data to draft system-enhancing proposals via the mandatory gateway.

1. **Staging Scan (FIRST)**: Check `_inbox/` folders. Route each item to its correct discovery folder using Discovery Boundary Logic. Log routing in sub-ledger before proceeding.
2. **Discovery Scan**: Scan typed pillar folders for new, unprocessed items. Apply Discovery Boundary Logic (Section 5) to determine D / SD / SSD depth — always scan, never assume.
3. **Analysis & Mapping**: Read scoped architectures first, then actual discovery content. Resolve `discovery_type`. Map ALL applicable aspects. Check pending proposals for merge candidates.
4. **Tracking (sources_ledger first)**: Log the discovery in the relevant `[Pillar].sources_ledger.yaml` (inside `scaler_ledgers/`) for anti-duplication. The auto-sync re-aggregates `.scaler_routing/scaler_ledgers.yaml` rollup. D-level discoveries also get an entry in the master `tracked_discoveries` list inside the pillar's `sources_ledger`.
5. **Capability Engineering**: Utilize `.meta_brain/toolboxes/` tools for analysis.
6. **Gateway — Proposal Card**: Generate Proposal Card in the pillar's proposals folder with all required fields. Do NOT copy blindly — always adapt, extract, or restructure to match Agentic OS systems.
7. **Mode-Aware Integration**:
   - `EXECUTION` mode → Directly integrate after self-review. Set `user_decision: APPROVED`.
   - `PLANNING` mode → Post review request in `CONTROLER.yaml` communication block. Await user approval.

---

## 3. INTERNAL Execution Path
**Objective**: Scan internal systems to identify gaps and propose permanent solutions via the mandatory gateway.

1. **Discovery**: Identify gaps in top-layer OS components.
    - **INTERNAL PROMPT**: If `scaler.input_mode: INTERNAL` (or `AUTO` resolving to `INTERNAL`), the agent MUST follow the active `system.action_gate`. If `EXECUTION`, run the analysis prompt immediately. If `PLANNING`, the executing agent MUST first ask the user for explicit approval (via direct prompt or CONTROLER.yaml). Once approved (or if in EXECUTION mode), the agent MUST run the following internal analysis prompt to begin discovery:
     > "Perform a comprehensive architectural audit of the Agentic OS Substrate. Analyze all core pillars, systems, and logic structures to identify gaps and optimization opportunities. Ensure all components (milestones, CONTROLER, toolboxes, and routing maps) are fully integrated and aligned with v5.2 standard. Simulate full end-to-end continuous workflows to detect execution blockages or state management gaps."

    - **EVOLVE PROMPT**: If `system.evolution_mode: EVOLVE`, the agent MUST perform a post-interaction evaluation to identify logical shifts, pattern emergences, or system gaps. Apply the Evolution Protocol to document and merge these findings, proposing changes to runbooks or identity architectures.
   - **Constraint Enforcement**: This prompt MUST always be executed considering the `scaler.work_mode`, the `target_pillar`, and the global `system.action_gate`. The Scaler MUST explicitly **IGNORE** `scaler.action_gate` during this specific run, relying entirely on the system-level action gate.
2. **Mapping & Tracking**: Update the relevant pillar's `proposals_ledger` (`[Pillar].proposals_ledger.yaml` under `state.tracked_gaps`). Check for pending proposals that this gap connects to.
3. **Capability Engineering**: Utilize `.meta_brain/toolboxes/` tools for planning and logic engineering.
4. **Gateway — Internal Action Card**: Generate an Internal Action Card (Mega-YAML) in `INTERNAL/[target_pillar]/` with all required fields (action_id, gap, solution, user_decision).
5. **Mode-Aware Integration**:
   - `EXECUTION` mode (via global `system.action_gate`) → Directly implement solution after self-review. Set `user_decision: APPROVED`.
   - `PLANNING` mode (via global `system.action_gate`) → Post review request in `CONTROLER.yaml` communication block. Await user approval.

---

## 4. The Execution & Tracking Rule
- **Milestones vs. Scaler Ledgers**: The milestones (in `.meta_brain/milestones/`) track the High-Level Goal. The `scaler_ledgers/` inside `.scaler_brain/` act as the deep, granular ledgers mapping out those actual files, their current paths, and processing states.
- **Anti-Duplication**: When logging an external file, append its content hash to the relevant `[Pillar].sources_ledger.yaml.state.tracked_discoveries[]`, plus the `processed_matrix` for aspect+level tracking. The scaler MUST NOT process the exact same file for the exact same aspect and level twice. Items in `.scaler_mixed_inbox/` are first checked against `.scaler_mixed_inbox.ledger.yaml` before any cascade.
- **Toolbox Usage**: The `toolboxes` must be STRICTLY used during every action in the pipeline execution via meta routing (e.g., using a specific analysis or planning skill).
- **Gateway Compliance**: EVERY output must pass through the relevant pillar's proposals folder or `INTERNAL/[Pillar]/` before any integration. No exceptions. Direct integration without a gateway card is a protocol violation.

---

## 5. Discovery Analysis Intelligence
When analyzing items found in `_SCALER-EXTERNAL_SOURCES/`, the Scaler must apply intelligent analysis — **never blind copying**. The following decision tree governs how discoveries are handled:

### 5.1 Integration Decision Options
The Scaler evaluates each discovery and chooses one of the following integration strategies based on **how the enhancement is applied to the target aspect(s)**:

| Integration Type | When to Use | Example |
|---|---|---|
| **INJECT_INTO_EXISTING** | Discovery adds content INTO an existing file or structure without replacing it. The target already exists and is being enriched. | Adding a behavioral rule to `Rules_And_Considerations.md`; adding a new skill entry to an existing toolbox |
| **REPLACE_OR_UPGRADE** | Discovery is a direct, superior replacement or complete upgrade of an existing system, file, or tool. The old version is deprecated or superseded. | Replacing an existing agent with a better version; upgrading a skill to a new schema |
| **BUILD_NEW_COMPONENT** | Discovery provides a complete foundation to create a brand-new system component (file, toolbox, skill folder, engine) that does not currently exist. | Creating `karpathy_guidelines.md` in `.identity/`; adding a completely new domain toolbox |
| **EXTEND_EXISTING_SYSTEM** | Discovery expands an existing system by adding a new sub-component, branch, or feature while keeping the existing structure fully intact. | Adding a new sub-toolbox under `extended.toolbox/`; adding a new sync protocol to `.sync_engine/` |
| **RESTRUCTURE_ARCHITECTURE** | Discovery reveals that existing folder structure, naming, or system relationships need reorganization. **Always requires explicit user approval in ALL modes.** Post in `CONTROLER.yaml` before proceeding. | Splitting `identity` into sub-aspects; reorganizing the toolbox hierarchy |
| **MIGRATE_AND_REPOSITION** | Discovery is content that currently exists in the wrong location and must be moved to its correct OS home (with or without adaptation). | Moving a file to `hustler/` discoveries; repositioning a misrouted toolbox |
| **MERGE_WITH_PENDING** | Discovery directly extends or matches an existing pending proposal that is not yet fully implemented. Extend and update that proposal rather than creating a new one. | Adding a newly found agent to an existing PROP-EXT-AUTO-AGENTS card |

### 5.2 Core Analysis Rules
- **Assess before acting**: Always read the full discovery context before deciding on a strategy.
- **Check pending proposals first**: Before creating a new proposal, scan all existing gateway folders (the proposals folder inside pillars, `INTERNAL/[Pillar]/`) for pending items the discovery can extend.
- **Never copy blindly**: If taking a full file, it must be confirmed compatible with OS schema. If in doubt, use ADAPT_AND_INTEGRATE.
- **Multi-discovery synthesis**: It is valid and encouraged to synthesize parts from multiple discoveries into a single coherent proposal card.
- **Architecture changes need approval**: If the analysis concludes that the OS architecture itself must change to accommodate the discovery (`ARCHITECTURE_AUDIT`), this ALWAYS requires explicit user approval regardless of `action_gate` mode. Post in `CONTROLER.yaml` communication block.

