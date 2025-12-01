# Push Using Personal Access Token - Quick Guide

## Step 1: Generate Personal Access Token

1. **Go to GitHub Token Settings:**
   - Open: https://github.com/settings/tokens
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Create New Token:**
   - Click **"Generate new token"** → **"Generate new token (classic)"**
   - You may need to enter your GitHub password

3. **Configure Token:**
   - **Note/Name:** `CMIS Project`
   - **Expiration:** Choose 90 days (or your preference)
   - **Select scopes:**
     - ✅ Check **`repo`** (Full control of private repositories)
     - This will automatically select all repo permissions

4. **Generate and Copy:**
   - Scroll down and click **"Generate token"**
   - ⚠️ **COPY THE TOKEN IMMEDIATELY** - it looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again!

## Step 2: Push Your Code

Once you have the token copied, come back here and I'll help you push!

---

## Alternative: If Token Generation Page Doesn't Load

If you see "Tokens (classic)" is deprecated or not available:

1. Try: https://github.com/settings/tokens/new
2. Or use fine-grained tokens (newer method):
   - Go to: https://github.com/settings/tokens?type=beta
   - Create fine-grained token with `repo` access

---

**Once you have your token, let me know and we'll push!** 🚀
