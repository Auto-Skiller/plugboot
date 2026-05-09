# 🧭 Navigator Engine Protocol

**Type:** Programmatic Tool Execution
**Purpose:** Rapidly scan a specified directory path and output its structural data.

## Input
- `Target Directory Path` (e.g., `.toolbox/` or `.scope/.core/.knowledge/`)

## Execution Steps

1. **Invoke Tool:** The agent uses the `run_command` (or equivalent file system scanning tool like `list_dir` / custom script) to list the contents of the target directory recursively.
2. **Collect Data:** For every file and folder in the target path, collect:
   - Relative Path
   - Item Type (File or Directory)
   - Size in Bytes (if file)
   - `last_modified` timestamp (provided by the OS)
3. **Format Output:** Present the collected data in a structured list or JSON format in memory.
4. **Pass to Cataloger:** This data is immediately fed as input to the Cataloger Engine.

## Critical Rules
- **No file content reading:** The Navigator ONLY looks at metadata. It does not open files.
- **Strict path boundaries:** Do not scan outside the provided target path.
- **Speed is priority:** Use the fastest available method to gather this structural data.
