# 🧪 Runtime Testing Guide - Phase 1 & 2

Complete testing guide for the Technical Missions system.

---

## 🚀 Server Status

**Development Server:** Running at `http://localhost:3000`

---

## 📋 Testing Checklist

### Phase 1: Backend Testing

#### 1. Test tRPC Endpoints

**Using Browser Console or API Client:**

```typescript
// Test: Browse missions (as student)
const missions = await trpc.missions.browseMissions.query({
  limit: 10,
  offset: 0,
});

// Test: Get my missions (as sponsor)
const myMissions = await trpc.missions.getMyMissions.query();

// Test: Create mission (as sponsor)
const newMission = await trpc.missions.createMission.mutate({
  title: "Test Mission",
  description: "This is a test mission",
  difficulty: "beginner",
  max_points: 100,
});

// Test: Get leaderboard
const leaderboard = await trpc.missions.getLeaderboard.query({
  limit: 50,
  offset: 0,
});
```

#### 2. Test API Routes

**Starter Files Upload:**
```bash
# Test in Postman or curl
POST http://localhost:3000/api/missions/upload-starter-files
Content-Type: multipart/form-data
- file: [ZIP file]
- missionId: [mission-id]
```

---

### Phase 2: Sponsor UI Testing

#### Test 1: Mission Dashboard

**Steps:**
1. Navigate to: `http://localhost:3000/sponsor/missions`
2. **Expected:**
   - ✅ Page loads without errors
   - ✅ Shows stats cards (Total, Active, Draft, Submissions)
   - ✅ Shows list of missions (if any)
   - ✅ Search bar works
   - ✅ Status filters work
   - ✅ "Create Mission" button visible

**Test Actions:**
- [ ] Click "Create Mission" button
- [ ] Try searching for a mission
- [ ] Filter by status (draft, active, closed)
- [ ] Click on a mission card to view details

---

#### Test 2: Mission Creation

**Steps:**
1. Navigate to: `http://localhost:3000/sponsor/missions/create`
2. **Fill out form:**
   - Title: "Test Mission"
   - Description: "This is a test mission for verification"
   - Difficulty: Select "Beginner"
   - Category: "Web Development"
   - Max Points: 100
   - Add tags: "React", "TypeScript"
   - Requirements: "Build a simple todo app"
   - Submission Instructions: "Submit GitHub link"

3. **Expected:**
   - ✅ Form validates correctly
   - ✅ Tags can be added/removed
   - ✅ All fields save correctly
   - ✅ Mission created as "draft"
   - ✅ Redirects to mission management page

**Test Actions:**
- [ ] Fill out all required fields
- [ ] Add multiple tags
- [ ] Remove a tag
- [ ] Upload starter file (optional)
- [ ] Submit form
- [ ] Verify mission appears in dashboard

---

#### Test 3: Mission Management Page

**Steps:**
1. Navigate to: `http://localhost:3000/sponsor/missions/[missionId]`
2. **Test Overview Tab:**
   - ✅ Shows mission details
   - ✅ Shows stats (attempts, submissions)
   - ✅ Shows requirements and instructions
   - ✅ Shows tags

3. **Test Submissions Tab:**
   - ✅ Shows list of submissions (if any)
   - ✅ Shows student info
   - ✅ Shows submission status
   - ✅ Shows score (if reviewed)

4. **Test Analytics Tab:**
   - ✅ Shows submission statistics
   - ✅ Shows engagement metrics
   - ✅ Shows completion rate

5. **Test Settings Tab:**
   - ✅ Shows mission status
   - ✅ Can publish mission (if draft)
   - ✅ Can close mission (if active)

**Test Actions:**
- [ ] Switch between tabs
- [ ] View mission details
- [ ] Click "Publish Mission" (if draft)
- [ ] View submissions list
- [ ] Check analytics

---

#### Test 4: Submission Review

**Steps:**
1. Navigate to: `http://localhost:3000/sponsor/missions/[missionId]/submissions/[submissionId]`
2. **Expected:**
   - ✅ Shows student profile card
   - ✅ Shows submission details
   - ✅ Shows submission files/links
   - ✅ Score slider works (0-100)
   - ✅ Feedback textarea works
   - ✅ Internal notes textarea works
   - ✅ Estimated points calculator works

