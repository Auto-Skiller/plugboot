"""
Agentic OS — single-process daemon + dashboard server.

Decisions (see ADR-0001 + Decisions doc):
  - Starlette single process: sync loop + htmx dashboard + SSE in one runtime.
  - Simple writes, no locks/atomic dance. Git is the recovery net.
  - Hybrid brain: daemon detects file add/remove, stamps structure, flags gaps
    in `fill_queue`; the agent fills the semantic fields.
  - Freshness contract stamped every cycle.
  - Aspects (fixed, in os_prompt): Architecture | Capabilities | Monetization.
  - Pillars: dynamic, live in the runtime yaml.

Run:
  python -m uvicorn engine:app --host 127.0.0.1 --port 8000
  (uvicorn is started for you when run as __main__)
"""
from __future__ import annotations

import asyncio
import json
import time
from datetime import datetime, timezone
from pathlib import Path

from ruamel.yaml import YAML
from starlette.applications import Starlette
from starlette.responses import (
    JSONResponse,
    PlainTextResponse,
    HTMLResponse,
    FileResponse,
)
from starlette.requests import Request
from starlette.routing import Route, Mount
from starlette.staticfiles import StaticFiles

# ------------------------------------------------------------------ paths
WORKSPACE = Path(__file__).resolve().parents[2]
CONFIG_FILE = WORKSPACE / "config.yaml"
INDEX_FILE = WORKSPACE / "index.yaml"
FRONTEND = WORKSPACE / ".infra" / "frontend"
OS_ROOT = WORKSPACE / "_os"

# Reserved top-level names that are NOT project entities.
RESERVED = {".infra", ".stash", ".scratch", "_os", ".git"}

_yaml = YAML()
_yaml.preserve_quotes = True
_yaml.indent(mapping=2, sequence=4, offset=2)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def read_yaml(path: Path) -> dict:
    try:
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return _yaml.load(f) or {}
    except Exception as e:  # noqa: BLE001
        print(f"[engine] read error {path}: {e}")
    return {}


def write_yaml(path: Path, data: dict) -> None:
    """Simple write. No atomic dance (see ADR-0001 concurrency posture)."""
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            _yaml.dump(data, f)
    except Exception as e:  # noqa: BLE001
        print(f"[engine] write error {path}: {e}")


def stamp_freshness(data: dict, *, syncing: bool = False) -> dict:
    fr = data.setdefault("freshness", {})
    fr["sync_status"] = "syncing" if syncing else "fresh"
    fr["last_synced"] = now_iso()
    fr["sync_count"] = int(fr.get("sync_count", 0) or 0) + 1
    fr.setdefault("last_edited", now_iso())
    return data


# ------------------------------------------------------------------ entities
def list_entities() -> list[str]:
    """'os' plus every non-reserved top-level folder that looks like a project."""
    entities = ["os"]
    for p in sorted(WORKSPACE.iterdir()):
        if p.is_dir() and p.name not in RESERVED and not p.name.startswith("."):
            # a project folder is one that carries a *-board.md or *-runtime.yaml
            if any(p.glob("*-runtime.yaml")) or any(p.glob("*-board.md")):
                entities.append(p.name)
    return entities


def entity_root(entity: str) -> Path:
    return OS_ROOT if entity == "os" else (WORKSPACE / entity)


def entity_prefix(entity: str) -> str:
    return "os" if entity == "os" else entity


def entity_files(entity: str) -> dict[str, Path]:
    root = entity_root(entity)
    pre = entity_prefix(entity)
    if entity == "os":
        return {
            "board": root / "os-board.md",
            "runtime": root / "os-runtime.yaml",
            "missions": root / "os-missions.yaml",
            "toolboxes": root / "os-toolboxes.yaml",
            "inbox": root / "os-inbox.yaml",
            "os_prompts": root / "os_prompts.yaml",
        }
    return {
        "board": root / f"{pre}-board.md",
        "runtime": root / f"{pre}-runtime.yaml",
        "missions": root / f"{pre}-missions.yaml",
        "toolboxes": root / f"{pre}-toolboxes.yaml",
        "inbox": root / f"{pre}-inbox.yaml",
        "data": root / f"{pre}-data.yaml",
    }


# ------------------------------------------------------------------ fill_queue
def _scan_folder(folder: Path) -> set[str]:
    if not folder.exists():
        return set()
    return {
        str(p.relative_to(WORKSPACE)).replace("\\", "/")
        for p in folder.rglob("*")
        if p.is_file() and not p.name.startswith(".")
    }


def reconcile_fill_queue(entity: str) -> None:
    """Detect files that exist on disk but have no described entry yet, and flag
    them in runtime.fill_queue so the agent knows what semantics to fill."""
    files = entity_files(entity)
    runtime = read_yaml(files["runtime"])
    if not runtime:
        return
    fq = runtime.setdefault("fill_queue", {})

    root = entity_root(entity)
    pre = entity_prefix(entity)
    data_folder = root / ("os_prompts" if entity == "os" else f"{pre}-data")
    inbox_folder = root / ("os-inbox" if entity == "os" else f"{pre}-inbox")

    fq["os_prompts/data"] = sorted(_scan_folder(data_folder))
    fq["inbox"] = sorted(_scan_folder(inbox_folder))
    fq.setdefault("missions", [])
    fq.setdefault("toolboxes", [])
    fq.setdefault("vars", [])

    stamp_freshness(runtime)
    write_yaml(files["runtime"], runtime)


