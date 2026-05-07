# 🗂️ Cataloger Engine Protocol

**Type:** Hybrid (Programmatic Diff + Agent-Read Descriptions)
**Purpose:** Ensure the catalog perfectly matches the directory structure, with accurate, agent-generated descriptions for routing.

## The 4-Phase Workflow

### Phase 1: LOAD RULES (Agent Read)
- Read the relevant rules file (e.g., `.brain/.toolbox.context_control/toolbox.rules.yaml` or `.brain/.knowledge.context_control/knowledge.rules.yaml`).
- Understand what fields are required in the target catalog.

### Phase 2: DIFF (Programmatic)
Compare the structure data provided by the **Navigator Engine** against the current `.catalog.yaml` file. The Navigator provides a full recursive directory scan; **the Cataloger is responsible for filtering** to target only individual `.md` files within `skills/` and `agents/` subdirectories, rather than parent domain folders.
- **Remove:** Delete entries from the catalog if the file no longer exists in the directory.
- **Flag `pending:new`:** If a `.md` file exists in the directory but NOT in the catalog.
- **Flag `pending:modified`:** If a `.md` file exists in both, but the OS `last_modified` time differs from the catalog's recorded timestamp.

### Phase 3: PROCESS FLAGS (File by File)
For every flagged entry (`pending:new` or `pending:modified`):
1. **Read:** Agent reads the actual file content.
2. **Check Lock:** If the file's YAML frontmatter contains `cataloger_lock: true`, skip description generation and retain the existing description.
3. **Describe:** If no lock, Agent generates a concise description based on the content and the Rules loaded in Phase 1.
4. **Write (Optional):** If the Rules require it and no lock exists, write the description into the file's YAML frontmatter.
5. **Update catalog:** Write the description into the catalog entry. **CRITICAL:** Update the catalog's timestamp for this entry to exactly match the file's OS `last_modified` time (do NOT use the current system time). Update status to `cataloged`.

### Phase 4: VERIFY (Programmatic)
- Assert that there are ZERO pending entries.
- Assert that every description is present.
- Assert that all timestamps match the source.
- Update the catalog's global `_meta.status` to `verified`.

## catalog Metadata Header Format

Every catalog must maintain this header block:

```yaml
_meta:
  engine: "cataloger"
  source: "[Path being indexed]"
  rules_used: "[Path to rules yaml]"
  last_cataloged: "[Current DateTime]"
  total_entries: [Count]
  status: "verified"    # verified | stale
```
