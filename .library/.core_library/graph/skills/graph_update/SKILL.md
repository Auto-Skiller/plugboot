# SKILL: graph_update

**Engine:** `map_engine` (graphify)
**Runtime:** Python — zero LLM cost
**Trigger:** `/graph-update <path>` or `graphify update <path>`

## What This Skill Does

Incremental AST-only rebuild of the knowledge graph after code changes.
Replaces code nodes while preserving existing semantic nodes from prior full builds.
No LLM calls. Fast. Safe to run on every save.

## When To Use

- After editing code files (`.py`, `.ts`, `.js`, `.go`, `.rs`, etc.)
- As the default post-commit hook
- When `graphify-out/needs_update` flag is NOT set (that flag means non-code files changed, which requires LLM)
- Triggered automatically by `graph_watch` skill

## Execution

```bash
# Via CLI (preferred):
graphify update <target_path>

# Via Python:
python .library/.engines_library/registry_engine/skills/graph_update/scripts/update.py <target_path>
```

## How It Works (from map_engine/graphify/watch.py)

1. Re-runs tree-sitter AST extraction on all code files
2. Replaces code nodes in existing `graph.json`
3. Preserves semantic nodes (doc/paper/image nodes from previous full build)
4. Preserves INFERRED/AMBIGUOUS edges from prior semantic extraction
5. Re-clusters communities
6. Rewrites `graph.json` + `GRAPH_REPORT.md`
7. Skips `graph.html` rebuild if graph > 5000 nodes

## When NOT To Use

If `graphify-out/needs_update` file exists → non-code files changed → must run `graph_build` (requires LLM)

```bash
# Check for non-code update flag:
[ -f "graphify-out/needs_update" ] && echo "NEEDS_FULL_BUILD" || echo "UPDATE_OK"
```

## Output

Same as `graph_build` — overwrites `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md` in place.
