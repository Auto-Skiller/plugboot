# Controller System Audit — 2026-05-18

> **Scope:** Whole-system audit of the controller subsystem (CONTROLER.yaml,
> meta_router, meta_sync engine cascade, BOOT_CONTRACTS, all `.meta_routing/`
> rollups, `_shared/` helpers, scaler/hustler bridges, and the venv launcher).
>
> **Gate (Evolution_Protocol §6 Anti-Recurrence Law):**
> 1. Look at everything related ✅
> 2. Find gaps + enhancements together ✅
> 3. Identify the cause, not just the symptom ✅
> 4. Verify everything is correctly linked end-to-end ✅
> 5. Prove multi-session safety ✅

## Live state at audit start
- `meta_sync.py --validate` → 0 warnings, 0 errors AFTER manual venv rebuild.
- **Boot from a fresh clone failed** because the cross-platform launcher silently
  picked Python 3.9 on a host that also had 3.11/3.12 available, and
  `requirements.txt` requires `>=3.10` (greenlet 3.3.2, ruamel.yaml 0.19.1).
  Pip install errored, bootstrap returned non-zero, but the agent had no clear
  signal that boot had failed — the next `meta_run.sh` call silently failed
  too because `.venv/bin/python` did not exist.
- 18 identity files on disk, BOOT-00 validation matches (engine-stamped).
- All routers carry the `freshness:` block; all are fresh.

## Gap matrix — Gap → Root Cause → Permanent Fix

### G-CTRL-AUDIT-1 · Bootstrap silently picks unsupported Python
- **Symptom.** On a host with `python3 → 3.9` and `python3.12` available,
  `bootstrap.sh` chose 3.9, pip install failed (`greenlet==3.3.2 requires
  Python>=3.10`), and the venv was left half-built. The next launcher
  invocation then tried to exec a non-existent `.venv/bin/python` and the
  agent had to manually diagnose the failure.
- **Root cause (the *cause*, not the symptom).** `resolve_host_python()`
  walked `.python-version → python${mm} → python3 → python` with no
  minimum-version gate. It also performed no post-install validation that
  the venv was usable. Three latent bugs combined:
  1. No probe of what Python versions are actually on PATH; just first-match.
  2. No `>=` floor declared anywhere (the floor lives implicitly in the
     transitive deps of `requirements.txt`, which is the wrong place).
  3. No success sentinel verification — the bootstrap exited 0 even though
     the install failed because `set -e` did kill `pip install`, but
     `meta_run.sh` then ran `bash bootstrap.sh` (success exit code) and
     proceeded to the missing `python` binary.
- **Permanent fix (addresses the cause).**
  1. Declare the minimum supported Python version in **one place**:
     `BOOT_CONTRACTS.yaml#constants.required_python_min` (e.g. `"3.10"`).
  2. `bootstrap.sh` and `bootstrap.ps1`:
     - Read the floor from BOOT_CONTRACTS (yq-free awk parser; no Python
       dependency for first boot).
     - Probe **every** plausible interpreter on PATH (`python3.14 →
       python3.13 → python3.12 → python3.11 → python3.10 → python3 →
       python`), pick the **highest version that satisfies the floor**.
     - Reject 3.9 and below with a clear actionable error.
  3. After install, **verify** the venv by importing every top-level
     package in `requirements.txt`. Fail loud, drop a sentinel
     `.bootstrap_failed` file, and remove `.bootstrap_ok` so subsequent
     launcher calls cannot silently hop over a broken venv.
  4. `meta_run.sh` / `meta_run.ps1`:
     - Check for `.bootstrap_failed` before forwarding args; emit a
       human-readable failure with remediation steps.
     - Confirm `.venv/bin/python` (or `.venv/Scripts/python.exe`) exists
       and is executable before `exec`.
  5. `meta_sync.py --validate`: surface a `[WARN]` if the host's resolved
     Python is more than 2 minor versions ahead of `.python-version`
     (potential future-incompat) AND a `[ERR]` if it's below the floor.
- **Why this never recurs.** The floor is now data-driven (one knob in
  BOOT_CONTRACTS), the version probe is exhaustive, and the failure mode
  is observable (sentinel + clear stderr). A future Python release does
  not require a code change — only a single constant bump.

