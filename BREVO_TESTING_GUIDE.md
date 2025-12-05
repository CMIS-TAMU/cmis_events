# 🧪 Brevo Email Testing Guide

## Prerequisites

### 1. Get Brevo SMTP Credentials

1. **Sign up for Brevo** (if you haven't already):
   - Go to https://www.brevo.com
   - Create a free account

2. **Get SMTP Credentials**:
   - Log in to Brevo dashboard
   - Go to **Settings** → **SMTP & API** → **SMTP**
   - Click **Generate a new SMTP key**
   - Copy:
     - **SMTP server**: `smtp-relay.brevo.com`
     - **Port**: `587`
     - **Login**: Your SMTP login email (e.g., `your-email@example.com`)
     - **Password**: Your SMTP key (long string)

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```env
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_smtp_login_email
BREVO_SMTP_KEY=your_brevo_smtp_key
BREVO_FROM_EMAIL=your-verified-email@example.com
BREVO_FROM_NAME=CMIS Events
```

**Important**: 
- `BREVO_FROM_EMAIL` must be a verified email address in your Brevo account
- For testing, you can use the email you signed up with (it's automatically verified)

---

## Testing Methods

### Method 1: Quick Test Endpoint (Recommended for First Test)

This is the simplest way to verify Brevo is working.

#### Step 1: Start the Development Server

```bash
pnpm dev
```

#### Step 2: Test via API

**Option A: Using curl (PowerShell)**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/test-brevo" -Method POST -ContentType "application/json" -Body '{"to":"your-email@example.com"}'
```

**Option B: Using curl (if you have it installed)**

```bash
curl -X POST http://localhost:3000/api/test-brevo \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'
```

**Option C: Using a REST Client (Postman, Insomnia, etc.)**

- **URL**: `http://localhost:3000/api/test-brevo`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "to": "your-email@example.com"
  }
  ```

#### Step 3: Check Your Email

You should receive an email with:
- **Subject**: "Brevo test from CMIS"
- **Body**: "If you see this, Brevo SMTP is working."

---

### Method 2: Test Event Registration Email

This tests the actual registration flow.

#### Step 1: Start the Server

```bash
pnpm dev
```

#### Step 2: Register for an Event

1. Go to `http://localhost:3000/events`
2. Find an event and click "Register"
3. Complete the registration

#### Step 3: Check Your Email

You should receive a registration confirmation email.

---

### Method 3: Test Event Creation Notification

This tests the admin event creation → automatic email notifications flow.

#### Step 1: Ensure You Have Recipients

Make sure you have users in your database with:
- Role: `sponsor` or `mentor`
- Email addresses set
- `email_enabled = true` (if that field exists)

#### Step 2: Create an Event as Admin

1. Log in as admin
2. Go to `http://localhost:3000/admin/events/new`
3. Fill in event details and create the event

#### Step 3: Check Emails

All eligible recipients (sponsors and mentors) should receive notification emails about the new event.

---

### Method 4: Test via Main Email API

Test different email types via the main email API endpoint.

**URL**: `POST http://localhost:3000/api/email/send`

**Example: Registration Confirmation**

```json
{
  "type": "registration_confirmation",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "event": {
    "title": "Tech Career Fair 2024",
    "description": "Connect with top tech companies",
    "starts_at": "2024-03-15T10:00:00Z",
    "ends_at": "2024-03-15T14:00:00Z",
    "capacity": 100
  },
  "registrationId": "test-123",
  "isWaitlisted": false,
  "waitlistPosition": null,
  "qrCodeToken": null
}
```

**Example: Cancellation**

```json
{
  "type": "cancellation",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "event": {
    "title": "Tech Career Fair 2024",
    "description": "Connect with top tech companies",
    "starts_at": "2024-03-15T10:00:00Z",
    "ends_at": "2024-03-15T14:00:00Z"
  }
}
```

---

## Troubleshooting

### Issue: "BREVO_FROM_EMAIL is not set"

**Solution**: Make sure all Brevo environment variables are in `.env.local` and restart the dev server.

### Issue: "SMTP environment variables are missing"

**Solution**: Check that you've set:
- `BREVO_SMTP_HOST`
- `BREVO_SMTP_USER`
- `BREVO_SMTP_KEY`
- `BREVO_FROM_EMAIL`

### Issue: Email not received

**Check**:
1. Check spam/junk folder
2. Verify the recipient email is correct
3. Check Brevo dashboard for delivery status
4. Check server logs for errors

### Issue: Authentication failed

**Solution**: 
- Verify your SMTP credentials are correct
- Make sure you're using the SMTP key (not the API key)
- Check that the email in `BREVO_FROM_EMAIL` is verified in Brevo

### Issue: "Connection timeout" or "ECONNREFUSED"

**Solution**:
- Check your internet connection
- Verify `BREVO_SMTP_HOST` is `smtp-relay.brevo.com`
- Verify `BREVO_SMTP_PORT` is `587`
- Check if firewall is blocking port 587

---

## Verification Checklist

- [ ] Brevo account created
- [ ] SMTP credentials obtained
- [ ] Environment variables added to `.env.local`
- [ ] Dev server restarted after adding env vars
- [ ] Test endpoint (`/api/test-brevo`) returns success
- [ ] Test email received in inbox
- [ ] Registration email works
- [ ] Event creation notifications work

---

## Next Steps

Once testing is successful:

1. **Production Setup**:
   - Use a verified domain email for `BREVO_FROM_EMAIL`
   - Set up proper email templates
   - Configure email preferences for users

2. **Monitor**:
   - Check Brevo dashboard for delivery rates
   - Monitor bounce rates
   - Set up email tracking if needed

---

## Quick Test Command

For a quick test, run this in PowerShell (replace with your email):

```powershell
$body = @{ to = "your-email@example.com" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/test-brevo" -Method POST -ContentType "application/json" -Body $body
```


