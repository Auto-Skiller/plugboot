---
name: Commands Index
type: Navigation
description: Catalog of executable prompts and invocation patterns
---

## What is in this folder?

This folder contains executable prompts (slash commands) for various tools and actions, partitioned by domain.

## When should the AI read files from here?

Read files from this folder when the user invokes a slash command or when a task matches a known command pattern.

## How to navigate and use the contents?

- **Structure**: **Domain** -> Semantic routing by tool/action → prune search space.
- **Format**: `domain/` directories containing `[action]-[target].md` files.
- Route semantically by domain and the action-oriented naming to find the correct command definition.