def roll_up_missions(entity: str) -> dict:
    """Compute lightweight mission metrics for the dashboard."""
    files = entity_files(entity)
    missions = read_yaml(files["missions"])
    counts = {"planning": 0, "execution": 0, "total": 0}
    for model in ("standard", "research"):
        block = missions.get(model) or {}
        for _name, m in block.items():
            if not isinstance(m, dict):
                continue
            counts["total"] += 1
            klass = (m.get("state", {}) or {}).get("class")
            if klass == "PLANNING":
                counts["planning"] += 1
            elif klass == "EXECUTION":
                counts["execution"] += 1
    evo = missions.get("evolution") or {}
    for _mode, block in evo.items():
        if isinstance(block, dict):
            for _name, m in block.items():
                if isinstance(m, dict):
                    counts["total"] += 1
    return counts


# ------------------------------------------------------------------ sync loop
SYNC_INTERVAL = 5  # seconds


def sync_once() -> None:
    config = read_yaml(CONFIG_FILE)
    if str(config.get("sync_daemon", True)).lower() in ("false", "off", "0"):
        return  # user kill-switch
    for entity in list_entities():
        try:
            reconcile_fill_queue(entity)
        except Exception as e:  # noqa: BLE001
            print(f"[engine] sync error ({entity}): {e}")


async def sync_loop() -> None:
    while True:
        sync_once()
        await asyncio.sleep(SYNC_INTERVAL)


# ------------------------------------------------------------------ SSE bus
class EventBus:
    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue] = set()

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        self._subscribers.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        self._subscribers.discard(q)

    async def publish(self, event: str, data: str) -> None:
        for q in list(self._subscribers):
            await q.put((event, data))


bus = EventBus()


def bubble_html(kind: str, text: str) -> str:
    ts = datetime.now().strftime("%H:%M:%S")
    safe = (text or "").replace("<", "&lt;").replace(">", "&gt;")
    return (
        f'<div class="bubble bubble-{kind}">'
        f'<span class="bubble-time">{ts}</span>'
        f'<div class="bubble-text">{safe}</div></div>'
    )


# ------------------------------------------------------------------ endpoints
async def home(_req: Request):
    index = FRONTEND / "index.html"
    if index.exists():
        return FileResponse(index)
    return PlainTextResponse("Dashboard not built yet.", status_code=404)


async def api_entities(_req: Request):
    config = read_yaml(CONFIG_FILE)
    return JSONResponse(
        {
            "entities": list_entities(),
            "current_window": config.get("current_window", "os"),
        }
    )


async def api_switch(req: Request):
    body = await req.json()
    target = body.get("entity", "os")
    config = read_yaml(CONFIG_FILE)
    config["current_window"] = target
    stamp_freshness(config)
    write_yaml(CONFIG_FILE, config)
    await bus.publish("switch", target)
    return JSONResponse({"ok": True, "current_window": target})


async def api_read(req: Request):
    entity = req.path_params["entity"]
    key = req.path_params["key"]
    files = entity_files(entity)
    if key not in files:
        return JSONResponse({"error": "unknown file"}, status_code=404)
    path = files[key]
    if key == "board":
        return PlainTextResponse(path.read_text(encoding="utf-8") if path.exists() else "")
    return JSONResponse(read_yaml(path))


async def api_write(req: Request):
    entity = req.path_params["entity"]
    key = req.path_params["key"]
    files = entity_files(entity)
    if key not in files:
        return JSONResponse({"error": "unknown file"}, status_code=404)
    path = files[key]
    if key == "board":
        text = (await req.body()).decode("utf-8")
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
    else:
        data = await req.json()
        stamp_freshness(data)
        write_yaml(path, data)
    await bus.publish("refresh", f"{entity}:{key}")
    return JSONResponse({"ok": True})


async def api_metrics(req: Request):
    entity = req.path_params["entity"]
    return JSONResponse({"missions": roll_up_missions(entity)})


async def agent_say(req: Request):
    """Agent output → floating chat window (ephemeral, output-only for v1).
    Flow: agent POST → daemon renders bubble HTML → SSE push → htmx swap."""
    body = await req.json()
    kind = body.get("kind", "info")  # info | thinking | result
    text = body.get("text", "")
    await bus.publish("chat", bubble_html(kind, text))
    return JSONResponse({"ok": True})


async def sse(req: Request):
    q = bus.subscribe()

    async def stream():
        try:
            yield "event: hello\ndata: connected\n\n"
            while True:
                if await req.is_disconnected():
                    break
                try:
                    event, data = await asyncio.wait_for(q.get(), timeout=15)
                    payload = data.replace("\n", "\ndata: ")
                    yield f"event: {event}\ndata: {payload}\n\n"
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
        finally:
            bus.unsubscribe(q)

    return HTMLResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


async def on_startup() -> None:
    asyncio.create_task(sync_loop())
    print(f"[engine] Agentic OS daemon up. Workspace: {WORKSPACE}")


routes = [
    Route("/", home),
    Route("/api/entities", api_entities),
    Route("/api/switch", api_switch, methods=["POST"]),
    Route("/api/metrics/{entity}", api_metrics),
    Route("/api/yaml/{entity}/{key}", api_read),
    Route("/api/yaml/{entity}/{key}", api_write, methods=["POST"]),
    Route("/agent/say", agent_say, methods=["POST"]),
    Route("/sse", sse),
]

if FRONTEND.exists():
    routes.append(Mount("/static", app=StaticFiles(directory=str(FRONTEND)), name="static"))

app = Starlette(debug=True, routes=routes, on_startup=[on_startup])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
