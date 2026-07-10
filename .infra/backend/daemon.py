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
import threading
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


# Serialises all YAML disk I/O so the background sync thread and HTTP write
# handlers never interleave a read/write on the same file (torn-write guard).
_IO_LOCK = threading.RLock()

# Parsed-YAML cache keyed by (path, mtime, size). ruamel round-trip parsing is
# slow on large files (a 1 MB inbox takes ~8s) and the sync cycle reads the same
# files several times per tick — caching by mtime makes repeats instant and
# self-invalidates the moment a file changes on disk.
_READ_CACHE = {}


def read_yaml(path):
    try:
        if path.exists():
            st = path.stat()
            key = (str(path), st.st_mtime_ns, st.st_size)
            with _IO_LOCK:
                hit = _READ_CACHE.get(str(path))
                if hit and hit[0] == key:
                    return copy.deepcopy(hit[1])
                with open(path, "r", encoding="utf-8") as f:
                    data = yaml.load(f) or {}
                _READ_CACHE[str(path)] = (key, data)
                return copy.deepcopy(data)
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
        with _IO_LOCK:
            fd, tmp = tempfile.mkstemp(dir=d, suffix=".tmp")
            try:
                with _os.fdopen(fd, "w", encoding="utf-8") as f:
                    _yaml.dump(data, f)
                _os.replace(tmp, str(path))
            finally:
                if _os.path.exists(tmp):
                    _os.remove(tmp)
            # refresh cache so the next read returns the just-written data without
            # a re-parse, and the mtime key stays consistent
            try:
                st = _os.stat(str(path))
                _READ_CACHE[str(path)] = ((str(path), st.st_mtime_ns, st.st_size), copy.deepcopy(data))
            except OSError:
                _READ_CACHE.pop(str(path), None)
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
    inbox_yaml = entity_root / f"{prefix}-inbox.yaml"
    inbox_data = read_yaml(inbox_yaml) or {}
    raw_block = inbox_data.get("raw", {}) if isinstance(inbox_data, dict) else {}
    if inbox_dir.is_dir():
        for item in inbox_dir.iterdir():
            # A raw dir is only a fill gap if it is NOT yet delivered/semantic-filled.
            # Draining = seed gateway + mark status:delivered + needs_semantics:false,
            # not deleting the dir, so its mere existence must not re-flag it forever.
            if item.name.startswith("."):
                continue
            entry = raw_block.get(item.name, {}) if isinstance(raw_block, dict) else {}
            if isinstance(entry, dict) and (
                entry.get("needs_semantics") is False
                and str(entry.get("status", "")).lower() in ("delivered", "done", "complete")
            ):
                continue  # already delivered — not a gap
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
        parts = item.split("/")

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


def _is_empty(v):
    """True when a value counts as "not filled" for partial-fill detection."""
    if v is None:
        return True
    if isinstance(v, str):
        return v.strip() == ""
    if isinstance(v, (list, dict)):
        return len(v) == 0
    return False


def _flag_missing(entry, fields, label):
    """Return a list of '<label>: missing <field>' flags for every empty field."""
    out = []
    for f in fields:
        if _is_empty(entry.get(f)):
            out.append(f"{label}: missing {f}")
    return out


def _flag_needs_tasks(fq, entry, label):
    """Hard Law: tasks are produced by AGENTS (via fill_queue.missions), never
    programmatically. Flag a standard mission that has goals but no tasks so an
    agent reads this section before doing anything with the mission."""
    goals = entry.get("goals")
    has_goals = isinstance(goals, dict) and bool(goals)
    tasks = entry.get("tasks")
    has_tasks = isinstance(tasks, dict) and bool(tasks)
    if has_goals and not has_tasks:
        fq.setdefault("missions", []).append(
            f"{label}: needs task generation — AGENT must create tasks from goals (never programmatic)"
        )


