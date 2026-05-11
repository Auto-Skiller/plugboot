# 🚀 Agent Quick Start Guide

Welcome to Agentic OS v5. When you land in this workspace, follow this exact sequence:

1. **Load Environment** — If you need to execute tools, load `.env` variables into your shell session to ensure paths like `NOTEBOOKLM_HOME` are active.
2. **Read `CONTROLER.yaml`** — This is your state. Find your assigned Session and Goal. If you don't have one, create one based on the user's prompt.
3. **Read `.brain/meta.router.yaml`** — This is your map. Do not guess paths. Use this file to locate the `.sync_engine/`, `.toolbox_library/`, and operational documents.
4. **Scan `.runtime/.mission_board/` Context** — Read the physical target files for your assigned goal to understand deep context and requirements.
5. **Check `requirements.txt`** — If you need to execute a python tool or install a package, verify dependencies first. Use `.\.venv\Scripts\python.exe` strictly.
6. **Follow the 10-Step Flow** — Execute tasks deterministically and update `.runtime/.mission_board/` as you go.

> **CRITICAL LAW:** You are part of a multi-agent system. Everything you do MUST be logged in the physical files so the next agent can pick up exactly where you left off.
