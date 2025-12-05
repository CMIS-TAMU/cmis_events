# 🔍 Advanced Brevo SMTP Troubleshooting

## Current Issue: Authentication Still Failing

If you've verified all credentials and it's still failing, try these advanced steps:

## Step 1: Test Connection

Visit this endpoint to see detailed diagnostics:

```
GET http://localhost:3000/api/test-brevo-connection
```

This will show:
- Which environment variables are set
- Connection test results
- Specific error details
- Recommendations

## Step 2: Common Brevo SMTP Issues

### Issue A: FROM Email Must Match SMTP User Domain

**Problem**: Brevo often requires the `FROM` email to be related to the SMTP user email.

**Solution**: 
- If `BREVO_SMTP_USER` = `smtp@example.com`
- Then `BREVO_FROM_EMAIL` should be `something@example.com` or `smtp@example.com`

**Try this in `.env.local`**:
```env
BREVO_SMTP_USER=your-smtp-login@example.com
BREVO_FROM_EMAIL=your-smtp-login@example.com  # Use the SAME email
```

### Issue B: SMTP Key Format

**Problem**: Sometimes SMTP keys have special characters that need escaping.

**Solution**: 
- Make sure there are NO quotes around the SMTP key
- If the key has special characters, try wrapping in quotes (but usually not needed)
- Copy the key directly from Brevo dashboard (don't type it)

### Issue C: Account Type Limitations

**Problem**: Free Brevo accounts may have restrictions.

**Solution**:
- Check your Brevo account status
- Verify you're on a plan that allows SMTP
- Some free accounts require domain verification

### Issue D: Domain Verification Required

**Problem**: Brevo may require domain verification for certain FROM addresses.

**Solution**:
1. Go to Brevo → Settings → Senders & IP
2. Check if your FROM email domain needs verification
3. If yes, add DNS records (SPF, DKIM) to your domain
4. OR use the email you signed up with (usually auto-verified)

## Step 3: Alternative Configuration

If standard config doesn't work, try these alternatives:

### Option 1: Use Port 465 with SSL

Update `.env.local`:
```env
BREVO_SMTP_PORT=465
```

And update `server/brevoEmail.ts`:
```typescript
secure: true, // Use SSL for port 465
```

### Option 2: Use Port 2525

Update `.env.local`:
```env
BREVO_SMTP_PORT=2525
```

### Option 3: Try Different FROM Email

If your current FROM email isn't working:
1. Use the exact SMTP login email as FROM
2. Or use the email you signed up with Brevo

## Step 4: Regenerate SMTP Key

Sometimes keys get corrupted or expire:

1. Go to Brevo → Settings → SMTP & API → SMTP
2. Delete old SMTP key
3. Generate a NEW SMTP key
4. Copy it immediately (you can only see it once!)
5. Update `BREVO_SMTP_KEY` in `.env.local`
6. Restart server

## Step 5: Verify in Brevo Dashboard

1. **Check SMTP Status**:
   - Go to Settings → SMTP & API → SMTP
   - Verify the SMTP key is active
   - Check if there are any restrictions

2. **Check Sender Verification**:
   - Go to Settings → Senders & IP
   - Verify your FROM email is listed and verified
   - If not, add and verify it

3. **Check Account Limits**:
   - Go to Settings → Account
   - Verify your account allows SMTP sending
   - Check daily/monthly limits

## Step 6: Test with Different Email Client

To rule out code issues, test Brevo SMTP with a simple tool:

### Using Node.js Script

Create `test-brevo-direct.js`:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'YOUR_SMTP_USER',
    pass: 'YOUR_SMTP_KEY',
  },
});

async function test() {
  try {
    await transporter.verify();
    console.log('✅ Connection verified!');
    
    const info = await transporter.sendMail({
      from: 'YOUR_FROM_EMAIL',
      to: 'test@example.com',
      subject: 'Test',
      text: 'Test email',
    });
    
    console.log('✅ Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();
```

Run: `node test-brevo-direct.js`

## Step 7: Contact Brevo Support

If nothing works:
1. Go to Brevo support
2. Provide:
   - Your account email
   - SMTP server you're using
   - Error message (535 5.7.8 Authentication failed)
   - Screenshot of your SMTP settings (hide the key)

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] `BREVO_SMTP_USER` = SMTP login email from Brevo dashboard
- [ ] `BREVO_SMTP_KEY` = SMTP key (not API key) from Brevo dashboard
- [ ] `BREVO_FROM_EMAIL` = verified email in Brevo account
- [ ] FROM email domain matches SMTP user domain (or use same email)
- [ ] SMTP key was copied correctly (no extra spaces)
- [ ] No quotes around values in `.env.local`
- [ ] Server restarted after updating `.env.local`
- [ ] Tested connection via `/api/test-brevo-connection`
- [ ] Tried regenerating SMTP key
- [ ] Verified sender email in Brevo dashboard

## Most Likely Fix

Based on common issues, try this first:

1. **Make FROM email match SMTP user email**:
   ```env
   BREVO_SMTP_USER=your-email@example.com
   BREVO_FROM_EMAIL=your-email@example.com  # Same as above
   ```

2. **Regenerate SMTP key** in Brevo dashboard

3. **Restart server**

This fixes 80% of authentication issues!


