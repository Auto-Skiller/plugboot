import re, io

P = "_os/os-runtime.yaml"

with open(P, encoding="utf-8") as f:
    raw = f.read()

# Split into the recent_events section and the rest.
marker = "recent_events:"
mi = raw.index(marker)
head = raw[:mi + len(marker)]
tail_start = mi + len(marker)
# tail begins right after "recent_events:\n"
rest_after = raw[tail_start:]
# The recent_events block is everything up to the next top-level key
# (a line starting at column 0 that is NOT part of recent_events).
# Simpler: recent_events is the last top-level key, so it runs to EOF.
block = rest_after

# Parse recent_events entries: each entry starts with "  - " at indent 2.
# Continuation lines are indented >2 and don't start a new "- " item.
entries = []
lines = block.split("\n")
cur = None
for ln in lines:
    if re.match(r"^  - ", ln):
        if cur is not None:
            entries.append(cur)
        # strip leading "  - "
        cur = ln[4:]
    elif ln.strip() == "" and cur is None:
        continue
    elif cur is not None:
        # continuation: strip leading indent, append with space
        cur += " " + ln.strip()
    # lines before first '- ' (blank) ignored
if cur is not None:
    entries.append(cur)

print("parsed entries:", len(entries))
for e in entries[:3]:
    print("  *", e[:60])

# Re-emit each entry as a properly single-quoted YAML scalar with '' escaping.
def yaml_quote(s):
    s = s.strip()
    return "'" + s.replace("'", "''") + "'"

emitted = "\n".join("  - " + yaml_quote(e) for e in entries)

new_raw = head + "\n" + emitted + "\n"

# Now validate by round-trip through a minimal YAML check (avoid full yaml import if flaky)
try:
    import yaml
    doc = yaml.safe_load(new_raw)
    assert doc is not None
    re_list = doc["recent_events"]
    assert isinstance(re_list, list) and len(re_list) == len(entries)
    for x in re_list:
        assert isinstance(x, str)
    print("YAML ROUND-TRIP OK; count=", len(re_list))
    # confirm my entry present
    mine = [x for x in re_list if "WORK-ORDER steps 1-3 complete/verified" in x]
    print("my 02:55 entry present:", bool(mine))
except Exception as ex:
    print("YAML VALIDATION ERROR:", ex)
    raise

with open(P, "w", encoding="utf-8") as f:
    f.write(new_raw)
print("WROTE repaired file")
