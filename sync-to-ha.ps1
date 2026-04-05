# sync-to-ha.ps1 — Build and deploy ha-device-dashboard to Home Assistant

$source = "$PSScriptRoot\dist\ha-device-dashboard.js"
$dest   = "Z:\www\community\ha-device-dashboard"

Write-Host "Building..." -ForegroundColor Cyan
npm run build --prefix $PSScriptRoot
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest | Out-Null
}

Copy-Item -Path $source -Destination "$dest\ha-device-dashboard.js" -Force
Write-Host "Deployed to $dest\ha-device-dashboard.js" -ForegroundColor Green
Write-Host "Hard-refresh HA (Ctrl+Shift+R) to pick up changes." -ForegroundColor Yellow