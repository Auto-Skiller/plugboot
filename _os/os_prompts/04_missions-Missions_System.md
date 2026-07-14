# Missions System

Missions are the control surface for all work. Three kinds. Each has state.class: PLANNING | EXECUTION and state.progress: pending | in-progress | completed | blocked. The dashboard shows PLANNING on top, EXECUTION below.

> DEFAULT TYPE: If the user does NOT explicitly specify a mission type when asking for a new mission, create a STANDARD mission. Only use research / evolution / analytics types when the user explicitly asks for them.

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

### auto_execution: false does NOT mean stop working
`auto_execution: false` only gates the PLANNING → EXECUTION **class flip** (and the applying of changes to code/folders). It does NOT forbid the agent from doing work. While a mission is in PLANNING — or even without a live mission — the agent MAY freely perform:
- discovery, research, reading, and analysis;
- planning, proposal-writing, and scoping;
- **INBOX evolution's raw → gateway processing** (routing/classifying/describing inbox drops into the gateway — see os_prompt 07).
Execution (actually applying an evolution mission into real code/folders) waits until the mission is flipped to EXECUTION (by the user or by `auto_execution`). Think of PLANNING as the "think + ingest" phase and EXECUTION as the "apply" phase.

### Stale mission hygiene + dashboard sync (Law #11)
Empty `mission_shell` scaffolds (no `proposal_name`, `objective: ''`, `needs_semantics: true`) are daemon junk — remove or ignore them, never treat as work. The dashboard and `*-missions.yaml` must stay in sync: a mission deleted in one is deleted in the other. On boot, reconcile orphans (see Hard Law #11).
