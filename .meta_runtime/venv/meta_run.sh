#!/usr/bin/env bash
# ─── Agentic OS — Cross-Platform Python Launcher (Linux/macOS) ────────────────
# Ensures the workspace venv exists, loads .env, then forwards args to python.
# Usage:
#   ./.meta_runtime/venv/meta_run.sh .meta_brain/meta_sync.py
#   ./.meta_runtime/venv/meta_run.sh -m notebooklm <command>
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY_EXE="$DIR/.venv/bin/python"
ENV_FILE="$DIR/.env"

# 1. Ensure venv is built and healthy.
bash "$DIR/bootstrap.sh"

# 2. Load workspace .env into the current process (key=value pairs only).
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

# 3. Forward all args to the venv python.
exec "$PY_EXE" "$@"
