---
name: coding-rules-enforcer
version: 1.0.0
parent_toolbox: coding
maturity: functional
---

# coding-rules-enforcer

**Description**: Enforces language-specific coding rules, style guidelines, patterns, security, and testing standards. References the extensive language guidelines bank available in this skill directory.
**Use when**: The task involves writing new code or refactoring code in a specific language (e.g., Python, C++, TypeScript, Rust) and you need to apply the canonical coding rules and styles.

## Available Rules Bank
The rules bank contains `.md` files detailing:
- Coding Style (e.g., `python-coding-style.md`)
- Patterns (e.g., `python-patterns.md`)
- Security (e.g., `python-security.md`)
- Testing (e.g., `python-testing.md`)
- Code Review (e.g., `python-review.md`)
- Development Workflow (e.g., `common-development-workflow.md`)

## Operational Protocol
1. **Identify Language**: Determine the programming language of the current project.
2. **Consult Guidelines**: Read the relevant `[language]-*.md` files (e.g. `[language]-coding-style.md`, `[language]-patterns.md`) to internalize the rules.
3. **Apply Rules**: Write or refactor the code strictly adhering to the styles and patterns specified in the guidelines.
4. **Enforce Security**: Verify code against `[language]-security.md` rules before completion.
