---
metadata:
  purpose: "Defines the multi-session concurrency architecture, atomic write contracts, and daemon locking for the event-driven sync engine."
  when_to_use: "Consult before any operation that writes to CONTROLER.yaml, any DB file, a pipeline state file, or the evolution queue."
---

# 🚦 Concurrency & Locking Model

---

## 1. The Five Invariants

Every rule in this section prevents a class of state corruption under concurrent operation. They are listed in dependency order.

### 1.1 Lock Before Mutate
The sync daemon acquires an advisory file lock before writing to any tracked YAML. Concurrent agents wait and back off; two write cycles never run in parallel on the same file. A lock older than its stale threshold is treated as abandoned and force-released.

- **Implementation:** `.meta/engine/_shared/sync_lock.py` (`acquire()` / `release()` / `inspect()`).
- **Sub-engine etiquette:** When the master holds the lock, child engines skip re-acquisition (to prevent deadlock).

### 1.2 Atomic Writes Only
All YAML writes go through `.meta/engine/_shared/atomic_io.py` — write to `<file>.<pid>.tmp`, then `os.replace` over the target. A crashed or killed daemon can never leave a half-written file. Tmp orphans are swept on next daemon start.

- **Files protected:** `CONTROLER.yaml`, all `.meta_os/meta_db/*.yaml`, all `.meta_os/meta_db/toolboxes_db/**/*.yaml`, all milestone session files.
- **Not protected:** Hand edits with text editors. The lock prevents the engine from racing hand edits, but two humans editing the same file concurrently are on their own.

### 1.3 Multi-Session Linkage
Milestone session files must track sessions in a `sessions: []` list, not a singular `active_session` field. Engines resolving "the active session" must walk ALL matches.

- **Why:** Persistence-exhausted sessions can sit in `paused` while a new session opens. A list ensures neither gets orphaned.

### 1.4 Vocabulary Discipline
Every status string written back to disk MUST be a member of the vocabulary declared in `milestones_shemas.yaml`. Valid values:
- **Sessions:** `active | paused | completed | archived`
- **Goals:** `active | pending | done | archived`
- **Pipeline status:** `active | idle | paused | archived`

If a new state is needed, the schema MUST be amended first and this rule updated. Never write ad-hoc status strings.

### 1.5 Progress Provenance
Stale-pending detection uses `last_progress_at` that updates ONLY when actual progress changes. File `mtime` is a lossy proxy because the daemon rewrites files idempotently every cycle, masking real staleness from reviewers.

---

## 2. Atomic Append for the Evolution Queue

Multiple agents may queue evolution proposals during a long autonomous run. The contract for appending to `metadata.evolution.queues.pending` in `.meta_os/meta_db/meta_os.yaml`:

1. Acquire the daemon lock before append.
2. Read `.meta_os/meta_db/meta_os.yaml` with `load_yaml`.
3. Mutate the `pending` list locally.
4. Write back via `atomic_write_yaml`.
5. Release the lock.

A single helper `.meta/engine/_shared/state_helpers.py` → `append_pending_evolution(proposal)` encapsulates this. Hand-written append code is forbidden.

---

## 3. Freshness Model

The freshness rules (`last_synced` and `status`) are maintained by the daemon but governed by the operational laws. For full freshness logic, refer to `State_and_Memory_Ops.md`.

---

## 4. Verification Checklist

Before considering any concurrency-related change "done":

1. Confirm all writes went through `atomic_io.atomic_write_yaml` — no direct `open(..., 'w')` on tracked YAML.
2. Confirm any new status string is a member of the schema vocabulary.
3. Run the daemon twice in quick succession — second run must be a no-op (idempotent).
4. Verify `freshness.status` returns to `fresh` after a write cycle completes.
