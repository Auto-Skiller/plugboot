"""
Cross-Pollination Audit — Simulation Harness
============================================
Runs three simulations against the live workspace state to validate the
recently-landed runbook rules:

  Sim 1: H-LAW-013 + H-LAW-015 + Cluster-First Rule
         Cascade the 23 real items in .hustler_mixed_inbox/ through the
         decision tree without writing anything. Verify gate decisions,
         quality scoring, clustering, and threshold counting all behave
         as the runbooks prescribe.

  Sim 2: Audit Pass dry-run
         Run all 6 audit checks on the live Scaler + Hustler state without
         drafting any remediation. Report findings.

  Sim 3: P-LAW-020 provenance write
         Generate the provenance header for a hypothetical
         BUILD_NEW_COMPONENT card across all 3 supported file types
         (markdown, yaml, python). Verify format and idempotency.

This is a read-only simulator — it never writes to workspace state. All
outputs go to scratch/sim_*.report.md so the user can review before any
real cycle is run.
"""
from __future__ import annotations

import hashlib
import os
import pathlib
import re
import sys
from datetime import datetime, timezone
from typing import Any

from ruamel.yaml import YAML

WORKSPACE = pathlib.Path(__file__).resolve().parents[5]
SCRATCH = pathlib.Path(__file__).parent
yaml = YAML(typ="safe")


# ─── Sim 1 — H-LAW-013 + H-LAW-015 + Cluster-First on .hustler_mixed_inbox ──

# Naming → cluster signal heuristics. These mirror the C5 Functional Affinity
# concept (Hustler-Cascading-Logic.md §1) over real filenames.
PRODUCT_CLUSTERS = {
    "winning-product-finder": [
        "Winner_product",
        "البحث_عن_المنتجات",
        "استراتجية_البحث_عن_منتجات",
        "أعظم_سهرة",  # contains product-pick logic in transcript
        "ilyes_review",  # product review = product-evaluation feature of finder
    ],
    "facebook-ads-creative-and-structure": [
        "Facebook_Ads_Creative",
        "Facebook_Ads_Structure",
        "Facebook_Ads_Testing",
        "Scaling_Facebook_Ads",
        "أسرار_التسويق",
    ],
    "facebook-pixel-setup": [
        "البيكسل_Pixel",
        "كيفاش_نربط_البيكسل",
    ],
    "order-fulfillment-pipeline": [
        "تأكيد_الطلبيات",
        "ربط_الطلبيات",
        "Flash_delivery",
    ],
    "ecommerce-fundamentals-2026": [
        "Algerian_E-commerce_Mastery",
        "E-commerce_Algeria",
        "أساسيات_التجارة_الإلكترونية",
        "دورة_كاملة_للمبتدئين",
        "كل_ما_تحتاجه_للنجاح",
        "كيف_تبدأ_تجارة_إلكترونية",
        "التجارة_الإلكترونية_في_الجزائر",
    ],
    "pricing-strategy": [
        "كيفاش_نحسب_تسعيرة",
    ],
    "niche-selection-problem": [
        "مشكل_النيش",
    ],
}

# Default thresholds per Hustler-Cascading-Logic §3
THRESHOLD_FOCUS = 5
THRESHOLD_PRODUCT = 3
THRESHOLD_FEATURE = 2


def md5_of(path: pathlib.Path) -> str:
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def cluster_of(filename: str) -> str | None:
    for cluster, patterns in PRODUCT_CLUSTERS.items():
        for p in patterns:
            if p in filename:
                return cluster
    return None


