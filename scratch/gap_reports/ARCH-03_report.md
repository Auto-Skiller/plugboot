# ARCH-03: Identity & Rules Structure Audit Report

## Audit Scope

This report analyzes the `.brain/` and `.engines/` architecture to identify logic collisions, conflicting engine protocols, or ambiguous persona definitions, as outlined in the `ARCH-03` goal in `BOARD.yaml`.

## Findings and Proposed Fixes

### Finding 1: Incorrect Registry Locations in Hierarchy.md

**Description:** `Hierarchy.md` incorrectly lists registry locations as being in Layer 2 (e.g., `pipelines.context.index/`), while `Core_Architecture.md` correctly places all catalogs centrally in `.brain/` (e.g., `.brain/.knowledge.context_control/pipelines/`). Additionally, `Hierarchy.md` refers to `core.context.catalog.yaml` instead of `core.knowledge.catalog.yaml`.
**Proposed Fix:** Update `Hierarchy.md` to accurately reflect the central registry locations within `.brain/` and correct the filenames to match the actual structure defined in `Core_Architecture.md`.

### Finding 2: Protocol Conflict in cataloger.engine.md

**Description:** `cataloger.engine.md` instructs the `navigator.engine` to filter for specific `.md` files in `skills/` and `agents/` directories, but `navigator.engine.md` has no such filtering capability described; it only scans metadata for all files and folders.
**Proposed Fix:** Either update `navigator.engine.md` to add explicit filtering capabilities or update `cataloger.engine.md` to clarify that the cataloger itself applies the filtering after receiving the full scan from the navigator.

### Finding 3: Naming Convention Contradictions

**Description:** `Naming-Conventions.md` contradicts itself by using `Core_Architecture.md` as an example of strict lowercase. Also, `Orchestrator.engine.md` violates the `*.engine` strict lowercase rule and its status as a non-script protocol contradicts the `.engine` suffix.
**Proposed Fix:** Update `Naming-Conventions.md` to remove `Core_Architecture.md` from the strict lowercase example (or rename the file). Rename `Orchestrator.engine.md` to `orchestrator.engine.md` to adhere to the lowercase rule, or reconsider its extension if it's not a programmatic interface.

### Finding 4: Logic Collision in Decision_Making.md vs Modes.md

**Description:** `Decision_Making.md` states that conflict resolution from user prompts should "Never ask the user for permission", which directly conflicts with `Modes.md` stating that `COLLAB` mode requires asking for final approval before executing plans.
**Proposed Fix:** Update `Decision_Making.md` to clarify that conflict resolution is immediate and doesn't require asking _for the resolution itself_, but that subsequent _execution_ of the updated plan must still follow the rules of the active mode (e.g., requiring approval in `COLLAB` mode).

### Finding 5: Ambiguous/Hardcoded Persona

**Description:** `Persona.md` hardcodes a single identity ("Piper"), which conflicts with the multi-agent concurrency mentioned in `BOARD.yaml` (`active_sessions`) and the multi-agent vision described in `AGENTS.md`.
**Proposed Fix:** Update `Persona.md` to serve as a template or guidelines for defining diverse personas, or support multiple persona definitions to enable genuine multi-agent operation as envisioned by the OS substrate.
