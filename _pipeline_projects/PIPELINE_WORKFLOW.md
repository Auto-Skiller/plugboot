# PIPELINE RULEBOOK

This document outlines the operational architecture, folder structures, and tagging workflows for the Pipeline System. The pipeline is designed to autonomously discover Market Focuses (product opportunities), transform raw data into requirements, and eventually build and sell products.

Currently, this document covers the **General `_pipeline-discovery` phase** and the **Internal phases** (`00-data`, and `01-requirements`).

---

## 1. Directory Architecture Overview

```
_pipeline/
├── PIPELINE-FOCUSES.yalm               # High-level tracker of all focuses
├── PIPELINE.md                         # This rulebook
├── _pipeline-discovery/                # Market Focuses discovery & ranking (focus-related threshold if no matching)
└── [focus-name]/                       # A **validated** Focus folder
    ├── [focus-name]-PRODUCTS.yalm      # Focus-level tracker of all products
    ├── _[focus-name]-discovery/        # Focus Products discovery & ranking (product-related threshold if no matching)
    └── [product-name]/                 # A **validated** Product folder
        ├── [product-name]-FEATURES.yalm # Product-level tracker of all features
        ├── _[product-name]-discovery/  # Product features discovery & ranking (feature-related threshold if no matching)
        └── [feature-name]/             # A **validated** Feature folder
            ├── [feature-name].yalm     # Feature-level definitions, needs, and tracking
            ├── 00-data/                # Phase 1: Storage for raw/scraped data
            └── 01-requirements/        # Phase 2: Feature definitions & needs assets/extracted files
```

---

## 2. Cascading Discovery Phase & Logic

**Purpose:** Consistently discover and track Market Focuses, Products, and Features through cascading thresholds and verifications.

**Workflow Logic:**
When a new discovery enters `_pipeline-discovery/`, it flows through the following validation steps:

1. **Check for Matching Focus (in `PIPELINE-FOCUSES.yalm`):**
   - **No Matching Focus:** Check the threshold. Validate and create the new Focus if reached. If not reached, keep it in `_pipeline-discovery/`.
   - **Matching Focus Found:** Proceed to check products within the focus.

2. **Check for Matching Product (in `[focus-name]-PRODUCTS.yalm`):**
   - **No Matching Product:** Move data to `_[focus-name]-discovery/` and check the product threshold. Validate and create the new Product if reached. Keep it if not yet reached.
   - **Matching Product Found:** Proceed to check features within the product.

3. **Check for Matching Feature (in `[product-name]-FEATURES.yalm`):**
   - **No Matching Feature:** Move data to `_[product-name]-discovery/` and check the feature threshold. Validate and create the new Feature if reached. Keep it if not yet reached.
   - **Matching Feature Found:** Move the data directly into the matched feature's `00-data/` folder.

---

## 3. Trackers and Tagging System

The system uses `.yalm` files across different levels to track progress and flag when lower levels require attention:

- **`PIPELINE-FOCUSES.yalm`:** Tracks all validated Focuses. Can include high-level tags to indicate if a focus has pending work underneath.
- **`[focus-name]-PRODUCTS.yalm`:** Tracks all validated Products under a Focus.
- **`[product-name]-FEATURES.yalm`:** Tracks all validated Features under a Product. It surfaces feature-level status tags so we know a feature needs processing.
- **`[feature-name].yalm`:** Contains the definitions and needs specifically for the feature. All feature-specific tagging (`[new-def]`, `[new-needs]`) is tracked here.

---

## 4. Phase 1: `00-data/` (Data Storage)

**Purpose:** Storage for raw scraped data or data successfully cascaded down from the discovery phases.

**Location:** `_pipeline/[focus-name]/[product-name]/[feature-name]/00-data/`

### Tagging Rules
- **Strict Requirement:** EVERY file inside `00-data/` must contain a tag indicating its state.
- `[new-data]`: Freshly imported data that has not yet been processed for requirements.
- `[processed-data]`: Data that has already been read and mapped into feature definitions.
- `[new-scraped]`: Data explicitly scraped to fill a specific requirements gap (see Phase 2).

---

## 5. Phase 2: `01-requirements/` (Definitions & Needs)

**Purpose:** Define detailed feature requirements based on opportunities found in `00-data/`. Identify and gather required logic, knowledge, tools, and materials strictly at the feature level.

**Location:** `_pipeline/[focus-name]/[product-name]/[feature-name]/01-requirements/`

### File Structure
All definitions and needs are tracked inside `[feature-name].yalm` at the root of the feature folder. The `01-requirements/` folder serves as storage for extracted assets, tools, or specific materials needed for the feature.

### Workflow: Step-by-Step Processing

#### Step 2.1: Process `[new-data]` into Definitions
1. Look for all files tagged `[new-data]` in a feature's `00-data/`. **Process them ONE BY ONE.**
2. Read the data to identify opportunities and logic specific to the feature.
3. Update `[feature-name].yalm` with these new definitions.
4. **Rules while updating:**
   - Add a `[new-def]` tag next to the added/updated part in `[feature-name].yalm`, and list the used data files alongside the tag (so we know where it came from).
   - Ensure `[product-name]-FEATURES.yalm` reflects that the feature has active `[new-def]` tags.
   - Change the tag in the original data file in `00-data/` from `[new-data]` to `[processed-data]`.

#### Step 2.2: Process `[new-def]` into Needs
1. Look for features marked with `[new-def]` tags.
2. Open the matching `[feature-name].yalm`.
3. Find all parts tagged `[new-def]`. **Process them PART BY PART.**
   - Read the `[new-def]` section.
   - Identify what logic, tools, or knowledge it needs.
   - Write these needs into the needs section of `[feature-name].yalm` and tag them with `[new-needs]`.
4. **Rules while updating:**
   - Once all `[new-def]` parts have been mapped to needs, update the feature's status tags in `[feature-name].yalm` and `[product-name]-FEATURES.yalm` from `[new-def]` to `[new-needs]`.

#### Step 2.3: Fulfill `[new-needs]` from Data
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

---
*Note: Pipeline architecture covering Build, Launch, Brand & Marketing, and Sales & Leads phases will be added in future updates once these initial phases are confirmed 100% functional.*
