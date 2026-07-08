# Agentic OS — Backend (v7)

Single-process Python daemon that syncs the workspace YAMLs and serves the
dashboard. See ADR-0001 for the architecture decision.

## Modules

| File | Role |
|------|------|
| `paths.py` | Canonical workspace paths. One source of truth, no guessing. |
| `yamlio.py` | YAML load/dump. Simple writes (no lock/atomic) — git is recovery. |
| `entities.py` | Resolves OS + project file/folder paths (the six-part anatomy). |
| `sync.py` | The sync engine: brain/inbox reconcile, `fill_queue`, freshness, rollups. |
| `server.py` | Starlette app: dashboard, SSE channel, YAML read/write, sync loop. |
| `boot.py` | PID-singleton supervisor; launches uvicorn on :8000. |

## Run

```bash
# from the workspace root, inside the venv
pip install -r requirements.txt
python .infra/backend/boot.py
# dashboard: http://localhost:8000
```

One-shot sync (no server):

```bash
python .infra/backend/sync.py
```

## Concurrency posture

Free editing, simple writes, **git is the recovery net**. No locks, no atomic
writes, no version tokens in v1. Revisit only if a real clobber shows up
during a long autonomous run (Decisions doc #2).

## What the engine does each cycle

1. Skips entirely if `config.yaml → sync_daemon` is off (audit kill-switch).
2. Discovers entities: `_os` + every project registered in `index.yaml`.
3. Reconciles the brain listing (`os_prompts` / `data`) against disk; new
   files get a stub + are flagged in `runtime.fill_queue` for an agent to
   fill semantics (hybrid brain).
4. Reconciles inbox `.gateway/<pillar>/<group>/` the same way.
5. Stamps `freshness` on every touched YAML.
6. Computes light mission / toolbox / inbox rollups.
