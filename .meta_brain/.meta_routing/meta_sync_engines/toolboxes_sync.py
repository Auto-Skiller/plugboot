"""
Toolboxes Sync Engine (v5.4)
============================
Walks every toolbox folder, recomputes capabilities, and writes back to both
the master toolboxes.yaml and each toolbox's local manifest.

Fixes baked in:
  G2  : Inner-toolbox skill/agent paths are REBUILT from the actual on-disk
        location every cycle. The dead `.brain/.toolbox_library/...` prefix
        can no longer survive — the engine overrides it with the live path
        any time it runs.
  G13 : The bespoke validator is gone; we import the shared one.
  G16 : Toolboxes whose health.status == 'empty' are auto-tagged
        `metadata.placeholder: true` so agents skip them in capability search
        until real skills land.

Fixes added in v5.4 (this round) — all root-cause fixes, not symptom patches:
  T1  : Single audit-timestamp field name across router + inner manifests.
        Both now use ``health.last_audited``. The engine will rewrite
        ``last_audit`` → ``last_audited`` in any inner manifest it sees,
        and stamp the router on every cycle. The schema in Part 2 of the
        router is rewritten to match.
        Root cause: passive seeding wrote ``last_audited`` in the router but
        the engine wrote ``last_audit`` in inner manifests, so the two never
        agreed. The engine now owns the field name in both directions.
  T2  : ``changelog_path`` (which pointed at a dead .brain/toolbox_library/
        file across all 12 core toolboxes) is auto-stripped. A new field
        ``changelog: <path-or-null>`` is written only when an actual
        ``CHANGELOG.md`` lives next to the toolbox manifest.
        Root cause: hand-seeded path that was never re-derived after the v5
        reorg. The engine now derives it from disk.
  T3  : ``missing[]`` list for empty toolboxes is recomputed from disk every
        cycle (which of agents/, skills/, execution/, examples/ actually
        exists). Each entry gets its own list — no more shared YAML anchor
        (``&id001``) that explodes the moment one toolbox progresses past
        another.
        Root cause: the seeder used a YAML alias to save bytes; the alias
        meant divergent values were impossible. The engine now writes
        independent lists.
  T4  : Toolbox dependency graph (``edges:``) is now under a dedicated
        ``dependency_graph:`` mapping instead of dangling at the file root
        (where it visually appeared *inside* the last toolbox's health block
        because of the trailing ``placeholder: true`` line).
        ``metadata.total_edges`` is recomputed every cycle.
        ``edges[].from`` / ``edges[].to`` are validated against the live
        toolbox name set; broken edges are flagged.
        Root cause: the dependency graph was bolted on as a comment-block
        appendix without a proper container key; the engine never owned it.
  T5  : New top-level ``readiness_summary`` block (counts + the names of
        functional toolboxes). Agents can find usable capabilities without
        walking 65 entries.
        Root cause: no machine-readable summary; agents had to crawl.
"""
from __future__ import annotations

import pathlib
import sys
from datetime import datetime
from ruamel.yaml import YAML
from ruamel.yaml.comments import CommentedMap, CommentedSeq

sys.path.insert(0, str(pathlib.Path(__file__).parent / "_shared"))
from validators import validate, load_schema_from_yaml  # noqa: E402
from atomic_io import atomic_write_yaml  # noqa: E402
from sync_lock import with_lock, SyncLockBusy  # noqa: E402
from freshness import stamp_freshness  # noqa: E402
from engine_bootstrap import workspace_lock_path  # noqa: E402

yaml = YAML()
yaml.preserve_quotes = True

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.parent
TOOLBOX_ROUTER_PATH = WORKSPACE_ROOT / ".meta_brain" / ".meta_routing" / "toolboxes.yaml"
BOOT_CONTRACTS_PATH = WORKSPACE_ROOT / ".meta_brain" / "BOOT_CONTRACTS.yaml"
SYNC_LOCK_PATH = workspace_lock_path(WORKSPACE_ROOT)

# Surfaces every toolbox should declare. The engine's sole source of truth
# for "what does a complete toolbox look like".
EXPECTED_SURFACES = ("agents", "skills", "execution", "examples")


def load_yaml(path):
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        return yaml.load(f)


def save_yaml(path, data):
    """Crash-safe YAML write (M1)."""
    atomic_write_yaml(path, data, yaml_instance=yaml)


