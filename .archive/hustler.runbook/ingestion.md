# PLAYBOOK: PHASE 1 - DATA INGESTION

**Purpose:** Storage and tagging for raw scraped data or data successfully cascaded down from the discovery phases.

**Location:** `_pipeline/[focus-name]/[product-name]/[feature-name]/00-data/`

## Tagging Rules
- **Strict Requirement:** EVERY file inside `00-data/` must contain a tag indicating its state.
- `[new-data]`: Freshly imported data that has not yet been processed for requirements.
- `[processed-data]`: Data that has already been read and mapped into feature definitions.
- `[new-scraped]`: Data explicitly scraped to fill a specific requirements gap (see Phase 2).
