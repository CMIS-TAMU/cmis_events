# 🔧 Quick Fix: Brevo Environment Variables

## The Problem
You're seeing: `BREVO_FROM_EMAIL is not set. Email not sent`

This means the Brevo environment variables are missing from your `.env.local` file.

## Solution: Add Brevo Variables

### Step 1: Get Your Brevo SMTP Credentials

1. Go to https://www.brevo.com and log in
2. Navigate to **Settings** → **SMTP & API** → **SMTP**
3. Click **Generate a new SMTP key** (if you don't have one)
4. Copy these values:
   - **SMTP server**: `smtp-relay.brevo.com`
   - **Port**: `587`
   - **Login**: Your SMTP login email
   - **Password**: Your SMTP key

### Step 2: Add to `.env.local`

Open your `.env.local` file and add these lines:

```env
# Brevo SMTP Configuration
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_smtp_login_email_here
BREVO_SMTP_KEY=your_brevo_smtp_key_here
BREVO_FROM_EMAIL=your-verified-email@example.com
BREVO_FROM_NAME=CMIS Events
```

**Important**: 
- Replace `your_brevo_smtp_login_email_here` with your actual Brevo SMTP login
- Replace `your_brevo_smtp_key_here` with your actual Brevo SMTP key
- Replace `your-verified-email@example.com` with an email address verified in your Brevo account (usually the email you signed up with)

### Step 3: Restart Your Dev Server

**CRITICAL**: You must restart the dev server for environment variables to take effect!

1. Stop the current server (Ctrl+C in the terminal)
2. Start it again:
   ```bash
   pnpm dev
   ```

### Step 4: Test

After restarting, test the email:

```powershell
$body = @{ to = "your-email@example.com" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/test-brevo" -Method POST -ContentType "application/json" -Body $body
```

## Example `.env.local` Section

Your `.env.local` should have a section like this:

```env
# ... other variables ...

# Brevo SMTP Configuration
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=john.doe@example.com
BREVO_SMTP_KEY=xsmtp.1234567890abcdefghijklmnopqrstuvwxyz
BREVO_FROM_EMAIL=john.doe@example.com
BREVO_FROM_NAME=CMIS Events

# ... other variables ...
```

## Verification

After adding the variables and restarting, you should see:
- ✅ No more `BREVO_FROM_EMAIL is not set` errors
- ✅ Emails sending successfully
- ✅ `[Brevo] Message sent` in the logs

## Still Not Working?

1. **Double-check** the variable names are exactly as shown (case-sensitive!)
2. **Verify** you restarted the dev server
3. **Check** that your Brevo SMTP credentials are correct
4. **Ensure** `BREVO_FROM_EMAIL` is a verified email in your Brevo account


