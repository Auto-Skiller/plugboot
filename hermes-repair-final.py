import re, yaml, os

P = "_os/os-runtime.yaml"
# atomic-ish: do everything in one process, single write at the end
with open(P, encoding="utf-8", newline="") as f:
    raw = f.read()

marker = "recent_events:"
mi = raw.index(marker)
head = raw[: mi + len(marker)]
block = raw[mi + len(marker):]

entries = []
cur = None
for ln in block.split("\n"):
    m = re.match(r"^( {0,4})- (.*)$", ln)
    if m:
        if cur is not None:
            entries.append(cur)
        cur = m.group(2).strip()
    elif cur is not None and ln.strip() != "":
        cur += " " + ln.strip()
if cur is not None:
    entries.append(cur)

def clean(s):
    s = s.strip()
    # strip stray surrounding single/double quotes a sibling may have added
    while len(s) >= 2 and s[0] == "'" and s[-1] == "'":
        s = s[1:-1]
    while len(s) >= 2 and s[0] == '"' and s[-1] == '"':
        s = s[1:-1]
    return s.strip()

def q(s):
    return "'" + s.replace("'", "''") + "'"

entries = [clean(e) for e in entries if clean(e)]
emitted = "\n".join("  - " + q(e) for e in entries)
new_raw = head + "\n" + emitted + "\n"

# validate before writing
doc = yaml.safe_load(new_raw)
assert isinstance(doc["recent_events"], list) and len(doc["recent_events"]) == len(entries)
assert all(isinstance(x, str) for x in doc["recent_events"])
print("REPAIR OK: entries=%d, valid YAML" % len(entries))
print("top:", doc["recent_events"][0][:68])

with open(P, "w", encoding="utf-8", newline="\n") as f:
    f.write(new_raw)
print("WROTE clean file")
