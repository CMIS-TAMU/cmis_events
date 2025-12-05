# Communication System - UI Testing Guide

## 🧪 Complete Step-by-Step Testing Instructions

---

## Prerequisites

1. **Start your development server:**
   ```bash
   pnpm dev
   ```

2. **Ensure you're logged in as an admin:**
   - Go to `http://localhost:3000/login`
   - Login with an admin account
   - Verify your role is 'admin' in the database

3. **Verify database migration is complete:**
   - Check Supabase Table Editor
   - You should see 8 communication tables

---

## Test 1: Access Templates Page

### Step 1: Navigate to Templates
1. Open browser: `http://localhost:3000`
2. Login as admin
3. Navigate to: `http://localhost:3000/admin/communications/templates`

### Expected Result:
- ✅ Page loads without errors
- ✅ You see "Communication Templates" heading
- ✅ "Create Template" button is visible
- ✅ If no templates exist, you see "No templates found" message

### What to Check:
- [ ] Page renders correctly
- [ ] No console errors
- [ ] Navigation works
- [ ] Admin access is enforced (non-admins should be redirected)

---

## Test 2: Create a Template via API (Since UI Editor Not Yet Built)

Since the template editor UI page isn't built yet, we'll create templates via the browser console or API.

### Option A: Using Browser Console

1. **Open Browser DevTools:**
   - Press `F12` or `Ctrl+Shift+I`
   - Go to "Console" tab

2. **Create a template using tRPC:**
   ```javascript
   // First, get the tRPC client (if available globally)
   // Or use fetch API
   
   fetch('/api/trpc/communications.templates.create', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       json: {
         name: 'Welcome Email',
         description: 'Welcome email for new registrations',
         type: 'email',
         channel: 'email',
         subject: 'Welcome to {{event_name}}!',
         body: '<h1>Hi {{user_name}}!</h1><p>Thank you for registering for {{event_name}}.</p><p>Event Date: {{event_date}}</p>',
         variables: {},
         target_audience: 'registration',
         is_active: true
       }
     })
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error);
   ```

### Option B: Using Direct Database Insert (For Quick Testing)

1. **Go to Supabase Dashboard:**
   - Open Table Editor
   - Select `communication_templates` table
   - Click "Insert" → "Insert row"

2. **Fill in the form:**
   ```
   name: Welcome Email
   description: Welcome email for new registrations
   type: email
   channel: email
   subject: Welcome to {{event_name}}!
   body: <h1>Hi {{user_name}}!</h1><p>Thank you for registering for {{event_name}}.</p>
   variables: {} (as JSON)
   target_audience: registration
   is_active: true
   created_by: (your user ID)
   ```

3. **Save the row**

### Expected Result:
- ✅ Template is created
- ✅ Refresh templates page - you should see the new template
- ✅ Template appears in the list

---

## Test 3: View Templates List

### Steps:
1. Go to: `http://localhost:3000/admin/communications/templates`
2. You should see your created template(s)

### What to Check:
- [ ] Template name is displayed
- [ ] Template type badge is shown (Email/SMS/Social)
- [ ] Description is visible
- [ ] Active/Inactive status is shown
- [ ] Edit and Delete buttons are visible

### Expected UI Elements:
- Template cards with:
  - Icon (Mail/MessageSquare/Share2)
  - Name
  - Description
  - Type badge
  - Status badge (Active/Inactive)
  - Toggle button
  - Edit button
  - Delete button

---

## Test 4: Filter Templates

### Step 1: Test Type Filter
1. On templates page, find the "Type" dropdown
2. Select "Email"
3. **Expected:** Only email templates are shown

### Step 2: Test Status Filter
1. Select "Active" from status dropdown
2. **Expected:** Only active templates are shown

### Step 3: Test Search
1. Type "Welcome" in the search box
2. **Expected:** Only templates matching "Welcome" are shown

### What to Check:
- [ ] Filters work correctly
- [ ] Search is case-insensitive
- [ ] Multiple filters can be combined
- [ ] Clear filters works

---

## Test 5: Toggle Template Active/Inactive

### Steps:
1. Find a template in the list
2. Click the toggle button (ToggleRight/ToggleLeft icon)
3. **Expected:** 
   - Status changes immediately
   - Icon changes (green toggle = active, gray = inactive)
   - Badge updates

### What to Check:
- [ ] Toggle works without page refresh
- [ ] Status persists after refresh
- [ ] Non-admins cannot toggle (if tested)

---

## Test 6: Delete Template

### Steps:
1. Find a template you want to delete
2. Click the Delete button (trash icon)
3. Confirm the deletion dialog
4. **Expected:**
   - Template is removed from list
   - Success message appears (if implemented)
   - Template is deleted from database

### What to Check:
- [ ] Confirmation dialog appears
- [ ] Template is removed after confirmation
- [ ] Error handling if deletion fails

---

## Test 7: Test Queue System (Via API/Console)

Since queue UI isn't built yet, test via console:

### Step 1: Add Item to Queue

```javascript
// In browser console
fetch('/api/trpc/communications.queue.add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    json: {
      template_id: 'YOUR_TEMPLATE_ID', // Get from templates page
      recipient_id: 'YOUR_USER_ID', // Your user ID
      scheduled_for: new Date().toISOString(),
      priority: 5,
      metadata: {
        user_name: 'Test User',
        event_name: 'Test Event',
        event_date: '2024-01-15'
      }
    }
  })
})
.then(r => r.json())
.then(console.log);
```

### Step 2: Process Queue

```bash
# In terminal
curl -X POST http://localhost:3000/api/communications/process-queue
```

Or in browser console:
```javascript
fetch('/api/communications/process-queue', {
  method: 'POST'
})
.then(r => r.json())
.then(console.log);
```

