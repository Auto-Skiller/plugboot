# ⚙️ Orchestrator Engine

**Location:** `.brain/orchestrator.engine.md`
**Type:** Agent Protocol
**Purpose:** Defines how and when to chain the sub-engines (Navigator, Cataloger, Router).

## The Sub-Engines

| Engine | Type | Role |
|--------|------|------|
| **Navigator** | Programmatic | Scans directory paths and outputs structural data (`last_modified`, sizes). |
| **Cataloger** | Hybrid | Compares scan to existing index, flags changes, generates/writes descriptions. |
| **Router** | Agent Read | Reads verified catalogs and task specs to decide exactly what tools/agents to use. |

## Engine Chaining Modes

Engines can run individually, in pairs, or as a full chain depending on the context:

| Mode | Engines Used | Trigger / Use Case |
|------|--------------|--------------------|
| **Full Chain** | Navigator → Cataloger → Router | System Boot, First-time setup, or resolving `status: stale` |
| **Index Refresh**| Navigator → Cataloger | A scope was modified, index needs updating without routing |
| **Re-Catalog** | Cataloger only | Force regenerating descriptions without structural rescan |
| **Route Only** | Router only | Registries are `verified`; fast-path to execution |
| **Scan Only** | Navigator only | Quick programmatic structure check |

## Execution Rules

1. **Agent Orchestration**: The Agent acts as the Orchestrator. The Agent decides which chain to run based on the `status` field inside the `.catalog.yaml` files.
2. **Never Route on Stale**: If a index is `status: stale`, the Router CANNOT use it. It must trigger Navigator → Cataloger first.
3. **Execution Pipeline**: `Orchestrator` is not a script. It is the protocol *you* follow to call the other engines.
