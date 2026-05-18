# ─── Agentic OS — Python Venv Bootstrap (Windows, v5.3) ───────────────────────
# Creates .meta_runtime/venv/.venv if missing, then installs requirements.txt.
# Idempotent: safe to call on every boot. Uses a sentinel file (.bootstrap_ok)
# for fast-path skip on hot calls (G19). Honors .python-version if py launcher
# is available (G17).
# ──────────────────────────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

$VenvDir    = Join-Path $PSScriptRoot ".venv"
$ReqFile    = Join-Path $PSScriptRoot "requirements.txt"
$PyExe      = Join-Path $VenvDir "Scripts\python.exe"
$PyvenvCfg  = Join-Path $VenvDir "pyvenv.cfg"
$PyVerFile  = Join-Path $PSScriptRoot ".python-version"
$Sentinel   = Join-Path $VenvDir ".bootstrap_ok"

function Resolve-HostPython {
    # G17: honor .python-version when the py launcher is available.
    $py = Get-Command py -ErrorAction SilentlyContinue
    if ($py) {
        if (Test-Path $PyVerFile) {
            $pin = (Get-Content $PyVerFile -Raw).Trim()
            if ($pin) {
                # Try the major.minor portion (py launcher syntax: -3.12).
                $mm = ($pin -split '\.')[0..1] -join '.'
                $check = & py "-$mm" -c "import sys; print(sys.version_info[:2])" 2>$null
                if ($LASTEXITCODE -eq 0) {
                    return @("py", "-$mm")
                }
            }
        }
        return @("py", "-3")
    }
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

# G19: fast-path. If the sentinel exists and the .venv hasn't been touched
# since, skip the full health check. The sentinel is invalidated by a venv
# rebuild or a requirements.txt change (mtime comparison below).
function Test-FastPath {
    if (-not (Test-Path $Sentinel)) { return $false }
    if (-not (Test-Path $PyExe))    { return $false }
    if (Test-Path $ReqFile) {
        $reqMtime      = (Get-Item $ReqFile).LastWriteTimeUtc
        $sentinelMtime = (Get-Item $Sentinel).LastWriteTimeUtc
        if ($reqMtime -gt $sentinelMtime) { return $false }
    }
    return $true
}

if (Test-FastPath) {
    # Silent fast-path. Skip every check.
    return
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

# Touch sentinel + gitkeep so git records the folder shape.
New-Item -ItemType File -Path $Sentinel -Force | Out-Null
$gitkeep = Join-Path $VenvDir ".gitkeep"
if (-not (Test-Path $gitkeep)) { New-Item -ItemType File -Path $gitkeep -Force | Out-Null }
