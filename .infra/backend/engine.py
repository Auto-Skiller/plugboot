"""engine.py — Agentic OS sync engine.

One sync tick does, per entity (_os + each project):
  1. Stamp freshness (sync_status/last_synced) on runtime + inbox + toolboxes yaml.
  2. Scan watched folders (data / os_prompts, inbox gateway, toolboxes) and
     reconcile the machine-index sections: add entries for new files/folders,
     remove entries for deleted ones.
  3. For every newly-added entry, flag it in runtime.fill_queue so the agent
     knows to fill the semantic fields (Decisions #5 hybrid brain).

NO metrics guessing beyond simple counts. NO locks / atomic writes (Decisions #2).
"""
from __future__ import annotations

import argparse
import datetime as _dt
from pathlib import Path

from paths import WORKSPACE, CONFIG, INDEX, OS_DIR, entity_dirs, rel
from ymlio import read_yaml, write_yaml


def _now() -> str:
    return _dt.datetime.now(_dt.timezone.utc).isoformat()


def _entity_name(entity_root: Path) -> str:
    return "os" if entity_root.name == "_os" else entity_root.name


def _prefix(entity_root: Path) -> str:
    """File prefix: '_os/os-...' uses 'os'; 'project_name/project_name-...'."""
    return _entity_name(entity_root)


def _stamp_freshness(doc: dict, *, edited: bool = False) -> dict:
    fr = doc.get("freshness") or {}
    fr["sync_status"] = "fresh"
    fr["sync_count"] = int(fr.get("sync_count") or 0) + 1
    fr["last_synced"] = _now()
    if edited or not fr.get("last_edited"):
        fr.setdefault("last_edited", _now())
    doc["freshness"] = fr
    return doc


def _scan_folder_entries(folder: Path) -> dict:
    """Return {name: {path, kind}} for immediate children of a folder."""
    out: dict = {}
    if not folder.exists():
        return out
    for child in sorted(folder.iterdir()):
        if child.name.startswith("."):
            continue
        out[child.name] = {
            "path": rel(child),
            "kind": "folder" if child.is_dir() else "file",
        }
    return out


def _reconcile_index(index_section: dict, scanned: dict, fill_queue: list, queue_tag: str) -> dict:
    """Add new scanned entries (flag them in fill_queue), drop vanished ones.

    An entry is 'filled' once it has a non-empty `description`. New entries get
    structural fields only + a blank semantic stub, and are flagged for the agent.
    """
    index_section = index_section or {}
    # Remove entries whose file/folder disappeared.
    for name in list(index_section.keys()):
        if name not in scanned:
            index_section.pop(name, None)
    # Add newcomers.
    for name, meta in scanned.items():
        if name not in index_section:
            index_section[name] = {
                "path": meta["path"],
                "kind": meta["kind"],
                "description": "",
                "contains": "",
                "when_to_use": "",
            }
            flag = f"{queue_tag}:{name}"
            if flag not in fill_queue:
                fill_queue.append(flag)
        else:
            # keep path fresh in case of moves
            index_section[name]["path"] = meta["path"]
    return index_section


def sync_entity(entity_root: Path) -> None:
    name = _entity_name(entity_root)
    prefix = _prefix(entity_root)

    runtime_path = entity_root / f"{prefix}-runtime.yaml"
    inbox_path = entity_root / f"{prefix}-inbox.yaml"
    data_key = "os_prompts" if name == "os" else "data"
    data_yaml = entity_root / (f"{prefix}_prompts.yaml" if name == "os" else f"{prefix}-data.yaml")

    runtime = read_yaml(runtime_path)
    if not isinstance(runtime, dict):
        runtime = {}
    fill_queue = (runtime.get("fill_queue") or {})
    if not isinstance(fill_queue, dict):
        fill_queue = {}

    # --- data / os_prompts folder brain ---
    data_folder = entity_root / (f"{prefix}_prompts" if name == "os" else f"{prefix}-data")
    data_doc = read_yaml(data_yaml)
    if not isinstance(data_doc, dict):
        data_doc = {}
    dq = fill_queue.get(data_key) or []
    scanned = _scan_folder_entries(data_folder)
    # reconcile top-level of the data doc (excluding freshness)
    body = {k: v for k, v in data_doc.items() if k != "freshness"}
    reconciled = _reconcile_index(body, scanned, dq, data_key)
    new_data_doc = {"freshness": data_doc.get("freshness", {})}
    new_data_doc.update(reconciled)
    _stamp_freshness(new_data_doc)
    write_yaml(data_yaml, new_data_doc)
    fill_queue[data_key] = dq

    # --- inbox + .gateway (pillar -> functional-group) brain ---
    inbox = read_yaml(inbox_path)
    if not isinstance(inbox, dict):
        inbox = {}
    inbox_folder = entity_root / (f"{prefix}-inbox")
    gateway_folder = inbox_folder / ".gateway"
    iq = fill_queue.get("inbox") or []
    gateway_scan = {}
    if gateway_folder.exists():
        for pillar in sorted(gateway_folder.iterdir()):
            if pillar.is_dir() and not pillar.name.startswith("."):
                gateway_scan[pillar.name] = _scan_folder_entries(pillar)
    gw_section = inbox.get("gateway") or {}
    for pillar, items in gateway_scan.items():
        pill = gw_section.get(pillar) or {}
        pill = _reconcile_index(pill, items, iq, f"inbox/{pillar}")
        gw_section[pillar] = pill
    for pillar in list(gw_section.keys()):
        if pillar not in gateway_scan:
            gw_section.pop(pillar, None)
    inbox["gateway"] = gw_section
    inbox.setdefault("processed_evolutions", [])  # tracks INBOX evolutions already run
    _stamp_freshness(inbox)
    write_yaml(inbox_path, inbox)
    fill_queue["inbox"] = iq

    # --- toolboxes freshness only (agent/user own the tree) ---
    tb_path = entity_root / f"{prefix}-toolboxes.yaml"
    tb = read_yaml(tb_path)
    if isinstance(tb, dict):
        _stamp_freshness(tb)
        write_yaml(tb_path, tb)

    # --- persist runtime freshness + fill_queue ---
    runtime["fill_queue"] = fill_queue
    _stamp_freshness(runtime)
    write_yaml(runtime_path, runtime)
    print(f"[engine] synced entity: {name}")


def sync_all() -> None:
    config = read_yaml(CONFIG)
    if not isinstance(config, dict):
        config = {}
    # sync_daemon kill-switch (Decisions / config schema)
    if str(config.get("sync_daemon", True)).lower() in {"false", "off", "0"}:
        print("[engine] sync_daemon is OFF — skipping tick.")
        return
    roots = entity_dirs()
    for root in roots:
        try:
            sync_entity(root)
        except Exception as e:  # noqa: BLE001
            print(f"[engine] error syncing {root}: {e}")
    _sync_root_index(roots)
    print("[engine] sync cycle complete.")


def _sync_root_index(roots) -> None:
    idx = read_yaml(INDEX)
    if not isinstance(idx, dict):
        idx = {}
    projects = {}
    for root in roots:
        if root.name == "_os":
            continue
        projects[root.name] = {"path": rel(root)}
    idx.setdefault("workspace_files", {})
    idx["projects"] = projects
    _stamp_freshness(idx)
    write_yaml(INDEX, idx)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Agentic OS sync engine")
    ap.add_argument("--once", action="store_true", help="run one sync tick and exit")
    ap.parse_args()
    sync_all()
