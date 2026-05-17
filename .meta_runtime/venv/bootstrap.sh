#!/usr/bin/env bash
# ─── Agentic OS — Python Venv Bootstrap (Linux/macOS) ──────────────────────────
# Creates .meta_runtime/venv/.venv if missing, then installs requirements.txt.
# Idempotent: safe to call on every boot.
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$DIR/.venv"
REQ_FILE="$DIR/requirements.txt"
PY_EXE="$VENV_DIR/bin/python"
PYVENV_CFG="$VENV_DIR/pyvenv.cfg"

resolve_host_python() {
    if command -v python3 >/dev/null 2>&1; then echo "python3"; return; fi
    if command -v python  >/dev/null 2>&1; then echo "python";  return; fi
    echo "[bootstrap] ERROR: no host Python 3 found. Install via your package manager." >&2
    exit 1
}

venv_healthy() {
    [ -x "$PY_EXE" ] || return 1
    [ -f "$PYVENV_CFG" ] || return 1
    # Detect cross-OS pollution (Windows paths in pyvenv.cfg).
    if grep -qiE 'C:\\|Scripts\\\\python' "$PYVENV_CFG"; then return 1; fi
    "$PY_EXE" -c "import sys" >/dev/null 2>&1 || return 1
    return 0
}

if venv_healthy; then
    echo "[bootstrap] venv healthy at $VENV_DIR"
else
    if [ -d "$VENV_DIR" ]; then
        echo "[bootstrap] removing stale/cross-OS venv at $VENV_DIR"
        rm -rf "$VENV_DIR"
    fi
    HOST_PY="$(resolve_host_python)"
    echo "[bootstrap] creating venv with $HOST_PY"
    "$HOST_PY" -m venv "$VENV_DIR"
    "$PY_EXE" -m pip install --upgrade pip --disable-pip-version-check >/dev/null
    if [ -f "$REQ_FILE" ]; then
        echo "[bootstrap] installing requirements.txt"
        "$PY_EXE" -m pip install -r "$REQ_FILE" --disable-pip-version-check
    fi
    echo "[bootstrap] venv ready at $VENV_DIR"
fi

# Preserve folder shape in git.
touch "$VENV_DIR/.gitkeep"
