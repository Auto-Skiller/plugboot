#!/usr/bin/env bash
# ─── Agentic OS — Python Venv Bootstrap (Linux/macOS, v5.5) ───────────────────
# Creates .meta_runtime/venv/.venv if missing, then installs requirements.txt.
# Idempotent: safe to call on every boot. Uses a sentinel file (.bootstrap_ok)
# for fast-path skip on hot calls (G19). Honors .python-version when the
# matching python3.X is available (G17).
#
# G-CTRL-AUDIT-1 / G-CTRL-AUDIT-3 / G-CTRL-AUDIT-4 hardening (this rev):
#   * Reads the minimum Python floor from BOOT_CONTRACTS.constants.required_python_min
#     (awk-only — no Python on the host required to bootstrap).
#   * Probes EVERY plausible interpreter on PATH and picks the highest version
#     that satisfies the floor (was: first-match-wins, which let 3.9 leak
#     through on hosts that also had 3.12).
#   * Smoke-tests the venv (imports the packages declared in requirements.txt)
#     after install. On any failure, drops a structured `.bootstrap_failed`
#     sentinel so meta_run.sh can stop dead with a human-readable error
#     instead of `exec`-ing a non-existent interpreter.
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$DIR/../.." && pwd)"
VENV_DIR="$DIR/.venv"
REQ_FILE="$DIR/requirements.txt"
PY_EXE="$VENV_DIR/bin/python"
PYVENV_CFG="$VENV_DIR/pyvenv.cfg"
PYVER_FILE="$DIR/.python-version"
SENTINEL="$VENV_DIR/.bootstrap_ok"
FAIL_SENTINEL="$VENV_DIR/.bootstrap_failed"
BOOT_CONTRACTS="$WORKSPACE_ROOT/.meta_brain/BOOT_CONTRACTS.yaml"

# G-CTRL-AUDIT-3: emit a structured failure record that meta_run.sh + agents
# can pick up next call. Also wipes the success sentinel so the fast-path
# can never hop over a broken venv.
fail_with() {
    local reason="$1"
    local detail="${2:-}"
    mkdir -p "$VENV_DIR" 2>/dev/null || true
    {
        echo "reason: $reason"
        echo "at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
        if [ -n "$detail" ]; then
            echo "detail: |"
            printf '%s\n' "$detail" | sed 's/^/  /'
        fi
    } >"$FAIL_SENTINEL" 2>/dev/null || true
    rm -f "$SENTINEL" 2>/dev/null || true
    echo "[bootstrap] FAIL: $reason" >&2
    if [ -n "$detail" ]; then
        echo "$detail" >&2
    fi
    exit 1
}

# G-CTRL-AUDIT-4: read the minimum Python floor from BOOT_CONTRACTS without
# requiring Python to parse it. Pure awk — works on every shipping macOS /
# Linux distribution. Falls back to 3.10 if BOOT_CONTRACTS is unreadable
# (matches the value declared in BOOT_CONTRACTS today).
read_min_python() {
    if [ -f "$BOOT_CONTRACTS" ]; then
        local val
        # Match `required_python_min: "3.10"` or `required_python_min: 3.10`
        val="$(awk -F: '
            /^[[:space:]]*required_python_min[[:space:]]*:/ {
                v=$2; gsub(/^[[:space:]]+|[[:space:]]+$/,"",v);
                gsub(/^"|"$/,"",v); gsub(/^'\''|'\''$/,"",v);
                print v; exit
            }' "$BOOT_CONTRACTS")"
        if [ -n "$val" ]; then echo "$val"; return; fi
    fi
    echo "3.10"
}

# Compare two version strings X.Y; print "ge" if a >= b else "lt".
version_ge() {
    local a="$1" b="$2"
    local a1 a2 b1 b2
    a1="${a%%.*}"; a2="${a#*.}"; a2="${a2%%.*}"
    b1="${b%%.*}"; b2="${b#*.}"; b2="${b2%%.*}"
    a1=${a1:-0}; a2=${a2:-0}; b1=${b1:-0}; b2=${b2:-0}
    if [ "$a1" -gt "$b1" ]; then echo "ge"; return; fi
    if [ "$a1" -lt "$b1" ]; then echo "lt"; return; fi
    if [ "$a2" -ge "$b2" ]; then echo "ge"; else echo "lt"; fi
}

# Return "X.Y" of an interpreter, or empty on failure.
probe_interpreter_version() {
    local exe="$1"
    "$exe" -c 'import sys; print("%d.%d" % (sys.version_info.major, sys.version_info.minor))' 2>/dev/null || true
}

# G-CTRL-AUDIT-1: replace the previous first-match-wins picker with an
# exhaustive scan that selects the HIGHEST version satisfying the floor.
# Honors .python-version as a hint but never below the floor.
resolve_host_python() {
    local floor pin candidates_raw best_path best_ver
    floor="$(read_min_python)"
    candidates_raw=""

    # 1. .python-version pin — highest priority IF it satisfies the floor.
    if [ -f "$PYVER_FILE" ]; then
        pin="$(tr -d ' \r\n' < "$PYVER_FILE" || true)"
        if [ -n "$pin" ]; then
            local mm
            mm="$(printf '%s' "$pin" | awk -F. '{ if (NF>=2) printf "%s.%s", $1, $2 }')"
            if [ -n "$mm" ] && command -v "python${mm}" >/dev/null 2>&1; then
                candidates_raw="$candidates_raw\npython${mm}"
            fi
        fi
    fi

    # 2. Common version-pinned interpreters in DESCENDING order.
    local v
    for v in 3.14 3.13 3.12 3.11 3.10; do
        if command -v "python${v}" >/dev/null 2>&1; then
            candidates_raw="$candidates_raw\npython${v}"
        fi
    done

    # 3. Generic fallbacks (will be skipped if their version is below floor).
    for fallback in python3 python; do
        if command -v "$fallback" >/dev/null 2>&1; then
            candidates_raw="$candidates_raw\n$fallback"
        fi
    done

    # Iterate in order, take the first whose actual version >= floor.
    best_path=""; best_ver=""
    while IFS= read -r exe; do
        [ -z "$exe" ] && continue
        local ver
        ver="$(probe_interpreter_version "$exe")"
        [ -z "$ver" ] && continue
        if [ "$(version_ge "$ver" "$floor")" = "ge" ]; then
            best_path="$exe"; best_ver="$ver"
            break
        fi
    done < <(printf '%b' "$candidates_raw")

    if [ -z "$best_path" ]; then
        fail_with "no_compatible_python" \
"BOOT_CONTRACTS requires Python >= $floor (constants.required_python_min). \
None of the interpreters on PATH satisfy that floor.

Tried (in order): python\${pin}, python3.14, python3.13, python3.12, python3.11, python3.10, python3, python.

Install a compatible Python and retry. On most systems:
  - macOS:   brew install python@3.12
  - Debian:  sudo apt install python3.12 python3.12-venv
  - Windows: winget install Python.Python.3.12"
    fi

    echo "$best_path"
}

venv_healthy() {
    [ -x "$PY_EXE" ] || return 1
    [ -f "$PYVENV_CFG" ] || return 1
    # Detect cross-OS pollution (Windows paths in pyvenv.cfg).
    if grep -qiE 'C:\\|Scripts\\\\python' "$PYVENV_CFG"; then return 1; fi
    "$PY_EXE" -c "import sys" >/dev/null 2>&1 || return 1
    # G-CTRL-AUDIT-1: reject venvs whose python is below the floor. A
    # surviving 3.9 venv from a previous host won't pass this gate even
    # if the binary still launches.
    local ver floor
    ver="$(probe_interpreter_version "$PY_EXE")"
    floor="$(read_min_python)"
    [ -n "$ver" ] || return 1
    [ "$(version_ge "$ver" "$floor")" = "ge" ] || return 1
    return 0
}

# G19: fast-path. Skip all checks if sentinel is fresh and requirements.txt
# hasn't been edited since.
fast_path() {
    [ -f "$SENTINEL" ] || return 1
    [ -f "$FAIL_SENTINEL" ] && return 1   # never short-circuit a failed bootstrap
    [ -x "$PY_EXE" ]   || return 1
    if [ -f "$REQ_FILE" ]; then
        local req_mtime sentinel_mtime
        req_mtime="$(stat -c %Y "$REQ_FILE" 2>/dev/null || stat -f %m "$REQ_FILE")"
        sentinel_mtime="$(stat -c %Y "$SENTINEL" 2>/dev/null || stat -f %m "$SENTINEL")"
        if [ "$req_mtime" -gt "$sentinel_mtime" ]; then return 1; fi
    fi
    return 0
}

