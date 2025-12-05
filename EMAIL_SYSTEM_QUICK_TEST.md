# ⚡ Email System - Quick Test Guide

## ✅ **Build Status: PASSED**

All routes compile successfully. No errors.

---

## 🚀 **Quick Start Testing**

### **1. Test Event Creation (2 minutes)**

1. **Log in as Admin** → `http://localhost:3000/login`
2. **Create Event** → `/admin/events/new`
   - Title: "Test Email Event"
   - Date: Tomorrow
   - Save
3. **Check Database** → Supabase → `communication_queue`
   - Should see queued emails

### **2. Test Queue Processing (1 minute)**

**Option A: Wait 5 minutes** (automatic)

**Option B: Manual trigger**
```bash
# In browser console or Postman:
GET http://localhost:3000/api/cron/process-queue
Header: Authorization: Bearer YOUR_CRON_SECRET
```

**Check:**
- Response shows `"sent": X`
- `communication_logs` has entries
- Resend dashboard shows sent emails

### **3. Test Reminders (2 minutes)**

1. **Create event for tomorrow**
2. **Register a user** for that event
3. **Trigger reminder:**
   ```
   GET /api/cron/send-reminders
   Header: Authorization: Bearer YOUR_CRON_SECRET
   ```
4. **Process queue** (step 2)
5. **Check email** - user should receive reminder

---

## 📊 **Database Checks**

### **Quick Verification:**

1. **communication_queue**
   ```sql
   SELECT status, COUNT(*) 
   FROM communication_queue 
   GROUP BY status;
   ```
   - Should see: pending, sent, processing

2. **communication_logs**
   ```sql
   SELECT status, COUNT(*) 
   FROM communication_logs 
   WHERE sent_at > NOW() - INTERVAL '1 hour'
   GROUP BY status;
   ```
   - Should see sent emails

3. **communication_preferences**
   ```sql
   SELECT email_enabled, COUNT(*) 
   FROM communication_preferences 
   GROUP BY email_enabled;
   ```
   - Shows user preferences

---

## 🔧 **Common Issues**

### **No emails queued?**
- Check server logs for errors
- Verify event was created successfully
- Check `onEventCreated` is being called

### **Emails not sending?**
- Verify `RESEND_API_KEY` in `.env.local`
- Check Resend dashboard for errors
- Verify queue processor is running

### **Cron jobs failing?**
- Check `CRON_SECRET` is set
- Verify authorization header format
- Check route is accessible

---

## 📝 **Test Checklist**

- [ ] Event creation queues emails
- [ ] Queue processor sends emails
- [ ] Reminders work for tomorrow's events
- [ ] Sponsor digest includes data
- [ ] Preferences can be updated
- [ ] Unsubscribe works
- [ ] Analytics return data

---

## 🎯 **Success = All Checkboxes ✅**

For detailed testing, see: `EMAIL_SYSTEM_UI_TESTING_GUIDE.md`


