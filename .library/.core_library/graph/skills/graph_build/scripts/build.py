"""
graph_build — Substrate OS Registry Engine
Wraps graphify to build a knowledge graph from a target folder.
Adapted from: temp_repos/map_engine/graphify/__main__.py

Usage:
    python build.py <target_path> [--output-dir <dir>]
    python build.py .
    python build.py /path/to/project --output-dir .registry/graphs/my-project
"""
from __future__ import annotations
import argparse
import json
import shutil
import sys
from pathlib import Path
from datetime import datetime, timezone


def build_graph(target_path: str, output_dir: str | None = None) -> dict:
    """
    Build a knowledge graph from target_path using graphify.

    Returns a summary dict:
      {success, nodes, edges, communities, output_path, report_path, error}
    """
    target = Path(target_path).resolve()
    if not target.exists():
        return {"success": False, "error": f"Path not found: {target}"}

    # Default output inside target folder (graphify convention)
    out_dir = Path(output_dir).resolve() if output_dir else target / "graphify-out"

    try:
        from graphify.detect import detect
        from graphify.extract import extract
        from graphify.build import build_from_json, build
        from graphify.cluster import cluster, score_all
        from graphify.analyze import god_nodes, surprising_connections, suggest_questions
        from graphify.report import generate
        from graphify.export import to_json, to_html, to_wiki
    except ImportError as e:
        return {
            "success": False,
            "error": f"graphify not installed: {e}. Run: uv tool install graphifyy[all]"
        }

    print(f"[graph_build] Scanning: {target}")

    # Detect all files
    detected = detect(target)
    code_files = [Path(f) for f in detected["files"].get("code", [])]
    doc_files = [Path(f) for f in detected["files"].get("document", [])]
    paper_files = [Path(f) for f in detected["files"].get("paper", [])]

    print(f"[graph_build] Found: {len(code_files)} code, {len(doc_files)} doc, {len(paper_files)} paper files")

    if not code_files and not doc_files and not paper_files:
        return {"success": False, "error": "No supported files found in target path"}

    # AST extraction (code — zero LLM cost)
    all_extractions = []
    if code_files:
        print(f"[graph_build] AST extracting {len(code_files)} code files...")
        try:
            code_result = extract(code_files, cache_root=target)
            all_extractions.append(code_result)
            print(f"[graph_build] AST: {len(code_result.get('nodes', []))} nodes extracted")
        except Exception as e:
            print(f"[graph_build] WARNING: AST extraction partial failure: {e}", file=sys.stderr)

    # Doc/paper files: skip if no LLM configured (LLM-free constraint)
    if doc_files or paper_files:
        print(f"[graph_build] NOTE: {len(doc_files + paper_files)} non-code files skipped (no LLM configured)")
        print("[graph_build] To include docs/papers, configure an LLM provider first")

    if not all_extractions:
        return {"success": False, "error": "No extractions succeeded"}

    # Build graph
    print("[graph_build] Building graph...")
    G = build(all_extractions)

    # Cluster
    print("[graph_build] Clustering communities...")
    communities = cluster(G)
    cohesion = score_all(G, communities)
    community_labels = {cid: f"Community {cid}" for cid in communities}

    # Analyze
    gods = god_nodes(G, top_n=10)
    surprises = surprising_connections(G, communities)
    questions = suggest_questions(G, communities, community_labels)

    # Export
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / ".graphify_root").write_text(str(target), encoding="utf-8")

    json_path = str(out_dir / "graph.json")
    to_json(G, communities, json_path)

    # Report
    report = generate(
        G, communities, cohesion, community_labels,
        gods, surprises, detected,
        {"input": 0, "output": 0},
        target.name,
        suggested_questions=questions
    )
    report_path = out_dir / "GRAPH_REPORT.md"
    report_path.write_text(report, encoding="utf-8")

    # HTML (skip on large graphs)
    try:
        to_html(G, communities, str(out_dir / "graph.html"), community_labels=community_labels)
    except ValueError as e:
        print(f"[graph_build] Skipped graph.html: {e}")

    # Wiki
    try:
        to_wiki(G, communities, str(out_dir / "wiki"), community_labels=community_labels)
    except Exception as e:
        print(f"[graph_build] Skipped wiki: {e}")

    # Snapshot for graph_diff
    snap_path = out_dir / ".last-build-snapshot.json"
    shutil.copy(json_path, snap_path)

    # Write build metadata
    meta = {
        "built_at": datetime.now(timezone.utc).isoformat(),
        "target": str(target),
        "nodes": G.number_of_nodes(),
        "edges": G.number_of_edges(),
        "communities": len(communities),
        "code_files_scanned": len(code_files),
    }
    (out_dir / ".build-meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")

    summary = {
        "success": True,
        "nodes": G.number_of_nodes(),
        "edges": G.number_of_edges(),
        "communities": len(communities),
        "output_path": json_path,
        "report_path": str(report_path),
        "god_nodes": [n["label"] for n in gods[:5]],
    }

    print(f"[graph_build] ✓ Complete: {summary['nodes']} nodes, {summary['edges']} edges, {summary['communities']} communities")
    print(f"[graph_build] Graph: {json_path}")
    print(f"[graph_build] Report: {report_path}")

    return summary


def main():
    parser = argparse.ArgumentParser(description="Build a knowledge graph from a folder (Substrate OS graph_build skill)")
    parser.add_argument("target", help="Path to folder to analyze")
    parser.add_argument("--output-dir", help="Output directory (default: <target>/graphify-out)")
    args = parser.parse_args()

    result = build_graph(args.target, args.output_dir)

    if result["success"]:
        print("\n## GRAPH BUILD COMPLETE")
        print(f"  Nodes: {result['nodes']}")
        print(f"  Edges: {result['edges']}")
        print(f"  Communities: {result['communities']}")
        print(f"  God nodes: {', '.join(result['god_nodes'])}")
        sys.exit(0)
    else:
        print(f"\n## GRAPH BUILD FAILED: {result['error']}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