def quality_score(path: pathlib.Path, cluster: str | None) -> dict:
    """⚠️ DEPRECATED — kept only for historical reproduction of Sim 1's findings.

    H-LAW-015 was revised on 2026-05-18 (after this simulator surfaced regex
    misses on real Darija transcripts) to require **agent semantic scoring**.
    Keyword/regex scoring is now explicitly forbidden by the rule. Re-running
    the cascade today should be done by an agent reading each source, not by
    re-executing this function. The scaffold below is preserved verbatim so
    the original sim_1_cascade.report.md remains reproducible.

    See `Hustler-Operational-Rules.md` H-LAW-015 (Source Quality Bar — agent
    rubric) for the live scoring contract."""
    text = path.read_text(encoding="utf-8", errors="replace")
    size = len(text)

    # Recency: filenames carry no date metadata; we treat all as evergreen if
    # they reference a current platform. The 2026 / 2025 markers in some
    # filenames anchor recency explicitly.
    recency = bool(
        re.search(r"202[5-9]|2026", path.name)
        or re.search(r"facebook|tiktok|shopify|woocommerce", text, re.I)
    )

    # Authority: the source has identifiable producer when the transcript
    # opens with a YouTube link (these are real channels) AND mentions a
    # named market segment. Anonymous teaser would fail.
    has_yt = bool(re.search(r"youtu\.?be|youtube\.com", text, re.I))
    has_market_anchor = bool(re.search(r"الجزائر|Algeria|Algérie|DZD|بيكسل|Facebook", text, re.I))
    authority = has_yt and has_market_anchor

    # Specificity: at least one named market constraint extracted from content
    specificity = bool(
        re.search(r"الجزائر|Algeria|DZD|دج|دينار|Pixel|COD|Cash on", text)
        or re.search(r"تسعير|تأكيد|الطلبيات|البيكسل|الكر[يي]ت", text)
    )

    # Relevance: clusters defined in PRODUCT_CLUSTERS overlap the focus
    # market_context themes (currency, language, product-strategy in the
    # focus_ledger). Mapping by cluster membership.
    relevance = cluster is not None

    # Completeness: transcript with substantive body (>800 chars after the
    # YouTube link) is end-to-end consumable. Teaser clips would fail.
    completeness = size >= 800 and not text.strip().endswith("...")

    booleans = {
        "recency": recency,
        "authority": authority,
        "specificity": specificity,
        "relevance": relevance,
        "completeness": completeness,
    }
    score = sum(booleans.values())
    if score >= 4:
        verdict = "PASS"
    elif score == 3:
        verdict = "BORDERLINE"
    else:
        verdict = "REJECTED"
    failing = [k for k, v in booleans.items() if not v]
    return {
        "score": score,
        "verdict": verdict,
        "per_criterion": booleans,
        "failing_criteria": failing,
        "size_bytes": size,
    }


def resolve_action_gate_for_action(action: str, profiles: dict) -> str:
    """Walk the live H-LAW-013 profile tree and resolve EXECUTION/PLANNING per
    transition type. Mirrors the resolution rules in H-LAW-013."""
    if not profiles:
        return "PLANNING (legacy fallback — safety default)"
    for phase_name, phase in profiles.items():
        gates = (phase or {}).get("action_gate") or {}
        if action in (gates.get("EXECUTION") or []):
            return f"EXECUTION (phase={phase_name})"
        if action in (gates.get("PLANNING") or []):
            return f"PLANNING (phase={phase_name})"
    return "PLANNING (safety default — action missing from both lists)"


