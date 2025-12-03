# 🎯 Student Mentor Request - No Profile Required Implementation

**Plan to allow students to request mentors without creating a mentorship profile**

---

## ✅ **Current State Analysis**

### **What We Already Have:**
1. **Users Table Fields:**
   - `major` (text)
   - `gpa` (numeric)
   - `skills` (text[])
   - `graduation_year` (integer)
   - `resume_url` (text)
   - `metadata` (jsonb) - can store interests, career goals, etc.

2. **Resume Data:**
   - Resume uploaded to Supabase Storage
   - Resume URL stored in users table
   - Could parse resume for additional matching data

3. **Matching Algorithm:**
   - Currently requires `mentorship_profiles` table
   - Uses: major, skills, research_interests, career_goals, technical_skills

---

## 🎯 **Design Change**

### **New Flow:**
```
Student logs in
    ↓
Clicks "Request a Mentor"
    ↓
Optional: Fill quick preferences form (mentorship type, notes)
    ↓
System uses existing user data:
  - Major (from users.major)
  - Skills (from users.skills[])
  - Graduation Year (from users.graduation_year)
  - Resume (from users.resume_url - could parse)
  - Metadata (from users.metadata - interests, goals)
    ↓
Matching algorithm runs
    ↓
Top 3 mentors selected
    ↓
Match batch created
    ↓
Mentors receive EMAIL notification
    ↓
Mentor accepts → Match created
```

---

## 📋 **Implementation Plan**

### **Phase 1: Update Matching Algorithm** (High Priority)

**File:** `database/migrations/add_mentorship_matching_functions.sql`

**Changes Needed:**
1. Modify `calculate_match_score()` function:
   - Accept student `user_id` directly
   - Query `users` table instead of `mentorship_profiles` for students
   - Use:
     - `users.major` → matches with mentor industry/expertise
     - `users.skills[]` → matches with mentor areas_of_expertise
     - `users.graduation_year` → age/experience matching
     - `users.metadata->>'research_interests'` → research matching
     - `users.metadata->>'career_goals'` → career goals matching

2. Modify `find_top_mentors()` function:
   - Accept student `user_id` directly
   - Don't require student profile
   - Query users table for student data

3. Modify `create_match_batch()` function:
   - Accept student `user_id` directly
   - Remove student profile requirement
   - Get student data from users table

---

### **Phase 2: Update Backend API** (High Priority)

**File:** `server/routers/mentorship.router.ts`

**Changes Needed:**
1. **`requestMentor` mutation:**
   ```typescript
   // REMOVE: Student profile check
   // ADD: Check if user is a student (role = 'student')
   // ADD: Verify user has some data (major OR skills OR resume)
   // UPDATE: Pass user_id directly to matching functions
   ```

2. **Remove student profile requirement:**
   - Remove check for `mentorship_profiles` where `profile_type = 'student'`
   - Check user role instead: `users.role = 'student'`
   - Optional: Check if user has basic data (major, skills, or resume)

3. **Add student data aggregation:**
   - Get student info from `users` table
   - Get resume URL if available
   - Parse metadata for interests/goals

---

### **Phase 3: Update UI** (Medium Priority)

**Files:**
- `app/mentorship/dashboard/page.tsx`
- `app/mentorship/request/page.tsx`

**Changes Needed:**
1. **Remove profile requirement check:**
   - Don't show "Create Profile" message for students
   - Allow "Request a Mentor" without profile

2. **Optional Quick Preferences Form:**
   - Add simple form when requesting mentor:
     - Preferred mentorship type (career/research/project/general)
     - Any specific preferences or notes
     - Store in `mentorship_requests` table

3. **Update Dashboard:**
   - Show "Request a Mentor" for all students
   - Don't require profile creation first

---

### **Phase 4: Email Notification System** (High Priority)

**File:** Create `lib/email/mentorship-notifications.ts`

**Features Needed:**
1. **Mentor Notification Email:**
   - When match batch created
   - Include:
     - Student name and email
     - Student major and skills
     - Match score
     - Link to view request and accept
     - Student notes/preferences (if provided)

2. **Email Template:**
   - Professional design
   - Clear call-to-action button
   - Student profile summary
   - Why they were matched

3. **Implementation:**
   - Use Resend API (already set up)
   - Send after match batch creation
   - Include mentor dashboard link

---

### **Phase 5: Database Updates** (Low Priority - Optional)

