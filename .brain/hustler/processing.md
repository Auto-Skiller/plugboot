# PLAYBOOK: PHASE 2 - REQUIREMENTS PROCESSING

**Purpose:** Define detailed feature requirements based on opportunities found in `00-data/`. Identify and gather required logic, knowledge, tools, and materials strictly at the feature level.

**Location:** `_pipeline/[focus-name]/[product-name]/[feature-name]/01-requirements/`

## File Structure
All definitions and needs are tracked inside `[feature-name].yalm` at the root of the feature folder. The `01-requirements/` folder serves as storage for extracted assets, tools, or specific materials needed for the feature.

## Workflow: Step-by-Step Processing

### Step 2.1: Process `[new-data]` into Definitions
1. Look for all files tagged `[new-data]` in a feature's `00-data/`. **Process them ONE BY ONE.**
2. Read the data to identify opportunities and logic specific to the feature.
3. Update `[feature-name].yalm` with these new definitions.
4. **Rules while updating:**
   - Add a `[new-def]` tag next to the added/updated part in `[feature-name].yalm`, and list the used data files alongside the tag (so we know where it came from).
   - Ensure `[product-name]-FEATURES.yalm` reflects that the feature has active `[new-def]` tags.
   - Change the tag in the original data file in `00-data/` from `[new-data]` to `[processed-data]`.

### Step 2.2: Process `[new-def]` into Needs
1. Look for features marked with `[new-def]` tags.
2. Open the matching `[feature-name].yalm`.
3. Find all parts tagged `[new-def]`. **Process them PART BY PART.**
   - Read the `[new-def]` section.
   - Identify what logic, tools, or knowledge it needs.
   - Write these needs into the needs section of `[feature-name].yalm` and tag them with `[new-needs]`.
4. **Rules while updating:**
   - Once all `[new-def]` parts have been mapped to needs, update the feature's status tags in `[feature-name].yalm` and `[product-name]-FEATURES.yalm` from `[new-def]` to `[new-needs]`.

### Step 2.3: Fulfill `[new-needs]` from Data
1. Look for features marked with `[new-needs]`.
2. Open the matching `[feature-name].yalm`.
3. Find all parts tagged `[new-needs]`. **Process them PART BY PART.**
   - Read the need, and look up the data files referenced in the original definition.
   - Read those specific data files (which should now be tagged `[processed-data]`).
   - **If the need can be extracted directly:** Copy or extract the content into the `01-requirements/` folder.
   - **If the need CANNOT be extracted (Data Gap):**
     1. Scrape the internet specifically for this missing logic/knowledge.
     2. Save the new raw data into `00-data/` with the tag `[new-scraped]`.
     3. Ensure this specific `[new-scraped]` file marks which need it was scraped for (e.g., `<!-- Scraped for: need-X -->`).
     4. Update the `[new-needs]` part in `[feature-name].yalm` using this new data, and copy/extract the necessary assets to `01-requirements/`.
     5. *Double-Processing Prevention:* By explicitly marking `[new-scraped]` files, we prevent processing them twice for the *same* need. However, they remain available if another workflow requires them in the future.
