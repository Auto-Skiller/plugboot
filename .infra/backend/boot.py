"""Supervisor / launcher.

Single-instance guard via a PID lock socket (port 49999). Launches the
Starlette app (which owns the sync loop) with uvicorn on :8000. Cross-OS:
no global installs, everything runs from the workspace venv.

Usage:
    python .infra/backend/boot.py
"""
from __future__ import annotations

import os
import socket
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import paths  # noqa: E402

LOCK_PORT = 49999
HTTP_PORT = 8000


def acquire_singleton_lock() -> socket.socket | None:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(("127.0.0.1", LOCK_PORT))
        s.listen(1)
        return s
    except OSError:
        s.close()
        return None


def main() -> None:
    lock = acquire_singleton_lock()
    if lock is None:
        print("[boot] Agentic OS is already running (lock :49999 held). Exiting.")
        sys.exit(0)

    paths.ensure_runtime_dirs()
    print(f"[boot] workspace: {paths.WORKSPACE}")
    print(f"[boot] dashboard: http://localhost:{HTTP_PORT}")

    import uvicorn  # imported here so --help works without the dep

    # server module lives next to this file; make it importable by name.
    uvicorn.run("server:app", host="127.0.0.1", port=HTTP_PORT, log_level="info")


if __name__ == "__main__":
    main()
