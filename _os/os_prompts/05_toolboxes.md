# 05 · Toolboxes (Capabilities)

Toolboxes are the OS's muscles: **domains → toolboxes → agents + skills (+ skill
references)**. They live per entity and are indexed/controlled in
`<entity>-toolboxes.yaml` (follows `toolboxes-schema.yaml`).

## Maturity
Every agent/skill/toolbox carries a maturity: `stub | functional | hardened |
battle-tested`. The user activates what they want via `status: true|false`.

## How to use them
1. Read `<entity>-toolboxes.yaml` to see what's **active** and its metadata
   (`role`, `when_to_use`, `triggers`, `inputs`, `outputs`) — you do NOT need to
   open the actual files to decide relevance; the yaml is the brain.
2. Only open the actual toolbox file when you've decided it's the right tool.
3. Prefer active toolboxes for their stated purpose before improvising.

## Adding capability
New skills/agents are files; their full metadata is declared in the toolboxes yaml
so users can see and control them. The engine flags new files in `fill_queue`;
fill their metadata there.
