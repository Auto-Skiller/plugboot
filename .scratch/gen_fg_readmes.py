import os, re

GW = r"C:\Users\BAB AL SAFA\Desktop\plugboot\_os\os-inbox\.os-inbox_gateway"

# Curated role declarations keyed by functional_group folder name.
ROLES = {
  # agent_operating_conventions / Architecture
  "interaction_guidelines": ("Defines how the agent converses with and supports this user — tone, format, examples, and reusable interaction patterns.",
     ["Apply the agreed interaction style on every user turn", "Reuse canned examples/patterns instead of reinventing replies", "Keep responses terse and terminal-friendly for this user"]),
  "profile_and_setup": ("The user's identity, environment, and one-time setup the agent must know before acting.",
     ["Onboard a new session: read mandatory-initial-read", "Know the user profile + machine/workspace setup", "Honor setup constraints when configuring tooling"]),
  "security_and_boundaries": ("Hard limits on what the agent may and may not do for this user (out-of-scope + security posture).",
     ["Reject out-of-scope requests per OUT-OF-SCOPE", "Apply the security rules in SECURITY.md", "Stop before any boundary-violating action"]),
  # engineering_methodologies / Architecture
  "ecc": ("Error-correcting-codes methodology — design/analyse ECC schemes.", ["Use when a task needs ECC theory or implementation"]),
  "gan system": ("Generative-adversarial-network methodology — build/train/evaluate GANs.", ["Use when a task needs a GAN pipeline"]),
  "gsd": ("Goal-Specify-Develop methodology — multi-phase goal-driven engineering with verify/validate skills.", ["Use for large multi-phase engineering work"]),
  "hookify": ("Conversation-hook methodology — turn recurring behaviours into configurable hooks.", ["Use to capture/automate repeated interaction patterns"]),
  "instinct system": ("Skill-lifecycle methodology — import/export/evolve/promote/prune skills.", ["Use to manage the skill lifecycle"]),
  "prp system": ("Product-Requirements-Process — plan/PRD/implement/commit/review a feature from requirements.", ["Use to drive a feature from PRD to PR"]),
  # capability_and_skill_library / Capabilities (curated for renamed)
  "adversarial_review": ("Grill the agent with hard questions to surface weak reasoning before shipping.", ["Run agrgressive critique pass on a plan or answer"]),
  "agent_personas": ("Reusable expert personas the agent can adopt for a task (architect, SEO, a11y, chief-of-staff, ...).", ["Adopt a persona to specialize tone/expertise", "Pick the right expert for a sub-problem"]),
  "article_editing": ("Edit and refine long-form articles.", ["Use to rewrite/polish an article draft"]),
  "brainstorming": ("Generate and structure ideas for a problem.", ["Use to expand options before committing"]),
  "browser_automation": ("Drive a headless browser for research, scraping, UI testing, and company/event prospecting.", ["Automate web research or UI checks", "Scrape or interact with web apps"]),
  "code_and_build": ("Build-system resolution and build execution across languages.", ["Resolve/build a project's build", "Fix build failures"]),
  "code_migration": ("Migrate code into a target structure/tooling (shoehorn-style).", ["Use to reshape code into a new layout"]),
  "code_quality_techniques": ("Techniques for writing deep, testable, refactored modules.", ["Apply quality patterns (mocking/deep-modules/refactor)", "Review code for common bug patterns"]),
  "coding_standards": ("Enforce and refactor toward coding standards.", ["Run a coding-standards pass", "Simplify/refactor code to standard"]),
  "context_management": ("Manage context budget, session save/resume/continue.", ["Save/resume a session", "Advise on token/context budget"]),
  "dev_automation": ("Automate dev-fleet and harness operations/eval.", ["Run dev-fleet or harness-optimizer tasks", "Automate eval of changes"]),
  "dev_learning_and_retrospective": ("Learn-from-failure and retrospective techniques for continuous improvement.", ["Run a retrospective", "Learn/eval from past runs"]),
  "dev_utilities": ("General dev utilities: code explore/review, build-fix, scraper, git, node-repair.", ["Explore or refactor code", "Fix builds, scrape data, manage git"]),
  "diagnose": ("Diagnose system/runtime problems with scripts + a diagnosis skill.", ["Run diagnosis on a failing system"]),
  "document_review": ("Review documents against a structured ADR/CONTEXT format.", ["Review a doc for format/quality"]),
  "document_translation": ("Translate documents (visa/legal domain aware).", ["Translate a document preserving structure"]),
  "documentation": ("Generate/lookup/update docs.", ["Write or update documentation"]),
  "execution_orchestration": ("Plan execution, multi-backend orchestration, triage, and loop operators.", ["Orchestrate a multi-step plan", "Triage and run execution loops"]),
  "exercise_scaffolding": ("Scaffold coding exercises.", ["Generate a coding exercise"]),
  "framework_scaffolding": ("Scaffold projects in various frameworks + TDD guides.", ["Bootstrap a new project/framework", "Apply TDD guidance"]),
  "improve-codebase-architecture": ("Deepen and improve codebase architecture across languages/interfaces.", ["Run an architecture-improvement pass"]),
  "interface_design": ("UI/brand/design skills: banners, brand, ui-styling, liquid-glass, web quality.", ["Design or review an interface", "Apply brand/ui styling"]),
  "knowledge_vault": ("Operate an Obsidian knowledge vault.", ["Sync/query the user's knowledge vault"]),
  "language_coding_standards": ("Per-language coding standards, hooks, patterns, reviewers (cpp/java/go/rust/swift/...).", ["Apply a language-specific standard", "Review per-language code"]),
  "planning_reviews": ("Plan, run planner reviews, and close planning gaps.", ["Plan work", "Review/close planning gaps"]),
  "prd_generation": ("Generate a PRD from a feature brief.", ["Produce a PRD"]),
  "receiving-code-review": ("Absorb and act on incoming code review.", ["Apply reviewer feedback"]),
  "release_and_ops": ("Release/ops automation: jira, pm2, pre-commit, open-source packaging/forking.", ["Cut a release", "Wire CI/pre-commit", "Package/fork OSS"]),
  "requesting-code-review": ("Request a code review effectively.", ["Open a review request"]),
  "skill_authoring": ("Author a new SKILL.md.", ["Write a skill from scratch"]),
  "skill_pack_setup": ("Set up the matt-pocock skill pack (issue trackers + domain).", ["Install/configure the matt-pocock skills"]),
  "slides": ("Build slide decks with copywriting/strategy patterns.", ["Produce a slide deck"]),
  "swift_concurrency": ("Swift 6.2 concurrency patterns.", ["Apply Swift concurrency patterns"]),
  "swiftui-patterns": ("SwiftUI UI patterns.", ["Apply SwiftUI patterns"]),
  "system_reviewers": ("Specialized reviewers: code/security/perf/healthcare/db/comment/silent-failure.", ["Pick the right reviewer for a domain"]),
  "tracking_and_state": ("Track roadmap/requirements/milestones/checkpoints.", ["Record project state", "Manage roadmap/milestones"]),
  "triage": ("Triage incoming work against scope.", ["Triage a request", "Enforce out-of-scope"]),
  "ubiquitous-language": ("Establish a shared domain vocabulary.", ["Align on domain terms"]),
  "video_creation": ("Create videos with Remotion (rules for timing/transitions/captions/...).", ["Produce a Remotion video"]),
  "visual_sketching": ("Throwaway visual sketch variants.", ["Prototype UI variants quickly"]),
}

