# ─── Agentic OS — Cross-Platform Python Launcher (Windows) ────────────────────
# Ensures the workspace venv exists, loads .env, then forwards args to python.
# Usage:
#   .\.meta_runtime\venv\meta_run.ps1 .meta_brain\meta_sync.py
#   .\.meta_runtime\venv\meta_run.ps1 -m notebooklm <command>
#
# G-CTRL-AUDIT-3 hardening: when bootstrap.ps1 fails, it writes a structured
# `.bootstrap_failed` sentinel in .venv/. We surface that failure here with
# a human-readable error and a non-zero exit, so agents stop dead instead of
# silently failing on a missing interpreter.
# ──────────────────────────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

$VenvScript   = Join-Path $PSScriptRoot "bootstrap.ps1"
$PyExe        = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
$EnvFile      = Join-Path $PSScriptRoot ".env"
$FailSentinel = Join-Path $PSScriptRoot ".venv\.bootstrap_failed"

# 1. Ensure venv is built and healthy. Bootstrap throws on failure (the
# script uses $ErrorActionPreference = 'Stop' + Write-BootstrapFailure).
try {
    & $VenvScript
} catch {
    Write-Error "[meta_run] ERROR: bootstrap failed: $($_.ToString())"
    if (Test-Path $FailSentinel) {
        Write-Host "[meta_run] Failure record:" -ForegroundColor Red
        Get-Content $FailSentinel | Write-Host -ForegroundColor Red
    }
    exit 2
}

# 2. G-CTRL-AUDIT-3: belt-and-braces. Refuse to invoke if the failure
# sentinel exists or the interpreter is missing.
if (Test-Path $FailSentinel) {
    Write-Host "[meta_run] ERROR: workspace venv is in a failed state." -ForegroundColor Red
    Write-Host "[meta_run] Failure record:" -ForegroundColor Red
    Get-Content $FailSentinel | Write-Host -ForegroundColor Red
    Write-Host "[meta_run] Fix the underlying issue and rerun, or:" -ForegroundColor Yellow
    Write-Host "  Remove-Item -Recurse -Force '$(Join-Path $PSScriptRoot ".venv")'; & '$VenvScript'" -ForegroundColor Yellow
    exit 2
}
if (-not (Test-Path $PyExe)) {
    Write-Host "[meta_run] ERROR: $PyExe is missing after bootstrap." -ForegroundColor Red
    Write-Host "[meta_run] Try: Remove-Item -Recurse -Force '$(Join-Path $PSScriptRoot ".venv")'; & '$VenvScript'" -ForegroundColor Yellow
    exit 2
}

# 3. Load workspace .env into the current process (key=value pairs only).
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*([^#=\s][^=]*)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim())
        }
    }
}

# 3b. Redirect Python's bytecode cache out of the substrate (G-PYCACHE-DRIFT
# fix). Without this, every import scatters `__pycache__/` directories
# under .meta_brain/ — version-specific bytecode polluting the logic pillar.
# We point PYTHONPYCACHEPREFIX at one workspace-local cache dir under
# .meta_runtime/__pycache__ so all bytecode lives in the runtime pillar
# (where caches belong, per Hierarchy.md).
#
# Unconditional assignment (G-PYCACHE-LEAK fix): the previous version had
# an `if (-not GetEnvironmentVariable)` guard to allow `.env` overrides,
# but that also let stale values leak in from the parent shell session
# (a previous launcher invocation with the old path would silently keep
# using it forever in the same terminal). The override path was never
# used in practice; reliable canonical placement matters more.
$WorkspaceRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$PycachePrefix = Join-Path $WorkspaceRoot ".meta_runtime\__pycache__"
if (-not (Test-Path $PycachePrefix)) {
    New-Item -ItemType Directory -Path $PycachePrefix -Force | Out-Null
}
[System.Environment]::SetEnvironmentVariable("PYTHONPYCACHEPREFIX", $PycachePrefix)

# 4. Forward all args to the venv python.
& $PyExe @args
exit $LASTEXITCODE
