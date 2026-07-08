"""
PlugBoot - single-process daemon + dashboard server (Starlette).

Per ADR-0001 + Decisions doc:
  - Sync loop: scan disk, stamp freshness, detect added/removed files, flag gaps
    in each entity's runtime.fill_queue.
  - Serve the htmx dashboard.
  - SSE channel for the floating agent chat window (/events).
  - Agent output intake (/agent/say) -> pushed to browser over SSE.

Concurrency posture (Decisions #2): NO locks, NO atomic-write dance, NO version
tokens for v1. Simple writes. Git is the recovery net.

Content-aware sync: the daemon only writes a file back to disk when real content
has changed (ignoring the freshness metadata block). This prevents constant
5-second rewrites and timestamp churn across all synced files.
"""
import asyncio
import copy
import json
from datetime import datetime, timezone
from pathlib import Path

from ruamel.yaml import YAML
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse, StreamingResponse, FileResponse, PlainTextResponse
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


# ── Content-Aware Sync ───────────────────────────────────────────────
# Compare two YAML dicts ignoring the 'freshness' metadata block.
# Returns True if there is a real content difference worth writing.

def _strip_freshness(d):
    """Return a shallow copy of dict d without the 'freshness' key."""
    if not isinstance(d, dict):
        return d
    return {k: v for k, v in d.items() if k != "freshness"}


def has_real_change(old_data, new_data):
    """True when content (minus freshness) actually differs."""
    return _strip_freshness(old_data) != _strip_freshness(new_data)


def smart_write(path, old_data, new_data):
    """Only write to disk and stamp freshness when real content changed."""
    if has_real_change(old_data, new_data):
        stamp_freshness(new_data)
        write_yaml(path, new_data)
        return True
    return False


def stamp_freshness(block):
    fr = block.setdefault("freshness", {})
    fr["sync_status"] = "fresh"
    fr["sync_count"] = int(fr.get("sync_count") or 0) + 1
    fr["last_synced"] = now_iso()
    return block


# ── Entity discovery ─────────────────────────────────────────────────

def list_entities(config):
    ents = []
    if config.get("status", True):
        ents.append(("os", WORKSPACE / "_os"))
    for key, val in config.items():
        if isinstance(val, dict) and val.get("status") and (WORKSPACE / key).is_dir():
            ents.append((key, WORKSPACE / key))
    return ents


# ── Fill-queue gap detection ─────────────────────────────────────────

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


# ── Gate checks ──────────────────────────────────────────────────────

def check_evolution_readiness(missions_data):
    """
    Readiness gate: prevent evolution missions from leaving PLANNING
    while readiness.ready_to_advance is false.
    If an evolution mission has class=EXECUTION but ready_to_advance is
    false, force it back to PLANNING and log a warning.
    """
    evo = missions_data.get("evolution")
    if not evo or not isinstance(evo, dict):
        return
    for mode in ("FAST", "DEEP", "RESEARCH", "INBOX"):
        bucket = evo.get(mode)
        if not bucket or not isinstance(bucket, dict):
            continue
        for name, mission in bucket.items():
            if not isinstance(mission, dict):
                continue
            state = mission.get("state", {})
            readiness = mission.get("readiness", {})
            if state.get("class") == "EXECUTION" and not readiness.get("ready_to_advance", False):
                state["class"] = "PLANNING"
                print(f"[gate] Evolution '{name}' blocked: readiness.ready_to_advance is false. Reverted to PLANNING.")


def check_archiving_gate(missions_data):
    """
    Archiving gate: prevent missions from being archived as 'completed'
    unless all nested work items are actually completed.
    Does NOT block cancellation — only completion.
    """
    # Check standard missions
    for name, mission in (missions_data.get("standard") or {}).items():
        if not isinstance(mission, dict):
            continue
        state = mission.get("state", {})
        if state.get("progress") == "completed":
            # Verify all tasks are completed
            tasks = mission.get("tasks") or {}
            for tname, task in tasks.items():
                if isinstance(task, dict) and task.get("progress") not in ("completed",):
                    state["progress"] = "in-progress"
                    print(f"[gate] Standard mission '{name}' cannot be archived: task '{tname}' is not completed.")
                    break

    # Check research missions
    for name, mission in (missions_data.get("research") or {}).items():
        if not isinstance(mission, dict):
            continue
        state = mission.get("state", {})
        if state.get("progress") == "completed":
            topics = mission.get("topics") or {}
            for tname, topic in topics.items():
                if isinstance(topic, dict) and topic.get("status") is False:
                    state["progress"] = "in-progress"
                    print(f"[gate] Research mission '{name}' cannot be archived: topic '{tname}' is not complete.")
                    break

    # Check evolution missions
    evo = missions_data.get("evolution")
    if not evo or not isinstance(evo, dict):
        return
    for mode in ("FAST", "DEEP", "RESEARCH", "INBOX"):
        bucket = evo.get(mode)
        if not bucket or not isinstance(bucket, dict):
            continue
        for name, mission in bucket.items():
            if not isinstance(mission, dict):
                continue
            state = mission.get("state", {})
            if state.get("progress") == "completed":
                cases = mission.get("cases") or {}
                for cname, case in cases.items():
                    if isinstance(case, dict) and case.get("status") is False:
                        state["progress"] = "in-progress"
                        print(f"[gate] Evolution '{name}' cannot be archived: case '{cname}' is not complete.")
                        break


