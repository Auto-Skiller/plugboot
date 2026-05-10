# ⚙️ Scaler Workflows

## Objective
Adapt the 5-phase approach (Market -> Data -> Skills -> Products -> Sales) for the execution of Scaler pipelines.

## Steps

## 1. The 5-Phase Scaler Approach
All Scaler execution strictly adheres to the 5-phase system approach, adapting the Market -> Data -> Skills -> Products -> Sales pipeline for system scaling.

### Phase 1: Discovery (Market Phase)
- **EXTERNAL**: Scan `pipelines/scaler/EXTERNAL/_data/` for new, unrouted external capabilities, systems, or data.
- **INTERNAL**: Audit the top-layer OS components (`.identity/`, `meta.router/`, `toolbox_library/`, etc.) to identify structural, capability, or business gaps.

### Phase 2: Mapping & Tracking (Data Phase)
- **Categorize**: Determine the Output Level (`architecture`, `capabilitys`, `bussiness`, `auto`). Map discoveries or gaps to the relevant OS Aspects.
- **Track**: Meticulously update granular ledgers (`EXTERNAL-LEDGER.yaml` for files, `INTERNAL-LEDGER.yaml` for gaps).
- **Store**: Move data to `EXTERNAL/discoveries/` or generate gap reports in `INTERNAL/gaps/`.

### Phase 3: Capability Engineering (Skills Phase)
- **Assess**: Determine if new or enhanced agentic skills, tools, or toolboxes from `.core/toolbox_library/` are required to architect the solution.
- **Build**: Draft temporary or foundational logic in `scaler.scratch/` before finalizing the architecture.

### Phase 4: Architecting & Proposing (Products Phase)
- **Formulate**: Draft the permanent, deterministic solution or system proposal.
- **Draft**: Generate the formal proposal in `EXTERNAL/proposals/` or the solution in `INTERNAL/solutions/`.
- **Review**: Address all cross-aspect requirements (e.g., updating a toolbox also requires syncing routing).

### Phase 5: Integration (Sales Phase)
- **Merge**: Implement the drafted proposals and solutions directly into the Agentic OS Substrate.
- **Sync**: Update `.brain/meta.router.yaml` and trigger any necessary `.sync_engine` protocols to self-heal the system map.

---

## 2. EXTERNAL Execution Path (Data to Proposal)
**Objective**: Scan external data to draft system-enhancing proposals.

1. **Discovery**: Scan `EXTERNAL/_data/` for unrouted inputs.
2. **Data**: Move to `EXTERNAL/discoveries/[level]/`. Update `EXTERNAL-LEDGER.yaml`.
3. **Skills**: Utilize `toolbox_library` tools for analysis.
4. **Products**: Generate proposal in `EXTERNAL/proposals/[aspect]/[level]/`.
5. **Sales**: Wait for final approval to merge into OS.

---

## 3. INTERNAL Execution Path (Gap to Solution)
**Objective**: Scan internal systems to identify gaps and propose permanent solutions.

1. **Discovery**: Identify gaps in top-layer OS components.
2. **Data**: Generate gap report in `INTERNAL/gaps/[aspect]/[level]/`. Update `INTERNAL-LEDGER.yaml`.
3. **Skills**: Utilize `toolbox_library` tools for planning and logic engineering.
4. **Products**: Generate solution in `INTERNAL/solutions/[aspect]/[level]/`.
5. **Sales**: Implement solution, update routers, and sync the OS.

---

## 4. The Execution & Tracking Rule
- **Mission Board vs. Scaler Tracker**: The `mission_board` (in `.core/`) tracks the High-Level Goal (e.g., "Process 15 external files in the _data folder"). The `scaler.tracker/` (in `.scaler.meta/`) acts as the deep, granular ledger mapping out those actual 15 files, their current paths, and processing states.
- **Toolbox Usage**: The `toolbox_library` must be STRICTLY used during every action in the pipeline execution via meta routing (e.g., using a specific analysis or planning skill).
