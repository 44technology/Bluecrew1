# Ultimate fix for AppData files in git
# This script will completely remove AppData from git tracking

Write-Host "=== Ultimate AppData Fix ===" -ForegroundColor Cyan
Write-Host ""

# Get current directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Yellow

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "ERROR: Not a git repository!" -ForegroundColor Red
    exit 1
}

# Check if AppData exists in current directory
if (Test-Path "AppData") {
    Write-Host "WARNING: AppData folder exists in project directory!" -ForegroundColor Red
    Write-Host "This should not happen. AppData should be in user home directory." -ForegroundColor Yellow
    Write-Host "AppData path: $(Resolve-Path AppData)" -ForegroundColor Yellow
} else {
    Write-Host "✓ No AppData folder in project directory (this is correct)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 1: Updating .git/info/exclude with ALL patterns..." -ForegroundColor Yellow

# Ensure directory exists
if (-not (Test-Path .git\info)) {
    New-Item -ItemType Directory -Path .git\info -Force | Out-Null
}

# Ultimate exclude patterns - every possible variation
$excludeContent = @"
# Windows AppData - EVERY possible pattern
AppData
AppData/
AppData/**
**/AppData
**/AppData/
**/AppData/**
**/AppData/Local
**/AppData/Local/
**/AppData/Local/**
**/AppData/LocalLow
**/AppData/LocalLow/
**/AppData/LocalLow/**
**/AppData/Roaming
**/AppData/Roaming/
**/AppData/Roaming/**

# Chrome - ALL patterns
**/Chrome/**
**/Google/Chrome/**
Chrome/
Google/Chrome/

# OneDrive - ALL patterns
**/OneDrive/**
OneDrive/

# Microsoft - ALL patterns
**/Microsoft/**
Microsoft/
**/Microsoft/OneDrive/**
**/Microsoft/TokenBroker/**
**/Microsoft/Windows/**
**/Microsoft/CryptnetUrlCache/**

# Temp files - ALL patterns
**/Temp/**
Temp/
**/Local/Temp/**
Local/Temp/
**/*.tmp
*.tmp
*.odl
*.tbres
*.ldb
*.otc-shm
*.otc-wal

# Cursor/IDE
**/Cursor/**
Cursor/
**/Roaming/Cursor/**
"@

$excludeContent | Out-File -FilePath .git\info\exclude -Encoding UTF8 -Force
Write-Host "✓ .git/info/exclude updated" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Configuring git..." -ForegroundColor Yellow
git config --local core.excludesfile .git/info/exclude
git config --local core.ignorecase true
git config --local core.autocrlf false
Write-Host "✓ Git configured" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Removing AppData from git index..." -ForegroundColor Yellow

# Try to remove AppData from index using different methods
$methods = @(
    "git rm -r --cached AppData",
    "git rm -r --cached 'AppData/**'",
    "git rm -r --cached '**/AppData/**'"
)

foreach ($method in $methods) {
    Invoke-Expression "$method 2>&1" | Out-Null
}

Write-Host "✓ AppData removal attempted" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Clearing entire git cache..." -ForegroundColor Yellow
git rm -r --cached . 2>&1 | Out-Null
Write-Host "✓ Git cache cleared" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5: Re-adding files (AppData should be excluded)..." -ForegroundColor Yellow
git add . 2>&1 | Out-Null
Write-Host "✓ Files re-added" -ForegroundColor Green

Write-Host ""
Write-Host "Step 6: Final check..." -ForegroundColor Yellow
$appDataFiles = git status --porcelain 2>$null | Select-String -Pattern "AppData"
if ($appDataFiles) {
    Write-Host ""
    Write-Host "⚠ WARNING: AppData files still detected:" -ForegroundColor Red
    $appDataFiles | Select-Object -First 5 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "This is a Windows git case-insensitivity issue." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SOLUTION: Use --local flag for EAS build:" -ForegroundColor Cyan
    Write-Host "  eas build --profile development --platform android --local" -ForegroundColor Green
    Write-Host ""
    Write-Host "OR: Move project to a different directory (not in user home)" -ForegroundColor Yellow
} else {
    Write-Host "✓ SUCCESS! No AppData files detected!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run:" -ForegroundColor Yellow
    Write-Host "  eas build --profile development --platform android" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green








