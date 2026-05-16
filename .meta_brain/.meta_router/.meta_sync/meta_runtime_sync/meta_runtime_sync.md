# 🔋 Runtime Sync Protocol (Agentic OS v5)
> **Schema Version:** 1.0 | Canonical source of truth: `.meta_runtime/` \u2192 `meta_runtime.yaml`

**Role:** Synchronize the physical infrastructure state from `.meta_runtime/` into the `meta_runtime.yaml` router. This ensures the OS always knows which runtime components (venv, auth, scratch) are available.

## When to Execute
- Automatically triggered by `meta_sync.py` during the master sync.
- Manual: `.\.meta_runtime\venv\.venv\Scripts\python.exe .meta_brain\.meta_router\.meta_sync\meta_runtime_sync\meta_runtime_sync.py`

## Logic
1. **Scan Folders:** Iterates through all top-level directories in `.meta_runtime/`.
2. **Extract Metadata:** 
   - Uses folder names as component IDs.
   - Looks for `README.md` first lines for summaries.
   - Falls back to a predefined map for core components (venv, auth, etc.).
3. **Update Router:** Populates `runtime_components` in `meta_runtime.yaml`.
