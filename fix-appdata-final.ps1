# Final fix for AppData files in git
# Run this in your project directory: C:\Users\ALI\OneDrive\Masaüstü\Bluecrew11

Write-Host "=== Final AppData Fix ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "ERROR: Not a git repository!" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Removing ALL AppData from git cache..." -ForegroundColor Yellow

# Remove all possible AppData patterns
$patterns = @(
    "AppData",
    "AppData/**",
    "**/AppData/**",
    "AppData/Local/**",
    "AppData/LocalLow/**",
    "AppData/Roaming/**"
)

foreach ($pattern in $patterns) {
    git rm -r --cached $pattern 2>$null | Out-Null
}

Write-Host "✓ AppData patterns removed from cache" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Updating .git/info/exclude with comprehensive patterns..." -ForegroundColor Yellow

# Ensure directory exists
if (-not (Test-Path .git\info)) {
    New-Item -ItemType Directory -Path .git\info -Force | Out-Null
}

# Comprehensive exclude patterns
$excludeContent = @"
# Windows AppData - ALL possible patterns
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

# Chrome cache
**/Chrome/**
**/Google/Chrome/**

# OneDrive
**/OneDrive/**

# Microsoft - ALL patterns
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

# Cursor/IDE
**/Cursor/**
**/Roaming/Cursor/**
"@

$excludeContent | Out-File -FilePath .git\info\exclude -Encoding UTF8 -Force
Write-Host "✓ .git/info/exclude updated" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Configuring git..." -ForegroundColor Yellow
git config --local core.excludesfile .git/info/exclude
git config --local core.ignorecase true
git config --local core.autocrlf false
Write-Host "✓ Git configured" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Clearing git cache completely..." -ForegroundColor Yellow
# Remove everything from cache
git rm -r --cached . 2>$null | Out-Null

Write-Host "Step 5: Re-adding files (AppData will be excluded)..." -ForegroundColor Yellow
# Re-add all files (AppData should be excluded now)
git add .

Write-Host ""
Write-Host "Step 6: Checking for AppData files..." -ForegroundColor Yellow
$appDataFiles = git status --porcelain 2>$null | Select-String -Pattern "AppData"
if ($appDataFiles) {
    Write-Host ""
    Write-Host "⚠ WARNING: Still detecting AppData files:" -ForegroundColor Red
    $appDataFiles | Select-Object -First 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    
    # Try to explicitly ignore in .gitignore
    if (-not (Test-Path .gitignore)) {
        New-Item -ItemType File -Path .gitignore -Force | Out-Null
    }
    
    $gitignoreContent = Get-Content .gitignore -Raw -ErrorAction SilentlyContinue
    if ($gitignoreContent -notmatch "AppData") {
        Add-Content -Path .gitignore -Value "`n# Windows AppData`nAppData/`n**/AppData/**`n"
    }
    
    git rm -r --cached . 2>$null | Out-Null
    git add .
    
    $appDataFiles = git status --porcelain 2>$null | Select-String -Pattern "AppData"
    if ($appDataFiles) {
        Write-Host "⚠ Still detecting AppData. This might be a Windows git issue." -ForegroundColor Yellow
        Write-Host "Try using --local flag: eas build --profile development --platform android --local" -ForegroundColor Cyan
    } else {
        Write-Host "✓ No AppData files detected!" -ForegroundColor Green
    }
} else {
    Write-Host "✓ No AppData files detected!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host ""
Write-Host "Now try:" -ForegroundColor Yellow
Write-Host "  eas build --profile development --platform android" -ForegroundColor Cyan
Write-Host ""








