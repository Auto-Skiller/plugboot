# Evolution System (was the Scaler pipeline; now part of the OS)

Evolution continuously improves an entity: detect gaps, best-practices, and extend/enhance opportunities across the entity's components (board, runtime, data/os_prompts, toolboxes, inbox), then propose and implement fixes. Every run is driven by an evolution mission (its parameters). Read the mission first (Hard Law 5).

## The four modes
- FAST — realtime user intent + current working outputs. Cheapest, most reactive.
- DEEP — massive deep analytics across the entity's own components.
- RESEARCH — already-existing research (research missions' outputs) + the entity.
- INBOX — deep analytics of the inbox .<entity>-inbox_gateway items + the entity.

## Aspects steer every run
Architecture / Capabilities / Monetization. A run honors its mission's aspects field and only touches matching concerns.

## Pillars
Dynamic, from the entity runtime. A run targets its mission's pillars (all | [..]). For INBOX mode, gateway items are already organized under pillar folders — process per pillar.

## Case scoring (the manager/analyst win)
Each proposed case carries: case (gap/preference/opportunity), solution, why/cause/how, targets, and benefit/cost/worth-it. worth-it: yes|no is the final implement-or-not recommendation. Auditable decision trail.

## Readiness gate
Before advancing: read mission params + this file, flip readiness.mission_params_read and readiness.evolution_os_prompt_read, then ready_to_advance: true. Daemon-enforced.

## INBOX processing & anti-reprocessing
When running INBOX mode, consult os-inbox.yaml -> processed to avoid re-processing a gateway item under an aspect it already handled. After processing, record processed_by_missions, aspects, processed_at.

## What survived from the old Scaler (adapted, not copied)
- Pillars + functional groups — kept, but pillars are dynamic and functional groups live inside pillar folders in the inbox .<entity>-inbox_gateway/.
- Copy-never-move gateway — kept as a concept: raw drops immutable; agent curates copies into .<entity>-inbox_gateway/<Pillar>/<functional_group>/.
- Benefit/cost/worth-it scoring — kept.
- Dropped: the standalone pipeline, run-folder filesystem lifecycle, the Python engine machinery, board/index split. Folded into missions + this os_prompt.
