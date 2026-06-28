$ErrorActionPreference = "Stop"
$venvDir = $PSScriptRoot

# Load .env if exists
$envFile = "$venvDir\..\..\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match '=' -and $_ -notmatch '^\s*#' } | ForEach-Object {
        $name, $value = $_.Split('=', 2)
        [Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim())
    }
}

# Ensure python executable exists
$pythonExec = "$venvDir\Scripts\python.exe"
if (-Not (Test-Path $pythonExec)) {
    Write-Host "[!] Virtual environment not found at $venvDir" -ForegroundColor Red
    Write-Host "    Please run the setup/build scripts to initialize the .venv" -ForegroundColor Yellow
    exit 1
}

# Run python from the venv
$env:PYTHONIOENCODING = "utf-8"
& $pythonExec @args

