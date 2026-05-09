# ⚙️ Scaler Workflows

## 1. EXTERNAL Workflow (Data to Proposal)
**Objective**: Scan external data to draft system-enhancing proposals.

1. **Monitor**: Scan `pipelines/scaler/EXTERNAL/_data/` for new, unrouted user inputs.
2. **Categorize (Discovery)**:
   - Determine Output Level (`architecture`, `capabilitys`, `bussiness`, `auto`).
   - Move/Process data into `EXTERNAL/discoveries/[level]/`.
3. **Analyze & Draft (Proposal)**:
   - Map the discovery to the relevant OS Aspects (e.g., `identity`, `routing`).
   - Determine final Output Level (excluding `auto`).
   - Generate proposal in `EXTERNAL/proposals/[aspect]/[level]/`.
4. **Track**: Log every file, movement, and status meticulously in `scaler.tracker/`.

---

## 2. INTERNAL Workflow (Gap to Solution)
**Objective**: Scan internal systems to identify gaps and propose permanent solutions.

1. **Scan (Identify Gaps)**:
   - Audit the top-layer OS components (`.identity/`, `meta.router/`, `toolbox_library/`, etc.).
   - Identify structural, capability, or business gaps.
2. **Categorize (Gap)**:
   - Map the gap to the affected OS Aspect(s).
   - Determine Output Level (`architecture`, `capabilitys`, `bussiness`).
   - Generate gap report in `INTERNAL/gaps/[aspect]/[level]/`.
3. **Analyze & Draft (Solution)**:
   - Formulate a permanent, deterministic solution.
   - Address all cross-aspect requirements (e.g., updating a toolbox requires updating `.sync_engine`).
   - Generate solution in `INTERNAL/solutions/[aspect]/[level]/`.
4. **Track**: Log the gap and solution status deeply within `scaler.tracker/`.

---

## 3. The Execution & Tracking Rule
- **Mission Board vs. Scaler Tracker**: The `mission_board` (in `.core/`) tracks the High-Level Goal (e.g., "Process 15 external files in the _data folder"). The `scaler.tracker/` (in `.scaler.meta/`) acts as the deep, granular ledger mapping out those actual 15 files, their current paths, and processing states.
- **Toolbox Usage**: The `toolbox_library` must be STRICTLY used during every action in the pipeline execution via meta routing (e.g., using a specific analysis or planning skill).
