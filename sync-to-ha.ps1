# sync-to-ha.ps1 — Build and deploy shelly-dashboard-card to Home Assistant
# Copies dist/shelly-dashboard-card.js → Z:\www\community\dist\

$source = "$PSScriptRoot\dist\shelly-dashboard-card.js"
$dest   = "Z:\www\community\dist"

Write-Host "Building..." -ForegroundColor Cyan
npm run build --prefix $PSScriptRoot
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest | Out-Null
}

Copy-Item -Path $source -Destination $dest -Force
Write-Host "Deployed to $dest\shelly-dashboard-card.js" -ForegroundColor Green
Write-Host "Hard-refresh HA (Ctrl+Shift+R) to pick up changes." -ForegroundColor Yellow
