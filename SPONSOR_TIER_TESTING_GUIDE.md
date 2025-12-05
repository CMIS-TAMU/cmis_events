# 🧪 Sponsor Tier System - Testing Guide

## Prerequisites

Before testing, ensure:
- ✅ Code is pushed to GitHub
- ✅ Local dev server is running
- ✅ Database migrations are applied
- ✅ You have admin access

---

## Step 1: Run Database Migrations

### 1.1 Open Supabase SQL Editor

1. Go to https://supabase.com
2. Open your project
3. Navigate to **SQL Editor** in the left sidebar

### 1.2 Run Migration 1: Tier System Tables

1. Copy the entire contents of `database/migrations/add_sponsor_tier_system.sql`
2. Paste into SQL Editor
3. Click **Run** (or press Cmd/Ctrl + Enter)
4. Wait for "✅ Sponsor tier system migration complete!" message

**Verify:**
```sql
-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'sponsor_preferences',
  'notification_queue',
  'notification_logs',
  'sponsor_engagement_stats',
  'sponsor_saved_searches'
);
-- Should return 5 rows

-- Check sponsor_tier column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'sponsor_tier';
-- Should return 1 row
```

### 1.3 Run Migration 2: Helper Functions

1. Copy the entire contents of `database/migrations/add_sponsor_stat_functions.sql`
2. Paste into SQL Editor
3. Click **Run**
4. Wait for "✅ Sponsor stats functions created successfully!" message

**Verify:**
```sql
-- Check functions were created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
  'increment_sponsor_stat',
  'update_sponsor_last_login',
  'check_sponsor_export_limit',
  'check_sponsor_api_limit'
);
-- Should return 4 rows
```

---

## Step 2: Create Test Sponsor Accounts

### 2.1 Create Test Sponsors via Supabase Dashboard

Run this SQL to create 3 test sponsor accounts:

```sql
-- Insert test sponsors
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'sponsor-basic@test.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (gen_random_uuid(), 'sponsor-standard@test.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (gen_random_uuid(), 'sponsor-premium@test.com', crypt('password123', gen_salt('bf')), now(), now(), now())
ON CONFLICT (email) DO NOTHING;

-- Add to users table with different tiers
INSERT INTO users (id, email, full_name, role, sponsor_tier)
SELECT 
  id, 
  email,
  CASE 
    WHEN email = 'sponsor-basic@test.com' THEN 'Basic Sponsor'
    WHEN email = 'sponsor-standard@test.com' THEN 'Standard Sponsor'
    WHEN email = 'sponsor-premium@test.com' THEN 'Premium Sponsor'
  END,
  'sponsor',
  CASE 
    WHEN email = 'sponsor-basic@test.com' THEN 'basic'
    WHEN email = 'sponsor-standard@test.com' THEN 'standard'
    WHEN email = 'sponsor-premium@test.com' THEN 'premium'
  END
FROM auth.users
WHERE email IN ('sponsor-basic@test.com', 'sponsor-standard@test.com', 'sponsor-premium@test.com')
ON CONFLICT (id) DO UPDATE
SET sponsor_tier = EXCLUDED.sponsor_tier,
    role = EXCLUDED.role;
```

**Test Credentials:**
- Basic: `sponsor-basic@test.com` / `password123`
- Standard: `sponsor-standard@test.com` / `password123`
- Premium: `sponsor-premium@test.com` / `password123`

---

## Step 3: Test Admin Interface

### 3.1 Access Admin Sponsors Page

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open browser: http://localhost:3000

3. Login with your admin account

4. Navigate to: http://localhost:3000/admin/sponsors

### 3.2 Test Admin Features

**✅ Verify Dashboard Displays:**
- [ ] Total sponsors count (should show 3+)
- [ ] Premium sponsors count
- [ ] Standard sponsors count
- [ ] Basic sponsors count
- [ ] Engagement analytics (30-day metrics)

**✅ Test Search:**
1. Type "basic" in search box
2. Verify only Basic Sponsor appears
3. Clear search

**✅ Test Tier Filter:**
1. Select "Premium" from tier filter dropdown
2. Verify only premium sponsors show
3. Select "All Tiers" to reset

**✅ Test Individual Tier Change:**
1. Find Basic Sponsor in the table
2. Click the tier dropdown for that sponsor
3. Select "Standard"
4. Verify tier updates immediately
5. Check badge color changes (gray → blue)

