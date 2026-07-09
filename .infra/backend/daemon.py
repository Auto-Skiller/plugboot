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
from contextlib import asynccontextmanager
import copy
import json
from datetime import datetime, timezone
from pathlib import Path

from ruamel.yaml import YAML
_yaml = YAML()
_yaml.preserve_quotes = True
_yaml.default_flow_style = False
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
    # Atomic write: write to a temp file in the SAME directory, then os.replace
    # (atomic on Windows). Prevents torn reads when the dashboard/agent reads the
    # file mid-write — the root cause of the toolboxes flicker.
    import tempfile, os as _os
    try:
        d = _os.path.dirname(str(path)) or "."
        fd, tmp = tempfile.mkstemp(dir=d, suffix=".tmp")
        try:
            with _os.fdopen(fd, "w", encoding="utf-8") as f:
                _yaml.dump(data, f)
            _os.replace(tmp, str(path))
        finally:
            if _os.path.exists(tmp):
                _os.remove(tmp)
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
    # data key reflects the entity: OS data lives in os_prompts/, projects in data/
    data_key = "os_prompts" if prefix == "os" else "data"
    fq = {data_key: [], "missions": [], "toolboxes": [], "inbox": [], "gateway": []}
    inbox_dir = entity_root / f"{prefix}-inbox"
    if inbox_dir.is_dir():
        for item in inbox_dir.iterdir():
            if not item.name.startswith("."):
                fq["inbox"].append(item.name)
    # gateway: agent-curated copies under .<prefix>-inbox_gateway/<Pillar>/<functional_group>/
    gw_dir = inbox_dir / f".{prefix}-inbox_gateway"
    if gw_dir.is_dir():
        for pillar in gw_dir.iterdir():
            if pillar.name.startswith(".") or not pillar.is_dir():
                continue
            fq["gateway"].append(pillar.name)
            for fg in pillar.iterdir():
                if not fg.name.startswith(".") and fg.is_dir():
                    fq["gateway"].append(f"{pillar.name}/{fg.name}")
    data_dir = entity_root / f"{prefix}-data"
    if data_dir.is_dir():
        for item in data_dir.rglob("*"):
            if item.is_file() and not item.name.startswith("."):
                fq[data_key].append(str(item.relative_to(WORKSPACE)))
    return fq


def scaffold_gap(yaml_path, section, item_name, skeleton):
    """Generic scaffolder: ensure `section[item_name]` exists in yaml_path with the
    given structural `skeleton` (only missing keys filled, never overwriting agent
    values). Returns True if a write happened. Daemon scaffolds; agent fills semantics."""
    data = read_yaml(yaml_path) or {}
    old = copy.deepcopy(data)
    bucket = data.setdefault(section, {})
    if not isinstance(bucket, dict):
        return False
    entry = bucket.setdefault(item_name, {})
    if not isinstance(entry, dict):
        return False
    changed = False
    for k, v in skeleton.items():
        if k not in entry:
            entry[k] = v
            changed = True
    if entry.get("scaffolded_by") != "daemon":
        entry["scaffolded_by"] = "daemon"
        entry["needs_semantics"] = True
        changed = True
    if changed:
        smart_write(yaml_path, old, data)
    return changed


