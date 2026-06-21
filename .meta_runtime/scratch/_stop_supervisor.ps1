$ErrorActionPreference = 'SilentlyContinue'
$pidfile = '.meta\boot.pid'
if (Test-Path $pidfile) {
    $d = Get-Content $pidfile -Raw | ConvertFrom-Json
    if ($d.supervisor_pid) {
        Stop-Process -Id $d.supervisor_pid -Force
        Write-Host "stopped supervisor $($d.supervisor_pid)"
    }
    if ($d.engines) {
        foreach ($prop in $d.engines.PSObject.Properties) {
            $p = $prop.Value.pid
            if ($p) {
                Stop-Process -Id $p -Force
                Write-Host "stopped engine $p ($($prop.Name))"
            }
        }
    }
    Start-Sleep -Seconds 2
    Remove-Item $pidfile -Force
    Write-Host 'boot.pid removed'
} else {
    Write-Host 'no boot.pid - supervisor not running'
}
# Verify port is free
$conn = Get-NetTCPConnection -LocalPort 49999 -ErrorAction SilentlyContinue
if ($conn) { Write-Host 'WARN: port 49999 still in use' } else { Write-Host 'port 49999 free' }
