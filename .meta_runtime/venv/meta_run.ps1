# ─── Agentic OS — Cross-Platform Python Launcher (Windows) ────────────────────
# Ensures the workspace venv exists, loads .env, then forwards args to python.
# Usage:
#   .\.meta_runtime\venv\meta_run.ps1 .meta_brain\meta_sync.py
#   .\.meta_runtime\venv\meta_run.ps1 -m notebooklm <command>
# ──────────────────────────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

$VenvScript = Join-Path $PSScriptRoot "bootstrap.ps1"
$PyExe      = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
$EnvFile    = Join-Path $PSScriptRoot ".env"

# 1. Ensure venv is built and healthy.
& $VenvScript

# 2. Load workspace .env into the current process (key=value pairs only).
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*([^#=\s][^=]*)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim())
        }
    }
}

# 3. Forward all args to the venv python.
& $PyExe @args
exit $LASTEXITCODE