def reconcile_toolboxes(entity_root, prefix, toolboxes_data):
    """Reconcile the on-disk `.{prefix}-toolboxes/` folder into the YAML registry.
    For every domain/toolbox/agent/skill found on disk, ensure a matching entry
    exists in toolboxes_data (daemon scaffolds structure, never agent semantics),
    and flag ANY entry with one or more unfilled required fields (Law 4).

    Required fields per schema:
      agent   -> role, when_to_use, triggers
      skill   -> role, when_to_use, triggers, inputs, outputs
    (maturity defaults to 'stub' from scaffolding, so it is not required to be
    non-empty; status is engine-managed.)"""
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

    AGENT_FIELDS = ("role", "when_to_use", "triggers")
    SKILL_FIELDS = ("role", "when_to_use", "triggers", "inputs", "outputs")

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
                        flagged += _flag_missing(aentry, AGENT_FIELDS,
                                                 f"{domain.name}/{toolbox.name}/agents/{a.name}")
                # skills
                sdir = toolbox / "skills"
                if sdir.is_dir():
                    for s in sorted(x for x in sdir.iterdir() if x.is_dir() and not x.name.startswith(".")):
                        sentry = tentry.setdefault("skills", {}).setdefault(
                            s.name, {"status": True, "maturity": "stub", "role": "", "when_to_use": "", "triggers": [], "inputs": [], "outputs": [], "references": {}})
                        flagged += _flag_missing(sentry, SKILL_FIELDS,
                                                 f"{domain.name}/{toolbox.name}/skills/{s.name}")
    return flagged


def detect_partial_fills(entity_root, prefix, runtime):
    """Cross-file partial-fill detection (Law 4): every required semantic field,
    everywhere, must be non-empty; flag any that isn't. Returns a dict of
    category -> [flag strings], merged into runtime.fill_queue by sync_entity.

    Categories / canonical required fields (from .infra/schemas):
      prompts    (os_prompts.yaml / <entity>-prompts.yaml): role, contains, when_to_use, triggers
      data       (project <entity>-data.yaml):              role, description, contains, when_to_use, triggers
      inbox_raw  (<entity>-inbox.yaml raw[]):               description, contains, when_to_use
                  (only while status != delivered / needs_semantics)
      gateway    (<entity>-inbox.yaml gateway[][][]):       description, contains, when_to_use, extracted_concern, source_raw_item
      pillars    (runtime.pillars.validated|suggestions):   description, why, contains, triggers
      evolution  (runtime.evolution_objectives.*):          description, objective
      missions   (<entity>-missions.yaml per mission):      proposal_name, model, objective, priority, state, rounds
    """
    fq = runtime.setdefault("fill_queue", {})
    PROMPT_FIELDS = ("role", "contains", "when_to_use", "triggers")
    DATA_FIELDS = ("role", "description", "contains", "when_to_use", "triggers")
    RAW_FIELDS = ("description", "contains", "when_to_use")
    GW_FIELDS = ("description", "contains", "when_to_use", "extracted_concern", "source_raw_item")
    PILLAR_FIELDS = ("description", "why", "contains", "triggers")
    EO_FIELDS = ("description", "objective")
    MISSION_FIELDS = ("proposal_name", "model", "objective", "priority", "state", "rounds")

    # ── os_prompts / project data ──
    prompts_yaml = entity_root / (f"{prefix}_prompts.yaml" if prefix == "os" else f"{prefix}-prompts.yaml")
    pd = read_yaml(prompts_yaml) or {}
    cat = "os_prompts" if prefix == "os" else "data"
    for name, entry in pd.items():
        if not isinstance(entry, dict) or name == "freshness":
            continue
        label = f"{cat}:{name}"
        fields = PROMPT_FIELDS if prefix == "os" else DATA_FIELDS
        for fl in _flag_missing(entry, fields, label):
            fq.setdefault(cat, []).append(fl)

    # ── inbox raw + gateway ──
    inbox_yaml = entity_root / f"{prefix}-inbox.yaml"
    inbox = read_yaml(inbox_yaml) or {}
    raw = inbox.get("raw") if isinstance(inbox, dict) else None
    if isinstance(raw, dict):
        for name, entry in raw.items():
            if not isinstance(entry, dict):
                continue
            status = str(entry.get("status", "")).lower()
            if status in ("delivered", "done", "complete") or entry.get("needs_semantics") is False:
                continue  # delivered -> not a gap
            for fl in _flag_missing(entry, RAW_FIELDS, f"inbox_raw:{name}"):
                fq.setdefault("inbox", []).append(fl)
    gw = inbox.get("gateway") if isinstance(inbox, dict) else None
    if isinstance(gw, dict):
        for pillar, fgs in gw.items():
            if not isinstance(fgs, dict):
                continue
            for fg, items in fgs.items():
                if not isinstance(items, dict):
                    continue
                for name, entry in items.items():
                    if not isinstance(entry, dict):
                        continue
                    for fl in _flag_missing(entry, GW_FIELDS, f"gateway:{pillar}/{fg}/{name}"):
                        fq.setdefault("gateway", []).append(fl)

    # ── pillars (validated + suggestions) ──
    # Always ensure the key exists so the category is visible/consistent even
    # when fully filled (setdefault must run outside the per-flag loop).
    fq.setdefault("pillars", [])
    pillars = runtime.get("pillars") if isinstance(runtime, dict) else None
    if isinstance(pillars, dict):
        for bucket_key in ("validated", "suggestions"):
            bucket = pillars.get(bucket_key)
            if not isinstance(bucket, dict):
                continue
            for name, entry in bucket.items():
                if not isinstance(entry, dict) or name in ("total", "active"):
                    continue
                for fl in _flag_missing(entry, PILLAR_FIELDS, f"pillars.{bucket_key}:{name}"):
                    fq["pillars"].append(fl)

    # ── evolution_objectives (validated + suggestions) ──
    fq.setdefault("evolution_objectives", [])
    evo = runtime.get("evolution_objectives") if isinstance(runtime, dict) else None
    if isinstance(evo, dict):
        for bucket_key in ("validated", "suggestions"):
            bucket = evo.get(bucket_key)
            if not isinstance(bucket, dict):
                continue
            for name, entry in bucket.items():
                if not isinstance(entry, dict) or name in ("total", "active"):
                    continue
                for fl in _flag_missing(entry, EO_FIELDS, f"evolution_objectives.{bucket_key}:{name}"):
                    fq["evolution_objectives"].append(fl)

    # ── missions ──
    missions_yaml = entity_root / f"{prefix}-missions.yaml"
    md = read_yaml(missions_yaml) or {}
    for mode in ("standard", "research", "evolution"):
        bucket = md.get(mode)
        if not isinstance(bucket, dict):
            continue
        # evolution nests FAST/DEEP/RESEARCH/INBOX -> proposals
        if mode == "evolution":
            for sub, proposals in bucket.items():
                if not isinstance(proposals, dict):
                    continue
                for pname, entry in proposals.items():
                    if not isinstance(entry, dict):
                        continue
                    for fl in _flag_missing(entry, MISSION_FIELDS, f"missions.evolution.{sub}:{pname}"):
                        fq.setdefault("missions", []).append(fl)
        else:
            for mname, entry in bucket.items():
                if not isinstance(entry, dict):
                    continue
                for fl in _flag_missing(entry, MISSION_FIELDS, f"missions.{mode}:{mname}"):
                    fq.setdefault("missions", []).append(fl)
                # Hard Law: agents (not the daemon) generate tasks from goals.
                # Flag the gap so an agent reads fill_queue before touching the mission.
                _flag_needs_tasks(fq, entry, f"missions.{mode}:{mname}")
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


