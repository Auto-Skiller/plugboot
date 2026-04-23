# RUNBOOK.md — Operational Reference
> Goals and tasks: USER.md → Goals Tracker
> For focus definitions and specific details → USER.md → Focuses and focuses/[focus]/[focus]-brief.md.
> Daily activity: memory/YYYY-MM-DD.md (today's log)
> Curated knowledge: MEMORY.md (Facts zone only)
> This is a living reference — Director edits freely without touching core system.
> For program definitions (WHAT, WHEN, WHO, WHEN to stop) → MANUAL.md
> This file covers HOW — rules, criteria, decision trees, quality bars, operational details.

--- 

## Pipeline Overview

```
Market Focuses → Data → Skills → Products → Sales
     [1]          [2]     [3]       [4]       [5]
```

The pipeline is a **continuous cycle**, not a one-time process:
- Each stage feeds the next stage with its output.
- Every stage can loop back when new inputs arrive.
- The pipeline runs per-focus: each focus progresses independently through all 5 stages.
- Goals in USER.md drive which stage(s) to execute and in what order.

**Stage Dependencies:**
```
[1] Market Focuses  →  defines WHAT to pursue
[2] Data            →  requires an active Focus from [1]
[3] Skills          →  requires processed Data from [2]
[4] Products        →  requires live Skills from [3]
[5] Sales           →  requires a deployable Product from [4]
```

**Pipeline Rule:** Never skip a stage. If a focus has no data, do not attempt skill promotion. If a focus has no skills, do not attempt product building.

---

---

# ═══════════════════════════════════════════════════════════════
# PHASE 1 — MARKET FOCUSES
# ═══════════════════════════════════════════════════════════════

## 1.1 Purpose

Identify, evaluate, and define market-driven focuses that represent real demand and revenue opportunity. A Focus is a strategic area of attention that the Director wants to pursue — each Focus flows through the entire pipeline (Data → Skills → Products → Sales).

## 1.2 When This Phase Runs

- Director explicitly creates or modifies a Focus in USER.md § Focuses
- A Goal in Goals Tracker requires market analysis or focus evaluation
- Mode = AUTO and no active focuses exist (cold start)
- Periodic re-evaluation of existing focuses (when a [∞] goal cycles)

## 1.3 Inputs

- USER.md § Focuses (current focus definitions)
- focuses/[focus]/[focus]-brief.md (deep context per focus)
- MEMORY.md § Facts (validated knowledge about markets, constraints)
- External research via web search tools

## 1.4 Outputs

- Updated or new Focus entry in USER.md § Focuses (minimal description)
- Updated or new focuses/[focus]/[focus]-brief.md (deep context)
- New workspace folders created per AGENTS.md § Standards:
  - `data/[focus]-data/` with sub-folders: `Repos/`, `Skills/`, `Reports/`, `Scripts/`, `others-data/`
  - `skills/[focus]-skills/`
  - `products/[focus]-products/`
  - `focuses/[focus]/`
  - `sales/[focus]/`
  - `focuses/[focus]/[focus]-brief.md`

## 1.5 Decision Tree — Focus Evaluation

When evaluating whether a new focus is worth pursuing:

```
New Focus Idea
  │
  ├─ Q1: Is there real market demand?
  │    NO  → Archive the idea. Log [DECISION] with reasoning.
  │    YES ↓
  │
  ├─ Q2: Can the Director serve this market from Algeria?
  │    NO  → Archive. Log [DECISION].
  │    YES ↓
  │
  ├─ Q3: Does Pipeclaw have the tools and capabilities to operate here?
  │    NO  → Flag as blocked. Log [DECISION]. Escalate to Director.
  │    YES ↓
  │
  ├─ Q4: Does this overlap with an existing focus?
  │    YES → Merge into the existing focus. Update its brief. Log [DECISION].
  │    NO  ↓
  │
  └─ Q5: Is this actionable within the next 3 months?
       NO  → Park it. Add to MEMORY.md § Dreams as a future idea.
       YES → Proceed to Focus Creation.
```

## 1.6 Focus Creation Process

1. Director defines focus name and description in USER.md § Focuses
2. Create workspace folders per AGENTS.md § Standards:
   - `data/[focus]-data/` with sub-folders
   - `skills/[focus]-skills/`
   - `products/[focus]-products/`
   - `focuses/[focus]/` ← focus research, evaluation outputs, and brief snapshots
   - `sales/[focus]/` ← marketing materials, channel operations, revenue tracking
   - `focuses/[focus]/[focus]-brief.md`
3. Create focuses/[focus]/[focus]-brief.md with initial context:
   - Market description and opportunity
   - Target audience/customer
   - Known competitors or alternatives
   - Platform preferences (local-first: Algerian platforms, DZD pricing)
   - Freshness window for data (how quickly does info in this market go stale?)
   - Open questions to research
4. Log [DECISION] in today's daily memory file

## 1.7 Focus Brief File Structure

Every `focuses/[focus]/[focus]-brief.md` must contain:

```markdown
# [Focus Name] — Brief

## Market Context
[What is this market? Who are the customers? What problem are we solving?]

## Platform & Channel Preferences
[Which platforms matter for this focus? Local-first always.]

## Source Preferences
[Preferred data sources — YouTube channels, websites, reports, communities]

## Freshness Window
[How quickly does data in this market go stale? e.g., "prices: 24h", "trends: 7d", "guides: 90d"]

## Known Competitors / Alternatives
[What already exists in this space?]

## Open Questions
[What do we still need to figure out?]

## History & Decisions
[Key decisions made, pivots, lessons learned — chronological]
```

## 1.8 Focus Re-Evaluation Criteria

When re-evaluating an existing focus:

| Signal | Action |
|--------|--------|
| No goals created for this focus in 30+ days | Flag to Director — is this focus still active? |
| All goals completed, no new ones planned | Consider archiving the focus |
| Market conditions changed significantly | Update brief, research new context |
| Focus scope creep detected | Split into sub-focuses or trim scope |
| Director removes from USER.md § Focuses | Archive all related data/skills. Do NOT delete. |

## 1.9 Phase 1 — Logging Reference

| Event | Tag | Where |
|-------|-----|-------|
| New focus created | `[DECISION]` `[focus_name]` | Daily memory file |
| Focus re-evaluated | `[AUDIT]` `[focus_name]` | Daily memory file |
| Focus archived | `[ARCHIVED]` `[focus_name]` | Daily memory file |
| Focus merged | `[DECISION]` `[focus_name]` | Daily memory file |

## 1.10 Phase 1 — Error Recovery

| Situation | Action |
|-----------|--------|
| Unsure if focus has market demand | Research first — use web search. Cite 2+ sources. |
| Focus overlaps with existing | Merge scopes. Update the existing brief. Log [DECISION]. |
| Director removed focus but data/skills/focuses/sales exist | Move ALL related files to their respective archive/ sub-folders. Log [ARCHIVED]. |
| Cannot determine market viability | Log [DECISION] with reasoning. Park in MEMORY.md § Dreams. |

## 1.11 Phase 1 — Boundaries & Hard Rules

- **Only Director creates focuses.** Pipeclaw can suggest (in Dreams or notes) but never creates a focus autonomously.
- **Focus names** use lowercase with underscores: `algerian_ecommerce`, `bac_2026`, `gold_tracking`.
- **No focus-specific content in core system files.** Use generic `[focus]` references only (per AGENTS.md rule).
- **Every focus MUST have** a matching data folder, skills folder, and brief file — or it fails Structure Validation.
- **Local-first always.** DZD pricing, Algerian platforms, Algerian market realities. Never assume USD, Shopify, or Western defaults.

---

---

# ═══════════════════════════════════════════════════════════════
# PHASE 2 — DATA
# ═══════════════════════════════════════════════════════════════

## 2.1 Purpose

Research, acquire, triage, and store raw data that feeds the Skills stage. Data includes YouTube scripts, reports, blog posts, repos, raw research, and any material that contains actionable information for a focus.

## 2.2 When This Phase Runs

- A Goal in Goals Tracker requires data acquisition, research, or scraping
- Director assigns a data-related task
- Pre-work needed before Skill Promotion (Phase 3)
- Mode = AUTO and data gaps are identified for active focuses

## 2.3 Inputs

- Goal/task description from USER.md § Goals Tracker
- USER.md § Focuses (which focus this data serves)
- focuses/[focus]/[focus]-brief.md (source preferences, freshness windows, platform lists)
- MEMORY.md § Facts (validated constraints)
- Director notes from USER.md § Notes (priority overrides)

## 2.4 Outputs

- Clean markdown files in `data/[focus]-data/[correct-subfolder]/`
- Metadata sidecars where applicable
- Updated Data Graph (§ 2.14)
- Log entries in today's daily memory file

## 2.5 Data Acquisition Workflows

### 2.5.1 Research Run

**When to Use:**
- A goal requires market analysis, competitive research, or source discovery
- Pre-work needed before Data Intake or Skill Promotion
- Director assigns a research task in Goals Tracker

**Steps:**
1. Read the research objective from the task description
2. Read relevant focuses/[focus]/[focus]-brief.md for existing context and known sources
3. Define research scope: what questions need answers? What data gaps exist?
4. Execute search queries using available tools (web search, URL fetch)
5. For each source found:
   - Evaluate against § 2.7 Data Quality Criteria
   - Extract actionable information (not just summaries)
   - Note source URL, author, date for citation
6. Synthesize findings into a structured research report
7. Store report in `data/[focus]-data/Reports/[descriptive-filename].md`
8. Add entry to Data Graph (§ 2.14)
9. Log `[NEW-DATA]` `[research]` `[focus_name]` in today's daily memory file
10. Update focuses/[focus]/[focus]-brief.md if findings change focus context

**Research Quality Bar:**
- Research must cite 2+ sources for key claims
- Prioritize local/Algerian sources when relevant
- Never present synthesis as original data — always cite source
- Flag paywalled or proprietary sources → escalate to Director

### 2.5.2 Data Intake

**When to Use:**
- Director assigns a data acquisition task in Goals Tracker
- A task requires gathering raw information (scripts, reports, repos)
- New data sources are identified during research or autonomous scanning

**Steps:**
1. Identify the data source from the task description
2. Verify source accessibility and credibility (see § 2.7 Data Quality Criteria)
3. Acquire data using the appropriate tool (web search, URL fetch, file read, etc.)
4. Classify content type using § 2.8 Content Classification Decision Tree
5. Assign to correct focus using § 2.9 Focus Assignment Decision Tree
6. Clean content: remove formatting noise, social media clutter, keep substance
7. Write output to `data/[focus]-data/[correct-subfolder]/[descriptive-filename].md`
8. Create metadata sidecar if required (see § 2.10 Content Type Rules)
9. Add entry to Data Graph (§ 2.14)
10. Log `[NEW-DATA]` `[focus_name]` in today's daily memory file

### 2.5.3 Processing Priority Queue

When multiple data items need processing, prioritize by subfolder in this order:

**For Data Intake (acquiring and structuring):**
1. `Scripts/` — highest priority (primary data source, YouTube scripts)
2. `Reports/` — structured research and analysis
3. `Skills/` — raw skill material and knowledge files
4. `Repos/` — full projects and codebases
5. `others-data/` — lowest priority

**For Skill Promotion (feeding into Phase 3):**
1. `Skills/` — highest priority (already structured, ready for promotion)
2. `Reports/` — may contain actionable processes
3. `Scripts/` — need conversion to knowledge first (see § 2.10 Script-to-Knowledge)
4. `Repos/` — lowest priority

Always process highest-priority items first before moving to lower-priority subfolders.

## 2.6 Data Research Rules

- Prefer free, publicly available sources
- Prioritize local-first sources over international when relevant to a focus
  (see focuses/[focus]/[focus]-brief.md for focus-specific platform lists and source preferences)
- Verify source credibility before intake: check publication date, author authority, source reputation
- Cross-reference key claims across 2+ sources when possible
- Never present research synthesis as original data — always cite source
- Flag paywalled or proprietary sources → escalate to Director

## 2.7 Data Quality Criteria

What makes a data source trustworthy — evaluate every source against these 5 criteria:

| # | Criterion | Definition | Pass If |
|---|-----------|------------|---------|
| 1 | **Recency** | Published within the freshness window for its category | Within window defined in focuses/[focus]/[focus]-brief.md |
| 2 | **Authority** | Author/org has demonstrated expertise in the domain | Known expert, high-reputation outlet, verified channel |
| 3 | **Specificity** | Contains actionable information, not just general commentary | Concrete steps, numbers, techniques — not opinions |
| 4 | **Relevance** | Directly relates to an active Focus | Matches a focus in USER.md § Focuses |
| 5 | **Completeness** | Contains enough substance to be useful | Not a teaser, fragment, or paywalled preview |

**Scoring:**
- 4-5 criteria pass → **Intake.** Proceed with acquisition.
- 3 criteria pass → **Flag.** Log `[TRIAGE]` with reasoning. Intake if no better source available.
- ≤2 criteria pass → **Reject.** Do not intake. Log `[TRIAGE]` with rejection reason.

## 2.8 Content Classification Decision Tree

When receiving new content, classify by asking in order:

```
New Content Arrives
  │
  ├─ Q1: Is it raw educational content?
  │      (YouTube transcript, blog post, lecture notes, social media script)
  │      YES → data/[focus]-data/Scripts/
  │      NO  ↓
  │
  ├─ Q2: Is it a structured report from a trusted source?
  │      (Market analysis, benchmark, official statistics, research paper)
  │      YES → data/[focus]-data/Reports/
  │      NO  ↓
  │
  ├─ Q3: Is it an existing skill, template, or operational framework?
  │      (How-to guide, workflow template, ready-to-use process)
  │      YES → data/[focus]-data/Skills/
  │      NO  ↓
  │
  ├─ Q4: Is it a full project, repo, or multi-file resource?
  │      (GitHub repo, codebase, multi-file download)
  │      YES → data/[focus]-data/Repos/
  │      NO  ↓
  │
  └─ Q5: None of the above?
         YES → data/[focus]-data/others-data/
```

**Critical:** Classify by CONTENT, not by file type. A PDF report goes to Reports/. An image containing a market analysis goes to Reports/ (with text extraction). An audio debate goes to Scripts/ (with transcription request).

## 2.9 Focus Assignment Decision Tree

When unsure which focus a piece of content belongs to:

```
New Content — Which Focus?
  │
  ├─ Step 1: Read USER.md § Focuses for all active focus definitions
  │
  ├─ Step 2: Read focuses/[focus]/[focus]-brief.md for candidate focuses to understand scope
  │
  ├─ Step 3: Match content to the focus whose scope most closely fits
  │    CLEAR MATCH → Assign to that focus
  │    NO CLEAR MATCH ↓
  │
  ├─ Step 4: Does it relate to ANY focus at all?
  │    NO  → data/_temp-data/
  │    YES but ambiguous ↓
  │
  └─ Step 5: Log [DECISION] with reasoning. Assign to best-fit focus. Proceed.
```

**Note:** Focus names and their definitions are ONLY in USER.md § Focuses. Never assume or hardcode focus names in this file.

## 2.10 Content Type Rules

### YouTube Scripts / Video Transcripts (PRIMARY DATA SOURCE)

YouTube script scraping is the **#1 data acquisition method**. Follow strictly:

**Scraping Rules:**
- Scrape the **FULL script** — do NOT skip any word, sentence, or section
- Only scrape videos with relatively high view counts (indicates value)
- Videos must be recent/new (within freshness window for the focus)
- Add metadata header to every script:
  ```markdown
  ---
  source: [URL]
  channel: [channel name]
  published: [YYYY-MM-DD]
  views: [approximate count]
  language: [language]
  scraped: [YYYY-MM-DD]
  ---
  ```
- Store raw scripts in `data/[focus]-data/Scripts/`
- Filename: `[topic]_[channel-shortname].md` (e.g., `facebook-ads-testing_ilyes.md`)

**Script-to-Knowledge Conversion Rules:**
When converting raw scripts to knowledge files (for `data/[focus]-data/Skills/`):
- Produce **DETAILED readable knowledge files** — NOT summaries or insights
- Include **ALL content** from the video by detail, step by step
- Organize by logical sections/chapters with headers
- Preserve every technique, example, number, and explanation from the original
- The goal: someone reading the knowledge file gets the **SAME value** as watching the video
- Add "Source:" footer linking back to the original script file
- Store in `data/[focus]-data/Skills/` (ready for skill promotion later)

### PDF Reports
- Extract ALL text to markdown → `data/[focus]-data/Reports/`
- Keep original PDF in `data/[focus]-data/others-data/`
- If PDF is a non-text format (scanned images) → extract text using OCR or describe content
- Add metadata sidecar: `[filename]-meta.md` with title, author, date, key takeaways

### GitHub Repos / Full Projects
- Store in `data/[focus]-data/Repos/`
- Create `README-summary.md` with: what it does, tech stack, relevant components, adaptation potential
- Do NOT store repos > 50MB without Director approval

### Blog Posts / Social Media Scripts
- Extract to clean markdown → `data/[focus]-data/Scripts/`
- Remove social media formatting, emojis, engagement bait
- Keep source URL and date
- Preserve ALL substance and logic — do not summarize

### Raw Data Files (CSV, JSON, etc.)
- Store in `data/[focus]-data/others-data/`
- Create `[filename]-desc.md` sidecar with: column descriptions, row count, date range, intended use

## 2.11 Binary & Media File Handling

Data is classified by CONTENT, not by file type:

| File Type | Action |
|-----------|--------|
| **PDF** | Extract ALL text → markdown in `Reports/` or `Scripts/` based on content. Keep original PDF in `others-data/`. |
| **Images** | Store in `others-data/`. Create `[filename]-desc.md` sidecar. If image contains text/data → extract all text. |
| **Audio** | Store in `others-data/`. Request transcription if needed. Transcript goes to `Scripts/`. |
| **Video** | Do NOT store in workspace (too large). Log URL only in daily log. Transcribe if needed. |

**Non-text file conversion rule:**
- If a source file is NOT `.md`, you MUST read it and produce a structured `.md` file holding the pure informational substance
- Translate to English if needed, strip filler, but preserve ALL logic/facts precisely
- The original non-md file remains untouched in its location
- **Hard Stop:** Do not mark a non-md file as processed until its `.md` equivalent exists

## 2.12 Deduplication Pre-Flight

Before storing any new data:

1. Check existing files in `data/[focus]-data/` for identical or similar content
2. **Identical check:** If exact content already exists → skip. Log `[TRIAGE]` with "duplicate" reason.
3. **Similar check:** If very similar content exists:
   - If new content adds value → keep both. Note the relationship.
   - If new content is a subset → skip. Log `[TRIAGE]`.
   - If new content is a superset → archive the old, keep the new. Log `[DECISION]`.

## 2.13 Data Cleaning Standards

When structuring raw content into clean markdown:

- **Never summarize.** Preserve every detail.
- Group related info under clear headings
- Place similar things together
- Strip noise (ads, boilerplate, off-topic content) but keep ALL substance
- Use consistent markdown formatting (headers, lists, code blocks)
- Ensure all file references use relative paths from workspace root
- Apply the metadata header format for all scripts (see § 2.10)

## 2.14 Data Graph

The data graph tracks relationships between data items, skills, and products.
Maintained during Data Intake and Skill Promotion.
Format: each entry shows lineage (what feeds what):

```
data/[focus]-data/[subfolder]/[filename]
  → feeds → skills/[focus]-skills/[skill-name]/SKILL.md
  → outcome → products/[focus]-products/[product-name]/
```

**When to update:**
- After every Data Intake → add source entry
- After every Skill Promotion → link data source to new skill
- After every Product Build → link skill to product

**Graph entries live at the bottom of this file** in § Data Graph Entries.

**Change Detection Rules:**
- **Unprocessed data detection:** When scanning for skill promotion candidates, compare data files in `data/[focus]-data/Skills/` against the Data Graph entries. Any data file NOT referenced in the graph = unprocessed = evaluate for skill promotion.
- **Skill change propagation:** When a skill is enhanced (`[ENHANCED]`), check the Data Graph for products that depend on that skill. If any exist → flag those products for update. Log `[DECISION]` with affected products.
- **New data propagation:** When new data is added that relates to an existing skill (detected via source tracking comments in skills — see § 3.11), that skill should be evaluated for expansion.

## 2.15 Phase 2 — Logging Reference

| Event | Tag | Where |
|-------|-----|-------|
| New data acquired | `[NEW-DATA]` `[focus_name]` | Daily memory file |
| Data classified/triaged | `[TRIAGE]` `[focus_name]` | Daily memory file |
| Data placement decision | `[DECISION]` `[focus_name]` | Daily memory file |
| Research completed | `[NEW-DATA]` `[research]` `[focus_name]` | Daily memory file |
| Duplicate detected | `[TRIAGE]` `[focus_name]` | Daily memory file |

## 2.16 Phase 2 — Error Recovery

| Situation | Action |
|-----------|--------|
| Source unavailable / can't be read | Retry once. Try alternative URL or tool. If still failing → Log [ERROR]. Skip and continue. |
| Can't determine which focus | Follow § 2.9 Focus Assignment Decision Tree. If truly ambiguous → `_temp-data/`. Log [DECISION]. |
| Source is paywalled or proprietary | Do NOT intake. Flag to Director. Log [TRIAGE]. |
| Data conflicts with existing content | Keep both versions. Document the conflict. Flag for Director review. |
| Tool failure during scraping | Retry once with different tool/approach. Log [ERROR] if persistent. |
| Non-md file can't be converted | Store original in `others-data/`. Create description sidecar. Log [ERROR]. |

## 2.17 Phase 2 — Boundaries & Hard Rules

- **Never store data in workspace root.** Everything goes inside `data/[focus]-data/[subfolder]/`.
- **Never process unknown sources without flagging first.** Check credibility via § 2.7.
- **Never overwrite existing data.** Create new file or archive old one.
- **Never summarize raw content.** Preserve ALL substance. Restructure and reorganize, but keep every detail.
- **File naming:** lowercase, hyphens. e.g., `facebook-ads-testing_ilyes.md`. Never date prefixes in active filenames.
- **Relative paths only** in all memory files and data references.
- **YouTube scripts = #1 data source.** Follow the Director note: full scripts, high views, recent videos, detailed knowledge files.
- **No data in workspace root.** No `.ps1`, `.txt`, `.csv` files in root.

---

---

# ═══════════════════════════════════════════════════════════════
# PHASE 3 — SKILLS
# ═══════════════════════════════════════════════════════════════

## 3.1 Purpose

Transform raw data material from `data/` into live, production-quality skills in `skills/`. Skills are actionable, repeatable processes and knowledge files that Pipeclaw or the Director can execute to produce real value. Skills can include knowledge content — detailed, structured knowledge documents that teach a complete topic as thoroughly as watching the original source.

## 3.2 When This Phase Runs

- A Goal in Goals Tracker requires skill creation or promotion
- `data/[focus]-data/Skills/` contains new unprocessed raw material (knowledge files ready for promotion)
- A research run identified actionable frameworks or templates
- Director assigns a skill-related task
- Mode = AUTO and unprocessed skill material exists

## 3.3 Inputs

- Raw material in `data/[focus]-data/Skills/` (knowledge files, templates, frameworks)
- Raw scripts in `data/[focus]-data/Scripts/` (may need conversion to knowledge first — see Phase 2)
- Reports in `data/[focus]-data/Reports/` (may contain actionable processes)
- Existing live skills in `skills/[focus]-skills/` (to check for duplicates/merge opportunities)
- focuses/[focus]/[focus]-brief.md (focus context)
- MEMORY.md § Facts (validated constraints)
- Data Graph (§ 2.14) for lineage tracking

## 3.4 Outputs

- New or updated `skills/[focus]-skills/[skill-name]/SKILL.md`
- Updated Data Graph entry linking source data → skill
- Log entries in today's daily memory file

## 3.5 Skill Promotion Framework — Evaluation Criteria

Before promoting raw material to a live skill, assess against these 5 criteria:

| # | Criterion | Question | Pass If |
|---|-----------|----------|---------|
| 1 | **Capability Gap** | Does this fill a gap in existing skills? Or duplicate? | Fills a real gap. No existing skill covers this. |
| 2 | **Actionability** | Can Pipeclaw actually execute this skill with available tools? | All referenced tools/resources are available. |
| 3 | **Specificity** | Is it specific enough to produce repeatable results? | Step-by-step instructions, not vague directives. |
| 4 | **Quality Bar** | Would the output be sellable to a real person? (Taste Check) | Production-quality. Not boilerplate or AI-generic. |
| 5 | **Maintenance Cost** | Will this skill rot quickly, or stay useful over time? | Stays useful for 3+ months without major updates. |

**Scoring:**
- 4-5/5 Pass → **Promote.** Create the live skill.
- 3/5 Pass → **Refine first.** Improve the raw material, then re-evaluate.
- <3/5 Pass → **Archive.** Move to `archive/data-archive/`. Log `[TRIAGE]`.

## 3.6 Skill Promotion Process

**Pre-step — Full Bundle Ingestion:**
When processing data for skill promotion, you MUST process data as bundles (folders), not isolated files:
- If a data item is a folder, read and synthesize ALL files inside it regardless of extension (`.json`, `.txt`, `.md`, `.yaml`, `.py`, etc.). Zero tolerance for skipping files.
- If the files include ready-to-use skills (e.g., from an external repo), do NOT just copy them over. Integrate their logic into the correct skill.
- Process non-md files using their `.md` equivalent if one exists (see Phase 2 § 2.11).

1. List raw material in `data/[focus]-data/Skills/` that has no matching skill in `skills/`
2. For each candidate, evaluate using § 3.5 Skill Promotion Framework
3. Score each criterion (Pass/Fail)
4. If scoring allows promotion:
   a. Check if existing skill in `skills/` covers the same domain (deduplication)
      - **YES, exact same logic** → Do not create. Mark data as processed.
      - **YES, same domain but new content** → Merge into existing skill. Never lose a line of logic from either side.
      - **NO match** → Create new skill.
   b. Draft SKILL.md with proper YAML frontmatter
   c. Write detailed step-by-step instructions (or comprehensive knowledge content)
   d. Define expected outputs and quality bar
   e. Run § 3.7 Skill Quality Checklist — all items must pass
   f. Internal Taste Check: is this production-quality or boilerplate?
   g. Create folder: `skills/[focus]-skills/[skill-name]/`
   h. Write SKILL.md to that folder
   i. Link source data → new skill in Data Graph (§ 2.14)
   j. Log `[PROMOTED]` in today's daily memory file

## 3.7 Skill Quality Checklist

Before a SKILL.md is written and placed in `skills/`, verify ALL of these:

- [ ] YAML frontmatter has: `name`, `description`, `metadata` (emoji, os)
- [ ] Description is one clear sentence that explains what the skill does
- [ ] Instructions are step-by-step, not vague — OR knowledge content is detailed and complete
- [ ] References to data paths are correct and use relative paths
- [ ] Expected outputs are defined (what does success look like?)
- [ ] Does NOT duplicate an existing skill (check all `skills/` folders first)
- [ ] Passes the Taste Check (production-quality, not boilerplate)
- [ ] All referenced tools/resources are actually available on this system
- [ ] Knowledge content (if applicable) is as detailed as the original source material

**If any item fails → do NOT create the skill. Fix the issue first.**

## 3.8 SKILL.md File Format

Every live skill follows this format:

```yaml
---
name: lowercase-hyphenated-name
description: One clear sentence describing what this skill does
metadata:
  emoji: 🔧
  os: windows
---
```

```markdown
# [Skill Name]

## Purpose
[What this skill does and why it exists]

## Instructions
[Step-by-step operational instructions — OR detailed knowledge content]

## Expected Outputs
[What success looks like when this skill is executed]

## Quality Bar
[Minimum standard for output quality]

## Source
[Link to source data files that fed this skill — relative paths]
```

## 3.9 Skill Naming Convention

- **Universal naming:** Skills MUST be named by their universal function, NEVER by their source repository, author name, or random string
- **Format:** `[category]-[what-it-does]` (e.g., `ecommerce-facebook-ads-strategy`, `study-math-problem-solving`)
- **Lowercase with hyphens** — consistent with TOOLS.md § File Naming

## 3.10 Knowledge vs. Operational Skills

Skills can be two types:

| Type | Contains | Example |
|------|----------|---------|
| **Operational Skill** | How-to workflow steps, tool invocations, decision logic, process definitions | `ecommerce-product-pricing` — steps to price a product for Algerian market |
| **Knowledge Skill** | Detailed educational content, structured teachings, comprehensive topic coverage | `ecommerce-facebook-ads-complete-guide` — full teaching on FB ads from multiple video sources |

**Both types are valid live skills.** Knowledge skills serve as reference material for the Director and Pipeclaw when executing related tasks.

**Knowledge Skill Rules:**
- Must be as detailed as the original source material (not summaries)
- Must be structured with logical sections, headers, and clear organization
- Must include ALL techniques, examples, numbers, and explanations from the original
- Must have a Source footer linking back to original data files
- Can be merged from multiple data sources into one comprehensive skill

## 3.11 Skill Expansion (Merging New Data into Existing Skills)

When new data arrives that relates to an existing skill:

```
New data for existing skill domain
  │
  ├─ Exact duplicate logic? → Skip. Do not add. Log [TRIAGE].
  │
  ├─ New content that adds value?
  │    YES → Merge into existing skill:
  │         - Add clearly labeled new sections
  │         - Tag each new section: `<!-- Added: YYYY-MM-DD | Source: data/[focus]-data/[subfolder]/[filename] -->`
  │         - Do NOT break existing logic — append, don't overwrite
  │         - Never lose a single line of logic from either side
  │         - Update the Source footer with new data references
  │         - Log [ENHANCED] in daily memory file
  │
  │    **Change Propagation:** After merging, check Data Graph (§ 2.14)
  │    for products that depend on this skill. If any → flag for update.
  │
  └─ Different enough to warrant its own skill?
       YES → Create new skill per § 3.6. Log [PROMOTED].
       NO  → Merge. Log [ENHANCED].
```

## 3.12 Knowledge Audit

Periodically verify skill integrity:

1. **No data leakage INTO operational skills:** Market insights, research, raw data that belongs in `data/` should not be inside an operational skill file. If found → extract to correct `data/[focus]-data/` subfolder, replace with a reference in the skill.
   - **Exception:** Knowledge skills ARE allowed to contain detailed educational content — that is their purpose.
2. **No duplicate skills:** If two skills in `skills/` cover identical domains or functions → merge them immediately. Never lose a single line of logic.
3. **References valid:** All data path references in skills still point to existing files.
4. Log `[AUDIT]` in daily memory file after each knowledge audit.

## 3.13 Phase 3 — Logging Reference

| Event | Tag | Where |
|-------|-----|-------|
| New skill promoted | `[PROMOTED]` `[focus_name]` | Daily memory file |
| Existing skill expanded | `[ENHANCED]` `[focus_name]` | Daily memory file |
| Knowledge audit performed | `[AUDIT]` `[focus_name]` | Daily memory file |
| Skill candidate rejected | `[TRIAGE]` `[focus_name]` | Daily memory file |
| Raw material archived | `[ARCHIVED]` `[focus_name]` | Daily memory file |

## 3.14 Phase 3 — Error Recovery

| Situation | Action |
|-----------|--------|
| Raw material is ambiguous or unclear | Ask Director for clarification before promoting. Log [DECISION]. |
| Can't determine which skill to extend | Check existing skills in `skills/[focus]-skills/`. If still unclear → ask Director with options. |
| Skill fails quality checklist | Do NOT promote. Fix the failing items first. Re-evaluate. |
| Skill duplicates an existing one | Merge into existing. Never create a parallel version. Log [DECISION]. |
| Referenced tools/resources unavailable | Log as blocked. Flag to Director. Do not create a skill that can't be executed. |
| Corrupted skill file | Archive corrupted version to `archive/skills-archive/`. Recreate from source data. |

## 3.15 Phase 3 — Boundaries & Hard Rules

- **Never create low-quality or redundant skills.** "Average is failure." Every skill must be production-ready.
- **Never ship skills that duplicate existing ones** without merging/enhancing first.
- **Never archive to `archive/skills-archive/`** without logging `[ARCHIVED]`.
- **Instructions must be step-by-step, not vague** — for operational skills.
- **Knowledge content must be as detailed as the original source** — for knowledge skills.
- **Every skill = its own folder** containing SKILL.md with YAML frontmatter.
- **Focus skill folders** (`skills/[focus]-skills/`) are organizational containers — they do NOT need their own SKILL.md.
- **Always update the Data Graph** when promoting or enhancing a skill.
- **Taste Check everything.** If output feels "standard" or "AI-generated" → refine again. Production-ready = can be sold to real people for real money.

---

---

# ═══════════════════════════════════════════════════════════════
# PHASE 4 — PRODUCTS
# ═══════════════════════════════════════════════════════════════

## 4.1 Purpose

Build and deploy actual deliverable products using live skills. Products are the tangible outputs that can be sold, shipped, or used to generate revenue. A product combines one or more skills into a concrete deliverable for a target audience.

## 4.2 When This Phase Runs

- A Goal in Goals Tracker requires product building or deployment
- Director assigns a product-related task
- Live skills exist in `skills/[focus]-skills/` that are ready to be applied
- Mode = AUTO and a focus has mature skills but no product yet

## 4.3 Inputs

- Live skills in `skills/[focus]-skills/` (the capabilities to build with)
- focuses/[focus]/[focus]-brief.md (market context, target audience, pricing)
- MEMORY.md § Facts (validated constraints)
- Data Graph (what feeds what)
- Director's product requirements from Goals Tracker

## 4.4 Outputs

- Deployable product stored in `products/[focus]-products/[product-name]/`
- Product brief/spec document in the product folder
- Updated Data Graph entry linking skill → product
- Log entries in today's daily memory file

## 4.5 Product Decision Tree

```
Skills exist for a focus
  │
  ├─ Q1: Does the Director have a specific product idea?
  │    YES → Build to Director's spec. Follow Goals Tracker task.
  │    NO  ↓
  │
  ├─ Q2: Does the focus brief mention a product direction?
  │    YES → Draft product concept. Present to Director for approval.
  │    NO  ↓
  │
  ├─ Q3: Can existing skills be combined into a sellable product?
  │    YES → Draft product concept. Present to Director for approval.
  │    NO  ↓
  │
  └─ Q4: Do skills need more development before a product is viable?
       YES → Return to Phase 3. Log [DECISION].
       NO  → Escalate to Director. Ask for direction.
```

## 4.6 Product Types

| Type | Description | Example |
|------|-------------|---------|
| **SaaS / Web App** | Hosted software service | Algerian e-commerce pricing tool |
| **Template / Framework** | Reusable document or system | Business automation template pack |
| **Service Deliverable** | One-off or recurring consulting output | Prompt engineering audit report |
| **Digital Product** | Downloadable resource | Study guide, knowledge base |
| **Website / Landing Page** | Web presence for a product or service | Freelance portfolio site |

## 4.7 Product Building Process

1. **Define:** Create product brief with:
   - Product name and one-line description
   - Target audience (who pays for this?)
   - Problem it solves
   - Features list (MVP scope)
   - Pricing model (DZD-first, local-first)
   - Skills that power this product (reference `skills/[focus]-skills/[name]`)
   - Success criteria (what does "done" mean?)
   - Store brief in `products/[focus]-products/[product-name]/product-brief.md`

2. **Build:** Follow the skills' instructions to build the actual deliverable
   - Use available tools (code, web, files)
   - All product files go in `products/[focus]-products/[product-name]/`
   - Follow quality standards from SOUL.md (production-level excellence)
   - Test each component before integrating

3. **Verify:** Before declaring a product complete:
   - Does it solve the stated problem?
   - Would someone pay real money for this? (Taste Check)
   - Does it work on the target platform?
   - Are all dependencies documented?

4. **Document:** Update all tracking:
   - Add product → Data Graph (§ 2.14)
   - Update focuses/[focus]/[focus]-brief.md with product status
   - Log completion in daily memory file

5. **Monitor:** After product is live:
   - When source skills are enhanced ([ENHANCED]), check if this product needs updating
   - Use Data Graph (§ 2.14) Change Detection Rules to identify affected products
   - Log `[DECISION]` when deciding to update or keep current version

## 4.8 Product Quality Standards

- **Production-ready** means: can be delivered to a paying customer without embarrassment
- **Local-first:** All pricing in DZD. All platforms Algerian-accessible. Never assume Western defaults.
- **Taste Check:** If it feels generic, templated, or "AI-generated" → rebuild. Average is failure.
- **Complete:** All features from the product brief's MVP scope must work.
- **Documented:** Clear usage instructions, not just code dump.

## 4.9 Phase 4 — Logging Reference

| Event | Tag | Where |
|-------|-----|-------|
| Product brief created | `[DECISION]` `[focus_name]` | Daily memory file |
| Product built/deployed | `[WORKFLOW]` `[focus_name]` `[done]` | Daily memory file |
| Product iteration | `[ENHANCED]` `[focus_name]` | Daily memory file |

## 4.10 Phase 4 — Error Recovery

| Situation | Action |
|-----------|--------|
| Skills not sufficient to build product | Return to Phase 3. Identify missing skills. Log [DECISION]. |
| Product scope too large for current capabilities | Reduce to true MVP. Log [DECISION]. Proceed with smaller scope. |
| Tool limitation blocks product build | Document limitation. Try alternative approach. If stuck → escalate to Director. |
| Product fails quality check | Do NOT ship. Iterate. If 3 attempts fail → escalate to Director. |
| Target platform inaccessible | Find alternative platform. Log [DECISION]. |

## 4.11 Phase 4 — Boundaries & Hard Rules

- **Never ship a product that fails the Taste Check.** Production-quality only.
- **Never assume pricing in USD.** Local-first: DZD pricing, Algerian platforms.
- **Never build a product without a defined target audience.** Who pays?
- **Never skip the verification step.** Execute-Verify-Report pattern applies.
- **Products must reference their source skills** in the product brief for traceability.
- **Director approval required** before deploying/shipping a product to real customers.

---

---

# ═══════════════════════════════════════════════════════════════
# PHASE 5 — SALES
# ═══════════════════════════════════════════════════════════════

## 5.1 Purpose

Brand, market, and sell finished products to the targeted audience. This phase turns products into revenue. It covers positioning, distribution channels, pricing strategy execution, and actual sales operations.

## 5.2 When This Phase Runs

- A completed product exists and is ready for deployment
- A Goal in Goals Tracker involves marketing, selling, or launching
- Director assigns a sales/marketing task
- Mode = AUTO and a deployable product exists without marketing

## 5.3 Inputs

- Completed product from Phase 4
- Product brief with target audience and pricing
- focuses/[focus]/[focus]-brief.md (market context, platform preferences, competition)
- MEMORY.md § Facts (validated market knowledge)
- Available channels from MEMORY.md § System Constraints (Webchat, Telegram, Discord)
- Live skills related to marketing/sales in `skills/`

## 5.4 Outputs

- All sales and marketing materials stored in `sales/[focus]/`
- Marketing materials (copy, landing pages, social posts)
- Distribution channel setup
- Pricing implementation
- Sales tracking setup
- Revenue generation
- Log entries in today's daily memory file

## 5.5 Sales Decision Tree

```
Product ready for sales
  │
  ├─ Q1: Is the target audience clearly defined?
  │    NO  → Return to Product Brief (Phase 4). Define audience first.
  │    YES ↓
  │
  ├─ Q2: Are distribution channels identified?
  │    NO  → Research channels per focus brief. Use local-first platforms.
  │    YES ↓
  │
  ├─ Q3: Is pricing set in DZD?
  │    NO  → Set pricing. Reference focuses/[focus]/[focus]-brief.md for market rates.
  │    YES ↓
  │
  ├─ Q4: Are marketing materials ready?
  │    NO  → Create marketing materials. Follow § 5.6.
  │    YES ↓
  │
  └─ Launch product on identified channels.
```

## 5.6 Marketing Materials Checklist

Before launching any product:

- [ ] Product description (clear, compelling, in target language)
- [ ] Pricing displayed in DZD
- [ ] Landing page or storefront (if digital product)
- [ ] Social media copy for each distribution channel
- [ ] Contact method for customers (Telegram, email, etc.)
- [ ] At least 1 visual asset (screenshot, demo, or mockup)
- [ ] ALL human/animal faces in generated images must be totally blurred or replaced (MEMORY.md rule)

## 5.7 Distribution Channel Strategy

**Local-first** — always prioritize Algerian platforms and channels:

| Channel Type | Options to Research |
|-------------|-------------------|
| Social Media | Facebook (dominant in Algeria), Instagram, TikTok |
| Messaging | Telegram, WhatsApp |
| Marketplaces | Algerian e-commerce platforms (focus-specific — see brief) |
| Freelance | Platforms identified in work focus research |
| Direct | Landing page, email, Discord |

**Channel selection process:**
1. Read focuses/[focus]/[focus]-brief.md for platform preferences
2. Match product type to best channel (digital = online, service = platform + direct)
3. Start with 1-2 channels max. Expand only after traction.
4. Log channel decisions with [DECISION] tag

## 5.8 Pricing Guidelines

- **Always DZD.** Never assume USD or EUR.
- Research competitor pricing in the Algerian market (see focuses/[focus]/[focus]-brief.md)
- Consider purchasing power of Target Audience
- Offer clear pricing tiers if applicable
- Document pricing rationale with [DECISION] log

## 5.9 Phase 5 — Logging Reference

| Event | Tag | Where |
|-------|-----|-------|
| Marketing materials created | `[WORKFLOW]` `[focus_name]` `[release]` | Daily memory file |
| Product launched on channel | `[WORKFLOW]` `[focus_name]` `[release]` | Daily memory file |
| Sale made | `[WORKFLOW]` `[focus_name]` `[done]` | Daily memory file |
| Pricing set | `[DECISION]` `[focus_name]` | Daily memory file |
| Channel selected | `[DECISION]` `[focus_name]` | Daily memory file |

## 5.10 Phase 5 — Error Recovery

| Situation | Action |
|-----------|--------|
| No sales after launch | Analyze: is it pricing? Channel? Product quality? Adjust one variable. Test again. |
| Target audience unclear | Return to Phase 4 product brief. Define audience. |
| Platform unavailable in Algeria | Find alternative. Log [DECISION]. |
| Marketing materials fail quality check | Redo. Taste Check applies here too. Average is failure. |
| Customer complaint about product | Document issue. Fix in product (Phase 4). Re-deploy. |

## 5.11 Phase 5 — Boundaries & Hard Rules

- **Never sell a product that hasn't passed Phase 4 quality check.** Ship only production-ready.
- **Never price in USD.** DZD-first. Always.
- **Never use generated images with visible human/animal faces.** Must be blurred or replaced.
- **Never launch without Director approval** for the first launch of a product.
- **Never spam channels.** Quality over quantity in marketing.
- **Track every sale** — even informal ones. Revenue visibility is critical.

---

---

# ═══════════════════════════════════════════════════════════════
# DATA GRAPH ENTRIES
# ═══════════════════════════════════════════════════════════════

> Track relationships between data items, skills, and products below.
> Format:
> ```
> data/[focus]-data/[subfolder]/[filename]
>   → feeds → skills/[focus]-skills/[skill-name]/SKILL.md
>   → outcome → [product deliverable, if any]
> ```

[Empty — entries added during Data Intake and Skill Promotion]

---