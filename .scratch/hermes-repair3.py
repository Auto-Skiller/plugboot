import re, yaml

P = "_os/os-runtime.yaml"
with open(P, encoding="utf-8") as f:
    raw = f.read()

marker = "recent_events:"
mi = raw.index(marker)
head = raw[: mi + len(marker)]          # includes "recent_events:"
block = raw[mi + len(marker):]          # everything after, to EOF

entries = []
cur = None
for ln in block.split("\n"):
    # a new entry starts with optional 2-space indent then "- "
    m = re.match(r"^( {0,2})- (.*)$", ln)
    if m:
        if cur is not None:
            entries.append(cur)
        cur = m.group(2).strip()
    elif cur is not None:
        # continuation line (may be indented) -> fold with space
        if ln.strip() == "":
            pass
        else:
            cur += " " + ln.strip()
if cur is not None:
    entries.append(cur)

print("reconstructed entries:", len(entries))

def q(s):
    return "'" + s.strip().replace("'", "''") + "'"

emitted = "\n".join("  - " + q(e) for e in entries)
new_raw = head + "\n" + emitted + "\n"

# validate
doc = yaml.safe_load(new_raw)
assert isinstance(doc["recent_events"], list)
assert len(doc["recent_events"]) == len(entries)
assert all(isinstance(x, str) for x in doc["recent_events"])
mine = [x for x in doc["recent_events"] if "WORK-ORDER steps 1-3 complete/verified" in x]
print("my 02:55 entry present:", bool(mine))
print("top entry:", doc["recent_events"][0][:70])

with open(P, "w", encoding="utf-8") as f:
    f.write(new_raw)
print("WROTE clean file; YAML valid")
