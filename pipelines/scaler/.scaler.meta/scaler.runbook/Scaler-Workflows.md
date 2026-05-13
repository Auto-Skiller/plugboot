# ⚙️ Scaler Workflows

## Objective
Implement a structured 5-phase execution approach for the Scaler pipelines, with mandatory gateway routing, discovery intelligence, and mode-aware integration behavior.

---

## 1. The 5-Phase Scaler Approach
All Scaler execution strictly adheres to the 5-phase system approach for systems scaling.

### Phase 1: Discovery
- **EXTERNAL — Staging Scan (FIRST PRIORITY)**: Before scanning any discovery folder, check the corresponding `.inbox/` staging folder. For each item found:
  1. Apply Discovery Boundary Logic to determine what it is and where it belongs.
  2. **GROUP AND MOVE**: Move it out of the inbox and into the correct, logically grouped folder strictly inside the parent matching type folder. **We NEVER draft proposals directly from an inbox.** Things from the inboxes MUST be grouped into the main folder of their respective type first. The mapping is absolute:
     - Items in `.mixed_inbox/` MUST be grouped into new folders inside `.mixed/`
     - Items in `.architecture_inbox/` MUST be grouped into new folders inside `architecture/`
     - Items in `.bussiness_inbox/` MUST be grouped into new folders inside `bussiness/`
     - Items in `.capabilitys_inbox/` MUST be grouped into new folders inside `capabilitys/`
  3. Log the routing in the relevant sub-ledger before proceeding.
- **EXTERNAL — Discovery Scan**: After clearing staging, scan the discovery type folders (`.mixed/`, `architecture/`, `capabilitys/`, `bussiness/`) for new, unprocessed discoveries. Apply **Discovery Boundary Logic** (see Section 5) to determine Discovery / Sub-Discovery / Sub-Sub-Discovery depth — never assume, always scan.
- **INTERNAL**: Audit the top-layer OS components (`.identity/`, `meta.router/`, `.toolbox_library/`, etc.) to identify structural, capability, or business gaps.

### Phase 2: Mapping & Tracking
- **Cluster-First Audit**: Before creating cards, perform a clustering audit (per Scaler-Discovery-Logic.md). Group standalone files and flat collection items by functional affinity (S5). Actively apply **Cross-Folder Clustering** to merge related items from disparate folders into cohesive domain groups before proposing.
- **Resolve Type**: For .mixed/ items, analyse the actual content of each item and resolve its `output_level` to `architecture`, `capabilitys`, or `bussiness`. Never use mixed or auto as a card-level value. If an item qualifies for multiple types, plan a separate card per type.
- **Map ALL Aspects**: Identify every OS aspect this discovery or gap genuinely enhances. Do NOT limit to one — link to all relevant aspects. Assign `primary_aspect` (determines folder location) and populate the full `aspects` list.
- **Hierarchical Card Planning**: For deep toolboxes, plan the Master/Child card hierarchy.
- **Correlate**: Before processing, actively link and review all relevant discoveries to understand their relationships (e.g., if finding a plugin and a repo related to "planning", they must be mapped and architected together).
- **Track (sub-ledger first)**: Log each discovery in the relevant sub-ledger (`[type].ledger.yaml`) immediately. Then update the master `EXTERNAL-LEDGER.yaml` rollup counts. Sub-ledger is ALWAYS written before master.
- **Pending Proposals Check**: Cross-reference all discovered items against pending (non-fully-implemented) proposals. If a discovery matches or extends a pending proposal, extend or merge that proposal rather than creating a new one.

### Phase 3: Capability Engineering
- **Assess**: Determine if new or enhanced agentic skills, tools, or toolboxes from `.brain/.toolbox_library/` are required to architect the solution (via the meta.router and toolbox_library.router).
- **Build**: Draft temporary or foundational logic in `scaler.scratch/` before finalizing the architecture.

### Phase 4: Architecting & Proposing (Gateway Phase)
- **Formulate**: Draft the permanent, deterministic solution or system proposal.
- **Gateway**: ALL outputs MUST be routed through the gateway folder:
  - External outputs → `EXTERNAL/proposals/[aspect]/[level]/` as a **Proposal Card**.
  - Internal outputs → `INTERNAL/solutions/[aspect]/[level]/` as a **Solution Card**.
- **Review**: Address all cross-aspect requirements (e.g., updating a toolbox also requires syncing routing, something in `.identity/` must be updated, etc.).
- **Mode Behavior**: Apply planning/execution mode rules from `Scaler-Architecture.md` Section 5.

### Phase 5: Integration
- **Gate Check**: Verify the proposal/solution has passed the gateway (is present in `proposals/` or `solutions/` with `APPROVED` user_decision).
- **Merge**: Implement the drafted proposals and solutions directly into the Agentic OS Substrate.
- **Sync**: Update `.brain/meta.router.yaml` and all needed scaler related files (e.g. SCALER-STATE.yaml) and trigger any necessary `.sync_engine` protocols to self-heal the system map.

---

## 2. EXTERNAL Execution Path
**Objective**: Scan external data to draft system-enhancing proposals via the mandatory gateway.

