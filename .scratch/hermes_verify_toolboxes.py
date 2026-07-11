#!/usr/bin/env python
# AD-HOC VERIFICATION (not a test suite) of PlugBoot toolboxes metadata edits.
import os, yaml, sys, tempfile

ROOT = r"C:/Users/BAB AL SAFA/Desktop/plugboot"
TB = os.path.join(ROOT, "_os", "os-toolboxes.yaml")
RT = os.path.join(ROOT, "_os", "os-runtime.yaml")
BACKUP = os.path.join(ROOT, ".scratch", "os-toolboxes.backup.yaml")

problems = []
checks = 0

# 1) both YAMLs parse
for f in (TB, RT):
    try:
        yaml.safe_load(open(f, encoding="utf-8"))
        checks += 1
    except Exception as e:
        problems.append(f"PARSE FAIL {f}: {e}")
print("check1 YAML parse:", "OK" if checks == 2 else "FAIL")

# 2) 47 skills all have when_to_use/triggers/inputs/outputs non-empty
def is_empty(v):
    if v is None:
        return True
    if isinstance(v, (list, dict, str)) and len(v) == 0:
        return True
    if isinstance(v, str) and v.strip() in ("", "list"):
        return True
    if isinstance(v, list) and all(isinstance(x, str) and x.strip() in ("", "list") for x in v):
        return True
    return False

d = yaml.safe_load(open(TB, encoding="utf-8"))
skills = []
def walk(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == "skills" and isinstance(v, dict):
                for sk, sv in v.items():
                    if isinstance(sv, dict) and ("role" in sv or "maturity" in sv):
                        skills.append((sk, sv))
            walk(v)
walk(d["toolboxes"])
missing = [(n, [f for f in ("when_to_use", "triggers", "inputs", "outputs") if is_empty(sv.get(f))]) for n, sv in skills]
checks += 1
print(f"check2 skills total={len(skills)} missing_any_field={len(missing)} ->", "OK" if not missing else f"FAIL {missing}")

# 3) maturity upgraded away from stub where disk says functional+ (sample 3 known)
sample = {"analyze-context": "functional", "refactoring": "functional", "pyragify": "hardened"}
bad = []
for sk, exp in sample.items():
    cur = next((sv.get("maturity") for n, sv in skills if n == sk), None)
    if cur != exp:
        bad.append((sk, cur, exp))
checks += 1
print("check3 maturity upgrade sample:", "OK" if not bad else f"WARN {bad}")

# 4) derived 11 stubs now have triggers/inputs/outputs (disk had empties)
derived = ["build-management", "code-navigation", "code-review", "data-scraping", "dependency-repair",
           "error-resolution", "git-automation", "tdd-methodology", "test-coverage", "quality-review", "ui-ux-pro-max"]
miss = [n for n in derived if any(is_empty(next((sv.get(f) for s, sv in skills if s == n), None)) for f in ("triggers", "inputs", "outputs"))]
checks += 1
print(f"check4 derived stubs filled: {len(derived) - len(miss)}/{len(derived)} ->", "OK" if not miss else f"FAIL {miss}")

# 5) backup exists
if os.path.exists(BACKUP):
    checks += 1
    print("check5 backup present:", "OK")
else:
    problems.append("backup missing")

# 6) runtime recent_events has our 14:59 entry at index 0 (agent-owned append)
rte = yaml.safe_load(open(RT, encoding="utf-8")).get("recent_events", [])
checks += 1
ok = bool(rte) and "14:59" in str(rte[0]) and "toolboxes" in str(rte[0])
print("check6 recent_events entry:", "OK" if ok else f"FAIL {str(rte[0])[:60] if rte else None}")

print(f"\nAD-HOC CHECKS RUN={checks}  PROBLEMS={len(problems)}")
for p in problems:
    print("  !", p)
sys.exit(1 if (problems or missing or miss) else 0)
