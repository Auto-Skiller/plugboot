# 🛡️ Daemon Guard Plan — "Never Again" Permanent Fixes

> **Goal**: Eliminate the class of gaps where duplicate daemons run concurrently or multiple processes bind the same port.
>
> **Root cause**: Daemons + dashboard server were started manually (outside `boot.py` supervisor), bypassing the existing singleton lock. No pre-flight check existed. No graceful shutdown on session end.

---

## 📋 Gap Taxonomy (What Can Go Wrong)

| # | Gap | Severity | Example |
|---|-----|----------|---------|
| G1 | **Duplicate daemon** — two instances of same engine running | 🔴 Critical | Two `meta_engine.py --daemon` writing YAML concurrently → race condition |
| G2 | **Port collision** — two servers binding the same port | 🔴 Critical | Three `server.py` on :8000 → requests served by random instance |
| G3 | **Orphaned daemon** — daemon survives session end | 🟠 High | User closes terminal, daemon keeps running with stale code |
| G4 | **Stale PID file** — `boot.pid` references dead PIDs | 🟡 Medium | Supervisor thinks daemons are alive but they're zombies |
| G5 | **Partial startup** — some daemons started, others not | 🟡 Medium | Meta engine running but scaler engine crashed |
| G6 | **Manual start bypass** — user starts daemons outside supervisor | 🔴 Critical | `python meta_engine.py --daemon` in a terminal → no lock, no tracking |

---

## 🏗️ Fix Architecture

### Layer 1: Supervisor (`boot.py` — already exists, needs hardening)

`boot.py` already has:
- ✅ Lock socket on port 49999 (singleton supervisor)
- ✅ PID registry in `.meta/boot.pid`
- ✅ Auto-restart of dead daemons
- ✅ Graceful shutdown on SIGINT

**What it needs:**
- [ ] **Health check API** — expose `/health` so external tools can verify supervisor is alive
- [ ] **Port pre-check** — before spawning a server, verify the target port is free
- [ ] **Stale PID cleanup** — on startup, kill any process matching old PID entries that isn't the current supervisor's child
- [ ] **Windows: detect orphaned daemons** — scan `Win32_Process` for python processes with `--daemon` flag matching our engine scripts, kill if not in PID registry

### Layer 2: Daemon Self-Guard (in each engine)

Each `*_engine.py` should:
- [ ] **Write its own PID file** on startup: `.meta/engine/<name>.pid`
- [ ] **Check for existing instance** before starting — if PID file exists and PID is alive, exit with error
- [ ] **Remove PID file** on clean exit (atexit handler)
- [ ] **Log startup** with PID and timestamp for audit

### Layer 3: Dashboard Server Guard (`server.py`)

`server.py` should:
- [ ] **Pre-bind port check** — attempt to bind to port 8000; if it fails, print clear error and exit
- [ ] **Write PID file** — `.meta/engine/dashboard.pid`
- [ ] **Self-check endpoint** — `/api/health` returning `{status:"ok",uptime:...}`

### Layer 4: Startup Script (the "one command" entry point)

Create `.meta/engine/start_all.ps1`:
1. **Pre-flight scan** — find all python processes matching engine patterns
2. **Kill stale instances** — any engine process not tracked by current `boot.pid`
3. **Port check** — verify 8000 is free
4. **Launch supervisor** — `boot.py` which then manages all daemons
5. **Health verification** — wait 5s, check that all expected processes are alive
6. **Report** — print status table

### Layer 5: Shutdown Script

Create `.meta/engine/stop_all.ps1`:
1. Read `boot.pid`
2. Send SIGTERM to supervisor (it will gracefully stop children)
3. Wait 5s
4. Force-kill any remaining engine processes
5. Remove PID files
6. Report

### Layer 6: Boot Sequence Integration

Update `AGENTS.md` boot sequence:
- [ ] **BOOT-01.5** — after verify_boot, run a "daemon sanity check": read `boot.pid`, verify all PIDs alive, kill duplicates
- [ ] **Session start hook** — if daemons are already running, verify they match current code (hash check or file modification time)