**✅ Test Bulk Tier Update:**
1. Check the checkbox next to 2-3 sponsors
2. Click "Bulk Update" button
3. Select "Premium" as new tier
4. Add reason: "Testing bulk update"
5. Click "Update Tiers"
6. Verify success message
7. Verify all selected sponsors now show Premium

**✅ Test Tier Performance Comparison:**
1. Scroll to bottom of page
2. Verify "Tier Performance Comparison" card shows
3. Check metrics display for each tier

---

## Step 4: Test Sponsor Preferences Interface

### 4.1 Login as a Sponsor

1. Logout from admin account
2. Login with: `sponsor-premium@test.com` / `password123`
3. Navigate to: http://localhost:3000/sponsor/preferences

### 4.2 Test Premium Sponsor Features

**✅ Verify Tier Display:**
- [ ] Shows "Premium Tier" badge with crown icon
- [ ] Lists premium benefits:
  - Real-time notifications
  - Custom filters
  - Detailed analytics
  - Bulk export
- [ ] Shows usage stats

**✅ Test Global Notification Frequency:**
1. Click "Default Frequency" dropdown
2. Verify all options available:
   - Real-time (should be enabled for Premium)
   - Batched
   - Daily
   - Weekly
   - Never
3. Select "Real-time"
4. Click "Save Preferences"
5. Verify success message

**✅ Test Event-Specific Preferences:**
1. Scroll to "Event-Specific Notifications"
2. Toggle OFF "Mission Submissions"
3. For "Resume Uploads", select "Real-time"
4. For "New Student", select "Daily"
5. Click "Save Preferences"
6. Verify preferences saved

**✅ Test Student Filters:**
1. Scroll to "Student Filters"
2. Click badges to select:
   - Majors: Computer Science, Engineering
   - Skills: Python, React, SQL
   - Industries: Technology
3. Enter Minimum GPA: 3.5
4. Select graduation years: 2025, 2026
5. Click "Save Preferences"
6. Verify success message

**✅ Test Contact Preferences:**
1. Scroll to "Contact Preferences"
2. Toggle Email ON
3. Toggle Phone OFF
4. Toggle SMS OFF
5. Click "Save Preferences"
6. Verify saved

### 4.3 Test Standard Sponsor (Limited Features)

1. Logout and login as: `sponsor-standard@test.com` / `password123`
2. Navigate to: http://localhost:3000/sponsor/preferences

**✅ Verify Limited Features:**
- [ ] Shows "Standard Tier" badge
- [ ] Real-time option is DISABLED in frequency dropdown
- [ ] Shows upgrade prompt for Premium features
- [ ] Custom filters ARE available
- [ ] Event-specific customization IS available

**✅ Test Frequency Limitations:**
1. Try to select "Real-time" frequency
2. Verify it shows "(Premium only)" and is disabled
3. Select "Batched" instead
4. Save preferences successfully

### 4.4 Test Basic Sponsor (Most Limited)

1. Logout and login as: `sponsor-basic@test.com` / `password123`
2. Navigate to: http://localhost:3000/sponsor/preferences

**✅ Verify Basic Limitations:**
- [ ] Shows "Basic Tier" badge
- [ ] Real-time option is DISABLED
- [ ] Custom filters section NOT shown (or disabled)
- [ ] Event-specific customization NOT shown
- [ ] Only weekly/never options available

---

## Step 5: Test Notification System

### 5.1 Test Direct Dispatch

Create a test script or API endpoint:

```typescript
// app/api/test/dispatch-notification/route.ts
import { NextResponse } from 'next/server';
import { dispatchToSponsors } from '@/lib/communications/notification-dispatcher';

export async function POST() {
  const result = await dispatchToSponsors({
    eventType: 'resume_upload',
    eventData: {
      student_name: 'Test Student',
      student_email: 'test@student.com',
      resume_url: 'https://example.com/resume.pdf',
    },
    studentData: {
      major: 'Computer Science',
      graduation_year: 2025,
      gpa: 3.8,
      skills: ['Python', 'React', 'SQL'],
      preferred_industry: 'Technology',
    },
  });

  return NextResponse.json(result);
}
```

**Test:**
1. Call the endpoint: `POST http://localhost:3000/api/test/dispatch-notification`
2. Check response:
   ```json
   {
     "sent": 1,      // Premium sponsor (real-time)
     "queued": 2,    // Standard and Basic (batched)
     "filtered": 0,
     "errors": 0
   }
   ```

