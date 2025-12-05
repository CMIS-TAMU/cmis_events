# Quick UI Testing Guide - Communication System

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Server & Login
```bash
# Terminal 1: Start dev server
pnpm dev

# Browser: Login as admin
http://localhost:3000/login
```

### Step 2: Access Templates Page
```
http://localhost:3000/admin/communications/templates
```

**Expected:** You should see the templates management page

---

## 📝 Test 1: Create Your First Template

### Option A: Via Supabase (Easiest)

1. **Go to Supabase Dashboard:**
   - Open your Supabase project
   - Go to "Table Editor"
   - Select `communication_templates` table
   - Click "Insert" → "Insert row"

2. **Fill in each field individually** (NOT as JSON - fill the form fields):
   
   **Required Fields:**
   - **id**: Leave empty (auto-generated)
   - **name**: Type `Welcome Email`
   - **type**: Type `email`
   - **body**: Type `<h1>Hi {{user_name}}!</h1><p>Thank you for registering for {{event_name}}.</p>`
   
   **Optional but Recommended:**
   - **description**: Type `Welcome email for new registrations`
   - **channel**: Type `email`
   - **subject**: Type `Welcome to {{event_name}}!`
   - **variables**: Type `{}` (empty JSON object)
   - **target_audience**: Type `registration`
   - **is_active**: ✅ Check the checkbox
   - **created_by**: Paste your user ID (get it from `users` table)
   
   **Auto-filled (Leave Empty):**
   - **created_at**: Leave empty
   - **updated_at**: Leave empty
   
   📖 **See `SUPABASE_TEMPLATE_CREATION_GUIDE.md` for detailed step-by-step instructions**

3. **Save the row**

4. **Refresh templates page:**
   - Go back to: `http://localhost:3000/admin/communications/templates`
   - You should now see your template!

---

## ✅ Test 2: View & Filter Templates

### What You Should See:
- ✅ Template card with:
  - Mail icon (for email type)
  - "Welcome Email" title
  - Description
  - Badges: "email" and "Active"
  - Toggle button (green = active)
  - Edit button
  - Delete button

### Test Filters:
1. **Type Filter:**
   - Select "Email" from dropdown
   - ✅ Only email templates show

2. **Status Filter:**
   - Select "Active"
   - ✅ Only active templates show

3. **Search:**
   - Type "Welcome" in search box
   - ✅ Only matching templates show

---

## 🔄 Test 3: Toggle Active/Inactive

1. **Click the toggle button** on your template
2. **Expected:**
   - Icon changes (green ↔ gray)
   - Badge updates (Active ↔ Inactive)
   - Change persists after refresh

---

## 🗑️ Test 4: Delete Template

1. **Click the trash icon** on a template
2. **Confirm deletion** in dialog
3. **Expected:**
   - Template disappears from list
   - Template is deleted from database

---

## 📧 Test 5: Send a Test Email

### Step 1: Get Your Template ID
- On templates page, note the template ID (or get from Supabase)

### Step 2: Get Your User ID
- Check Supabase `users` table for your ID

### Step 3: Add to Queue (Via Supabase)
1. Go to `communication_queue` table
2. Insert row:
   ```json
   {
     "template_id": "YOUR_TEMPLATE_ID",
     "recipient_id": "YOUR_USER_ID",
     "scheduled_for": "2024-01-15T10:00:00Z",
     "status": "pending",
     "priority": 5,
     "metadata": {
       "user_name": "Test User",
       "event_name": "Test Event",
       "event_date": "January 15, 2024"
     }
   }
   ```

### Step 4: Process Queue
**Option A: Via Terminal**
```bash
curl -X POST http://localhost:3000/api/communications/process-queue
```

**Option B: Via Browser Console**
```javascript
fetch('/api/communications/process-queue', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

### Step 5: Check Results
1. **Check your email inbox** (if Resend is configured)
2. **Check logs in Supabase:**
   - Go to `communication_logs` table
   - You should see a log entry with status "sent"

---

## 🎯 Visual Checklist

When you visit `/admin/communications/templates`, you should see:

```
┌─────────────────────────────────────────┐
│ Communication Templates                 │
│ Create and manage email templates      │
│                    [Create Template]    │
├─────────────────────────────────────────┤
│ Filters:                                │
│ [Search...] [Type ▼] [Status ▼]       │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────┐   │
│ │ 📧 Welcome Email                │   │
│ │ Welcome email for new...        │   │
│ │ [email] [Active]                │   │
│ │ [Edit] [🗑️]                    │   │
│ └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## ⚠️ Common Issues & Fixes

### Issue: "No templates found"
**Fix:** Create a template first (see Test 1)

### Issue: Redirected to Dashboard
**Fix:** 
1. Check you're logged in
2. Verify your role is 'admin' in database:
   ```sql
   SELECT role FROM users WHERE email = 'your-email@example.com';
   ```
3. If not admin, update it:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

### Issue: Page shows error
**Fix:**
1. Open browser console (F12)
2. Check for errors
3. Verify server is running: `pnpm dev`
4. Check network tab for failed requests

### Issue: Toggle/Delete doesn't work
**Fix:**
1. Check browser console for errors
2. Verify you're admin
3. Refresh the page
4. Check network requests in DevTools

---

## 📊 What to Verify

After testing, verify:

- [ ] ✅ Templates page loads
- [ ] ✅ Can see templates (after creating one)
- [ ] ✅ Filters work
- [ ] ✅ Search works
- [ ] ✅ Toggle active/inactive works
- [ ] ✅ Delete works
- [ ] ✅ Can add items to queue
- [ ] ✅ Queue processing works
- [ ] ✅ Emails are sent (if Resend configured)
- [ ] ✅ Logs are created

---

## 🎉 Success Indicators

You'll know everything works when:

1. ✅ Templates page loads without errors
2. ✅ You can see your created template
3. ✅ Filters and search work smoothly
4. ✅ Toggle changes status immediately
5. ✅ Queue processes and sends emails
6. ✅ Logs show sent emails

---

## 📚 Next Steps

Once basic testing works:

1. **Create more templates:**
   - Reminder email
   - Cancellation email
   - Waitlist promotion email

2. **Test email sending:**
   - Send to yourself
   - Check tracking (opens/clicks)

3. **Test advanced features:**
   - Template variations
   - Surge mode
   - User preferences

---

**For detailed testing instructions, see: `COMMUNICATION_SYSTEM_UI_TESTING_GUIDE.md`**

