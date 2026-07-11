# BUILD SPEC — Manager-Owned Daemon Lifecycle + Config Two-Way Sync

> Status: APPROVED, ready to build. Self-contained: a fresh agent with ZERO prior
> context can build strictly from this file. Suggest-only until the human says go.
> Workspace root: C:\Users\BAB AL SAFA\Desktop\plugboot
> Delete this file once implemented + folded into an os_prompt/ADR.

═══════════════════════════════════════════════════════════════════════
0. PLATFORM GROUND TRUTH (read before touching anything)
═══════════════════════════════════════════════════════════════════════
- OS: Windows. The Hermes `terminal` tool runs through git-bash (MSYS), POSIX
  syntax. Native paths `C:\...` and MSYS `/c/Users/...` both work.
- PYTHON — CRITICAL: the bare `python`/`python3` alias is a broken MS Store stub.
  The venv at `.stash/.venv/venv/Scripts/python.exe` EXISTS but is INCOMPLETE
  (only ruamel, NO uvicorn/starlette) — do NOT use it.
  The ONLY working interpreter (uvicorn 0.44.0 + starlette 1.0.0 + ruamel) is:
      C:\Users\BAB AL SAFA\AppData\Local\Python\pythoncore-3.14-64\python.exe
  The currently-running daemon (PID verified live) uses exactly this interpreter,
  invoked as: `<pythoncore-3.14> .infra/backend/daemon.py` from the workspace root.
  Every process the manager spawns MUST use this interpreter. Set env
  PYTHONIOENCODING=utf-8 on spawn (matches meta_run.sh behavior).
- NEVER kill the Hermes gateway process. NEVER `taskkill /IM python.exe` (it kills
  the Hermes interpreter + this agent). Kill only tracked daemon PIDs by number.
- Verify edits INLINE (execute_code or `<pythoncore-3.14> -c "..."`). Do NOT write
  hermes-verify-*.py temp files (banned in this workspace).

═══════════════════════════════════════════════════════════════════════
1. ROLE MODEL (the architecture — do not deviate)
═══════════════════════════════════════════════════════════════════════
- AGENT  → at boot, checks config.yaml `manager_boot`; starts (or stops) the
  MANAGER accordingly. Never starts daemon.py directly. Never broad-kills python.
- MANAGER (new: .infra/backend/manager.py) → MANAGEMENT ONLY. Spawns daemon.py as
  a SUBPROCESS, tracks its PID, stops/restarts/reaps it by PID, enforces the
  config→lifecycle rules, watches config.yaml, reaps rogue daemons. It does NOT
  import daemon's `app`, does NOT run uvicorn, does NOT do sync. Pure supervisor.
- DAEMON (.infra/backend/daemon.py) → does ALL the actual work: 5s sync loop +
  serve dashboard + SSE + its own uvicorn launch. Its `__main__` block stays the
  ACTIVE launch path — just invoked BY the manager instead of by the agent.
  ONE new capability added: a `--no-server` (headless) flag (see §4).

Gate chain, top to bottom:
    manager_boot        → AGENT decides whether to start the MANAGER at all
    sync_daemon         → MANAGER decides whether the DAEMON runs at all
    dashboard.enabled   → MANAGER decides SERVED (uvicorn) vs HEADLESS (--no-server)
    dashboard.auto_open → MANAGER opens browser once when served
    dashboard.port      → MANAGER passes port to the daemon (PB_PORT env)

═══════════════════════════════════════════════════════════════════════
2. CONFIG FIELD SEMANTICS (config.yaml — schema at .infra/schemas/config-schema.yaml)
═══════════════════════════════════════════════════════════════════════
RENAME + REPURPOSE: `boot` → `manager_boot` everywhere (see §6 for the full checklist).
  RETIRED MEANING (delete it): the old `boot` meant "do agents auto-execute the
  AGENTS.md boot steps without asking?" That semantic is INTENTIONALLY DROPPED — it
  is already covered by `autonomy:true` + Law #12 (implement-don't-suggest / no-ask /
  full-perms), so the old flag was redundant and is read nowhere in code (verified:
  only the UI toggle + schema referenced it). Nothing is lost by repurposing the key.
  NEW MEANING: agent-side master switch for the MANAGER layer.
    manager_boot: true  → at boot the agent STARTS the manager (idempotent — no-op
                          if a manager is already live via its own lock).
    manager_boot: false → agent does NOT start the manager; if one is already
                          running, the agent STOPS it (manager stop → daemon stops too).

