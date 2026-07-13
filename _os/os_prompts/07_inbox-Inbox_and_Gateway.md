# Inbox & Gateway

The inbox is where the user drops data for the system to learn from or act on: competitor data, references, research material, source documents, anything.

## Disk layout

```
<entity>-inbox/                          raw user drops (IMMUTABLE source — detected, described, then MOVED out)
<entity>-inbox/.<entity>-inbox_gateway/  agent-curated:
  <Pillar>/                             pillar folder (dynamic; matches runtime pillars — NOT the inbox drop name)
    Architecture/                       FIXED aspect #1 (always present, even if empty)
    Capabilities/                       FIXED aspect #2 (always present, even if empty)
    Monetization/                       FIXED aspect #3 (always present, even if empty)
      <functional_group>/              items grouped by what they DO (function, not source)
        <item>                          the routed copy of a raw inbox file
```

For the OS entity the concrete path is: `_os/os-inbox/.os-inbox_gateway/`.

CRITICAL — pillars are NOT inbox drop-names. The 3 raw inbox drops (`best uses`, `capabilities`, `complex systems`) are SOURCE buckets, not pillars. Pillars come from the entity runtime (`os-runtime.yaml -> pillars`). A drop's contents are routed INTO the gateway under the correct runtime pillar + aspect, never left sitting in a pillar named after the drop.

## THE FIVE ROUTING LAWS (canonical — referenced by os_prompt 05 and the inbox/runtime YAMLs)

These five laws govern EVERY inbox routing + EVERY evolution move. They are the single source of truth; the YAML trackers and the on-disk gateway must always reflect them. Do not invent a different grouping.

- **LAW 1 — Route into the gateway, by runtime pillar/aspect/FG.** Every pillar folder contains EXACTLY the 3 FIXED aspects — `Architecture/`, `Capabilities/`, `Monetization/` (defined in os_prompt 01) — and all 3 must exist under every pillar even when empty, so the structure is uniform. Items never stay grouped the way the agent found them in the raw inbox. The raw drop name is NEVER a pillar, aspect, or functional group. Route every item to `<Pillar>/<aspect>/<functional_group>/<item>` where Pillar/Aspect come from the entity runtime and os_prompt 01, never from the drop name. The daemon scaffolds all 3 fixed aspect folders under each pillar and flags any missing one into fill_queue.gateway.
- **LAW 2 — COPY from immutable source; keep a dated raw archive; gateway is the single CURATED copy.** The raw inbox drop is the IMMUTABLE source of truth. On every ingest it is snapshotted (copied, never moved) into a dated frozen archive `_<entity>-inbox/_drained_raw_YYYY-MM-DD/` — a permanent provenance trail + recovery point. Routing then MOVES each item out of the live raw drop into the gateway `<Pillar>/<aspect>/<functional_group>/`; the gateway holds the single CURATED live copy. Never keep two CURATED copies of the same item, and the dated archive is a frozen record (not a drop the daemon re-flags). If the same content appears in two gateway locations, one of them is a duplication bug — collapse it to the correct-by-function location, do not leave both. (LAW 2 in one line: raw = immutable image, dated archive = audit trail, gateway = curated live copy.)
- **LAW 3 — Route per-item, never by folder (no batching).** Routing is decided ONE ITEM AT A TIME. When a raw drop contains sub-folders or many files: read and analyse EVERY sub-item individually; for each item decide its OWN destination (correct runtime pillar + aspect + functional group). Items from the SAME raw sub-folder may land in DIFFERENT pillars/aspects/groups. Example: a raw folder with 3 sub-folders × 40 items -> read all 120; 20 belong with others already under `Capabilities/...`, 10 from another folder move together to a different group, 5 are unrelated and each goes to its own relevant destination. Decide by item meaning, not by parent folder.
- **LAW 4 — Functional groups named by FUNCTION, roles declared.** Name a group by what items DO / the function they serve — NEVER by source, tool, vendor, person, or version. Each functional group MUST carry a role declaration (a `README.md` stating its role + functionalities + when_to_use + triggers). BAD (source/tool/version-derived — do not use): `miscellaneous`, `coding rules and tools`, `operational_workflows`, `planning_and_gaps`, `complex systems`, `ops_and_automation`, `setup-matt-pocock-skills`, `migrate-to-shoehorn`, `obsidian-vault`, `swift-concurrency-6-2`. GOOD (function-declared — keep these): `interaction_guidelines`, `profile_and_setup`, `security_and_boundaries`, `agent_personas`, `code_and_build`, `ui_styling`. Constraints: same-pillar, same-aspect only; sub-grouping optional and unbounded; before creating a group, check siblings for a functional match and reuse an existing group rather than spawning a near-duplicate named after its source.
- **LAW 5 — Evolution OBJS drive every evolution move (see os_prompt 05).** Before ANY evolution move the agent MUST read the entity runtime `evolution_objectives` and keep them in scope for the whole run. Objectives are DIRECTIONAL GOALS / focus areas, NOT specific tasks or adopt-X steps, and they are generated from the entity's `os_prompts` + project `*-data/` contents cross-referenced with Pillars/Aspects — NEVER from inbox evolution output. Full definition lives in os_prompt 05 (MANDATORY FIRST READ: evolution_objectives).

## The flow (4-stage: discovery → raw → analysing → gateway)