### Expected Result:
- ✅ Queue item is processed
- ✅ Email is sent (if Resend is configured)
- ✅ Log entry is created in `communication_logs` table

---

## Test 8: View Communication Logs (Via Supabase)

### Steps:
1. Go to Supabase Dashboard
2. Open Table Editor
3. Select `communication_logs` table
4. **Expected:** See log entries after sending emails

### What to Check:
- [ ] Logs show sent emails
- [ ] Status is recorded (sent/delivered/opened/clicked)
- [ ] Timestamps are correct
- [ ] Template and recipient IDs are linked

---

## Test 9: Test Email Tracking

### Step 1: Send an Email
- Use the queue system to send an email

### Step 2: Check Tracking Pixel
- Email should contain tracking pixel
- URL format: `/api/communications/track-email?logId=XXX&action=open`

### Step 3: Test Click Tracking
- Links in email should have tracking: `/api/communications/track-email?logId=XXX&action=click&url=...`

### Expected Result:
- ✅ Opens are tracked in `communication_logs`
- ✅ Clicks are tracked
- ✅ `opened_at` and `clicked_at` timestamps are set

---

## Test 10: Test User Preferences (Via API)

### Step 1: Get Preferences
```javascript
fetch('/api/trpc/communications.preferences.get', {
  method: 'GET'
})
.then(r => r.json())
.then(console.log);
```

### Step 2: Update Preferences
```javascript
fetch('/api/trpc/communications.preferences.update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    json: {
      email_enabled: true,
      sms_enabled: false,
      unsubscribe_categories: [],
      preferred_time_windows: {}
    }
  })
})
.then(r => r.json())
.then(console.log);
```

### Expected Result:
- ✅ Preferences are saved
- ✅ Email sending respects preferences
- ✅ Unsubscribed categories are honored

---

## Test 11: Test Template Variations (A/B Testing)

### Step 1: Create Variation via Supabase
1. Go to `email_template_variations` table
2. Insert a variation:
   ```
   template_id: (your template ID)
   variation_type: subject
   content: Alternative Subject Line
   weight: 0.5
   is_active: true
   ```

### Step 2: Test Rendering
- Send emails using the template
- **Expected:** Different variations are randomly selected based on weight

---

## Test 12: Test Surge Mode

### Step 1: Configure Surge Mode
```javascript
fetch('/api/trpc/communications.surgeMode.update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    json: {
      is_active: true,
      threshold_registrations_per_hour: 5,
      batch_interval_hours: 1,
      max_emails_per_recipient_per_day: 3
    }
  })
})
.then(r => r.json())
.then(console.log);
```

### Step 2: Simulate Surge
- Create multiple registrations quickly
- **Expected:** Queue processing respects surge mode limits

---

## Test 13: Test Trigger Functions

### Step 1: Test Registration Trigger
```javascript
// In a server-side context or API route
import { triggerRegistrationEmail } from '@/lib/services/communication-triggers';

await triggerRegistrationEmail(
  'user-id',
  'event-id',
  'registration-id'
);
```

### Step 2: Check Queue
- Go to Supabase `communication_queue` table
- **Expected:** Queue item is created for the registration email

---

## 🐛 Troubleshooting Common Issues

### Issue: Templates Page Shows "No templates found"
**Solution:**
- Create a template via Supabase or API first
- Refresh the page

### Issue: "Unauthorized" or Redirect to Dashboard
**Solution:**
- Ensure you're logged in as admin
- Check your user role in database: `SELECT role FROM users WHERE id = 'your-id';`
- Update role if needed: `UPDATE users SET role = 'admin' WHERE id = 'your-id';`

### Issue: Emails Not Sending
**Solution:**
- Check `RESEND_API_KEY` in `.env.local`
- Check queue status in `communication_queue` table
- Check logs in `communication_logs` table for error messages
- Verify queue processor is running

### Issue: Page Not Loading
**Solution:**
- Check browser console for errors
- Verify server is running: `pnpm dev`
- Check network tab for failed requests

### Issue: Filters Not Working
**Solution:**
- Clear browser cache
- Check browser console for JavaScript errors
- Verify tRPC queries are working

---

## ✅ Testing Checklist

### Basic Functionality
- [ ] Can access templates page
- [ ] Can view templates list
- [ ] Can filter templates
- [ ] Can search templates
- [ ] Can toggle template active/inactive
- [ ] Can delete templates

### API Functionality (Via Console/API)
- [ ] Can create templates via API
- [ ] Can add items to queue
- [ ] Can process queue
- [ ] Can view logs
- [ ] Can update preferences
- [ ] Can configure surge mode

### Email Functionality
- [ ] Emails are sent successfully
- [ ] Email tracking works (opens/clicks)
- [ ] Logs are created correctly
- [ ] Template variables are substituted

### Advanced Features
- [ ] Template variations work
- [ ] Surge mode limits are respected
- [ ] User preferences are honored
- [ ] Trigger functions work

---

## 📸 Screenshots to Take

For documentation, take screenshots of:
1. Templates list page (empty state)
2. Templates list page (with templates)
3. Filtered templates
4. Template card with all elements
5. Browser console showing API calls
6. Supabase tables showing data

---

## 🎯 Next Steps After Testing

1. **If everything works:**
   - System is ready for production use
   - Consider building remaining UI pages
   - Set up cron job for queue processing

2. **If issues found:**
   - Document the issues
   - Check error logs
   - Verify database structure
   - Test API endpoints directly

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

✅ Working:
- Templates page loads
- Can view templates
- Filters work
- [Add more...]

❌ Issues Found:
- [Issue 1]: [Description]
- [Issue 2]: [Description]

🔧 Notes:
- [Any observations]
```

---

**Happy Testing! 🚀**


