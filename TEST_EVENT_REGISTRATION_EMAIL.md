# 🧪 Testing: Event Registration with Email Confirmation & QR Code

## ✅ Pre-Test Checklist

Before testing, verify these are configured:

### 1. Environment Variables (Check `.env.local`)

Make sure you have these set:
```env
# Email Service (Brevo)
BREVO_API_KEY=your-api-key          ✅ You have this!
BREVO_FROM_EMAIL=your-email@domain.com  ⚠️ Check this!
BREVO_FROM_NAME=CMIS Events         (optional)

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  ⚠️ Required for QR codes in emails!

# QR Code Secret
QR_CODE_SECRET=your-random-secret-string  ⚠️ Required for QR token generation!
```

### 2. Server Running
```bash
pnpm dev
```
Server should be running on `http://localhost:3000`

### 3. Database Ready
- QR code migration should be run (adds `qr_code_token` column)
- Events table exists

---

## 🎯 Quick Test (5 Minutes)

### Step 1: Create a Test Event (as Admin)

1. **Login as Admin:**
   - Go to: `http://localhost:3000/login`
   - Login with admin credentials

2. **Create Event:**
   - Go to: `http://localhost:3000/admin/events/new` (or navigate via admin menu)
   - Fill in event details:
     - Title: "Test Event - QR Code"
     - Description: "Testing registration email"
     - Date: Tomorrow
     - Time: 10:00 AM - 12:00 PM
     - Capacity: 10
   - Click "Create Event"
   - ✅ Event should be created successfully

---

### Step 2: Register for Event (as Student)

1. **Login as Student:**
   - If you don't have a student account:
     - Go to: `http://localhost:3000/signup`
     - Create account with role "Student"
     - Use a **real email address** you can access (for testing email)
   - Otherwise, login at: `http://localhost:3000/login`

2. **Find the Event:**
   - Go to: `http://localhost:3000/events`
   - Find "Test Event - QR Code"
   - Click on it to view details

3. **Register:**
   - Click "Register" button
   - Confirm registration
   - ✅ Should show "Registered" status
   - ✅ Success message should appear

---

### Step 3: Check Email Confirmation

1. **Check Your Email:**
   - Open the email inbox you used for registration
   - Look for email with subject: **"Registration Confirmed: Test Event - QR Code"**
   - Check spam folder if not in inbox

2. **Verify Email Contents:**
   - ✅ Event name and details
   - ✅ Registration confirmation message
   - ✅ **QR code image should be visible** (embedded in email)
   - ✅ Event date and time
   - ✅ Registration ID

3. **Test QR Code in Email:**
   - ✅ QR code image should load
   - ✅ Image should be clear and scannable
   - If QR code doesn't appear:
     - Check server logs for errors
     - Verify `NEXT_PUBLIC_APP_URL` is set correctly
     - Check `/api/qr/generate` endpoint works

---

### Step 4: Check QR Code on Website

1. **View Registrations:**
   - While logged in as student
   - Go to: `http://localhost:3000/registrations`
   - ✅ Should see "Test Event - QR Code" listed

2. **Verify QR Code Display:**
   - Find your registration
   - ✅ QR code should be displayed on the page
   - ✅ Should see "Your QR Code" section
   - ✅ QR code should be visible and clear

3. **Download QR Code (Optional):**
   - Click "Download QR Code" button
   - ✅ Should download QR code as SVG file

---

### Step 5: Test QR Code Generation API

1. **Get QR Token from Database:**
   - Go to Supabase Dashboard → Table Editor → `event_registrations`
   - Find your registration
   - Copy the `qr_code_token` value

2. **Test QR Code Image Generation:**
   - Open in browser: 
     ```
     http://localhost:3000/api/qr/generate?data=YOUR_QR_TOKEN_HERE
     ```
   - Replace `YOUR_QR_TOKEN_HERE` with the actual token
   - ✅ Should display PNG image of QR code
   - ✅ Image should be clear and scannable

---

## 🔍 Troubleshooting

### Issue: Email Not Received

**Check:**
1. **Brevo Configuration:**
   ```bash
   # In .env.local
   BREVO_FROM_EMAIL=your-verified-email@domain.com
   BREVO_API_KEY=your-api-key
   ```

2. **Check Server Logs:**
   - Look for email sending errors in terminal
   - Common errors:
     - "BREVO_FROM_EMAIL is not set"
     - "Email service not configured"
     - Brevo API errors

3. **Verify Email Address:**
   - Make sure `BREVO_FROM_EMAIL` is verified in Brevo dashboard
   - Check spam folder

4. **Check Brevo Dashboard:**
   - Go to Brevo → Transactional → Emails
   - See if emails were sent (even if not received)

---

### Issue: QR Code Not in Email

**Check:**
1. **Application URL:**
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   - Must match your server URL
   - For production, use your domain

2. **QR Code API Endpoint:**
   - Test: `http://localhost:3000/api/qr/generate?data=test123`
   - Should return PNG image
   - If 404, check route file exists

3. **QR Token Generation:**
   - Check database for `qr_code_token` value
   - Should exist after registration
   - Format: `{uuid}:{token}`

4. **Server Logs:**
   - Look for errors when generating QR code
   - Check for missing `QR_CODE_SECRET`

---

### Issue: QR Code Not Generated

**Check:**
1. **QR Code Secret:**
   ```env
   QR_CODE_SECRET=your-random-secret-string
   ```
   - Should be set in `.env.local`
   - Can be any random string (keep it secret!)

2. **Database Migration:**
   - Check if `qr_code_token` column exists in `event_registrations` table
   - Run migration if missing: `database/migrations/add_qr_code.sql`

3. **Registration Status:**
   - Check database: registration should have status = 'registered'
   - Waitlisted registrations might not have QR codes immediately

---

## 📋 Success Checklist

After testing, you should have:

- ✅ Student can register for event
- ✅ Registration creates entry in database
- ✅ QR code token is generated and stored
- ✅ Confirmation email is sent
- ✅ **QR code image appears in email**
- ✅ QR code displays on `/registrations` page
- ✅ QR code can be downloaded
- ✅ QR code image API works (`/api/qr/generate`)

---

## 🚀 Advanced Testing

### Test Multiple Registrations

1. Register multiple students for the same event
2. Each should get their own unique QR code
3. All should receive confirmation emails

### Test Email on Mobile

1. Open email on your phone
2. ✅ QR code should be visible
3. ✅ QR code should be large enough to scan

### Test QR Code Scanning

1. Use a QR code scanner app on phone
2. Scan QR code from email or website
3. ✅ Should read the QR code data
4. ✅ Data should match format: `{registration-id}:{token}`

---

## 📧 Email Testing Tips

### If Emails Aren't Working:

1. **Use Brevo Test Mode:**
   - Check Brevo dashboard for sent emails
   - Verify API key is correct

2. **Check Email Service Status:**
   - Brevo has free tier with limits
   - Check your quota

3. **Test Email Template Locally:**
   - Email template is HTML - you can save it and open in browser
   - Check if QR code URL works

---

## 🎬 Quick Test Script

Copy and run this for a quick test:

```bash
# 1. Start server (if not running)
pnpm dev

# 2. In browser:
#    - Login as admin → Create event
#    - Login as student → Register for event
#    - Check email for QR code
#    - Check /registrations page for QR code

# 3. Verify in database:
#    - Check event_registrations table
#    - Verify qr_code_token exists
#    - Check email was sent (if Brevo logs available)
```

---

**Happy Testing!** 🎉

If you encounter issues, check the troubleshooting section above or check server logs for specific error messages.

