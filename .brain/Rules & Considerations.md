
## Rules

### 🌍 Global System Rules
These rules apply to ALL agents and ALL operations, without exception.

- **No native internet**: Requires tool call for web access. Use tools like WebSearch for current infos, documentations, general research and WebFetch for specific URL content.
- **Strict Toolbox Maintenance**: Never create, rename, or move a file/folder within `.toolbox/`, `.brain/`, or root resources without immediately updating `.brain/.toolbox.control/.toolbox.registry/`.
- **Modify over Rewrites**: For existing files, modifying specific parts is better than rewrites. Rewrite only when a refactor is needed or the audit is large.
- **Check correct placement**: Check placement before creating/moving files and folders. Look for similar content, extend if it exists. **Use the root `scratch/` for all temporary scripts, drafts, or test files.** Never litter the root directory.
- **Archive, never delete**: Unless explicitly told to. Move deprecated content to the root `archive/` folder preserving structure.
- **BOARD.yaml is the source of truth**: Update it immediately as goals progress. Never batch updates. Always read it at the start of every turn.

### 🎯 Domain-Specific Rules
These rules apply when operating within specific contexts or domains.

#### 🎨 Studio & Creative
- **Avoid Living Faces**: ALL faces of humans or animals (livings) in generated images must be totally avoided, blurred or replaced.
- **No musique**: In generated videos or published posts.

#### ⚙️ Engineering & Quality
- **Quality Standards (Taste Check)**: Before marking work complete, ask:
  1. Does this look intentional? - Not template-generic, not AI-generated
  2. Would I ship this to a real customer? - No embarrassment test
  3. Is it end-to-end functional? - Not partial implementation
  4. Are edge cases handled? - Error paths, empty states, loading
  5. Is it maintainable? - Clear names, focused functions, documented

  **If any answer is "no" → Taste Check again. Average is failure.**
