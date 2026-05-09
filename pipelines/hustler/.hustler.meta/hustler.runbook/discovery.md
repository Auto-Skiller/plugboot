# PLAYBOOK: CASCADING DISCOVERY

## Objective
**Purpose:** Consistently discover and track Market Focuses, Products, and Features through cascading thresholds and verifications.

## Steps
### Workflow Logic

When a new discovery enters `_pipeline-discovery/`, it flows through the following validation steps:

### 1. Check for Matching Focus (in `PIPELINE-FOCUSES.yalm`)
- **No Matching Focus:** Check the threshold. Validate and create the new Focus if reached. If not reached, keep it in `_pipeline-discovery/`.
- **Matching Focus Found:** Proceed to check products within the focus.

### 2. Check for Matching Product (in `[focus-name]-PRODUCTS.yalm`)
- **No Matching Product:** Move data to `_[focus-name]-discovery/` and check the product threshold. Validate and create the new Product if reached. Keep it if not yet reached.
- **Matching Product Found:** Proceed to check features within the product.

### 3. Check for Matching Feature (in `[product-name]-FEATURES.yalm`)
- **No Matching Feature:** Move data to `_[product-name]-discovery/` and check the feature threshold. Validate and create the new Feature if reached. Keep it if not yet reached.
- **Matching Feature Found:** Move the data directly into the matched feature's `00-data/` folder.
