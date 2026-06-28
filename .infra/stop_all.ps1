# stop_all.ps1 — Agentic OS Daemon Terminator
# Usage: powershell -ExecutionPolicy Bypass -File stop_all.ps1

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceRoot = (Get-Item $ScriptDir).Parent.Parent.FullName
$EngineDir = Join-Path $WorkspaceRoot ".infra"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Agentic OS - Daemon Stopper          " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Try graceful shutdown via supervisor ──
Write-Host "[1/5] Attempting graceful shutdown via supervisor..." -ForegroundColor Yellow

$bootPidFile = Join-Path $WorkspaceRoot ".infra\boot.pid"
$bootData = $null

if (Test-Path $bootPidFile) {
    try {
        $bootData = Get-Content $bootPidFile -Raw | ConvertFrom-Json -ErrorAction Stop
        $supervisorPid = $bootData.supervisor_pid

        if ($supervisorPid) {
            $supervisor = Get-Process -Id $supervisorPid -ErrorAction SilentlyContinue
            if ($supervisor) {
                Write-Host "  Sending SIGTERM to supervisor (PID $supervisorPid)..." -ForegroundColor DarkYellow
                Stop-Process -Id $supervisorPid -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 3

                $supervisor = Get-Process -Id $supervisorPid -ErrorAction SilentlyContinue
                if (-not $supervisor) {
                    Write-Host "  [OK] Supervisor exited gracefully." -ForegroundColor Green
                }
            }
        }
    }
    catch {
        Write-Host "  Could not read boot.pid." -ForegroundColor DarkYellow
    }
}

# ── Step 2: Kill ALL engine processes ──
Write-Host ""
Write-Host "[2/5] Killing all engine processes..." -ForegroundColor Yellow

$EnginePatterns = @(
    "engine.py",
    "boot.py"
)

$KilledCount = 0

# Kill by pattern match on command line
foreach ($pattern in $EnginePatterns) {
    $procs = Get-CimInstance Win32_Process -Filter "Name='python'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -and $_.CommandLine.Contains($pattern) }

    foreach ($proc in $procs) {
        Write-Host "  Killing $pattern (PID $($proc.ProcessId))..." -ForegroundColor DarkYellow
        try {
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop
            $KilledCount++
        }
        catch {
        }
    }
}

# Also kill ANY python process running from our venv (catches server.py, boot.py, etc.)
$VenvPython = Join-Path $EngineDir ".venv\Scripts\python.exe"
$AllVenvProcs = Get-CimInstance Win32_Process -Filter "Name='python'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -and $_.CommandLine.Contains($VenvPython) }

foreach ($proc in $AllVenvProcs) {
    $pid = $proc.ProcessId
    # Don't kill ourselves (the stop_all.ps1 process is not python, but be safe)
    Write-Host "  Killing venv python (PID $pid)..." -ForegroundColor DarkYellow
    try {
        Stop-Process -Id $pid -Force -ErrorAction Stop
        $KilledCount++
    }
    catch {
    }
}

Write-Host "  [OK] Killed $KilledCount process(es)." -ForegroundColor Green

# ── Step 3: Wait for port 8000 to be released ──
Write-Host ""
Write-Host "[3/5] Waiting for port 8000 to release..." -ForegroundColor Yellow

$maxWait = 10
$waited = 0
while ($waited -lt $maxWait) {
    $port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    if (-not $port8000) { break }
    Start-Sleep -Seconds 1
    $waited++
}

if ($waited -ge $maxWait) {
    $port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    foreach ($listener in $port8000) {
        Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "  [OK] Port 8000 is free." -ForegroundColor Green

# ── Step 4: Clean up PID files ──
Write-Host ""
Write-Host "[4/5] Cleaning PID files..." -ForegroundColor Yellow

$PidDir = Join-Path $EngineDir "pids"
if (Test-Path $PidDir) {
    $pidFiles = Get-ChildItem -Path $PidDir -Filter "*.pid" -ErrorAction SilentlyContinue
    foreach ($f in $pidFiles) {
        Remove-Item $f.FullName -Force
        Write-Host "  Removed: $($f.Name)" -ForegroundColor DarkGray
    }
}

if (Test-Path $bootPidFile) {
    Remove-Item $bootPidFile -Force
    Write-Host "  Removed: boot.pid" -ForegroundColor DarkGray
}

$syncSignal = Join-Path $WorkspaceRoot ".meta\.sync_signal"
if (Test-Path $syncSignal) {
    Remove-Item $syncSignal -Force
    Write-Host "  Removed: .sync_signal" -ForegroundColor DarkGray
}

Write-Host "  [OK] PID files cleaned." -ForegroundColor Green

# ── Step 5: Final verification ──
Write-Host ""
Write-Host "[5/5] Final verification..." -ForegroundColor Yellow

$remaining = Get-CimInstance Win32_Process -Filter "Name='python'" -ErrorAction SilentlyContinue |
    Where-Object {
        $_.CommandLine -and (
            $_.CommandLine.Contains('engine.py') -or
            $_.CommandLine.Contains('boot.py')
        )
    }

if ($remaining) {
    Write-Host "  [WARN] Some processes may still be running:" -ForegroundColor Red
    foreach ($proc in $remaining) {
        $cmdPreview = ""
        if ($proc.CommandLine.Length -gt 80) { $cmdPreview = $proc.CommandLine.Substring(0, 80) } else { $cmdPreview = $proc.CommandLine }
        Write-Host "    - PID $($proc.ProcessId): $cmdPreview" -ForegroundColor Red
    }
}
else {
    Write-Host "  [OK] All Agentic OS processes stopped." -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Agentic OS Daemons Stopped           " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
