# Centralized OS Bridge

This file acts as the top-layer bridge connecting the Core OS missions to the specific pipeline and project missions. The `orchestration_engine` monitors this bridge to understand the global state of the workspace.

## Active Pipelines
- **Hustler Pipeline**: [View Hustler Missions](../pipelines-missions/hustler_missions/)
- **Scaler Pipeline**: [View Scaler Missions](../pipelines-missions/scaler_missions/)

## Active Projects
- *(No active projects mapped yet)*. When projects are initialized, their mission boards will be listed here, pointing to `../projects-missions/[project-name]/`.

## Core OS Status
All non-pipeline and non-project missions (like OS upgrades, Substrate engine debugging) are tracked in the Core Board:
- **Core Board**: [BOARD.yaml](BOARD.yaml)
