# Missions System

Missions are the control surface for all work. Three kinds. Each has state.class: PLANNING | EXECUTION and state.progress: pending | in-progress | completed | blocked. The dashboard shows PLANNING on top, EXECUTION below.

## Standard missions
Normal tasks: goals (why/cause/how, benefit/cost/worth-it) + ordered tasks (priority_ref). Features:
- rounds.status — true = mission repeats after completing.
- rounds.persistent — true = repeats until the user stops it (ignore max); false = obey rounds.max.
Use rounds for recurring / long-running work.

## Research missions
Parameterized investigation: levels (depth/details/precise HIGH|MEDIUM|LOW); sources (training_data/web/notebook_lm/youtube); aspects (all | [Architecture|Capabilities|Monetization]); pillars / evolution_objectives (none|all|[..]). Produces topics with why/keywords/instructions.

## Evolution missions
These set the PARAMETERS for the evolution WORKFLOW (see 05_evolution) and track its progress. The workflow must strictly obey its mission. Type: FAST | DEEP | RESEARCH | INBOX. Carries pillars, evolution_objectives, action_gates, aspects, priority, and a cases list (each scored benefit/cost/worth-it with instructions).

### The readiness gate (daemon-enforced)
readiness:
  mission_params_read: false        # flip true after reading THIS mission's params
  evolution_os_prompt_read: false   # flip true after reading the evolution os_prompt
  ready_to_advance: false           # flip true ONLY when both above are true
The daemon won't let an evolution run leave PLANNING while ready_to_advance is false.

## Lifecycle
pending -> in-progress -> completed | blocked. Class flips PLANNING -> EXECUTION on approval (or auto, per config.missions.auto_execution). Auto-triggering and auto-archiving are config-gated per type. Completed/cancelled move to archived.
