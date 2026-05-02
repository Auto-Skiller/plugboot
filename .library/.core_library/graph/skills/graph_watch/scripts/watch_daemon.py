"""
watch_daemon.py — Substrate OS graph_watch skill
Wraps graphify's watch module to run as a background daemon.
Adapted from: temp_repos/map_engine/graphify/watch.py

Usage:
    python watch_daemon.py <target_path> [--debounce 3.0]
"""
from __future__ import annotations
import argparse
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(
        description="Watch a folder and auto-update the knowledge graph (Substrate OS graph_watch skill)"
    )
    parser.add_argument("target", nargs="?", default=".", help="Folder to watch (default: .)")
    parser.add_argument("--debounce", type=float, default=3.0,
                        help="Seconds to wait after last change before updating (default: 3.0)")
    args = parser.parse_args()

    target = Path(args.target).resolve()
    if not target.exists():
        print(f"[graph_watch] ERROR: Path not found: {target}", file=sys.stderr)
        sys.exit(1)

    try:
        from graphify.watch import watch
    except ImportError as e:
        print(f"[graph_watch] ERROR: graphify not installed: {e}", file=sys.stderr)
        print("[graph_watch] Run: uv tool install graphifyy[all,watch]", file=sys.stderr)
        sys.exit(1)

    print(f"[graph_watch] Starting watch on: {target}")
    print(f"[graph_watch] Debounce: {args.debounce}s | Ctrl+C to stop")
    print(f"[graph_watch] Code changes → auto-rebuild (AST, zero LLM)")
    print(f"[graph_watch] Doc/image changes → writes needs_update flag")

    watch(target, debounce=args.debounce)


if __name__ == "__main__":
    main()
