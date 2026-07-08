"""Agentic OS daemon — single process: sync loop + htmx dashboard + SSE.

ADR-0001: one Python process serves the dashboard, runs the sync loop, and
pushes live updates over SSE. Framework: Starlette (Decisions #1).

Run:  python .infra/backend/app.py   (or: uvicorn app:app from this dir)
"""
from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent
if str(_HERE) not in sys.path:
    sys.path.insert(0, str(_HERE))

from starlette.applications import Starlette  # noqa: E402
from starlette.responses import (  # noqa: E402
    HTMLResponse,
    JSONResponse,
    PlainTextResponse,
    FileResponse,
)
from starlette.routing import Route  # noqa: E402
from starlette.staticfiles import StaticFiles  # noqa: E402

import sync  # noqa: E402
from yaml_io import load_yaml, dump_yaml, now_iso  # noqa: E402

WORKSPACE = sync.WORKSPACE
FRONTEND = WORKSPACE / ".infra" / "frontend"
SYNC_INTERVAL = 5  # seconds

# --- SSE broadcaster -------------------------------------------------------
_subscribers: set[asyncio.Queue] = set()


async def _broadcast(event: str, data: str) -> None:
    payload = {"event": event, "data": data}
    for q in list(_subscribers):
        await q.put(payload)


# --- helpers ---------------------------------------------------------------
def _entity_root(entity: str) -> Path:
    return WORKSPACE / "_os" if entity == "os" else WORKSPACE / entity


def _yaml_path(entity: str, kind: str) -> Path:
    root = _entity_root(entity)
    prefix = "os" if entity == "os" else entity
    return root / f"{prefix}-{kind}.yaml"


def _mission_card(name: str, m: dict) -> str:
    state = m.get("state", {}) if isinstance(m, dict) else {}
    prio = (m.get("priority") or "MEDIUM") if isinstance(m, dict) else "MEDIUM"
    prog = state.get("progress", "pending")
    obj = (m.get("objective") or "") if isinstance(m, dict) else ""
    return (
        f'<div class="mission-card" data-prio="{prio}" '
        f'@click="openMission(\'{name}\')">'
        f'<div class="mc-head"><span class="mc-name">{name}</span>'
        f'<span class="badge {prio.lower()}">{prio}</span></div>'
        f'<div class="mc-obj">{obj}</div>'
        f'<div class="mc-foot"><span class="pill">{prog}</span></div>'
        f"</div>"
    )


# --- routes ----------------------------------------------------------------
async def index(request):
    return FileResponse(FRONTEND / "index.html")


async def api_state(request):
    config = load_yaml(WORKSPACE / "config.yaml")
    idx = load_yaml(WORKSPACE / "index.yaml")
    entities = ["os"] + [
        k for k in (idx.get("projects") or {}).keys()
    ]
    return JSONResponse(
        {
            "current_window": config.get("current_window", "os"),
            "entities": entities,
            "config": {
                "status": config.get("status", True),
                "autonomy": config.get("autonomy", False),
                "sync_daemon": config.get("sync_daemon", True),
            },
        }
    )


async def panel_missions(request):
    entity = request.query_params.get("entity", "os")
    phase = request.query_params.get("phase", "planning").upper()
    missions = load_yaml(_yaml_path(entity, "missions"))
    cards: list[str] = []
    for bucket in ("standard", "research"):
        for name, m in (missions.get(bucket) or {}).items():
            if not isinstance(m, dict):
                continue
            klass = (m.get("state", {}) or {}).get("class", "PLANNING")
            if klass == phase:
                cards.append(_mission_card(name, m))
    if not cards:
        cards.append('<div class="empty">No ' + phase.lower() + " missions.</div>")
    return HTMLResponse("".join(cards))


async def panel_runtime(request):
    entity = request.query_params.get("entity", "os")
    data = load_yaml(_yaml_path(entity, "runtime"))
    return PlainTextResponse(json.dumps(data, indent=2, default=str))


async def panel_board(request):
    entity = request.query_params.get("entity", "os")
    root = _entity_root(entity)
    board = root / ("os-board.md" if entity == "os" else f"{entity}-board.md")
    text = board.read_text(encoding="utf-8") if board.exists() else "# (empty board)"
    return PlainTextResponse(text)


