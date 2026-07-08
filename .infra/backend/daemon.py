"""
Agentic OS v7 - single-process daemon + dashboard server (Starlette).

Per ADR-0001 + Decisions doc:
  - Sync loop: scan disk, stamp freshness, detect added/removed files, flag gaps
    in each entity's runtime.fill_queue.
  - Serve the htmx dashboard.
  - SSE channel for the floating agent chat window (/events).
  - Agent output intake (/agent/say) -> pushed to browser over SSE.

Concurrency posture (Decisions #2): NO locks, NO atomic-write dance, NO version
tokens for v1. Simple writes. Git is the recovery net.
"""
import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path

from ruamel.yaml import YAML
from starlette.applications import Starlette
from starlette.responses import JSONResponse, StreamingResponse, FileResponse
from starlette.routing import Route
from starlette.staticfiles import StaticFiles

yaml = YAML()
yaml.preserve_quotes = True
yaml.indent(mapping=2, sequence=4, offset=2)

WORKSPACE = Path(__file__).resolve().parents[2]
CONFIG = WORKSPACE / "config.yaml"
INDEX = WORKSPACE / "index.yaml"
FRONTEND = WORKSPACE / ".infra" / "frontend"
SYNC_INTERVAL = 5

_subscribers: set = set()


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def read_yaml(path):
    try:
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return yaml.load(f) or {}
    except Exception as e:
        print(f"[read] {path}: {e}")
    return {}


def write_yaml(path, data):
    # Simple write (Decisions #2). Git is recovery.
    try:
        with open(path, "w", encoding="utf-8") as f:
            yaml.dump(data, f)
    except Exception as e:
        print(f"[write] {path}: {e}")


def stamp_freshness(block):
    fr = block.setdefault("freshness", {})
    fr["sync_status"] = "fresh"
    fr["sync_count"] = int(fr.get("sync_count") or 0) + 1
    fr["last_synced"] = now_iso()
    return block


def list_entities(config):
    ents = []
    if config.get("status", True):
        ents.append(("os", WORKSPACE / "_os"))
    for key, val in config.items():
        if isinstance(val, dict) and val.get("status") and (WORKSPACE / key).is_dir():
            ents.append((key, WORKSPACE / key))
    return ents


def detect_fill_gaps(entity_root, prefix):
    fq = {"vars": [], "os_prompts/data": [], "missions": [], "toolboxes": [], "inbox": []}
    inbox_dir = entity_root / f"{prefix}-inbox"
    if inbox_dir.is_dir():
        for item in inbox_dir.iterdir():
            if not item.name.startswith("."):
                fq["inbox"].append(item.name)
    data_dir = entity_root / f"{prefix}-data"
    if data_dir.is_dir():
        for item in data_dir.rglob("*"):
            if item.is_file() and not item.name.startswith("."):
                fq["os_prompts/data"].append(str(item.relative_to(WORKSPACE)))
    return fq


def sync_entity(name, root):
    prefix = "os" if name == "os" else name
    runtime_path = root / f"{prefix}-runtime.yaml"
    runtime = read_yaml(runtime_path)
    if not runtime:
        return
    stamp_freshness(runtime)
    runtime["fill_queue"] = detect_fill_gaps(root, prefix)
    write_yaml(runtime_path, runtime)
    for fname in (f"{prefix}-missions.yaml", f"{prefix}-toolboxes.yaml", f"{prefix}-inbox.yaml"):
        p = root / fname
        data = read_yaml(p)
        if data:
            stamp_freshness(data)
            write_yaml(p, data)
    print(f"[sync] {name} @ {now_iso()}")


def sync_cycle():
    config = read_yaml(CONFIG)
    if not config or not config.get("sync_daemon", True):
        return  # paused for safe manual audit
    stamp_freshness(config)
    write_yaml(CONFIG, config)
    idx = read_yaml(INDEX)
    if idx:
        stamp_freshness(idx)
        write_yaml(INDEX, idx)
    for name, root in list_entities(config):
        try:
            sync_entity(name, root)
        except Exception as e:
            print(f"[sync] {name} failed: {e}")


async def sync_loop():
    while True:
        sync_cycle()
        await asyncio.sleep(SYNC_INTERVAL)


async def homepage(request):
    return FileResponse(FRONTEND / "index.html")


async def api_config(request):
    return JSONResponse(read_yaml(CONFIG))


async def api_entity(request):
    name = request.path_params["name"]
    root = WORKSPACE / ("_os" if name == "os" else name)
    prefix = "os" if name == "os" else name
    return JSONResponse({
        "runtime": read_yaml(root / f"{prefix}-runtime.yaml"),
        "missions": read_yaml(root / f"{prefix}-missions.yaml"),
        "toolboxes": read_yaml(root / f"{prefix}-toolboxes.yaml"),
        "inbox": read_yaml(root / f"{prefix}-inbox.yaml"),
    })


async def agent_say(request):
    body = await request.json()
    payload = json.dumps({
        "kind": body.get("kind", "info"),
        "text": body.get("text", ""),
        "at": now_iso(),
    })
    for q in list(_subscribers):
        await q.put(payload)
    return JSONResponse({"ok": True})


async def sse_events(request):
    q = asyncio.Queue()
    _subscribers.add(q)

    async def stream():
        try:
            yield "event: ping\ndata: connected\n\n"
            while True:
                payload = await q.get()
                yield f"event: message\ndata: {payload}\n\n"
        finally:
            _subscribers.discard(q)

    return StreamingResponse(stream(), media_type="text/event-stream")


async def on_startup():
    asyncio.create_task(sync_loop())
    print(f"[daemon] Agentic OS v7 up. Workspace: {WORKSPACE}")


routes = [
    Route("/", homepage),
    Route("/api/config", api_config),
    Route("/api/entity/{name}", api_entity),
    Route("/agent/say", agent_say, methods=["POST"]),
    Route("/events", sse_events),
]

app = Starlette(debug=True, routes=routes, on_startup=[on_startup])
app.mount("/static", StaticFiles(directory=str(FRONTEND)), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