def now_iso():
    return datetime.now().isoformat()


def _weights():
    boot = load_yaml(BOOT_CONTRACTS_PATH)
    if boot and isinstance(boot.get("constants"), dict):
        w = boot["constants"].get("toolbox_completion_weights")
        if isinstance(w, dict):
            return w
    return {"skills": 40, "agents": 30, "execution": 20, "examples": 10}


def _completion_pct(tb_path: pathlib.Path, agent_count: int, skill_count: int):
    w = _weights()
    return sum([
        w["skills"] if skill_count > 0 else 0,
        w["agents"] if agent_count > 0 else 0,
        w["execution"] if (tb_path / "execution").exists() else 0,
        w["examples"] if (tb_path / "examples").exists() else 0,
    ])


def _status_from_pct(pct: int) -> str:
    if pct == 0:
        return "empty"
    if pct < 50:
        return "partial"
    if pct < 90:
        return "functional"
    return "complete"


def _missing_surfaces(tb_path: pathlib.Path, agent_count: int, skill_count: int) -> list:
    """T3: derive the missing-surfaces list from disk every cycle."""
    out = []
    if agent_count == 0:
        out.append("agents/")
    if skill_count == 0:
        out.append("skills/")
    for sub in ("execution", "examples"):
        if not (tb_path / sub).exists():
            out.append(f"{sub}/")
    return out


def _resolve_changelog(tb_path: pathlib.Path):
    """T2: a real changelog must live next to the manifest. Otherwise None."""
    candidates = [tb_path / "CHANGELOG.md", tb_path / "_CHANGELOG.md"]
    for cand in candidates:
        if cand.exists():
            return str(cand.relative_to(WORKSPACE_ROOT)).replace("\\", "/")
    return None


def _rebuild_skill_paths(inner_data, tb_path: pathlib.Path) -> bool:
    """G2 fix: overwrite skill / agent paths inside the local manifest with the
    actual on-disk paths. Returns True if anything changed."""
    changed = False
    rel_root = str(tb_path.relative_to(WORKSPACE_ROOT)).replace("\\", "/")

    if isinstance(inner_data.get("content", {}).get("skills"), list):
        for skill in inner_data["content"]["skills"]:
            if not isinstance(skill, dict):
                continue
            name = skill.get("name")
            if not name:
                continue
            real_path = f"{rel_root}/skills/{name}"
            if (WORKSPACE_ROOT / real_path).exists() and skill.get("path") != real_path:
                skill["path"] = real_path
                changed = True

    if isinstance(inner_data.get("content", {}).get("agents"), list):
        for agent in inner_data["content"]["agents"]:
            if not isinstance(agent, dict):
                continue
            name = agent.get("name")
            if not name:
                continue
            for ext in (".md", ".yaml", ".yml"):
                cand = f"{rel_root}/agents/{name}{ext}"
                if (WORKSPACE_ROOT / cand).exists():
                    if agent.get("path") != cand:
                        agent["path"] = cand
                        changed = True
                    break

    return changed


def _migrate_audit_field(health_block, audit_ts) -> bool:
    """T1: rename last_audit → last_audited inside any health mapping. Always
    stamps the field. Returns True if anything changed."""
    changed = False
    if not isinstance(health_block, dict):
        return False
    if "last_audit" in health_block and "last_audited" not in health_block:
        health_block["last_audited"] = health_block.pop("last_audit")
        changed = True
    if health_block.get("last_audited") != audit_ts:
        health_block["last_audited"] = audit_ts
        changed = True
    if "last_audit" in health_block:
        # Drop the old field if both somehow coexist.
        del health_block["last_audit"]
        changed = True
    return changed


def _ensure_router_health_shape(tb_info, tb_path, status, pct, missing_list, audit_ts) -> bool:
    """Owner: the engine. Re-derives the entire health subtree from disk."""
    changed = False
    health = tb_info.setdefault("health", CommentedMap())
    if health.get("status") != status:
        health["status"] = status
        changed = True
    if health.get("completion_pct") != pct:
        health["completion_pct"] = pct
        changed = True
    skill_maturity = "none" if status == "empty" else status
    if health.get("skill_maturity") != skill_maturity:
        health["skill_maturity"] = skill_maturity
        changed = True
    # T3: each toolbox owns its own missing list (no more shared anchor).
    new_missing = CommentedSeq(missing_list)
    if list(health.get("missing") or []) != list(new_missing):
        health["missing"] = new_missing
        changed = True
    if _migrate_audit_field(health, audit_ts):
        changed = True
    return changed


