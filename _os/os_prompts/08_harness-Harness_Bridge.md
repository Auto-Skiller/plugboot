# Harness Bridge (how your harness plugs in)

## The principle
Your harness (Claude Code, Hermes, Codex, Antigravity, Gemini CLI, ...) is a layer below this workspace. Use all its powers — planning, memory, tools, subagents. But all planning and state must live in our YAMLs. You are the brain visiting the body; you operate our files, you don't own them.

## Where to read
1. index.yaml -> the map.
2. config.yaml -> what's active + current_window.
3. Active entity's `*-missions.yaml` -> your work. PLANNING = needs planning/approval; EXECUTION = live.
4. Entity's `*-runtime.yaml` -> pillars, objectives, queues, fill_queue.
5. Brain YAMLs (os_prompts.yaml, `*-toolboxes.yaml`, `*-inbox.yaml`, `*-data.yaml`) -> descriptions first, raw files only when needed.

## Where to write
- Mission progress/status -> the mission's fields in `*-missions.yaml`.
- Decisions/blockers/proposals -> runtime.review_queue.
- Ideas/next steps -> runtime.backlog.
- Events -> runtime.recent_events ([DATE] TYPE: desc — details).
- Semantic file descriptions -> the owning brain YAML when fill_queue flags them.
- Live messages to the user -> POST /agent/say (streams to the floating chat window over SSE; output-only for now).

## Convention now, MCP later
v1 is convention-based: this file tells you where to look. A future MCP layer will expose these read/write points as tools without changing the model. Write surgically; never rewrite whole files.

## Memory across long runs
The YAMLs ARE your durable memory. On resume, re-read the active entity's runtime + missions to recover full context. You never lose the thread because the thread lives on disk, not in your context window.