Field tiers (enforced server-side in /api/config POST, §3):
- TWO-WAY (config <-> dashboard, reuse EXISTING model — no new architecture):
      current_window, dashboard.theme, manager_boot
  Existing mechanism already does two-way: config.yaml is truth → daemon re-reads
  every 5s → dashboard writes via /api/config POST → frontend polls every 6s.
- CONFIG-ONLY (dashboard displays, cannot write) — EXCEPT the FALSE carve-outs below:
      sync_daemon, dashboard.auto_open, dashboard.port, dashboard.enabled
  CARVE-OUTS (the ONLY UI-permitted writes to these fields — see the 3 buttons, §6b):
    * dashboard.enabled MAY be set to FALSE from the UI ("Shut down dashboard").
    * sync_daemon      MAY be set to FALSE from the UI ("Shut down daemon").
    Setting either TRUE from the UI is rejected (config-only — turn back on via
    config.yaml). port/auto_open are never UI-writable.
- ENGINE-MANAGED (unchanged, already guarded): freshness, metrics, fill_queue.
- DAEMON RESTART is NOT a config field. The UI "Restart daemon" button routes
  through a one-shot command sentinel the manager watches (§6b + §3b), because the
  browser talks to the DAEMON (HTTP) and cannot address the MANAGER directly.

═══════════════════════════════════════════════════════════════════════
3. STEP 1 — /api/config POST guard (daemon.py)
═══════════════════════════════════════════════════════════════════════
LOCATION: daemon.py `async def api_config(request)`, lines 815-834. The POST branch
currently deep-sets ANY key_path with no restriction (lines 816-831).

ADD an allow-list check BEFORE the write (after reading key_path/value, before
`data = read_yaml(CONFIG)`):

    TWO_WAY = {("current_window",), ("dashboard","theme"), ("manager_boot",)}
    kp = tuple(key_path)
    allowed = kp in TWO_WAY
    # FALSE carve-outs: the 3 dashboard control buttons (§6b) may only turn these OFF.
    if kp == ("dashboard","enabled") and value is False:   # "Shut down dashboard"
        allowed = True
    if kp == ("sync_daemon",) and value is False:          # "Shut down daemon"
        allowed = True
    # entity-level status/autonomy/toolboxes toggles keep working: they are
    # 2-element paths [<entity>, <field>] where <entity> is a project key, NOT a
    # top-level reserved field. Preserve current behavior:
    RESERVED_TOP = {"current_window","manager_boot","sync_daemon","dashboard",
                    "status","autonomy","toolboxes","inbox-gateway_delivery",
                    "missions","freshness"}
    if len(kp) == 2 and kp[0] not in RESERVED_TOP:
        allowed = True   # per-project entity toggle, e.g. ["project_x","status"]
    if not allowed:
        return JSONResponse({"ok": False, "error": f"'{'/'.join(map(str,key_path))}' is config-only"}, status_code=403)

NOTE: verify against index.yaml `projects` at build time — the entity carve-out
must not accidentally let a rogue top-level key through. If projects are keyed
differently, tighten the check to `kp[0] in <known project keys>`.

ACCEPTANCE:
- POST {"path":["dashboard","theme"],"value":"light"} → 200, config.yaml updated.
- POST {"path":["current_window"],"value":"os"} → 200.
- POST {"path":["manager_boot"],"value":false} → 200.
- POST {"path":["dashboard","enabled"],"value":false} → 200 (Shut down dashboard).
- POST {"path":["dashboard","enabled"],"value":true} → 403.
- POST {"path":["sync_daemon"],"value":false} → 200 (Shut down daemon).
- POST {"path":["sync_daemon"],"value":true} → 403 (turn back on via config.yaml).
- POST {"path":["dashboard","port"],"value":9000} → 403.
- Existing entity toggles (["<project>","status"]) → still 200.

═══════════════════════════════════════════════════════════════════════
3b. STEP 1b — daemon RESTART command endpoint (daemon.py) + manager watch
═══════════════════════════════════════════════════════════════════════
WHY: the "Restart daemon" button can't be a config flip (nothing to toggle) and
the browser can't call the manager directly (it only speaks HTTP to the daemon).
Bridge with a one-shot COMMAND SENTINEL file the manager polls.