### 5.2 Verify Notification Queue

Check in Supabase:

```sql
-- View queued notifications
SELECT 
  nq.*,
  u.email,
  u.sponsor_tier
FROM notification_queue nq
JOIN users u ON u.id = nq.sponsor_id
ORDER BY scheduled_for;
```

**Verify:**
- [ ] Premium sponsor has no queued notifications (sent immediately)
- [ ] Standard sponsor has notification queued for next 4-hour batch
- [ ] Basic sponsor has notification queued for next Monday

### 5.3 Test Student Filtering

Update one sponsor's preferences to NOT match the student:

```sql
-- Set Basic sponsor to only want Finance majors
UPDATE sponsor_preferences
SET student_filters = '{"majors": ["Finance", "Business"]}'::jsonb
WHERE sponsor_id = (
  SELECT id FROM users WHERE email = 'sponsor-basic@test.com'
);
```

Dispatch again and verify:
- [ ] Basic sponsor is now filtered out (doesn't match major)
- [ ] Result shows `"filtered": 1`

### 5.4 Test Unsubscribe

```sql
-- Unsubscribe Standard sponsor from resume uploads
UPDATE sponsor_preferences
SET unsubscribed_from = ARRAY['resume_upload']
WHERE sponsor_id = (
  SELECT id FROM users WHERE email = 'sponsor-standard@test.com'
);
```

Dispatch again and verify:
- [ ] Standard sponsor doesn't receive notification
- [ ] Result shows filtered increased

---

## Step 6: Test tRPC API Endpoints

### 6.1 Test from Browser Console

Open browser console on any page and test:

```javascript
// Get your tier info
const tierInfo = await window.trpc.sponsors.getMyTier.query();
console.log('My tier:', tierInfo);

// Get your preferences
const prefs = await window.trpc.sponsors.getMyPreferences.query();
console.log('My preferences:', prefs);

// Get engagement stats
const stats = await window.trpc.sponsors.getMyEngagementStats.query();
console.log('My stats:', stats);

// Check feature access
const canUseFilters = await window.trpc.sponsors.canAccessFeature.query({
  feature: 'custom_filters'
});
console.log('Can use custom filters:', canUseFilters);
```

### 6.2 Test Admin Endpoints (as admin)

```javascript
// Get all sponsors
const sponsors = await window.trpc.sponsors.getAllSponsors.query({
  tier: 'all',
  limit: 50,
  offset: 0
});
console.log('All sponsors:', sponsors);

// Get tier stats
const tierStats = await window.trpc.sponsors.getTierStats.query();
console.log('Tier stats:', tierStats);

// Get analytics
const analytics = await window.trpc.sponsors.getEngagementAnalytics.query({
  tier: 'all',
  days: 30
});
console.log('Analytics:', analytics);
```

---

## Step 7: Test Limit Enforcement

### 7.1 Test Export Limits

```sql
-- Simulate Basic sponsor at export limit
UPDATE sponsor_engagement_stats
SET current_month_exports = 10,
    month_period = to_char(now(), 'YYYY-MM')
WHERE sponsor_id = (SELECT id FROM users WHERE email = 'sponsor-basic@test.com');

-- Test limit check
SELECT check_sponsor_export_limit(
  (SELECT id FROM users WHERE email = 'sponsor-basic@test.com')
);
-- Should return FALSE (at limit)

-- Test Premium sponsor (unlimited)
SELECT check_sponsor_export_limit(
  (SELECT id FROM users WHERE email = 'sponsor-premium@test.com')
);
-- Should return TRUE (unlimited)
```

### 7.2 Test Monthly Reset

```sql
-- Manually trigger monthly reset
SELECT reset_monthly_sponsor_limits();

-- Verify counters reset
SELECT sponsor_id, current_month_exports, current_month_api_calls, month_period
FROM sponsor_engagement_stats;
```

---

## Step 8: Test Edge Cases

### 8.1 Test Surge Detection

```sql
-- Create 150 recent notification logs (to trigger surge)
INSERT INTO notification_logs (sponsor_id, notification_type, event_type, email_to)
SELECT 
  (SELECT id FROM users WHERE email = 'sponsor-premium@test.com'),
  'email',
  'test_event',
  'test@example.com'
FROM generate_series(1, 150);
```

Dispatch notification and verify:
- [ ] Premium sponsor is now batched (surge detected)
- [ ] All notifications queued instead of sent

### 8.2 Test Missing Preferences

Dispatch notification for a sponsor without preferences:
- [ ] System uses tier defaults
- [ ] No errors occur

### 8.3 Test Invalid Tier

```sql
-- Try to set invalid tier (should fail constraint)
UPDATE users
SET sponsor_tier = 'invalid'
WHERE email = 'sponsor-basic@test.com';
-- Should error: violates check constraint
```

---

## Step 9: Integration Testing

### 9.1 Test Full Student Resume Upload Flow

1. Login as a student
2. Upload a resume at: http://localhost:3000/profile/resume
3. Check notification_logs table:
   ```sql
   SELECT * FROM notification_logs 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
4. Verify sponsors were notified based on their tiers

### 9.2 Test Admin Tier Change Impact

1. Change a sponsor from Basic to Premium
2. Verify their preferences update automatically
3. Test that they now receive real-time notifications

---

## Step 10: Performance Testing

### 10.1 Test with Many Sponsors

```sql
-- Create 100 test sponsors
INSERT INTO users (id, email, full_name, role, sponsor_tier)
SELECT 
  gen_random_uuid(),
  'test-sponsor-' || i || '@test.com',
  'Test Sponsor ' || i,
  'sponsor',
  CASE 
    WHEN i % 3 = 0 THEN 'premium'
    WHEN i % 3 = 1 THEN 'standard'
    ELSE 'basic'
  END
FROM generate_series(1, 100) i;
```

Dispatch notification and measure:
- [ ] Time to process all sponsors
- [ ] Correct routing (sent vs queued)
- [ ] No errors

---

## ✅ Testing Checklist

### Database Setup
- [ ] Migration 1 ran successfully
- [ ] Migration 2 ran successfully
- [ ] All tables created
- [ ] All functions created
- [ ] RLS policies active

### Admin Interface
- [ ] Page loads without errors
- [ ] Statistics display correctly
- [ ] Search works
- [ ] Filter works
- [ ] Individual tier change works
- [ ] Bulk tier update works
- [ ] Analytics display

### Sponsor Preferences
- [ ] Premium features all available
- [ ] Standard features correctly limited
- [ ] Basic features most limited
- [ ] All preferences save correctly
- [ ] Tier badge displays correctly

### Notification System
- [ ] Dispatch to sponsors works
- [ ] Real-time sending works
- [ ] Queue batching works
- [ ] Student filtering works
- [ ] Unsubscribe works
- [ ] Surge detection works

### API Endpoints
- [ ] All sponsor endpoints work
- [ ] All admin endpoints work
- [ ] Error handling works
- [ ] Authentication enforced

### Limits & Constraints
- [ ] Export limits enforced
- [ ] API limits enforced
- [ ] Tier constraints enforced
- [ ] Monthly reset works

---

## 🐛 Troubleshooting

### Issue: Page Shows "Loading..." Forever

**Solution:**
- Check browser console for errors
- Verify tRPC router is imported in `server/routers/_app.ts`
- Restart dev server

### Issue: Preferences Won't Save

**Solution:**
- Check sponsor_preferences table exists
- Verify RLS policies allow insert/update
- Check browser network tab for API errors

### Issue: Notifications Not Sending

**Solution:**
- Check notification_logs for error status
- Verify email API is configured
- Check sponsor filters aren't excluding students

### Issue: "Role Required" Error

**Solution:**
- Verify user has correct role in users table
- Check middleware is running
- Clear cookies and re-login

---

## 📊 Expected Test Results

After all tests, you should see:

**In Supabase:**
- ✅ 5+ new tables
- ✅ 4 new functions
- ✅ 3+ sponsor users
- ✅ Notification logs
- ✅ Queued notifications

**In App:**
- ✅ Admin page showing all sponsors
- ✅ Sponsor preferences working for all tiers
- ✅ Different features per tier
- ✅ Statistics tracking

**In Console:**
- ✅ No errors
- ✅ All API calls successful
- ✅ Proper tier enforcement

---

## 🎯 Next Steps After Testing

1. **If all tests pass:**
   - Set up production cron job
   - Train admins
   - Document for users
   - Deploy to production

2. **If tests fail:**
   - Check this guide's troubleshooting section
   - Review error messages
   - Verify database migrations
   - Check environment variables

---

**Need Help?**
Refer to `SPONSOR_TIER_SYSTEM_GUIDE.md` for detailed documentation.


