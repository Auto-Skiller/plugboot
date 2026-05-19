# 🔀 Concurrency Model — Multi-Session Safety

**Purpose:** Single consolidated reference for how the Agentic OS stays correct under multi-hour autonomous operation with multiple agents running in parallel. Before this doc existed, the rules were spread across `Rules_And_Considerations §11`, `Evolution_Protocol §11/§13/§14`, `Session_Template §4`, `Controler_Guide §5/§7`, and `BOOT_CONTRACTS.constants`. New agents had to assemble the picture themselves and routinely missed laws — the gap that caused this doc to be created.
**When to use:** Consult before any operation that writes to `CONTROLER.yaml`, `meta_router.yaml`, a router under `.meta_routing/`, a pipeline state file, or `pending_evolutions.yaml`. Also consult when designing a new sync engine or auto-archiver.

---

## 1. The Five Invariants

Every fix in this section closes a class of corruption that was observed (or proven possible) under concurrent operation. They are listed in dependency order — earlier invariants make later ones cheaper to enforce.

### 1.1 Lock Before Mutate
The master sync acquires an advisory file lock at `.meta_brain/.meta_routing/.sync.lock` before running. Concurrent agents wait up to `BOOT_CONTRACTS.constants.sync_lock_timeout_seconds` and back off; they never run two re-assemblies in parallel. A lock older than `sync_lock_stale_seconds` is treated as abandoned and force-released.

- **Implementation:** `_shared/sync_lock.py` (`acquire()` / `release()` / `inspect()`).
- **Single source of truth for the path:** `engine_bootstrap.workspace_lock_path(workspace_root)`. Do not hardcode the path anywhere else.
- **Sub-engine etiquette:** when the master holds the lock, it sets `META_SYNC_LOCK_HELD=1` so child engines skip re-acquisition (would deadlock).

### 1.2 Atomic Writes Only
All YAML writes go through `_shared/atomic_io.atomic_write_yaml` (write to `<file>.<pid>.tmp`, `os.replace` over the target). A killed or crashed sync can never leave a half-written router or controller. Tmp orphans are swept by `--validate`.

- **What this protects:** `meta_router.yaml`, `CONTROLER.yaml`, every router under `.meta_routing/`, every pipeline router and ledger under `_pipelines/*/.{*}_brain/`, `BOOT_CONTRACTS.yaml`, and `pending_evolutions.yaml`.
- **What this does NOT protect:** in-place hand edits with text editors. The lock above prevents the engine from racing those, but the user is on their own if two humans edit the same file.

### 1.3 Multi-Session Linkage
Pipeline state files MUST track sessions in an `active_sessions: []` list, not a singular `active_session` field. The singular field is preserved as a backwards-compatibility mirror of the first entry only. Engines resolving "the active session" must continue to walk ALL matches — not the first.

- **Why:** persistence-exhausted sessions can sit in `paused` while a new session opens. With a singular field, the new one would orphan the old. With the list, both surface to telemetry and neither gets lost.
- **Cap:** `BOOT_CONTRACTS.constants.archived_sessions_index_max` caps the visible archive index in `CONTROLER.archived_sessions` so the controller stays readable; the on-disk archive itself is unbounded.

### 1.4 Vocabulary Discipline
Every status string an engine writes back to disk MUST be a member of the vocabulary declared in the corresponding router schema:
- Sessions: `active | paused | completed | archived` (declared in `milestones.yaml#session_schema`).
- Goals: `pending | in-progress | blocked | done | archived` (declared in `milestones.yaml#goal_schema`).
- Pipelines (CONTROLER projection): `active | idle | stale`.

Persistence-exhausted sessions go to `paused` with `metadata.persistence.exhausted: true`. Never write `pended` — it was the original incident that prompted this law and would silently break schema validation forever.

If an engine ever needs a state outside the vocabulary, the schema MUST be amended FIRST and the rule documented here.

### 1.5 Progress Provenance
Stale-pending detection uses a stamped `execution.state.last_progress_at` that updates ONLY when actual progress changes. File mtime is a lossy proxy because the engine itself rewrites the goal file every cycle (idempotent stamping), masking real staleness from human reviewers.

The corresponding stale threshold (`BOOT_CONTRACTS.constants.pending_goal_stale_days`) is the only stale-pending threshold in the system. The legacy `goal_progress_stale_days` was removed because it was declared but unused — its presence created drift potential.

---

## 2. Atomic Append for `pending_evolutions.yaml`

Multiple agents may queue evolution proposals during a long autonomous run. Naive append (read → mutate → write) races and clobbers. The contract is:

1. Acquire the master sync lock (`SYNC_LOCK_PATH`) before append, with the same `sync_lock_timeout_seconds` budget.
2. Read the current file with `load_yaml`.
3. Mutate the `pending` list locally.
4. Write back via `atomic_write_yaml`.
5. Release the lock.

If the agent is already holding the lock (master sync is mid-cycle and queueing a proposal as a side effect), `META_SYNC_LOCK_HELD=1` signals "skip re-acquisition" — same etiquette as the sub-engines.

A single helper, `_shared/state_helpers.append_pending_evolution(proposal)`, encapsulates this so callers can't forget a step. Hand-written append code is forbidden.

---

## 3. Freshness Contracts (Cross-Reference)

Every router and state file in the workspace stamps a `freshness:` block at write time:
```yaml
freshness:
  last_synced: <ISO timestamp>
  fresh_until: <last_synced + threshold_seconds>
  status: fresh
  threshold_seconds: <BOOT_CONTRACTS.constants.router_freshness_max_seconds>
```
Agents reading a router mid-session compare `now()` against `fresh_until`. Expired = re-run sync before consuming.

Files covered:
- `meta_router.yaml`
- `CONTROLER.yaml`
- `BOOT_CONTRACTS.yaml`
- All `.meta_routing/*.yaml` (milestones, toolboxes, pipelines, projects, meta_runtime)
- All inner pipeline files: `_pipelines/*/.{*}_brain/{*}_router.yaml` and `.{*}_routing/*.yaml`

`master --validate` walks all of them; any expired one is `[ERR]`, missing block is `[WARN]`.

---

## 4. Engine Anti-Recurrence Patterns (Cross-Reference)

The full table of "what broke before / what now prevents recurrence" lives in `Controler_Guide.md` under **Engine Anti-Recurrence Patterns (v5.3)**. That section is the canonical history. This doc is the canonical *forward-looking* contract — read it first for what to do; read the table for why the rule exists.

---

## 5. Verification Checklist

Before considering any concurrency-related change "done":

1. `meta_sync.py --validate` exits with **0 warnings, 0 errors**.
2. Run the master sync twice in quick succession — second run is a no-op (idempotent).
3. Simulate a stale lock: touch `.sync.lock` with mtime in the past, run sync — must auto-recover, not deadlock.
4. Verify every file you wrote went through `atomic_write_yaml` — no direct `open(..., 'w')` calls on tracked YAML.
5. Confirm any new status string you wrote is a member of the schema vocabulary.

If any of these fails, the change has reintroduced a class of bug this doc was created to prevent.