def scaffold_all_gaps(root, prefix, fq):
    """Scaffold structure for every flagged fill_queue item across ALL categories,
    then leave them flagged so the agent fills semantics."""
    inbox_yaml = root / f"{prefix}-inbox.yaml"
    for item in fq.get("inbox", []):
        item_path = root / f"{prefix}-inbox" / item
        scaffold_gap(
            inbox_yaml, "raw", item,
            {"name": item, "type": "dir" if item_path.is_dir() else "file",
             "description": "", "contains": [], "when_to_use": ""},
        )
        if item_path.is_dir():
            readme = item_path / "README.md"
            if not readme.exists():
                readme.write_text(
                    f"# {item}\n\n<!-- scaffolded by daemon; agent fills semantics -->\n",
                    encoding="utf-8",
                )
    # NOTE: toolboxes are reconciled from disk by reconcile_toolboxes() (called
    # in sync_entity before the runtime write), NOT scaffolded here. Scaffolding
    # them from fill_queue would treat the missing-metadata flag strings as
    # toolbox names and corrupt the registry.
    m_yaml = root / f"{prefix}-missions.yaml"
    for item in fq.get("missions", []):
        scaffold_gap(m_yaml, "mission_shell", item,
                     {"status": "PLANNING", "proposal_name": item, "objective": ""})
    rt_yaml = root / f"{prefix}-runtime.yaml"
    for item in fq.get("os_prompts", []) + fq.get("data", []):
        scaffold_gap(rt_yaml, "data_shell", item, {"description": "", "contains": []})
    # gateway: ensure .<prefix>-inbox_gateway/<Pillar>/<functional_group>/ skeleton exists
    gw_root = root / f"{prefix}-inbox" / f".{prefix}-inbox_gateway"
    for item in fq.get("gateway", []):
        # item is "Pillar" or "Pillar/functional_group"

        pillar = parts[0]
        fg = parts[1] if len(parts) > 1 else None
        pillar_dir = gw_root / pillar
        pillar_dir.mkdir(parents=True, exist_ok=True)
        if fg:
            (pillar_dir / fg).mkdir(parents=True, exist_ok=True)
        # stamp the pillar so the agent knows to curate copies here
        pillar_readme = pillar_dir / "README.md"
        if not pillar_readme.exists():
            pillar_readme.write_text(
                f"# Gateway: {pillar}\n\n<!-- scaffolded by daemon; "
                f"agent curates copies of inbox items here under <functional_group>/ -->\n",
                encoding="utf-8",
            )


def detect_empty_sections(runtime):
    """Flag empty `pillars` and `evolution_objectives` into fill_queue so the
    agent reads, analyses, and suggests into their `suggestions` sections."""
    fq = runtime.setdefault("fill_queue", {})
    for key in ("pillars", "evolution_objectives"):
        sec = runtime.get(key)
        if isinstance(sec, dict):
            suggestions = sec.get("suggestions")
            # empty when the section's suggestion-total is 0 (key present but count 0)
            empty = (not isinstance(suggestions, dict)) or (int(suggestions.get("total", 0)) == 0)
            if empty and key not in fq:
                fq[key] = [f"{key} is empty - agent should read, analyse and suggest."]
            elif not empty and key in fq:
                del fq[key]


def reconcile_toolboxes(entity_root, prefix, toolboxes_data):
    """Reconcile the on-disk `.{prefix}-toolboxes/` folder into the YAML registry.
    For every domain/toolbox/agent/skill found on disk, ensure a matching entry
    exists in toolboxes_data (daemon scaffolds structure, never agent semantics),
    and flag any entry missing required metadata so the agent fills it (Law 4)."""
    if not isinstance(toolboxes_data, dict):
        return
    tb_root = entity_root / f".{prefix}-toolboxes"
    tb = toolboxes_data.setdefault("toolboxes", {})
    if not isinstance(tb, dict):
        return
    flagged = []
    # self-heal: drop any key that is not (a) a real domain directory on disk,
    # or (b) already a valid domain dict. This removes junk like flag-strings
    # that may have leaked in from earlier broken code.
    disk_domains = set()
    if tb_root.is_dir():
        disk_domains = {p.name for p in tb_root.iterdir() if p.is_dir() and not p.name.startswith(".")}
    for k in [k for k, v in tb.items() if not (isinstance(v, dict) and (k in disk_domains or "toolboxes" in v))]:
        del tb[k]

    if tb_root.is_dir():
        for domain in sorted(pb for pb in tb_root.iterdir() if pb.is_dir() and not pb.name.startswith(".")):
            dentry = tb.setdefault(domain.name, {"status": True, "type": "domain", "description": "", "when_to_use": "", "toolboxes": {}})
            for toolbox in sorted(t for t in domain.iterdir() if t.is_dir() and not t.name.startswith(".")):
                tentry = dentry.setdefault("toolboxes", {}).setdefault(
                    toolbox.name,
                    {"status": True, "type": "toolbox", "description": "", "when_to_use": "", "agents": {}, "skills": {}},
                )
                # agents
                adir = toolbox / "agents"
                if adir.is_dir():
                    for a in sorted(x for x in adir.iterdir() if x.is_dir() and not x.name.startswith(".")):
                        aentry = tentry.setdefault("agents", {}).setdefault(
                            a.name, {"status": True, "maturity": "stub", "role": "", "when_to_use": "", "triggers": []})
                        if not aentry.get("role"):
                            flagged.append(f"{domain.name}/{toolbox.name}/agents/{a.name}: missing role")
                # skills
                sdir = toolbox / "skills"
                if sdir.is_dir():
                    for s in sorted(x for x in sdir.iterdir() if x.is_dir() and not x.name.startswith(".")):
                        sentry = tentry.setdefault("skills", {}).setdefault(
                            s.name, {"status": True, "maturity": "stub", "role": "", "when_to_use": "", "triggers": [], "inputs": [], "outputs": [], "references": {}})
                        if not sentry.get("role"):
                            flagged.append(f"{domain.name}/{toolbox.name}/skills/{s.name}: missing role")
    return flagged


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

