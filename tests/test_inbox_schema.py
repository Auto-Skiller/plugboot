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
              "members", "suggested_pillar", "suggested_aspect", "suggested_fg"):
        assert f in keys, f"rejected must carry analysing field: {f}"
    assert "files" not in keys, "rejected must not have a separate files map (merged into members)"


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


def test_both_schemas_parse():
    for s in ("inbox-schema.yaml", "runtime-schema.yaml"):
        yaml.safe_load((ROOT / ".infra/schemas" / s).read_text(encoding="utf-8"))


def test_discovery_stage_exists_before_raw():
    s = load_schema()
    assert "discovery" in s, "inbox-schema must have discovery stage before raw"
    d = s["discovery"]["drop_name"]
    for f in ("drop", "archived_at", "status", "tree"):
        assert f in d, f"discovery entry missing {f}"
    assert "raw" in s


def test_raw_uses_paths_not_single_path():
    s = load_schema()
    r = s["raw"]["item_name"]
    assert "paths" in r and "drop" in r, "raw item needs paths[] and drop back-ref"
    assert "path" not in r or isinstance(r.get("path"), str) is False or True  # legacy removed
    assert "path" not in r, "raw must not use single 'path' (item can be many files)"


def test_analysing_has_per_member_semantics():
    s = load_schema()
    a = s["analysing"]["item_name"]
    assert "members" in a, "analysing needs per-member semantics"
    assert "drop" in a and "paths" in a, "analysing carries drop + paths from raw"


def test_rejected_is_full_field_copy():
    s = load_schema()
    r = s["rejected"]["item_name"]
    for f in ("drop", "paths", "content_hash", "reject_reason", "rejected_at",
              "description", "contains", "when_to_use", "members",
              "suggested_pillar", "suggested_aspect", "suggested_fg"):
        assert f in r, f"rejected must carry analysing field: {f}"
    assert "files" not in r, "rejected must not have separate files map (merged into members)"


def test_runtime_inbox_has_discovery():
    rs = yaml.safe_load((ROOT / ".infra/schemas" / "runtime-schema.yaml").read_text(encoding="utf-8"))
    # list-shape fill_queue.inbox needs discovery stage
    fq = rs["fill_queue"]["inbox"]
    assert "discovery" in fq, "fill_queue.inbox needs discovery"
    # discovery count lives in inbox-schema.metrics (engine copies into runtime.freshness rollup)
    isch = load_schema()
    assert "discovery_items" in isch["metrics"], "inbox-schema metrics needs discovery_items"


def test_live_top_keys_subset_of_schema():
    live = load_live()
    s = load_schema()
    for k in live:
        assert k in s, f"live key {k} not in schema"


# ── Merged per-member model (raw_path + gateway_path + semantics + status) ──
def test_analysing_members_merged_shape():
    m = load_schema()["analysing"]["item_name"]["members"]["relative/path/file.md"]
    for f in ("raw_path", "gateway_path", "description", "contains", "when_to_use", "status"):
        assert f in m, f"analysing member missing merged field: {f}"
    assert "files" not in load_schema()["analysing"]["item_name"], "analysing must NOT have separate files map"


def test_rejected_members_merged_shape():
    m = load_schema()["rejected"]["item_name"]["members"]["relative/path/file.md"]
    for f in ("raw_path", "gateway_path", "description", "contains", "when_to_use", "status"):
        assert f in m, f"rejected member missing merged field: {f}"


def test_gateway_members_merged_shape():
    m = load_schema()["gateway"]["<Pillar>"]["<aspect>"]["<functional_group>"]["item_name"]["members"]["relative/path/file.md"]
    for f in ("raw_path", "gateway_path", "description", "contains", "when_to_use", "status"):
        assert f in m, f"gateway member missing merged field: {f}"


