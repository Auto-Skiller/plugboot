"""Canonical workspace paths for the Agentic OS daemon.

Single source of truth for where everything lives. No path is guessed
anywhere else in the backend — import it from here. This module fixes the
old engine's #1 rot: three files each assuming a different workspace root.

Layout (this file lives at .infra/backend/paths.py):
    <workspace>/.infra/backend/paths.py  ->  parents[2] == <workspace>
"""
from __future__ import annotations

from pathlib import Path

# .infra/backend/paths.py -> workspace root is three parents up.
WORKSPACE = Path(__file__).resolve().parents[2]

# --- Root-level key files -------------------------------------------------
CONFIG_FILE = WORKSPACE / "config.yaml"
INDEX_FILE = WORKSPACE / "index.yaml"
AGENTS_FILE = WORKSPACE / "AGENTS.md"
README_FILE = WORKSPACE / "README.md"

# --- Infrastructure -------------------------------------------------------
INFRA = WORKSPACE / ".infra"
SCHEMAS = INFRA / "schemas"
TEMPLATES = INFRA / "templates"
BACKEND = INFRA / "backend"
FRONTEND = INFRA / "frontend"

# --- Stash (runtime ephemeral, git-ignored except the recipe) -------------
STASH = WORKSPACE / ".stash"
PIDS = STASH / "pids"
LOGS = STASH / "logs"

# --- The always-on OS entity ---------------------------------------------
OS_DIR = WORKSPACE / "_os"


def ensure_runtime_dirs() -> None:
    """Create the ephemeral dirs the daemon needs. Idempotent."""
    for d in (STASH, PIDS, LOGS):
        d.mkdir(parents=True, exist_ok=True)


def rel(path: Path) -> str:
    """Workspace-relative POSIX string for a path (for writing into YAML)."""
    return path.resolve().relative_to(WORKSPACE).as_posix()
