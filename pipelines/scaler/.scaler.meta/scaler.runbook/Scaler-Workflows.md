# ⚙️ Scaler Workflows

## Objective
Implement a structured 5-phase execution approach for the Scaler pipelines, with mandatory gateway routing, discovery intelligence, and mode-aware integration behavior.

---

## 1. The 5-Phase Scaler Approach
All Scaler execution strictly adheres to the 5-phase system approach for systems scaling.

### Phase 1: Discovery
- **EXTERNAL**: Utilize `scaler.tracker/` for discoveries scans. Scan `EXTERNAL/discoveries/` for new, unrouted external capabilities, systems, or data. Apply **Discovery Analysis Intelligence** (see Section 5).
- **INTERNAL**: Audit the top-layer OS components (`.identity/`, `meta.router/`, `.toolbox_library/`, etc.) to identify structural, capability, or business gaps.

### Phase 2: Mapping & Tracking
- **Categorize**: Determine the Output Level (`architecture`, `capabilitys`, `bussiness`, `auto`). Map discoveries or gaps to the relevant OS Aspects (use `meta.router` for Aspects scanning).
- **Correlate**: Before processing, actively link and review all relevant discoveries to understand their relationships (e.g., if finding a plugin and a repo related to "planning", they must be mapped and architected together).
- **Track**: Meticulously update granular ledgers (`EXTERNAL-LEDGER.yaml` for files, `INTERNAL-LEDGER.yaml` for gaps) inside `scaler.tracker/`.
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

1. **Discovery**: Utilize `scaler.tracker/` for discoveries scans. Scan `EXTERNAL/discoveries/` for unrouted inputs. Apply **Discovery Analysis Intelligence** (Section 5).
2. **Analysis & Mapping**: Read the scoped architectures and systems first, then the actual discoveries files contents to identify proposals. Use `meta.router` for Aspects scanning. Check for pending proposals that the discovery can extend or merge with.
3. **Tracking**: Update `EXTERNAL-LEDGER.yaml` ensuring the `processed_matrix` logs `[aspect, level]` to prevent redundant processing.
4. **Capability Engineering**: Utilize `toolbox_library` tools for analysis.
5. **Gateway — Proposal Card**: Generate Proposal Card in `EXTERNAL/proposals/[aspect]/[level]/` with all required fields (source, target_scope, integration_type, description, files_involved, user_decision). Do NOT copy blindly — always adapt, extract relevant parts, or restructure to match Agentic OS systems.
6. **Mode-Aware Integration**:
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
The Scaler evaluates each discovery and chooses one of the following integration strategies:

| Strategy | When to Use |
|---|---|
| **DIRECT_MOVE** | The discovery file/folder is already fully compatible with OS architecture and can be moved as-is to a target scope (e.g., a ready-to-use skill folder matching the OS schema). |
| **ADAPT_AND_INTEGRATE** | The discovery has high value but requires renaming, restructuring, or rewriting to match OS terminology and architecture before integration. |
| **ARCHITECTURE_AUDIT** | The discovery reveals that the OS's own architecture needs to change to accommodate the value. This requires explicit user approval in ALL modes (PLANNING and EXECUTION). Post approval request in `CONTROLER.yaml` before proceeding. |
| **PARTIAL_EXTRACT** | Only specific parts of a discovery are useful. Extract only those parts into a Proposal Card, leaving the rest. Can also combine parts from multiple discoveries into one proposal. |
| **MERGE_WITH_PENDING** | The discovery directly extends or matches an existing pending proposal that is not yet fully implemented. Extend and update that proposal rather than creating a new one. |

### 5.2 Core Analysis Rules
- **Assess before acting**: Always read the full discovery context before deciding on a strategy.
- **Check pending proposals first**: Before creating a new proposal, scan all existing gateway folders (`EXTERNAL/proposals/`, `INTERNAL/solutions/`) for pending items the discovery can extend.
- **Never copy blindly**: If taking a full file, it must be confirmed compatible with OS schema. If in doubt, use ADAPT_AND_INTEGRATE.
- **Multi-discovery synthesis**: It is valid and encouraged to synthesize parts from multiple discoveries into a single coherent proposal card.
- **Architecture changes need approval**: If the analysis concludes that the OS architecture itself must change to accommodate the discovery (`ARCHITECTURE_AUDIT`), this ALWAYS requires explicit user approval regardless of `action_gate` mode. Post in `CONTROLER.yaml` communication block.
