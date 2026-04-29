# AUTOSKILLER WORKFLOW

The Autoskiller is an autonomous system designed to build, extend, and enhance Agent capabilities by feeding **any raw signal (business data, workflows, knowledge, scripts, or technical patterns)** into their Resource folders (`_`). 

**Purpose:** To transform ANY raw input into structured Agent Intelligence. This makes agents instantly smarter and perfectly adapted to specific environments, business realities, or technical standards without rewriting their core prompts.

---

## 1. Directory Structure

```
_auto_skiller/
├── _input_data/                # Staging area for raw business data
├── AUTOSKILLER_WORKFLOW.md     # This rulebook
└── AUTOSKILLER_TRACKER.yaml    # Ingestion & Mapping tracker
```

---

## 2. Operational Phases

### Phase 1: Signal & Ingest (`00-ingest`)
**Goal:** Identify and stage raw data for processing.
- **Sources:** User-dropped files and folders in `_auto_skiller/_input_data/`.
- **Action:** Agent monitors this folder for any content identified as `[new-data]`.
- **Tagging:** Every file must have a header:
  ```markdown
  ---
  source: [original path/URL]
  target_dept: [domain/department]
  status: [new-data]
  ---
  ```

### Phase 2: Extraction & Transformation (`01-extract`)
**Goal:** Convert raw data into structured resources.
- **Mapping:** Use `index.yaml` to identify the correct `skills/{domain}/{dept}/` destination.
- **Categorization:**
    - **Facts/Blueprints** → `_context/` (e.g., market prices, business entities, product lists)
    - **SOPs/Processes** → `_playbooks/` (e.g., how to handle a specific lead, how to price a car)
    - **Lessons/Constraints** → `_experience/` (e.g., "don't use X tool for Y task", "Algerian market prefers Z")
    - **Templates** → `_formats/` (e.g., a specific invoice style, a report structure)

### Phase 3: Integration & Sync (`02-integrate`)
**Goal:** Push knowledge into the agent's "mind".
1. Move extracted files to their respective `skills/{domain}/{dept}/_folder/`.
2. **Lineage:** Add source comments to the end of every file:
   `<!-- Source: _auto_skiller/_input_data/data_file.md | Processed: YYYY-MM-DD -->`
3. **Index Update:** Run `python _agents_brain/_tools/sync_indexes.py`.
4. **Validation:** Perform an "Intelligence Audit" (Verify the agent can recall the new data).

---

## 3. Rules & Quality Standards

- **No Generic Summaries:** Extract specific, actionable logic. If a video says "price at 20% margin", the playbook must say "price at 20% margin", not "optimize pricing".
- **Average is Failure:** Every resource added must be "Production Quality" (ready to be used in a revenue-generating task).
- **De-duplication:** If a fact already exists in `_context`, do not add it again. If it's a conflict, document the conflict in `_experience`.
- **Preserve Tone:** Keep the business's specific voice and "tribal knowledge" intact.

---

## 4. Change Propagation
When the Autoskiller updates a `_playbook`, any agent in that department is considered "upgraded".
- **Update Board:** Log `[AUTOSKILLED]` in `board.yaml` with a summary of the new "Superpowers" added.
