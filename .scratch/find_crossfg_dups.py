import os, hashlib

GW = r"C:\Users\BAB AL SAFA\Desktop\plugboot\_os\os-inbox\.os-inbox_gateway"

def md5(path):
    h=hashlib.md5()
    with open(path,"rb") as f:
        for c in iter(lambda:f.read(8192),b""): h.update(c)
    return h.hexdigest()

# map: (pillar, aspect, fg) -> list of files
loc={}
dups={}
for root,dirs,files in os.walk(GW):
    if os.path.basename(root).startswith("."): continue
    parts=os.path.relpath(root,GW).replace("\\","/").split("/")
    if len(parts)<3: continue
    pillar,aspect,fg=parts[0],parts[1],parts[2]
    for fn in files:
        if fn in (".gitkeep","README.md"): continue
        fp=os.path.join(root,fn)
        h=md5(fp)
        dups.setdefault(h,[]).append((pillar,aspect,fg,fn,fp))

print("=== CROSS-FG / CROSS-PILLAR DUPLICATES (true LAW2 violations) ===")
count=0
within=0
for h,locs in dups.items():
    if len(locs)<2: continue
    keys=set((p,a,fg) for (p,a,fg,fn,fp) in locs)
    if len(keys)>1:
        count+=1
        print(f"\n[{count}] {locs[0][3]}  (x{len(locs)})")
        for p,a,fg,fn,fp in locs:
            print(f"    {p}/{a}/{fg}/")
    else:
        within+=1
print(f"\nSUMMARY: cross-FG/cross-pillar dup groups = {count}; within-same-FG dup groups (not violations) = {within}")
