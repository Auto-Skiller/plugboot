# CHANGELOG — Core Toolbox Library

## v1.2 — 2026-05-14

### NEW TOOLBOXES (Enhancement-8)
- ADDED: `synthesis` toolbox — `synthesize-findings` skill (functional)
- ADDED: `communication` toolbox — `format-output` skill (functional)
- ADDED: `validation` toolbox — `validate-schema` skill (functional)

### SKILL UPGRADES (Enhancement-1 + Enhancement-2)
All 7 existing core skills upgraded from stubs to `functional` maturity:
- UPGRADED: `analyze-context` v1.0 → v1.1 — added maturity field, output format YAML, Zero-Drift note, rich 6-step protocol
- UPGRADED: `compare-options` v1.0 → v1.1 — added maturity field, scoring rubric, trade-offs output, benchmark_result YAML format
- UPGRADED: `generate-ideas` v1.0 → v1.1 — added maturity field, diverge-then-converge protocol, ideation_result YAML format
- UPGRADED: `write-docs` v1.0 → v1.1 — added maturity field, document type templates table, audience-first approach
- UPGRADED: `assess-quality` v1.0 → v1.1 — added maturity field, APPROVED/CONDITIONAL/REJECTED verdict gate, quality_assessment YAML format
- UPGRADED: `determine-next-steps` v1.0 → v1.1 — added maturity field, action_gate awareness, dependency mapping, risk flags
- UPGRADED: `resolve-knowledge-gaps` v1.0 → v1.1 — added maturity field, 4-tier source hierarchy, confidence levels, research_result YAML
- UPGRADED: `notebooklm-py` — added YAML frontmatter block, maturity: battle-tested
- UPGRADED: `pyragify` — added YAML frontmatter block, maturity: hardened

### STRUCTURAL ADDITIONS
- ADDED: `.brain/.toolbox_library/README.md` — library orientation document (Enhancement-9)
- ADDED: `.brain/.toolbox_library/toolbox_graph.yaml` — bidirectional dependency graph, 18 edges (Enhancement-6)
- ADDED: `.brain/.toolbox_library/CHANGELOG.md` — this file (Enhancement-7)

## v1.0 — 2026-05-01 (Estimated)

### INITIAL STATE
- Created 9 core toolboxes: analysis, benchmarking, brainstorming, documentation, evaluation, notebooklm, planning, rag, research
- All skills at stub maturity (4-step placeholders)
- Created 40 extended toolbox shells across business, engineering, life, studio domains
- All extended toolboxes empty (skill_count: 0)
