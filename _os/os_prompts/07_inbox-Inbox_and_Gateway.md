# Inbox & Gateway

The inbox is where the user drops data for the system to learn from or act on: competitor data, references, research material, source documents, anything.

## Disk layout

```
<entity>-inbox/                          raw user drops (IMMUTABLE source — detected, described, then MOVED out)
<entity>-inbox/.<entity>-inbox_gateway/  agent-curated:
  <Pillar>/                             pillar folder (dynamic; matches runtime pillars — NOT the inbox drop name)
    <aspect>/                          aspect folder — Architecture | Capabilities | Monetization (FIXED, defined in os_prompt 01)
      <functional_group>/              items grouped by what they DO (function, not source)
```

For the OS entity the concrete path is: `_os/os-inbox/.os-inbox_gateway/`.

CRITICAL — pillars are NOT inbox drop-names. The 3 raw inbox drops (`best uses`, `capabilities`, `complex systems`) are SOURCE buckets, not pillars. Pillars come from the entity runtime (`os-runtime.yaml -> pillars`). A drop's contents are routed INTO the gateway under the correct runtime pillar + aspect, never left sitting in a pillar named after the drop.

## THE FIVE ROUTING LAWS (canonical — referenced by os_prompt 05 and the inbox/runtime YAMLs)

These five laws govern EVERY inbox routing + EVERY evolution move. They are the single source of truth; the YAML trackers and the on-disk gateway must always reflect them. Do not invent a different grouping.

- **LAW 1 — Route into the gateway, by runtime pillar/aspect/FG.** Items never stay grouped the way the agent found them in the raw inbox. The raw drop name is NEVER a pillar, aspect, or functional group. Route every item to `<Pillar>/<aspect>/<functional_group>/` where Pillar/Aspect come from the entity runtime and os_prompt 01, never from the drop name.
- **LAW 2 — MOVE, never copy.** Routing MOVES the item into the gateway and DRAINS the raw drop (emptied / marked delivered). The gateway holds the single authoritative copy. The raw drop is the IMMUTABLE IMAGE source; the gateway is the LIVE copy. Never keep two copies of the same item. If the same content appears in two gateway locations, one of them is a duplication bug — collapse it to the correct-by-function location, do not leave both.
- **LAW 3 — Route per-item, never by folder (no batching).** Routing is decided ONE ITEM AT A TIME. When a raw drop contains sub-folders or many files: read and analyse EVERY sub-item individually; for each item decide its OWN destination (correct runtime pillar + aspect + functional group). Items from the SAME raw sub-folder may land in DIFFERENT pillars/aspects/groups. Example: a raw folder with 3 sub-folders × 40 items -> read all 120; 20 belong with others already under `Capabilities/...`, 10 from another folder move together to a different group, 5 are unrelated and each goes to its own relevant destination. Decide by item meaning, not by parent folder.
- **LAW 4 — Functional groups named by FUNCTION, roles declared.** Name a group by what items DO / the function they serve — NEVER by source, tool, vendor, person, or version. Each functional group MUST carry a role declaration (a `README.md` stating its role + functionalities + when_to_use + triggers). BAD (source/tool/version-derived — do not use): `miscellaneous`, `coding rules and tools`, `operational_workflows`, `planning_and_gaps`, `complex systems`, `ops_and_automation`, `setup-matt-pocock-skills`, `migrate-to-shoehorn`, `obsidian-vault`, `swift-concurrency-6-2`. GOOD (function-declared — keep these): `interaction_guidelines`, `profile_and_setup`, `security_and_boundaries`, `agent_personas`, `code_and_build`, `ui_styling`. Constraints: same-pillar, same-aspect only; sub-grouping optional and unbounded; before creating a group, check siblings for a functional match and reuse an existing group rather than spawning a near-duplicate named after its source.
- **LAW 5 — Evolution OBJS drive every evolution move (see os_prompt 05).** Before ANY evolution move the agent MUST read the entity runtime `evolution_objectives` and keep them in scope for the whole run. Objectives are DIRECTIONAL GOALS / focus areas, NOT specific tasks or adopt-X steps, and they are generated from the entity's `os_prompts` + project `*-data/` contents cross-referenced with Pillars/Aspects — NEVER from inbox evolution output. Full definition lives in os_prompt 05 (MANDATORY FIRST READ: evolution_objectives).

## The flow

1. User drops raw items into the inbox folder.
2. Daemon detects them, stamps structure in `<entity>-inbox.yaml -> raw`, flags fill_queue.inbox, and scaffolds any missing gateway `<Pillar>/<aspect>/` skeleton folders (flagged in fill_queue.gateway) so the agent has a clean place to curate.
3. Agent describes each raw item (description/contains/when_to_use).
4. Agent ROUTES (MOVES, never copies) each item into the gateway under `<Pillar>/<aspect>/<functional_group>/`, recording `extracted_concern` + `source_raw_item`. The raw drop is then drained (emptied / marked delivered) — gateway holds the single authoritative copy. Raw is the IMAGE source, gateway is the LIVE copy; do not keep two copies. (LAWS 1–2–3–4.)
5. INBOX evolution runs consume gateway items per pillar/aspect, always honoring the active `evolution_objectives` (LAW 5).

## Per-item routing (NO batching — LAW 3)

Routing is decided ONE ITEM AT A TIME, never by folder. When a raw drop contains sub-folders or many files:
- Read and analyse EVERY sub-item individually.
- For each item decide its own destination: the correct runtime pillar + aspect + functional group.
- Items from the SAME raw sub-folder may land in DIFFERENT pillars/aspects/groups. Example: a raw folder with 3 sub-folders × 40 items -> read all 120; 20 belong with others already under `Capabilities/...`, 10 from another folder move together to a different group, 5 are unrelated and each goes to its own relevant destination. Do not move by parent-folder; move by item meaning.
- After routing, the source raw drop should be empty (delivered), not left as a duplicate.

## Functional groups (named by FUNCTION, never by source — LAW 4)

Name a group by what items DO / the function they serve — NOT where they came from. BAD examples (source-derived, do not use): `miscellaneous`, `coding rules and tools`, `operational_workflows`, `planning_and_gaps`, `complex systems`, `ops_and_automation`, `setup-matt-pocock-skills`, `migrate-to-shoehorn`, `obsidian-vault`, `swift-concurrency-6-2`. GOOD examples (function-declared, keep these): `interaction_guidelines`, `profile_and_setup`, `security_and_boundaries`, `agent_personas`, `code_and_build`, `ui_styling`.
- Same-pillar, same-aspect only.
- Sub-grouping optional and unbounded.
- Before creating a group, check siblings for a functional match (avoid fragmentation). Reuse an existing functional group rather than spawning a near-duplicate named after its source.
- Each functional group MUST carry a `README.md` role declaration (role + functionalities + when_to_use + triggers) so its purpose is explicit and reusable.

## The inbox YAML is the tracker + brain

It describes everything in the gateway (description, contains, when_to_use) and tracks which INBOX evolutions have processed which gateway items under which aspects (processed block) so nothing is reprocessed blindly. Its `gateway:` block MUST mirror the on-disk tree exactly (every FG present, none duplicated — LAWS 2 & 4).
