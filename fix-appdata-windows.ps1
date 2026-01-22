# Windows-specific fix for AppData files in git
# This script will force git to ignore AppData completely

Write-Host "=== Windows AppData Fix ===" -ForegroundColor Cyan
Write-Host ""

# Get current directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Yellow

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "ERROR: Not a git repository!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 1: Checking git working directory..." -ForegroundColor Yellow
$gitDir = git rev-parse --show-toplevel 2>$null
if ($gitDir) {
    Write-Host "Git root: $gitDir" -ForegroundColor Cyan
    if ($gitDir -ne $currentDir) {
        Write-Host "WARNING: Git root differs from current directory!" -ForegroundColor Red
        Write-Host "This might be causing the issue." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Step 2: Creating comprehensive .git/info/exclude..." -ForegroundColor Yellow

# Ensure directory exists
if (-not (Test-Path .git\info)) {
    New-Item -ItemType Directory -Path .git\info -Force | Out-Null
}

# Ultimate exclude patterns - every possible variation
$excludeContent = @"
# Windows AppData - EVERY possible pattern (case-insensitive)
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

# Downloads (if project is in Downloads)
Downloads/bluecrew1/project/**
"@

$excludeContent | Out-File -FilePath .git\info\exclude -Encoding UTF8 -Force
Write-Host "✓ .git/info/exclude updated" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Updating .gitignore..." -ForegroundColor Yellow

# Read current .gitignore
$gitignoreContent = ""
if (Test-Path .gitignore) {
    $gitignoreContent = Get-Content .gitignore -Raw
}

# Add AppData patterns if not present
if ($gitignoreContent -notmatch "AppData") {
    $appDataPatterns = @"

# Windows AppData - force ignore
AppData/
AppData/**
**/AppData/**
**/AppData/Local/**
**/AppData/LocalLow/**
**/AppData/Roaming/**
"@
    Add-Content -Path .gitignore -Value $appDataPatterns
    Write-Host "✓ AppData patterns added to .gitignore" -ForegroundColor Green
} else {
    Write-Host "✓ AppData patterns already in .gitignore" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 4: Configuring git..." -ForegroundColor Yellow
git config --local core.excludesfile .git/info/exclude
git config --local core.ignorecase true
git config --local core.autocrlf false
# Force git to respect exclude file
git config --local core.worktree "$currentDir"
Write-Host "✓ Git configured" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5: Removing AppData from git index (all methods)..." -ForegroundColor Yellow

# Try multiple methods to remove AppData
$removeCommands = @(
    "git rm -r --cached AppData 2>&1",
    "git rm -r --cached 'AppData/**' 2>&1",
    "git rm -r --cached '**/AppData/**' 2>&1"
)

foreach ($cmd in $removeCommands) {
    $result = Invoke-Expression $cmd
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Removed via: $cmd" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Step 6: Clearing git cache and re-adding..." -ForegroundColor Yellow
git rm -r --cached . 2>&1 | Out-Null
Write-Host "  ✓ Cache cleared" -ForegroundColor Green

git add . 2>&1 | Out-Null
Write-Host "  ✓ Files re-added" -ForegroundColor Green

Write-Host ""
Write-Host "Step 7: Final check..." -ForegroundColor Yellow
$appDataFiles = git status --porcelain 2>$null | Select-String -Pattern "AppData"
if ($appDataFiles) {
    Write-Host ""
    Write-Host "⚠ WARNING: AppData files still detected:" -ForegroundColor Red
    $appDataFiles | Select-Object -First 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "This is a Windows git case-insensitivity limitation." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SOLUTIONS:" -ForegroundColor Cyan
    Write-Host "1. Move project to a different directory (not in user home):" -ForegroundColor Yellow
    Write-Host "   Example: C:\Projects\bluecrew1\project" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Use a different build method (requires macOS/Linux for local build)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "3. Contact EAS support about this Windows-specific issue" -ForegroundColor Yellow
} else {
    Write-Host "✓ SUCCESS! No AppData files detected!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run:" -ForegroundColor Yellow
    Write-Host "  eas build --profile development --platform android" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green








