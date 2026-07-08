"""Entity path resolution for the OS and projects.

Every entity (the always-on `_os`, or a project) shares the same six-part
anatomy but with slightly different filename conventions:

    _os:      os-board.md, os-runtime.yaml, os_prompts.yaml (+ os_prompts/),
              os-missions.yaml (+ .os-missions/), os-toolboxes.yaml
              (+ .os-toolboxes/), os-inbox.yaml (+ os-inbox/), .os-archive/

    project X: X-board.md, X-runtime.yaml, X-data.yaml (+ X-data/),
              X-missions.yaml (+ .X-missions/), X-toolboxes.yaml
              (+ .X-toolboxes/), X-inbox.yaml (+ X-inbox/), .X-archive/

The only structural difference: the OS carries `os_prompts` (identity/laws)
where a project carries `data` (project content). Both are the "brain"
folder whose files get pre-indexed into the runtime fill_queue.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from . import paths


@dataclass(frozen=True)
class Entity:
    name: str            # "os" or the project name
    is_os: bool
    root: Path

    # --- prefixes --------------------------------------------------------
    @property
    def prefix(self) -> str:
        # visible file prefix: "os" or the project name
        return "os" if self.is_os else self.name

    @property
    def dot(self) -> str:
        # hidden-folder prefix: ".os" or ".<name>"
        return ".os" if self.is_os else f".{self.name}"

    # --- control-plane files --------------------------------------------
    @property
    def board(self) -> Path:
        return self.root / f"{self.prefix}-board.md"

    @property
    def runtime(self) -> Path:
        return self.root / f"{self.prefix}-runtime.yaml"

    @property
    def missions(self) -> Path:
        return self.root / f"{self.prefix}-missions.yaml"

    @property
    def toolboxes(self) -> Path:
        return self.root / f"{self.prefix}-toolboxes.yaml"

    @property
    def inbox(self) -> Path:
        return self.root / f"{self.prefix}-inbox.yaml"

    @property
    def brain(self) -> Path:
        """os_prompts.yaml for the OS, <name>-data.yaml for a project."""
        return self.root / ("os_prompts.yaml" if self.is_os else f"{self.name}-data.yaml")

    # --- folders ---------------------------------------------------------
    @property
    def brain_dir(self) -> Path:
        return self.root / ("os_prompts" if self.is_os else f"{self.name}-data")

    @property
    def missions_dir(self) -> Path:
        return self.root / f"{self.dot}-missions"

    @property
    def toolboxes_dir(self) -> Path:
        return self.root / f"{self.dot}-toolboxes"

    @property
    def inbox_dir(self) -> Path:
        return self.root / f"{self.prefix}-inbox"

    @property
    def gateway_dir(self) -> Path:
        """Dot-prefixed gateway inside the inbox; holds pillar folders."""
        return self.inbox_dir / ".gateway"

    @property
    def archive_dir(self) -> Path:
        return self.root / f"{self.dot}-archive"


def os_entity() -> Entity:
    return Entity(name="os", is_os=True, root=paths.OS_DIR)


def project_entity(name: str) -> Entity:
    return Entity(name=name, is_os=False, root=paths.WORKSPACE / name)