def fmt_list(items):
    return "\n".join(f"- {i}" for i in items)

written = 0
for pillar in os.listdir(GW):
    pdir = os.path.join(GW, pillar)
    if not os.path.isdir(pdir): continue
    for aspect in os.listdir(pdir):
        adir = os.path.join(pdir, aspect)
        if not os.path.isdir(adir): continue
        for fg in sorted(os.listdir(adir)):
            fdir = os.path.join(adir, fg)
            if not os.path.isdir(fdir): continue
            readme = os.path.join(fdir, "README.md")
            if os.path.exists(readme): 
                continue
            files = [f for f in sorted(os.listdir(fdir)) if f != ".gitkeep" and not f.startswith("README")]
            role, funcs = ROLES.get(fg, (
                f"Functional group '{fg}' under {pillar}/{aspect}: holds capabilities related to {fg.replace('_',' ')}.",
                [f"Use the resources in this group for {fg.replace('_',' ')} work"] + [f"Reference: {f}" for f in files[:8]]
            ))
            text = f"# {fg}\n\n**Pillar:** {pillar}  **Aspect:** {aspect}\n\n## Role\n{role}\n\n## Functionalities\n{fmt_list(funcs)}\n\n## when_to_use\nWhen a task maps to the function(s) above.\n\n## triggers\n- when a task requires {fg.replace('_',' ')}\n- when activating a capability housed in this group\n"
            with open(readme, "w", encoding="utf-8") as fh:
                fh.write(text)
            written += 1
print(f"README role-declarations written: {written}")
