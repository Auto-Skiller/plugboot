# HUSTLER ARCHITECTURE & TAGGING

This document outlines the directory structure and the tracking/tagging system for the Product Pipeline.

## 1. Directory Architecture Overview

```
_pipelines/hustler/
├── [focus-name]/                       # A **validated** Focus folder
│   ├── [focus-name]-PRODUCTS.yaml      # Focus-level tracker of all products
│   ├── _[focus-name]-discovery/        # Focus Products discovery & ranking
│   └── [product-name]/                 # A **validated** Product folder
│       ├── [product-name]-FEATURES.yaml # Product-level tracker of all features
│       ├── _[product-name]-discovery/  # Product features discovery & ranking
│       └── [feature-name]/             # A **validated** Feature folder
│           ├── [feature-name].yaml     # Feature-level definitions, needs, and tracking
│           ├── 00-data/                # Phase 1: Storage for raw/scraped data
│           └── 01-requirements/        # Phase 2: Feature definitions & needs assets/extracted files
```

Note: Global session boards are now centralized in `.missions/pipelines-missions/hustler_missions/Hustler_missions.yaml`.


---

## 2. Trackers and Tagging System

The system uses `.yalm` files across different levels to track progress and flag when lower levels require attention:

- **`PIPELINE-FOCUSES.yalm`**: Tracks all validated Focuses. Can include high-level tags to indicate if a focus has pending work underneath.
- **`[focus-name]-PRODUCTS.yalm`**: Tracks all validated Products under a Focus.
- **`[product-name]-FEATURES.yalm`**: Tracks all validated Features under a Product. It surfaces feature-level status tags so we know a feature needs processing.
- **`[feature-name].yalm`**: Contains the definitions and needs specifically for the feature. All feature-specific tagging (`[new-def]`, `[new-needs]`) is tracked here.