1. **Staging Scan (FIRST)**: Check `.inbox/` folders. Route each item to its correct discovery folder using Discovery Boundary Logic. Log routing in sub-ledger before proceeding.
2. **Discovery Scan**: Scan typed discovery folders for new, unprocessed items. Apply Discovery Boundary Logic (Section 5) to determine D / SD / SSD depth — always scan, never assume.
3. **Analysis & Mapping**: Read scoped architectures first, then actual discovery content. Resolve `discovery_type`. Map ALL applicable aspects. Check pending proposals for merge candidates.
4. **Tracking (sub-ledger first)**: Log the discovery in the relevant `[type].ledger.yaml`. Then update master `EXTERNAL-LEDGER.yaml` rollup. D-level discoveries also get an entry in the master `tracked_discoveries` list.
5. **Capability Engineering**: Utilize `toolbox_library` tools for analysis.
6. **Gateway — Proposal Card**: Generate Proposal Card in `EXTERNAL/proposals/[primary_aspect]/[level]/` with all required fields. Do NOT copy blindly — always adapt, extract, or restructure to match Agentic OS systems.
7. **Mode-Aware Integration**:
   - `EXECUTION` mode → Directly integrate after self-review. Set `user_decision: APPROVED`.
   - `PLANNING` mode → Post review request in `CONTROLER.yaml` communication block. Await user approval.

---

## 3. INTERNAL Execution Path
**Objective**: Scan internal systems to identify gaps and propose permanent solutions via the mandatory gateway.

1. **Discovery**: Identify gaps in top-layer OS components.
2. **Mapping & Tracking**: Generate gap report in `INTERNAL/gaps/[aspect]/[level]/`. Update `INTERNAL-LEDGER.yaml`. Check for pending proposals that this gap connects to.
3. **Capability Engineering**: Utilize `toolbox_library` tools for planning and logic engineering.
4. **Gateway — Solution Card**: Generate Solution Card in `INTERNAL/solutions/[aspect]/[level]/` with all required fields (gap_ref, target_scope, change_type, description, files_involved, user_decision).
5. **Mode-Aware Integration**:
   - `EXECUTION` mode → Directly implement solution after self-review. Set `user_decision: APPROVED`.
   - `PLANNING` mode → Post review request in `CONTROLER.yaml` communication block. Await user approval.

---

## 4. The Execution & Tracking Rule
- **Mission Board vs. Scaler Tracker**: The `.mission_board` (in `.runtime/`) tracks the High-Level Goal (e.g., "Process 15 external files in the discoveries folder"). The `scaler.tracker/` (in `.scaler.meta/`) acts as the deep, granular ledger mapping out those actual 15 files, their current paths, and processing states.
- **Anti-Duplication**: When logging an external file in `EXTERNAL-LEDGER.yaml`, append the target aspect and level to the `processed_matrix`. The scaler MUST NOT process the exact same file for the exact same aspect and level twice.
- **Toolbox Usage**: The `toolbox_library` must be STRICTLY used during every action in the pipeline execution via meta routing (e.g., using a specific analysis or planning skill).
- **Gateway Compliance**: EVERY output must pass through `EXTERNAL/proposals/` or `INTERNAL/solutions/` before any integration. No exceptions. Direct integration without a gateway card is a protocol violation.

---

## 5. Discovery Analysis Intelligence
When analyzing items found in `EXTERNAL/discoveries/`, the Scaler must apply intelligent analysis — **never blind copying**. The following decision tree governs how discoveries are handled:

### 5.1 Integration Decision Options
The Scaler evaluates each discovery and chooses one of the following integration strategies based on **how the enhancement is applied to the target aspect(s)**:

| Integration Type | When to Use | Example |
|---|---|---|
| **INJECT_INTO_EXISTING** | Discovery adds content INTO an existing file or structure without replacing it. The target already exists and is being enriched. | Adding a behavioral rule to `Rules_And_Considerations.md`; adding a new skill entry to an existing toolbox |
| **REPLACE_OR_UPGRADE** | Discovery is a direct, superior replacement or complete upgrade of an existing system, file, or tool. The old version is deprecated or superseded. | Replacing an existing agent with a better version; upgrading a skill to a new schema |
| **BUILD_NEW_COMPONENT** | Discovery provides a complete foundation to create a brand-new system component (file, toolbox, skill folder, engine) that does not currently exist. | Creating `karpathy_guidelines.md` in `.identity/`; adding a completely new domain toolbox |
| **EXTEND_EXISTING_SYSTEM** | Discovery expands an existing system by adding a new sub-component, branch, or feature while keeping the existing structure fully intact. | Adding a new sub-toolbox under `extended.toolbox/`; adding a new sync protocol to `.sync_engine/` |
| **RESTRUCTURE_ARCHITECTURE** | Discovery reveals that existing folder structure, naming, or system relationships need reorganization. **Always requires explicit user approval in ALL modes.** Post in `CONTROLER.yaml` before proceeding. | Splitting `identity` into sub-aspects; reorganizing the toolbox hierarchy |
| **MIGRATE_AND_REPOSITION** | Discovery is content that currently exists in the wrong location and must be moved to its correct OS home (with or without adaptation). | Moving a file from `.mixed/discoveries` to `hustler/` discoveries; repositioning a misrouted toolbox |
| **MERGE_WITH_PENDING** | Discovery directly extends or matches an existing pending proposal that is not yet fully implemented. Extend and update that proposal rather than creating a new one. | Adding a newly found agent to an existing PROP-EXT-AUTO-AGENTS card |

### 5.2 Core Analysis Rules
- **Assess before acting**: Always read the full discovery context before deciding on a strategy.
- **Check pending proposals first**: Before creating a new proposal, scan all existing gateway folders (`EXTERNAL/proposals/`, `INTERNAL/solutions/`) for pending items the discovery can extend.
- **Never copy blindly**: If taking a full file, it must be confirmed compatible with OS schema. If in doubt, use ADAPT_AND_INTEGRATE.
- **Multi-discovery synthesis**: It is valid and encouraged to synthesize parts from multiple discoveries into a single coherent proposal card.
- **Architecture changes need approval**: If the analysis concludes that the OS architecture itself must change to accommodate the discovery (`ARCHITECTURE_AUDIT`), this ALWAYS requires explicit user approval regardless of `action_gate` mode. Post in `CONTROLER.yaml` communication block.

