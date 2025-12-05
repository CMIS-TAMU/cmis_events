# 🔧 Fix: "Unknown template type: email" Error

## ❌ **Problem**

Emails are queued successfully, but fail to send with error:
```
Unknown template type: email
```

## 🐛 **Root Cause**

The `getOrCreateTemplate` function was creating templates with `type: 'email'` instead of using the correct type parameter (`event_notification`, `reminder`, or `sponsor_digest`).

The processor expects one of these types:
- `event_notification`
- `reminder`
- `sponsor_digest`

But templates were being saved as `type: 'email'`, which doesn't match any of the expected types.

---

## ✅ **Fixes Applied**

### **1. Fixed Code (Already Done)**
- ✅ Updated `lib/email/processor.ts` line 285
- Changed from: `type: 'email'`
- Changed to: `type: type` (uses the parameter)

### **2. Fix Existing Template in Database**

**IMPORTANT:** The `type` column must stay as `'email'` (it's the communication channel).  
The template category is stored in `target_audience` column.

**Run this SQL in Supabase SQL Editor:**

```sql
-- Verify current state
SELECT id, name, type, target_audience, channel, subject
FROM communication_templates
ORDER BY created_at DESC;

-- Fix target_audience (not type!) - type must stay as 'email'
UPDATE communication_templates
SET target_audience = 'event_notification'
WHERE name LIKE '%event%notification%' 
  AND (target_audience IS NULL OR target_audience != 'event_notification');

-- Verify the fix
SELECT id, name, type, target_audience, channel
FROM communication_templates
ORDER BY created_at DESC;
```

**Expected Result:**
- `type` should be `'email'` (communication channel - this is correct!)
- `target_audience` should be `'event_notification'` (template category - this is what we use!)

---

## 🧪 **Test It**

### **Step 1: Run SQL Fix**
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL above
3. Verify template type is now `'event_notification'`

### **Step 2: Restart Server**
```bash
# Stop server (Ctrl+C)
npm run dev
```

### **Step 3: Create New Event**
1. Go to `/admin/events/new`
2. Create a test event
3. Watch server logs

### **Step 4: Check Logs**
You should now see:
```
✅ Queue processed: 4 sent, 0 failed
✅ Emails sent successfully!
```

**Instead of:**
```
❌ Queue processed: 0 sent, 4 failed
❌ Unknown template type: email
```

---

## 📋 **What Changed**

### **Files Updated:**
- ✅ `lib/email/processor.ts` - Fixed template creation to use correct type
- ✅ Added logging to debug template type issues

### **Database Fix:**
- ✅ SQL script to update existing templates with wrong type

---

## 🎯 **Next Steps**

1. **Run the SQL fix** (fixes existing template)
2. **Restart server** (loads fixed code)
3. **Create test event** (should work now!)
4. **Check emails** (should be sent successfully)

---

**The code is fixed! Just need to update the existing template in the database.** 🚀

