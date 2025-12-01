# Git Push Troubleshooting Guide

## Issue: `git push` hangs or runs forever

This is typically caused by authentication issues with GitHub. Here are solutions:

## Quick Fixes

### Solution 1: Use Personal Access Token (Recommended)

GitHub requires Personal Access Tokens (PAT) instead of passwords for HTTPS.

1. **Cancel the hanging push** (Ctrl+C)

2. **Generate a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: `CMIS Project`
   - Expiration: Choose your preference (90 days recommended)
   - Select scopes:
     - ✅ `repo` (Full control of private repositories)
   - Click "Generate token"
   - **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

3. **Push using the token:**
   ```bash
   git push -u origin main
   ```
   - Username: Your GitHub username
   - Password: **Paste your Personal Access Token** (not your password!)

### Solution 2: Use SSH Instead (Best for Long-term)

1. **Check if you have SSH keys:**
   ```bash
   ls -al ~/.ssh
   ```

2. **Generate SSH key if needed:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Press Enter for default location
   # Enter passphrase (optional)
   ```

3. **Add SSH key to GitHub:**
   ```bash
   # Copy your public key
   cat ~/.ssh/id_ed25519.pub
   # Or if using RSA:
   cat ~/.ssh/id_rsa.pub
   ```
   - Go to: https://github.com/settings/ssh/new
   - Title: `CMIS Project - MacBook` (or your machine name)
   - Key: Paste the output from above
   - Click "Add SSH key"

4. **Change remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:CMIS-TAMU/cmis_events.git
   ```

5. **Test connection:**
   ```bash
   ssh -T git@github.com
   # Should say: "Hi CMIS-TAMU! You've successfully authenticated..."
   ```

6. **Now push:**
   ```bash
   git push -u origin main
   ```

### Solution 3: Use GitHub CLI (Easiest)

1. **Install GitHub CLI:**
   ```bash
   # macOS
   brew install gh
   
   # Or download from: https://cli.github.com/
   ```

2. **Authenticate:**
   ```bash
   gh auth login
   # Follow prompts:
   # - GitHub.com
   # - HTTPS
   # - Authenticate in browser
   ```

3. **Push:**
   ```bash
   git push -u origin main
   ```

### Solution 4: Configure Credential Helper (macOS)

If you want to store your credentials:

```bash
# Configure credential helper
git config --global credential.helper osxkeychain

# Now when you push, it will prompt once and save
git push -u origin main
# Enter: username and Personal Access Token
```

## Alternative: Push to Different Branch First

If main branch has conflicts:

```bash
# Push to a temporary branch
git push -u origin main:initial-setup

# Then create PR on GitHub to merge into main
```

## Check Current Status

```bash
# See what branch exists on remote
git ls-remote origin

# See your commits vs remote
git log origin/main..main

# Check if you're ahead
git status -sb
```

## Force Push (⚠️ Use with Caution)

**Only if you're sure you want to overwrite remote:**

```bash
# Check remote first
git fetch origin
git log origin/main..main

# If safe, force push
git push -u origin main --force
```

**Warning:** Force push rewrites history. Only use if:
- You're the only contributor
- You know the remote branch is empty or wrong
- You've backed up your work

## Verify Push Worked

```bash
# Check remote branches
git branch -r

# Verify your commits are there
git log origin/main
```

## Still Having Issues?

### Check Authentication:
```bash
# Test HTTPS connection
git ls-remote https://github.com/CMIS-TAMU/cmis_events.git

# Test SSH connection
ssh -T git@github.com
```

### Check Repository Access:
- Ensure you have push access to the repository
- Check repository settings: https://github.com/CMIS-TAMU/cmis_events/settings/access

### Check Network:
```bash
# Test GitHub connectivity
ping github.com

# Check if behind firewall/proxy
```

### Clear Cached Credentials:
```bash
# macOS Keychain
git credential-osxkeychain erase
host=github.com
protocol=https
[Press Enter twice]

# Or clear all
git config --global --unset credential.helper
```

## Recommended Setup for Team

Use **SSH** for all team members:

1. Each team member generates SSH key
2. Adds to GitHub account
3. Changes remote to SSH:
   ```bash
   git remote set-url origin git@github.com:CMIS-TAMU/cmis_events.git
   ```

This avoids authentication prompts.

---

**Need help?** Check GitHub docs: https://docs.github.com/en/authentication

