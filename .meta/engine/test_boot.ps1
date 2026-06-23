# test_boot.ps1 — Run boot.py and capture output
$ErrorActionPreference = "Continue"
$VenvPython = 'C:\Users\BAB AL SAFA\Desktop\open-workspace\.meta\.venv\Scripts\python.exe'
$BootScript = 'C:\Users\BAB AL SAFA\Desktop\open-workspace\.meta\engine\boot.py'
$LogFile = 'C:\Users\BAB AL SAFA\Desktop\open-workspace\tmp_boot.log'
$ErrFile = 'C:\Users\BAB AL SAFA\Desktop\open-workspace\tmp_boot.err'

Write-Host "Running boot.py..."

# Use cmd.exe /c with proper quoting for paths with spaces
$cmdLine = "cmd.exe /c `"`"$VenvPython`" `"$BootScript`" `"$LogFile`" `"$ErrFile`""

$process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "`"$VenvPython`" , "`"$BootScript`"", ">", "`"$LogFile`"", "2>", "`"$ErrFile`"" `
    -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 8

# Check if still running
if (-not $process.HasExited) {
    Write-Host "boot.py is running (PID $($process.Id)) — stopping test instance..."
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped. This is expected — boot.py runs forever in daemon mode."
}
else {
    Write-Host "boot.py exited with code $($process.ExitCode)"
}

# Read output
if (Test-Path $LogFile) {
    Write-Host ""
    Write-Host "=== boot.py output ==="
    Get-Content $LogFile
}
else {
    Write-Host "No log file created."
}

if (Test-Path $ErrFile) {
    $errContent = Get-Content $ErrFile -Raw
    if ($errContent.Trim() -ne "") {
        Write-Host ""
        Write-Host "=== boot.py errors ==="
        Get-Content $ErrFile
    }
}
