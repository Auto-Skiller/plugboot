# Changelog

All notable changes to PlugBoot are documented here. Format: newest first.

## 2026-07-09 10:20 — README: CHANGELOG pointer
- Added a CHANGELOG pointer link near the top of `README.md` (after the hero
  image, before "The problem"): `📝 Changelog: see CHANGELOG.md ...`.

## 2026-07-09 10:15 — recent_events: flat strings (not split time/event)
- `daemon.py` normaliser now writes `recent_events` as flat strings
  `'DD-MM-YYYY HH:MM "event"'` (newest-first, cap 10), matching the existing
  `os_prompts` docs convention `[DATE] TYPE: desc`. Legacy `{time, event}` dicts
  are migrated to this string form on next sync (ISO timestamp -> `DD-MM-YYYY HH:MM`).
- `runtime-schema.yaml`: `recent_events` example updated to the string format.
- CHANGELOG corrected (the earlier "now `{time, event}` dicts" line was wrong).

## 2026-07-09 10:05 — Schema cleanup (vars removal follow-up)
- Removed stale `vars` from `runtime-schema.yaml` (both the `metrics.fill_queue.vars`
  entry and the `fill_queue.vars` list). Aligns schema with daemon (vars was already
  removed from code + runtime). Now schema, daemon, and runtime all agree: no `vars`.
- Confirmed `pillars` / `evolution_objectives` (the data blocks, not the metrics
  rollup) conform to the schema: `{actives: [string], validated: {total, active,
  <name>: {...}}, suggestions: {total, <name>: {...}}}`. Metrics rollup reads them
  correctly (actives=len, validated/suggestions=total). No change needed there.

## 2026-07-09 10:00 — Daemon hardening + runtime restructure

### Daemon (`.infra/backend/daemon.py`)
- **Port-guard (single-instance):** daemon probes `127.0.0.1:8000` at startup;
  if taken, prints `ABORT ... Exiting to avoid conflict.` and exits (`SystemExit(1)`).
  Prevents ghost daemons fighting over the same YAML files. Verified: a 2nd launch
  self-aborts.
- **Atomic writes:** `write_yaml` now uses a `ruamel.yaml.YAML()` instance (no
  PyYAML `allow_unicode` kwarg) + temp-file + `os.replace`. Stops torn reads.
- **`reconcile_toolboxes` bug fix:** declared `flagged = []` (was undefined → every
  sync crashed). Self-heals by dropping any non-domain key.
- **Runtime restructure:** `sync_entity` writes canonical key order
  `freshness → metrics → review_queue → backlog → pillars → evolution_objectives →
  fill_queue → recent_events`.
- **Metrics (B1, move-based):** `review_queue.resolved` / `backlog.done` auto-bump
  when items leave those lists (external removals caught; counters survive restarts).
  Seen-set + counters persisted in hidden sidecar `.<prefix>-seen-cache.yaml` (NOT
  inside the runtime YAML, keeping `metrics` clean).
- **`detect_fill_gaps`:** per-entity data key — OS uses `os_prompts`, projects use
  `data`. Hybrid `os_prompts/data` never written. Added `gateway` category.
- **`scaffold_all_gaps`:** no longer scaffolds `toolboxes` (reconciled from disk);
  iterates `os_prompts`/`data` (not the removed hybrid key).
- **`vars` removed** from `fill_queue` — dead placeholder (always `[]`, never
  populated). KISS cleanup.

### Runtime (`_os/os-runtime.yaml`)
- New `metrics` block below `freshness` (review_queue, backlog, pillars
  [actives/validated/suggestions], evolution_objectives [same], fill_queue).
- `recent_events` are now flat strings `'DD-MM-YYYY HH:MM "event"'`, newest-first, capped at 10.
  (Legacy `{time, event}` dicts are migrated to this form on next sync.)
- `fill_queue` uses `os_prompts` key (no hybrid); `vars` removed.

### Docs (surgical, no behavior change)
- `README.md`: `python` daemon start → `py -3` (was contradicting Law 11).
- `02_laws-Hard_Laws.md` + `AGENTS.md`: Law 4 now lists new flag types (empty
  pillars/evolution, toolbox metadata gaps).
- `06_toolboxes-Toolboxes.md`: daemon auto-builds registry from disk.
- `07_inbox-Inbox_and_Gateway.md`: daemon scaffolds missing gateway folders.

### Schema (`.infra/schemas/runtime-schema.yaml`)
- Updated to new key order, `metrics` block, timestamped `recent_events`,
  `os_prompts`/`data` keys (comment: never the hybrid `os_prompts/data`).

## 2026-07-09 (earlier) — Initial sync engine
- Daemon scaffolds every fill_queue category, detects empty pillars/evolution,
  trims recent_events to 10, auto-applies backlog GAP-1, reconciles toolboxes from
  disk, applies Law 11 daemon-state reconciliation.