def compute_metrics(runtime, prefix):
    """Build the `metrics` block from live runtime counts (review_queue, backlog,
    pillars, evolution_objectives, fill_queue).

    Option 4 (in-memory, no sidecar): pure snapshot of the current moment — direct
    counts only, no derived resolved/open/total/done breakdown. No persistent file
    and no B1 move-tracking, so a counter can never go stale across daemon restarts
    or external edits. The actual review_queue/backlog LISTS remain the source of
    truth; metrics just mirrors their lengths directly.
    """
    fq = runtime.get("fill_queue", {}) or {}
    data_key = "os_prompts" if "os_prompts" in fq else "data"
    rq = list(runtime.get("review_queue", []) or [])
    bl = list(runtime.get("backlog", []) or [])
    pl = runtime.get("pillars", {}) or {}
    ev = runtime.get("evolution_objectives", {}) or {}
    return {
        "review_queue": len(rq),
        "backlog": len(bl),
        "pillars": {
            "actives": len(pl.get("actives", []) or []),
            "validated": int((pl.get("validated", {}) or {}).get("total", 0)),
            "suggestions": int((pl.get("suggestions", {}) or {}).get("total", 0)),
        },
        "evolution_objectives": {
            "actives": len(ev.get("actives", []) or []),
            "validated": int((ev.get("validated", {}) or {}).get("total", 0)),
            "suggestions": int((ev.get("suggestions", {}) or {}).get("total", 0)),
        },
        "fill_queue": {
            "os_prompts": len(fq.get("os_prompts", []) or []),
            "missions": len(fq.get("missions", []) or []),
            "toolboxes": len(fq.get("toolboxes", []) or []),
            "inbox": len(fq.get("inbox", []) or []),
            "gateway": len(fq.get("gateway", []) or []),
            "data": len(fq.get(data_key, []) or []),
        },
    }


