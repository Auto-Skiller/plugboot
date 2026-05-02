# SKILL: graph_query

**Engine:** `map_engine` (graphify)
**Runtime:** Python — zero LLM cost
**Trigger:** `/graph-query "<question>"` or `graphify query "<question>"`

## What This Skill Does

Navigates an existing `graph.json` using BFS/DFS traversal, keyword scoring, and path-finding.
Returns relevant nodes and edges as structured text context — no LLM required.

## When To Use

- "How does module X relate to module Y?"
- "What are the most connected concepts in this codebase?"
- "Trace the path from AuthService to DatabasePool"
- Feeding codebase context into a bash/script node in a workflow

## Execution

```bash
# Term search (BFS, depth 3):
graphify query "<question>" [--depth 3] [--mode bfs|dfs]

# Find shortest path between two concepts:
graphify path "AuthService" "DatabasePool"

# Get node details:
graphify explain "UserController"

# Graph status:
graphify status

# Graph diff (since last build snapshot):
graphify diff
```

## Python API

```python
from graphify.serve import (
    _load_graph, _score_nodes, _bfs, _dfs,
    _subgraph_to_text, _find_node, _tool_shortest_path
)

G = _load_graph("graphify-out/graph.json")

# Score nodes by keyword relevance
scored = _score_nodes(G, ["authentication", "jwt", "token"])
start_nodes = [nid for _, nid in scored[:3]]

# BFS traversal
nodes, edges = _bfs(G, start_nodes, depth=3)

# Render as text (token-budget aware)
text = _subgraph_to_text(G, nodes, edges, token_budget=2000)
print(text)
```

## MCP Tools (when graph_serve is running)

The MCP server exposes these 7 tools directly to any MCP-compatible agent:

| Tool | Input | Use |
|------|-------|-----|
| `query_graph` | `question`, `mode`, `depth`, `token_budget` | BFS/DFS keyword search |
| `get_node` | `label` | Full node details by label/ID |
| `get_neighbors` | `label`, `relation_filter` | Direct neighbors with edge data |
| `get_community` | `community_id` | All nodes in a community |
| `god_nodes` | `top_n` | Most connected nodes |
| `graph_stats` | — | Node/edge/community counts |
| `shortest_path` | `source`, `target`, `max_hops` | Shortest path between concepts |

## Output Format

```
Traversal: BFS depth=3 | Start: ['AuthService', 'JWT', 'Token'] | 47 nodes found

NODE AuthService [src=src/auth/service.ts loc=class:12 community=0]
NODE JWTValidator [src=src/auth/jwt.ts loc=class:5 community=0]
EDGE AuthService --validates [EXTRACTED]--> JWTValidator
EDGE JWTValidator --uses [INFERRED]--> TokenBlacklist
... (truncated to ~2000 token budget)
```

## Anti-Patterns
- DO NOT use for semantic/meaning questions — that needs RAG (semantic_engine, currently parked)
- DO use for structural questions: "what imports X?", "what does Y depend on?"
