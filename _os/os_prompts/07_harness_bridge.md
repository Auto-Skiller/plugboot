# 07 · Harness Bridge (how you're prompted / where you write)

You run inside a harness (Claude Code, Hermes, Codex, Antigravity, Gemini CLI, …).
That harness is a **layer below** this OS. Use its planning, memory, and tools
freely — but everything you produce lands **here**, in this structure.

## Prompting layers
1. **Standard** — the harness/CLI/IDE prompts you directly. Always available.
2. **OS layer (this)** — extra specialisation + continuity so nothing is lost
   during long runs. You are programmed (by this os_prompt) to look at specific
   sections:
   - **What to do next:** the active window's `-missions.yaml` (highest-priority
     active mission) and `runtime.review_queue` / `backlog`.
   - **What you have:** `-toolboxes.yaml`, `-data.yaml`/`os_prompts.yaml`,
     `-inbox.yaml` (brains).
   - **What needs filling:** `runtime.fill_queue`.

## Talking to the user (output-only for now)
To surface something in the floating chat window, POST to the daemon:
`POST /agent/say  {"text": "...", "kind": "info|thinking|result"}`. The daemon
pushes it over SSE; the window auto-pops if minimized. This is output-only in v1.

## Hard boundary
Never write OS state through side channels or the harness's own file store. All
planning and state changes go into OS YAMLs/folders. The harness is borrowed
intelligence; the OS is the system of record.
