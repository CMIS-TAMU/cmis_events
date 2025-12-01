# Fix Authentication Issue

## The Problem

GitHub no longer accepts passwords. You **must** use a **Personal Access Token**.

## Solution: Generate a Personal Access Token

### Step 1: Create Token

1. **Go to GitHub Token Settings:**
   - Direct link: https://github.com/settings/tokens/new
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token (classic)

2. **Fill in the form:**
   - **Note:** `CMIS Project Push`
   - **Expiration:** 90 days (or your preference)
   - **Select scopes:**
     - ✅ **`repo`** - Full control of private repositories
     - This will check all repo-related permissions

3. **Generate Token:**
   - Scroll down
   - Click **"Generate token"**
   - ⚠️ **COPY THE TOKEN IMMEDIATELY**
   - It starts with: `ghp_` followed by a long string

### Step 2: Use Token to Push

**Option A: Push with Token (Recommended)**

Run this command, and when prompted for password, paste your token:

```bash
cd /Users/abhishekpatil/Documents/Projects/CMIS-Cursor
git push -u origin main
```

When prompted:

- **Username:** `abhishekp1703`
- **Password:** Paste your Personal Access Token (the `ghp_...` string)

**Option B: Include Token in URL (One-time)**

```bash
cd /Users/abhishekpatil/Documents/Projects/CMIS-Cursor
git push https://YOUR_TOKEN@github.com/CMIS-TAMU/cmis_events.git main
```

Replace `YOUR_TOKEN` with your actual token (starting with `ghp_`).

### Step 3: Save Token for Future Use

After successful push, configure git to remember:

```bash
git config --global credential.helper osxkeychain
```

This will save your token in macOS Keychain for future pushes.

## Quick Token Generation Link

👉 **Click here:** https://github.com/settings/tokens/new

## Token Format

Your token should look like:

```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**NOT** your GitHub password!

## Troubleshooting

- **Token not working?** Make sure you:
  - Copied the entire token (including `ghp_`)
  - Selected `repo` scope
  - Generated it as "classic" token
  - Token hasn't expired

- **Still having issues?** Try creating a new token with:
  - All `repo` permissions checked
  - Longer expiration (90 days)

---

**Generate your token, then try pushing again!** 🚀
