# 03 · Missions

Missions are the control + tracking layer over work. Three kinds:

## Standard
Normal tasks with goals and ordered tasks. Supports **rounds**: `rounds.status:
true` repeats the mission when complete; `persistant: true` repeats until the user
stops it; otherwise it repeats up to `max`. Use for recurring/long-running work.

## Research
Parameterised investigation. Carries `pillars`, `evolution_objectives`,
`subjects`, depth/detail/precision levels, and `sources` (training_data, web,
notebook_lm, youtube). Add an `aspects: all | [Architecture, Capabilities,
Monetization]` focus. Produces topics with findings.

## Evolution
**Evolution missions are NOT the evolution workflow.** A mission sets the
*parameters* of an evolution workflow, tracks its progress, and gives the user
control. The workflow (see `04_evolution`) MUST strictly obey its mission.

Evolution missions come in modes: **FAST, DEEP, RESEARCH, INBOX** and declare
`pillars`, `evolution_objectives`, `aspects`, and `action_gates`.

### The readiness gate (mandatory)
Every evolution mission carries:
```yaml
readiness:
  mission_params_read: false        # flip true AFTER you read this mission's params
  evolution_os_prompt_read: false   # flip true AFTER you read 04_evolution
  ready_to_advance: false           # set true ONLY when both above are true
```
The daemon will **refuse to advance** an evolution run whose parent mission has
`ready_to_advance: false`. Read first, then flip, then run. Never flip blindly.

## PLANNING vs EXECUTION
Every mission is in `class: PLANNING` or `class: EXECUTION`. The dashboard splits
the center on this: PLANNING on top, EXECUTION below.
