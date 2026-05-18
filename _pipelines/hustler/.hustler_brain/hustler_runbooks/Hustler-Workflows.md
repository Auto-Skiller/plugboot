# ⚙️ Hustler Workflows

## Objective
**Purpose:** Implement a structured **5-Phase execution approach** for the Hustler pipeline, with mandatory cascading discovery, atomic tracker updates, and mode-aware integration behavior.

---

## 1. The 5-Phase Hustler Approach

All Hustler execution strictly adheres to this sequence. Phases 1-2 are routing; phases 3-5 are content processing.

### Phase 1: Ingestion
- **Staging Scan (FIRST PRIORITY)**: Before scanning any validated focus folder at pipeline root, check `_HUSTLER-EXTERNAL_SOURCES/.hustler_mixed_inbox/` and `_HUSTLER-EXTERNAL_SOURCES/_[focus]_inbox/` for unrouted sources.
- For each item found:
  1. Compute content hash; consult `.hustler_mixed_inbox.ledger.yaml` (or relevant focus `sources_ledger`) for anti-duplication.
  2. If new: log to the relevant ledger with timestamp + hash.
  3. Pass to Phase 2 (Cascading Discovery) for routing.
- **Direct-drop Scan**: Items the user dropped directly into a feature's `00-data/` are tagged `[new-data]` per Hustler-Tagging-System.md and proceed to Phase 3.

### Phase 2: Cascading Discovery
- Apply the cascading decision tree in `Hustler-Cascading-Logic.md`:
  1. **Focus check** against the auto-generated `.hustler_routing/hustler_ledgers.yaml.discoveries.focuses` (rolled up from per-focus `[focus].focus_ledger.yaml` files).
  2. **Product check** against the matched focus's `[focus]-PRODUCTS.yaml` (in the focus folder at pipeline root).
  3. **Feature check** against the matched product's `[product]-FEATURES.yaml`.
- At each level: matched → cascade down. No match → check threshold:
  - Threshold reached → validate & promote (create the new Focus/Product/Feature folder).
  - Threshold not reached → keep in the appropriate `_*-discovery/` holding folder.
- **MANDATORY (H-LAW-007)**: Update the relevant ledger at the same moment as the move. Atomic.

### Phase 3: Definition (`[new-data]` → `[new-def]`)
- For every feature with `00-data/` containing `[new-data]` files:
  1. Process them ONE BY ONE.
  2. Read the data; identify opportunities and logic specific to the feature.
  3. Update `[feature-name].yaml` with definitions; tag the added section `[new-def]` and list the source data files.
  4. Reflect the feature's `[new-def]` status in `[product]-FEATURES.yaml`.
  5. Change the source file's tag in `00-data/` from `[new-data]` to `[processed-data]`.

Full Step 2.1 logic preserved in `Hustler-Tagging-System.md`.

### Phase 4: Needs Fulfillment (`[new-def]` → `[new-needs]` → assets)
- **Step 4.1**: For every feature marked `[new-def]`, identify what logic/tools/knowledge each definition needs. Write needs into `[feature-name].yaml` and tag them `[new-needs]`. Bump the feature's status from `[new-def]` to `[new-needs]`.
- **Step 4.2**: For every `[new-needs]` part:
  - If extractable from existing `[processed-data]`: copy the asset into `01-requirements/`.
  - If not extractable (Data Gap): scrape the internet, save raw output to `00-data/` tagged `[new-scraped]`, mark which need it was scraped for, then extract to `01-requirements/`.

Full Steps 2.2 and 2.3 logic preserved in `Hustler-Tagging-System.md`.

### Phase 5: Productization
- **Validate readiness**: Feature has all `[new-needs]` fulfilled; `01-requirements/` is populated; tracker shows clean status.
- **Surface for monetization**: Update `[focus]-PRODUCTS.yaml` to mark the feature ready for campaign execution.
- **Pre-execution gate**: Per H-LAW-002 (Value-First Protocol), no campaign can begin without a documented ROI projection. Per H-LAW-003 (Market Sanity Check), perform market research before building final assets.
- **Hustle session**: A productization run becomes a `HUSTLE-[Market]-[ID]` session per H-LAW-001.

---

