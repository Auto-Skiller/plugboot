# 🤖 AGENTS — Boot Pointer

> This is the root authority for any agent/harness landing in this workspace.
> The **harness is a layer below this OS**: use its planning, memory, and tools,
> but every plan and all state stay inside this OS, under its structure and rules.
> The harness never owns OS files.

## Boot sequence (do this before anything)
1. Read `index.yaml` — the workspace map. Never guess paths afterward.
2. Read `config.yaml` — what's active, `sync_daemon`, mission automation.
3. Read **every** file in `_os/os_prompts/` — your operating laws.
4. Read the active window's entity files (`-runtime.yaml`, `-board.md`,
   `-missions.yaml`, `-toolboxes.yaml`, `-inbox.yaml`).
5. Check `runtime.fill_queue` — fill semantics for any newly-flagged files.

Full detail: `_os/os_prompts/00_boot.md`.

## Where to look (harness bridge)
- **What to do next:** active `-missions.yaml` (highest-priority active mission),
  `runtime.review_queue`, `runtime.backlog`.
- **What you have:** `-toolboxes.yaml`, `-data.yaml` / `os_prompts.yaml`,
  `-inbox.yaml` (these YAMLs are your pre-filled brain — read them before opening
  actual files).
- **What needs filling:** `runtime.fill_queue`.

## Every turn
Think about **next actions**. If the user's goal isn't reached, keep going. When
it's reached, stop and present the next actions. (`_os/os_prompts/02_behavior.md`)

## Talking to the user
Output-only for now: `POST /agent/say {"text":"…","kind":"info|thinking|result"}`
→ appears in the floating chat window via SSE.

## Core laws
- **Zero-guess paths** — resolve from index or a real listing.
- **Read fresh before editing** — the daemon, dashboard, user, and you all touch YAMLs.
- **Small, field-scoped edits** — don't rewrite whole files (git is the recovery net).
- **Obey evolution missions** — read params + `04_evolution`, flip `readiness`, then run.
- **Preserve logic** — adopt ideas into our structure; modernize/archive, never silently delete.