---

## 📁 Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `.meta/engine/start_all.ps1` | **CREATE** | One-command startup with pre-flight |
| `.meta/engine/stop_all.ps1` | **CREATE** | One-command graceful shutdown |
| `.meta/engine/daemon_guard.py` | **CREATE** | Shared module: PID file mgmt, port check, process scan |
| `.meta/engine/boot.py` | **MODIFY** | Add port pre-check, stale cleanup, Windows orphan scan |
| `.meta/engine/dashboard/backend/server.py` | **MODIFY** | Add port pre-bind, PID file, `/api/health` |
| `.meta/engine/engines/meta_engine.py` | **MODIFY** | Add self-guard PID file |
| `.meta/engine/engines/pipeline_scaler_engine.py` | **MODIFY** | Add self-guard PID file |
| `.meta/engine/engines/projects_engine.py` | **MODIFY** | Add self-guard PID file |
| `.meta/engine/engines/pipeline_hustler_engine.py` | **MODIFY** | Add self-guard PID file |
| `.meta/engine/verify_boot.py` | **MODIFY** | Add duplicate detection check |
| `AGENTS.md` | **MODIFY** | Add BOOT-01.5 daemon sanity check |

---

## 🔄 Execution Order

### Phase 1: Shared Module (no dependencies)
- [ ] Create `.meta/engine/daemon_guard.py` — the foundation everything else imports

### Phase 2: Daemon Self-Guard (each engine independently)
- [ ] Add self-guard to `meta_engine.py`
- [ ] Add self-guard to `pipeline_scaler_engine.py`
- [ ] Add self-guard to `projects_engine.py`
- [ ] Add self-guard to `pipeline_hustler_engine.py`

### Phase 3: Server Guard
- [ ] Add port pre-bind + PID file + health endpoint to `server.py`

### Phase 4: Supervisor Hardening
- [ ] Harden `boot.py` with stale cleanup + Windows orphan scan

### Phase 5: Entry Scripts
- [ ] Create `start_all.ps1`
- [ ] Create `stop_all.ps1`

### Phase 6: Boot Sequence + Verification
- [ ] Update `verify_boot.py` with duplicate detection
- [ ] Update `AGENTS.md` boot sequence

### Phase 7: Test
- [ ] Test: start → verify no duplicates
- [ ] Test: start again (while running) → should be idempotent (kill old, start new)
- [ ] Test: kill supervisor → daemons should be orphaned, then re-start should clean up
- [ ] Test: duplicate daemon manually → `start_all.ps1` should detect and kill it

---

## 🧪 Verification Criteria

After implementation, the following must be true:

1. Running `start_all.ps1` twice in a row results in exactly one instance of each daemon
2. Manually starting a duplicate engine → `start_all.ps1` detects and kills it
3. Port 8000 can only be bound by one server.py instance
4. Closing the terminal / killing supervisor → `start_all.ps1` cleans up orphans and restarts cleanly
5. `verify_boot.py` reports duplicate detection status
6. Boot sequence BOOT-01.5 passes only when daemon set is clean

---

*Created: 2026-06-22 | Author: OWL | Status: ✅ IMPLEMENTED*

## Implementation Summary (2026-06-22)

All layers implemented:
- **Layer 1**: `daemon_guard.py` — PID file mgmt, port check, orphan scan, self-guard decorator
- **Layer 2**: Self-guard in all 4 `*_engine.py` + `server.py` (port pre-bind + PID + /api/health)
- **Layer 3**: `boot.py` — orphan scan + stale PID cleanup on startup
- **Layer 4**: `start_all.ps1` — idempotent launcher with pre-flight
- **Layer 5**: `stop_all.ps1` — graceful shutdown + cleanup
- **Layer 6**: `verify_boot.py` — BOOT-03b duplicate detection
- **Docs**: README.md, meta_os.yaml, CONTROLER.yaml, Concurrency_and_Locking.md updated
