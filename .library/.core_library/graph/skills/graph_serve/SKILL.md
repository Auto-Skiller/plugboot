# SKILL: graph_serve

**Engine:** `map_engine` (graphify)
**Runtime:** Python + MCP — zero LLM cost
**Trigger:** `/graph-serve [graph_path]` or `graphify serve <path>`

## What This Skill Does

Starts an MCP stdio server that exposes the knowledge graph as 7 structured tools.
Any MCP-compatible agent (Claude, Cursor, etc.) can call these tools to navigate the graph.

## When To Use

- At workspace start — keep running as a background service
- When `graph_query` skill CLI isn't enough (need persistent tool access)
- When multiple agents need concurrent graph access

## Execution

```bash
# Start MCP server (stdio transport):
graphify serve graphify-out/graph.json

# Via uv (recommended for dependency isolation):
uv run --with graphifyy --with mcp -m graphify.serve graphify-out/graph.json

# Via Python:
python .library/.engines_library/registry_engine/skills/graph_serve/scripts/serve.py graphify-out/graph.json
```

## MCP Configuration (add to your agent's MCP config)

```json
{
  "mcpServers": {
    "substrate-graph": {
      "command": "graphify",
      "args": ["serve", "graphify-out/graph.json"]
    }
  }
}
```

## The 7 MCP Tools

### `query_graph`
```json
{"question": "how does auth work", "mode": "bfs", "depth": 3, "token_budget": 2000}
```
Returns: Traversal text with relevant nodes and edges

### `get_node`
```json
{"label": "UserController"}
```
Returns: Node ID, source file, location, type, community, degree

### `get_neighbors`
```json
{"label": "AuthService", "relation_filter": "imports"}
```
Returns: All direct neighbors with relation type and confidence

### `get_community`
```json
{"community_id": 0}
```
Returns: All nodes in the community

### `god_nodes`
```json
{"top_n": 10}
```
Returns: Top N most-connected real entities (file hubs excluded)

### `graph_stats`
```json
{}
```
Returns: `Nodes: N, Edges: N, Communities: N, EXTRACTED: X%, INFERRED: Y%, AMBIGUOUS: Z%`

### `shortest_path`
```json
{"source": "UserController", "target": "DatabasePool", "max_hops": 8}
```
Returns: `Shortest path (3 hops): UserController --calls--> AuthService --uses--> DatabasePool`

## Blank Line Filtering

The server automatically filters blank stdin lines from MCP clients (Claude Desktop sends them).
This is handled by `graphify.serve._filter_blank_stdin()` — no action needed.

## Notes

- Server loads `graph.json` once at startup — restart to pick up graph rebuilds
- For live graph updates without restart, use the Python API directly in `graph_query`
