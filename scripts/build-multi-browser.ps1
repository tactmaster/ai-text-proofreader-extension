# Multi-Browser Build Script for AI Text Proofreader
# Creates optimized packages for Chrome/Edge and Firefox

Write-Host "Building AI Text Proofreader for multiple browsers..." -ForegroundColor Green

# Get version from manifest
$version = (Get-Content "manifest.json" | ConvertFrom-Json).version
Write-Host "Version: $version" -ForegroundColor Blue

# Create dist directory
if (Test-Path "dist") {
    Remove-Item "dist" -Recurse -Force
}
New-Item -ItemType Directory -Path "dist" -Force | Out-Null

# Chrome/Edge Package
Write-Host "Building Chrome/Edge package..." -ForegroundColor Yellow

$chromeDir = "dist/chrome-edge"
New-Item -ItemType Directory -Path $chromeDir -Force | Out-Null

# Copy shared files
Copy-Item "background" -Destination "$chromeDir/background" -Recurse
Copy-Item "content" -Destination "$chromeDir/content" -Recurse  
Copy-Item "popup" -Destination "$chromeDir/popup" -Recurse
Copy-Item "shared" -Destination "$chromeDir/shared" -Recurse
Copy-Item "manifest.json" -Destination "$chromeDir/"
Copy-Item "README.md" -Destination "$chromeDir/"

# Create Chrome/Edge specific README
@"
# AI Text Proofreader v$version - Chrome/Edge

## Installation Instructions

### Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select this folder

### Edge  
1. Open Edge and go to `edge://extensions/`
2. Enable "Developer mode" in the left sidebar
3. Click "Load unpacked" and select this folder

## Features
- Full Manifest V3 support
- 21 AI providers supported
- Context-aware proofreading
- Beautiful dual-button interface
- Format preservation
- Privacy-focused (local LLM support)

## Support
For help and updates: https://github.com/tactmaster/ai-text-proofreader-extension
"@ | Out-File -FilePath "$chromeDir/README.md" -Encoding UTF8

# Firefox Package
Write-Host "Building Firefox package..." -ForegroundColor Yellow

$firefoxDir = "dist/firefox"
New-Item -ItemType Directory -Path $firefoxDir -Force | Out-Null

# Copy shared files
Copy-Item "background" -Destination "$firefoxDir/background" -Recurse
Copy-Item "content" -Destination "$firefoxDir/content" -Recurse
Copy-Item "popup" -Destination "$firefoxDir/popup" -Recurse  
Copy-Item "shared" -Destination "$firefoxDir/shared" -Recurse
Copy-Item "manifest-firefox.json" -Destination "$firefoxDir/manifest.json"
Copy-Item "README.md" -Destination "$firefoxDir/"

# Create Firefox specific README
@"
# AI Text Proofreader v$version - Firefox

## Installation Instructions

### Firefox (Temporary)
1. Open Firefox and go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from this folder

### Firefox (Permanent - Advanced)
For permanent installation, the extension needs to be signed by Mozilla or installed as a development add-on.

## Features
- Full Manifest V2 compatibility
- 21 AI providers supported
- Context-aware proofreading
- Beautiful dual-button interface
- Format preservation
- Privacy-focused (local LLM support)

## Support
For help and updates: https://github.com/tactmaster/ai-text-proofreader-extension
"@ | Out-File -FilePath "$firefoxDir/README.md" -Encoding UTF8

# Create ZIP packages
Write-Host "Creating ZIP packages..." -ForegroundColor Yellow

$chromeZip = "dist/ai-text-proofreader-chrome-edge-v$version.zip"
$firefoxZip = "dist/ai-text-proofreader-firefox-v$version.zip"

# Compress Chrome/Edge package
Compress-Archive -Path "$chromeDir/*" -DestinationPath $chromeZip -Force

# Compress Firefox package  
Compress-Archive -Path "$firefoxDir/*" -DestinationPath $firefoxZip -Force

# Create checksums
Write-Host "Generating checksums..." -ForegroundColor Yellow

$chromeHash = (Get-FileHash $chromeZip -Algorithm SHA256).Hash.ToLower()
$firefoxHash = (Get-FileHash $firefoxZip -Algorithm SHA256).Hash.ToLower()

$checksums = @"
# SHA256 Checksums for AI Text Proofreader v$version

$chromeHash  $(Split-Path $chromeZip -Leaf)
$firefoxHash  $(Split-Path $firefoxZip -Leaf)

# Verification
# Windows: Get-FileHash filename.zip -Algorithm SHA256
# Linux/Mac: sha256sum filename.zip
"@

$checksums | Out-File -FilePath "dist/checksums.txt" -Encoding UTF8

Write-Host "Build complete!" -ForegroundColor Green
Write-Host "Packages created in dist/:" -ForegroundColor Blue

Get-ChildItem "dist/*.zip" | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "   - $($_.Name) ($size MB)" -ForegroundColor Cyan
}

Write-Host "   - checksums.txt" -ForegroundColor Cyan

Write-Host ""
Write-Host "Checksums:" -ForegroundColor Blue
Get-Content "dist/checksums.txt"

Write-Host ""
Write-Host "Release packages ready for distribution!" -ForegroundColor Green
