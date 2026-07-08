# 04 · Evolution (the OS's self-improvement — formerly the Scaler)

The old Scaler pipeline is **dissolved into the OS**. Its useful DNA survives here,
adapted to the new declarative structure. There is no separate pipeline, no
runbooks, no copy-never-move filesystem dance, no Python engine driving it.

## Goal
Detect gaps, best practices, and extend/enhance opportunities across an entity's
components (board, data/os_prompts, toolboxes) and implement fixes — always
framed by **aspects** (Architecture / Capabilities / Monetization) and scoped by
dynamic **pillars**.

## Modes (set by the evolution mission)
- **FAST** — from real-time user intent and working outputs.
- **DEEP** — from deep analytics across the entity's own components.
- **RESEARCH** — from existing research + the entity's components.
- **INBOX** — from deep analysis of the inbox gateway + the entity's components.

## Pillars (dynamic) vs Aspects (fixed)
- **Pillars** live in `runtime.yaml` (`pillars`), user/agent-defined per entity,
  validated vs suggestions. They scope *where* evolution focuses.
- **Aspects** are the fixed three. They scope *what kind* of improvement.

## The inbox gateway (INBOX mode)
The inbox folder = raw dropped data + a dot-prefixed `.gateway/` folder. Inside
`.gateway/` are **pillar folders**, each holding **functional groups** of items:
```
<entity>-inbox/
  <raw drops>
  .gateway/
    <Pillar>/
      <functional_group>/ <items>
```
Deliver raw items into the right pillar's functional group (group by what items
DO, not where they came from). The `-inbox.yaml` is the tracker/brain: describe
every gateway item and record which evolutions already processed which items
under which aspects (`processed_evolutions`). Never reprocess the same item/aspect
blindly.

## Obey the mission
Before running any evolution workflow: read the evolution mission's params, read
this file, then flip the mission `readiness` flags (see `03_missions`). The daemon
gates on it.

## Preserve logic
When adapting an external idea or replacing old logic: adopt the idea into our
structure — never contort our structure to the idea. Don't silently delete
working logic; modernize or archive it.