async def panel_graph(request):
    """Cytoscape elements for the brain (os_prompts/data) or inbox/gateway."""
    entity = request.query_params.get("entity", "os")
    which = request.query_params.get("which", "brain")
    root = _entity_root(entity)
    nodes, edges = [], []
    if which == "brain":
        folder = root / ("os_prompts" if entity == "os" else f"{entity}-data")
        root_id = which
        nodes.append({"data": {"id": root_id, "label": which, "kind": "root"}})
        if folder.exists():
            for f in sorted(folder.rglob("*")):
                if f.is_file() and not f.name.startswith("."):
                    nid = str(f.relative_to(folder))
                    nodes.append({"data": {"id": nid, "label": f.name, "kind": "file"}})
                    edges.append({"data": {"source": root_id, "target": nid}})
    else:  # inbox + gateway pillars
        inbox_dir = root / ("os-inbox" if entity == "os" else f"{entity}-inbox")
        gateway = inbox_dir / ".gateway"
        nodes.append({"data": {"id": "inbox", "label": "inbox", "kind": "root"}})
        if gateway.exists():
            for pillar in sorted(p for p in gateway.iterdir() if p.is_dir()):
                pid = f"pillar:{pillar.name}"
                nodes.append({"data": {"id": pid, "label": pillar.name, "kind": "pillar"}})
                edges.append({"data": {"source": "inbox", "target": pid}})
                for grp in sorted(g for g in pillar.iterdir() if g.is_dir()):
                    gid = f"{pid}/{grp.name}"
                    nodes.append({"data": {"id": gid, "label": grp.name, "kind": "group"}})
                    edges.append({"data": {"source": pid, "target": gid}})
    return JSONResponse({"elements": {"nodes": nodes, "edges": edges}})


async def panel_toolboxes(request):
    entity = request.query_params.get("entity", "os")
    data = load_yaml(_yaml_path(entity, "toolboxes"))
    metrics = data.get("metrics", {})
    return JSONResponse({"metrics": metrics, "toolboxes": data})


async def api_toggle(request):
    """Flip a boolean in config.yaml (top-level or nested by dotted path)."""
    body = await request.json()
    key = body.get("key", "")
    config = load_yaml(WORKSPACE / "config.yaml")
    node = config
    parts = key.split(".")
    for p in parts[:-1]:
        node = node.setdefault(p, {})
    leaf = parts[-1]
    node[leaf] = not bool(node.get(leaf))
    dump_yaml(WORKSPACE / "config.yaml", config)
    await _broadcast("sync", now_iso())
    return JSONResponse({"key": key, "value": node[leaf]})


async def agent_say(request):
    """Agent output -> floating chat window (ephemeral, output-only, Decisions #4).

    Agent POSTs {kind, text}; daemon renders a bubble and pushes it over SSE.
    """
    body = await request.json()
    kind = body.get("kind", "info")
    text = (body.get("text") or "").replace("<", "&lt;")
    bubble = (
        f'<div class="bubble {kind}"><span class="bk">{kind}</span>'
        f"<span class=\"bt\">{text}</span></div>"
    )
    await _broadcast("chat", bubble)
    return JSONResponse({"ok": True})


async def events(request):
    q: asyncio.Queue = asyncio.Queue()
    _subscribers.add(q)

    async def stream():
        try:
            yield "event: hello\ndata: connected\n\n"
            while True:
                msg = await q.get()
                yield f"event: {msg['event']}\ndata: {msg['data']}\n\n"
        finally:
            _subscribers.discard(q)

    from starlette.responses import StreamingResponse

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


async def _sync_loop():
    while True:
        config = load_yaml(WORKSPACE / "config.yaml")
        if config.get("sync_daemon", True) is not False:
            try:
                sync.sync_all()
                await _broadcast("sync", now_iso())
            except Exception as exc:  # noqa: BLE001
                print(f"[daemon] sync error: {exc}")
        await asyncio.sleep(SYNC_INTERVAL)


def _on_startup():
    asyncio.get_event_loop().create_task(_sync_loop())


routes = [
    Route("/", index),
    Route("/api/state", api_state),
    Route("/api/toggle", api_toggle, methods=["POST"]),
    Route("/agent/say", agent_say, methods=["POST"]),
    Route("/panel/missions", panel_missions),
    Route("/panel/runtime", panel_runtime),
    Route("/panel/board", panel_board),
    Route("/panel/graph", panel_graph),
    Route("/panel/toolboxes", panel_toolboxes),
    Route("/events", events),
]

app = Starlette(routes=routes, on_startup=[_on_startup])
app.mount("/static", StaticFiles(directory=str(FRONTEND)), name="static")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
