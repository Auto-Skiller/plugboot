import yaml
P = "_os/os-runtime.yaml"

with open(P, encoding="utf-8") as f:
    doc = yaml.safe_load(f)   # parse current (may fail if broken)

# If parse failed we cannot proceed; but we attempt. We'll reload from a repaired line-set:
