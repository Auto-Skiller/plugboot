#!/usr/bin/env bash
# ─── Agentic OS — Python Venv Bootstrap (Linux/macOS, v5.3) ───────────────────
# Creates .meta_runtime/venv/.venv if missing, then installs requirements.txt.
# Idempotent: safe to call on every boot. Uses a sentinel file (.bootstrap_ok)
# for fast-path skip on hot calls (G19). Honors .python-version when the
# matching python3.X is available (G17).
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$DIR/.venv"
REQ_FILE="$DIR/requirements.txt"
PY_EXE="$VENV_DIR/bin/python"
PYVENV_CFG="$VENV_DIR/pyvenv.cfg"
PYVER_FILE="$DIR/.python-version"
SENTINEL="$VENV_DIR/.bootstrap_ok"

resolve_host_python() {
    # G17: honor .python-version when a matching python3.X is on PATH.
    if [ -f "$PYVER_FILE" ]; then
        local pin
        pin="$(tr -d ' \r\n' < "$PYVER_FILE" || true)"
        if [ -n "$pin" ]; then
            local mm
            mm="$(printf '%s' "$pin" | awk -F. '{ if (NF>=2) printf "%s.%s", $1, $2 }')"
            if [ -n "$mm" ] && command -v "python${mm}" >/dev/null 2>&1; then
                echo "python${mm}"
                return
            fi
        fi
    fi
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

# G19: fast-path. Skip all checks if sentinel is fresh and requirements.txt
# hasn't been edited since.
fast_path() {
    [ -f "$SENTINEL" ] || return 1
    [ -x "$PY_EXE" ]   || return 1
    if [ -f "$REQ_FILE" ]; then
        local req_mtime sentinel_mtime
        req_mtime="$(stat -c %Y "$REQ_FILE" 2>/dev/null || stat -f %m "$REQ_FILE")"
        sentinel_mtime="$(stat -c %Y "$SENTINEL" 2>/dev/null || stat -f %m "$SENTINEL")"
        if [ "$req_mtime" -gt "$sentinel_mtime" ]; then return 1; fi
    fi
    return 0
}

if fast_path; then
    exit 0
fi

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

# Touch sentinel + gitkeep so git records the folder shape.
touch "$SENTINEL"
touch "$VENV_DIR/.gitkeep"
