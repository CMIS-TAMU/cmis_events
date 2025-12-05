# Email Notification Setup Guide for Developer 2

## Problem
Email notifications are not being sent after event creation on Developer 2's system, even though they work on your local system.

## Root Cause
The email notification system requires Brevo (formerly Sendinblue) environment variables to be configured. Developer 2 likely doesn't have these set up.

## Solution: Configure Brevo Environment Variables

### Step 1: Get Brevo API Credentials

1. **Sign up for Brevo** (if not already):
   - Go to https://www.brevo.com/
   - Sign up for a free account (300 emails/day free)

2. **Get SMTP Credentials**:
   - Log in to Brevo dashboard
   - Go to **Settings** → **SMTP & API** → **SMTP**
   - Note down:
     - **SMTP Server**: `smtp-relay.brevo.com`
     - **Port**: `587`
     - **Login**: Your SMTP login (usually your Brevo account email)
     - **Password**: Your SMTP password (generate one if needed)

3. **Get API Key** (Alternative method):
   - Go to **Settings** → **SMTP & API** → **API Keys**
   - Create a new API key
   - Copy the API key

### Step 2: Add Environment Variables

Add these to Developer 2's `.env.local` file:

```env
# Brevo Email Configuration (REQUIRED for email notifications)
BREVO_FROM_EMAIL=your-verified-email@yourdomain.com
BREVO_FROM_NAME=CMIS Events

# Brevo SMTP Configuration
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-brevo-email@example.com
BREVO_SMTP_PASSWORD=your-smtp-password

# OR use API Key instead of SMTP
BREVO_API_KEY=your-brevo-api-key-here

# Application URL (REQUIRED for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Verify Email Address

**Important**: The `BREVO_FROM_EMAIL` must be a verified email address in Brevo:

1. Go to Brevo dashboard → **Settings** → **Senders & IP**
2. Add and verify your sender email address
3. Use that verified email in `BREVO_FROM_EMAIL`

### Step 4: Restart Development Server

After adding environment variables:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm dev
```

### Step 5: Test Email Notifications

1. **Create a test event** as an admin
2. **Check server logs** for:
   - `[Brevo] SMTP configured: smtp-relay.brevo.com:587`
   - `Found X user(s) to notify about new_event`
   - `✓ Notification sent to [email]`
3. **Check email inbox** (including spam folder)

## Troubleshooting

### Issue: "BREVO_FROM_EMAIL is not set"
**Solution**: Add `BREVO_FROM_EMAIL` to `.env.local`

### Issue: "SMTP authentication failed"
**Solution**: 
- Verify SMTP credentials in Brevo dashboard
- Make sure you're using the SMTP password (not your account password)
- Regenerate SMTP password if needed

### Issue: "Email not verified"
**Solution**: 
- Go to Brevo → Settings → Senders & IP
- Verify the sender email address
- Use the verified email in `BREVO_FROM_EMAIL`

### Issue: Emails sent but not received
**Solution**:
- Check spam folder
- Verify email address is correct
- Check Brevo dashboard for delivery status
- Make sure sender email is verified

### Issue: No users found to notify
**Solution**:
- Check if users exist in database with roles: `student`, `mentor`, `sponsor`
- Run: `SELECT email, role FROM users WHERE role IN ('student', 'mentor', 'sponsor');`

## Quick Checklist

- [ ] Brevo account created
- [ ] SMTP credentials obtained OR API key created
- [ ] `BREVO_FROM_EMAIL` added to `.env.local`
- [ ] `BREVO_FROM_NAME` added to `.env.local` (optional)
- [ ] SMTP credentials OR `BREVO_API_KEY` added to `.env.local`
- [ ] `NEXT_PUBLIC_APP_URL` set in `.env.local`
- [ ] Sender email verified in Brevo dashboard
- [ ] Development server restarted
- [ ] Test event created
- [ ] Server logs checked for email sending confirmation

## Code Location

The email notification code is in:
- `server/routers/events.router.ts` - Calls `dispatchToAllUsers()` when event is created
- `lib/communications/notification-dispatcher.ts` - Handles notification routing
- `lib/email/client.ts` - Sends emails via Brevo
- `server/brevoEmail.ts` - Brevo SMTP implementation

## Need Help?

If Developer 2 still can't receive emails after following this guide:
1. Check server logs for specific error messages
2. Verify all environment variables are set correctly
3. Test Brevo connection separately
4. Check if Brevo account has sending limits reached

