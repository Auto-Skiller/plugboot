"""paths.py — Single source of truth for workspace paths.

Explicitly avoids the old system's rot: config truth was split across
.db/system.yaml, config.yaml, and system-board.yaml, and WORKSPACE_ROOT was
computed inconsistently (boot.py vs daemon_guard.py disagreed). Here there is
ONE workspace-root resolver and ONE config file.
"""
from __future__ import annotations

from pathlib import Path

# .infra/backend/paths.py -> workspace root is two parents up.
WORKSPACE = Path(__file__).resolve().parent.parent.parent

# Root-level key files
CONFIG = WORKSPACE / "config.yaml"
INDEX = WORKSPACE / "index.yaml"
AGENTS_MD = WORKSPACE / "AGENTS.md"

# Infra
INFRA = WORKSPACE / ".infra"
BACKEND = INFRA / "backend"
FRONTEND = INFRA / "frontend"
SCHEMAS = INFRA / "schemas"
TEMPLATES = INFRA / "templates"

# Stash (runtime ephemeral)
STASH = WORKSPACE / ".stash"
PIDS = STASH / "pids"
LOGS = STASH / "logs"

# OS entity
OS_DIR = WORKSPACE / "_os"


def entity_dirs() -> list[Path]:
    """Return every entity root: the _os dir plus each project dir.

    A project dir is any top-level non-hidden dir that is not infra/stash/_os
    and contains a `<name>-runtime.yaml` OR a `<name>-board.md`.
    """
    result: list[Path] = []
    if OS_DIR.exists():
        result.append(OS_DIR)
    for child in WORKSPACE.iterdir():
        if not child.is_dir():
            continue
        if child.name.startswith(".") or child.name in {"_os", "_shared"}:
            continue
        name = child.name
        if (child / f"{name}-runtime.yaml").exists() or (child / f"{name}-board.md").exists():
            result.append(child)
    return result


def rel(p: Path) -> str:
    """Workspace-relative POSIX path string."""
    try:
        return p.relative_to(WORKSPACE).as_posix()
    except ValueError:
        return p.as_posix()