DAEMON side — add a tiny endpoint:
    async def api_command(request):   # POST /api/command  body {"cmd":"restart_daemon"}
        body = await request.json()
        cmd = body.get("cmd")
        if cmd != "restart_daemon":
            return JSONResponse({"ok": False, "error": "unknown cmd"}, status_code=400)
        # write a sentinel the manager watches; do NOT self-restart (manager owns lifecycle)
        (WORKSPACE / ".stash" / "pids" / "daemon.cmd").write_text(
            json.dumps({"cmd": "restart_daemon", "at": now_iso()}), encoding="utf-8")
        return JSONResponse({"ok": True})
  Register in `routes`: Route("/api/command", api_command, methods=["POST"]).

MANAGER side — in the watch loop (§5), each tick check for the sentinel:
    cmdfile = .stash/pids/daemon.cmd
    if cmdfile exists:
        data = json.load(cmdfile); cmdfile.unlink()   # consume one-shot
        if data.get("cmd") == "restart_daemon":
            stop_daemon(); spawn_daemon(desired_state(read_config()))
  (Same code path as `manager.py --restart`, just triggered by the sentinel.)

ACCEPTANCE:
- POST /api/command {"cmd":"restart_daemon"} → 200, writes .stash/pids/daemon.cmd.
- Within ~5s the manager consumes the file (it disappears) and the daemon pid
  changes (verify via manager.py --status before/after); UI reachable again.
- Unknown cmd → 400. Sentinel is consumed exactly once (never restart-loops).

═══════════════════════════════════════════════════════════════════════
4. STEP 2 — daemon.py `--no-server` (headless) flag
═══════════════════════════════════════════════════════════════════════
WHY: the sync loop is started ONLY inside the Starlette `lifespan` (daemon.py
line 1063: `asyncio.create_task(sync_loop())`). So "no uvicorn" must NOT mean "no
sync" — headless must still run the sync loop standalone.

EDIT the `__main__` block (lines 1098-1117). Add argv parsing:

    if __name__ == "__main__":
        import sys, socket, os as _os, asyncio as _aio
        headless = "--no-server" in sys.argv
        PORT = int(_os.environ.get("PB_PORT", "8000"))
        if headless:
            # sync loop only, no web server. Run the async sync_loop directly.
            print(f"[daemon] PlugBoot HEADLESS (sync only). Workspace: {WORKSPACE}")
            _aio.run(sync_loop())
        else:
            import uvicorn
            probe = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            try:
                probe.bind(("127.0.0.1", PORT))
            except OSError:
                probe.close()
                print(f"[daemon] ABORT: port 127.0.0.1:{PORT} already in use.")
                raise SystemExit(1)
            probe.close()
            uvicorn.run(app, host="127.0.0.1", port=PORT)

ACCEPTANCE:
- `<pythoncore-3.14> daemon.py --no-server` → prints HEADLESS, no port bound
  (netstat shows nothing on the port), YAML freshness still ticks every 5s.
- `<pythoncore-3.14> daemon.py` (no flag) → unchanged: binds port, serves UI.

═══════════════════════════════════════════════════════════════════════
5. STEP 3 — manager.py (new file: .infra/backend/manager.py)
═══════════════════════════════════════════════════════════════════════
Runs under pythoncore-3.14 (see §0). Pure supervisor. Uses only stdlib (subprocess,
socket, os, sys, time, json, pathlib) + ruamel.yaml for reading config (already
available). Do NOT import daemon.

PATHS (resolve relative to workspace root = parents[2] of __file__):
    CONFIG   = <root>/config.yaml
    PIDFILE  = <root>/.stash/pids/daemon.pid       (dir exists, has .gitkeep)
    MGRLOCK  = <root>/.stash/pids/manager.lock
    DAEMON   = <root>/.infra/backend/daemon.py
    PY       = C:\Users\BAB AL SAFA\AppData\Local\Python\pythoncore-3.14-64\python.exe
               (make overridable via env PB_PYTHON; fall back to sys.executable)

PID REGISTRY (daemon.pid) — JSON: {"pid": int, "port": int, "mode": "served"|"headless", "started": iso}

CLI CONTRACT (argv):
    manager.py            → start/ensure: idempotent. If manager already live
                            (MGRLOCK held by a live PID) → print "manager already
                            running" and exit 0 (NO second supervisor). Else
                            acquire lock, reconcile daemon to config, then enter
                            watch loop (foreground; the agent launches it with
                            terminal background=true).
    manager.py --restart  → stop the tracked daemon, then start it fresh per config.
                            Exit 0. (This is the agent's ONLY sanctioned daemon
                            restart path.)
    manager.py --stop     → stop the tracked daemon AND release the manager lock
                            (full teardown). Exit 0.
    manager.py --status   → print JSON {manager_live, daemon_pid, daemon_alive,
                            port, mode} and exit 0.