def _autonomy_on(name):
    """Return True when the entity (or os) has autonomy enabled in config.yaml."""
    cfg = read_yaml(CONFIG) or {}
    if name == "os":
        return bool(cfg.get("autonomy"))
    return bool((cfg.get(name) or {}).get("autonomy"))


def _autonomy_on(name):
    """Return True when the entity (or os) has autonomy enabled in config.yaml."""
    cfg = read_yaml(CONFIG) or {}
    if name == "os":
        return bool(cfg.get("autonomy"))
    return bool((cfg.get(name) or {}).get("autonomy"))


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
            "data": len(fq.get("data", []) or []),
            "missions": len(fq.get("missions", []) or []),
            "toolboxes": len(fq.get("toolboxes", []) or []),
            "inbox": len(fq.get("inbox", []) or []),
            "gateway": len(fq.get("gateway", []) or []),
            "pillars": len(fq.get("pillars", []) or []),
            "evolution_objectives": len(fq.get("evolution_objectives", []) or []),
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
    # Full partial-fill detection (Law 4): every required semantic field,
    # everywhere, must be non-empty; flag any that isn't.
    detect_partial_fills(root, prefix, runtime)
    # NOTE: tasks are NO LONGER auto-generated by the daemon (Hard Law: agents
    # produce them). Standard missions with goals but no tasks are flagged into
    # fill_queue.missions by detect_partial_fills -> _flag_needs_tasks so an
    # agent reads that section before doing anything with the mission.
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
    # NOTE: review_feedback / backlog_feedback are reader-supplied (dashboard UI)
    # annotations that must survive the sync rewrite — they are NOT recomputed by
    # compute_metrics, so we carry them through explicitly.
    ordered = {
        "freshness": runtime.get("freshness", {}),
        "metrics": runtime.get("metrics", {}),
        "review_queue": runtime.get("review_queue", []),
        "review_feedback": runtime.get("review_feedback", {}) or {},
        "backlog": runtime.get("backlog", []),
        "backlog_feedback": runtime.get("backlog_feedback", {}) or {},
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
        # Run the (blocking, disk-heavy) sync off the event loop so HTTP write
        # handlers — Save/Delete/toggle — never freeze behind a sync tick.
        await asyncio.to_thread(sync_cycle)
        await asyncio.sleep(SYNC_INTERVAL)


# ── Dashboard routes ─────────────────────────────────────────────────

async def homepage(request):
    resp = FileResponse(FRONTEND / "index.html")
    resp.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    resp.headers["Pragma"] = "no-cache"
    resp.headers["Expires"] = "0"
    return resp


async def api_config(request: Request):
    if request.method == "POST":
        try:
            body = await request.json()
            key_path = body.get("path", [])
            value = body.get("value")
            if not key_path:
                return JSONResponse({"ok": False, "error": "empty path"}, status_code=400)
            data = read_yaml(CONFIG)
            target = data
            for k in key_path[:-1]:
                if not isinstance(target.get(k), dict):
                    target[k] = {}
                target = target[k]
            target[key_path[-1]] = value
            write_yaml(CONFIG, data)
            return JSONResponse({"ok": True})
        except Exception as e:
            return JSONResponse({"ok": False, "error": str(e)}, status_code=500)
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
        "prompts": read_yaml(root / (f"{prefix}_prompts.yaml" if name == "os" else f"{prefix}-prompts.yaml")),
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


async def patch_entity(request: Request):
    """POST /api/entity/{name}/patch — generic guarded mutation of a YAML file.

    Body: { "file": "runtime"|"inbox"|"missions"|"toolboxes"|"prompts",
            "path": [key, ...], "value": <any> }

    GUARD: the daemon only preserves certain keys across its 5s sync
    (pillars, evolution_objectives, review_queue, backlog, missions content,
    toolboxes status). metrics + fill_queue are regenerated. So we refuse to
    write paths under `metrics` or `fill_queue` and refuse to overwrite a whole
    file — only deep-set a value at a specific key path. This keeps the UI
    write-backs stable and never fights the sync engine.
    """
    name = request.path_params["name"]
    root = WORKSPACE / ("_os" if name == "os" else name)
    prefix = "os" if name == "os" else name
    file_map = {
        "runtime": f"{prefix}-runtime.yaml",
        "inbox": f"{prefix}-inbox.yaml",
        "missions": f"{prefix}-missions.yaml",
        "toolboxes": f"{prefix}-toolboxes.yaml",
        "prompts": f"{prefix}-prompts.yaml",
    }
    try:
        body = await request.json()
        file_key = body.get("file")
        key_path = body.get("path", [])
        value = body.get("value")
        op = body.get("op", "set")
        if file_key not in file_map:
            return JSONResponse({"ok": False, "error": f"unknown file '{file_key}'"}, status_code=400)
        if not key_path:
            return JSONResponse({"ok": False, "error": "empty path refused (no whole-file overwrite)"}, status_code=400)
        # forbid regenerated-by-sync branches
        if key_path[0] in ("metrics", "fill_queue"):
            return JSONResponse({"ok": False, "error": f"'{key_path[0]}' is engine-managed and read-only"}, status_code=400)
        path = root / file_map[file_key]
        data = read_yaml(path)
        if not isinstance(data, dict):
            return JSONResponse({"ok": False, "error": "file not found/empty"}, status_code=404)
        target = data
        if op == "delete":
            # walk to the parent, then remove the final key
            for k in key_path[:-1]:
                if not isinstance(target.get(k), dict):
                    return JSONResponse({"ok": False, "error": f"path not found at '{k}'"}, status_code=404)
                target = target[k]
            if key_path[-1] not in target:
                return JSONResponse({"ok": False, "error": f"key '{key_path[-1]}' not found"}, status_code=404)
            del target[key_path[-1]]
            write_yaml(path, data)
            return JSONResponse({"ok": True})
        for k in key_path[:-1]:
            if not isinstance(target.get(k), dict):
                target[k] = {}
            target = target[k]
        target[key_path[-1]] = value
        write_yaml(path, data)
        return JSONResponse({"ok": True})
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)


