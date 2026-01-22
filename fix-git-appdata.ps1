# PowerShell script to fix AppData files in git
# This script removes AppData files from git tracking

Write-Host "Fixing AppData files in git..." -ForegroundColor Yellow

# Remove AppData from git cache
Write-Host "Removing AppData files from git cache..." -ForegroundColor Cyan
git rm -r --cached AppData 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "AppData removed from git cache" -ForegroundColor Green
} else {
    Write-Host "AppData not in git cache (this is OK)" -ForegroundColor Yellow
}

# Update .git/info/exclude
Write-Host "Updating .git/info/exclude..." -ForegroundColor Cyan
$excludeContent = @"
# Windows AppData - ALL patterns
AppData/
AppData/**
**/AppData/**
**/AppData/Local/**
**/AppData/LocalLow/**
**/AppData/Roaming/**

# Chrome cache
**/Chrome/**
**/Google/Chrome/**

# OneDrive
**/OneDrive/**

# Microsoft cache - ALL patterns
**/Microsoft/**
**/Microsoft/OneDrive/**
**/Microsoft/TokenBroker/**
**/Microsoft/Windows/**
**/Microsoft/CryptnetUrlCache/**

# Temp files - ALL patterns
**/Temp/**
**/Local/Temp/**
**/*.tmp
*.tmp
*.odl
*.tbres
*.ldb
"@

# Ensure .git/info directory exists
if (-not (Test-Path .git\info)) {
    New-Item -ItemType Directory -Path .git\info -Force | Out-Null
}

$excludeContent | Out-File -FilePath .git\info\exclude -Encoding UTF8 -Force
Write-Host ".git/info/exclude updated" -ForegroundColor Green

# Configure git to use exclude file
Write-Host "Configuring git..." -ForegroundColor Cyan
git config --local core.excludesfile .git/info/exclude
Write-Host "Git configured" -ForegroundColor Green

# Check git status
Write-Host "`nChecking git status..." -ForegroundColor Cyan
$appDataFiles = git status --porcelain 2>$null | Select-String -Pattern "AppData"
if ($appDataFiles) {
    Write-Host "WARNING: AppData files still detected:" -ForegroundColor Red
    $appDataFiles | Select-Object -First 5
    Write-Host "`nTry running: git rm -r --cached ." -ForegroundColor Yellow
    Write-Host "Then: git add ." -ForegroundColor Yellow
} else {
    Write-Host "No AppData files detected in git status!" -ForegroundColor Green
}

Write-Host "`nDone! Try running: eas build --profile development --platform android" -ForegroundColor Green








