# Agentic OS — Backend (daemon + dashboard server)

Single Python process (ADR-0001): the **sync daemon** and the **htmx dashboard
server** are the same process. Framework: **Starlette** (async, native SSE).

## Files

| File | Role |
|------|------|
| `paths.py` | Single source of truth for workspace paths (no tri-location drift). |
| `ymlio.py` | Simple YAML read/write (no locks, no atomic dance — Decisions #2). |
| `engine.py` | Sync tick: disk-scan -> rollup, freshness stamping, `fill_queue` detection. |
| `server.py` | Starlette app: dashboard routes, YAML view/patch, SSE channel, agent `/say`. |
| `daemon.py` | Supervisor: PID singleton, boot, runs the sync tick + serves. |

## Concurrency posture (Decisions #2)

Free editing. Simple writes. **Git is the recovery net.** No locks, no version
tokens. Field-ownership is a loose convention only: the daemon touches
engine fields (`freshness`, metrics, `fill_queue`); the agent/user touch content.

## Run

```bash
python .infra/backend/daemon.py            # supervisor: sync loop + dashboard on :8000
python .infra/backend/engine.py --once     # one sync tick, then exit
```

## The "brain" pre-fill loop (Decisions #5)

The engine detects when files/folders are added or removed under watched
folders, stamps their structural entry, and flags the gap in `fill_queue`.
The agent watches `fill_queue` and fills the semantic fields
(`description`, `contains`, `when_to_use`, ...).
