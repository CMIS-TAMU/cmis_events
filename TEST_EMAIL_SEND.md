# 📧 Test Email Sending Guide

## 🎯 **Send Test Emails to Specific Addresses**

This guide shows you how to send test emails to your specified addresses:
- `prasanna.salunkhe@tamu.edu` (assuming this is the correct format)
- `nisarg.sonar@tamu.edu`

---

## 🚀 **Method 1: Using the Test API Endpoint**

### **Send to Single Email**

Open your browser or use curl/Postman:

```
GET http://localhost:3000/api/test-email-notification?email=nisarg.sonar@tamu.edu&type=event
```

**Available types:**
- `event` - Event notification email
- `reminder` - 24-hour reminder email
- `digest` - Sponsor digest email

### **Send to Multiple Emails (POST)**

Use Postman or curl:

```bash
POST http://localhost:3000/api/test-email-notification
Content-Type: application/json

{
  "emails": [
    "prasanna.salunkhe@tamu.edu",
    "nisarg.sonar@tamu.edu"
  ],
  "type": "event"
}
```

---

## 🚀 **Method 2: Using Browser Console**

Open browser console (F12) and run:

```javascript
// Send to one email
fetch('/api/test-email-notification?email=nisarg.sonar@tamu.edu&type=event')
  .then(r => r.json())
  .then(console.log);

// Send to multiple emails
fetch('/api/test-email-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emails: [
      'prasanna.salunkhe@tamu.edu',
      'nisarg.sonar@tamu.edu'
    ],
    type: 'event'
  })
})
.then(r => r.json())
.then(console.log);
```

---

## 🚀 **Method 3: Create Test Users in Database**

### **Option A: Via Supabase Dashboard**

1. Go to Supabase → Authentication → Users
2. Create users with emails:
   - `prasanna.salunkhe@tamu.edu`
   - `nisarg.sonar@tamu.edu`

3. Then create an event as admin - emails will be sent automatically!

### **Option B: Via SQL**

```sql
-- Create test users (if they don't exist)
INSERT INTO users (email, full_name, role)
VALUES 
  ('prasanna.salunkhe@tamu.edu', 'Prasanna Salunkhe', 'student'),
  ('nisarg.sonar@tamu.edu', 'Nisarg Sonar', 'student')
ON CONFLICT (email) DO NOTHING;

-- Enable email notifications for them
INSERT INTO communication_preferences (user_id, email_enabled)
SELECT id, true
FROM users
WHERE email IN ('prasanna.salunkhe@tamu.edu', 'nisarg.sonar@tamu.edu')
ON CONFLICT (user_id) DO UPDATE SET email_enabled = true;
```

Then create an event as admin - they'll receive emails automatically!

---

## 🧪 **Quick Test Commands**

### **Test Event Notification**
```bash
# Single email
curl "http://localhost:3000/api/test-email-notification?email=nisarg.sonar@tamu.edu&type=event"

# Multiple emails
curl -X POST http://localhost:3000/api/test-email-notification \
  -H "Content-Type: application/json" \
  -d '{"emails":["prasanna.salunkhe@tamu.edu","nisarg.sonar@tamu.edu"],"type":"event"}'
```

### **Test Reminder**
```bash
curl "http://localhost:3000/api/test-email-notification?email=nisarg.sonar@tamu.edu&type=reminder"
```

### **Test Sponsor Digest**
```bash
curl "http://localhost:3000/api/test-email-notification?email=nisarg.sonar@tamu.edu&type=digest"
```

---

## ✅ **Verify Emails Sent**

1. **Check Response:**
   ```json
   {
     "success": true,
     "message": "Test email sent successfully to nisarg.sonar@tamu.edu",
     "type": "event",
     "emailId": "..."
   }
   ```

2. **Check Resend Dashboard:**
   - Go to https://resend.com/emails
   - Should see sent emails

3. **Check Email Inbox:**
   - Check spam folder if not in inbox
   - Verify email content

---

## 🔧 **Troubleshooting**

### **Email Not Received?**
- Check spam/junk folder
- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for errors
- Verify email address is correct

### **API Returns Error?**
- Check server logs
- Verify Resend API key is valid
- Check `RESEND_FROM_EMAIL` is set
- Verify domain is verified in Resend (if using custom domain)

---

## 📝 **Note on Email Address**

I noticed you wrote `prasanna.salunkhe.edu` - I'm assuming you meant:
- `prasanna.salunkhe@tamu.edu`

If the email is different, just replace it in the commands above!

---

## 🎯 **Recommended Test Flow**

1. **Send test email** using Method 1 or 2
2. **Check Resend dashboard** to confirm sent
3. **Check email inbox** (and spam)
4. **Create real event** as admin to test full flow
5. **Verify both users receive emails**

---

**Ready to test!** Use any of the methods above to send emails to your specified addresses. 🚀