### G-CTRL-AUDIT-2 · Pipeline state files carry both `active_session` (singular) and `active_sessions[]` without a contract guarantee that they stay in sync
- **Symptom.** Both `scaler_state.yaml` and `hustler_state.yaml` carry
  the legacy singular field AND the canonical list. The Multi-Session
  Concurrency Law (Evolution_Protocol §11.LAW-12) requires the list as
  the source of truth and the singular as a "back-compat mirror of the
  first entry". Today this is documented in Session_Template.md §4 and
  enforced **opportunistically** in `scaler_state_sync.py` /
  `hustler_state_sync.py` (singular is set to `sessions[0]`). But:
  - The schema in `milestones.yaml#session_schema` does not codify the
    relationship between the two fields anywhere.
  - The CONTROLER allow-list (`BOOT_CONTRACTS.controler_schema`) does
    not include any anti-drift sweep for state-file singletons.
  - Hand-edits to either field can desynchronise them silently between
    syncs (one sync window = up to 30 min of drift).
- **Root cause.** The two-field shape is a **transitional contract**
  with no mechanical enforcement. The fixers exist in two engines but
  **no shared helper** owns the singular/plural relationship, so a third
  pipeline that copy-pastes the state-sync code is one edit away from
  drifting (the original cross-pollination audit caught exactly this
  kind of class).
- **Permanent fix.**
  1. Add `mirror_singular_session()` to `_shared/state_helpers.py`
     (new module). Both scaler and hustler state-syncs call it; the
     legacy fields become engine-derived from `state.active_sessions[0]`.
  2. `_shared/state_helpers.py` exposes `assert_session_mirror(state)`
     which raises if the singular and plural disagree mid-cycle. Engines
     call it after every mutation.
  3. `meta_sync.py --validate` walks every pipeline state file, reads
     `state.active_sessions[]`, and flags any disagreement with the
     singular fields as `[ERR]`. The audit becomes mechanical.
  4. Document the contract in `Session_Template.md §4` with a pointer
     to the helper.
- **Why this never recurs.** The next pipeline that needs state will
  import the helper instead of copy-pasting; the validate audit fails
  noisily on disagreement; the schema docs point at the live code.

### G-CTRL-AUDIT-3 · `meta_run.sh` does not propagate bootstrap failure
- **Symptom.** When `bootstrap.sh` (called inline by `meta_run.sh`) fails,
  `meta_run.sh` continues to `exec "$PY_EXE" "$@"`. If `.venv/bin/python`
  doesn't exist, exec fails and the agent sees an opaque "No such file
  or directory" with no remediation hint.
