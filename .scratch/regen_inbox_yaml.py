import os, hashlib, yaml

GW = r"C:\Users\BAB AL SAFA\Desktop\plugboot\_os\os-inbox\.os-inbox_gateway"
OUT = r"C:\Users\BAB AL SAFA\Desktop\plugboot\_os\os-inbox.yaml"

def content_hash(path):
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()[:16]

def rel(p):
    return os.path.relpath(p, r"C:\Users\BAB AL SAFA\Desktop\plugboot").replace("\\", "/")

gateway = {}
total_items = 0
for pillar in sorted(os.listdir(GW)):
    pdir = os.path.join(GW, pillar)
    if not os.path.isdir(pdir) or pillar.startswith("."): continue
    gateway[pillar] = {}
    for aspect in sorted(os.listdir(pdir)):
        adir = os.path.join(pdir, aspect)
        if not os.path.isdir(adir) or aspect.startswith("."): continue
        gateway[pillar][aspect] = {}
        for fg in sorted(os.listdir(adir)):
            fdir = os.path.join(adir, fg)
            if not os.path.isdir(fdir) or fg.startswith("."): continue
            gateway[pillar][aspect][fg] = {}
            for root, dirs, files in os.walk(fdir):
                # skip nested FG subfolders from being double-counted as items; we record leaf files
                for fn in sorted(files):
                    if fn == ".gitkeep": continue
                    fp = os.path.join(root, fn)
                    key = rel(fp)
                    gateway[pillar][aspect][fg][key] = {
                        "path": rel(fp),
                        "description": f"{fg} resource: {fn}.",
                        "contains": "moved from raw into the gateway (raw drop drained to archive)",
                        "when_to_use": f"When working within the {pillar} / {aspect} concern ({fg}).",
                        "extracted_concern": f"Routed into {pillar}/{aspect}/{fg} per-item during inbox processing (LAW 3).",
                        "source_raw_item": "os-inbox (drained to archive)",
                        "content_hash": content_hash(fp),
                    }
                    total_items += 1

with open(OUT, "r", encoding="utf-8") as f:
    doc = yaml.safe_load(f)

doc["gateway"] = gateway
doc["metrics"]["gateway_items"] = total_items
n_pillars = len(gateway)
n_fg = sum(len(a) for p in gateway.values() for a in p.values())
doc["metrics"]["pillars"] = n_pillars
doc["metrics"]["functional_groups"] = n_fg

with open(OUT, "w", encoding="utf-8") as f:
    yaml.safe_dump(doc, f, sort_keys=False, allow_unicode=True, width=1000)

print(f"Regenerated os-inbox.yaml gateway: pillars={n_pillars} FGs={n_fg} items={total_items}")
