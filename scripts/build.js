#!/usr/bin/env node

/**
 * Cross-platform build script for AI Text Proofreader Extension
 * Automatically detects platform and runs the appropriate build script
 */

const { spawn } = require('child_process');
const path = require('path');

function runBuild() {
    console.log('📦 Building packages for all browsers...');
    
    let command, args;
    
    if (process.platform === 'win32') {
        // Windows - use PowerShell
        command = 'powershell';
        args = ['-ExecutionPolicy', 'Bypass', '-File', 'scripts/build-multi-browser.ps1'];
        console.log('🪟 Detected Windows - using PowerShell script');
    } else {
        // Unix/Linux/macOS - use Bash
        command = 'bash';
        args = ['scripts/build-multi-browser.sh'];
        console.log('🐧 Detected Unix/Linux - using Bash script');
    }
    
    const buildProcess = spawn(command, args, {
        stdio: 'inherit',
        cwd: process.cwd()
    });
    
    buildProcess.on('error', (error) => {
        console.error('❌ Build failed:', error.message);
        if (process.platform !== 'win32' && error.code === 'ENOENT' && command === 'bash') {
            console.error('💡 Make sure bash is installed and available in PATH');
        } else if (process.platform === 'win32' && error.code === 'ENOENT' && command === 'powershell') {
            console.error('💡 Make sure PowerShell is installed and available in PATH');
        }
        process.exit(1);
    });
    
    buildProcess.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Build completed successfully!');
        } else {
            console.error(`❌ Build failed with exit code ${code}`);
            process.exit(code);
        }
    });
}

// Run the build
runBuild();