CORE FUNCTIONS:
- is_alive(pid): Windows-safe liveness. Use `os.kill(pid, 0)` in try/except, OR
  `tasklist /FI "PID eq <pid>"` parse. Prefer the tasklist check on Windows.
- read_config(): ruamel load CONFIG; return dict.
- desired_state(cfg):
      if not cfg.get("sync_daemon"): return ("off", None)
      port = int(cfg.get("dashboard",{}).get("port", 8000))
      if cfg.get("dashboard",{}).get("enabled"): return ("served", port)
      return ("headless", port)
- spawn_daemon(mode, port):
      env = os.environ.copy(); env["PB_PORT"]=str(port); env["PYTHONIOENCODING"]="utf-8"
      args = [PY, str(DAEMON)] + (["--no-server"] if mode=="headless" else [])
      p = subprocess.Popen(args, cwd=<root>, env=env,
                           stdout=<append .stash/logs/daemon_heartbeat.log>,
                           stderr=STDOUT, creationflags=CREATE_NO_WINDOW)
      write PIDFILE {pid:p.pid, port, mode, started:now}
      if mode=="served" and cfg auto_open: wait until port accepts a socket
         (retry ~10x/0.5s), then webbrowser.open(f"http://127.0.0.1:{port}")
- stop_daemon(): read PIDFILE; if pid alive → taskkill /PID <pid> /F (or
  os.kill + terminate the Popen if we own the handle). Kill ONLY that pid.
  Remove PIDFILE. NEVER taskkill /IM python.exe.
- reconcile(): read config → desired = desired_state(). Read PIDFILE → current.
      if desired mode == "off": if daemon alive → stop_daemon(). done.
      elif no live tracked daemon → spawn_daemon(desired).
      elif current.mode != desired.mode OR current.port != desired.port →
           stop_daemon(); spawn_daemon(desired).   # reshape on change
      else: leave running.
- reap_rogues(): find daemon processes NOT equal to our tracked pid and kill them.
      Identify a daemon by: command line contains "daemon.py" AND pid != tracked.
      Enumerate via: `wmic process where "name='python.exe'" get ProcessId,CommandLine`
      is ABSENT on this box — use PowerShell fallback (VERIFIED working):
         powershell -NoProfile -Command "Get-CimInstance Win32_Process |
           Where-Object {$_.CommandLine -like '*daemon.py*'} |
           Select-Object ProcessId,CommandLine | ConvertTo-Json"
      Parse JSON, for each pid != tracked_pid → taskkill /PID <pid> /F.
      SAFETY: only ever kill pids whose command line literally contains
      "daemon.py". Never match on "python" alone. The manager's own pid and the
      Hermes interpreter never match this filter.

WATCH LOOP (default `manager.py` after acquiring lock):
    while True:
        check_command_sentinel()   # §3b: consume .stash/pids/daemon.cmd if present
        reconcile(); reap_rogues()
        sleep(WATCH_INTERVAL = 5s)   # picks up config port/enabled/sync_daemon changes
    Refresh MGRLOCK (write own pid) on start; on clean --stop remove it.
    Manager self-single-instance: on start, if MGRLOCK exists and holds a LIVE pid
    → exit 0 ("already running"). If stale (dead pid) → reclaim.

ACCEPTANCE:
- Fresh start: `manager.py` (bg) → spawns daemon served on config port; daemon.pid
  written; browser opens if auto_open; UI reachable.
- Second `manager.py` while first alive → prints "already running", exits 0, no 2nd
  daemon (verify: only ONE daemon.py process, ONE port listener).
- Set config sync_daemon:false → within ~5s manager stops the daemon (no listener,
  no daemon.py process, PIDFILE gone).
- Set sync_daemon:true + dashboard.enabled:false → manager spawns headless: sync
  ticks (freshness increments) but NO port listener.
- Set dashboard.enabled:true → manager reshapes to served; port listens again.
- Change dashboard.port → manager restarts daemon on the new port within ~5s.
- Manually launch a second `daemon.py` by hand → within ~5s reap_rogues kills it,
  tracked daemon survives, agent/Hermes untouched.
- `manager.py --restart` → daemon pid changes, service continuity restored.
- `manager.py --stop` → daemon gone, MGRLOCK gone.

