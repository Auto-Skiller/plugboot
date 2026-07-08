"""Agentic OS sync engine.

Responsibilities (deterministic, engine-owned):
  - discover active entities from config.yaml
  - stamp freshness on every entity YAML
  - maintain the fill_queue in each entity runtime (brain gaps the agent fills)
  - roll up mission + toolbox metrics
  - rebuild the workspace index (path map)

The "brain" pre-fill is HYBRID (Decisions #5): the daemon detects files that
land or leave a watched folder and flags them in runtime.fill_queue with the
semantic fields left blank; the agent watches fill_queue and fills meaning.
"""
from __future__ import annotations

from pathlib import Path

from yaml_io import load_yaml, dump_yaml, stamp_freshness, now_iso

WORKSPACE = Path(__file__).resolve().parents[2]
CONFIG = WORKSPACE / "config.yaml"
INDEX = WORKSPACE / "index.yaml"

SEMANTIC_FIELDS = ("role", "description", "contains", "when_to_use")


def _rel(p: Path) -> str:
    return str(p.relative_to(WORKSPACE)).replace("\\", "/")


def _scan_files(folder: Path) -> list[Path]:
    if not folder.exists():
        return []
    return [
        p
        for p in sorted(folder.rglob("*"))
        if p.is_file() and not p.name.startswith(".")
    ]


def _entity_layout(name: str, root: Path, is_os: bool) -> dict:
    """Resolve the file/folder layout for an entity given the new schema."""
    brain_file = "os_prompts.yaml" if is_os else f"{name}-data.yaml"
    brain_dir = "os_prompts" if is_os else f"{name}-data"
    inbox_dir = "os-inbox" if is_os else f"{name}-inbox"
    return {
        "root": root,
        "board": root / f"{name}-board.md" if not is_os else root / "os-board.md",
        "runtime": root / (f"{name}-runtime.yaml" if not is_os else "os-runtime.yaml"),
        "missions": root / (f"{name}-missions.yaml" if not is_os else "os-missions.yaml"),
        "toolboxes": root / (f"{name}-toolboxes.yaml" if not is_os else "os-toolboxes.yaml"),
        "inbox": root / (f"{name}-inbox.yaml" if not is_os else "os-inbox.yaml"),
        "brain_file": root / brain_file,
        "brain_dir": root / brain_dir,
        "inbox_dir": root / inbox_dir,
    }


def _fill_queue_for_brain(brain: dict, files: list[Path]) -> list[str]:
    """Return relative paths of files that are missing or semantically empty."""
    gaps: list[str] = []
    for f in files:
        key = f.name
        entry = brain.get(key) if isinstance(brain, dict) else None
        described = isinstance(entry, dict) and any(
            str(entry.get(field) or "").strip() for field in SEMANTIC_FIELDS
        )
        if not described:
            gaps.append(_rel(f))
    return gaps


def _mission_metrics(missions: dict) -> dict:
    counts = {"total": 0, "actives": 0, "blocked": 0}
    for bucket in ("standard", "research"):
        for _, m in (missions.get(bucket) or {}).items():
            if not isinstance(m, dict):
                continue
            counts["total"] += 1
            state = m.get("state", {}) if isinstance(m.get("state"), dict) else {}
            if state.get("status") in (True, "true", "on"):
                counts["actives"] += 1
            if state.get("progress") == "blocked":
                counts["blocked"] += 1
    evo = missions.get("evolution") or {}
    for _, group in evo.items():
        if isinstance(group, dict):
            for _, m in group.items():
                if isinstance(m, dict):
                    counts["total"] += 1
    return counts


def _toolbox_metrics(toolboxes: dict) -> dict:
    total = 0
    active = 0
    for domain, dval in (toolboxes or {}).items():
        if not isinstance(dval, dict) or domain in ("freshness", "metrics"):
            continue
        for tname, tval in dval.items():
            if isinstance(tval, dict) and "status" in tval:
                total += 1
                if tval.get("status") in (True, "true", "on"):
                    active += 1
    return {"total": total, "active": active}


def sync_entity(name: str, root: Path, is_os: bool) -> dict:
    """Sync one entity. Returns a small summary dict for the index/logs."""
    lay = _entity_layout(name, root, is_os)
    root.mkdir(parents=True, exist_ok=True)

    # --- freshness on every existing entity YAML ---
    runtime = load_yaml(lay["runtime"])
    missions = load_yaml(lay["missions"])
    toolboxes = load_yaml(lay["toolboxes"])
    inbox = load_yaml(lay["inbox"])
    brain = load_yaml(lay["brain_file"])

    # --- brain fill_queue (hybrid pre-fill) ---
    brain_files = _scan_files(lay["brain_dir"])
    tb_files = _scan_files(lay["root"] / (".os-toolboxes" if is_os else f".{name}-toolboxes"))
    inbox_files = _scan_files(lay["inbox_dir"])

    fq = runtime.setdefault("fill_queue", {})
    brain_key = "os_prompts/data"
    fq[brain_key] = _fill_queue_for_brain(brain, brain_files)
    fq["toolboxes"] = [
        _rel(f) for f in tb_files if f.name not in (toolboxes or {})
    ]
    fq["inbox"] = [
        _rel(f) for f in inbox_files if f.name not in (inbox.get("items", {}) or {})
    ]
    fq.setdefault("vars", [])
    fq.setdefault("missions", [])

    # --- metrics rollups ---
    missions.setdefault("metrics", {}).update(_mission_metrics(missions))
    toolboxes.setdefault("metrics", {}).update(_toolbox_metrics(toolboxes))

    # --- stamp + write back (only files that already exist stay authoritative;
    #     runtime/missions/toolboxes/inbox are engine-touched) ---
    for data, path in (
        (runtime, lay["runtime"]),
        (missions, lay["missions"]),
        (toolboxes, lay["toolboxes"]),
        (inbox, lay["inbox"]),
    ):
        if data:
            stamp_freshness(data)
            dump_yaml(path, data)

    return {
        "root": _rel(root),
        "board": {"file_path": _rel(lay["board"])},
        "runtime": {"file_path": _rel(lay["runtime"])},
        "missions": {"file_path": _rel(lay["missions"])},
        "toolboxes": {"file_path": _rel(lay["toolboxes"])},
        "inbox": {"file_path": _rel(lay["inbox"])},
        "brain_gaps": len(fq[brain_key]),
    }


def sync_all() -> dict:
    """Full sync cycle. Returns a summary used by the dashboard/API."""
    config = load_yaml(CONFIG)
    index = load_yaml(INDEX) or {}
    summary = {"synced_at": now_iso(), "entities": {}}

    # OS entity (always-on unless explicitly off)
    if config.get("status", True) is not False:
        summary["entities"]["os"] = sync_entity("os", WORKSPACE / "_os", is_os=True)

    # Projects: any top-level quoted key that resolves to a folder with a board
    projects = index.setdefault("projects", {})
    for key, val in config.items():
        if not isinstance(val, dict) or key in ("freshness", "missions"):
            continue
        proot = WORKSPACE / key
        if proot.exists():
            summary["entities"][key] = sync_entity(key, proot, is_os=False)
            projects.setdefault(key, {"role": "project", "path": key})

    stamp_freshness(index)
    index.setdefault("os", {})["path"] = "_os"
    dump_yaml(INDEX, index)
    return summary


if __name__ == "__main__":
    import json

    print(json.dumps(sync_all(), indent=2))
