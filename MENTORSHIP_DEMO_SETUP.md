# Mentorship System - Demo Setup Guide

## 🎯 Goal
Set up the mentorship system so a student can request and get matched with a mentor for a live demo.

## 🔍 Issues Identified

1. **Database Function Mismatch**: The `create_match_batch` function might still require a student mentorship profile, but students should use data from the `users` table.

2. **Mentor Availability**: Need to ensure at least one mentor exists and is in the matching pool.

3. **Student Data**: Student needs to have some data (major, skills, or research_interests) for matching to work.

## ✅ Step-by-Step Fix

### Step 1: Run Database Migration
Run this SQL in Supabase SQL Editor to fix the matching functions:

**File**: `database/migrations/FIX_MENTORSHIP_MATCHING_FOR_DEMO.sql`

This will:
- Update `calculate_match_score` to use `users` table for students (no profile required)
- Update `create_match_batch` to NOT require student profile
- Clear expired pending batches

### Step 2: Ensure You Have a Mentor

Run this SQL to check if mentors exist:

```sql
-- Check if mentors exist
SELECT 
  mp.id,
  u.email,
  u.full_name,
  mp.industry,
  mp.areas_of_expertise,
  mp.max_mentees,
  mp.availability_status,
  mp.in_matching_pool
FROM mentorship_profiles mp
JOIN users u ON mp.user_id = u.id
WHERE mp.profile_type = 'mentor';
```

**If no mentors exist**, create one using the mentorship profile form or use the setup script below.

### Step 3: Create a Mentor for Demo (Quick Setup)

Use this SQL to create a mentor quickly:

```sql
-- Replace with actual user UUID and details
-- First, ensure the user exists in auth and users table
-- Then run:

INSERT INTO mentorship_profiles (
  user_id,
  profile_type,
  industry,
  areas_of_expertise,
  max_mentees,
  availability_status,
  in_matching_pool,
  preferred_name,
  contact_email
) VALUES (
  'YOUR_MENTOR_USER_ID',  -- Replace with actual UUID
  'mentor',
  'Technology',
  ARRAY['Software Engineering', 'Machine Learning', 'Web Development'],
  5,
  'active',
  true,
  'Demo Mentor',
  'mentor@example.com'
) ON CONFLICT DO NOTHING;
```

### Step 4: Ensure Student Has Data

The student should have at least one of:
- `major` in users table
- `skills` array in users table
- `research_interests` in metadata JSON
- `career_goals` in metadata JSON

Update student data:

```sql
-- Update student profile with matching data
UPDATE users
SET 
  major = 'Computer Science',
  skills = ARRAY['Python', 'JavaScript', 'React'],
  metadata = jsonb_build_object(
    'research_interests', jsonb_build_array('Machine Learning', 'Web Development'),
    'career_goals', 'Become a software engineer'
  )
WHERE email = 'STUDENT_EMAIL' AND role = 'student';
```

### Step 5: Clear Any Blocking Pending Batches

```sql
-- Clear all pending/expired batches for testing
DELETE FROM match_batches
WHERE status = 'pending' OR (status = 'pending' AND expires_at < NOW());

-- Or just update expired ones
UPDATE match_batches
SET status = 'expired'
WHERE status = 'pending' AND expires_at < NOW();
```

### Step 6: Test the Flow

1. **As Student**: Go to `/mentorship/dashboard` and click "Request a Mentor"
2. **Check**: The system should:
   - Create a match batch
   - Find top 3 mentors
   - Send emails to mentors
   - Show recommendations on the request page

### Step 7: Test Mentor Selection

1. **As Mentor**: Go to `/mentorship/mentor/requests`
2. **Select**: Choose a student request
3. **Verify**: Match should be created and student should see it

## 🐛 Troubleshooting

### Error: "No available mentors found"
- Check if mentors exist: `SELECT COUNT(*) FROM mentorship_profiles WHERE profile_type = 'mentor' AND in_matching_pool = true;`
- Check if mentors are active: `SELECT * FROM mentorship_profiles WHERE profile_type = 'mentor' AND availability_status = 'active';`

### Error: "Student already has a pending match batch"
- Clear pending batches: `DELETE FROM match_batches WHERE status = 'pending';`
- Or wait for batch to expire (7 days)

### Error: "Student profile not found"
- This shouldn't happen if you ran the migration - the new version doesn't require a profile
- Check the function version in database

### Matching scores are low (0-30)
- Ensure student has: major, skills, or research_interests
- Ensure mentor has: industry and areas_of_expertise
- Try to have some overlap between student interests and mentor expertise

## 📝 Quick Test Script

Run this to test the matching:

```sql
-- Replace UUIDs with actual values
SELECT calculate_match_score('STUDENT_UUID', 'MENTOR_USER_UUID');

-- Should return JSON with total_score and reasoning
```

## ✅ Checklist for Demo

- [ ] Migration script run successfully
- [ ] At least 1 mentor exists with `in_matching_pool = true`
- [ ] Student has `major`, `skills`, or `research_interests` 
- [ ] No blocking pending match batches
- [ ] Student can request a mentor successfully
- [ ] Match batch is created with 1-3 mentors
- [ ] Mentors receive email notifications
- [ ] Mentor can select student from requests page
- [ ] Match is created and visible to both

## 🚀 Ready for Demo!

Once all steps are complete, the mentorship request flow should work for your demo.

