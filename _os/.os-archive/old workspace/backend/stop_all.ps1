# stop_all.ps1 — Agentic OS Daemon Terminator
# Usage: powershell -ExecutionPolicy Bypass -File stop_all.ps1

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Agentic OS - Daemon Stopper          " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "[1/1] Killing all engine.py processes..." -ForegroundColor Yellow

$KilledCount = 0
$procs = Get-CimInstance Win32_Process -Filter "Name='python'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -and $_.CommandLine.Contains('engine.py') }

foreach ($proc in $procs) {
    Write-Host "  Killing engine.py (PID $($proc.ProcessId))..." -ForegroundColor DarkYellow
    try {
        Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop
        $KilledCount++
    }
    catch {}
}

Write-Host "  [OK] Killed $KilledCount process(es)." -ForegroundColor Green
