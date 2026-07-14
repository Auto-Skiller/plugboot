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
import re
import shutil
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

# FIXED aspects (os_prompt 01). Every pillar folder in the gateway MUST contain
# exactly these 3 aspect subfolders (even if empty) — LAW 1 + the fixed-aspect rule.
FIXED_ASPECTS = ("Architecture", "Capabilities", "Monetization")
# Item + per-member semantic fields (used by analysing + gateway carry-over).
ANALYSING_FIELDS = ("description", "contains", "when_to_use")
# Merged per-member record: every member file must carry source + state + semantics.
MEMBER_FIELDS = ("raw_path", "gateway_path", "description", "contains", "when_to_use", "status")
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

# Inbox gateway keys are full file paths that contain ':'; ruamel mangles them
# into None on round-trip (which wipes the gateway on the next sync write).
# PyYAML parses/emits those keys correctly, so inbox files use PyYAML exclusively.
def _uses_pure(path):
    return str(path).endswith("-inbox.yaml")


def read_yaml(path):
    try:
        if path.exists():
            if _uses_pure(path):
                import yaml as _py
                return _py.safe_load(path.read_text(encoding="utf-8")) or {}
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
        if _uses_pure(path):
            # last-resort fallback for inbox files if PyYAML itself chokes
            try:
                import yaml as _py
                return _py.safe_load(path.read_text(encoding="utf-8")) or {}
            except Exception:
                pass
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
                    if _uses_pure(path):
                        import yaml as _py
                        _py.dump(data, f, sort_keys=False, default_flow_style=False, width=4096)
                    else:
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
    # inbox is split into 'raw' (live drops) and 'gateway' (curated copy) so they
    # stay distinguishable; both are inbox-level gaps, never top-level/runtime.
    fq = {data_key: [], "missions": [], "toolboxes": [], "inbox": {"discovery": [], "raw": [], "analysing": [], "gateway": []}}
    inbox_dir = entity_root / f"{prefix}-inbox"
    inbox_yaml = entity_root / f"{prefix}-inbox.yaml"
    inbox_data = read_yaml(inbox_yaml) or {}
    raw_block = inbox_data.get("raw", {}) if isinstance(inbox_data, dict) else {}
    discovery_block = inbox_data.get("discovery", {}) if isinstance(inbox_data, dict) else {}
    archived = {p.name for p in inbox_dir.iterdir()
                if p.is_dir() and p.name.startswith("_drained_raw")}
    if inbox_dir.is_dir():
        for item in inbox_dir.iterdir():
            if item.name.startswith(".") or item.name.startswith("_drained_raw"):
                continue
            # DISCOVERY: a live drop with no discovery entry yet needs the agent
            # to read its full tree and decide item boundaries.
            if item.name not in discovery_block:
                fq["inbox"]["discovery"].append(item.name)
                continue
            de = discovery_block.get(item.name, {})
            if isinstance(de, dict) and str(de.get("status", "")).lower() != "analyzed":
                fq["inbox"]["discovery"].append(item.name)
                continue
            entry = raw_block.get(item.name, {}) if isinstance(raw_block, dict) else {}
            if isinstance(entry, dict) and (
                entry.get("needs_semantics") is False
                and str(entry.get("status", "")).lower() in ("delivered", "done", "complete")
            ):
                continue  # already delivered — not a gap
            fq["inbox"]["raw"].append(item.name)
    # gateway: agent-curated copies under .<prefix>-inbox_gateway/<Pillar>/<aspect>/<functional_group>/
    # Aspects are FIXED (Architecture | Capabilities | Monetization); every pillar
    # MUST contain all 3 aspect folders. Flag missing ones so the daemon scaffolds them.
    gw_dir = inbox_dir / f".{prefix}-inbox_gateway"
    if gw_dir.is_dir():
        for pillar in gw_dir.iterdir():
            if pillar.name.startswith(".") or not pillar.is_dir():
                continue
            existing_aspects = {a.name for a in pillar.iterdir()
                                if not a.name.startswith(".") and a.is_dir()}
            # Only flag genuinely-missing FIXED_ASPECTS folders as scaffold gaps —
            # a fully-present pillar/aspect/FG tree is NOT a fill_queue gap.
            for aspect in FIXED_ASPECTS:
                if aspect not in existing_aspects:
                    fq["inbox"]["gateway"].append(f"{pillar.name}/{aspect}")  # missing aspect -> scaffold
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
    seen_pillars = set()
    inbox_yaml = root / f"{prefix}-inbox.yaml"
    for item in fq.get("inbox", {}).get("raw", []):
        if ":" in item:
            continue
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
        if ":" in item:
            continue
        scaffold_gap(m_yaml, "mission_shell", item,
                     {"status": "PLANNING", "proposal_name": item, "objective": ""})
    rt_yaml = root / f"{prefix}-runtime.yaml"
    for item in fq.get("os_prompts", []) + fq.get("data", []):
        if ":" in item:
            continue
        scaffold_gap(rt_yaml, "data_shell", item, {"description": "", "contains": []})
    # gateway: ensure .<prefix>-inbox_gateway/<Pillar>/<aspect>/<functional_group>/ skeleton exists.
    # Aspects are FIXED (Architecture | Capabilities | Monetization) — scaffold all 3
    # under every pillar so the structure is uniform (LAW 1 + fixed-aspect rule).
    # (gateway is nested under fill_queue.inbox per the inbox/runtime split.)
    gw_root = root / f"{prefix}-inbox" / f".{prefix}-inbox_gateway"
    for item in fq.get("inbox", {}).get("gateway", []):
        if ":" in item:
            continue
        # item is "Pillar", "Pillar/aspect", or "Pillar/aspect/functional_group" —
        # honour the full pillar/aspect/FG depth (the 5 Routing Laws: LAW 1).
        parts = [p for p in item.split("/") if p]
        cur = gw_root
        for part in parts:
            cur = cur / part
        cur.mkdir(parents=True, exist_ok=True)
        # When we see a pillar (single part), also ensure its 3 fixed aspect folders.
        if len(parts) == 1:
            seen_pillars.add(parts[0])
            for aspect in FIXED_ASPECTS:
                (gw_root / parts[0] / aspect).mkdir(parents=True, exist_ok=True)
        # stamp the pillar so the agent knows to curate copies here
        pillar_readme = gw_root / parts[0] / "README.md"
        if not pillar_readme.exists():
            pillar_readme.write_text(
                f"# Gateway: {parts[0]}\n\n<!-- scaffolded by daemon; "
                f"agent curates copies of inbox items here under <functional_group>/ -->\n",
                encoding="utf-8",
            )


