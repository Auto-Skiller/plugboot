"""The sync engine.

Responsibilities per cycle (only when config `sync_daemon` is on):
  1. Discover entities (OS + projects registered in index.yaml).
  2. Reconcile the "brain" listing (os_prompts / data) against disk:
     add stub entries for new files, drop entries for deleted files, and
     flag newly-added files in the runtime `fill_queue` so an agent knows
     which semantics still need filling (hybrid brain, Decisions #5).
  3. Reconcile the inbox + `.gateway/<pillar>/<group>/` listing the same way.
  4. Stamp freshness on every touched YAML.
  5. Compute light rollups (mission / toolbox / inbox counts).

Writes are simple (no lock, no atomic) per ADR-0001. Git is recovery.
"""
from __future__ import annotations

import datetime
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import paths      # noqa: E402
import yamlio     # noqa: E402
import entities   # noqa: E402
from entities import Entity  # noqa: E402

_PLACEHOLDERS = {"...", "project_name", "file_name", "folder_name", "domain_name"}


def now_iso() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


# --- config / discovery ---------------------------------------------------

def load_config() -> dict:
    return yamlio.load(paths.CONFIG_FILE)


def load_index() -> dict:
    return yamlio.load(paths.INDEX_FILE)


def daemon_enabled(config: dict) -> bool:
    val = (config or {}).get("sync_daemon", True)
    return str(val).strip().lower() not in ("false", "off", "no", "0")


def discover_entities(index: dict) -> list[Entity]:
    ents: list[Entity] = [entities.os_entity()]
    projects = (index or {}).get("projects", {}) or {}
    for name in projects:
        if name in _PLACEHOLDERS:
            continue
        ents.append(entities.project_entity(name))
    return ents


# --- freshness ------------------------------------------------------------

def stamp_freshness(data: dict, edited: bool = False) -> dict:
    fr = data.get("freshness")
    if not isinstance(fr, dict):
        fr = {}
    fr["sync_status"] = "fresh"
    fr["sync_count"] = int(fr.get("sync_count", 0) or 0) + 1
    fr["last_synced"] = now_iso()
    if edited or "last_edited" not in fr:
        fr["last_edited"] = fr.get("last_edited", "") or now_iso()
    data["freshness"] = fr
    return data


# --- disk scanning --------------------------------------------------------

def list_files(root: Path) -> list[Path]:
    """All non-hidden files under root (recursive), skipping .gitkeep."""
    out: list[Path] = []
    if not root.exists():
        return out
    for p in sorted(root.rglob("*")):
        if not p.is_file():
            continue
        relparts = p.relative_to(root).parts
        if any(part.startswith(".") for part in relparts):
            continue
        if p.name == ".gitkeep":
            continue
        out.append(p)
    return out


def _stub() -> dict:
    return {"role": "", "contains": "", "when_to_use": "", "triggers": [], "path": ""}


def reconcile(files: list[Path], root: Path, existing: dict) -> tuple[dict, list[str]]:
    """Reconcile a flat listing keyed by path-relative-to-root.

    Returns (new_listing, added_paths). Existing semantic fields are kept;
    new files get a stub and are reported as added (to feed fill_queue).
    """
    existing = existing or {}
    present: dict = {}
    added: list[str] = []
    for f in files:
        key = f.relative_to(root).as_posix()
        relpath = paths.rel(f)
        prev = existing.get(key)
        if isinstance(prev, dict):
            prev["path"] = relpath
            present[key] = prev
        else:
            entry = _stub()
            entry["path"] = relpath
            present[key] = entry
            added.append(key)
    return present, added


# --- per-entity sync ------------------------------------------------------

