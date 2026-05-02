# SKILL: graph_build

**Engine:** `map_engine` (graphify)
**Runtime:** Python — `uv tool install graphifyy[all]`
**Trigger:** `/graph-build <path>` or `graphify <path>`

## What This Skill Does

Turns any folder of source code into a queryable knowledge graph.
Uses tree-sitter AST extraction (zero LLM cost for code files).
Outputs `graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`, `graphify-out/wiki/`.

## When To Use

- First time scanning a new codebase or module
- After adding non-code files (new docs/configs that need semantic nodes via LLM)
- To generate the initial `graph.json` before `graph_update` can take over

## Execution Steps

### Step 1 — Pre-flight
```bash
[ -f "graphify-out/graph.json" ] && echo "EXISTS" || echo "FIRST_RUN"
```

### Step 2 — Build
```bash
# Full build (code + any existing semantic nodes):
graphify <target_path>

# Or via Python script (see scripts/build.py):
python .library/.engines_library/registry_engine/skills/graph_build/scripts/build.py <target_path>
```

### Step 3 — Validate Output
```bash
[ -f "graphify-out/graph.json" ] && python -c "
import json; d = json.load(open('graphify-out/graph.json'))
print(f'Nodes: {len(d[\"nodes\"])}, Edges: {len(d.get(\"links\", d.get(\"edges\", [])))}')
"
```

### Step 4 — Snapshot for Diff
```bash
cp graphify-out/graph.json graphify-out/.last-build-snapshot.json
```

### Step 5 — Report Summary
Print node count, edge count, communities from `graphify-out/GRAPH_REPORT.md`.

## Output Contract

| File | Description |
|------|-------------|
| `graphify-out/graph.json` | NetworkX node-link graph — consumed by graph_query, graph_serve, graph_analyze |
| `graphify-out/GRAPH_REPORT.md` | Human-readable: god nodes, surprises, communities, knowledge gaps |
| `graphify-out/graph.html` | Interactive visualization (skipped for graphs >5000 nodes) |
| `graphify-out/wiki/` | Per-community markdown files |
| `graphify-out/.last-build-snapshot.json` | Baseline for graph_diff in graph_analyze |

## Node Schema
```json
{"id": "string", "label": "string", "source_file": "string",
 "community": 0, "file_type": "code|doc|paper|image", "degree": 0}
```

## Edge Schema
```json
{"source": "string", "target": "string",
 "relation": "string", "confidence": "EXTRACTED|INFERRED|AMBIGUOUS"}
```

## Supported File Types (code — zero LLM cost)
Python, TypeScript, JavaScript, Go, Rust, Java, C, C++, Ruby, PHP, Swift, Kotlin, Scala, R, Shell, YAML, JSON, TOML, HTML, CSS, SQL

## Anti-Patterns
- DO NOT delete `graphify-out/` — prior valid graph remains available on failure
- DO NOT run on docs/images without an LLM configured — skip non-code files
- After first build, use `graph_update` skill for code changes (faster, zero LLM)
