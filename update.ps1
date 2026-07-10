# update.ps1 — one-command update: sync this repo to GitHub and deploy to Home Assistant.
#
# Safe to run anytime. Because the repo commits dist/ and every build rewrites it,
# a normal `git pull` fails with "local changes would be overwritten". This script
# resets to the remote instead (discarding the locally rebuilt dist, which the build
# regenerates anyway), so it NEVER hits that conflict.
#
# Usage:
#   .\update.ps1              # update from origin/master (default)
#   .\update.ps1 -Branch foo  # update from a specific branch

param([string]$Branch = "master")

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "==> Syncing to origin/$Branch ..." -ForegroundColor Cyan
git fetch origin
git checkout -- . 2>$null            # drop any working-tree changes (the rebuilt dist)
git checkout $Branch
git reset --hard "origin/$Branch"    # match the remote exactly — no merge, no conflict

Write-Host "==> Building ..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed." -ForegroundColor Red; exit 1 }

$dest = "Z:\www\community\ha-device-dashboard\ha-device-dashboard.js"
if (Test-Path $dest) {
    $tag = (Select-String -Path $dest -Pattern "mobile-editor-[0-9-]+[a-z]").Matches.Value
    Write-Host "==> Deployed to HA." -ForegroundColor Green
    Write-Host "    build tag: $tag"
} else {
    Write-Host "WARNING: $dest not found. Is the Z: drive mapped?" -ForegroundColor Yellow
}

Write-Host "==> Done. Restart the HA app (or Ctrl+Shift+R on desktop) to load it." -ForegroundColor Yellow
