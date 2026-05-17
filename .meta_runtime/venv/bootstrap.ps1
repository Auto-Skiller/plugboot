# ─── Agentic OS — Python Venv Bootstrap (Windows) ─────────────────────────────
# Creates .meta_runtime/venv/.venv if missing, then installs requirements.txt.
# Idempotent: safe to call on every boot.
# ──────────────────────────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

$VenvDir   = Join-Path $PSScriptRoot ".venv"
$ReqFile   = Join-Path $PSScriptRoot "requirements.txt"
$PyExe     = Join-Path $VenvDir "Scripts\python.exe"
$PyvenvCfg = Join-Path $VenvDir "pyvenv.cfg"

function Resolve-HostPython {
    # Prefer 'py -3' launcher, fall back to 'python' on PATH.
    $py = Get-Command py -ErrorAction SilentlyContinue
    if ($py) { return @("py", "-3") }
    $python = Get-Command python -ErrorAction SilentlyContinue
    if ($python) { return @("python") }
    throw "No host Python found. Install Python 3.10+ from python.org or 'winget install Python.Python.3.12'."
}

function Test-VenvHealthy {
    if (-not (Test-Path $PyExe))     { return $false }
    if (-not (Test-Path $PyvenvCfg)) { return $false }
    # Detect cross-OS pollution (Linux paths in pyvenv.cfg).
    $cfg = Get-Content $PyvenvCfg -Raw
    if ($cfg -match "/home/" -or $cfg -match "/usr/" -or $cfg -match "/app/") { return $false }
    # Smoke-test: can the interpreter actually run?
    try {
        & $PyExe -c "import sys" 2>$null | Out-Null
        return $LASTEXITCODE -eq 0
    } catch { return $false }
}

if (Test-VenvHealthy) {
    Write-Host "[bootstrap] venv healthy at $VenvDir"
} else {
    if (Test-Path $VenvDir) {
        Write-Host "[bootstrap] removing stale/cross-OS venv at $VenvDir"
        Remove-Item -Recurse -Force $VenvDir
    }
    $hostPy = Resolve-HostPython
    Write-Host "[bootstrap] creating venv with $($hostPy -join ' ')"
    & $hostPy[0] $hostPy[1..($hostPy.Length-1)] -m venv $VenvDir
    & $PyExe -m pip install --upgrade pip --disable-pip-version-check | Out-Null
    if (Test-Path $ReqFile) {
        Write-Host "[bootstrap] installing requirements.txt"
        & $PyExe -m pip install -r $ReqFile --disable-pip-version-check
    }
    Write-Host "[bootstrap] venv ready at $VenvDir"
}

# Re-create the .gitkeep so the empty folder structure persists in git.
$gitkeep = Join-Path $VenvDir ".gitkeep"
if (-not (Test-Path $gitkeep)) { New-Item -ItemType File -Path $gitkeep -Force | Out-Null }