def detect_empty_sections(runtime):
    """Flag empty `pillars` and `evolution_objectives` into fill_queue so the
    agent reads, analyses, and suggests into their `suggestions` sections.
    Nested under fill_queue.runtime (pillars/evolution_objectives are runtime
    sections, not inbox)."""
    fq = runtime.setdefault("fill_queue", {})
    rt = fq.setdefault("runtime", {})
    for key in ("pillars", "evolution_objectives"):
        sec = runtime.get(key)
        if isinstance(sec, dict):
            suggestions = sec.get("suggestions")
            # empty when the section's suggestion-total is 0 (key present but count 0)
            empty = (not isinstance(suggestions, dict)) or (int(suggestions.get("total", 0)) == 0)
            if empty and key not in rt:
                rt[key] = [f"{key} is empty - agent should read, analyse and suggest."]
            elif not empty and key in rt:
                del rt[key]


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
    """Return a list of 'missing' flags for every empty required field.

    For the toolboxes category the caller passes a `tb_file_base` so all flags
    for the SAME skill/agent file collapse into ONE grouped entry:
        '<file> | MISSING: role,when_to_use,triggers,inputs,outputs'
    so the agent reads the file once and fills every empty field at once.
    Other categories get one flag per field: '<label>: missing <field>'.
    """
    miss = [f for f in fields if _is_empty(entry.get(f))]
    if not miss:
        return []
    tb_file = getattr(_flag_missing, "_tb_file", None)
    if tb_file is not None:
        return [f"{tb_file} | MISSING: {','.join(miss)}"]
    return [f"{label}: missing {f}" for f in miss]


# Phrases that signal a *non-informative* when_to_use (the agent must write a
# real use-case instead of "Use this skill when the task involves …").
_WEAK_WHEN = re.compile(r"^\s*(use this skill when|use this when|when the task involves|when the task involves)\b", re.I)


def _flag_weak_when(entry, label):
    """Flag a when_to_use that is a template phrase with no concrete use-case."""
    wt = entry.get("when_to_use")
    if isinstance(wt, str) and _WEAK_WHEN.search(wt):
        return [f"{label}: weak when_to_use (no real use-case — rewrite with concrete scenarios)"]
    return []


# ── Inbox 3-stage pipeline helpers (raw -> analysing -> gateway) ──

def _content_hash(text):
    """Stable short hash of inbox item content (for dedup tracking)."""
    import hashlib
    return hashlib.md5(text.encode("utf-8")).hexdigest()[:16]


def _contains_is_provenance(contains):
    """Reject a contains value that is a file list / path / provenance text.

    Rules (os_prompt 07, Semantics quality gates): contains MUST describe the
    actual things inside the item, never its location or history. Rejected:
    file lists (README.md, SECURITY.md), paths, 'moved from raw', 'drained to
    archive', 'raw drop', etc.
    """
    if contains is None:
        return False
    items = contains if isinstance(contains, list) else [contains]
    PROV = re.compile(r"(moved from|drained to archive|raw drop|inbox|^\s*_os/|\.md$|\.txt$|\.yaml$|^/|\.gitkeep)", re.I)
    for it in items:
        if not isinstance(it, str) or not it.strip():
            continue
        if PROV.search(it):
            return True
    return False