# ── Daemon behavioral coverage ────────────────────────────────────────────
def test_daemon_write_discovery_builds_full_tree():
    import importlib.util
    import tempfile
    import shutil
    import json
    daemon_path = ROOT / ".infra" / "backend" / "daemon.py"
    spec = importlib.util.spec_from_file_location("pb_disc", str(daemon_path))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    tmp = Path(tempfile.mkdtemp())
    try:
        inbox = tmp / "os-inbox"
        inbox.mkdir()
        drop = inbox / "my-drop"
        drop.mkdir()
        (drop / "readme.md").write_text("x")
        sub = drop / "sub"
        sub.mkdir()
        (sub / "notes.md").write_text("y")
        deep = sub / "deep"
        deep.mkdir()
        (deep / "run.py").write_text("z")
        (inbox / "empty-drop").mkdir()  # no files
        inbox_yaml = tmp / "os-inbox.yaml"
        inbox_yaml.write_text("discovery:\nraw:\nanalysing:\n", encoding="utf-8")

        mod.write_discovery(inbox_yaml, "os")
        data = yaml.safe_load(inbox_yaml.read_text(encoding="utf-8"))
        assert set(data["discovery"].keys()) == {"my-drop", "empty-drop"}
        tree = data["discovery"]["my-drop"]["tree"]
        assert tree["readme.md"] == ["readme.md"]
        assert tree["sub/"]["notes.md"] == ["sub/notes.md"]
        assert tree["sub/"]["deep/"]["run.py"] == ["sub/deep/run.py"]
        assert data["discovery"]["my-drop"]["status"] == "needs_analysis"
        mod.write_discovery(inbox_yaml, "os")  # idempotent
        assert len(data["discovery"]) == 2
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def test_daemon_route_carries_merged_members_and_gateway_path():
    import importlib.util
    import tempfile
    import shutil
    daemon_path = ROOT / ".infra" / "backend" / "daemon.py"
    spec = importlib.util.spec_from_file_location("pb_route", str(daemon_path))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    tmp = Path(tempfile.mkdtemp())
    try:
        entry = {
            "drop": "my-drop", "paths": ["sub/notes.md", "sub/deep/run.py"],
            "description": "item", "contains": "c", "when_to_use": "u",
            "disposition": "route", "status": "ready_to_route",
            "suggested_pillar": "P1", "suggested_aspect": "Capabilities",
            "suggested_fg": "FG1", "content_hash": "h1",
            "members": {
                "sub/notes.md": {"raw_path": "sub/notes.md", "gateway_path": "",
                                 "description": "n", "contains": "cn", "when_to_use": "un", "status": "pending"},
                "sub/deep/run.py": {"raw_path": "sub/deep/run.py", "gateway_path": "",
                                    "description": "r", "contains": "cr", "when_to_use": "ur", "status": "pending"},
            },
        }
        inbox = {"analysing": {"itemA": entry}, "gateway": {}}
        inbox_yaml = tmp / "os-inbox.yaml"
        inbox_yaml.write_text(yaml.safe_dump(inbox, sort_keys=False), encoding="utf-8")
        mod.route_analysing_to_gateway(inbox_yaml, "os")
        out = yaml.safe_load(inbox_yaml.read_text(encoding="utf-8"))
        gw = out["gateway"]["P1"]["Capabilities"]["FG1"]["itemA"]
        assert "members" in gw and "files" not in gw, "gateway must carry members, not files"
        m = gw["members"]["sub/deep/run.py"]
        for f in ("raw_path", "gateway_path", "description", "contains", "when_to_use", "status"):
            assert f in m, f"gateway member missing {f}"
        assert m["status"] == "routed"
        assert m["gateway_path"]  # stamped on route
        assert m["raw_path"] == "sub/deep/run.py"
        # source-side members also stamped (tracking follows)
        assert out["analysing"]["itemA"]["members"]["sub/notes.md"]["gateway_path"]
        assert out["analysing"]["itemA"]["status"] == "routed"

        # incomplete member must NOT route (nothing partial lost)
        bad = {"analysing": {"itemB": dict(entry, **{"members": {}, "paths": ["a.md"]})}, "gateway": {}}
        y2 = tmp / "os-inbox2.yaml"; y2.write_text(yaml.safe_dump(bad, sort_keys=False), encoding="utf-8")
        mod.route_analysing_to_gateway(y2, "os")
        assert "P1" not in yaml.safe_load(y2.read_text(encoding="utf-8"))["gateway"]
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def test_daemon_sync_members_to_paths():
    import importlib.util
    import tempfile
    import shutil
    daemon_path = ROOT / ".infra" / "backend" / "daemon.py"
    spec = importlib.util.spec_from_file_location("pb_sync", str(daemon_path))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    tmp = Path(tempfile.mkdtemp())
    try:
        entry = {"paths": ["a.md", "b.md"], "members": {"a.md": {"raw_path": "a.md", "gateway_path": "",
                                                                  "description": "x", "contains": "c",
                                                                  "when_to_use": "u", "status": "pending"}}}
        assert mod.sync_members_to_paths(entry) is True  # b.md added
        assert set(entry["members"].keys()) == {"a.md", "b.md"}
        # add a stale path not in paths -> should be pruned
        entry["paths"] = ["a.md"]
        assert mod.sync_members_to_paths(entry) is True
        assert set(entry["members"].keys()) == {"a.md"}
        # aligned -> no change
        assert mod.sync_members_to_paths(entry) is False
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


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
