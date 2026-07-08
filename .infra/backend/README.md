# Agentic OS — Backend Daemon

Single Python process (ADR-0001): runs the **sync loop**, serves the **htmx
dashboard**, and pushes live updates over **SSE**. Framework: Starlette.

## Run

```bash
python -m venv .stash/.venv/venv
. .stash/.venv/venv/bin/activate      # Windows: .stash\.venv\venv\Scripts\activate
pip install -r .infra/backend/requirements.txt
python .infra/backend/app.py          # http://127.0.0.1:8000
```

## Pieces

| File | Role |
|------|------|
| `yaml_io.py` | load/dump + freshness stamping. Simple writes; git is recovery (ADR-0001). |
| `sync.py` | scan entities, maintain `fill_queue`, roll up metrics, rebuild index. |
| `app.py` | Starlette app: panels, toggles, `/agent/say`, `/events` (SSE), sync loop. |

## Concurrency posture

No locks, no atomic dance, no version tokens for v1. Writers (daemon, dashboard,
agent, user) edit freely. A corrupt/clobbered YAML is one `git checkout` away.
Revisit only if a real clobber shows up during a long autonomous run.

## Endpoints

- `GET /` — dashboard shell
- `GET /api/state` — window + entity list + high-level config
- `POST /api/toggle` `{key}` — flip a config boolean (dotted path ok)
- `POST /agent/say` `{kind,text}` — agent output -> chat window (SSE)
- `GET /panel/{missions,runtime,board,graph,toolboxes}` — htmx fragments / JSON
- `GET /events` — SSE stream (`sync`, `chat`)
