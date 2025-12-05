# 🔧 Fix: Brevo SMTP Authentication Failed

## Error
```
Error: Invalid login: 535 5.7.8 Authentication failed
code: 'EAUTH'
```

This means your Brevo SMTP credentials are incorrect or not properly configured.

## Common Causes & Solutions

### 1. **Using API Key Instead of SMTP Key** ⚠️ MOST COMMON

**Problem**: Brevo has TWO different keys:
- **API Key** (starts with `xkeysib-...`) - for API calls
- **SMTP Key** (starts with `xsmtp-...` or similar) - for SMTP

**Solution**: You MUST use the SMTP key, not the API key!

**How to get the correct SMTP key:**
1. Go to https://www.brevo.com
2. Navigate to **Settings** → **SMTP & API** → **SMTP**
3. Look for **"SMTP key"** section (NOT "API keys")
4. If you don't have one, click **"Generate a new SMTP key"**
5. Copy the **SMTP key** (this is your `BREVO_SMTP_KEY`)

### 2. **Wrong SMTP Username**

**Problem**: The `BREVO_SMTP_USER` should be your SMTP login email, not your regular Brevo account email.

**How to find it:**
1. Go to **Settings** → **SMTP & API** → **SMTP**
2. Look for **"SMTP server"** section
3. You'll see something like:
   - **SMTP server**: `smtp-relay.brevo.com`
   - **Port**: `587`
   - **Login**: `your-smtp-login@example.com` ← This is your `BREVO_SMTP_USER`
   - **Password**: `xsmtp-...` ← This is your `BREVO_SMTP_KEY`

**Important**: The "Login" field is what goes in `BREVO_SMTP_USER`, not your account email!

### 3. **Email Not Verified**

**Problem**: The `BREVO_FROM_EMAIL` must be a verified email address in your Brevo account.

**Solution**:
1. Go to **Settings** → **SMTP & API** → **SMTP**
2. Check which emails are verified
3. Use one of those verified emails for `BREVO_FROM_EMAIL`
4. Usually, the email you signed up with is automatically verified

### 4. **Check Your .env.local Format**

Make sure your `.env.local` has:

```env
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_smtp_login_email_from_brevo_dashboard
BREVO_SMTP_KEY=your_smtp_key_from_brevo_dashboard
BREVO_FROM_EMAIL=your_verified_email@example.com
BREVO_FROM_NAME=CMIS Events
```

**Important checks:**
- ✅ No quotes around values
- ✅ No spaces around `=`
- ✅ `BREVO_SMTP_USER` = the "Login" shown in Brevo dashboard (SMTP section)
- ✅ `BREVO_SMTP_KEY` = the "Password" shown in Brevo dashboard (SMTP section)
- ✅ `BREVO_FROM_EMAIL` = a verified email in your Brevo account

### 5. **Regenerate SMTP Key**

If you're unsure, regenerate the SMTP key:

1. Go to **Settings** → **SMTP & API** → **SMTP**
2. Click **"Generate a new SMTP key"**
3. Copy the new key immediately (you can only see it once!)
4. Update `BREVO_SMTP_KEY` in your `.env.local`
5. Restart your dev server

## Step-by-Step Verification

### Step 1: Get Correct Credentials from Brevo

1. Log in to https://www.brevo.com
2. Go to **Settings** → **SMTP & API** → **SMTP**
3. You should see:
   ```
   SMTP server: smtp-relay.brevo.com
   Port: 587
   Login: [your-smtp-login@example.com]
   Password: [xsmtp-xxxxxxxxxxxxx]
   ```

### Step 2: Update .env.local

Copy these EXACT values to your `.env.local`:

```env
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=[paste the Login value here]
BREVO_SMTP_KEY=[paste the Password value here]
BREVO_FROM_EMAIL=[use a verified email, often same as Login]
BREVO_FROM_NAME=CMIS Events
```

### Step 3: Restart Dev Server

```bash
# Stop server (Ctrl+C)
# Then restart:
pnpm dev
```

### Step 4: Test Again

```powershell
$body = @{ to = "your-email@example.com" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/test-brevo" -Method POST -ContentType "application/json" -Body $body
```

## Quick Checklist

- [ ] Using SMTP key (not API key) for `BREVO_SMTP_KEY`
- [ ] Using SMTP login email (not account email) for `BREVO_SMTP_USER`
- [ ] `BREVO_FROM_EMAIL` is a verified email in Brevo
- [ ] No quotes or spaces in `.env.local` values
- [ ] Dev server restarted after updating `.env.local`
- [ ] Credentials copied correctly (no extra spaces/characters)

## Still Not Working?

If authentication still fails after checking all above:

1. **Double-check in Brevo dashboard**: Make sure you're looking at the SMTP section, not API section
2. **Try regenerating SMTP key**: Sometimes keys expire or get revoked
3. **Verify email**: Make sure `BREVO_FROM_EMAIL` is verified in Brevo
4. **Check for typos**: Copy-paste the values directly from Brevo dashboard

The most common issue is using the API key instead of the SMTP key, or using the wrong email for `BREVO_SMTP_USER`.


