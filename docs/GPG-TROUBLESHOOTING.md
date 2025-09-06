# GPG Troubleshooting Guide

## Common GPG Issues and Solutions

### Problem: "gpg: can't connect to the keyboxd: IPC connect call failed"

This is a common issue on Windows where the GPG agent or keyboxd daemon isn't running properly.

#### Quick Fix:
```powershell
# Kill existing processes
taskkill /f /im gpg-agent.exe 2>$null
taskkill /f /im keyboxd.exe 2>$null

# Start GPG agent
gpg-connect-agent /bye

# Test functionality
gpg --list-secret-keys
```

#### Automatic Fix:
Run the provided PowerShell script:
```powershell
.\scripts\start-gpg.ps1
```

### Problem: "gpg failed to sign the data"

This usually means the GPG agent isn't running or can't access your private key.

#### Solutions:
1. **Restart GPG services**: Use the script above
2. **Check key availability**: `gpg --list-secret-keys`
3. **Verify Git configuration**: 
   ```bash
   git config --global user.signingkey
   git config --global commit.gpgsign
   ```
4. **Temporary disable signing**: 
   ```bash
   git commit --no-gpg-sign -m "Your message"
   ```

### Problem: GPG Agent keeps stopping

#### Permanent Solution:
Add GPG agent to Windows startup or create a scheduled task:

1. **Windows Startup Method**:
   - Create a batch file: `gpg-connect-agent /bye`
   - Add to Windows Startup folder: `Win+R` → `shell:startup`

2. **Scheduled Task Method**:
   - Open Task Scheduler
   - Create task to run `gpg-connect-agent /bye` at startup
   - Set to run whether user is logged in or not

### Problem: "No agent running" on fresh boot

The GPG agent doesn't automatically start on Windows. You need to trigger it:

```powershell
# This will start the agent and keep it running
gpg-connect-agent /bye
```

### Configuration Files

GPG configuration is stored in: `%APPDATA%\gnupg\`

Key files:
- `gpg.conf` - GPG configuration
- `gpg-agent.conf` - Agent configuration  
- `pubring.kbx` - Public keys
- `private-keys-v1.d\` - Private keys

### Environment Variables

Sometimes setting these helps:
```powershell
$env:GPG_TTY = (tty)
$env:GNUPGHOME = "$env:APPDATA\gnupg"
```

### Testing GPG Setup

Complete test sequence:
```bash
# 1. Check GPG installation
gpg --version

# 2. Start agent
gpg-connect-agent /bye

# 3. List keys
gpg --list-secret-keys

# 4. Test signing
echo "test" | gpg --clearsign

# 5. Test Git integration
git commit --allow-empty -m "GPG test commit"
```

### Alternative: Disable GPG Signing

If GPG continues to cause issues, you can disable signing:

```bash
# Disable globally
git config --global commit.gpgsign false

# Or disable for specific commits
git commit --no-gpg-sign -m "Message"
```
