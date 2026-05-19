#!/usr/bin/env bash
# ─── Agentic OS — Cross-Platform Python Launcher (Linux/macOS) ────────────────
# Ensures the workspace venv exists, loads .env, then forwards args to python.
# Usage:
#   ./.meta_runtime/venv/meta_run.sh .meta_brain/meta_sync.py
#   ./.meta_runtime/venv/meta_run.sh -m notebooklm <command>
#
# G-CTRL-AUDIT-3 hardening: when bootstrap.sh fails, it writes a structured
# `.bootstrap_failed` sentinel in .venv/. We surface that failure here with
# a human-readable error and a non-zero exit, so agents stop dead instead of
# silently failing on a missing interpreter.
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY_EXE="$DIR/.venv/bin/python"
ENV_FILE="$DIR/.env"
FAIL_SENTINEL="$DIR/.venv/.bootstrap_failed"

# 1. Ensure venv is built and healthy. Bootstrap is set -e, so a real failure
#    propagates here. We still defensively check the failure sentinel below
#    in case bootstrap was killed mid-write or something else dropped one.
if ! bash "$DIR/bootstrap.sh"; then
    echo "[meta_run] ERROR: bootstrap failed (see above)." >&2
    if [ -f "$FAIL_SENTINEL" ]; then
        echo "[meta_run] Failure record:" >&2
        cat "$FAIL_SENTINEL" >&2
    fi
    exit 2
fi

# 2. G-CTRL-AUDIT-3: belt-and-braces. Even if bootstrap.sh somehow returned 0,
# refuse to exec when the failure sentinel exists or the interpreter is
# missing. This converts a silent EXEC failure into a clear stderr message.
if [ -f "$FAIL_SENTINEL" ]; then
    echo "[meta_run] ERROR: workspace venv is in a failed state." >&2
    echo "[meta_run] Failure record:" >&2
    cat "$FAIL_SENTINEL" >&2
    echo "[meta_run] Fix the underlying issue and rerun, or:" >&2
    echo "  rm -rf '$DIR/.venv' && bash '$DIR/bootstrap.sh'" >&2
    exit 2
fi
if [ ! -x "$PY_EXE" ]; then
    echo "[meta_run] ERROR: $PY_EXE is missing or not executable after bootstrap." >&2
    echo "[meta_run] Try: rm -rf '$DIR/.venv' && bash '$DIR/bootstrap.sh'" >&2
    exit 2
fi

# 3. Load workspace .env into the current process (key=value pairs only).
if [ -f "$ENV_FILE" ]; then
    set -a
    # shellcheck disable=SC1090
    while IFS= read -r line; do
        case "$line" in
            ''|\#*) continue ;;
            *=*) export "$line" ;;
        esac
    done < "$ENV_FILE"
    set +a
fi

# 3b. Redirect Python's bytecode cache out of the substrate (G-PYCACHE-DRIFT
# fix). Without this, every import scatters `__pycache__/` directories
# under .meta_brain/ — version-specific bytecode polluting the logic pillar.
# We point PYTHONPYCACHEPREFIX at one workspace-local cache dir under
# .meta_runtime/ so all bytecode lives in the runtime pillar (where caches
# belong, per Hierarchy.md). Unconditional assignment (G-PYCACHE-LEAK fix):
# the previous version was conditional to allow `.env` overrides, but that
# also let stale values leak from the parent shell. The override path was
# never used; reliable canonical placement matters more.
WORKSPACE_ROOT="$(cd "$DIR/../.." && pwd)"
PYCACHE_PREFIX="$WORKSPACE_ROOT/.meta_runtime/__pycache__"
mkdir -p "$PYCACHE_PREFIX"
export PYTHONPYCACHEPREFIX="$PYCACHE_PREFIX"

# 4. Forward all args to the venv python.
exec "$PY_EXE" "$@"
