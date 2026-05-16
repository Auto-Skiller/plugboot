# 🏭 Pipelines Sync Protocol (Agentic OS v5)
> **Schema Version:** 1.0 | Canonical source of truth: `_pipelines/` → `pipelines.yaml`

**Role:** Synchronize the state and metadata of all active continuous execution pipelines (Scaler, Hustler, etc.).

## 📦 File Schema (Enforced)

### Pipeline Inner Router (`[pipeline]_router.yaml`)
Located in the root or `.brain/` of each pipeline.
```yaml
description: string
when_to_use: string
schema_version: string
status: active | paused | archived

# Optional blocks pulled by the sync engine:
metadata:
  purpose: string
  owner: string

routing_instructions: [string]

components:
  [group_name]:
    path: string
    description: string
```

---

## ⚙️ Execution Steps (Protocol)

### 1. Metadata Synchronization
- Read individual pipeline routers.
- Extract `description`, `when_to_use`, and `status`.

### 2. State & Gateway Synchronization
- **Scaler:** Trigger `scaler_sync.py` and update `SCALER-STATE.yaml` telemetry.
- **Hustler:** Trigger `sync_hustler.py` and update `HUSTLER-STATE.yaml` telemetry.

### 3. Router Consistency
- Update the master `pipelines.yaml` with the latest metadata and operational status.