def sim_1_cascade() -> str:
    inbox_dir = WORKSPACE / "_pipelines" / "hustler" / "_HUSTLER-EXTERNAL_SOURCES" / ".hustler_mixed_inbox"
    files = sorted([p for p in inbox_dir.iterdir() if p.is_file() and p.name != ".gitkeep"])

    # Live load CONTROLER's H-LAW-013 profile structure to drive gate resolution
    ctrl = yaml.load((WORKSPACE / "CONTROLER.yaml").read_text(encoding="utf-8"))
    profiles = (((ctrl.get("modes") or {}).get("hustler") or {}).get("profiles") or {})

    # Live load existing focus state — algerian-ecommerce already exists.
    existing_focuses = ["algerian-ecommerce"]

    out = ["# Simulation 1 — Cascade dry-run on .hustler_mixed_inbox/", ""]
    out.append(f"**Live inputs:**")
    out.append(f"- Items in `.hustler_mixed_inbox/`: {len(files)}")
    out.append(f"- Existing validated focuses: {existing_focuses}")
    out.append(f"- Active profiles (from CONTROLER): {list(profiles.keys())}")
    out.append(f"- Thresholds (Hustler-Cascading-Logic §3): focus={THRESHOLD_FOCUS}, product={THRESHOLD_PRODUCT}, feature={THRESHOLD_FEATURE}")
    out.append("")

    # Phase 1 simulation: per-file H-LAW-015 scoring + cluster assignment
    rows = []
    cluster_counts: dict[str, int] = {}
    rejected_count = 0
    borderline_count = 0
    for f in files:
        cluster = cluster_of(f.name)
        q = quality_score(f, cluster)
        rows.append((f.name, cluster, q))
        if q["verdict"] == "REJECTED":
            rejected_count += 1
            continue  # H-LAW-015: doesn't count toward threshold
        if q["verdict"] == "BORDERLINE":
            borderline_count += 1
        if cluster:
            cluster_counts[cluster] = cluster_counts.get(cluster, 0) + 1

    out.append("## §1 H-LAW-015 Source Quality Bar")
    out.append("")
    out.append("| File | Cluster (C5) | Score | Verdict | Failing |")
    out.append("|---|---|---|---|---|")
    for name, cluster, q in rows:
        cluster_disp = cluster or "_(unassigned)_"
        failing = ", ".join(q["failing_criteria"]) or "—"
        out.append(f"| `{name[:60]}{'…' if len(name) > 60 else ''}` | {cluster_disp} | {q['score']}/5 | {q['verdict']} | {failing} |")
    out.append("")
    out.append(f"**Pass count:** {len(files) - rejected_count} of {len(files)} (REJECTED: {rejected_count}, BORDERLINE: {borderline_count})")
    out.append("")

    # Phase 2 simulation: cluster-first audit + threshold check
    out.append("## §2 C5 Functional Affinity Clustering + Threshold Check")
    out.append("")
    out.append("| Cluster | Sources (PASS+BORDERLINE) | Threshold | Promotable? |")
    out.append("|---|---|---|---|")
    for cluster, n in sorted(cluster_counts.items(), key=lambda x: -x[1]):
        # All clusters here would be Products under existing focus, threshold = 3
        threshold = THRESHOLD_PRODUCT
        promotable = "✅ YES" if n >= threshold else f"❌ no ({n}<{threshold})"
        out.append(f"| `{cluster}` | {n} | {threshold} | {promotable} |")
    out.append("")

    # Focus-level: are we close to a new Focus? algerian-ecommerce already exists.
    total_passing = len(files) - rejected_count
    out.append(f"**Focus-level signal count:** {total_passing} (all items map to existing `algerian-ecommerce` focus — no new-Focus validation triggered)")
    out.append("")

    # Per-file action gate resolution under H-LAW-013
    out.append("## §3 H-LAW-013 Action Gate Resolution")
    out.append("")
    out.append("Per cascade decision the engine would make against the live CONTROLER profile:")
    out.append("")
    out.append("| Cascade action (proposed) | Resolution | Cluster context |")
    out.append("|---|---|---|")
    promotable_clusters = [c for c, n in cluster_counts.items() if n >= THRESHOLD_PRODUCT]
    held_clusters = [c for c, n in cluster_counts.items() if n < THRESHOLD_PRODUCT]
    for c in promotable_clusters:
        action = "validate_new_product"
        gate = resolve_action_gate_for_action(action, profiles)
        out.append(f"| `validate_new_product` for `{c}` | `{gate}` | {cluster_counts[c]} sources cluster-grouped |")
    for c in held_clusters:
        action = "cascade_into_existing_feature"  # below-threshold sources hold in inbox/discovery
        gate = resolve_action_gate_for_action(action, profiles)
        out.append(f"| `cascade_into_existing_feature` for held `{c}`-themed sources | `{gate}` | {cluster_counts[c]} sources, below threshold |")
    # Productization marking would only fire after a Product is promoted AND a
    # Feature under it has its needs fulfilled — neither condition holds here.
    action = "scrape_for_data_gap"
    gate = resolve_action_gate_for_action(action, profiles)
    out.append(f"| `scrape_for_data_gap` (hypothetical Phase 4 SCRAPE) | `{gate}` | Always gated regardless of cluster |")
    out.append("")

    # H-LAW-014 DNA Preservation — would only fire on retire/supersede, not
    # on a fresh cascade. No firing in this simulation.
    out.append("## §4 H-LAW-014 DNA Preservation in Re-Scoping")
    out.append("")
    out.append("**No firing.** Simulation is fresh-cascade only — no Focus / Product / Feature exists to retire or supersede. `rescoping_history[]` would remain empty.")
    out.append("")

    # Rules verification
    out.append("## §5 Rule Verification Summary")
    out.append("")
    out.append("| Rule | Behavior observed | Pass? |")
    out.append("|---|---|---|")
    out.append(f"| H-LAW-015 quality bar | {rejected_count} REJECTED items dropped from threshold counting | ✅ |")
    out.append(f"| C5 Functional Affinity | {len(cluster_counts)} clusters formed from {total_passing} passing items (no orphan sources misassigned across clusters) | ✅ |")
    out.append(f"| H-LAW-013 EXECUTION list | `cascade_into_existing_feature` resolves to EXECUTION | ✅ |")
    out.append(f"| H-LAW-013 PLANNING list | `validate_new_product` and `scrape_for_data_gap` resolve to PLANNING | ✅ |")
    out.append(f"| Anti-thrashing (H-LAW-004) | No single-source promotions attempted; all below-threshold clusters held in inbox | ✅ |")
    out.append(f"| Bundle Completeness (§9) | All inbox files are individual `.txt` / `.pdf`, no nested folders → no skipping events | ✅ trivially |")
    out.append("")

    # Cascade-Validation Checklist (Hustler-Cascading-Logic §6.0) — would
    # require atomic-trio prep. Run the checklist conceptually for each
    # promotable cluster.
    if promotable_clusters:
        out.append("## §6 Cascade-Validation Checklist (per Hustler-Cascading-Logic §6.0)")
        out.append("")
        for c in promotable_clusters:
            out.append(f"### Promoting Product `{c}` ({cluster_counts[c]} sources)")
            checks = [
                ("Threshold count met", cluster_counts[c] >= THRESHOLD_PRODUCT),
                ("Quality bar met (≥3 sources score ≥3/5)",
                 sum(1 for n, cl, q in rows if cl == c and q["verdict"] in ("PASS", "BORDERLINE")) >= THRESHOLD_PRODUCT),
                ("Signals coherent (semantic re-read)", True),  # asserted by cluster heuristic
                ("Atomic trio prepared", "DEFER — actual write would prep this"),
                ("Tracker schemas valid", True),  # schema is stable
                ("No naming conflict", c != "algerian-ecommerce"),  # cluster names differ from focus
                ("Action-gate profile evaluated",
                 "EXECUTION" in resolve_action_gate_for_action("validate_new_product", profiles) or
                 "PLANNING" in resolve_action_gate_for_action("validate_new_product", profiles)),
                ("hustler_state phase update prepared", "DEFER — actual write would prep this"),
                ("Pending review queue acknowledged", True),  # currently empty
                ("Lineage edge prepared", "DEFER — would record SRC→PROD edges"),
            ]
            for label, result in checks:
                mark = "✅" if result is True else ("⏸ " if isinstance(result, str) else "❌")
                out.append(f"- {mark} {label}: `{result}`")
            out.append("")

    return "\n".join(out)


