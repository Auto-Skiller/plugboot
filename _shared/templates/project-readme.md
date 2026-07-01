# `<project_name>` — Project Overview

> [!NOTE]
> This is the entry point for `<project_name>`.
> This file provides human-readable context for the project. For machine state, metrics, and active missions, refer to `[project_name]-board.yaml` and `[project_name]-index.yaml`.

## 📌 Project Identity
- **Name:** `<project_name>`
- **Description:** A brief explanation of the project's goals, scope, and target audience.
- **Current Phase:** e.g., Discovery, Development, Maintenance.

## 🏗️ Technology Stack
- **Frontend:**
- **Backend:**
- **Database:**
- **Deployment:**

## 📂 Architecture Overview
Briefly describe the physical layout of this project.
Since this project is managed by the Agentic OS, its autonomous infrastructure follows the standard convention:
- `.meta/` — Contains local OS Prompts, toolboxes, and pipeline blueprints.
- `.missions/` — Active sessions and goals.
- `.pipelines_runtime/` — Where pipeline executions and ledgers reside.
- `[content_folders]/` — Core project files, automatically indexed as `ledgers` in the project's index.

## 🚀 Quick Start
Provide instructions on how to build, run, or test this project locally.
```bash
# Example
npm install
npm run dev
```

## 📜 Active Missions
Check `<project_name>-board.yaml` for a real-time status of active missions and progress.
