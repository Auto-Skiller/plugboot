# 🚦 Concurrency & Locking Model

---

## 1. The Five Invariants

Every rule in this section prevents a class of state corruption under concurrent operation. They are listed in dependency order.

### 1.1 Lock Before Mutate
The sync daemon acquires an advisory file lock before writing to any tracked YAML. Concurrent agents wait and back off; two write cycles never run in parallel on the same file. A lock older than its stale threshold is treated as abandoned and force-released.

- **Implementation:** `.infra/backend/safe_write.py` (uses `safe_write_yaml` with tmp+replace for atomic writes).
- **Sub-engine etiquette:** When the master holds the lock, child engines skip re-acquisition (to prevent deadlock).

### 1.2 Atomic Writes Only
All YAML writes go through `safe_write_yaml` in `.infra/backend/safe_write.py` — write to `<file>.tmp`, then `os.replace` over the target. A crashed or killed daemon can never leave a half-written file. Tmp orphans are swept on next daemon start.

- **Files protected:** `system-board.yaml`, `<project>-board.yaml`, and all `*-index.yaml` files.
- **Not protected:** Hand edits with text editors. The lock prevents the engine from racing hand edits, but two humans editing the same file concurrently are on their own.

### 1.3 Vocabulary Discipline
Every status string written back to disk MUST be a member of the vocabulary declared in the schemas in `_shared/schemas/`. Valid values:
- **Missions:** `active | paused | completed | archived`
- **Goals/Tasks:** `blocked | pending | in-progress | completed`
- **Pipeline runs:** `active | paused | completed | archived`

If a new state is needed, the schema MUST be amended first and this rule updated. Never write ad-hoc status strings.

### 1.4 Progress Provenance
Stale-pending detection uses `last_progress_at` that updates ONLY when actual progress changes. File `mtime` is a lossy proxy because the daemon rewrites files idempotently every cycle, masking real staleness from reviewers.

---

## 2. Atomic Append for the Board Hub
Multiple agents may queue review requests or backlog events during a long autonomous run. The contract for appending to the board hub (e.g., `hub.review_queue`, `hub.backlog`):
1. Acquire the daemon lock before append.
2. Read the entity board with `load_yaml`.
3. Mutate the list locally.
4. Write back via `safe_write_yaml`.
5. Release the lock.

---

## 3. Freshness Model
The freshness rules (`last_synced` and `sync_status`) are maintained by the daemon but governed by the operational laws. 

---

## 4. Daemon Singleton & Process Safety

**Invariant: At most one instance of each daemon engine may run at any time.** Duplicate daemons cause concurrent YAML writes, race conditions, and silent data corruption.

### 4.1 PID File Contract
Each daemon engine writes a PID file in `.stash/pids/` on startup and removes it on exit:

- Dashboard server: `.stash/pids/dashboard.pid`
- Sync engine: `.stash/pids/engine.pid`

**Rules:**
1. Before entering main loop, read PID file. If PID is alive → **exit with error** (do not start duplicate).
2. Write PID file immediately after confirming no duplicate.
3. Remove PID file on clean exit (use `try/finally` or `atexit`).
4. PID file format: `{"pid": <int>, "started_at": "<ISO8601>", "engine": "<name>", "cmdline": "<string>"}`

### 4.2 Port Pre-Bind Check
Before binding to any network port, attempt to connect to it first. If already in use:
1. Print clear error: `"Port <N> is already in use — another <service> instance is running."`
2. Exit immediately. Do NOT attempt to steal the bound port.
- 8000: Dashboard server

### 4.3 Orphan Cleanup on Supervisor Start
The supervisor scripts (`.infra/backend/start_all.ps1` or `.sh`) scan for orphaned daemon processes on startup:
1. Cross-reference against PID registry (`.stash/pids/`).
2. Kill any untracked daemon process.
3. Clean stale PID files.

---

## 5. Verification Checklist

Before considering any concurrency-related change "done":
1. Confirm all writes went through `atomic_io.atomic_write_yaml` — no direct `open(..., 'w')` on tracked YAML.
2. Confirm any new status string is a member of the schema vocabulary.
3. Run the daemon twice in quick succession — second run must be a no-op (idempotent).
4. Confirm each engine writes a PID file on startup and removes it on exit.
