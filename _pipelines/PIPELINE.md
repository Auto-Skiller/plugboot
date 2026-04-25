# PIPELINE RULEBOOK

This document outlines the operational architecture, folder structures, and tagging workflows for the Pipeline System. The pipeline is designed to autonomously discover Market Focuses (product opportunities), transform raw data into requirements, and eventually build and sell products.

Currently, this document covers the **General `_market-discovery` phase** and the **Internal phases** (`00-data`, and `01-requirements`).

---

## 1. Directory Architecture Overview

```
_pipelines/
├── PIPELINE-FOCUSES.md               # High-level tracker of all focuses and products
├── PIPELINE.md                       # This rulebook
├── _market-discovery/                    # Phase 0: Market Focuses and products discovery & ranking
└── [focus-name]/                         # A **validated** Focus folder
    ├── [focus-name]-PRODUCTS.md          # Focus-level tracker of all products and features
    └── [product-name]/                       # A **validated** Product folder
            ├── [product-name]-FEATURES.md    # Product-level tracker of all features
            ├── 00-data/              # Phase 1: Storage for raw/scraped data
            └── 01-requirements/      # Phase 2: Product and feature definitions & needs
```

---

## 2. Phase 0: `_discovery/` (Market Focus Discovery & Ranking)

**Purpose:** Consistently discover and track Market Focuses (trending topics, automations, freelance services) from platforms like YouTube, Facebook groups, Instagram pages, etc.

**Location:** `_pipelines/pipelines/_discovery/`

### Workflow Rules
When scraping or discovering new market intent or raw data:
1. **Name appropriately:** File names must immediately indicate what the data is about (e.g., `youtube-ecommerce-trends.md`).
2. **Check for Matching Product:**
   - **If it matches an existing Focus (Product):**
     1. Tag the file with `[new-data]`.
     2. Move it immediately into that product's `00-data/` folder.
   - **If it does NOT match (Possible New Opportunity):**
     1. Add it to the tracker (e.g., `discoveries.csv`).
     2. Check if there are similar non-matching items reaching a **threshold** (e.g., 5 related items).
     3. **Threshold Reached:** It becomes a Confirmed Product Opportunity. Create a new `[focus-name]/` folder, tag all 5+ items with `[new-data]`, and move them to its `00-data/` sub-folder.
     4. **Threshold Not Reached:** Keep it stored in `_discovery/` until more related data is found.

---

## 3. Confirmed Focus/Product Folders

When a Focus is confirmed, create a dedicated folder inside `_pipelines/pipelines/` named after the product (e.g., `_pipelines/pipelines/algerian-ecommerce/`).

**Required Root Files:**
- `PIPELINE.md`: Tracks the operational status and progress of the product and its features across pipeline steps. Updates continuously.
- `PRODUCT.md`: The central summary document listing the product overview and summarizing all feature capabilities.

---

## 4. Phase 1: `00-data/` (Data Storage)

**Purpose:** Storage for raw scraped data or data imported from `_discovery/`.

**Location:** `_pipelines/pipelines/[focus-name]/00-data/`

### Tagging Rules
- **Strict Requirement:** EVERY file inside `00-data/` must contain a tag indicating its state.
- `[new-data]`: Freshly imported data that has not yet been processed for requirements.
- `[processed-data]`: Data that has already been read and mapped into product/feature definitions.
- `[new-scraped]`: Data explicitly scraped to fill a specific requirements gap (see Phase 2).

---

## 5. Phase 2: `01-requirements/` (Definitions & Needs)

**Purpose:** Define detailed product capabilities and feature requirements based on opportunities found in `00-data/`. Identify and gather required logic, knowledge, tools, and materials.

**Location:** `_pipelines/pipelines/[focus-name]/01-requirements/`

### File Structure
- `_product-def.md`: Product-level definitions.
- `_product-needs.md`: Product-level needs.
- `_product-needs/`: Folder for product-level extracted files/assets.
- `[feature-name]-def.md`: Definition for a specific feature.
- `[feature-name]-needs.md`: Needs for a specific feature.
- `[feature-name]-needs/`: Folder for feature-level extracted files/assets.

### Workflow: Step-by-Step Processing

#### Step 2.1: Process `[new-data]` into Definitions
1. Look for all files tagged `[new-data]` in `00-data/`. **Process them ONE BY ONE.**
2. Read the data alongside `_product-def.md` and `PRODUCT.md` to identify opportunities.
   - **Extend Opportunities:** Update relevant `[feature-name]-def.md` or `_product-def.md`.
   - **New Features:** Create a new `[feature-name]-def.md`.
3. **Rules while updating:**
   - Add a `[new-def]` tag next to the added/updated part in the definition file, and list the used data files alongside the tag (so we know where it came from).
   - Update `PRODUCT.md` with a `[new-def]` tag next to the feature name.
   - Change the tag in the original data file from `[new-data]` to `[processed-data]`.

#### Step 2.2: Process `[new-def]` into Needs
1. Look for all features marked `[new-def]` in `PRODUCT.md`. **Process them ONE BY ONE.**
2. Open the matching `[feature-name]-def.md` (or `_product-def.md`).
3. Find all parts tagged `[new-def]`. **Process them PART BY PART.**
   - Read the `[new-def]` section.
   - Identify what logic, tools, or knowledge it needs.
   - Write these needs into the matching `[feature-name]-needs.md` (or `_product-needs.md`) and tag them with `[new-needs]`.
4. **Rules while updating:**
   - Once all `[new-def]` parts in a definition file have been mapped to needs, update the feature's tag in `PRODUCT.md` from `[new-def]` to `[new-needs]`.

#### Step 2.3: Fulfill `[new-needs]` from Data
1. Look for all features marked `[new-needs]` in `PRODUCT.md`. **Process them ONE BY ONE.**
2. Open the matching `[feature-name]-needs.md` (or `_product-needs.md`).
3. Find all parts tagged `[new-needs]`. **Process them PART BY PART.**
   - Read the need, and look up the data files referenced in the original `[new-def]`.
   - Read those specific data files (which should now be tagged `[processed-data]`).
   - **If the need can be extracted directly:** Copy or extract the content into the matching `[feature-name]-needs/` folder.
   - **If the need CANNOT be extracted (Data Gap):**
     1. Scrape the internet specifically for this missing logic/knowledge.
     2. Save the new raw data into `00-data/` with the tag `[new-scraped]`.
     3. Ensure this specific `[new-scraped]` file marks which feature/need it was scraped for (e.g., `<!-- Scraped for: feature-X -->`).
     4. Update the `[new-needs]` part using this new data, and copy/extract it to the `[feature-name]-needs/` folder.
     5. *Double-Processing Prevention:* By explicitly marking `[new-scraped]` files with the feature name they were acquired for, we prevent processing them twice for the *same* feature. However, they remain available if another feature's workflow requires them in the future.

---
*Note: Pipeline architecture covering Build, Launch, Brand & Marketing, and Sales & Leads phases will be added in future updates once these initial phases are confirmed 100% functional.*
