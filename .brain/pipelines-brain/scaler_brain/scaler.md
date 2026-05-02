# AUTO_SKILLER

> [!IMPORTANT]
> This system is dedicated to the **System-Level Evolution** of the `open-workspace`.
>
> **Operational Status**: This sub-layer is controlled by the Root `BOARD.yaml`.
> - **Local Board**: [SCALER-BOARD.yaml](file:///c:/Users/BAB%20AL%20SAFA/Desktop/open-workspace/_pipelines/scaler/SCALER-BOARD.yaml)
> - **Global Mission**: See [Hierarchy.md](file:///c:/Users/BAB%20AL%20SAFA/Desktop/open-workspace/.brain/.core_brain/Hierarchy.md) for Multi-Layer details.
>
> For core operational rules and playbooks, refer to:
> - `\.brain\pipelines-brain\scaler_brain\mission.md`
> - `\.brain\pipelines-brain\scaler_brain\discovery-to-proposal.md`

---

## Core Operational Workflow

1. **Sync**: Run `indexes-sync.py` to update all JSON index files.
3. **Discovery Ingestion**: Read `_discoveries/discoveries.json` to identify new system-level opportunities.
4. **Multi-Level Analysis**:
   - **Architecture**: Enhancements to the workspace structure.
   - **Business**: Identifying monetization paths for the system.
   - **Capabilities**: Expanding the functional reach of the system.
4. **Proposal Routing**: Convert discoveries into formal proposals and route them to `_proposals/` subfolders (Brain, Core, Departments, Tools, etc.) as defined in `proposals.json`.

*Note: This system does not handle individual product builds or launches. It is strictly for the advancement of the underlying workspace ecosystem.*
