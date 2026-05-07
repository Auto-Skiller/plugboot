# PLAYBOOK: CASCADING DISCOVERY

**Purpose:** Consistently discover and track Market Focuses, Products, and Features through cascading thresholds and verifications.

## Workflow Logic

When a new discovery enters `_pipeline-discovery/`, it flows through the following validation steps:

### 1. Check for Matching Focus (in `PIPELINE-FOCUSES.yaml`)
- **No Matching Focus:** Check the threshold. Validate and create the new Focus if reached. If not reached, keep it in `_pipeline-discovery/`.
- **Matching Focus Found:** Proceed to check products within the focus.

### 2. Check for Matching Product (in `[focus-name]-PRODUCTS.yaml`)
- **No Matching Product:** Move data to `_[focus-name]-discovery/` and check the product threshold. Validate and create the new Product if reached. Keep it if not yet reached.
- **Matching Product Found:** Proceed to check features within the product.

### 3. Check for Matching Feature (in `[product-name]-FEATURES.yaml`)
- **No Matching Feature:** Move data to `_[product-name]-discovery/` and check the feature threshold. Validate and create the new Feature if reached. Keep it if not yet reached.
- **Matching Feature Found:** Move the data directly into the matched feature's `00-data/` folder.
