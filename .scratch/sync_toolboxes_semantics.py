#!/usr/bin/env python
# Sync authoritative frontmatter from disk SKILL.md/AGENT.md into os-toolboxes.yaml
# Fill-only: only writes fields that are currently empty/missing or matured-stale.
# Uses ruamel.yaml to preserve formatting/comments.
import os, glob, sys
from ruamel.yaml import YAML

ROOT = r"C:/Users/BAB AL SAFA/Desktop/plugboot"
TB_YAML = os.path.join(ROOT, "_os", "os-toolboxes.yaml")
TB_DIR = os.path.join(ROOT, "_os", ".os-toolboxes")

SKILL_FIELDS = ["when_to_use", "triggers", "inputs", "outputs", "maturity"]
AGENT_FIELDS = ["when_to_use", "triggers", "role", "maturity"]

def parse_frontmatter(path):
    try:
        txt = open(path, encoding="utf-8", errors="ignore").read()
    except Exception:
        return None
    if not txt.startswith("---"):
        return None
    parts = txt.split("---", 2)
    if len(parts) < 3:
        return None
    try:
        import yaml as py
        fm = py.safe_load(parts[1])
    except Exception:
        return None
    if not isinstance(fm, dict):
        return None
    creds = fm.get("credentials")
    return creds if isinstance(creds, dict) else None

def is_empty(v):
    if v is None:
        return True
    if isinstance(v, (list, dict, str)) and len(v) == 0:
        return True
    if isinstance(v, str) and v.strip() in ("", "list"):
        return True
    if isinstance(v, list) and all((isinstance(x, str) and x.strip() in ("", "list")) for x in v):
        return True
    return False

def normalize(v):
    if isinstance(v, list):
        return [str(x).strip() for x in v if str(x).strip() not in ("", "list")]
    return v

changes = []
unmatched = []

def sync_entries(entries, fields, kind):
    for name, node in entries.items():
        if not isinstance(node, dict):
            continue
        candidates = glob.glob(os.path.join(TB_DIR, "**", kind + "s", name, kind.upper() + ".md"), recursive=True)
        if not candidates:
            candidates = glob.glob(os.path.join(TB_DIR, "**", name, kind.upper() + ".md"), recursive=True)
        md = candidates[0] if candidates else None
        fm = parse_frontmatter(md) if md else None
        if fm is None:
            unmatched.append(name)
            continue
        for fld in fields:
            disk_val = fm.get(fld)
            if disk_val is None:
                continue
            cur = node.get(fld)
            if fld == "maturity":
                order = {"stub":0,"functional":1,"hardened":2,"battle-tested":3}
                if cur not in order or disk_val not in order:
                    continue
                if order.get(str(disk_val),0) > order.get(str(cur),0):
                    changes.append((name, fld, cur, disk_val))
                    node[fld] = disk_val
                continue
            if not is_empty(cur):
                continue
            nv = normalize(disk_val)
            if nv in ([], ""):
                continue
            changes.append((name, fld, cur, nv))
            node[fld] = nv

def walk(node):
    if not isinstance(node, dict):
        return
    for k, v in node.items():
        if isinstance(v, dict):
            if "skills" in v and isinstance(v["skills"], dict):
                sync_entries(v["skills"], SKILL_FIELDS, "skill")
            if "agents" in v and isinstance(v["agents"], dict):
                sync_entries(v["agents"], AGENT_FIELDS, "agent")
            walk(v)

yaml = YAML()
yaml.preserve_quotes = True
with open(TB_YAML) as f:
    data = yaml.load(f)

tb = data.get("toolboxes", {})
walk(tb)

with open(TB_YAML, "w") as f:
    yaml.dump(data, f)

print("CHANGES:", len(changes))
for c in changes:
    print("  ", c[0], "->", c[1], ":", repr(c[2]), "=>", repr(c[3])[:80])
print("UNMATCHED (no disk md / no frontmatter):", unmatched)
