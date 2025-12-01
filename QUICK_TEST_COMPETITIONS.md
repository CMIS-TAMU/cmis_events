# ⚡ Quick Test Checklist - Case Competitions (10 minutes)

## 🎯 Essential Tests Only

### ✅ Pre-Flight Check
- [ ] Storage bucket created (`competition-submissions`)
- [ ] Server running (`pnpm dev`)
- [ ] Logged in as admin

---

### Test 1: Create Competition (2 min)
1. Go to `/admin/competitions`
2. Click "New Competition"
3. Fill form and create
4. ✅ Should redirect to management page

### Test 2: Register Team (3 min)
1. Logout/login as regular user
2. Go to `/competitions`
3. Open a competition
4. Click "Register Team"
5. Enter team name, add 2 members, submit
6. ✅ Team should appear

### Test 3: Submit Work (2 min)
1. From competition detail, click "Submit Your Work"
2. Upload test PDF file
3. Submit
4. ✅ Should show "Submission Received"

### Test 4: Add Rubrics (1 min)
1. As admin, go to competition management
2. "Judging Rubrics" tab → Add 2 rubrics
3. ✅ Rubrics should appear

### Test 5: Judge & View Results (2 min)
1. "Judging" tab → Score a team
2. "Results" tab → Check rankings
3. Click "Publish Results"
4. ✅ Results should be public

---

## ✅ Quick Pass Criteria

If all 5 tests pass → System is working! 🎉

If any fail → Check error message and see `TEST_CASE_COMPETITIONS.md` for detailed troubleshooting.