def _flag_contains(entry, label):
    if _contains_is_provenance(entry.get("contains")):
        return [f"{label}: bad contains (file list / path / provenance text — describe actual things inside, not 'moved from raw')"]
    return []


def _analysing_labels(inbox):
    """Collect content_hashes already present in gateway + rejected (NOT the
    analysing block itself — that is handled inline so an entry never collides
    with its own hash). Used for the dedup gate."""
    seen = set()
    gw = inbox.get("gateway") if isinstance(inbox, dict) else None
    if isinstance(gw, dict):
        for pillar, aspects in gw.items():
            if not isinstance(aspects, dict):
                continue
            for aspect, fgs in aspects.items():
                if not isinstance(fgs, dict):
                    continue
                for fg, items in fgs.items():
                    if not isinstance(items, dict):
                        continue
                    for name, e in items.items():
                        if isinstance(e, dict) and e.get("content_hash"):
                            seen.add(e["content_hash"])
    rej = inbox.get("rejected") if isinstance(inbox, dict) else None
    if isinstance(rej, dict):
        for e in rej.values():
            if isinstance(e, dict) and e.get("content_hash"):
                seen.add(e["content_hash"])
    return seen


def _flag_inbox_analysing(entity_root, prefix, runtime):
    """Flag analysing entries that are incomplete or fail quality gates, plus
    dedup collisions (against gateway/rejected and earlier analysing entries).
    Appends into runtime.fill_queue.inbox.analysing."""
    inbox_yaml = entity_root / f"{prefix}-inbox.yaml"
    inbox = read_yaml(inbox_yaml) or {}
    if not isinstance(inbox, dict):
        return
    fq = runtime.setdefault("fill_queue", {}).setdefault("inbox", {})
    analysing = inbox.get("analysing") if isinstance(inbox, dict) else None
    if not isinstance(analysing, dict):
        return
    base_seen = _analysing_labels(inbox)      # gateway + rejected hashes
    seen_analysing = set()                    # hashes already seen in analysing
    for name, entry in analysing.items():
        if not isinstance(entry, dict):
            continue
        status = str(entry.get("status", "")).lower()
        if status in ("routed", "rejected", "delivered"):
            continue  # already resolved -> not a gap
        label = f"inbox_analysing:{name}"
        h = entry.get("content_hash")
        # dedup: collide with gateway/rejected OR an earlier analysing entry
        if h and (h in base_seen or h in seen_analysing):
            fq.setdefault("analysing", []).append(
                f"{label}: dupe (content_hash {h} already in gateway/rejected/analysing — blocked)")
            seen_analysing.add(h)
            continue
        if h:
            seen_analysing.add(h)
        # required fields (ITEM-level)
        for fl in _flag_missing(entry, ANALYSING_FIELDS, label):
            fq.setdefault("analysing", []).append(fl)
        # quality gates (ITEM-level)
        for fl in _flag_contains(entry, label):
            fq.setdefault("analysing", []).append(fl)
        for fl in _flag_weak_when(entry, label):
            fq.setdefault("analysing", []).append(fl)
        # PER-MEMBER merged record: each path in paths needs its own
        # raw_path + status + description/contains/when_to_use before routeable.
        # (gateway_path is destination, filled automatically on route, so not required pre-route.)
        members = entry.get("members") if isinstance(entry.get("members"), dict) else {}
        for mpath in entry.get("paths") or []:
            mlabel = f"{label}/members/{mpath}"
            me = members.get(mpath) if isinstance(members, dict) else None
            if not isinstance(me, dict):
                fq.setdefault("analysing", []).append(f"{mlabel}: MISSING member record (raw_path/status/description/contains/when_to_use)")
                continue
            for fl in _flag_missing(me, ("raw_path", "description", "contains", "when_to_use", "status"), mlabel):
                fq.setdefault("analysing", []).append(fl)
            for fl in _flag_contains(me, mlabel):
                fq.setdefault("analysing", []).append(fl)
            for fl in _flag_weak_when(me, mlabel):
                fq.setdefault("analysing", []).append(fl)
        # disposition must be set once complete
        if entry.get("disposition") not in ("route", "reject"):
            fq.setdefault("analysing", []).append(f"{label}: needs disposition (route | reject)")


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
      agent   -> role, description, when_to_use, triggers
      skill   -> role, description, when_to_use, triggers, inputs, outputs
    (maturity defaults to 'stub' from scaffolding, so it is not required to be
    non-empty; status is engine-managed; path is auto-derived from disk.)
    """
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

    AGENT_FIELDS = ("role", "description", "when_to_use", "triggers")
    SKILL_FIELDS = ("role", "description", "when_to_use", "triggers", "inputs", "outputs")
    # Toolbox/domain levels: description + when_to_use are required ONLY when the
    # node actually contains children (derive from children; empty-with-no-children
    # is fine and must NOT be flagged).
    TB_FIELDS = ("description", "when_to_use")
    DOMAIN_FIELDS = ("description", "when_to_use")

    if tb_root.is_dir():
        for domain in sorted(pb for pb in tb_root.iterdir() if pb.is_dir() and not pb.name.startswith(".")):
            dentry = tb.setdefault(domain.name, {"status": True, "type": "domain", "description": "", "when_to_use": "", "toolboxes": {}})
            d_has_children = False
            for toolbox in sorted(t for t in domain.iterdir() if t.is_dir() and not t.name.startswith(".")):
                tentry = dentry.setdefault("toolboxes", {}).setdefault(
                    toolbox.name,
                    {"status": True, "type": "toolbox", "description": "", "when_to_use": "", "agents": {}, "skills": {}},
                )
                t_has_children = False
                # agents
                adir = toolbox / "agents"
                if adir.is_dir():
                    for a in sorted(x for x in adir.iterdir() if x.is_dir() and not x.name.startswith(".")):
                        t_has_children = True  # a REAL child subdir exists (not just an empty agents/ dir)
                        aentry = tentry.setdefault("agents", {}).setdefault(
                            a.name, {"status": True, "maturity": "stub", "role": "", "when_to_use": "", "triggers": []})
                        # Group flags by source file: the agent reads this file ONCE
                        # and fills every empty field at once.
                        _flag_missing._tb_file = f"{domain.name}/{toolbox.name}/agents/{a.name}"
                        flagged += _flag_missing(aentry, AGENT_FIELDS,
                                                 f"{domain.name}/{toolbox.name}/agents/{a.name}")
                        flagged += _flag_weak_when(aentry,
                                                   f"{domain.name}/{toolbox.name}/agents/{a.name}")
                        _flag_missing._tb_file = None
                # skills
                sdir = toolbox / "skills"
                if sdir.is_dir():
                    for s in sorted(x for x in sdir.iterdir() if x.is_dir() and not x.name.startswith(".")):
                        t_has_children = True  # a REAL child subdir exists (not just an empty skills/ dir)
                        sentry = tentry.setdefault("skills", {}).setdefault(
                            s.name, {"status": True, "maturity": "stub", "role": "", "when_to_use": "", "triggers": [], "inputs": [], "outputs": [], "references": {}})
                        _flag_missing._tb_file = f"{domain.name}/{toolbox.name}/skills/{s.name}"
                        flagged += _flag_missing(sentry, SKILL_FIELDS,
                                                 f"{domain.name}/{toolbox.name}/skills/{s.name}")
                        flagged += _flag_weak_when(sentry,
                                                   f"{domain.name}/{toolbox.name}/skills/{s.name}")
                        # references: when_to_use quality check (path-derived only)
                        refs = sentry.get("references") or {}
                        if isinstance(refs, dict):
                            for rname, rentry in refs.items():
                                if isinstance(rentry, dict):
                                    flagged += _flag_weak_when(rentry,
                                                               f"{domain.name}/{toolbox.name}/skills/{s.name}/references/{rname}")
                        _flag_missing._tb_file = None
                # toolbox-level: required ONLY when it has children (derive from them).
                if t_has_children:
                    tb_path = f"{domain.name}/{toolbox.name}"
                    _flag_missing._tb_file = tb_path
                    flagged += _flag_missing(tentry, TB_FIELDS, tb_path)
                    flagged += _flag_weak_when(tentry, tb_path)
                    _flag_missing._tb_file = None
                    d_has_children = True
            # domain-level: required ONLY when it has toolboxes (derive from them).
            if d_has_children:
                _flag_missing._tb_file = domain.name
                flagged += _flag_missing(dentry, DOMAIN_FIELDS, domain.name)
                flagged += _flag_weak_when(dentry, domain.name)
                _flag_missing._tb_file = None
    return flagged


def detect_partial_fills(entity_root, prefix, runtime):
    """Cross-file partial-fill detection (Law 4): every required semantic field,
    everywhere, must be non-empty; flag any that isn't. Returns a dict of
    category -> [flag strings], merged into runtime.fill_queue by sync_entity.

    Categories / canonical required fields (from .infra/schemas):
      prompts    (os_prompts.yaml / <entity>-prompts.yaml): role, contains, when_to_use, triggers
      data       (project <entity>-data.yaml):              role, description, contains, when_to_use, triggers
      inbox_raw  (<entity>-inbox.yaml raw[]):               drop, paths, content_hash, status
                  (raw is a ledger; semantics live in analysing.members[path])
      inbox_analysing (<entity>-inbox.yaml analysing[]):    per-item description/contains/when_to_use
                  + per-member merged record (raw_path/gateway_path/description/contains/when_to_use/status)
      gateway    (<entity>-inbox.yaml gateway[][][]):       description, contains, when_to_use, extracted_concern, source_raw_item
                  + members[] (merged record: raw_path/gateway_path/description/contains/when_to_use/status)
      pillars    (runtime.pillars.validated|suggestions):   description, why, contains, triggers
      evolution  (runtime.evolution_objectives.*):          description, objective
      missions   (<entity>-missions.yaml per mission):      proposal_name, model, objective, priority, state, rounds
    """
    fq = runtime.setdefault("fill_queue", {})
    PROMPT_FIELDS = ("role", "contains", "when_to_use", "triggers")
    DATA_FIELDS = ("role", "description", "contains", "when_to_use", "triggers")
    RAW_FIELDS = ("description", "contains", "when_to_use")
    GW_FIELDS = ("description", "contains", "when_to_use", "extracted_concern",
                 "source_raw_item", "members")
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
        for fl in _flag_weak_when(entry, label):
            fq.setdefault(cat, []).append(fl)

    # ── inbox raw + gateway ──
    # NOTE: per design, BOTH raw drops and the gateway (the curated copy of inbox
    # items) live under fill_queue.inbox. gateway is keyed separately from raw so
    # they stay distinguishable, but neither is a runtime-level gap.
    inbox_yaml = entity_root / f"{prefix}-inbox.yaml"
    inbox = read_yaml(inbox_yaml) or {}
    fq.setdefault("inbox", {})
    raw = inbox.get("raw") if isinstance(inbox, dict) else None
    if isinstance(raw, dict):
        for name, entry in raw.items():
            if not isinstance(entry, dict):
                continue
            status = str(entry.get("status", "")).lower()
            if status in ("delivered", "done", "complete") or entry.get("needs_semantics") is False:
                continue  # delivered -> not a gap
            for fl in _flag_missing(entry, RAW_FIELDS, f"inbox_raw:{name}"):
                fq["inbox"].setdefault("raw", []).append(fl)
    gw = inbox.get("gateway") if isinstance(inbox, dict) else None
    if isinstance(gw, dict):
        # Gateway is 3 levels deep: pillar -> aspect (Architecture|Capabilities|
        # Monetization) -> functional_group -> item. (Schema comment is stale; the
        # FIXED_ASPECTS model makes aspect a real structural layer — see scaffold_all_gaps.)
        for pillar, aspects in gw.items():
            if not isinstance(aspects, dict):
                continue
            for aspect, fgs in aspects.items():
                if not isinstance(fgs, dict):
                    continue
                for fg, items in fgs.items():
                    if not isinstance(items, dict):
                        continue
                    for name, entry in items.items():
                        if not isinstance(entry, dict):
                            continue
                        glabel = f"gateway:{pillar}/{aspect}/{fg}/{name}"
                        for fl in _flag_missing(entry, GW_FIELDS, glabel):
                            fq["inbox"].setdefault("gateway", []).append(fl)
                        # PER-MEMBER merged record: each member must carry raw_path+
                        # status + semantics. (gateway_path is set on route, allowed empty.)
                        members = entry.get("members") if isinstance(entry.get("members"), dict) else {}
                        paths = entry.get("paths") or []
                        if not paths:
                            if not members:
                                fq["inbox"].setdefault("gateway", []).append(
                                    f"{glabel}: needs members (merged per-member record)")
                            for mpath, me in members.items():
                                mlabel = f"{glabel}/members/{mpath}"
                                if not isinstance(me, dict):
                                    fq["inbox"].setdefault("gateway", []).append(
                                        f"{mlabel}: MISSING member record (raw_path/status/description/contains/when_to_use)")
                                    continue
                                for fl in _flag_missing(me, ("raw_path", "description", "contains", "when_to_use", "status"), mlabel):
                                    fq["inbox"].setdefault("gateway", []).append(fl)
                        else:
                            for mpath in paths:
                                mlabel = f"{glabel}/members/{mpath}"
                                me = members.get(mpath) if isinstance(members, dict) else None
                                if not isinstance(me, dict):
                                    fq["inbox"].setdefault("gateway", []).append(
                                        f"{mlabel}: MISSING member record (raw_path/status/description/contains/when_to_use)")
                                    continue
                                for fl in _flag_missing(me, ("raw_path", "description", "contains", "when_to_use", "status"), mlabel):
                                    fq["inbox"].setdefault("gateway", []).append(fl)
    # analysing: 3-stage pipeline quality gate (raw -> analysing -> gateway).
    # Flags incomplete / bad-contains / weak-when / dupe / missing-disposition.
    _flag_inbox_analysing(entity_root, prefix, runtime)

    # ── pillars (validated + suggestions) ──
    # These are runtime-section gaps -> nested under fill_queue.runtime.
    fq.setdefault("runtime", {}).setdefault("pillars", [])
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
                    fq["runtime"]["pillars"].append(fl)

    # ── evolution_objectives (validated + suggestions) ──
    # Also a runtime-section gap -> nested under fill_queue.runtime.
    fq.setdefault("runtime", {}).setdefault("evolution_objectives", [])
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
                    fq["runtime"]["evolution_objectives"].append(fl)

    # ── missions ──
    missions_yaml = entity_root / f"{prefix}-missions.yaml"
    md = read_yaml(missions_yaml) or {}
    for mode in ("standard", "research", "evolution", "analytics"):
        bucket = md.get(mode)
        if not isinstance(bucket, dict):
            continue
        # evolution nests FAST/DEEP/RESEARCH/INBOX/ANALYTICS -> proposals
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
    for mode in ("FAST", "DEEP", "RESEARCH", "INBOX", "ANALYTICS"):
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
    for mode in ("FAST", "DEEP", "RESEARCH", "INBOX", "ANALYTICS"):
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
            "inbox": {
                "raw": len((fq.get("inbox", {}) or {}).get("raw", []) or []),
                "analysing": len((fq.get("inbox", {}) or {}).get("analysing", []) or []),
                "gateway": len((fq.get("inbox", {}) or {}).get("gateway", []) or []),
            },
            "runtime": {
                "pillars": len((fq.get("runtime", {}) or {}).get("pillars", []) or []),
                "evolution_objectives": len((fq.get("runtime", {}) or {}).get("evolution_objectives", []) or []),
            },
        },
    }


def snapshot_raw_archive(root, prefix):
    """LAW 2 (archive variant): the raw inbox drop is the IMMUTABLE source of
    truth. On every ingest the daemon copies (never moves) the live raw drop
    into a dated, frozen archive `_<prefix>-inbox/_drained_raw_YYYY-MM-DD/` so
    there is a permanent provenance trail. Idempotent: if today's archive
    already exists and the drop is unchanged it does nothing. The gateway then
    holds the single CURATED copy — it is safe to move items out of the live
    drop into the gateway because the immutable originals are preserved in the
    dated archive."""
    inbox_dir = root / f"{prefix}-inbox"
    live = [p for p in inbox_dir.iterdir()
            if p.is_dir() and not p.name.startswith(".")
            and not p.name.startswith("_drained_raw")]
    if not live:
        return
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    archive = inbox_dir / f"_drained_raw_{stamp}"
    archive.mkdir(parents=True, exist_ok=True)
    if (archive / ".snapshot_done").exists():
        return  # already snapshotted this drop set today
    for d in live:
        dst = archive / d.name
        if dst.exists():
            continue
        shutil.copytree(d, dst)
    archive.joinpath(".snapshot_done").write_text(
        f"raw inbox snapshot {stamp}; immutable archive of live drop before routing\n",
        encoding="utf-8")


def write_discovery(inbox_yaml, prefix):
    """DISCOVERY stage (runs after snapshot_raw_archive / LAW 2): for every live
    drop that has no discovery entry yet, write its FULL directory tree (any
    depth) into inbox.discovery[drop]. The agent later reads this tree, decides
    the real item boundaries, and creates raw: entries with member `paths`.

    An item is NOT the top-level folder — it is a single file or a tight group
    of files that strictly must be processed together. Maximise granularity.

    Idempotent: only writes for drops not already in discovery.
    MUST use PyYAML (os-inbox.yaml path-keys with ':' break ruamel)."""
    inbox_dir = inbox_yaml.parent / f"{prefix}-inbox"
    inbox = read_yaml(inbox_yaml) or {}
    if not isinstance(inbox, dict):
        return
    disc = inbox.setdefault("discovery", {})
    if not isinstance(disc, dict):
        disc = inbox["discovery"] = {}
    changed = False
    for drop in sorted(p for p in inbox_dir.iterdir()
                       if p.is_dir() and not p.name.startswith(".")
                       and not p.name.startswith("_drained_raw")):
        if drop.name in disc:
            continue
        tree = _build_tree(drop, drop)
        disc[drop.name] = {
            "drop": str(drop.relative_to(inbox_dir.parent)),
            "archived_at": datetime.now(timezone.utc).isoformat(),
            "status": "needs_analysis",
            "tree": tree,
        }
        changed = True
    if changed:
        smart_write(inbox_yaml, read_yaml(inbox_yaml), inbox)


def _build_tree(folder, root):
    """Recursively render a folder as nested dict; files -> [list] of their own
    path relative to the DROP ROOT (so the agent sees exact member paths)."""
    node = {}
    for child in sorted(folder.iterdir()):
        if child.name.startswith("."):
            continue
        if child.is_dir():
            node[f"{child.name}/"] = _build_tree(child, root)
        else:
            relpath = str(child.relative_to(root)).replace("\\", "/")
            node[child.name] = [relpath]
    return node


def sync_members_to_paths(entry):
    """Keep analysing[entry].members in lock-step with entry['paths'] (the source
    of truth for which member files exist). Adds a default merged record for any
    path missing one; prunes member records whose path is no longer in paths.
    Returns True if changed. Prevents member/paths drift after capture."""
    paths = entry.get("paths") or []
    members = entry.get("members") if isinstance(entry.get("members"), dict) else {}
    entry["members"] = members
    changed = False
    for p in paths:
        if p not in members or not isinstance(members[p], dict):
            members[p] = {"raw_path": p, "gateway_path": "", "description": "",
                          "contains": "", "when_to_use": "", "status": "pending"}
            changed = True
    for stale in [k for k in members if k not in set(paths)]:
        del members[stale]
        changed = True
    return changed



def route_analysing_to_gateway(inbox_yaml, prefix):
    """When an analysing entry has disposition:route AND complete item+per-member
    semantics, copy it into the gateway (pillar/aspect/FG). CARRIES EVERYTHING
    from analysing — item description/contains/when_to_use, AND each member's
    merged record (raw_path + gateway_path + description/contains/when_to_use +
    status) — so nothing is lost on route. Also marks the analysing entry
    status:routed and stamps each member's gateway_path + status:routed.
    Must use PyYAML (gateway path-keys with ':' break ruamel)."""
    inbox = read_yaml(inbox_yaml) or {}
    if not isinstance(inbox, dict):
        return
    analysing = inbox.get("analysing") if isinstance(inbox.get("analysing"), dict) else {}
    if not analysing:
        return
    gw = inbox.setdefault("gateway", {})
    if not isinstance(gw, dict):
        gw = inbox["gateway"] = {}
    changed = False
    for name, entry in analysing.items():
        if not isinstance(entry, dict):
            continue
        if entry.get("disposition") != "route":
            continue
        if entry.get("status") == "routed":
            continue
        if not all(entry.get(k) for k in ANALYSING_FIELDS) or not entry.get("paths"):
            continue
        # align members with paths (source of truth) before validating/carrying
        if sync_members_to_paths(entry):
            changed = True
        members = entry.get("members") if isinstance(entry.get("members"), dict) else {}
        if not all(isinstance(members.get(p), dict) and all(members[p].get(k) for k in ANALYSING_FIELDS)
                   for p in entry["paths"]):
            continue  # not fully analysed yet — agent must finish semantics first
        pillar = str(entry.get("suggested_pillar") or "Uncategorized")
        aspect = str(entry.get("suggested_aspect") or "Architecture")
        fg = str(entry.get("suggested_fg") or "General")
        gw.setdefault(pillar, {}).setdefault(aspect, {}).setdefault(fg, {})
        gw_item_path = f"{pillar}/{aspect}/{fg}/{name}"
        gw_members = {}
        for p in entry["paths"]:
            m = members.get(p) if isinstance(members.get(p), dict) else {}
            gw_members[p] = {
                "raw_path": m.get("raw_path") or p,
                "gateway_path": m.get("gateway_path")
                                or f"{gw_item_path}#{p}",  # track where it landed
                "description": m.get("description", ""),
                "contains": m.get("contains", ""),
                "when_to_use": m.get("when_to_use", ""),
                "status": "routed",
            }
        gw[pillar][aspect][fg][name] = {
            "path": entry.get("drop") or name,
            "description": entry["description"],
            "contains": entry["contains"],
            "when_to_use": entry["when_to_use"],
            "extracted_concern": entry.get("extracted_concern", ""),
            "source_raw_item": name,
            "content_hash": entry.get("content_hash", ""),
            "members": gw_members,
        }
        # stamp source-side members with gateway_path + status so tracking follows
        for p in entry["paths"]:
            if isinstance(members.get(p), dict):
                members[p]["gateway_path"] = gw_members[p]["gateway_path"]
                members[p]["status"] = "routed"
        entry["status"] = "routed"
        changed = True
    if changed:
        smart_write(inbox_yaml, read_yaml(inbox_yaml), inbox)


# Signature cache so sync_entity skips an entity whose inputs are unchanged.
# The sync re-walks the whole toolboxes disk + runs 4 heavy detection passes
# every tick; on a stable workspace that is pure waste and saturates disk I/O
# (and competes with dashboard writes). Gate on input mtime/size instead.
_sync_sig: dict = {}


def _entity_sig(name, root, prefix):
    """Cheap signature of all inputs sync_entity reads/walks. If unchanged
    since the last successful sync, the entity is skipped entirely."""
    parts = []
    for fn in (f"{prefix}-runtime.yaml", f"{prefix}-missions.yaml",
               f"{prefix}-inbox.yaml", f"{prefix}-toolboxes.yaml"):
        p = root / fn
        try:
            st = p.stat()
            parts.append((fn, int(st.st_mtime), st.st_size))
        except OSError:
            parts.append((fn, 0, 0))
    # walk the two disk trees the sync scans (toolboxes registry + inbox gateways)
    for d in (root / f".{prefix}-toolboxes", root / f"{prefix}-inbox"):
        try:
            parts.append((str(d), int(d.stat().st_mtime)))
        except OSError:
            parts.append((str(d), 0))
    return tuple(parts)


def sync_entity(name, root):
    prefix = "os" if name == "os" else name
    # ── change gate: skip the 30s scan when inputs are unchanged ──
    sig = _entity_sig(name, root, prefix)
    if _sync_sig.get(name) == sig:
        return
    _sync_sig[name] = sig
    runtime_path = root / f"{prefix}-runtime.yaml"
    runtime = read_yaml(runtime_path)
    if not runtime:
        return
    old_runtime = copy.deepcopy(runtime)
    runtime["fill_queue"] = detect_fill_gaps(root, prefix)
    # Freeze a dated, immutable copy of the raw drop BEFORE it is routed into
    # the gateway (LAW 2 archive model: provenance trail + recovery point).
    snapshot_raw_archive(root, prefix)
    # DISCOVERY stage: archive drop -> write its full tree into inbox.discovery[drop]
    # so the agent can decide item boundaries (a drop is NOT one item).
    inbox_yaml = root / f"{prefix}-inbox.yaml"
    write_discovery(inbox_yaml, prefix)
    # ROUTING: route any fully-analysed (disposition:route, complete item+per-member
    # semantics) analysing entry into the gateway, carrying ALL member infos (no loss).
    route_analysing_to_gateway(inbox_yaml, prefix)
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
    # NOTE: review/backlog feedback is now MERGED INTO each queue item
    # (review_queue/backlog are lists of {item, feedback}); there are no longer
    # separate review_feedback / backlog_feedback maps, so the daemon must not
    # emit or preserve them. compute_metrics does not recompute list content.
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

            # ── §3 allow-list guard ──────────────────────────────────────────
            TWO_WAY = {("current_window",), ("dashboard", "theme"), ("manager_boot",)}
            kp = tuple(key_path)
            allowed = kp in TWO_WAY
            # FALSE carve-outs: UI may only turn these OFF (never back ON)
            if kp == ("dashboard", "enabled") and value is False:   # Shut down dashboard
                allowed = True
            if kp == ("sync_daemon",) and value is False:            # Shut down daemon
                allowed = True
            # entity-level status/autonomy/toolboxes toggles: 2-element paths
            # where kp[0] is NOT a reserved top-level key.
            RESERVED_TOP = {
                "current_window", "manager_boot", "sync_daemon", "dashboard",
                "status", "autonomy", "toolboxes", "inbox-gateway_delivery",
                "missions", "freshness"
            }
            if len(kp) == 2 and kp[0] not in RESERVED_TOP:
                allowed = True   # e.g. ["project_x", "status"]
            if not allowed:
                return JSONResponse(
                    {"ok": False, "error": f"'{'/'.join(map(str, key_path))}' is config-only"},
                    status_code=403
                )
            # ────────────────────────────────────────────────────────────────

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


async def api_command(request: Request):   # POST /api/command {"cmd":"restart_daemon"}
    """§3b — one-shot command sentinel for manager-mediated daemon control."""
    try:
        body = await request.json()
        cmd = body.get("cmd")
        if cmd != "restart_daemon":
            return JSONResponse({"ok": False, "error": "unknown cmd"}, status_code=400)
        # Write a sentinel the manager watches; do NOT self-restart (manager owns lifecycle)
        sentinel = WORKSPACE / ".stash" / "pids" / "daemon.cmd"
        sentinel.parent.mkdir(parents=True, exist_ok=True)
        sentinel.write_text(
            json.dumps({"cmd": "restart_daemon", "at": now_iso()}),
            encoding="utf-8"
        )
        return JSONResponse({"ok": True})
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)


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
    Route("/api/command", api_command, methods=["POST"]),
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


# Raw-ASGI no-cache wrapper: injects Cache-Control headers WITHOUT buffering
# the response body. Starlette's BaseHTTPMiddleware buffers FileResponse bodies
# and stalls large static assets on the event loop. This passes chunks
# straight through, so big files stream normally.
class _NoCacheMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        path = scope.get("path", "")
        if path.startswith("/static") or path in ("/", "/index.html"):
            async def _send(message):
                if message["type"] == "http.response.start":
                    hdrs = list(message.get("headers", []))
                    hdrs.append((b"cache-control", b"no-store, no-cache, must-revalidate, max-age=0"))
                    hdrs.append((b"pragma", b"no-cache"))
                    hdrs.append((b"expires", b"0"))
                    message = dict(message)
                    message["headers"] = hdrs
                await send(message)
            return await self.app(scope, receive, _send)
        return await self.app(scope, receive, send)

app.add_middleware(_NoCacheMiddleware)



if __name__ == "__main__":
    import sys
    import socket
    import os as _os
    import asyncio as _aio

    # §4 — headless flag: sync loop only, no web server
    headless = "--no-server" in sys.argv
    PORT = int(_os.environ.get("PB_PORT", "8000"))

    if headless:
        print(f"[daemon] PlugBoot HEADLESS (sync only). Workspace: {WORKSPACE}")
        _aio.run(sync_loop())
    else:
        import uvicorn
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
