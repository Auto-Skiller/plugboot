"""Tests for inbox schema vs live os-inbox.yaml structural compatibility.

Verifies that inbox-schema.yaml is consistent and that the LIVE os-inbox.yaml
conforms to the key invariants required BEFORE migrating raw->analysing->gateway.

Run:  python -m pytest tests/test_inbox_schema.py -q
"""
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = ROOT / ".infra" / "schemas" / "inbox-schema.yaml"
LIVE_INBOX = ROOT / "_os" / "os-inbox.yaml"


def load_schema():
    assert SCHEMA.exists(), f"schema missing: {SCHEMA}"
    return yaml.safe_load(SCHEMA.read_text(encoding="utf-8"))


def load_live():
    assert LIVE_INBOX.exists(), f"live inbox missing: {LIVE_INBOX}"
    return yaml.safe_load(LIVE_INBOX.read_text(encoding="utf-8"))


def test_schema_parses():
    s = load_schema()
    for k in ("freshness", "metrics", "raw", "analysing", "rejected", "gateway", "processed"):
        assert k in s, f"schema missing top key: {k}"


def test_rejected_carries_full_analysing_fields():
    s = load_schema()
    keys = set(s["rejected"]["item_name"].keys())
    for f in ("content_hash", "reject_reason", "rejected_at",
              "description", "contains", "when_to_use",
              "files", "suggested_pillar", "suggested_aspect", "suggested_fg"):
        assert f in keys, f"rejected must carry analysing field: {f}"


def test_gateway_is_three_level():
    s = load_schema()
    # pillar -> aspect -> functional_group -> item
    levels = s["gateway"]["<Pillar>"]["<aspect>"]["<functional_group>"]
    assert "item_name" in levels, "gateway must be 3-level (pillar/aspect/fg/item)"


def test_metrics_has_new_counters():
    s = load_schema()
    m = s["metrics"]
    for c in ("analysing_items", "rejected_items", "duplicate_blocked"):
        assert c in m, f"metrics missing counter: {c}"


def test_live_gateway_matches_three_level_schema():
    live = load_live()
    gw = live["gateway"]
    assert isinstance(gw, dict) and gw, "live gateway empty"
    p = next(iter(gw))
    a = next(iter(gw[p]))
    fg = next(iter(gw[p][a]))
    items = gw[p][a][fg]
    assert isinstance(items, dict) and items, "gateway fg has no items"
    sample = next(iter(items.values()))
    for f in ("path", "description", "contains", "when_to_use",
              "extracted_concern", "source_raw_item", "content_hash"):
        assert f in sample, f"gateway item missing field: {f}"


def test_live_top_keys_subset_of_schema():
    live = load_live()
    s = load_schema()
    for k in live:
        assert k in s, f"live key {k} not in schema"


if __name__ == "__main__":
    # minimal runner so it works without pytest installed
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_") and callable(v)]
    passed = failed = 0
    for t in tests:
        try:
            t()
            print(f"PASS {t.__name__}")
            passed += 1
        except AssertionError as e:
            print(f"FAIL {t.__name__}: {e}")
            failed += 1
        except Exception as e:  # noqa
            print(f"ERROR {t.__name__}: {e}")
            failed += 1
    print(f"\n{passed} passed, {failed} failed")
    sys.exit(1 if failed else 0)