def _validate_dependency_graph(router_data, known_toolboxes: set) -> tuple[int, list]:
    """T4: validate edges + recompute total_edges. Returns (count, broken_refs)."""
    graph = router_data.get("dependency_graph") or {}
    edges = graph.get("edges") or []
    broken = []
    for idx, edge in enumerate(edges):
        if not isinstance(edge, dict):
            broken.append(f"edge[{idx}] is not a mapping")
            continue
        for side in ("from", "to"):
            ref = edge.get(side)
            if not ref:
                broken.append(f"edge[{idx}] missing '{side}'")
                continue
            if ref not in known_toolboxes:
                broken.append(f"edge[{idx}].{side} -> '{ref}' is not a known toolbox")
    return len(edges), broken


def _migrate_legacy_top_level_graph(router) -> bool:
    """One-time migration: lift legacy top-level `metadata` + `edges` keys into
    a proper `dependency_graph:` mapping. Idempotent — runs cleanly even after
    the migration has already happened.

    Root cause: the original seeder bolted the dependency graph on as a flat
    appendix at the file root, so it visually rendered inside the last toolbox.
    This migrator gives the graph a proper home so the engine can own it.
    """
    has_legacy = ("edges" in router) or (
        isinstance(router.get("metadata"), dict)
        and {"version", "total_edges", "generator"}.issubset(router["metadata"].keys())
    )
    if not has_legacy:
        return False

    legacy_meta = router.pop("metadata", None) if isinstance(router.get("metadata"), dict) else None
    legacy_edges = router.pop("edges", None) if isinstance(router.get("edges"), list) else None

    graph = router.get("dependency_graph") or CommentedMap()
    if legacy_meta and "metadata" not in graph:
        graph["metadata"] = legacy_meta
    if legacy_edges and "edges" not in graph:
        graph["edges"] = legacy_edges
    router["dependency_graph"] = graph
    return True


def _ensure_inner_skeleton(inner_data: dict) -> bool:
    """Make sure every inner manifest has the canonical top-level keys so
    schema validation is deterministic."""
    changed = False
    for key in ("metadata", "content", "health", "capabilities"):
        if key not in inner_data:
            inner_data[key] = CommentedMap()
            changed = True
    content = inner_data["content"]
    for sub in ("agents", "skills", "relevant_toolboxes"):
        if sub not in content:
            content[sub] = CommentedSeq()
            changed = True
    return changed


