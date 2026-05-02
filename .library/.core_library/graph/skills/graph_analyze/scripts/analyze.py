"""
analyze.py — Substrate OS graph_analyze skill
Runs full structural analysis on an existing graph.json and writes ANALYSIS.md.
Adapted from: temp_repos/map_engine/graphify/analyze.py

Usage:
    python analyze.py <graph_path> [--output <report_path>]
    python analyze.py graphify-out/graph.json
    python analyze.py graphify-out/graph.json --output graphify-out/ANALYSIS.md
"""
from __future__ import annotations
import argparse
import json
import sys
from datetime import date
from pathlib import Path


def run_analysis(graph_path: str, output_path: str | None = None) -> dict:
    """Full structural analysis — zero LLM cost."""
    try:
        from graphify.serve import _load_graph, _communities_from_graph
        from graphify.analyze import god_nodes, surprising_connections, suggest_questions, graph_diff
        from graphify.cluster import cohesion_score
    except ImportError as e:
        return {"success": False, "error": f"graphify not installed: {e}"}

    graph_file = Path(graph_path)
    if not graph_file.exists():
        return {"success": False, "error": f"graph.json not found: {graph_path}. Run graph_build first."}

    print(f"[graph_analyze] Loading: {graph_path}")
    G = _load_graph(graph_path)
    communities = _communities_from_graph(G)
    community_labels = {cid: f"Community {cid}" for cid in communities}

    print(f"[graph_analyze] Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities")

    # Core analyses
    gods = god_nodes(G, top_n=10)
    surprises = surprising_connections(G, communities, top_n=5)
    questions = suggest_questions(G, communities, community_labels, top_n=7)

    # Edge confidence breakdown
    confidences = [d.get("confidence", "EXTRACTED") for _, _, d in G.edges(data=True)]
    total = len(confidences) or 1
    ext_pct = round(confidences.count("EXTRACTED") / total * 100)
    inf_pct = round(confidences.count("INFERRED") / total * 100)
    amb_pct = round(confidences.count("AMBIGUOUS") / total * 100)

    # Knowledge gaps
    isolated = [
        n for n in G.nodes()
        if G.degree(n) <= 1
    ]

    # Graph diff (if snapshot exists)
    snap_path = graph_file.parent / ".last-build-snapshot.json"
    diff_summary = None
    if snap_path.exists() and str(snap_path) != str(graph_file):
        try:
            G_old = _load_graph(str(snap_path))
            diff = graph_diff(G_old, G)
            diff_summary = diff["summary"]
            print(f"[graph_analyze] Diff: {diff_summary}")
        except Exception as e:
            print(f"[graph_analyze] Diff skipped: {e}", file=sys.stderr)

    # Build token-lean codemap report
    today = date.today().isoformat()
    lines = [
        f"<!-- Generated: {today} | Nodes: {G.number_of_nodes()} | Edges: {G.number_of_edges()} | Communities: {len(communities)} -->",
        "",
        "# Codebase Analysis",
        "",
        "## Summary",
        f"- {G.number_of_nodes()} nodes · {G.number_of_edges()} edges · {len(communities)} communities",
        f"- Confidence: {ext_pct}% EXTRACTED · {inf_pct}% INFERRED · {amb_pct}% AMBIGUOUS",
    ]

    if diff_summary:
        lines += ["", f"## Changes Since Last Build", f"- {diff_summary}"]

    lines += ["", "## God Nodes (Core Abstractions)"]
    for i, node in enumerate(gods, 1):
        lines.append(f"{i}. `{node['label']}` — {node['degree']} edges")

    lines += ["", "## Community Map"]
    for cid, nodes in communities.items():
        label = community_labels.get(cid, f"Community {cid}")
        node_labels = [G.nodes[n].get("label", n) for n in nodes[:5]]
        extra = f" (+{len(nodes)-5} more)" if len(nodes) > 5 else ""
        score = cohesion_score(G, nodes)
        lines.append(f"- **{label}** (cohesion: {score:.2f}): {', '.join(node_labels)}{extra}")

    if surprises:
        lines += ["", "## Surprising Connections"]
        for s in surprises:
            why = s.get("why", "cross-module link")
            conf = s.get("confidence", "EXTRACTED")
            lines.append(f"- `{s['source']}` --{s.get('relation', '')}--\u003e `{s['target']}` [{conf}] — {why}")

    if questions:
        no_signal = len(questions) == 1 and questions[0].get("type") == "no_signal"
        if not no_signal:
            lines += ["", "## Suggested Questions"]
            for q in questions:
                if q.get("question"):
                    lines.append(f"- **{q['question']}**")
                    lines.append(f"  _{q['why']}_")

    if isolated:
        lines += ["", "## Knowledge Gaps"]
        isolated_labels = [G.nodes[n].get("label", n) for n in isolated[:5]]
        extra = f" (+{len(isolated)-5} more)" if len(isolated) > 5 else ""
        lines.append(f"- {len(isolated)} isolated nodes: {', '.join(f'`{l}`' for l in isolated_labels)}{extra}")
        if amb_pct > 20:
            lines.append(f"- High ambiguity: {amb_pct}% of edges are AMBIGUOUS — review needed")

    report = "\n".join(lines)

    # Write output
    if output_path is None:
        output_path = str(graph_file.parent / "ANALYSIS.md")

    Path(output_path).write_text(report, encoding="utf-8")
    print(f"[graph_analyze] ✓ Analysis written to: {output_path}")

    return {
        "success": True,
        "nodes": G.number_of_nodes(),
        "edges": G.number_of_edges(),
        "communities": len(communities),
        "god_nodes": [n["label"] for n in gods[:5]],
        "surprising_connections": len(surprises),
        "knowledge_gaps": len(isolated),
        "diff_summary": diff_summary,
        "output_path": output_path,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Analyze a knowledge graph and produce structural insights (Substrate OS graph_analyze skill)"
    )
    parser.add_argument("graph_path", help="Path to graph.json (e.g. graphify-out/graph.json)")
    parser.add_argument("--output", help="Output path for ANALYSIS.md (default: next to graph.json)")
    args = parser.parse_args()

    result = run_analysis(args.graph_path, args.output)

    if result["success"]:
        print("\n## ANALYSIS COMPLETE")
        print(f"  Nodes: {result['nodes']} | Edges: {result['edges']} | Communities: {result['communities']}")
        print(f"  God nodes: {', '.join(result['god_nodes'])}")
        print(f"  Surprising connections: {result['surprising_connections']}")
        print(f"  Knowledge gaps: {result['knowledge_gaps']}")
        if result["diff_summary"]:
            print(f"  Changes: {result['diff_summary']}")
        print(f"  Report: {result['output_path']}")
        sys.exit(0)
    else:
        print(f"\n## ANALYSIS FAILED: {result['error']}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
