# ⚡ Quick Test Checklist - Phase 1 & 2

## 🚀 Server Status
✅ **Running at:** `http://localhost:3000`

---

## 🧪 Quick Test Steps (5 minutes)

### 1. Authentication Setup
- [ ] Login as a user with `sponsor` role
- [ ] If no sponsor account, update role in Supabase:
  ```sql
  UPDATE users SET role = 'sponsor' WHERE email = 'your-email@example.com';
  ```

### 2. Test Mission Dashboard
**URL:** `http://localhost:3000/sponsor/missions`

- [ ] Page loads without errors
- [ ] Stats cards display (Total, Active, Draft, Submissions)
- [ ] "Create Mission" button visible
- [ ] Search bar works
- [ ] Status filters work

### 3. Test Mission Creation
**URL:** `http://localhost:3000/sponsor/missions/create`

- [ ] Form loads correctly
- [ ] Fill out required fields:
  - Title: "Test Mission"
  - Description: "Testing mission creation"
  - Difficulty: Select "Beginner"
  - Max Points: 100
- [ ] Add a tag (e.g., "React")
- [ ] Click "Create Mission (Draft)"
- [ ] Should redirect to mission management page

### 4. Test Mission Management
**URL:** `http://localhost:3000/sponsor/missions/[missionId]`

- [ ] Overview tab shows mission details
- [ ] Submissions tab loads (may be empty)
- [ ] Analytics tab loads
- [ ] Settings tab shows mission status
- [ ] Click "Publish Mission" (if draft)
- [ ] Mission status changes to "active"

### 5. Test API Endpoints (Optional)
**Using Browser Console:**

```javascript
// Test browse missions
fetch('/api/trpc/missions.browseMissions?input={"json":{"limit":10,"offset":0}}')
  .then(r => r.json())
  .then(console.log);
```

---

## ✅ Success Indicators

- ✅ No console errors
- ✅ Pages load in < 2 seconds
- ✅ Forms submit successfully
- ✅ Navigation works smoothly
- ✅ No 404 errors
- ✅ No authentication errors

---

## 🐛 Common Issues

### "Access denied. Sponsor role required"
**Fix:** Update user role in database

### "Mission not found"
**Fix:** Check mission ID in URL matches database

### Form submission fails
**Fix:** Check browser console for errors, verify tRPC endpoint

---

## 📊 Test Results

**Date:** ___________

- [ ] Mission Dashboard: ✅ / ❌
- [ ] Mission Creation: ✅ / ❌
- [ ] Mission Management: ✅ / ❌
- [ ] API Endpoints: ✅ / ❌

**Status:** ✅ READY / ❌ NEEDS FIXES

---

**Quick Test Complete!** 🎉