- **Root cause.** `set -euo pipefail` at the top of `meta_run.sh` *does*
  propagate the failure — but only if `bash "$DIR/bootstrap.sh"` returns
  non-zero. The previous bootstrap.sh exited 0 in many failure paths
  (e.g. `pip install` SIGKILL was treated as a benign exit because
  `set -e` only fires on `pip install -r`'s native error). And even when
  bootstrap exits non-zero, the agent had no human-readable wrapper.
- **Permanent fix.**
  1. `bootstrap.sh` writes `.venv/.bootstrap_failed` with a structured
     failure reason on every failure path (no Python found, install
     failed, smoke test failed). Removes it on success.
  2. `meta_run.sh` checks `.bootstrap_failed` before exec; if present,
     prints a structured error with the contents and exits 2.
  3. Identical logic in `bootstrap.ps1` / `meta_run.ps1`.
- **Why this never recurs.** Failure is now a recorded artifact, not a
  silent exit code. The next agent reading the workspace sees the
  failure on the next call instead of debugging blindly.

### G-CTRL-AUDIT-4 · BOOT_CONTRACTS does not declare a floor for `required_python_min`
- **Symptom.** Three places implicitly require ≥3.10:
  `requirements.txt` (transitive), `meta_sync.py`'s use of `pathlib.Path`
  features and `dict | None` typing, the round-trip ruamel.yaml loader.
  None of them are auditable.
- **Root cause.** No single source of truth for the minimum host
  interpreter version. Same root cause class as `goal_progress_stale_days`
  (a constant declared in code, not in BOOT_CONTRACTS).
- **Permanent fix.**
  1. Add `constants.required_python_min: "3.10"` to BOOT_CONTRACTS.
  2. Bootstrap reads it (awk-only parser).
  3. `meta_sync.py --validate` surfaces drift between the host interpreter
     and the required floor.
- **Why this never recurs.** Bumping the floor is a one-line edit in
  BOOT_CONTRACTS; bootstrap and validate both pick it up automatically.

### G-CTRL-AUDIT-5 · `meta_sync.py --validate` does not audit pipeline state singular/plural session mirroring
- **Symptom.** Today's `--validate` walks routers and identity, but does
  not read `_pipelines/*/state.yaml` to confirm `active_session` ==
  `active_sessions[0].session_name`. The audit can pass with two fields
  silently drifted.
- **Root cause.** The state files were added after the validate sweep
  was designed; `--validate` was never extended.
- **Permanent fix.** Add a state-file walk to `run_validate()` that
  uses the new `_shared/state_helpers.assert_session_mirror()`.

### G-CTRL-AUDIT-6 · Identity dead-token sweep doesn't include the deprecated `bootstrap.{ps1,sh}` direct invocation
- **Symptom.** The Universal_Portability_Standard §4 instructs humans
  to call `bootstrap.{sh,ps1}` directly on first boot. README echoes
  this. Both are correct under the **current** API. But if we ever
  fold bootstrap into the launcher (e.g. lazy-bootstrap on demand),
  identity docs would carry the dead command without the dead-token
  sweep flagging it.
- **Root cause (preventive, not currently broken).** The dead-token
  list is hand-curated. New deprecations rely on the agent remembering
  to add to the list.
- **Permanent fix (preventive enhancement).** Add a small contract
  block in BOOT_CONTRACTS: `deprecated_path_tokens:` listing every
  string that should not appear in identity docs. The dead-token sweep
  pulls from there. New deprecations become a one-line edit; the
  identity sweep widens automatically.

### G-CTRL-AUDIT-7 · `_pipelines/*/sub_engines/*.py` use `parent.parent.parent.parent.parent.parent` chains as fallback
- **Symptom.** Every per-pipeline sub-engine declares a 6-level parent
  chain "as fallback for early bootstrap" before importing
  `engine_bootstrap.find_workspace_root`. Once the shared layer is on
  disk (i.e. always, in normal operation), the chain is dead code that
  becomes wrong the moment the layout changes by even one level.
- **Root cause.** Defensive paranoia from the GAP-WORKSPACE-ROOT fix
  carrying the legacy fallback indefinitely.
- **Permanent fix (cleanup).** The `_shared/` layer is committed to
  the repo; if it's missing, *nothing* works. We can delete the
  fallback and rely on `find_workspace_root()` exclusively. If the
  shared layer is unreachable, the engine fails loud with a clear
  error instead of silently writing to the wrong root.

### G-CTRL-AUDIT-8 · Master sync stamp `last_updated` on `BOOT_CONTRACTS` but does not stamp it on inner pipeline routers
- **Symptom.** `scaler_router.yaml` and `hustler_router.yaml` both
  have a `last_updated` field. `scaler_sync.py` / `hustler_sync.py`
  refresh it. But the **per-pipeline sub-engines** (`scaler_state_sync`,
  `hustler_state_sync`, etc.) do not. If a sub-engine runs alone (test
  or recovery scenario) the router's `last_updated` lies.
- **Root cause.** The stamp is bound to the orchestrator, not the
  individual engines.
- **Permanent fix.** Move the stamp into the **state-write path**
  itself (every save_yaml of a state file refreshes its own metadata
  header). The orchestrator becomes the consumer, not the producer.

---

## Ranking + landing plan

Highest impact first; everything below is implemented in this PR:

1. ✅ **G-CTRL-AUDIT-1 / G-CTRL-AUDIT-3 / G-CTRL-AUDIT-4** — bootstrap +
   launcher hardening with BOOT_CONTRACTS-driven floor. Cross-OS.
2. ✅ **G-CTRL-AUDIT-2 / G-CTRL-AUDIT-5** — `_shared/state_helpers.py`
   + scaler/hustler state-sync wiring + `--validate` extension.
3. ✅ **G-CTRL-AUDIT-6** — `BOOT_CONTRACTS.deprecated_path_tokens:` block
   + dead-token sweep refactor.
4. ✅ **G-CTRL-AUDIT-7** — drop the legacy 6-level parent fallback.
5. ✅ **G-CTRL-AUDIT-8** — move `last_updated` into the state-write
   path so it cannot lie under multi-session execution.

## Multi-session safety verification

After all fixes:
- Two simulated agents calling `meta_sync.py` back-to-back: lock holds,
  second one waits, both finish cleanly, no double-write.
- `meta_sync.py --validate` is run on a clean repo: 0 warnings, 0 errors.
- `meta_sync.py --validate` is run on a repo with a deliberately
  desync'd `scaler_state.yaml` (`active_session: SES-A`, `active_sessions[0]:
  SES-B`): one `[ERR]`, exit code non-zero. Anti-drift gate holds.
- A bootstrap with no compatible Python on PATH: `bootstrap.sh` writes
  `.bootstrap_failed`, `meta_run.sh` exits 2 with the structured error.
  Next call sees the same error until the human installs a compatible
  Python.
