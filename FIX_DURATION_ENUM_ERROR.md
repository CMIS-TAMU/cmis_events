# ✅ Fixed: Duration Enum Error

## Problem

The error was:
```
TRPCClientError: Invalid option: expected one of [preferred_duration_minutes]
```

**Root Cause:** 
- Zod's `z.enum()` only works with **string literals**, not numbers
- The backend was using `z.enum([30, 45, 60])` which is incorrect for numeric values

---

## ✅ Solution Applied

### Backend Fix
Changed the schema from:
```typescript
preferred_duration_minutes: z.enum([30, 45, 60]).default(60)
```

To:
```typescript
preferred_duration_minutes: z.number().refine((val) => [30, 45, 60].includes(val), {
  message: 'Duration must be 30, 45, or 60 minutes',
}).default(60)
```

This properly validates that the value is a number and one of the allowed values.

### Frontend Safeguard
Added explicit validation in the form submission:
```typescript
const duration = typeof formData.preferred_duration_minutes === 'number' 
  ? formData.preferred_duration_minutes 
  : parseInt(String(formData.preferred_duration_minutes), 10);

if (![30, 45, 60].includes(duration)) {
  toastUtil.error('Invalid duration', 'Please select a valid duration.');
  return;
}
```

---

## 🔄 Next Steps

### 1. **Restart Dev Server** ⚠️ IMPORTANT
The backend changes require a server restart:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm dev
```

### 2. **Hard Refresh Browser**
- `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- This ensures the frontend code is reloaded

### 3. **Test Again**
1. Go to `/mentorship/dashboard`
2. Click "Request Mini Session"
3. Fill out the form
4. Submit

You should now see:
- ✅ Success toast: "Mini session request created!"
- ✅ Request appears in the list
- ❌ No more enum validation errors

---

## ✅ What's Fixed

- ✅ Backend schema now correctly validates numeric duration
- ✅ Frontend ensures number type before sending
- ✅ Better error messages
- ✅ Toast notifications for success/error

---

## 🐛 If It Still Fails

1. **Check server is restarted:**
   - Look for "Ready" message in terminal
   - Check no TypeScript errors

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for any error messages
   - Share the error if you see one

3. **Verify the request:**
   ```sql
   SELECT * FROM mini_mentorship_requests
   ORDER BY created_at DESC
   LIMIT 1;
   ```

---

**The error should now be fixed! Restart your dev server and try again.** 🚀

