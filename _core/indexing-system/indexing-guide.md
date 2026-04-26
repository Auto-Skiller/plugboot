---
name: "indexing-system"
description: "Documentation for the repository indexing system and sync scripts"
---

# Indexing System

The repository utilizes an automated indexing system to track contents of critical root directories (`agents/`, `knowledge/`, `rules/`, `scripts/`, `skills/`, `templates/`).

These directories each contain an auto-generated `[foldername]-index.yaml` tracking file. These tracking files are updated by the sync scripts located in `scripts/_core-scripts/`.

## Sync Scripts

The `scripts/_core-scripts/` directory contains individual synchronization scripts for each domain:
- `sync-agents-index.sh`
- `sync-knowledge-index.sh`
- `sync-rules-index.sh`
- `sync-scripts-index.sh`
- `sync-skills-index.sh`
- `sync-templates-index.sh`

### How They Work

When run, each script will index the contents of its target directory into a `[foldername]-index.yaml` file. The index output uses a **Hierarchical List** format.

1. **Hierarchy Strategy**: The index structure organizes files strictly by the immediate subdirectories they belong to.
2. **File Processing**: The scripts discover all files inside the target directory (not just `.md` files).
3. **Frontmatter Extraction**: If the file is a markdown file (`.md`), the sync script will parse its YAML frontmatter to extract the `name` and `description` variables.
4. **Fallback Handling**: If the file does not have frontmatter or is not a markdown file, the script will output the path and use the filename as the `name`, skipping the `description` field.

### YAML Format Example

Here is an example structure of a generated index YAML file:

```yaml
name: agents index
description: Auto-generated index of the agents directory
folders:
  _core-agents:
    - path: _core-agents/system-agent.md
      name: "system-agent"
      description: "Description from frontmatter"
  mobile:
    - path: mobile/dart-build-resolver.md
      name: "dart-build-resolver"
      description: "Dart/Flutter build specialist..."
files:
  - path: root-file.txt
    name: "root-file.txt"
```

## Legacy Notes

- Previously, the directory states were tracked using `INDEX.md` files. The sync scripts will automatically remove these legacy files if found to enforce standardization.
- The tracking relies entirely on `.yaml` indices to enable operational monitoring of domain contents.
