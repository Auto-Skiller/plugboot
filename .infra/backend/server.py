"""Starlette app: dashboard server + SSE channel + YAML read/write endpoints.

Single process (ADR-0001). On startup it launches a background task that runs
the sync engine every INTERVAL seconds (respecting the `sync_daemon` kill
switch in config.yaml).

Endpoints
  GET  /                       -> dashboard (frontend/index.html)
  GET  /sse                    -> Server-Sent Events stream (chat bubbles, sync ticks)
  POST /api/agent/say          -> agent pushes a chat bubble (json/form: text, kind)
  GET  /api/entity/{name}/{doc}-> read a parsed YAML doc as JSON
  PUT  /api/entity/{name}/{doc}-> write a YAML doc (proposal from dashboard)
  POST /api/sync               -> trigger one sync cycle now
"""
from __future__ import annotations

import asyncio
import html as _html
import json
import os
import sys

from starlette.applications import Starlette
from starlette.responses import (
    HTMLResponse,
    JSONResponse,
    PlainTextResponse,
    StreamingResponse,
)
from starlette.routing import Route
from starlette.staticfiles import StaticFiles

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import paths      # noqa: E402
import yamlio     # noqa: E402
import entities   # noqa: E402
import sync       # noqa: E402

INTERVAL = 5  # seconds between sync cycles


class Hub:
    """Fan-out of SSE events to all connected browsers."""

    def __init__(self) -> None:
        self._subs: set[asyncio.Queue] = set()

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        self._subs.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        self._subs.discard(q)

    async def publish(self, event: str, data: str) -> None:
        for q in list(self._subs):
            try:
                q.put_nowait((event, data))
            except Exception:  # noqa: BLE001
                self._subs.discard(q)


hub = Hub()


def _entity_by_name(name: str):
    return entities.os_entity() if name in ("os", "_os") else entities.project_entity(name)


def _doc_path(name: str, doc: str):
    ent = _entity_by_name(name)
    return {
        "runtime": ent.runtime,
        "missions": ent.missions,
        "toolboxes": ent.toolboxes,
        "inbox": ent.inbox,
        "brain": ent.brain,
    }.get(doc)


# --- routes ---------------------------------------------------------------

async def dashboard(request):
    index_html = paths.FRONTEND / "index.html"
    if index_html.exists():
        return HTMLResponse(index_html.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>Agentic OS</h1><p>Dashboard not built yet.</p>")


async def sse(request):
    q = hub.subscribe()

    async def gen():
        try:
            yield b": connected\n\n"
            while True:
                event, data = await q.get()
                yield f"event: {event}\ndata: {data}\n\n".encode("utf-8")
        finally:
            hub.unsubscribe(q)

    return StreamingResponse(gen(), media_type="text/event-stream")


def _render_bubble(kind: str, text: str) -> str:
    return f'<div class="bubble bubble-{_html.escape(kind)}">{_html.escape(text)}</div>'


async def agent_say(request):
    ct = request.headers.get("content-type", "")
    if ct.startswith("application/json"):
        body = await request.json()
    else:
        body = dict(await request.form())
    text = (body.get("text") or "").strip()
    kind = body.get("kind") or "info"
    if not text:
        return JSONResponse({"ok": False, "error": "empty text"}, status_code=400)
    # SSE data must be single-line; collapse newlines into <br>.
    bubble = _render_bubble(kind, text).replace("\n", "<br>")
    await hub.publish("bubble", bubble)
    return JSONResponse({"ok": True})


async def read_doc(request):
    name = request.path_params["name"]
    doc = request.path_params["doc"]
    p = _doc_path(name, doc)
    if p is None:
        return JSONResponse({"ok": False, "error": "unknown doc"}, status_code=404)
    return JSONResponse({"ok": True, "doc": doc, "data": yamlio.load(p)})


async def write_doc(request):
    name = request.path_params["name"]
    doc = request.path_params["doc"]
    p = _doc_path(name, doc)
    if p is None:
        return JSONResponse({"ok": False, "error": "unknown doc"}, status_code=404)
    data = await request.json()
    payload = data.get("data", data)
    if isinstance(payload, dict):
        fr = payload.get("freshness")
        if isinstance(fr, dict):
            fr["last_edited"] = sync.now_iso()
    yamlio.dump(p, payload)
    await hub.publish("synced", json.dumps({"doc": f"{name}/{doc}", "by": "dashboard"}))
    return JSONResponse({"ok": True})


async def trigger_sync(request):
    result = sync.sync_once()
    await hub.publish("synced", json.dumps(result))
    return JSONResponse({"ok": True, "result": result})


# --- background sync loop -------------------------------------------------

async def _sync_loop():
    while True:
        try:
            result = sync.sync_once()
            if not result.get("skipped"):
                await hub.publish("synced", json.dumps(result))
        except Exception as e:  # noqa: BLE001
            print(f"[server] sync loop error: {e}")
        await asyncio.sleep(INTERVAL)


async def _on_startup():
    paths.ensure_runtime_dirs()
    asyncio.create_task(_sync_loop())


routes = [
    Route("/", dashboard),
    Route("/sse", sse),
    Route("/api/agent/say", agent_say, methods=["POST"]),
    Route("/api/entity/{name}/{doc}", read_doc, methods=["GET"]),
    Route("/api/entity/{name}/{doc}", write_doc, methods=["PUT"]),
    Route("/api/sync", trigger_sync, methods=["POST"]),
]

app = Starlette(debug=False, routes=routes, on_startup=[_on_startup])

if paths.FRONTEND.exists():
    app.mount("/static", StaticFiles(directory=str(paths.FRONTEND)), name="static")
