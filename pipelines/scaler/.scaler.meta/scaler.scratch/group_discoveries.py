import os
import shutil
from pathlib import Path

base_path = Path(r"c:\Users\BAB AL SAFA\Desktop\open-workspace\pipelines\scaler\EXTERNAL\discoveries")
inbox_path = base_path / ".mixed" / ".mixed_inbox"
caps_path = base_path / "capabilitys"
biz_path = base_path / "bussiness"
arch_path = base_path / "architecture"

# Categories mapping
categories = {
    "cpp_tools": ["cpp"],
    "flutter_tools": ["flutter", "dart"],
    "go_tools": ["go-"],
    "java_tools": ["java-"],
    "kotlin_tools": ["kotlin"],
    "rust_tools": ["rust"],
    "python_tools": ["python"],
    "typescript_tools": ["typescript"],
    "csharp_tools": ["csharp"],
    "design_and_ui": ["ui-", "design", "a11y", "liquid-glass", "banner"],
    "opensource_tools": ["opensource"],
    "planning_and_architecture": ["plan", "architect", "chief-of-staff", "zoom-out"],
    "testing_and_qa": ["test", "tdd", "qa", "eval", "verify"],
    "healthcare": ["healthcare"],
    "browser_and_web": ["browserbase", "data-scraper"],
    "git_and_github": ["git", "pr-", "review-pr", "to-issues", "finishing-a-development-branch"],
    "dev_loop_and_execution": ["loop-", "multi-", "execute", "checkpoint", "save-session", "resume-session"],
    "code_review_and_analysis": ["review", "code-explorer", "code-simplifier", "type-design", "comment-analyzer"]
}

def move_item(src: Path, dest_dir: Path):
    if not dest_dir.exists():
        dest_dir.mkdir(parents=True, exist_ok=True)
    if src.exists():
        dest_name = src.name
        # avoid overwriting
        if (dest_dir / dest_name).exists():
            dest_name = f"{src.stem}_1{src.suffix}"
        shutil.move(str(src), str(dest_dir / dest_name))
        print(f"Moved {src.name} to {dest_dir.name}")

def categorize_name(name):
    lower_name = name.lower()
    for cat, keywords in categories.items():
        if any(kw in lower_name for kw in keywords):
            return cat
    return "general_tools"

# 1. Standalone files in inbox
standalones = {
    "Making-$$-with-AI-Agents.md": biz_path / "ai_business_guide",
    "CLAUDE.md": caps_path / "guidelines_collection",
    "EXAMPLES.md": caps_path / "guidelines_collection",
    "SKILL.md": caps_path / "guidelines_collection",
}

for item, dest in standalones.items():
    src = inbox_path / item
    if src.exists():
        move_item(src, dest)

# 2. Existing grouped folders
grouped = ["ecc", "gsd", "hookify", "_knowledge", "_templates"]
for g in grouped:
    src = inbox_path / g
    if src.exists():
        move_item(src, caps_path / g.lstrip('_'))

# 3. Cross-folder collections (_agents, _commands, _skills)
collections = ["_agents", "_commands", "_skills"]
for col in collections:
    col_path = inbox_path / col
    if col_path.exists():
        for item in col_path.iterdir():
            if item.name == ".gitkeep":
                continue
            cat = categorize_name(item.name)
            dest = caps_path / cat
            move_item(item, dest)

print("Done grouping.")
