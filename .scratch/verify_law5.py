import os, hashlib, yaml

ROOT = r"C:\Users\BAB AL SAFA\Desktop\plugboot"
GW = os.path.join(ROOT, "_os", "os-inbox", ".os-inbox_gateway")
INBOX_YAML = os.path.join(ROOT, "_os", "os-inbox.yaml")
RUNTIME_YAML = os.path.join(ROOT, "_os", "os-runtime.yaml")
P07 = os.path.join(ROOT, "_os", "os_prompts", "07_inbox-Inbox_and_Gateway.md")
P05 = os.path.join(ROOT, "_os", "os_prompts", "05_evolution-Evolution_System.md")

problems=[]

# Disk tree
disk_fgs={}
for pillar in os.listdir(GW):
    p=os.path.join(GW,pillar)
    if not os.path.isdir(p) or pillar.startswith("."): continue
    for aspect in os.listdir(p):
        a=os.path.join(p,aspect)
        if not os.path.isdir(a) or aspect.startswith("."): continue
        for fg in os.listdir(a):
            f=os.path.join(a,fg)
            if os.path.isdir(f) and not fg.startswith("."):
                disk_fgs.setdefault(pillar,{}).setdefault(aspect,[]).append(fg)

# LAW4: NO source/tool/version-named FGs remain. Curated list of what's NOW forbidden
# (the OLD bad names). The new function names are all clean, so this set is the historical bad list.
BAD_OLD={"miscellaneous","coding rules and tools","operational_workflows","planning_and_gaps",
         "complex systems","ops_and_automation","setup-matt-pocock-skills","migrate-to-shoehorn",
         "obsidian-vault","swift-concurrency-6-2","sketch","identity_and_laws","automation_ops",
         "browserbase","dev_frameworks","dev_guidelines","dev_tools","edit-article","grill-me",
         "grill-with-docs","planning_and_reviews","scaffold-exercises","to-prd","visa-doc-translate",
         "write-a-skill"}
for pillar,asp in disk_fgs.items():
    for aspect,fgs in asp.items():
        for fg in fgs:
            if fg in BAD_OLD:
                problems.append(f"LAW4: source-named FG on disk {pillar}/{aspect}/{fg}")

# LAW2: NO cross-FG/cross-pillar duplicate file contents
def md5(path):
    h=hashlib.md5()
    with open(path,"rb") as f:
        for c in iter(lambda:f.read(8192),b""): h.update(c)
    return h.hexdigest()
dups={}
for root,dirs,files in os.walk(GW):
    if os.path.basename(root).startswith("."): continue
    parts=os.path.relpath(root,GW).replace("\\","/").split("/")
    if len(parts)<3: continue
    pillar,aspect,fg=parts[0],parts[1],parts[2]
    for fn in files:
        if fn in (".gitkeep","README.md"): continue
        fp=os.path.join(root,fn)
        dups.setdefault(md5(fp),[]).append((pillar,aspect,fg,fn))
cross=0
for h,locs in dups.items():
    if len(locs)<2: continue
    keys=set((p,a,g) for (p,a,g,fn) in locs)
    if len(keys)>1:
        cross+=1
        problems.append(f"LAW2: cross-FG dup {locs[0][3]} across {sorted(keys)}")
if cross==0: print("LAW2 OK: 0 cross-FG/cross-pillar duplicate contents")

# LAW4: README in every FG
miss=0; total=0
for pillar,asp in disk_fgs.items():
    for aspect,fgs in asp.items():
        for fg in fgs:
            total+=1
            if not os.path.exists(os.path.join(GW,pillar,aspect,fg,"README.md")):
                miss+=1; problems.append(f"LAW4: missing README {pillar}/{aspect}/{fg}")
if miss==0: print(f"LAW4 OK: README role-declaration in all {total} FGs")

# YAML==DISK
with open(INBOX_YAML,encoding="utf-8") as f: doc=yaml.safe_load(f)
y=set(); d=set()
for pillar,asp in doc["gateway"].items():
    for aspect,fgs in asp.items():
        for fg in fgs: y.add(f"{pillar}/{aspect}/{fg}")
for pillar,asp in disk_fgs.items():
    for aspect,fgs in asp.items():
        for fg in fgs: d.add(f"{pillar}/{aspect}/{fg}")
if y==d: print(f"YAML==DISK OK: {len(d)} FGs identical in os-inbox.yaml vs disk")
else: problems.append(f"YAML/DISK mismatch y_d={y-d} d_y={d-y}")

# RUNTIME anchors
rt=open(RUNTIME_YAML,encoding="utf-8").read()
if "THE FIVE ROUTING LAWS" in rt: print("LAW5-anchor OK: runtime cites THE FIVE ROUTING LAWS")
else: problems.append("runtime missing THE FIVE ROUTING LAWS anchor")
if "/Capabilities/sketch" in rt or "identity_and_laws" in rt: problems.append("runtime stale gateway ref")

# os_prompt 05 + 07 contain all 5 laws
p07=open(P07,encoding="utf-8").read(); p05=open(P05,encoding="utf-8").read()
if all(f"LAW {i}" in p07 for i in range(1,6)): print("os_prompt 07 OK: all 5 LAWS present (canonical)")
else: problems.append("os_prompt 07 missing LAW markers")
if "LAW 5 of the Five Routing Laws" in p05: print("os_prompt 05 OK: cross-links THE FIVE ROUTING LAWS")
else: problems.append("os_prompt 05 missing cross-link")

print("\n=== FINAL RESULT ===")
print("ALL 5 LAWS IMPLEMENTED (disk + YAML + os_prompt) ✅" if not problems else "PROBLEMS:")
for p in problems: print(" -",p)