async def api_ecosystem(request):
    """GET /api/ecosystem — aggregate workspace metrics for the ecosystem bar."""
    config = read_yaml(CONFIG)
    out = {
        "entities": [], "totals": {
            "missions": 0, "toolboxes_active": 0, "toolboxes_total": 0,
            "pillars": 0, "evolution": 0, "review_queue": 0, "backlog": 0,
            "inbox_raw": 0, "gateway": 0, "prompts": 0,
        },
    }
    for name, root in list_entities(config):
        prefix = "os" if name == "os" else name
        rt = read_yaml(root / f"{prefix}-runtime.yaml")
        tb = read_yaml(root / f"{prefix}-toolboxes.yaml")
        inbox = read_yaml(root / f"{prefix}-inbox.yaml")
        ms = read_yaml(root / f"{prefix}-missions.yaml")
        pr = read_yaml(root / (f"{prefix}_prompts.yaml" if name == "os" else f"{prefix}-prompts.yaml"))
        # count missions
        def count_missions(d):
            n = 0
            for bucket in (d or {}).values():
                if isinstance(bucket, dict):
                    for mmode in bucket.values():
                        if isinstance(mmode, dict):
                            n += len(mmode)
            return n
        def count_tb(d):
            t, a = 0, 0
            for dk, dv in (d or {}).items():
                if dk in ("freshness", "metrics"):
                    continue
                if not isinstance(dv, dict):
                    continue
                for tk, tv in dv.items():
                    if isinstance(tv, dict) and "status" in tv:
                        t += 1
                        if tv.get("status"):
                            a += 1
            return t, a
        t, a = count_tb(tb)
        gw_items = sum(len(v) for v in (inbox.get("gateway") or {}).values()) if isinstance(inbox.get("gateway"), dict) else 0
        ent = {
            "name": name,
            "missions": count_missions(ms),
            "toolboxes_total": t, "toolboxes_active": a,
            "pillars": len((rt.get("pillars") or {}).get("actives", []) or []),
            "evolution": len((rt.get("evolution_objectives") or {}).get("actives", []) or []),
            "review_queue": rt.get("review_queue") if isinstance(rt.get("review_queue"), int) else len(rt.get("review_queue") or []),
            "backlog": rt.get("backlog") if isinstance(rt.get("backlog"), int) else len(rt.get("backlog") or []),
            "inbox_raw": (inbox.get("metrics") or {}).get("raw_items", 0),
            "gateway": gw_items,
            "prompts": len([k for k in (pr or {}) if k != "freshness"]),
        }
        out["entities"].append(ent)
        for k in ("missions", "toolboxes_active", "toolboxes_total", "pillars",
                  "evolution", "review_queue", "backlog", "inbox_raw", "gateway", "prompts"):
            out["totals"][k] += ent[k]
    return JSONResponse(out)

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
    Route("/api/config", api_config, methods=["GET", "POST"]),
    Route("/api/entity/{name}", api_entity),
    Route("/api/entity/{name}/board", save_board, methods=["POST"]),
    Route("/api/entity/{name}/toolboxes", toggle_toolbox, methods=["POST"]),
    Route("/api/entity/{name}/patch", patch_entity, methods=["POST"]),
    Route("/api/ecosystem", api_ecosystem),
    Route("/agent/say", agent_say, methods=["POST"]),
    Route("/events", sse_events),
]

