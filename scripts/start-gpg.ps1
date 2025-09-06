# GPG Agent Startup Script for Windows
# This script ensures GPG agent and keyboxd are running properly

Write-Host "Starting GPG services..." -ForegroundColor Green

# Kill any existing processes that might be stuck
$processes = @('gpg-agent', 'keyboxd', 'dirmngr')
foreach ($proc in $processes) {
    try {
        Get-Process -Name $proc -ErrorAction Stop | Stop-Process -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped existing $proc process" -ForegroundColor Yellow
    } catch {
        # Process not running, continue
    }
}

# Wait a moment for processes to fully terminate
Start-Sleep -Seconds 2

# Start GPG agent
Write-Host "Starting GPG agent..." -ForegroundColor Cyan
try {
    $null = gpg-connect-agent /bye 2>&1
    Write-Host "GPG agent started successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to start GPG agent: $_" -ForegroundColor Red
}

# Test GPG functionality
Write-Host "Testing GPG functionality..." -ForegroundColor Cyan
try {
    $keys = gpg --list-secret-keys --with-colons 2>$null
    if ($keys) {
        Write-Host "GPG keys accessible ✓" -ForegroundColor Green
        
        # Extract key ID for reference
        $keyLine = $keys | Select-String "^sec:" | Select-Object -First 1
        if ($keyLine) {
            $keyId = ($keyLine.Line -split ':')[4].Substring(8)  # Last 8 chars of fingerprint
            Write-Host "Main signing key: $keyId" -ForegroundColor Cyan
        }
    } else {
        Write-Host "No GPG keys found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "GPG test failed: $_" -ForegroundColor Red
}

Write-Host "`nGPG setup complete! You can now use git with GPG signing." -ForegroundColor Green
Write-Host "If you still have issues, try running this script again." -ForegroundColor Gray