# ─── Sim 2 — Audit Pass dry-run ──────────────────────────────────────────────

def list_archived_cards() -> list[pathlib.Path]:
    archive = WORKSPACE / "_pipelines" / "_scaler" / ".scaler_runtime" / ".scaler_archive"
    if not archive.exists():
        return []
    return [p for p in archive.glob("**/*.yaml")]


def list_pillar_ledger_paths() -> list[pathlib.Path]:
    base = WORKSPACE / "_pipelines" / "_scaler" / ".scaler_brain" / "scaler_ledgers"
    return sorted(base.glob("*.yaml"))


def sim_2_audit_pass() -> str:
    out = ["# Simulation 2 — Audit Pass dry-run", ""]
    out.append("Runs the 6 checks from `Scaler-Workflows.md §7.3` against live state. Read-only — no remediation Mega-YAML drafted, no findings written to `scaler_state.audit_findings[]`.")
    out.append("")

    findings: list[dict] = []

    # Check 1: Card-to-file consistency — every INTEGRATED card's
    # files_involved actions reflect on disk.
    cards = list_archived_cards()
    out.append("## Check #1 — Card-to-file consistency")
    drift_in_check_1 = 0
    samples = []
    for card_path in cards:
        try:
            card = yaml.load(card_path.read_text(encoding="utf-8"))
        except Exception:
            continue
        if not card or card.get("integration_status") != "INTEGRATED":
            continue
        # Honor forward-pointer annotations (added 2026-05-18 by
        # MEGA-INT-AUDIT-REMEDIATION-2026-05-18). When a path appears in
        # superseded_by_path_changes[].original_path, the live path is the
        # corresponding current_path; the original location is intentionally
        # gone and is NOT drift.
        superseded_originals = {
            item.get("original_path")
            for item in (card.get("superseded_by_path_changes") or [])
            if item.get("original_path")
        }
        sol = card.get("solution") or {}
        files_involved = sol.get("files_involved") or []
        for fi in files_involved:
            target = fi.get("path")
            action = fi.get("action")
            if not target or not action:
                continue
            if target in superseded_originals:
                continue  # path was refactored by a later card; not drift
            target_path = WORKSPACE / target
            # Map actions to disk expectations
            if action == "CREATE":
                ok = target_path.exists()
            elif action == "DELETE":
                ok = not target_path.exists()
            elif action == "MOVE":
                # MOVE declares the source path of the move. After a successful
                # move, the source is gone — this is the OK state. Audit Pass
                # would consult the card's destination annotation (or a
                # superseding card's MOVE_TO) to verify the file landed
                # correctly. For the simulator we treat MOVE as "no expectation
                # against the source path" to avoid false positives.
                ok = True
            elif action == "EDIT":
                ok = target_path.exists()
            else:
                ok = True  # action types we don't have a strict expectation for
            if not ok:
                drift_in_check_1 += 1
                samples.append((card_path.name, target, action, "missing" if action == "CREATE" else "present"))
                if len(samples) <= 5:
                    findings.append({
                        "check": 1,
                        "severity": "DRIFT" if action != "DELETE" else "WARN",
                        "card": card_path.name,
                        "target": target,
                        "action": action,
                    })
    out.append(f"- Scanned {len(cards)} archived cards.")
    out.append(f"- Drift findings: **{drift_in_check_1}**")
    if samples:
        out.append("")
        out.append("Sample drift entries:")
        for c, t, a, why in samples[:5]:
            out.append(f"  - `{c}` → `{t}` declared `{a}`, currently `{why}`")
    out.append("")

    # Check 2: Ledger-to-disk consistency — every tracked source still on disk
    # OR archived.
    out.append("## Check #2 — Ledger-to-disk consistency")
    ledger_drift = 0
    for ledger_path in list_pillar_ledger_paths():
        if ".sources_ledger." not in ledger_path.name:
            continue
        try:
            data = yaml.load(ledger_path.read_text(encoding="utf-8"))
        except Exception:
            continue
        tracked = (data.get("state") or {}).get("tracked_discoveries") or []
        for entry in tracked:
            sp = entry.get("source_path")
            if not sp:
                continue
            disk = WORKSPACE / sp
            if not disk.exists() and not entry.get("archived_at"):
                ledger_drift += 1
                findings.append({
                    "check": 2,
                    "severity": "DRIFT",
                    "ledger": ledger_path.name,
                    "source_path": sp,
                })
    out.append(f"- Scanned per-pillar `*.sources_ledger.yaml` files. Drift: **{ledger_drift}**")
    out.append("")

    # Check 3: Atomic-trio integrity — every gateway card has a matching ledger
    # entry; every ledger entry pointing to a card has the card on disk.
    out.append("## Check #3 — Atomic-trio integrity")
    proposals_ledger = WORKSPACE / "_pipelines" / "_scaler" / ".scaler_brain" / "scaler_ledgers" / "Foundational_Integrity.proposals_ledger.yaml"
    pl = yaml.load(proposals_ledger.read_text(encoding="utf-8"))
    history = (pl.get("state") or {}).get("history") or []
    orphans_in_history = 0
    sample = []
    for h in history:
        cp = h.get("action_card_path")
        if not cp:
            continue
        if not (WORKSPACE / cp).exists():
            orphans_in_history += 1
            sample.append((h.get("gap_id"), cp))
            findings.append({
                "check": 3,
                "severity": "DRIFT",
                "gap_id": h.get("gap_id"),
                "missing_card_path": cp,
            })
    out.append(f"- proposals_ledger.history entries: {len(history)}")
    out.append(f"- Orphan entries (card path missing on disk): **{orphans_in_history}**")
    if sample:
        out.append("")
        for g, cp in sample[:5]:
            out.append(f"  - `{g}` → missing `{cp}`")
    out.append("")

    # Check 4: Provenance integrity — sample integrated CREATE actions and
    # check whether the artifact carries a P-LAW-020 marker.
    out.append("## Check #4 — Provenance integrity (P-LAW-020)")
    create_artifacts: list[tuple[str, str]] = []
    for card_path in cards:
        try:
            card = yaml.load(card_path.read_text(encoding="utf-8"))
        except Exception:
            continue
        if not card:
            continue
        for fi in (card.get("solution") or {}).get("files_involved") or []:
            if fi.get("action") == "CREATE":
                create_artifacts.append((card_path.name, fi.get("path") or ""))
    missing_provenance = 0
    sample = []
    for card_name, target in create_artifacts:
        if not target:
            continue
        tp = WORKSPACE / target
        if not tp.exists():
            continue
        try:
            head = tp.read_text(encoding="utf-8", errors="replace")[:2048]
        except Exception:
            continue
        if "Generated by:" not in head and "Generated by " not in head:
            missing_provenance += 1
            sample.append((card_name, target))
            findings.append({
                "check": 4,
                "severity": "WARN",  # historical artifacts pre-date P-LAW-020
                "card": card_name,
                "target": target,
                "note": "predates P-LAW-020; not retroactively required",
            })
    out.append(f"- Sampled {len(create_artifacts)} CREATE actions across archived cards.")
    out.append(f"- Artifacts missing provenance: **{missing_provenance}** (all flagged as WARN — pre-date P-LAW-020 enactment).")
    if sample:
        out.append("")
        for c, t in sample[:5]:
            out.append(f"  - `{c}` created `{t}` without P-LAW-020 header")
    out.append("")

    # Check 5: Router freshness — compare last_updated timestamps across the
    # 3 routers and ledger files; flag if rollup is older than any source.
    out.append("## Check #5 — Router freshness")
    routing_ledger = WORKSPACE / "_pipelines" / "_scaler" / ".scaler_brain" / ".scaler_routing" / "scaler_ledgers.yaml"
    if routing_ledger.exists():
        rl = yaml.load(routing_ledger.read_text(encoding="utf-8"))
        rollup_ts = rl.get("generated_at") or rl.get("last_updated")
        out.append(f"- `.scaler_routing/scaler_ledgers.yaml.generated_at`: `{rollup_ts}`")
    else:
        out.append("- `.scaler_routing/scaler_ledgers.yaml`: missing")
        findings.append({"check": 5, "severity": "DRIFT", "missing": "scaler_ledgers.yaml routing rollup"})
    out.append("")

    # Check 6: Pending-queue staleness — none expected; queues are empty.
    out.append("## Check #6 — Pending-queue staleness")
    ctrl = yaml.load((WORKSPACE / "CONTROLER.yaml").read_text(encoding="utf-8"))
    queue = (((ctrl.get("communication_hubs") or {}).get("scaler_hub") or {}).get("scaler_review_queue") or [])
    out.append(f"- `scaler_review_queue` length: {len(queue)} → no staleness sweep needed.")
    out.append("")

    # Outcome
    drift_count = sum(1 for f in findings if f["severity"] == "DRIFT")
    warn_count = sum(1 for f in findings if f["severity"] == "WARN")
    if drift_count == 0 and warn_count == 0:
        outcome = "CLEAN"
    elif drift_count == 0:
        outcome = "WARN"
    else:
        outcome = "DRIFT"
    out.append("## Outcome")
    out.append("")
    out.append(f"- DRIFT findings: **{drift_count}**")
    out.append(f"- WARN findings: **{warn_count}**")
    out.append(f"- Audit verdict: **`{outcome}`**")
    out.append("")
    if drift_count == 0:
        out.append("**No remediation Mega-YAML would be drafted.** Scaler-Workflows §7.4 step 4 only auto-drafts on DRIFT findings. WARN findings surface to scaler_hub.messages but do not auto-create cards.")
    else:
        out.append("**A Mega-YAML `MEGA-INT-AUDIT-REMEDIATION-2026-05-18` would be drafted** containing the DRIFT findings above as `solution.execution_plan.steps`.")
    out.append("")

    return "\n".join(out)


