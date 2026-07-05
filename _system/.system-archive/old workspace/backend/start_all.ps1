# start_all.ps1 — Agentic OS Daemon Launcher
# Usage: powershell -ExecutionPolicy Bypass -File start_all.ps1

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceRoot = (Get-Item $ScriptDir).Parent.Parent.FullName
$VenvPython = Join-Path $WorkspaceRoot ".stash\.venv\venv\Scripts\python.exe"
$EngineScript = Join-Path $WorkspaceRoot ".infra\backend\engine.py"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Agentic OS - Daemon Launcher         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ── Step 1: Kill stale instances ──
Write-Host "[1/3] Scanning for stale processes..." -ForegroundColor Yellow
$DaemonProcesses = Get-CimInstance Win32_Process -Filter "Name='python'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -and $_.CommandLine.Contains('engine.py') }

if ($DaemonProcesses) {
    foreach ($proc in $DaemonProcesses) {
        Write-Host "  Killing stale engine (PID $($proc.ProcessId))..." -ForegroundColor DarkYellow
        Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}
Write-Host "  [OK] No stale processes." -ForegroundColor Green

# ── Step 2: Port check ──
Write-Host "[2/3] Checking port 8000..." -ForegroundColor Yellow
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
if ($port8000) {
    foreach ($listener in $port8000) {
        Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}
Write-Host "  [OK] Port 8000 is free." -ForegroundColor Green

# ── Step 3: Launch engine ──
Write-Host "[3/3] Launching engine.py --daemon..." -ForegroundColor Yellow

if (-not (Test-Path $VenvPython)) {
    Write-Host "  [FAIL] Venv python not found: $VenvPython" -ForegroundColor Red
    exit 1
}

$procArgs = "-c `\"import sys, subprocess; subprocess.Popen(['$VenvPython', '$EngineScript', '--daemon'], creationflags=0x08000000)`\""
Start-Process -FilePath $VenvPython -ArgumentList $procArgs -WindowStyle Hidden -ErrorAction Stop

Write-Host "  [OK] Daemon launched successfully." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Dashboard URL: http://localhost:8000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
