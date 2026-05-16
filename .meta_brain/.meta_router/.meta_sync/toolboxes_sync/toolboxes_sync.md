# 🧰 Toolboxes Sync Protocol (Agentic OS v5)
> **Schema Version:** 1.0 | Canonical source of truth: `.meta_brain/toolboxes/` → `toolboxes.yaml`

**Role:** Synchronize the capabilities library. This engine scans all toolboxes, updates agent/skill counts, and pulls metadata from internal toolbox YAMLs.

## 📦 File Schema (Enforced)

### Toolbox Inner YAML (`[toolbox_name].yaml`)
Located in the root of each toolbox folder.
```yaml
name: string                   # e.g., planning
description: string            # primary role
when_to_use: string            # usage guidelines
maturity_level: stub | partial | functional | complete

health:
  status: empty | partial | functional | complete
  last_audit: timestamp

capabilities:
  agent_count: integer
  skill_count: integer
  agent_names: [string]
  skill_names: [string]
```

---

## ⚙️ Execution Steps (Protocol)

### 1. Domain Cataloging
- Iterate through `core_toolboxes` and `extended_toolboxes`.
- For each toolbox, verify the folder exists in `.meta_brain/toolboxes/`.

### 2. Inner Metadata Pull
- Load the internal `[toolbox_name].yaml` file.
- Extract `description`, `when_to_use`, and `maturity_level`.

### 3. Capability Audit
- **Agents:** Scan the `agents/` folder. Count files and extract names.
- **Skills:** Scan the `skills/` folder. Count `.md` files and extract names.

### 4. Health & Maturity Calculation
- **Empty:** 0 skills/agents.
- **Partial:** Skills exist but are stubs.
- **Functional:** Skills are mature.
- **Complete:** Skills, agents, and examples are present.
