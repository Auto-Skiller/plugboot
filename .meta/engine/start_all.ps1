# start_all.ps1 — Agentic OS Daemon Launcher
# Usage: powershell -ExecutionPolicy Bypass -File start_all.ps1
#
# Idempotent: safe to run multiple times. Kills stale instances, starts clean.

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Script is in .meta/engine/, so parent.parent is workspace root
$WorkspaceRoot = (Get-Item $ScriptDir).Parent.Parent.FullName
$EngineDir = Join-Path $WorkspaceRoot ".meta\engine"
$PidDir = Join-Path $EngineDir "pids"

# Ensure PID directory exists
New-Item -ItemType Directory -Path $PidDir -Force | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Agentic OS - Daemon Launcher         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Pre-flight — Detect and kill stale/orphan processes ──
Write-Host "[1/5] Scanning for stale processes..." -ForegroundColor Yellow

$EngineScripts = @(
    "meta_engine.py",
    "pipeline_scaler_engine.py",
    "pipeline_hustler_engine.py",
    "project_assets_engine.py",
    "project_ecoma_engine.py",
    "server.py"
)

$OrphanPids = @()

# Find all python processes with --daemon flag
$DaemonProcesses = Get-CimInstance Win32_Process -Filter "Name='python'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -and $_.CommandLine.Contains('--daemon') }

if ($DaemonProcesses) {
    foreach ($proc in $DaemonProcesses) {
        $pid = $proc.ProcessId
        $cmd = $proc.CommandLine
        foreach ($script in $EngineScripts) {
            if ($cmd -like "*$script*") {
                $OrphanPids += [PSCustomObject]@{
                    Pid = $pid
                    Name = $script
                    Cmd = $cmd
                }
                break
            }
        }
    }
}

# Also find server.py processes (they don't use --daemon flag)
$ServerProcesses = Get-CimInstance Win32_Process -Filter "Name='python'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -and $_.CommandLine.Contains('server.py') }

if ($ServerProcesses) {
    foreach ($proc in $ServerProcesses) {
        $pid = $proc.ProcessId
        $alreadyFound = $false
        foreach ($existing in $OrphanPids) {
            if ($existing.Pid -eq $pid) { $alreadyFound = $true; break }
        }
        if (-not $alreadyFound) {
            $OrphanPids += [PSCustomObject]@{
                Pid = $pid
                Name = "server.py"
                Cmd = $proc.CommandLine
            }
        }
    }
}