**Test Actions:**
- [ ] View student information
- [ ] View submission content
- [ ] Adjust score slider
- [ ] Add feedback
- [ ] Add internal notes
- [ ] Submit review
- [ ] Verify points calculated correctly

---

## 🧪 Manual Testing Scenarios

### Scenario 1: Complete Mission Flow

1. **As Sponsor:**
   - [ ] Create a new mission
   - [ ] Publish the mission
   - [ ] View mission analytics

2. **As Student (different browser/account):**
   - [ ] Browse missions
   - [ ] View mission details
   - [ ] Start mission
   - [ ] Submit solution

3. **As Sponsor:**
   - [ ] View new submission
   - [ ] Review and score submission
   - [ ] Add feedback
   - [ ] Submit review

4. **As Student:**
   - [ ] View reviewed submission
   - [ ] Check points awarded
   - [ ] Check leaderboard rank

### Scenario 2: Points Calculation

1. **Test Different Scores:**
   - [ ] Score: 50 (beginner) → Should award ~25 points
   - [ ] Score: 75 (intermediate) → Should award ~90 points
   - [ ] Score: 100 (expert) → Should award ~300 points

2. **Verify:**
   - [ ] Points appear in student_points table
   - [ ] Point transaction created
   - [ ] Leaderboard updated

### Scenario 3: Email Notifications

1. **Test Email Sending:**
   - [ ] Publish mission → Email sent to students
   - [ ] Submit solution → Email sent to sponsor
   - [ ] Review submission → Email sent to student
   - [ ] Perfect score → Special email sent

2. **Verify:**
   - [ ] Check Resend dashboard for sent emails
   - [ ] Verify email content is correct

---

## 🔍 Verification Points

### Database
- [ ] Missions table has entries
- [ ] Mission submissions table has entries
- [ ] Student points table updated
- [ ] Point transactions created
- [ ] Mission interactions tracked

### UI Functionality
- [ ] All pages load without errors
- [ ] Forms submit successfully
- [ ] Navigation works correctly
- [ ] Filters and search work
- [ ] Tabs switch correctly
- [ ] Modals/dialogs work

### API Functionality
- [ ] tRPC endpoints respond correctly
- [ ] File uploads work
- [ ] Authentication works
- [ ] Authorization works (sponsor vs student)
- [ ] Error handling works

---

## 🐛 Common Issues & Fixes

### Issue: "Access denied. Sponsor role required"

**Fix:**
- Verify user role in database: `SELECT role FROM users WHERE id = 'your-user-id';`
- Update role: `UPDATE users SET role = 'sponsor' WHERE id = 'your-user-id';`

### Issue: "Mission not found"

**Fix:**
- Verify mission exists in database
- Check mission ID is correct
- Verify RLS policies allow access

### Issue: File upload fails

**Fix:**
- Check storage bucket exists
- Verify RLS policies on bucket
- Check file size (max 50 MB for starter files)
- Check file type is allowed

### Issue: Points not calculated

**Fix:**
- Check database function exists: `SELECT * FROM pg_proc WHERE proname = 'calculate_mission_points';`
- Verify function is called correctly
- Check server logs for errors

---

## 📊 Test Results Template

```
Runtime Testing Results
Date: ___________

Phase 1 (Backend):
- tRPC Endpoints: ✅ / ❌
- API Routes: ✅ / ❌
- Database Operations: ✅ / ❌
- Points Calculation: ✅ / ❌

Phase 2 (Sponsor UI):
- Mission Dashboard: ✅ / ❌
- Mission Creation: ✅ / ❌
- Mission Management: ✅ / ❌
- Submission Review: ✅ / ❌

Issues Found:
1. 
2. 
3. 

Status: ✅ READY / ❌ NEEDS FIXES
```

---

## ✅ Success Criteria

**Phase 1 & 2 are ready when:**
- ✅ All pages load without errors
- ✅ Forms submit successfully
- ✅ Database operations work
- ✅ Points calculate correctly
- ✅ Email notifications send
- ✅ File uploads work
- ✅ Navigation is smooth
- ✅ No console errors

---

**Ready to test! Start the dev server and follow the checklist above.** 🚀