def sync_entity(ent: Entity) -> None:
    ent.brain_dir.mkdir(parents=True, exist_ok=True)
    ent.inbox_dir.mkdir(parents=True, exist_ok=True)

    # 1) brain (os_prompts / data)
    brain = yamlio.load(ent.brain)
    reserved = {k: v for k, v in brain.items() if k in ("freshness",)}
    existing_items = {k: v for k, v in brain.items() if k not in ("freshness",) and k not in _PLACEHOLDERS}
    listing, brain_added = reconcile(list_files(ent.brain_dir), ent.brain_dir, existing_items)
    new_brain: dict = {}
    new_brain.update(reserved)
    new_brain.update(listing)
    stamp_freshness(new_brain)
    yamlio.dump(ent.brain, new_brain)

    # 2) inbox + gateway
    inbox = yamlio.load(ent.inbox)
    gw_existing = inbox.get("gateway", {}) if isinstance(inbox.get("gateway"), dict) else {}
    gw_listing, gw_added = reconcile(list_files(ent.gateway_dir), ent.gateway_dir, gw_existing)
    inbox["gateway"] = gw_listing
    stamp_freshness(inbox)
    yamlio.dump(ent.inbox, inbox)

    # 3) runtime: fill_queue + freshness
    runtime = yamlio.load(ent.runtime)
    fq = runtime.get("fill_queue") if isinstance(runtime.get("fill_queue"), dict) else {}
    fq["os_prompts/data"] = brain_added
    fq["inbox"] = gw_added
    fq.setdefault("vars", fq.get("vars", []) or [])
    fq.setdefault("missions", fq.get("missions", []) or [])
    fq.setdefault("toolboxes", fq.get("toolboxes", []) or [])
    runtime["fill_queue"] = fq
    stamp_freshness(runtime)
    yamlio.dump(ent.runtime, runtime)

    # 4) mission rollups
    _rollup_missions(ent)
    # 5) toolbox freshness (counts left light for now)
    tb = yamlio.load(ent.toolboxes)
    if tb:
        stamp_freshness(tb)
        yamlio.dump(ent.toolboxes, tb)


def _rollup_missions(ent: Entity) -> None:
    m = yamlio.load(ent.missions)
    if not m:
        return
    total = actives = blocked = 0
    for bucket in ("standard", "research"):
        block = m.get(bucket) or {}
        for name, mission in block.items():
            if name in _PLACEHOLDERS or not isinstance(mission, dict):
                continue
            total += 1
            state = mission.get("state", {}) if isinstance(mission.get("state"), dict) else {}
            if str(state.get("status")).lower() == "true":
                actives += 1
            if str(state.get("progress")).lower() == "blocked":
                blocked += 1
    evo = m.get("evolution") or {}
    for _mode, entries in evo.items():
        if not isinstance(entries, dict):
            continue
        for name, mission in entries.items():
            if name in _PLACEHOLDERS or not isinstance(mission, dict):
                continue
            total += 1
            state = mission.get("state", {}) if isinstance(mission.get("state"), dict) else {}
            if str(state.get("status")).lower() == "true":
                actives += 1
            if str(state.get("progress")).lower() == "blocked":
                blocked += 1
    metrics = m.get("metrics") if isinstance(m.get("metrics"), dict) else {}
    metrics["total"] = total
    metrics["actives"] = actives
    metrics["blocked"] = blocked
    m["metrics"] = metrics
    stamp_freshness(m)
    yamlio.dump(ent.missions, m)


# --- top-level cycle ------------------------------------------------------

def sync_once() -> dict:
    config = load_config()
    if not daemon_enabled(config):
        return {"skipped": True, "reason": "sync_daemon off"}
    index = load_index()
    ents = discover_entities(index)
    done = []
    for ent in ents:
        try:
            sync_entity(ent)
            done.append(ent.name)
        except Exception as e:  # noqa: BLE001 - one bad entity must not kill the cycle
            print(f"[sync] entity '{ent.name}' failed: {e}")
    return {"skipped": False, "synced": done}


if __name__ == "__main__":
    import json
    print(json.dumps(sync_once(), indent=2))
