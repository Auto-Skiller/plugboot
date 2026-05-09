# Agentic OS Naming Conventions

> [!IMPORTANT]
> To maintain perfect "zero-drift" consistency across the Agentic OS, all agents, orchestrators, and human operators must adhere strictly to these naming conventions. This ensures programmatic safety and structural predictability.

---

## 1. The Dot Prefix (`.folder`)
**Purpose:** Systemic Infrastructure & Immutable Core Layers.
* **What it means:** These are the foundational pillars of the Agentic OS. Agents should treat them as strictly governed infrastructure. The dot prefix hides them from standard file explorers and protects them from accidental deletion.
* **When to use:** For OS substrates and context layers.
* **Examples:** `.brain/`, `.core/toolbox_library/`, `.core/mission_board/`, `.engines/`.

## 2. The Underscore Prefix (`_folder`)
**Purpose:** Execution Workspaces & Mutable Data.
* **What it means:** These are active, working directories where agents actually build things, write code, or drop temporary outputs. The underscore brings them to the top of alphabetical sorts but marks them as "volatile" or "active" compared to permanent `.dot` folders.
* **When to use:** For directories where live work, generation, or outputs occur.
* **Examples:** `pipelines/`, `projects/`, `_discoveries/`, `_proposals/`.
* *(Note: Also used for reserved YAML metadata keys like `_meta:`).*

## 3. The Suffix / Dot Separator (`name.[type]`)
**Purpose:** System Classes & Execution Interfaces.
* **What it means:** The `.[type]` suffix acts like an Object-Oriented Interface. When an agent or script sees this suffix, it instantly knows exactly *how* to process or execute it, guaranteeing a specific structure or operational contract.
* **When to use:** When the Orchestrator or Cataloger needs to parse the item in a highly specialized, programmatic way.
* **When NOT to use:** For standard containers, codebase repositories, or linear pipelines.
* **Examples:**
  * `*.engine` (e.g., `context_control.engine`): An executable core capability.
  * `*.context_control` (e.g., `.knowledge.context_control`): A directory governing rules and indexes for a specific domain.
  * `*.catalog.yaml` (e.g., `core.toolbox.catalog.yaml`): A strictly formatted catalog YAML file.
  * *Negative Example:* `pipelines/scaler` (No `.pipeline` suffix needed, as it is just a standard workspace).

## 4. Underscore vs. Hyphen (`snake_case` vs `kebab-case`)
**Purpose:** Differentiating Programmatic Systems from Human/Standard Repositories.
* **Use Underscores (`_`)** for Systemic/Programmatic Nouns.
  * *Why:* Ensures programmatic safety in scripts.
  * *Examples:* `context_control`, `agentic_toolbox`, `core_missions.yaml`.
* **Use Hyphens (`-`)** for Human-Readable Projects or External Repositories.
  * *Why:* Matches standard web and GitHub conventions.
  * *Examples:* `open-workspace`, `awesome-ai-apps`, `board-visualizer`.

## 5. Plural (`s`) vs. Singular
**Purpose:** Differentiating Collections from Specific Entities.
* **Use Plural (`s`)** when a directory acts as a Container or Registry holding multiple independent items.
  * *Examples:* `.engines/` (holds multiple engines), `projects/` (holds multiple codebases).
* **Use Singular** when naming a Specific Instantiated Entity or a single unified concept.
  * *Examples:* `context_control.engine` (one engine), `scaler` (one pipeline), `.core/toolbox_library/` (the unified toolbox).

## 6. Capitalization: ALL CAPS vs. lowercase vs. Title Case
**Purpose:** Instantly signaling the *audience* and *importance* of a file.
* **ALL CAPS (`CONTROLER.yaml`, `SKILL.md`, `README.md`)**
  * *Purpose:* **Entrypoints & Standardized Contracts.**
  * *Rule:* Use ALL CAPS exclusively for files that scream "READ ME FIRST". These are the mandatory entry points or standardized capability contracts for a directory. 
* **Title Case / Starting with Caps (`Naming-Conventions.md`, `Security_Policy.md`)**
  * *Purpose:* **Human-Facing Documents & High-Level Policies.**
  * *Rule:* Use Capitalized words for documents that are meant to be read like a book or manual by human operators or act as high-level philosophy/guides.
* **Strict lowercase (`scaler.md`, `context_control.engine`, `knowledge.rules.yaml`)**
  * *Purpose:* **Systemic Executables, Data, and Folders.**
  * *Rule:* Any directory, script, engine, registry, or index that is primarily parsed by the system or orchestrator must be strictly lowercase to prevent case-sensitivity bugs. Note: Human-facing documents like `Core_Architecture.md` or `Naming-Conventions.md` use Title Case and are intentionally excluded from this rule.

---

### The Litmus Test
When creating a new file or directory, ask yourself:
1. *Is it an immutable OS system?* ➡️ Start with **`.`**
2. *Is it an active workspace?* ➡️ Start with **`_`**
3. *Does it have a strict programmatic execution contract?* ➡️ End with **`.[type]`**
4. *Is it a collection of items?* ➡️ Use **Plural**
