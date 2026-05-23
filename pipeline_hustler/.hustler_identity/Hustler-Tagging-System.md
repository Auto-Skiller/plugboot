# 🏷️ Hustler Tagging System

## Objective
**Purpose:** Central tag taxonomy and lifecycle for the Hustler pipeline. This document is the single authoritative reference for `[new-data]`, `[processed-data]`, `[new-scraped]`, `[new-def]`, and `[new-needs]`. The full Phase 3 + Phase 4 processing playbook (originally Steps 2.1, 2.2, 2.3 of `processing.md`) is preserved verbatim below.

---

## 1. Tag Taxonomy

### 1.1 Data-Layer Tags (used in feature `00-data/`)

| Tag | Where | Meaning | Set By |
|---|---|---|---|
| `[new-data]` | filename or content header in `00-data/` | Freshly imported data, not yet processed for definitions | Phase 1 Ingestion (after cascade) |
| `[processed-data]` | replaces `[new-data]` after Phase 3 | Data has been read, mapped into definitions, archived in-place | Phase 3 Definition pass |
| `[new-scraped]` | filename in `00-data/` | Data explicitly scraped to fill a Phase 4 need; carries `<!-- Scraped for: need-X -->` provenance marker | Phase 4 Step 4.2 (Data Gap branch) |

### 1.2 Tracker-Layer Tags (used in `[feature].yaml` and `[product]-FEATURES.yaml`)

| Tag | Where | Meaning | Set By |
|---|---|---|---|
| `[new-def]` | a section/field in `[feature].yaml` and propagated to `[product]-FEATURES.yaml` | Newly added feature definition pending needs analysis | Phase 3 Definition pass |
| `[new-needs]` | replaces `[new-def]` once needs are written | Requirements written; pending fulfillment | Phase 4 Step 4.1 |
| (no tag) | section in `[feature].yaml` | Validated, requirements fulfilled, ready for Phase 5 Productization | Phase 4 Step 4.2 completion |

---

## 2. Tag Lifecycle Diagram

```
[new-data] ──Phase 3 Step 2.1──▶ [processed-data]   (file moves through tag, stays in 00-data/)
    │
    └──▶ [new-def] in [feature].yaml ──Phase 4 Step 2.2──▶ [new-needs] in [feature].yaml
                                                              │
                                                              └──Phase 4 Step 2.3──▶ (no tag) — extracted to 01-requirements/
                                                                                         │
                                                                                         └──Data Gap path──▶ [new-scraped] in 00-data/ ──▶ [processed-data]
```

---

## 3. Strict Requirement (preserved from `ingestion.md`)

EVERY file inside `00-data/` MUST contain a tag indicating its state. Untagged files are a protocol violation (H-LAW-005 Tag Lifecycle Preservation).

---

## 4. Phase 3 + Phase 4 Processing Playbook (verbatim from original `processing.md`)

This section preserves the Step 2.1 / 2.2 / 2.3 sequence from the original v1.0 runbook. The numbering is kept (Step 2.1 etc.) for backward reference even though Phases are renumbered (Phase 3 = old Step 2.1, Phase 4 = old Step 2.2 + 2.3) in `Hustler-Workflows.md`.

### Step 2.1: Process `[new-data]` into Definitions  *(maps to Phase 3)*
1. Look for all files tagged `[new-data]` in a feature's `00-data/`. **Process them ONE BY ONE.**
2. Read the data to identify opportunities and logic specific to the feature.
3. Update `[feature-name].yaml` with these new definitions.
4. **Rules while updating:**
   - Add a `[new-def]` tag next to the added/updated part in `[feature-name].yaml`, and list the used data files alongside the tag (so we know where it came from).
   - Ensure `[product-name]-FEATURES.yaml` reflects that the feature has active `[new-def]` tags.
   - Change the tag in the original data file in `00-data/` from `[new-data]` to `[processed-data]`.

### Step 2.2: Process `[new-def]` into Needs  *(maps to Phase 4 Step 4.1)*
1. Look for features marked with `[new-def]` tags.
2. Open the matching `[feature-name].yaml`.
3. Find all parts tagged `[new-def]`. **Process them PART BY PART.**
   - Read the `[new-def]` section.
   - Identify what logic, tools, or knowledge it needs.
   - If the definition is self-contained and requires no further fulfillment, simply remove the `[new-def]` tag.
   - Otherwise, write these needs into the needs section of `[feature-name].yaml` and tag them with `[new-needs]`.
4. **Rules while updating:**
   - Once all `[new-def]` parts have been mapped to needs, update the feature's status tags in `[feature-name].yaml` and `[product-name]-FEATURES.yaml` from `[new-def]` to `[new-needs]`.

### Step 2.3: Fulfill `[new-needs]` from Data  *(maps to Phase 4 Step 4.2)*
1. Look for features marked with `[new-needs]`.
2. Open the matching `[feature-name].yaml`.
3. Find all parts tagged `[new-needs]`. **Process them PART BY PART.**
   - Read the need, and look up the data files referenced in the original definition.
   - Read those specific data files (which should now be tagged `[processed-data]`).
   - **If the need can be extracted directly:** Copy or extract the content into the `01-requirements/` folder.
   - **If the need CANNOT be extracted (Data Gap):**
     1. Scrape the internet specifically for this missing logic/knowledge.
     2. Save the new raw data into `00-data/` with the tag `[new-scraped]`.
     3. Ensure this specific `[new-scraped]` file marks which need it was scraped for (e.g., `<!-- Scraped for: need-X -->`).
     4. Update the `[new-needs]` part in `[feature-name].yaml` using this new data, and copy/extract the necessary assets to `01-requirements/`.
     5. *Double-Processing Prevention:* By explicitly marking `[new-scraped]` files, we prevent processing them twice for the *same* need. However, they remain available if another workflow requires them in the future.
     6. **Tag Transition:** Once the need is fulfilled and assets extracted, rename the tag on the file from `[new-scraped]` to `[processed-data]` so it enters the standard archival state, but leave the `<!-- Scraped for: need-X -->` provenance header intact.

---

## 5. Atomic Update Rule (H-LAW-006 enforcement)

A tag transition MUST NEVER be partial. When changing `[new-data]` → `[processed-data]`:
- The source file's tag updates
- AND the feature's `[feature].yaml` gets the corresponding `[new-def]` entry
- AND the `[product]-FEATURES.yaml` reflects the feature now has `[new-def]` activity

All three writes are one operation. A partial update creates a state where the source looks processed but the definition is missing — anti-duplication can later cause the same data to be re-cascaded.

---

## 6. Data Gap Provenance (for `[new-scraped]` files)

When Phase 4 Step 2.3 invokes a scrape, the resulting `[new-scraped]` file MUST include a provenance marker at the top:

```
<!-- Scraped for: [feature-name].[need-id] -->
<!-- Scraped at: [ISO 8601 timestamp] -->
<!-- Source URL(s): [list] -->
```

This serves three purposes:
1. **Prevents double-scraping** for the same need.
2. **Audit trail** for the Hustler — agents can grep for "Scraped for: feature-X" to find all scraped material for a feature.
3. **Reusability**: even though the file is tagged scraped-for-a-specific-need, future workflows can find and reuse it.
