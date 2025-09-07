# Release Process Guide

This repository uses an automated release system with branch protection for the AI Text Proofreader extension.

## 🏗️ Repository Structure

- **`main`** - Protected production branch
- **`release`** - Release automation branch
- **`feature/*`** - Feature development branches

## 🚀 Creating a Release

### Option 1: Automatic Release (Recommended)
1. Ensure your changes are merged to `main`
2. Switch to release branch:
   ```bash
   git checkout release
   git merge main
   git push origin release
   ```
3. The automated release workflow will:
   - Run all tests
   - Bump version (patch increment)
   - Create git tag
   - Build extension package
   - Create GitHub release
   - Create PR to merge version changes back to main

### Option 2: Manual Release with Version Control
1. Go to **Actions** tab in GitHub
2. Select **"Automated Release"** workflow
3. Click **"Run workflow"**
4. Choose release type:
   - `patch` - Bug fixes (1.2.0 → 1.2.1)
   - `minor` - New features (1.2.0 → 1.3.0)
   - `major` - Breaking changes (1.2.0 → 2.0.0)

## 🛡️ Branch Protection Setup

### Initial Setup
1. Run the **"Initialize Release Branch"** workflow to create the release branch
2. Run the **"Setup Branch Protection"** workflow to protect main branch

### Manual Branch Protection (if automated setup fails)
1. Go to: `Settings` → `Branches`
2. Add rule for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Dismiss stale PR approvals
   - ✅ Require status checks: `test`, `quality-checks`
   - ✅ Require conversation resolution
   - ❌ Allow force pushes
   - ❌ Allow deletions

## 📦 Release Artifacts

Each release creates:
- **Extension Package**: `ai-text-proofreader-vX.X.X.zip`
- **Checksums**: `checksums.txt` for integrity verification
- **Installation Guide**: Included in release notes
- **Git Tag**: `vX.X.X` for version tracking

## 🔄 Workflow Integration

### Existing Workflows
- **Test**: Runs on all PRs and pushes
- **Quality Checks**: Linting and code quality
- **Build and Package**: Creates release artifacts

### New Workflows
- **Automated Release**: Handles version bumping and release creation
- **Branch Protection**: Sets up repository security
- **Initialize Release**: Creates release branch

## 🎯 Benefits

1. **Protected Main Branch**: Prevents direct pushes to production
2. **Automated Versioning**: Semantic version bumping
3. **Consistent Releases**: Standardized release packages
4. **Quality Assurance**: Tests must pass before release
5. **Audit Trail**: Git tags and release history

## 📋 Release Checklist

- [ ] All tests passing on main
- [ ] Features tested in extension
- [ ] Documentation updated
- [ ] Version bump appropriate (patch/minor/major)
- [ ] Release notes review
- [ ] Extension package tested

## 🔧 Troubleshooting

### Release Branch Issues
```bash
# Reset release branch to main
git checkout release
git reset --hard origin/main
git push --force origin release
```

### Failed Release
1. Check workflow logs in Actions tab
2. Ensure all tests pass
3. Verify manifest.json and package.json are valid
4. Check file permissions and Git access

### Branch Protection Issues
- Repository admin access required for branch protection
- Use manual setup if automated setup fails
- Ensure required status checks exist (test, quality-checks)

## 📞 Support

For issues with the release process:
1. Check GitHub Actions logs
2. Review this documentation
3. Create issue in repository
4. Contact repository maintainers