def sync_entity(name, root):
    prefix = "os" if name == "os" else name
    runtime_path = root / f"{prefix}-runtime.yaml"
    runtime = read_yaml(runtime_path)
    if not runtime:
        return
    old_runtime = copy.deepcopy(runtime)
    runtime["fill_queue"] = detect_fill_gaps(root, prefix)
    # Flag empty pillars / evolution_objectives so the agent suggests into them
    detect_empty_sections(runtime)
    # Reconcile toolboxes disk->YAML and capture missing-metadata flags into
    # fill_queue.toolboxes BEFORE the runtime write (so it never flickers).
    tb_path = root / f"{prefix}-toolboxes.yaml"
    tb_data = read_yaml(tb_path) or {}
    tb_flags = reconcile_toolboxes(root, prefix, tb_data)
    runtime["fill_queue"]["toolboxes"] = tb_flags
    smart_write(tb_path, read_yaml(tb_path), tb_data)
    # recent_events -> list of strings 'DD-MM-YYYY HH:MM "event"', newest first; cap 10
    ev = runtime.get("recent_events")
    if isinstance(ev, list):
        norm = []
        for e in ev:
            if isinstance(e, str):
                norm.append(e)
            elif isinstance(e, dict) and "event" in e:
                # migrate legacy {time, event} form to the string format
                t = e.get("time") or ""
                if t:
                    try:
                        # ISO -> DD-MM-YYYY HH:MM
                        from datetime import datetime
                        dt = datetime.fromisoformat(t.replace("Z", "+00:00"))
                        t = dt.strftime("%d-%m-%Y %H:%M")
                    except Exception:
                        t = str(t)
                norm.append(f'{t} "{e["event"]}"'.strip())
        runtime["recent_events"] = norm[:10]

    # Option 4 metrics: pure snapshot, no sidecar / no B1 tracking.
    runtime["metrics"] = compute_metrics(runtime, prefix)

    scaffold_all_gaps(root, prefix, runtime["fill_queue"])
    # Write in the canonical key order: freshness, metrics, review_queue, backlog,
    # pillars, evolution_objectives, fill_queue, recent_events
    ordered = {
        "freshness": runtime.get("freshness", {}),
        "metrics": runtime.get("metrics", {}),
        "review_queue": runtime.get("review_queue", []),
        "backlog": runtime.get("backlog", []),
        "pillars": runtime.get("pillars", {}),
        "evolution_objectives": runtime.get("evolution_objectives", {}),
        "fill_queue": runtime.get("fill_queue", {}),
        "recent_events": runtime.get("recent_events", []),
    }
    smart_write(runtime_path, old_runtime, ordered)

    for fname in (f"{prefix}-missions.yaml", f"{prefix}-inbox.yaml"):
        p = root / fname
        data = read_yaml(p)
        if not data:
            continue
        old_data = copy.deepcopy(data)
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
    """POST /api/entity/{name}/board — saves the board markdown file.

    Refuses to write empty/whitespace-only content so a malformed or empty
    payload can never wipe an existing board (covers _os and all project boards).
    """
    name = request.path_params["name"]
    root = WORKSPACE / ("_os" if name == "os" else name)
    prefix = "os" if name == "os" else name
    board_path = root / f"{prefix}-board.md"
    try:
        body = await request.json()
        content = body.get("content")
        if content is None or not str(content).strip():
            return JSONResponse(
                {"ok": False, "error": "refusing to write empty board content"},
                status_code=400,
            )
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

@asynccontextmanager
async def lifespan(app):
    asyncio.create_task(sync_loop())
    print(f"[daemon] PlugBoot v1 up. Workspace: {WORKSPACE}")
    yield


routes = [
    Route("/", homepage),
    Route("/api/config", api_config),
    Route("/api/entity/{name}", api_entity),
    Route("/api/entity/{name}/board", save_board, methods=["POST"]),
    Route("/api/entity/{name}/toolboxes", toggle_toolbox, methods=["POST"]),
    Route("/agent/say", agent_say, methods=["POST"]),
    Route("/events", sse_events),
]

app = Starlette(debug=True, routes=routes, lifespan=lifespan)
app.mount("/static", StaticFiles(directory=str(FRONTEND)), name="static")


if __name__ == "__main__":
    import socket
    import uvicorn
    # Single-instance guard: refuse to boot if :8000 is already taken by
    # another PlugBoot daemon. Prevents parallel daemons fighting over the
    # same YAML files (the root cause of earlier torn-write corruption).
    probe = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        probe.bind(("127.0.0.1", 8000))
    except OSError:
        probe.close()
        print("[daemon] ABORT: port 127.0.0.1:8000 already in use — "
              "another PlugBoot daemon is running. Exiting to avoid conflict.")
        raise SystemExit(1)
    probe.close()
    uvicorn.run(app, host="127.0.0.1", port=8000)
