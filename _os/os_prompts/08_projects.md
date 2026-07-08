# 08 · Projects

A project is any managed thing (code, business, channel, legal docs, …). Each is a
self-contained entity mirroring `_os`: board, runtime, missions, toolboxes, inbox,
and a data folder.

## Creating a project (smart first-time formatting)
When the user asks to create a project, do NOT dump a generic template:
1. **Ask for details** — what kind of project, its goal, scope, key surfaces
   (e.g. for content: which IG/YouTube accounts; for a business: what the DB holds;
   for legal: which procedures/documents).
2. **Draft the project board** (`<name>-board.md`) with sections tailored to that
   type + those details.
3. **Seed** the runtime/missions/toolboxes/inbox yamls from the schemas.
4. **Register** the project in root `index.yaml` and `config.yaml`.

## Data folder
`<name>-data/` holds anything — a codebase, a client DB, content-account exports,
documents. The `<name>-data.yaml` brain (per `project_data-schema.yaml`) describes
each file/folder so you know what's there without re-reading it all.

## Isolation
Project work stays in the project. `_os` orchestrates across projects but a
project's missions/toolboxes/data are its own.
