"""daemon.py — supervisor: PID singleton + sync loop + dashboard server.

Single process (ADR-0001). Runs the Starlette app via uvicorn in a thread and
ticks the sync engine every SYNC_INTERVAL seconds. PID singleton prevents
duplicate daemons (carried over from the old daemon_guard, minus the rot).
"""
from __future__ import annotations

import json
import os
import sys
import threading
import time
import datetime as _dt

from paths import PIDS, LOGS
import engine

SYNC_INTERVAL = 5  # seconds
PID_FILE = PIDS / "daemon.pid"
HOST = "127.0.0.1"
PORT = 8000


def _pid_alive(pid: int) -> bool:
    if pid <= 0:
        return False
    try:
        if os.name == "nt":
            import subprocess
            out = subprocess.check_output(
                ["tasklist", "/FI", f"PID eq {pid}", "/NH"], text=True
            )
            return str(pid) in out
        os.kill(pid, 0)
        return True
    except Exception:
        return False


def _acquire_singleton() -> None:
    PIDS.mkdir(parents=True, exist_ok=True)
    if PID_FILE.exists():
        try:
            data = json.loads(PID_FILE.read_text(encoding="utf-8"))
            if _pid_alive(int(data.get("pid", -1))):
                print(f"[daemon] already running (PID {data.get('pid')}). Exiting.")
                sys.exit(0)
        except Exception:
            pass
    PID_FILE.write_text(
        json.dumps({"pid": os.getpid(), "started_at": _dt.datetime.now().isoformat()}, indent=2),
        encoding="utf-8",
    )


def _release_singleton() -> None:
    try:
        PID_FILE.unlink(missing_ok=True)
    except Exception:
        pass


def _serve() -> None:
    import uvicorn
    from server import app
    uvicorn.run(app, host=HOST, port=PORT, log_level="warning")


def main() -> None:
    LOGS.mkdir(parents=True, exist_ok=True)
    _acquire_singleton()
    print(f"[daemon] supervisor PID {os.getpid()} — dashboard http://{HOST}:{PORT}")
    server_thread = threading.Thread(target=_serve, daemon=True)
    server_thread.start()
    try:
        while True:
            try:
                engine.sync_all()
            except Exception as e:  # noqa: BLE001
                print(f"[daemon] sync error: {e}")
            time.sleep(SYNC_INTERVAL)
    except KeyboardInterrupt:
        print("\n[daemon] shutting down.")
    finally:
        _release_singleton()


if __name__ == "__main__":
    main()
