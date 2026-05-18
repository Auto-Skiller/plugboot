# ─── Agentic OS — Python Venv Bootstrap (Windows, v5.5) ───────────────────────
# Creates .meta_runtime/venv/.venv if missing, then installs requirements.txt.
# Idempotent: safe to call on every boot. Uses a sentinel file (.bootstrap_ok)
# for fast-path skip on hot calls (G19). Honors .python-version if py launcher
# is available (G17).
#
# G-CTRL-AUDIT-1 / G-CTRL-AUDIT-3 / G-CTRL-AUDIT-4 hardening (this rev):
#   * Reads the minimum Python floor from BOOT_CONTRACTS.constants.required_python_min
#     (regex-only — no Python on the host required to bootstrap).
#   * Probes EVERY plausible interpreter via the py launcher and picks the
#     HIGHEST version that satisfies the floor (was: first-match-wins).
#   * Smoke-tests the venv after install. On any failure, drops a structured
#     `.bootstrap_failed` sentinel so meta_run.ps1 can stop dead with a
#     human-readable error instead of `&`-ing a non-existent interpreter.
# ──────────────────────────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

$WorkspaceRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$VenvDir       = Join-Path $PSScriptRoot ".venv"
$ReqFile       = Join-Path $PSScriptRoot "requirements.txt"
$PyExe         = Join-Path $VenvDir "Scripts\python.exe"
$PyvenvCfg     = Join-Path $VenvDir "pyvenv.cfg"
$PyVerFile     = Join-Path $PSScriptRoot ".python-version"
$Sentinel      = Join-Path $VenvDir ".bootstrap_ok"
$FailSentinel  = Join-Path $VenvDir ".bootstrap_failed"
$BootContracts = Join-Path $WorkspaceRoot ".meta_brain\BOOT_CONTRACTS.yaml"

# G-CTRL-AUDIT-3: write a structured failure record + clear the success
# sentinel. meta_run.ps1 picks this up on the next call.
function Write-BootstrapFailure {
    param(
        [Parameter(Mandatory)] [string]$Reason,
        [string]$Detail = ""
    )
    if (-not (Test-Path $VenvDir)) {
        New-Item -ItemType Directory -Path $VenvDir -Force | Out-Null
    }
    $payload = "reason: $Reason`nat: $((Get-Date).ToUniversalTime().ToString('o'))"
    if ($Detail) {
        $indented = ($Detail -split "`n" | ForEach-Object { "  $_" }) -join "`n"
        $payload  = "$payload`ndetail: |`n$indented"
    }
    Set-Content -Path $FailSentinel -Value $payload -Force -NoNewline
    if (Test-Path $Sentinel) { Remove-Item $Sentinel -Force }
    Write-Error "[bootstrap] FAIL: $Reason`n$Detail"
    exit 1
}

# G-CTRL-AUDIT-4: read the floor from BOOT_CONTRACTS without invoking Python.
function Read-MinPython {
    if (Test-Path $BootContracts) {
        $line = Select-String -Path $BootContracts -Pattern '^\s*required_python_min\s*:\s*[''"]?([0-9]+\.[0-9]+)' -List
        if ($line) { return $line.Matches[0].Groups[1].Value }
    }
    return "3.10"
}

function Test-VersionGe {
    param([string]$A, [string]$B)
    $aParts = $A -split '\.'
    $bParts = $B -split '\.'
    $a1 = [int]($aParts[0] | ForEach-Object { if ($_) { $_ } else { 0 } })
    $a2 = if ($aParts.Length -ge 2) { [int]$aParts[1] } else { 0 }
    $b1 = [int]($bParts[0] | ForEach-Object { if ($_) { $_ } else { 0 } })
    $b2 = if ($bParts.Length -ge 2) { [int]$bParts[1] } else { 0 }
    if ($a1 -gt $b1) { return $true }
    if ($a1 -lt $b1) { return $false }
    return $a2 -ge $b2
}

function Probe-InterpreterVersion {
    param([Parameter(Mandatory)] [string[]]$Cmd)
    try {
        $out = & $Cmd[0] $Cmd[1..($Cmd.Length-1)] -c 'import sys; print("%d.%d" % (sys.version_info.major, sys.version_info.minor))' 2>$null
        if ($LASTEXITCODE -eq 0) { return $out.Trim() }
    } catch { }
    return $null
}

# G-CTRL-AUDIT-1: exhaustive probe — pick the highest version satisfying the
# floor instead of first-match.
function Resolve-HostPython {
    $floor = Read-MinPython
    $candidates = @()

    # 1. .python-version pin (highest priority IF it satisfies the floor)
    $pyLauncher = Get-Command py -ErrorAction SilentlyContinue
    if ($pyLauncher -and (Test-Path $PyVerFile)) {
        $pin = (Get-Content $PyVerFile -Raw).Trim()
        if ($pin) {
            $parts = $pin -split '\.'
            if ($parts.Length -ge 2) {
                $mm = "$($parts[0]).$($parts[1])"
                $candidates += ,@("py", "-$mm")
            }
        }
    }

    # 2. Common version-pinned interpreters in DESCENDING order via py launcher.
    if ($pyLauncher) {
        foreach ($v in @("3.14","3.13","3.12","3.11","3.10")) {
            $candidates += ,@("py", "-$v")
        }
    }

    # 3. Generic fallbacks.
    foreach ($exe in @("python3","python")) {
        $g = Get-Command $exe -ErrorAction SilentlyContinue
        if ($g) { $candidates += ,@($exe) }
    }

    foreach ($cmd in $candidates) {
        $ver = Probe-InterpreterVersion -Cmd $cmd
        if ($ver -and (Test-VersionGe $ver $floor)) {
            return @($cmd, $ver)  # tuple-ish: ($cmd[], $ver)
        }
    }

    Write-BootstrapFailure -Reason "no_compatible_python" -Detail @"
BOOT_CONTRACTS requires Python >= $floor (constants.required_python_min).
None of the interpreters available satisfy that floor.

Tried via py launcher: -<pinned>, -3.14, -3.13, -3.12, -3.11, -3.10
Tried direct: python3, python

Install a compatible Python and retry:
  winget install Python.Python.3.12
"@
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
        if ($LASTEXITCODE -ne 0) { return $false }
    } catch { return $false }
    # G-CTRL-AUDIT-1: reject venvs whose python is below the floor.
    $ver = Probe-InterpreterVersion -Cmd @($PyExe)
    $floor = Read-MinPython
    if (-not $ver -or -not (Test-VersionGe $ver $floor)) { return $false }
    return $true
}