# G-CTRL-AUDIT-1: smoke-test the venv after install. If a top-level package
# from requirements.txt cannot import, the venv is broken — drop the failure
# sentinel and bail out instead of pretending success.
smoke_test_venv() {
    if [ ! -f "$REQ_FILE" ]; then return 0; fi
    # Extract package names (strip ==version, environment markers, comments).
    local pkgs import_names failures detail
    pkgs="$(awk '
        /^[[:space:]]*#/ {next}
        /^[[:space:]]*$/ {next}
        {
            line=$0;
            sub(/[[:space:]]*#.*$/, "", line);
            sub(/[[:space:]]*;.*$/, "", line);
            sub(/[<>=!~].*$/, "", line);
            gsub(/^[[:space:]]+|[[:space:]]+$/, "", line);
            if (length(line) > 0) print line
        }' "$REQ_FILE")"
    if [ -z "$pkgs" ]; then return 0; fi

    # Map distribution names to import names where they differ.
    failures=""
    while IFS= read -r pkg; do
        [ -z "$pkg" ] && continue
        case "$pkg" in
            ruamel.yaml) import_names="ruamel.yaml" ;;
            playwright)   import_names="playwright" ;;
            greenlet)     import_names="greenlet" ;;
            pyee)         import_names="pyee" ;;
            PyYAML)       import_names="yaml" ;;
            typing_extensions) import_names="typing_extensions" ;;
            *)            import_names="$(printf '%s' "$pkg" | tr '-' '_' | tr '[:upper:]' '[:lower:]')" ;;
        esac
        if ! "$PY_EXE" -c "import ${import_names}" >/dev/null 2>&1; then
            failures="${failures}${pkg} (import ${import_names}); "
        fi
    done <<<"$pkgs"

    if [ -n "$failures" ]; then
        detail="The following packages from requirements.txt failed to import after install:
$failures
The venv is in a broken state. Try: rm -rf '$VENV_DIR' && bash '$DIR/bootstrap.sh'"
        fail_with "smoke_test_failed" "$detail"
    fi
}

if fast_path; then
    exit 0
fi

# Clear any prior failure sentinel — we're about to retry.
rm -f "$FAIL_SENTINEL" 2>/dev/null || true

if venv_healthy; then
    echo "[bootstrap] venv healthy at $VENV_DIR"
else
    if [ -d "$VENV_DIR" ]; then
        echo "[bootstrap] removing stale/cross-OS/below-floor venv at $VENV_DIR"
        rm -rf "$VENV_DIR"
    fi
    HOST_PY="$(resolve_host_python)"
    HOST_VER="$(probe_interpreter_version "$HOST_PY")"
    FLOOR="$(read_min_python)"
    echo "[bootstrap] selected $HOST_PY (Python $HOST_VER, floor=$FLOOR)"
    if ! "$HOST_PY" -m venv "$VENV_DIR" 2>/tmp/bootstrap.err; then
        fail_with "venv_create_failed" "$(cat /tmp/bootstrap.err 2>/dev/null || true)"
    fi
    if ! "$PY_EXE" -m pip install --upgrade pip --disable-pip-version-check >/dev/null 2>/tmp/bootstrap.err; then
        fail_with "pip_upgrade_failed" "$(cat /tmp/bootstrap.err 2>/dev/null || true)"
    fi
    if [ -f "$REQ_FILE" ]; then
        echo "[bootstrap] installing requirements.txt"
        if ! "$PY_EXE" -m pip install -r "$REQ_FILE" --disable-pip-version-check 2>/tmp/bootstrap.err; then
            fail_with "pip_install_failed" "$(cat /tmp/bootstrap.err 2>/dev/null || true)"
        fi
    fi
    echo "[bootstrap] venv ready at $VENV_DIR"
fi

# G-CTRL-AUDIT-1: smoke test must come AFTER any branch that produced the
# venv (healthy or freshly-built). It catches the case where an old venv
# survived but its packages were corrupted.
smoke_test_venv

# Touch sentinel + gitkeep so git records the folder shape.
touch "$SENTINEL"
touch "$VENV_DIR/.gitkeep"
