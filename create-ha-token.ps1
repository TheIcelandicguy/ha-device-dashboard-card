# Run this once to create a long-lived HA token for auto cache-busting.
# Paste the token from HA: Profile → Long-lived access tokens → Create token
# Then this script saves it to .ha-token (gitignored).

$token = Read-Host "Paste your HA long-lived access token"
$token.Trim() | Set-Content -Path ".ha-token" -NoNewline
Write-Host "Saved to .ha-token" -ForegroundColor Green
