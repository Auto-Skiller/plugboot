# Local Pipelines

> [!NOTE]
> This folder (`.assets_managment-pipelines/`) contains local pipeline blueprints that apply ONLY to this bounded context.
> Global shared pipelines (like Scaler and Hustler) live in `_shared/.shared-pipelines/`.

## How to Create Local Pipelines
1. Create a folder for your pipeline: `.assets_managment-pipelines/<pipeline_name>/`
2. Define the pipeline runbook (`<pipeline_name>.md`) and contracts (`CONTRACTS.yaml`).
3. Activate the pipeline in your `board.yaml` under `local_pipelines`.
4. Execution happens in the `.assets_managment-pipelines_runtime/` folder.
