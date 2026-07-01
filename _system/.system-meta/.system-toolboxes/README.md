# Local Toolboxes

> [!NOTE]
> This folder (`.system-toolboxes/`) contains custom toolboxes, skills, and subagents that apply ONLY to this bounded context.
> Global shared toolboxes live in `_shared/.shared-toolboxes/`.

## How to Create Local Toolboxes
1. Create a domain folder: `.system-toolboxes/<domain_name>/`
2. Create skill or agent folders inside the domain folder.
3. Ensure each skill contains a `SKILL.md` with a valid `credentials:` YAML block.
4. The backend engine will automatically discover these, and you can activate them via `board.yaml`.
