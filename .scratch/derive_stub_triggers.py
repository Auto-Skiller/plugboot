#!/usr/bin/env python
# Derive triggers/inputs/outputs for the 11 stubs that lack them even on disk,
# using their real description as the basis. Fill-only; preserves formatting.
import os
from ruamel.yaml import YAML

ROOT = r"C:/Users/BAB AL SAFA/Desktop/plugboot"
TB_YAML = os.path.join(ROOT, "_os", "os-toolboxes.yaml")

# Derived (non-fabricated: grounded in each skill's real description/name)
DERIVED = {
    "build-management": dict(
        triggers=["build", "gradle", "kmp", "android", "compile"],
        inputs=["project path", "build error log", "target flavor"],
        outputs=["fixed build config", "green build report"]),
    "code-navigation": dict(
        triggers=["navigate", "trace", "map architecture", "understand code"],
        inputs=["codebase path", "feature or entry point to trace"],
        outputs=["execution path map", "dependency map", "architecture notes"]),
    "code-review": dict(
        triggers=["review", "pull request", "PR", "quality check"],
        inputs=["diff or PR", "review standards"],
        outputs=["review comments", "risk flags", "approval/reject verdict"]),
    "data-scraping": dict(
        triggers=["scrape", "collect data", "monitor source", "crawl"],
        inputs=["target source URL", "schedule", "storage destination"],
        outputs=["collected dataset", "enrichment report", "automation workflow"]),
    "dependency-repair": dict(
        triggers=["dependency", "broken deps", "repair lockfile", "install fail"],
        inputs=["dependency manifest", "error log"],
        outputs=["resolved manifest", "lockfile", "verification report"]),
    "error-resolution": dict(
        triggers=["build error", "type error", "fix error", "compile fail"],
        inputs=["error log", "source diff context"],
        outputs=["minimal fix diff", "green build confirmation"]),
    "git-automation": dict(
        triggers=["git", "PR automation", "branch workflow", "release"],
        inputs=["repo", "PR/branch spec", "review agents config"],
        outputs=["automated PR review", "merged branch", "release notes"]),
    "tdd-methodology": dict(
        triggers=["tdd", "test first", "red green refactor", "unit drive"],
        inputs=["feature spec", "test framework"],
        outputs=["test list", "tdd plan", "passing implementation"]),
    "test-coverage": dict(
        triggers=["coverage", "measure tests", "gap report"],
        inputs=["test suite", "source paths", "threshold"],
        outputs=["coverage report", "gap list", "improvement plan"]),
    "quality-review": dict(
        triggers=["design quality", "typography review", "audit ui"],
        inputs=["design or page URL", "brand guidelines"],
        outputs=["quality score", "typography notes", "fix list"]),
    "ui-ux-pro-max": dict(
        triggers=["ui", "ux", "design", "frontend", "component", "style"],
        inputs=["product type", "stack", "design goal", "existing code"],
        outputs=["design plan", "component code", "style tokens", "review"]),
}

yaml = YAML()
yaml.preserve_quotes = True
with open(TB_YAML) as f:
    data = yaml.load(f)

applied = []
def walk(o):
    if not isinstance(o, dict):
        return
    for k, v in o.items():
        if isinstance(v, dict):
            if "skills" in v and isinstance(v["skills"], dict):
                for sk, sv in v["skills"].items():
                    if sk in DERIVED and isinstance(sv, dict):
                        d = DERIVED[sk]
                        for fld in ("triggers", "inputs", "outputs"):
                            cur = sv.get(fld)
                            empty = (cur is None) or (isinstance(cur, list) and len(cur) == 0)
                            if empty:
                                sv[fld] = d[fld]
                                applied.append((sk, fld))
            walk(v)

walk(data.get("toolboxes", {}))
with open(TB_YAML, "w") as f:
    yaml.dump(data, f)

print("DERIVED APPLIED:", len(applied))
for a in applied:
    print("  ", a)