1. User drops raw items into the inbox folder.
2. Daemon (a) FROZEN-COPIES the live drop into the dated immutable archive `_<entity>-inbox/_drained_raw_YYYY-MM-DD/` (LAW 2 provenance trail, copied never moved), and (b) writes a full `discovery[drop]` tree (every file at any depth, drop-root-relative paths) for each new drop — the source for item decisions. No semantics here; `discovery` is a ledger only. Flagged in `fill_queue.inbox.discovery`.
3. Agent PROMOTES each discovery drop into `raw` by deciding item boundaries: for each real item (a single file or a tight group that must move together) create `raw[item]` with its member `paths` (drop-root-relative) and `status: needs_discovery`. `paths` is the single source of truth for which member files an item has.
4. Agent PROMOTES each `raw` item into `analysing`: reads the members (by `paths`), and writes semantics ONCE per member — `description`, `contains`, `when_to_use` — into a MERGED `members[path]` record that also carries `raw_path` (the source, frozen at archive) and `status` (`pending`→`routed`/`rejected`/`dupe`). ONE record per file = semantics + state + source. Nothing is split into a separate `files` map. Large drops stay resumable (LAW 3, per-item). Flagged in `fill_queue.inbox.analysing`.
5. Deduplication gate: before an item can route, its `content_hash` must not already exist in `gateway`, `analysing`, or `rejected` (else → `dupe`, blocked). Enforced.
6. Agent sets `disposition: route | reject`. If `reject` → frozen copy to `rejected` ledger (hash + reason + full member records, recoverable, never deleted). If `route` and all required fields complete AND pass quality gates (see below) → `status: ready_to_route` with `suggested_pillar/aspect/fg` (LAW 1/4).
7. Agent MOVES the item file into the gateway folder `<Pillar>/<aspect>/<functional_group>/` and sets `disposition: route` with `suggested_pillar/aspect/fg`. On the next daemon sync, `route_analysing_to_gateway` carries the item semantics PLUS every member's merged record (`raw_path` + `description`/`contains`/`when_to_use` + `status`) into the gateway YAML tracker, and STAMPS each member's `gateway_path` (where it landed) + `status: routed` on BOTH the gateway copy and the source-side `analysing` record — so each file tracks its source and its progress end-to-end (`members[path].gateway_path` is the audit trail from raw source to gateway destination). The live raw drop is then drained (marked `delivered`); the immutable originals remain in the dated archive. (LAWS 1–2–3–4.)
8. INBOX evolution runs consume gateway items per pillar/aspect, always honoring `evolution_objectives` (LAW 5).

## Per-item routing (NO batching — LAW 3)

Routing is decided ONE ITEM AT A TIME, never by folder. When a raw drop contains sub-folders or many files:
- Read and analyse EVERY sub-item individually.
- For each item decide its own destination: the correct runtime pillar + aspect + functional group.
- Items from the SAME raw sub-folder may land in DIFFERENT pillars/aspects/groups. Example: a raw folder with 3 sub-folders × 40 items -> read all 120; 20 belong with others already under `Capabilities/...`, 10 from another folder move together to a different group, 5 are unrelated and each goes to its own relevant destination. Do not move by parent-folder; move by item meaning.
- After routing, the source raw drop should be empty (delivered). The immutable originals are preserved in the dated `_drained_raw_YYYY-MM-DD/` archive, so draining the live drop is safe — never leave the live drop as a duplicate of the gateway.

## Semantics quality gates (enforced in `analysing`, carried into gateway)

These gates block an item from reaching `ready_to_route` / the gateway. They are the daemon's structural guarantee that gateway fields are never re-stored as provenance text (the problem we saw with `contains: moved from raw into the gateway`):

- **`contains` MUST describe the actual things inside the item, never its location or history.** Rejected: file lists (`README.md`, `SECURITY.md`), paths, other items' names, or provenance like `moved from raw`, `drained to archive`, `raw drop`. Accepted: concrete examples of what the item covers (e.g. "PRP plan/PR/PRD/implement/commit workflow; code-review checklist; verify/validate skills").
- **`when_to_use` MUST be concrete use-cases**, not a template. Rejected: `Use this skill when the task involves…`, `Use this when…`. Accepted: real scenarios ("when the user must pick one option out of several — e.g. 'which library should we use?'").
- **`description` MUST be a substantive summary**, not a placeholder.

The daemon flags any `analysing` entry that fails a gate into `fill_queue.inbox.analysing` so the agent fixes it before routing.

## Functional groups (named by FUNCTION, never by source — LAW 4)


Name a group by what items DO / the function they serve — NOT where they came from. BAD examples (source-derived, do not use): `miscellaneous`, `coding rules and tools`, `operational_workflows`, `planning_and_gaps`, `complex systems`, `ops_and_automation`, `setup-matt-pocock-skills`, `migrate-to-shoehorn`, `obsidian-vault`, `swift-concurrency-6-2`. GOOD examples (function-declared, keep these): `interaction_guidelines`, `profile_and_setup`, `security_and_boundaries`, `agent_personas`, `code_and_build`, `ui_styling`.
- Same-pillar, same-aspect only.
- Sub-grouping optional and unbounded.
- Before creating a group, check siblings for a functional match (avoid fragmentation). Reuse an existing functional group rather than spawning a near-duplicate named after its source.
- Each functional group MUST carry a `README.md` role declaration (role + functionalities + when_to_use + triggers) so its purpose is explicit and reusable.

## The inbox YAML is the tracker + brain

It describes everything in the gateway (description, contains, when_to_use) and tracks which INBOX evolutions have processed which gateway items under which aspects (processed block) so nothing is reprocessed blindly. Its `gateway:` block MUST mirror the on-disk tree exactly (every FG present, none duplicated — LAWS 2 & 4).
