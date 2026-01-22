# PowerShell script to fix AppData files in git for EAS Build
# Run this script in your project directory

Write-Host "=== Fixing AppData Files in Git ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "ERROR: Not a git repository!" -ForegroundColor Red
    Write-Host "Please run this script in your project directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Removing AppData from git cache..." -ForegroundColor Yellow
# Remove all AppData patterns from git cache
git rm -r --cached AppData 2>$null
git rm -r --cached "AppData/**" 2>$null
git rm -r --cached "**/AppData/**" 2>$null

if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
    Write-Host "✓ AppData removed from git cache" -ForegroundColor Green
} else {
    Write-Host "⚠ AppData not in git cache (this is OK)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Updating .git/info/exclude..." -ForegroundColor Yellow

# Ensure .git/info directory exists
if (-not (Test-Path .git\info)) {
    New-Item -ItemType Directory -Path .git\info -Force | Out-Null
}

# Create comprehensive exclude file
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
*.otc-shm
*.otc-wal

# Cursor/IDE files
**/Cursor/**
**/Roaming/Cursor/**
"@

$excludeContent | Out-File -FilePath .git\info\exclude -Encoding UTF8 -Force
Write-Host "✓ .git/info/exclude updated" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Configuring git..." -ForegroundColor Yellow
git config --local core.excludesfile .git/info/exclude
git config --local core.ignorecase true
Write-Host "✓ Git configured" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Checking git status..." -ForegroundColor Yellow
$appDataFiles = git status --porcelain 2>$null | Select-String -Pattern "AppData"
if ($appDataFiles) {
    Write-Host ""
    Write-Host "⚠ WARNING: AppData files still detected:" -ForegroundColor Red
    $appDataFiles | Select-Object -First 5 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Try running these commands manually:" -ForegroundColor Yellow
    Write-Host "  git rm -r --cached ." -ForegroundColor Cyan
    Write-Host "  git add ." -ForegroundColor Cyan
} else {
    Write-Host "✓ No AppData files detected in git status!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Done! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Now try running:" -ForegroundColor Yellow
Write-Host "  eas build --profile development --platform android" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: iOS builds require macOS. Use Android for Windows." -ForegroundColor Yellow








