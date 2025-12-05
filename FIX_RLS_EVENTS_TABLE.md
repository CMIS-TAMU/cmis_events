# 🔧 Fix: RLS Policy Error on Event Creation

## 🐛 **Problem**

Error: **"new row violates row-level security policy for table 'events'"**

This happens even when logged in as admin because the code was using the **anon key** which enforces RLS policies.

## ✅ **Solution Applied**

I've updated the events router to use the **service role key** for admin operations, which bypasses RLS.

### **What Changed:**

**File:** `server/routers/events.router.ts`

- ✅ **Create event** - Now uses service role key
- ✅ **Update event** - Now uses service role key  
- ✅ **Delete event** - Now uses service role key

### **Why This Works:**

- Service role key **bypasses RLS** completely
- We've already verified the user is admin via `adminProcedure`
- Safe for server-side admin operations

---

## 🚀 **Quick Fix (Already Done)**

The code is already updated! You just need to:

1. **Restart your dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   # or
   pnpm dev
   ```

2. **Try creating an event again** - Should work now!

---

## 🔍 **If Still Not Working**

### **Check 1: Verify Service Role Key**

Make sure `.env.local` has:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Get it from:**
- Supabase Dashboard → Settings → API
- Copy the **service_role** key (NOT the anon key!)

### **Check 2: Test Admin Client**

Visit: `http://localhost:3000/api/test-admin-client`

Should return:
```json
{
  "success": true,
  "message": "Admin client is working correctly"
}
```

If it fails, the service role key is not set correctly.

### **Check 3: Alternative - Fix RLS Policy**

If you prefer to use RLS policies instead, run this SQL:

**File:** `scripts/fix-events-rls-policy.sql`

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `scripts/fix-events-rls-policy.sql`
3. Paste and Run

This creates proper RLS policies that allow admins to manage events.

---

## 📝 **What the Fix Does**

**Before:**
```typescript
// Used anon key - RLS enforced
const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**After:**
```typescript
// Uses service role key - RLS bypassed
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

---

## ✅ **Expected Result**

After restarting the server:

1. ✅ Create event form works
2. ✅ No RLS errors
3. ✅ Event is saved to database
4. ✅ Redirects to edit page
5. ✅ Emails are queued for sponsors/mentors

---

## 🎯 **Next Steps**

1. **Restart dev server** (important!)
2. **Try creating an event**
3. **Should work now!** 🎉

If you still get errors, check:
- Browser console for error messages
- Server logs for details
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set

---

**The fix is in place - just restart your server and try again!**