app = Starlette(debug=True, routes=routes, lifespan=lifespan)
app.mount("/static", StaticFiles(directory=str(FRONTEND)), name="static")


from starlette.middleware.base import BaseHTTPMiddleware

async def _no_cache(request, call_next):
    resp = await call_next(request)
    if request.url.path.startswith("/static") or request.url.path in ("/", "/index.html"):
        resp.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        resp.headers["Pragma"] = "no-cache"
        resp.headers["Expires"] = "0"
    return resp

app.add_middleware(BaseHTTPMiddleware, dispatch=_no_cache)



if __name__ == "__main__":
    import socket
    import uvicorn
    import os as _os
    # Port is configurable via PB_PORT env var (default 8000). Changing the
    # port lets you run a fresh instance when a stale one is cached elsewhere.
    PORT = int(_os.environ.get("PB_PORT", "8000"))
    # Single-instance guard: refuse to boot if the chosen port is already taken
    # by another PlugBoot daemon. Prevents parallel daemons fighting over the
    # same YAML files (the root cause of earlier torn-write corruption).
    probe = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        probe.bind(("127.0.0.1", PORT))
    except OSError:
        probe.close()
        print(f"[daemon] ABORT: port 127.0.0.1:{PORT} already in use — "
              f"another PlugBoot daemon is running. Exiting to avoid conflict.")
        raise SystemExit(1)
    probe.close()
    uvicorn.run(app, host="127.0.0.1", port=PORT)
