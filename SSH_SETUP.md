# SSH Setup for GitHub - Quick Guide

Your SSH key is ready! Just need to add it to GitHub.

## Your SSH Public Key

Copy this key (it's already shown below):

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIA9QW9eZYaoQ+QA3MniKr7kKoqpRPrv+C5DmGgBGe6TZ abhishekp1703@gmail.com
```

## Step-by-Step: Add SSH Key to GitHub

1. **Open GitHub SSH Settings:**
   - Go to: https://github.com/settings/ssh/new
   - Or: GitHub → Settings → SSH and GPG keys → New SSH key

2. **Fill in the form:**
   - **Title:** `CMIS Project - MacBook` (or any name you like)
   - **Key type:** Authentication Key
   - **Key:** Paste the entire key from above (starts with `ssh-ed25519`)

3. **Click "Add SSH key"**

4. **Verify it works** (run this command):
   ```bash
   ssh -T git@github.com
   ```

   - You should see: "Hi [username]! You've successfully authenticated..."

## Once SSH Key is Added

After adding the key, run these commands:

```bash
cd /Users/abhishekpatil/Documents/Projects/CMIS-Cursor

# Switch remote to SSH
git remote set-url origin git@github.com:CMIS-TAMU/cmis_events.git

# Verify remote is updated
git remote -v

# Push your code
git push -u origin main
```

That's it! 🚀

---

## Alternative: Use Personal Access Token (Faster, but less secure)

If you prefer to use HTTPS with a token:

1. Generate token: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name: `CMIS Project`
   - Select: `repo` scope
   - Copy the token

2. Push:
   ```bash
   git push -u origin main
   ```

   - Username: Your GitHub username
   - Password: Paste your Personal Access Token