if ($OrphanPids.Count -gt 0) {
    Write-Host "  Found $($OrphanPids.Count) existing process(es) to clean up:" -ForegroundColor DarkYellow
    foreach ($orphan in $OrphanPids) {
        Write-Host "    - $($orphan.Name) (PID $($orphan.Pid))" -ForegroundColor DarkYellow
        Stop-Process -Id $orphan.Pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "  [OK] Stale processes cleaned." -ForegroundColor Green
}
else {
    Write-Host "  [OK] No stale processes found." -ForegroundColor Green
}

# ── Step 2: Port check ──
Write-Host ""
Write-Host "[2/5] Checking port availability..." -ForegroundColor Yellow

$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
if ($port8000) {
    Write-Host "  [WARN] Port 8000 still in use! Killing listeners..." -ForegroundColor Red
    foreach ($listener in $port8000) {
        Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    $port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    if ($port8000) {
        Write-Host "  [FAIL] Port 8000 still occupied. Manual cleanup required." -ForegroundColor Red
        exit 1
    }
}
Write-Host "  [OK] Port 8000 is free." -ForegroundColor Green

# ── Step 3: Clean up stale PID files ──
Write-Host ""
Write-Host "[3/5] Cleaning stale PID files..." -ForegroundColor Yellow

if (Test-Path $PidDir) {
    $pidFiles = Get-ChildItem -Path $PidDir -Filter "*.pid" -ErrorAction SilentlyContinue
    foreach ($f in $pidFiles) {
        $pidData = $null
        try {
            $pidData = Get-Content $f.FullName -Raw | ConvertFrom-Json -ErrorAction Stop
        }
        catch {
            Remove-Item $f.FullName -Force
            Write-Host "  Removed corrupt: $($f.Name)" -ForegroundColor DarkYellow
            continue
        }

        $trackedPid = $pidData.pid
        if ($trackedPid) {
            $proc = Get-Process -Id $trackedPid -ErrorAction SilentlyContinue
            if (-not $proc) {
                Remove-Item $f.FullName -Force
                Write-Host "  Removed stale: $($f.Name) (PID $trackedPid dead)" -ForegroundColor DarkYellow
            }
        }
    }
}
Write-Host "  [OK] PID files cleaned." -ForegroundColor Green

# ── Step 4: Launch supervisor (boot.py) ──
Write-Host ""
Write-Host "[4/5] Launching supervisor (boot.py)..." -ForegroundColor Yellow

$VenvPython = Join-Path $WorkspaceRoot ".meta\.venv\Scripts\python.exe"
$BootScript = Join-Path $EngineDir "boot.py"

# Verify paths before launch
if (-not (Test-Path $VenvPython)) {
    # Fallback: try resolving from parent of engine dir
    $VenvPython = Join-Path (Split-Path $EngineDir -Parent) ".venv\Scripts\python.exe"
}

if (-not (Test-Path $VenvPython)) {
    Write-Host "  [FAIL] Venv python not found: $VenvPython" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $BootScript)) {
    Write-Host "  [FAIL] boot.py not found: $BootScript" -ForegroundColor Red
    exit 1
}

# Launch supervisor as a background job
# (Start-Process causes Python to crash; Start-Job works reliably)
Write-Host "  Launching supervisor..." -ForegroundColor Gray
$job = Start-Job -ScriptBlock {
    param($python, $script, $cwd)
    & $python $script 2>&1 | Out-Null
} -ArgumentList $VenvPython, $BootScript, $WorkspaceRoot

Start-Sleep -Seconds 3

# Find the boot.py process spawned by the job
$bootProc = Get-CimInstance Win32_Process -Filter "Name='python.exe'" |
    Where-Object { $_.CommandLine -and $_.CommandLine.Contains('boot.py') } |
    Sort-Object ProcessId -Descending |
    Select-Object -First 1

if ($bootProc) {
    $supervisorPid = $bootProc.ProcessId
    Write-Host "  [OK] Supervisor launched (PID $supervisorPid)" -ForegroundColor Green
}
else {
    Write-Host "  [FAIL] Supervisor process not found after launch!" -ForegroundColor Red
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
    exit 1
}

# ── Step 5: Health verification ──
Write-Host ""
Write-Host "[5/5] Verifying daemon health (polling boot.pid for up to 60s)..." -ForegroundColor Yellow

$bootPidFile = Join-Path $WorkspaceRoot ".meta\boot.pid"
$bootData = $null
$maxWait = 60
$waited = 0
while ($waited -lt $maxWait) {
    if (Test-Path $bootPidFile) {
        $bootData = Get-Content $bootPidFile -Raw | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($bootData -and $bootData.engines) {
            break
        }
    }
    Start-Sleep -Seconds 2
    $waited += 2
    if ($waited % 10 -eq 0) {
        Write-Host "  ... waiting ${waited}s for boot.pid ..." -ForegroundColor DarkGray
    }
}

if ($bootData -and $bootData.engines) {
    Write-Host "  [OK] boot.pid written (supervisor PID $($bootData.supervisor_pid))" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Engine Status:" -ForegroundColor Cyan
    $allAlive = $true
    foreach ($engineName in $bootData.engines.PSObject.Properties.Name) {
        $engineInfo = $bootData.engines.$engineName
        $enginePid = $engineInfo.pid
        $engineProc = Get-Process -Id $enginePid -ErrorAction SilentlyContinue
        if ($engineProc) {
            Write-Host "    [OK] $engineName (PID $enginePid)" -ForegroundColor Green
        }
        else {
            Write-Host "    [WARN] $engineName (PID $enginePid) not found" -ForegroundColor DarkYellow
            $allAlive = $false
        }
    }
    if (-not $allAlive) {
        Write-Host "  [WARN] Some engines may still be starting." -ForegroundColor DarkYellow
    }
}
else {
    Write-Host "  [FAIL] boot.pid not written after ${maxWait}s - supervisor may have failed." -ForegroundColor Red
    Write-Host "  Check logs: .meta\logs\meta_engine.log" -ForegroundColor Gray
    exit 1
}

# Check port 8000
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    Write-Host "  [OK] Dashboard server listening on :8000" -ForegroundColor Green
}
else {
    Write-Host "  [WARN] Dashboard server not yet listening on :8000" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Agentic OS Daemons Started           " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  To stop:  powershell -ExecutionPolicy Bypass -File stop_all.ps1" -ForegroundColor Gray
Write-Host ""