═══════════════════════════════════════════════════════════════════════
6. STEP 4 — RENAME boot → manager_boot (full checklist)
═══════════════════════════════════════════════════════════════════════
Grep-verified current occurrences of `boot`:
- config.yaml line ~13: `boot: true`  → `manager_boot: true`
- .infra/schemas/config-schema.yaml line 21: REPLACE the whole line
    `boot: true | false # Does agents automaticly execute the boot steps...`
  with:
    `manager_boot: true | false # Master switch for the MANAGER layer: does the agent start the daemon-manager at boot? (false = agent stops any running manager). Replaces the retired 'boot' auto-boot flag, now covered by autonomy + Law #12.`
- .infra/frontend/index.html line 20: the KPI toggle
    :class="{warn: !config.boot}" @click="patchConfig(['boot'], !config.boot)"
    x-text="config.boot ? 'ON' : 'OFF'"  ...label "Boot:"
  → replace all `config.boot` with `config.manager_boot`, patchConfig(['boot'],...)
    → patchConfig(['manager_boot'],...), relabel "Manager Boot:".
- Search the whole tree for any other `boot` references (agent prompts, docs):
    search_files pattern="\bboot\b" — update config-key usages only; do NOT rename
    the unrelated "BOOT sequence"/"BOOT-0..8" concepts in AGENTS.md/os_prompts.
- daemon.py: `boot` is NOT read anywhere today (dead key), so no daemon code change
  for the rename — but grep to confirm before finishing.

ACCEPTANCE: config.yaml has manager_boot; dashboard KPI reads/writes manager_boot
(toggle in UI flips config.yaml and vice-versa via the 6s poll); no stale `config.boot`
left in frontend; BOOT-sequence wording untouched.

═══════════════════════════════════════════════════════════════════════
6b. STEP 4b — replace the sync_daemon toggle with 3 control buttons (index.html)
═══════════════════════════════════════════════════════════════════════
REMOVE the existing single toggle at index.html line 21 (the `config.sync_daemon`
KPI: `@click="patchConfig(['sync_daemon'], !config.sync_daemon)"`).

REPLACE it with THREE explicit action buttons in the same KPI/header area. All
three flow THROUGH the manager (never touch the daemon process directly):

  1) "Restart daemon" → calls a new app.js method restartDaemon():
        await fetch('/api/command', {method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({cmd:'restart_daemon'})});
     (Hits §3b endpoint → writes sentinel → manager restarts the daemon.)
     Optional UX: confirm() first; toast "restarting…".

  2) "Shut down daemon" → calls shutdownDaemon():
        this.patchConfig(['sync_daemon'], false);
     (§3 carve-out allows false. Manager sees sync_daemon:false within ~5s and
     stops the daemon entirely. Re-enable is config-only — by design.)

  3) "Shut down dashboard" → calls shutdownDashboard():
        this.patchConfig(['dashboard','enabled'], false);
     (§3 carve-out allows false. Manager reshapes daemon to HEADLESS: sync keeps
     running, web server stops. Re-enable is config-only — by design.)

  Add matching methods in app.js next to patchConfig() (~line 997). Keep the
  existing patchConfig()/loadConfig() plumbing; these are thin wrappers.

  DISPLAY-ONLY state (optional but recommended): keep a small read-only indicator
  showing current sync_daemon / dashboard.enabled values (greyed, no @click) so the
  user still SEES status even though the fields are config-only for turning ON.

ACCEPTANCE:
- The old sync_daemon toggle is gone; three buttons render in its place.
- "Restart daemon" → daemon pid changes within ~5s (manager --status before/after),
  UI recovers.
- "Shut down daemon" → config.yaml sync_daemon:false; within ~5s no daemon process,
  no port listener.
- "Shut down dashboard" → config.yaml dashboard.enabled:false; within ~5s daemon is
  headless (sync freshness still ticks, port no longer listens).
- None of the three can turn anything back ON (that stays config-only).


═══════════════════════════════════════════════════════════════════════
7. STEP 5 — theme + current_window two-way (frontend, existing model)
═══════════════════════════════════════════════════════════════════════
THEME (app.js) — today theme is localStorage-only and never touches config:
  - line 47: `this.theme = localStorage.getItem('pb-theme') || 'light';`
  - line 59: toggleTheme() writes localStorage only.
  - index.html line 13: `<body ... :data-theme="theme">` (this stays — it's the
    render binding).
  CHANGE:
  - In loadConfig() (app.js ~62-68), after `this.config = c;` add:
        if (c.dashboard && c.dashboard.theme) this.theme = c.dashboard.theme;
    (config is the source of truth; localStorage becomes a fallback only.)
  - toggleTheme() → after flipping this.theme, call
        this.patchConfig(['dashboard','theme'], this.theme);
    keep the localStorage write as a cache. The 6s poll (loadConfig) carries
    external config.yaml theme edits back into the UI automatically.
  NOTE: dashboard.theme is in the TWO_WAY allow-list (§3) so this POST is accepted.