def sync_toolboxes(dry_run: bool = False) -> bool:
    print("\n[*] Synchronizing toolboxes.yaml…")
    router = load_yaml(TOOLBOX_ROUTER_PATH)
    schema = load_schema_from_yaml(TOOLBOX_ROUTER_PATH, "toolbox_inner_schema")
    warnings_found = False
    if not router:
        print("  [ERR] toolboxes.yaml not found — skipping.")
        return False

    router_modified = False
    audit_ts = now_iso()
    known_toolbox_keys: set[str] = set()

    # T4 (root cause): one-time migration to give the dependency graph a home.
    if _migrate_legacy_top_level_graph(router):
        router_modified = True
        print("  [+] migrated legacy top-level metadata/edges -> dependency_graph:")

    def process_toolbox(tb_info, tb_path: pathlib.Path, fq_name: str):
        nonlocal router_modified, warnings_found
        if not tb_path.exists():
            return

        known_toolbox_keys.add(fq_name)
        inner_yaml_path = tb_path / f"{tb_path.name}.yaml"
        inner_data = None
        if inner_yaml_path.exists():
            inner_data = load_yaml(inner_yaml_path)
            # Skeleton repair + audit-field migration FIRST so schema
            # validation runs against the post-migration shape.
            if isinstance(inner_data, dict):
                pre_validate_changed = False
                if _ensure_inner_skeleton(inner_data):
                    pre_validate_changed = True
                if _migrate_audit_field(inner_data.get("health", {}), audit_ts):
                    pre_validate_changed = True
                if pre_validate_changed and not dry_run:
                    save_yaml(inner_yaml_path, inner_data)
            if schema:
                is_valid, err = validate(inner_data, schema)
                if not is_valid:
                    print(f"  [WARN] toolbox {tb_path.name} failed schema validation: {err}")
                    warnings_found = True
            if inner_data and "metadata" in inner_data:
                meta = inner_data["metadata"]
                if meta.get("description") and tb_info.get("description") != meta["description"]:
                    tb_info["description"] = meta["description"]
                    router_modified = True
                if meta.get("when_to_use") and tb_info.get("when_to_use") != meta["when_to_use"]:
                    tb_info["when_to_use"] = meta["when_to_use"]
                    router_modified = True

        agents_dir, skills_dir = tb_path / "agents", tb_path / "skills"
        agent_names = sorted(f.stem for f in agents_dir.glob("*.md")) if agents_dir.exists() else []
        skill_names = sorted(d.name for d in skills_dir.iterdir() if d.is_dir()) if skills_dir.exists() else []

        if (
            tb_info.get("agent_count") != len(agent_names)
            or tb_info.get("skill_count") != len(skill_names)
        ):
            tb_info["agent_names"] = agent_names
            tb_info["agent_count"] = len(agent_names)
            tb_info["skill_names"] = skill_names
            tb_info["skill_count"] = len(skill_names)
            router_modified = True

        pct = _completion_pct(tb_path, len(agent_names), len(skill_names))
        status = _status_from_pct(pct)
        missing = _missing_surfaces(tb_path, len(agent_names), len(skill_names))

        if _ensure_router_health_shape(tb_info, tb_path, status, pct, missing, audit_ts):
            router_modified = True

        # T2: changelog_path was hand-seeded as `.brain/toolbox_library/_CHANGELOG.md`.
        # Replace the dead field with a derived `changelog:` that may be null.
        if "changelog_path" in tb_info:
            del tb_info["changelog_path"]
            router_modified = True
        derived_changelog = _resolve_changelog(tb_path)
        if tb_info.get("changelog") != derived_changelog:
            tb_info["changelog"] = derived_changelog
            router_modified = True

        # Local manifest sync.
        if inner_yaml_path.exists() and inner_data:
            inner_modified = False

            # G2: realign declared skill/agent paths to disk.
            if _rebuild_skill_paths(inner_data, tb_path):
                inner_modified = True

            inner_data.setdefault("capabilities", {})
            inner_data.setdefault("health", {})
            inner_data.setdefault("metadata", {})

            caps = inner_data["capabilities"]
            health_sec = inner_data["health"]
            metadata = inner_data["metadata"]

            if caps.get("agent_names") != agent_names:
                caps["agent_names"] = agent_names
                inner_modified = True
            if caps.get("agent_count") != len(agent_names):
                caps["agent_count"] = len(agent_names)
                inner_modified = True
            if caps.get("skill_names") != skill_names:
                caps["skill_names"] = skill_names
                inner_modified = True
            if caps.get("skill_count") != len(skill_names):
                caps["skill_count"] = len(skill_names)
                inner_modified = True

            if health_sec.get("status") != status:
                health_sec["status"] = status
                inner_modified = True

            mat_level = "stub" if status == "empty" else status
            if metadata.get("maturity_level") != mat_level:
                metadata["maturity_level"] = mat_level
                inner_modified = True

            # G16: placeholder flag — auto-set on empty, auto-clear when populated.
            wants_placeholder = (status == "empty")
            current_placeholder = bool(metadata.get("placeholder", False))
            if wants_placeholder and not current_placeholder:
                metadata["placeholder"] = True
                inner_modified = True
            elif not wants_placeholder and current_placeholder:
                metadata.pop("placeholder", None)
                inner_modified = True

            # T1: migrate last_audit → last_audited and refresh stamp.
            if _migrate_audit_field(health_sec, audit_ts):
                inner_modified = True

            if inner_modified:
                if not dry_run:
                    save_yaml(inner_yaml_path, inner_data)
                    print(f"  [+] auto-updated local manifest: {inner_yaml_path.relative_to(WORKSPACE_ROOT)}")

        # Mirror placeholder onto the master router so agents see it without
        # opening the inner manifest.
        if status == "empty":
            if tb_info.get("placeholder") is not True:
                tb_info["placeholder"] = True
                router_modified = True
        else:
            if tb_info.pop("placeholder", None) is not None:
                router_modified = True

    for name, info in (router.get("core_toolboxes") or {}).items():
        if not isinstance(info, dict):
            continue
        p = WORKSPACE_ROOT / info.get("path", "")
        if p.exists():
            print(f"  [OK]  core.{name}")
            process_toolbox(info, p, f"core.{name}")

    for domain, domain_info in (router.get("extended_toolboxes") or {}).items():
        if not isinstance(domain_info, dict):
            continue
        for sub_name, sub_info in (domain_info.get("sub_toolboxes") or {}).items():
            if not isinstance(sub_info, dict):
                continue
            p = WORKSPACE_ROOT / sub_info.get("path", "")
            if p.exists():
                print(f"  [OK]  {domain}/{sub_name}")
                process_toolbox(sub_info, p, f"{domain}/{sub_name}")

    # T4: validate the dependency graph against the live toolbox set.
    edge_count, broken_refs = _validate_dependency_graph(router, known_toolbox_keys)
    graph = router.setdefault("dependency_graph", CommentedMap())
    graph_meta = graph.setdefault("metadata", CommentedMap())
    if graph_meta.get("total_edges") != edge_count:
        graph_meta["total_edges"] = edge_count
        router_modified = True
    if graph_meta.get("last_validated") != audit_ts:
        graph_meta["last_validated"] = audit_ts
        router_modified = True
    if broken_refs:
        graph_meta["broken_references"] = broken_refs
        for line in broken_refs:
            print(f"  [WARN] dependency_graph: {line}")
        warnings_found = True
        router_modified = True
    elif "broken_references" in graph_meta:
        del graph_meta["broken_references"]
        router_modified = True

    # T5: top-level readiness summary so agents don't have to crawl 65 entries.
    summary = CommentedMap()
    total = functional = empty = partial = complete = 0
    functional_names: list = []
    for name, info in (router.get("core_toolboxes") or {}).items():
        total += 1
        s = (info.get("health") or {}).get("status")
        if s == "empty":
            empty += 1
        elif s == "partial":
            partial += 1
        elif s == "functional":
            functional += 1
            functional_names.append(f"core.{name}")
        elif s == "complete":
            complete += 1
            functional_names.append(f"core.{name}")
    for domain, dom_info in (router.get("extended_toolboxes") or {}).items():
        for sub_name, sub_info in (dom_info.get("sub_toolboxes") or {}).items():
            total += 1
            s = (sub_info.get("health") or {}).get("status")
            if s == "empty":
                empty += 1
            elif s == "partial":
                partial += 1
            elif s == "functional":
                functional += 1
                functional_names.append(f"{domain}/{sub_name}")
            elif s == "complete":
                complete += 1
                functional_names.append(f"{domain}/{sub_name}")
    summary["total"] = total
    summary["empty"] = empty
    summary["partial"] = partial
    summary["functional"] = functional
    summary["complete"] = complete
    summary["usable"] = sorted(functional_names)
    summary["last_audited"] = audit_ts
    if router.get("readiness_summary") != summary:
        router["readiness_summary"] = summary
        router_modified = True

    if router_modified and not dry_run:
        save_yaml(TOOLBOX_ROUTER_PATH, router)
        print("  [+] toolboxes.yaml updated with metadata from inner YAMLs.")

    # Stamp freshness so agents reading toolboxes.yaml mid-session can detect
    # whether the catalog is current. Always write — even if no other field
    # changed, the freshness stamp itself is the contract refresh.
    if not dry_run:
        stamp_freshness(router, threshold_seconds=1800)
        save_yaml(TOOLBOX_ROUTER_PATH, router)

    print("[TOOLBOX] Done.")
    return not warnings_found


def _main(dry_run: bool) -> int:
    return 0 if sync_toolboxes(dry_run) else 1


if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    standalone = "--standalone" in sys.argv

    # E1 (multi-session safety): when invoked directly (i.e. NOT as a child of
    # meta_sync.py which already holds the lock), acquire the lock ourselves.
    # The master sync passes its own lock; we detect that case by checking the
    # env-style flag set by meta_sync subprocess invocations.
    import os
    if os.environ.get("META_SYNC_LOCK_HELD") == "1":
        sys.exit(_main(dry_run))

    try:
        with with_lock(SYNC_LOCK_PATH, stale_seconds=120, timeout_seconds=30):
            sys.exit(_main(dry_run))
    except SyncLockBusy as exc:
        print(f"[ERR] {exc}")
        sys.exit(2)