## 2. INGESTION Execution Path
**Objective**: Cascade unrouted sources into the Focus → Product → Feature hierarchy via the mandatory anti-duplication gate.

1. **Anti-duplication check**: Compute hash of each item in `.hustler_mixed_inbox/`. Skip items already logged in `.hustler_mixed_inbox.ledger.yaml`.
2. **Cascading Discovery**: Apply Section 1 Phase 2 logic.
3. **Atomic move**: Move source file → log in `.hustler_mixed_inbox.ledger.yaml` history → log in target focus's `sources_ledger` (anti-duplication for that focus). All in one operation per H-LAW-007.
4. **Mode-Aware Integration**:
   - `EXECUTION` mode → cascade autonomously.
   - `PLANNING` mode → leave the proposed cascade in scratch with a review request in `CONTROLER.yaml.communication_hubs.hustler_hub`.

---

## 3. PROCESSING Execution Path
**Objective**: Convert cascaded raw data into validated feature requirements.

1. **Definition pass**: Phase 3.
2. **Needs pass**: Phase 4.1.
3. **Fulfillment pass**: Phase 4.2.
4. **Status update**: Reflect tag transitions in `[feature].yaml` AND `[product]-FEATURES.yaml` (per H-LAW-006 atomic tracker rule).

---

## 4. The Execution & Tracking Rule

- **Milestones vs. Hustler Ledgers**: Milestones (`.meta_brain/milestones/`) track High-Level Goals. `hustler_ledgers/` track granular state — per-focus split into `focus_ledger` (strategic) + `sources_ledger` (anti-duplication), plus the dedicated `.hustler_mixed_inbox.ledger.yaml`.
- **Anti-Duplication**: When ingesting from `.hustler_mixed_inbox/`, append the content hash to `.hustler_mixed_inbox.ledger.yaml.state.tracked_items`. The Hustler MUST NOT cascade the same source file twice. When cascading INTO a focus, also log in `[focus].sources_ledger.yaml`.
- **Toolbox Usage (Dynamic Detection)**: The Hustler MUST invoke toolboxes from `.meta_brain/toolboxes/` for all analysis/extraction work (PDF parsing, web scraping, content classification, ranking, summarization, etc.). **There is no static mapping of phase → toolbox.** The agent detects the relevant toolbox per task by consulting the live toolbox catalog (`.meta_brain/toolboxes/`) and the auto-generated toolbox router (`.meta_brain/.meta_routing/toolboxes.yaml`). This keeps the pipeline forward-compatible: as new toolboxes are added, the Hustler picks them up automatically without runbook changes.
- **Atomic Tracker Updates**: A cascade move MUST NEVER be committed without simultaneous updates to:
  1. The source ledger (`.hustler_mixed_inbox.ledger.yaml` or upstream `[focus].sources_ledger.yaml`)
  2. The target tracker (`[focus]-PRODUCTS.yaml` or `[product]-FEATURES.yaml` or `[feature].yaml`)
  3. The target focus's `focus_ledger` (strategic rollup) if a new product/feature was promoted

---

## 5. Mode-Aware Behavior

The `CONTROLER.yaml.modes.hustler` block controls Hustler behavior:

```yaml
hustler:
  work_mode: STRICT 🟢 | COLLAB 🟡 | AUTO 🟢
  action_gate:
    - PLANNING 🟢 | EXECUTION 🟢
```

| Setting | Behavior |
|---|---|
| `action_gate: EXECUTION` | Cascading and processing run autonomously. Update CONTROLER `recent_events` post-action. |
| `action_gate: PLANNING` | Cascade and processing proposals are drafted but await user approval via `CONTROLER.yaml.communication_hubs.hustler_hub.messages`. |
| `work_mode: STRICT` | Address user as "Director ..."; wait for explicit approval on every plan. |
| `work_mode: COLLAB` | Address user as "We ..."; propose intent before sensitive actions. |
| `work_mode: AUTO` | Address user as "I ..."; act decisively; document in CONTROLER for async review. |

Today's default in CONTROLER is `STRICT 🟢 / PLANNING 🟢` — meaning the Hustler proposes cascades and processing decisions but does not auto-execute. Change the CONTROLER block to flip the gate.
