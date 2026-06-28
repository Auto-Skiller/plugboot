---
metadata:
  name: concurrency-and-locking
  class: system/identity
  type: identity
  version: '1.0'
  schema_version: '1.0'
  freshness:
    status: active
    sync_count: 0
    last_synced_by: daemon
    last_synced: '2026-06-27T00:00:00'
credentials:
  description: Defines the multi-session concurrency architecture, atomic write contracts,
    and daemon locking for the event-driven sync engine.
  when_to_use: Consult before any operation that writes to .db/.system.board.yaml,
    any DB file, a pipeline state file, or the evolution queue.
  contains: execution_ops, task_management
---

# 🚦 Concurrency & Locking Model

---

## 1. The Five Invariants

Every rule in this section prevents a class of state corruption under concurrent operation. They are listed in dependency order.

### 1.1 Lock Before Mutate
The sync daemon acquires an advisory file lock before writing to any tracked YAML. Concurrent agents wait and back off; two write cycles never run in parallel on the same file. A lock older than its stale threshold is treated as abandoned and force-released.

- **Implementation:** `.infra/engine.py` (uses `safe_write_yaml` with tmp+replace for atomic writes).
- **Sub-engine etiquette:** When the master holds the lock, child engines skip re-acquisition (to prevent deadlock).

### 1.2 Atomic Writes Only
All YAML writes go through `safe_write_yaml` in `.infra/engine.py` — write to `<file>.tmp`, then `os.replace` over the target. A crashed or killed daemon can never leave a half-written file. Tmp orphans are swept on next daemon start.

- **Files protected:** `.db/.system.board.yaml`, all `.db/*.yaml`, all `.db/toolboxes.rollups/**/*.yaml`, all milestone session files.
- **Not protected:** Hand edits with text editors. The lock prevents the engine from racing hand edits, but two humans editing the same file concurrently are on their own.

### 1.3 Multi-Session Linkage
Milestone session files must track sessions in a `sessions: []` list, not a singular `active_session` field. Engines resolving "the active session" must walk ALL matches.

- **Why:** Persistence-exhausted sessions can sit in `paused` while a new session opens. A list ensures neither gets orphaned.

### 1.4 Vocabulary Discipline
Every status string written back to disk MUST be a member of the vocabulary declared in `.db/.schemas/milestones_schemas.yaml`. Valid values:
- **Sessions:** `active | paused | completed | archived`
- **Goals:** `active | pending | done | archived`
- **Pipeline status:** `active | idle | paused | archived`

If a new state is needed, the schema MUST be amended first and this rule updated. Never write ad-hoc status strings.

### 1.5 Progress Provenance
Stale-pending detection uses `last_progress_at` that updates ONLY when actual progress changes. File `mtime` is a lossy proxy because the daemon rewrites files idempotently every cycle, masking real staleness from reviewers.

---

## 2. Atomic Append for the Evolution Queue

Multiple agents may queue evolution proposals during a long autonomous run. The contract for appending to `runtime.evolution_queue` in `.db/.system.board.yaml`:

1. Acquire the daemon lock before append.
2. Read `.db/.system.board.yaml` with `load_yaml`.
3. Mutate the `runtime.evolution_queue` list locally.
4. Write back via `safe_write_yaml`.
5. Release the lock.

A single helper in `.infra/engine.py` handles this. Hand-written append code is forbidden.

---

## 3. Freshness Model

The freshness rules (`last_synced` and `status`) are maintained by the daemon but governed by the operational laws. For full freshness logic, refer to `State_and_Memory_Ops.md`.

---

## 4. Daemon Singleton & Process Safety

**Invariant: At most one instance of each daemon engine may run at any time.** Duplicate daemons cause concurrent YAML writes, race conditions, and silent data corruption.

### 4.1 PID File Contract

Each daemon engine writes a PID file on startup and removes it on exit:

| Engine | PID File |
|--------|----------|
| meta_engine | `.infra/engine.pid` |
| dashboard_server | `.infra/dashboard.pid` |

**Rules:**
1. Before entering main loop, read PID file. If PID is alive → **exit with error** (do not start duplicate).
2. Write PID file immediately after confirming no duplicate.
3. Remove PID file on clean exit (use `try/finally` or `atexit`).
4. PID file format: `{"pid": <int>, "started_at": "<ISO8601>", "engine": "<name>", "cmdline": "<string>"}`

### 4.2 Port Pre-Bind Check

Before binding to any network port, attempt to connect to it first. If already in use:
1. Print clear error: `"Port <N> is already in use — another <service> instance is running."`
2. Exit immediately. Do NOT attempt to steal the bound port.

**Protected ports:**
- 8000: Dashboard server
- 49999: Supervisor lock (boot.py)

### 4.3 Orphan Cleanup on Supervisor Start

The supervisor (`start_all.ps1`) scans for orphaned daemon processes on startup:
1. Query `Win32_Process` (WMI) for python processes with `--daemon` in command line
2. Cross-reference against PID registry (`boot.pid`)
3. Kill any untracked daemon process
4. Clean stale PID files

### 4.4 Idempotent Start Script

The entry point `.infra/start_all.ps1` must be safe to run any number of times:
1. Scan for stale processes → kill
2. Check ports → fail if occupied
3. Clean stale PID files
4. Launch supervisor
5. Verify all engines alive after 6s
6. Report status

### 4.5 Verification

```powershell
# Check no duplicates
Get-Process python | Where-Object { $_.CommandLine -match 'daemon|server.py' } | Group-Object { $_.CommandLine.Split('[-'[0] } | Where-Object { $_.Count -gt 1 }

# Check port
Get-NetTCPConnection -LocalPort 8000 | Select-Object LocalPort, OwningProcess, State

# Check PID files match live processes
Get-ChildItem .infra/*.pid | ForEach-Object { $pid = (Get-Content $_ | ConvertFrom-Json).pid; if (-not (Get-Process -Id $pid -ErrorAction SilentlyContinue)) { Write-Host "STALE: $_" } }
```

---

## 5. Verification Checklist

Before considering any concurrency-related change "done":

1. Confirm all writes went through `atomic_io.atomic_write_yaml` — no direct `open(..., 'w')` on tracked YAML.
2. Confirm any new status string is a member of the schema vocabulary.
3. Run the daemon twice in quick succession — second run must be a no-op (idempotent).
4. Verify `freshness.status` returns to `fresh` after a write cycle completes.
5. Confirm each engine writes a PID file on startup and removes it on exit.
6. Confirm `start_all.ps1` is idempotent (running twice = one instance each).
7. Confirm port pre-bind check works (starting server twice fails cleanly).