# ── Sync engine ──────────────────────────────────────────────────────

def sync_entity(name, root):
    prefix = "os" if name == "os" else name
    runtime_path = root / f"{prefix}-runtime.yaml"
    runtime = read_yaml(runtime_path)
    if not runtime:
        return
    old_runtime = copy.deepcopy(runtime)
    runtime["fill_queue"] = detect_fill_gaps(root, prefix)
    smart_write(runtime_path, old_runtime, runtime)

    for fname in (f"{prefix}-missions.yaml", f"{prefix}-toolboxes.yaml", f"{prefix}-inbox.yaml"):
        p = root / fname
        data = read_yaml(p)
        if not data:
            continue
        old_data = copy.deepcopy(data)
        # Apply gate checks on missions
        if fname.endswith("-missions.yaml"):
            check_evolution_readiness(data)
            check_archiving_gate(data)
        smart_write(p, old_data, data)
    print(f"[sync] {name} @ {now_iso()}")


def sync_cycle():
    config = read_yaml(CONFIG)
    if not config or not config.get("sync_daemon", True):
        return  # paused for safe manual audit
    old_config = copy.deepcopy(config)
    smart_write(CONFIG, old_config, config)

    idx = read_yaml(INDEX)
    if idx:
        old_idx = copy.deepcopy(idx)
        smart_write(INDEX, old_idx, idx)

    for name, root in list_entities(config):
        try:
            sync_entity(name, root)
        except Exception as e:
            print(f"[sync] {name} failed: {e}")


async def sync_loop():
    while True:
        sync_cycle()
        await asyncio.sleep(SYNC_INTERVAL)


# ── Dashboard routes ─────────────────────────────────────────────────

async def homepage(request):
    return FileResponse(FRONTEND / "index.html")


async def api_config(request):
    return JSONResponse(read_yaml(CONFIG))


async def api_entity(request):
    name = request.path_params["name"]
    root = WORKSPACE / ("_os" if name == "os" else name)
    prefix = "os" if name == "os" else name
    board_path = root / f"{prefix}-board.md"
    board_text = ""
    if board_path.exists():
        board_text = board_path.read_text(encoding="utf-8")
    return JSONResponse({
        "board": board_text,
        "runtime": read_yaml(root / f"{prefix}-runtime.yaml"),
        "missions": read_yaml(root / f"{prefix}-missions.yaml"),
        "toolboxes": read_yaml(root / f"{prefix}-toolboxes.yaml"),
        "inbox": read_yaml(root / f"{prefix}-inbox.yaml"),
    })


# ── Write-back endpoints ────────────────────────────────────────────

async def save_board(request: Request):
    """POST /api/entity/{name}/board — saves the board markdown file."""
    name = request.path_params["name"]
    root = WORKSPACE / ("_os" if name == "os" else name)
    prefix = "os" if name == "os" else name
    board_path = root / f"{prefix}-board.md"
    try:
        body = await request.json()
        content = body.get("content", "")
        board_path.write_text(content, encoding="utf-8")
        return JSONResponse({"ok": True})
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)


async def toggle_toolbox(request: Request):
    """POST /api/entity/{name}/toolboxes — toggles a domain or toolbox status."""
    name = request.path_params["name"]
    root = WORKSPACE / ("_os" if name == "os" else name)
    prefix = "os" if name == "os" else name
    tb_path = root / f"{prefix}-toolboxes.yaml"
    try:
        body = await request.json()
        key_path = body.get("path", [])  # e.g. ["domain_name", "toolbox_name"]
        status = body.get("status", True)
        data = read_yaml(tb_path)
        if not data:
            return JSONResponse({"ok": False, "error": "file not found"}, status_code=404)
        target = data
        for k in key_path:
            if isinstance(target, dict) and k in target:
                target = target[k]
            else:
                return JSONResponse({"ok": False, "error": f"key '{k}' not found"}, status_code=404)
        if isinstance(target, dict):
            target["status"] = status
        stamp_freshness(data)
        write_yaml(tb_path, data)
        return JSONResponse({"ok": True})
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)


# ── SSE + Agent chat ─────────────────────────────────────────────────

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


# ── App setup ────────────────────────────────────────────────────────

async def on_startup():
    asyncio.create_task(sync_loop())
    print(f"[daemon] PlugBoot v1 up. Workspace: {WORKSPACE}")


routes = [
    Route("/", homepage),
    Route("/api/config", api_config),
    Route("/api/entity/{name}", api_entity),
    Route("/api/entity/{name}/board", save_board, methods=["POST"]),
    Route("/api/entity/{name}/toolboxes", toggle_toolbox, methods=["POST"]),
    Route("/agent/say", agent_say, methods=["POST"]),
    Route("/events", sse_events),
]

app = Starlette(debug=True, routes=routes, on_startup=[on_startup])
app.mount("/static", StaticFiles(directory=str(FRONTEND)), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
