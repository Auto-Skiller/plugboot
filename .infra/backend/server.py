"""server.py — Starlette app: dashboard + YAML API + SSE + agent output.

Routes
  GET  /                     -> dashboard shell (frontend/index.html)
  GET  /static/*             -> frontend assets
  GET  /api/yaml?path=...     -> JSON view of a workspace YAML
  POST /api/yaml              -> patch a YAML (field/group set; simple write)
  GET  /api/md?path=...       -> raw text of a board .md
  POST /api/md                -> write a board .md (editable right panel)
  GET  /events                -> SSE stream (chat bubbles + panel-refresh pings)
  POST /agent/say             -> agent output; renders bubble, pushes over SSE

Concurrency posture: simple writes, git recovery (Decisions #2).
"""
from __future__ import annotations

import html
import json
from pathlib import Path

from starlette.applications import Starlette
from starlette.responses import (
    HTMLResponse,
    JSONResponse,
    PlainTextResponse,
    StreamingResponse,
)
from starlette.routing import Route, Mount
from starlette.staticfiles import StaticFiles

from paths import WORKSPACE, FRONTEND
from ymlio import read_yaml, write_yaml, read_text, write_text
from bus import bus


def _safe(path_str: str) -> Path:
    """Resolve a workspace-relative path and refuse escapes outside WORKSPACE."""
    p = (WORKSPACE / path_str).resolve()
    if WORKSPACE not in p.parents and p != WORKSPACE:
        raise ValueError("path escapes workspace")
    return p


async def dashboard(request):
    index = FRONTEND / "index.html"
    if index.exists():
        return HTMLResponse(index.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>Agentic OS</h1><p>frontend/index.html missing</p>")


async def api_yaml_get(request):
    path = request.query_params.get("path", "")
    try:
        doc = read_yaml(_safe(path))
    except ValueError:
        return JSONResponse({"error": "bad path"}, status_code=400)
    return JSONResponse(doc)


async def api_yaml_patch(request):
    body = await request.json()
    path = body.get("path", "")
    dotted = body.get("key", "")   # e.g. "control.status"
    value = body.get("value")
    try:
        p = _safe(path)
    except ValueError:
        return JSONResponse({"error": "bad path"}, status_code=400)
    doc = read_yaml(p)
    if not isinstance(doc, dict):
        doc = {}
    node = doc
    parts = [x for x in dotted.split(".") if x]
    for k in parts[:-1]:
        node = node.setdefault(k, {})
    if parts:
        node[parts[-1]] = value
    # mark human/agent edit for freshness bookkeeping
    fr = doc.get("freshness")
    if isinstance(fr, dict):
        import datetime as _dt
        fr["last_edited"] = _dt.datetime.now(_dt.timezone.utc).isoformat()
    write_yaml(p, doc)
    await bus.publish("refresh", path)
    return JSONResponse({"ok": True})


async def api_md_get(request):
    path = request.query_params.get("path", "")
    try:
        return PlainTextResponse(read_text(_safe(path)))
    except ValueError:
        return PlainTextResponse("bad path", status_code=400)


async def api_md_post(request):
    body = await request.json()
    try:
        p = _safe(body.get("path", ""))
    except ValueError:
        return JSONResponse({"error": "bad path"}, status_code=400)
    write_text(p, body.get("text", ""))
    await bus.publish("refresh", body.get("path", ""))
    return JSONResponse({"ok": True})


async def events(request):
    q = bus.subscribe()

    async def gen():
        try:
            async for chunk in bus.stream(q):
                yield chunk
        finally:
            bus.unsubscribe(q)

    return StreamingResponse(gen(), media_type="text/event-stream")


async def agent_say(request):
    """Agent output -> chat bubble -> SSE. htmx appends; Alpine auto-pops window."""
    body = await request.json()
    text = html.escape(str(body.get("text", "")))
    kind = html.escape(str(body.get("kind", "info")))  # info|thinking|result
    bubble = (
        f'<div class="bubble bubble-{kind}" hx-swap-oob="beforeend:#chat-log">'
        f'<span class="bubble-kind">{kind}</span>{text}</div>'
    )
    await bus.publish("chat", bubble)
    return JSONResponse({"ok": True})


routes = [
    Route("/", dashboard),
    Route("/api/yaml", api_yaml_get, methods=["GET"]),
    Route("/api/yaml", api_yaml_patch, methods=["POST"]),
    Route("/api/md", api_md_get, methods=["GET"]),
    Route("/api/md", api_md_post, methods=["POST"]),
    Route("/events", events),
    Route("/agent/say", agent_say, methods=["POST"]),
]

if FRONTEND.exists():
    routes.append(Mount("/static", app=StaticFiles(directory=str(FRONTEND)), name="static"))

app = Starlette(debug=False, routes=routes)
