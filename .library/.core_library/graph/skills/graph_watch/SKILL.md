# SKILL: graph_watch

**Engine:** `map_engine` (graphify)
**Runtime:** Python + watchdog — zero LLM cost
**Trigger:** `/graph-watch <path>` or `graphify watch <path>`

## What This Skill Does

Live file system watcher. Auto-triggers `graph_update` when code files change.
For non-code file changes (docs, images), writes a `needs_update` flag and notifies — does NOT auto-run LLM extraction.

## When To Use

- Run once at workspace start as a background daemon
- Keep running during active development sessions
- Do NOT run during CI/CD — use explicit `graph_update` there

## Execution

```bash
# Start watcher (foreground):
graphify watch <target_path>

# Start watcher with custom debounce (seconds):
graphify watch <target_path> --debounce 5.0

# Via Python wrapper (see scripts/watch_daemon.py):
python .library/.engines_library/registry_engine/skills/graph_watch/scripts/watch_daemon.py <target_path>
```

## Behavior (from map_engine/graphify/watch.py)

| File type changed | Action |
|------------------|--------|
| Code file (`.py`, `.ts`, etc.) | Immediately runs AST rebuild — zero LLM |
| Doc/paper/image | Writes `graphify-out/needs_update` flag, prints notification |
| File in `graphify-out/` | Ignored (prevents rebuild loops) |
| Hidden file/dir (`.git`, etc.) | Ignored |

## Debounce

Default 3.0 seconds. Waits for last change before triggering rebuild.
Prevents running on every keystroke when many files save at once.

## Stopping

Press `Ctrl+C`. Observer cleans up automatically.

## Check Update Flag (for non-code changes)

```bash
python -c "
from graphify.watch import check_update
from pathlib import Path
check_update(Path('.'))
"
```