# G19: fast-path. Skip all checks if sentinel is fresh and requirements.txt
# hasn't been edited since.
function Test-FastPath {
    if (-not (Test-Path $Sentinel))     { return $false }
    if (Test-Path $FailSentinel)        { return $false }  # never short-circuit a failed bootstrap
    if (-not (Test-Path $PyExe))        { return $false }
    if (Test-Path $ReqFile) {
        $reqMtime      = (Get-Item $ReqFile).LastWriteTimeUtc
        $sentinelMtime = (Get-Item $Sentinel).LastWriteTimeUtc
        if ($reqMtime -gt $sentinelMtime) { return $false }
    }
    return $true
}

# G-CTRL-AUDIT-1: import every top-level package declared in requirements.txt.
function Invoke-SmokeTest {
    if (-not (Test-Path $ReqFile)) { return }
    $importMap = @{
        "ruamel.yaml" = "ruamel.yaml";
        "playwright"  = "playwright";
        "greenlet"    = "greenlet";
        "pyee"        = "pyee";
        "PyYAML"      = "yaml";
        "typing_extensions" = "typing_extensions";
    }
    $failures = @()
    foreach ($raw in Get-Content $ReqFile) {
        $line = $raw -replace '#.*$','' -replace ';.*$',''
        $line = $line.Trim()
        if (-not $line) { continue }
        $pkg  = ($line -split '[<>=!~]')[0].Trim()
        if (-not $pkg) { continue }
        $importName = if ($importMap.ContainsKey($pkg)) { $importMap[$pkg] } else { $pkg.ToLower().Replace('-','_') }
        & $PyExe -c "import $importName" 2>$null
        if ($LASTEXITCODE -ne 0) {
            $failures += "$pkg (import $importName)"
        }
    }
    if ($failures.Count -gt 0) {
        $msg = "The following packages from requirements.txt failed to import after install:`n$($failures -join '; ')`n" +
               "The venv is in a broken state. Try: Remove-Item -Recurse -Force '$VenvDir'; & '$PSCommandPath'"
        Write-BootstrapFailure -Reason "smoke_test_failed" -Detail $msg
    }
}

if (Test-FastPath) {
    return
}

# Clear any prior failure sentinel — we're about to retry.
if (Test-Path $FailSentinel) { Remove-Item $FailSentinel -Force -ErrorAction SilentlyContinue }

if (Test-VenvHealthy) {
    Write-Host "[bootstrap] venv healthy at $VenvDir"
} else {
    if (Test-Path $VenvDir) {
        Write-Host "[bootstrap] removing stale/cross-OS/below-floor venv at $VenvDir"
        Remove-Item -Recurse -Force $VenvDir
    }
    $resolved = Resolve-HostPython
    $hostPy   = $resolved[0]
    $hostVer  = $resolved[1]
    $floor    = Read-MinPython
    Write-Host "[bootstrap] selected $($hostPy -join ' ') (Python $hostVer, floor=$floor)"
    try {
        & $hostPy[0] $hostPy[1..($hostPy.Length-1)] -m venv $VenvDir
        if ($LASTEXITCODE -ne 0) { throw "exit $LASTEXITCODE" }
    } catch {
        Write-BootstrapFailure -Reason "venv_create_failed" -Detail $_.ToString()
    }
    try {
        & $PyExe -m pip install --upgrade pip --disable-pip-version-check | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "exit $LASTEXITCODE" }
    } catch {
        Write-BootstrapFailure -Reason "pip_upgrade_failed" -Detail $_.ToString()
    }
    if (Test-Path $ReqFile) {
        Write-Host "[bootstrap] installing requirements.txt"
        try {
            & $PyExe -m pip install -r $ReqFile --disable-pip-version-check
            if ($LASTEXITCODE -ne 0) { throw "exit $LASTEXITCODE" }
        } catch {
            Write-BootstrapFailure -Reason "pip_install_failed" -Detail $_.ToString()
        }
    }
    Write-Host "[bootstrap] venv ready at $VenvDir"
}

# G-CTRL-AUDIT-1: smoke-test after every branch (healthy or freshly-built).
Invoke-SmokeTest

# Touch sentinel + gitkeep so git records the folder shape.
New-Item -ItemType File -Path $Sentinel -Force | Out-Null
$gitkeep = Join-Path $VenvDir ".gitkeep"
if (-not (Test-Path $gitkeep)) { New-Item -ItemType File -Path $gitkeep -Force | Out-Null }
