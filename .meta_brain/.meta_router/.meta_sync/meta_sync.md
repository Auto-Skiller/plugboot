# ⚙️ Master Sync Engine v5 (Agentic OS)
> **Schema Version:** 5.1 | Master Orchestrator

**Role:** The central nervous system for workspace synchronization. It triggers all specialized sync protocols and re-assembles the `meta_router.yaml` and `CONTROLER.yaml` to ensure a "Zero-Drift" state.

## 📦 Output Schemas (Enforced)

### 1. CONTROLER.yaml Telemetry Block
```yaml
telemetry:
  sync_count: integer
  last_sync: timestamp
  overall_health: string       # e.g., "90%"
  health_history:              # Last 10 syncs
    - ts: timestamp
      health: string
      sessions: integer
  peak_session_count: integer
  toolbox_readiness:
    total: integer
    functional: integer
    empty: integer
```

### 2. meta_router.yaml Identity Block
```yaml
brain:
  identity_standards:
    description: string
    when_to_use: string
    files:
      [file_name]:
        path: string
        description: string    # Auto-extracted
        when_to_use: string    # Auto-extracted
```

---

## ⚙️ Execution Steps (Protocol)

### 1. Orchestration
- Trigger the 5 decentralized sync engines: Runtime, Milestones, Toolboxes, Pipelines, Projects.

### 2. Identity Synchronization
- Scan `meta_identity/*.md` files and extract `Purpose` and `When to use`.

### 3. Master Re-Assembly
- Rebuild `meta_router.yaml` by pulling updated metadata from child routers.

### 4. Controller State & Telemetry
- Update `CONTROLER.yaml` with global health, active session summaries, and rolling telemetry.

### 5. Structural Validation (`--validate`)
- Check physical disk existence for all paths defined in routers.
