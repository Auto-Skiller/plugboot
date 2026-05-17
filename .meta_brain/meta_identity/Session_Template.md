# 📑 Session and Goal Template (v5)

This template defines the required structure for creating sessions and goals in `CONTROLER.yaml` and the corresponding physical files in `.meta_brain/milestones/`.

> [!IMPORTANT]
> **Single Source of Truth**: The raw YAML schemas for these files have been extracted to avoid duplication. Please refer to the technical schemas for the exact field definitions and validation rules:
> *   **[meta_sync_schemas.yaml](../.meta_engine/meta_sync_schemas.yaml)** (For Controller entries)
> *   **[milestones_schemas.yaml](../.meta_engine/milestones.engine/milestones_schemas.yaml)** (For Session and Goal files)

## 📌 Usage Guidelines

1. **Goal files are living documents.** As work progresses, update `execution.state.tracking` with current status, add completed tasks, and link newly generated artifacts.
2. The **Sync Engine** (now in `.meta_routing/.meta_engines/`) will automatically calculate progress and health based on these files.