**Enhancement:**
1. **Add metadata fields to users table** (if needed):
   ```sql
   -- Could store in users.metadata JSONB:
   - research_interests: string[]
   - career_goals: string
   - preferred_mentorship_type: string
   ```

2. **OR keep in mentorship_requests table:**
   - Already has: preferred_mentorship_type, preferred_industry, student_notes
   - This is fine for preferences

---

## 🔄 **Migration Strategy**

### **Step 1: Update Matching Functions**
- Modify SQL functions to accept user_id
- Query users table instead of mentorship_profiles for students
- Test matching algorithm

### **Step 2: Update Backend API**
- Remove student profile requirement
- Add role check
- Add data validation (ensure student has some info)

### **Step 3: Update UI**
- Remove profile requirement messages
- Allow direct mentor request
- Add optional preferences form

### **Step 4: Add Email Notifications**
- Create email template
- Send emails when match batch created
- Test email delivery

### **Step 5: Testing**
- Test full flow: student → request → match → mentor email → acceptance
- Verify matching uses correct user data
- Test edge cases (no skills, no major, etc.)

---

## 📊 **Data Mapping**

### **Student Data Sources:**

| Matching Criteria | Current Source (mentorship_profiles) | New Source (users table) |
|-------------------|-------------------------------------|--------------------------|
| Major | `major` | `users.major` |
| Skills | `technical_skills[]` | `users.skills[]` |
| Research Interests | `research_interests[]` | `users.metadata->>'research_interests'` OR from resume parsing |
| Career Goals | `career_goals` | `users.metadata->>'career_goals'` OR from resume parsing |
| Graduation Year | `graduation_year` | `users.graduation_year` |
| GPA | `gpa` | `users.gpa` |

**Optional Enhancement:**
- Parse resume PDF to extract:
  - Skills
  - Experience
  - Education details
  - Interests

---

## ✅ **Implementation Checklist**

### **Backend Changes:**
- [ ] Update `calculate_match_score()` to use users table
- [ ] Update `find_top_mentors()` to use users table
- [ ] Update `create_match_batch()` to use users table
- [ ] Remove student profile requirement from `requestMentor` mutation
- [ ] Add role check (user must be 'student')
- [ ] Add data validation (require major OR skills OR resume)
- [ ] Create email notification function
- [ ] Send emails when match batch created

### **Frontend Changes:**
- [ ] Remove "Create Profile" requirement from mentorship dashboard
- [ ] Update "Request a Mentor" flow (no profile needed)
- [ ] Add optional preferences form
- [ ] Update dashboard to show request button for all students
- [ ] Remove profile creation flow for students

### **Database Changes:**
- [ ] Test matching with users table data
- [ ] Verify indexes exist (users.major, users.skills)
- [ ] Optional: Add metadata parsing for interests/goals

### **Testing:**
- [ ] Test matching with various user data combinations
- [ ] Test email notifications
- [ ] Test full request → match → acceptance flow
- [ ] Test edge cases (missing data, etc.)

---

## 🚀 **Benefits**

1. **Simpler User Experience:**
   - Students don't need to create separate profile
   - One less step in the process
   - Uses data they've already provided

2. **Better Data Consistency:**
   - Single source of truth (users table)
   - No duplicate data to maintain
   - Easier to keep updated

3. **Faster Onboarding:**
   - Students can request mentor immediately after signup
   - No profile creation step
   - Reduces friction

4. **Leverages Existing Data:**
   - Uses resume, skills, major already in system
   - No redundant data entry
   - Better matching with real data

---

## ⚠️ **Considerations**

1. **Data Completeness:**
   - Some students might not have major/skills filled in
   - Solution: Make fields optional in matching
   - Alternative: Prompt to add data when requesting

2. **Resume Parsing:**
   - Could extract additional data from resume PDF
   - Would improve matching accuracy
   - Consider for future enhancement

3. **Backward Compatibility:**
   - Existing student profiles in mentorship_profiles table
   - Could migrate data or keep for reference
   - Recommendation: Keep table, stop creating new student profiles

---

## 📝 **Next Steps**

1. **Confirm approach** with team/stakeholders
2. **Update matching functions** (Phase 1)
3. **Update backend API** (Phase 2)
4. **Update UI** (Phase 3)
5. **Add email notifications** (Phase 4)
6. **Test thoroughly**
7. **Deploy**

---

**This is a significant improvement that simplifies the user experience and leverages existing data!** 🎉