CURRENT_WINDOW (app.js) — bind the entity focus to config.current_window:
  - In loadConfig(), after setting config, if `c.current_window` is set and differs
    from `this.entity`, adopt it: `this.entity = c.current_window; this.switchEntity();`
    (guard against a reload loop — only switch when it actually changed).
  - Where the user switches entity in the UI (switchEntity trigger / the entity
    selector), after switching call `this.patchConfig(['current_window'], this.entity);`
  current_window is in TWO_WAY (§3) so the POST is accepted; the 6s poll carries
  external edits back.

ACCEPTANCE:
- Toggle theme in UI → config.yaml dashboard.theme changes; reload page → theme
  persists from config (not just localStorage).
- Edit dashboard.theme in config.yaml → within ~6s the UI theme flips.
- Switch entity in UI → config.yaml current_window updates.
- Edit current_window in config.yaml → within ~6s the UI focus follows.

═══════════════════════════════════════════════════════════════════════
8. STEP 6 — AGENTS.md updates
═══════════════════════════════════════════════════════════════════════
File: <root>/AGENTS.md. Under "BOOT SEQUENCE", after BOOT-7 add:

  - BOOT-8 Lifecycle (last step): read config.yaml `manager_boot`.
    * manager_boot: true  → start the MANAGER: run `.infra/backend/manager.py`
      via the working interpreter
      (C:\Users\BAB AL SAFA\AppData\Local\Python\pythoncore-3.14-64\python.exe)
      as a BACKGROUND process. It is idempotent — if a manager is already live it
      no-ops, so starting every boot is safe. The manager OWNS the daemon: it
      launches/stops/reshapes it per config.yaml (sync_daemon, dashboard.enabled,
      auto_open, port) and reaps rogue daemons.
    * manager_boot: false → do NOT start the manager; if one is running, stop it
      with `manager.py --stop`.
    * NEVER start daemon.py directly. NEVER broad-kill python. To restart the
      daemon use `manager.py --restart` — the ONLY sanctioned daemon control path.

Also amend BOOT-2's line to note: "`sync_daemon` is enforced by the MANAGER, not
the agent — the agent only gates the manager via `manager_boot`."

═══════════════════════════════════════════════════════════════════════
9. BUILD ORDER (each step independently testable; do in order)
═══════════════════════════════════════════════════════════════════════
  1. §3  /api/config guard          (daemon.py)   — pure guard, adds false carve-outs
  2. §3b /api/command restart endpt  (daemon.py)   — additive; restart sentinel
  3. §4  --no-server flag            (daemon.py)   — additive
  4. §6  rename boot→manager_boot    (config/schema/index.html) — mechanical
  5. §6b 3 control buttons           (index.html + app.js) — replaces sync toggle
  6. §7  theme + current_window      (app.js)      — frontend, existing model
  7. §5  manager.py                  (new)         — the supervisor (incl. §3b watch)
  8. §8  AGENTS.md BOOT-8            (docs)        — wire the agent to the manager
  (Order note: manager.py after the daemon endpoints/flag + UI so it exercises
   finished pieces; AGENTS.md final so the boot ritual only points at working code.
   §6b buttons depend on §3 carve-outs + §3b endpoint being in place first.)

═══════════════════════════════════════════════════════════════════════
10. INVARIANTS — must NOT regress (verify at the end)
═══════════════════════════════════════════════════════════════════════
- daemon.py 5s content-aware sync, smart_write, _IO_LOCK, read cache — unchanged.
- entity/board/toolbox/patch endpoints, SSE chat (/agent/say, /events),
  /api/ecosystem, evolution readiness + archiving gates, toolbox reconcile — all
  unchanged.
- Shipped config (manager_boot:true, sync_daemon:true, dashboard.enabled:true,
  auto_open:true) reproduces today's served behavior.
- Exactly ONE daemon process at any time; agent + Hermes interpreter never killed.
- Verify all edits inline (execute_code / pythoncore -c); no hermes-verify-*.py files.
