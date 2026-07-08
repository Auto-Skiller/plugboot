# \U0001F916 AGENTS — Boot Pointer

> Root authority for any agent/harness landing in this workspace. The harness
> (Claude Code, Hermes, Codex, Gemini CLI, \u2026) brings the brain: planning,
> memory, tools. **All planning and state live HERE, in our structure.** The
> harness never owns workspace files — it operates through them.

---

## Boot sequence

1. Read `index.yaml` (root map) — know where everything lives before acting.
2. Read every file under `_os/os_prompts/` — these are the OS laws (identity,
   behavior, missions, evolution, aspects). Mandatory, every turn.
3. Read `config.yaml` — global toggles + what's active.
4. Read the active entity's `*-runtime.yaml`, `*-missions.yaml`, and the brain
   (`os_prompts.yaml` for `_os`, `<project>-data.yaml` for projects). Use these
   pre-filled sections as memory — only open the actual files you truly need.

## The brain / fill_queue contract (Decisions #5)

The daemon detects files that land or leave watched folders and flags them in
`runtime.fill_queue`. **Watch `fill_queue` and fill the semantic fields**
(`role`, `description`, `contains`, `when_to_use`) for each flagged file so you
(and future turns) never re-read a file to know what it is.

## The three aspects (fixed, OS-level)

Every evolution and research mission focuses through one or more aspects:

- **Architecture** — the OS structure, schemas, routing, laws.
- **Capabilities** — toolboxes (agents, skills, references).
- **Monetization** — value, business, market.

Pillars are **dynamic** (defined per entity in `*-runtime.yaml`). Aspects are
**fixed** and defined here.

## Turn discipline (Decisions #13)

- Every turn, strictly think about **next actions**.
- If the user's goal is not yet reached, **continue** until it is.
- When done, **present the next actions** to the user.

## Evolution readiness gate (Decisions #7)

Before advancing any evolution run, read the parent evolution mission's params
AND the relevant evolution os_prompt, then set the mission's
`readiness.ready_to_advance: true`. The daemon refuses to advance a run whose
parent mission is not ready.

## Communication

Standard prompting is via your harness. The floating chat window is
agent-output-only for now: `POST /agent/say {kind, text}` to surface something
to the user; it appears live and auto-pops if minimized.