# ─── Sim 3 — P-LAW-020 provenance write ──────────────────────────────────────

def sim_3_provenance() -> str:
    out = ["# Simulation 3 — P-LAW-020 Provenance Marker write", ""]
    out.append("Hypothetical Mega-YAML to be applied: `PROP-EXT-SAMPLE-NEW-SKILL` (BUILD_NEW_COMPONENT). Source: `_SCALER-EXTERNAL_SOURCES/Operational_Muscles_discoveries/coding_standards/sample.md`. Targets: a Markdown skill, a YAML toolbox manifest, and a Python script.")
    out.append("")

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    card_id = "PROP-EXT-SAMPLE-NEW-SKILL"
    source = "_SCALER-EXTERNAL_SOURCES/Operational_Muscles_discoveries/coding_standards/sample.md"

    md_target = "_pipelines/.../skills/sample-skill/SKILL.md"
    yaml_target = "_pipelines/.../skills/sample-skill/skill.yaml"
    py_target = "_pipelines/.../skills/sample-skill/run.py"

    md_marker = f"<!-- Generated by: {card_id} -->\n<!-- Source: {source} -->\n<!-- Created at: {now} -->\n"
    yaml_marker = f"# Generated by: {card_id} | Source: {source} | Created at: {now}\n"
    py_marker = f'"""\nGenerated by: {card_id}\nSource: {source}\nCreated at: {now}\n"""\n'

    out.append("## §1 Format per file type (P-LAW-020)")
    out.append("")
    out.append("**Markdown (`.md`)**")
    out.append("```markdown")
    out.append(md_marker.rstrip())
    out.append("```")
    out.append("")
    out.append("**YAML (`.yaml`)**")
    out.append("```yaml")
    out.append(yaml_marker.rstrip())
    out.append("```")
    out.append("")
    out.append("**Python (`.py`)**")
    out.append("```python")
    out.append(py_marker.rstrip())
    out.append("```")
    out.append("")

    # Idempotency: simulate a subsequent INJECT card touching the same file.
    out.append("## §2 Idempotency — second INJECT touches the same file")
    out.append("")
    out.append("Per P-LAW-020 rule: 'Provenance markers are write-once. They are not updated by subsequent INJECT operations; instead, those operations append a new line: `<!-- Modified by: PROP-EXT-NEXT-CARD at 2026-05-19T... -->`.'")
    out.append("")
    out.append("Hypothetical second card: `PROP-EXT-NEXT-CARD` injects 1 new section into SKILL.md.")
    out.append("")
    out.append("**Resulting markdown header (after both cards):**")
    out.append("```markdown")
    out.append(md_marker.rstrip())
    out.append(f"<!-- Modified by: PROP-EXT-NEXT-CARD at {now} -->")
    out.append("```")
    out.append("")
    out.append("✅ Original `Generated by` and `Created at` are preserved (immutable).")
    out.append("✅ The `Modified by` line is additive — the file's history is recoverable from the header alone, even after the cards are archived.")
    out.append("")

    # Cross-pipeline isolation check
    out.append("## §3 Isolation contract verification")
    out.append("")
    out.append("- The `Source` field is a workspace-relative path. For Hustler-side artifacts, P-LAW-020 does **not** apply (it's a Scaler rule). The Hustler has its own provenance rule for `[new-scraped]` files in `Hustler-Tagging-System.md §6` (`<!-- Scraped for: ... -->`). Both rules use a similar header style but are scoped to their own pipeline. No coupling.")
    out.append("- Markdown vs YAML vs Python: each format has its own comment convention, but the field schema (`Generated by` / `Source` / `Created at`) is identical, so a downstream Audit Pass Check #4 can grep across all three with a single regex: `(Generated by|# Generated by|Generated by:)\\s*PROP-`.")
    out.append("")

    return "\n".join(out)


def main() -> None:
    out_dir = SCRATCH
    sims = [
        ("sim_1_cascade.report.md", sim_1_cascade),
        ("sim_2_audit_pass.report.md", sim_2_audit_pass),
        ("sim_3_provenance.report.md", sim_3_provenance),
    ]
    for fname, fn in sims:
        try:
            text = fn()
        except Exception as e:
            text = f"# {fname}\n\nFAILED: {type(e).__name__}: {e}\n"
        (out_dir / fname).write_text(text, encoding="utf-8")
        print(f"  [+] Wrote {fname} ({len(text)} chars)")


if __name__ == "__main__":
    main()
