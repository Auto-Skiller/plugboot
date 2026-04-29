$workspace = "c:\Users\BAB AL SAFA\Desktop\open-workspace"

$map = [ordered]@{
    "_rules"     = "_experience"
    "_knowledge" = "_context"
    "_workflows" = "_playbooks"
    "_scripts"   = "_tools"
    "_templates" = "_formats"
}

Write-Host "Renaming resource folders..."
$skillsDir = Join-Path $workspace "skills"
$allDepts = Get-ChildItem -Path $skillsDir -Directory -Recurse | Where-Object { 
    $_.FullName -match "skills\\[^\\]+\\[^\\]+$" 
}

foreach ($dept in $allDepts) {
    foreach ($oldName in $map.Keys) {
        $newName = $map[$oldName]
        $oldPath = Join-Path $dept.FullName $oldName
        $newPath = Join-Path $dept.FullName $newName
        if (Test-Path $oldPath) {
            Rename-Item -Path $oldPath -NewName $newName -Force
        }
    }
}

Write-Host "Updating contents of {dept}.yaml files..."
$yamlFiles = Get-ChildItem -Path $skillsDir -Filter "*.yaml" -Recurse
foreach ($file in $yamlFiles) {
    $content = Get-Content $file.FullName
    foreach ($oldName in $map.Keys) {
        $newName = $map[$oldName]
        $content = $content -replace "\b$oldName\b", $newName
    }
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}

Write-Host "Updating contents of agent .md files..."
$agentsDir = Join-Path $workspace "agents"
$mdFiles = Get-ChildItem -Path $agentsDir -Filter "*.md" -Recurse
foreach ($file in $mdFiles) {
    $content = Get-Content $file.FullName
    foreach ($oldName in $map.Keys) {
        $newName = $map[$oldName]
        $content = $content -replace "\b$oldName\b", $newName
    }
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}

Write-Host "Updating Root System files..."
$rootFiles = @("06-Architecture.md", "05-Orchestration.md", "08-Board Guide.md")
foreach ($fileName in $rootFiles) {
    $path = Join-Path $workspace $fileName
    if (Test-Path $path) {
        $content = Get-Content $path
        foreach ($oldName in $map.Keys) {
            $newName = $map[$oldName]
            $content = $content -replace "\b$oldName\b", $newName
        }
        Set-Content -Path $path -Value $content -Encoding UTF8
    }
}

Write-Host "Creating the System Brain structure in _agents_brain..."
$brainDir = Join-Path $workspace "_agents_brain"
if (-not (Test-Path $brainDir)) {
    New-Item -ItemType Directory -Force -Path $brainDir | Out-Null
}
foreach ($newName in $map.Values) {
    $path = Join-Path $brainDir $newName
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Force -Path $path | Out-Null
        New-Item -ItemType File -Force -Path (Join-Path $path ".gitkeep") | Out-Null
    }
}

Write-Host "Migration Complete!"
