# 🔐 User Login & Profile System Improvement Roadmap

## 📋 Executive Summary

This document outlines the current flaws, suggested improvements, and a comprehensive implementation roadmap for enhancing the user authentication and profile management system with proper role-based access control (RBAC) and student profile enhancements.

---

## 🔍 Current State Analysis

### ✅ What's Working

1. **Basic Authentication**
   - Supabase Auth integration
   - Login/Signup pages functional
   - Session management via cookies

2. **Basic Role System**
   - Roles stored in database (`users.role`)
   - Admin route protection in middleware
   - tRPC admin procedures exist

3. **Profile Structure**
   - Basic profile page exists
   - Student profile edit page exists (basic fields)

---

## ❌ Current Flaws & Issues

### 1. **No Role-Based UI/UX**
   - **Issue**: Everyone sees all navigation links and dashboard sections
   - **Impact**: Students see admin/sponsor links, sponsors see student features
   - **Examples**:
     - Dashboard shows same cards for all users
     - Navigation shows "Admin", "Sponsor Portal" to everyone
     - Profile page shows all actions regardless of role

### 2. **Insufficient Student Profile Fields**
   - **Current Fields**: Major, Skills, Research Interests, Career Goals, Graduation Year, GPA
   - **Missing Fields**:
     - Contact details (phone, address, LinkedIn)
     - Preferred industry
     - Work experience (history, internships, projects)
     - Educational background details
     - Social media links

### 3. **No Role-Specific Dashboard**
   - **Issue**: Single generic dashboard for all users
   - **Impact**: Poor user experience, irrelevant content shown
   - **Missing**:
     - Student-specific dashboard with academic info
     - Faculty dashboard with teaching/mentoring info
     - Sponsor dashboard (partially exists but not complete)
     - Admin dashboard (exists but not role-filtered)

### 4. **Inconsistent Role Checking**
   - **Issue**: Role checks scattered across components, no centralized system
   - **Impact**: Inconsistent behavior, hard to maintain
   - **Examples**:
     - Some pages check role in `useEffect`
     - Some check in component render
     - No reusable role-based components

### 5. **Database Schema Limitations**
   - **Issue**: User profile data stored in JSONB metadata field
   - **Impact**: Hard to query, no type safety, no validation
   - **Current**: `users.metadata` (jsonb) stores everything
   - **Needed**: Structured columns for student-specific fields

### 6. **No Role-Based Navigation**
   - **Issue**: Header shows all links to all users
   - **Impact**: Confusing navigation, access to unauthorized sections
   - **Examples**:
     - Students see "Admin" link
     - Non-sponsors see "Sponsor Portal"

---

## 💡 Suggested Improvements

### 1. **Implement Comprehensive RBAC System**

#### A. Create Role-Based Component Library
- `<RoleGuard>` component - Hide/show content based on role
- `<StudentOnly>`, `<FacultyOnly>`, `<SponsorOnly>`, `<AdminOnly>` wrappers
- `<RoleBasedRoute>` for route-level protection

#### B. Centralize Role Management
- Create `lib/auth/roles.ts` - Role definitions and utilities
- Create `hooks/useUserRole.ts` - Reusable role hook
- Create `lib/permissions.ts` - Permission matrix

#### C. Role-Specific Dashboards
- `/dashboard/student` - Student dashboard
- `/dashboard/faculty` - Faculty dashboard  
- `/dashboard/sponsor` - Sponsor dashboard
- `/dashboard/admin` - Admin dashboard
- Main `/dashboard` redirects based on role

### 2. **Enhance Student Profile**

#### A. Database Schema Updates
Add dedicated columns to `users` table:
```sql
-- Contact Information
phone text,
linkedin_url text,
github_url text,
website_url text,
address text,

-- Student-Specific
preferred_industry text,
graduation_year integer,
gpa numeric(3,2),
major text,
degree_type text, -- 'bachelor', 'master', 'phd'

-- Work Experience (stored as JSONB for flexibility)
work_experience jsonb DEFAULT '[]'::jsonb,
-- Structure: [{company, position, start_date, end_date, description}]

-- Education History
education jsonb DEFAULT '[]'::jsonb,
-- Structure: [{institution, degree, field, start_date, end_date, gpa}]
```

#### B. Enhanced Student Profile UI
- **Contact Details Section**
  - Phone number
  - LinkedIn profile
  - GitHub profile
  - Personal website
  - Address

- **Preferred Industry Section**
  - Industry selection (dropdown with search)
  - Multiple industries support
  - Career path preferences

- **Work Experience Section**
  - Add/edit/delete work experience entries
  - Internships
  - Full-time positions
  - Projects/Portfolio

- **Education Section**
  - Multiple education entries
  - Institution, degree, field of study
  - Dates and GPA

### 3. **Role-Based Navigation & UI**

#### A. Smart Navigation Component
- Only show relevant links based on role
- Role-specific menu items
- Conditional rendering in header

#### B. Role-Specific Page Sections
- Dashboard cards filtered by role
- Profile sections shown based on role
- Action buttons only for authorized roles

### 4. **Profile Completion Wizard**

- **For New Students**: Multi-step profile setup
  - Step 1: Basic Info (Name, Email)
  - Step 2: Contact Details
  - Step 3: Academic Info (Major, GPA, Graduation)
  - Step 4: Professional Info (Industry, Skills)
  - Step 5: Work Experience
  - Step 6: Career Goals

- **Progress Indicator**: Show profile completeness percentage
- **Required vs Optional**: Mark required fields clearly

---

## 🗺️ Implementation Roadmap

### Phase 1: Database Schema & Backend (Week 1)

#### Task 1.1: Update Database Schema
- [ ] Create migration file: `add_student_profile_fields.sql`
- [ ] Add contact information columns
- [ ] Add work experience JSONB column
- [ ] Add education history JSONB column
- [ ] Add preferred industry column
- [ ] Create indexes for performance
- [ ] Test migration in development

**Files to Create:**
- `database/migrations/add_student_profile_fields.sql`

**Estimated Time**: 4 hours

#### Task 1.2: Update tRPC Auth Router
- [ ] Extend `updateStudentProfile` mutation
- [ ] Add fields: contact details, industry, work experience
- [ ] Create `updateContactDetails` mutation
- [ ] Create `addWorkExperience` mutation
- [ ] Create `updateWorkExperience` mutation
- [ ] Create `deleteWorkExperience` mutation

**Files to Update:**
- `server/routers/auth.router.ts`

**Estimated Time**: 6 hours

#### Task 1.3: Create Role Utilities
- [ ] Create `lib/auth/roles.ts` - Role constants and types
- [ ] Create `lib/auth/permissions.ts` - Permission matrix
- [ ] Create `hooks/useUserRole.ts` - Role hook
- [ ] Create `hooks/usePermissions.ts` - Permission hook

**Files to Create:**
- `lib/auth/roles.ts`
- `lib/auth/permissions.ts`
- `hooks/useUserRole.ts`
- `hooks/usePermissions.ts`

**Estimated Time**: 4 hours

**Phase 1 Total**: ~14 hours (2 days)

---

### Phase 2: Role-Based Components (Week 1-2)

#### Task 2.1: Create Role Guard Components
- [ ] Create `<RoleGuard>` component
- [ ] Create `<StudentOnly>` wrapper
- [ ] Create `<FacultyOnly>` wrapper
- [ ] Create `<SponsorOnly>` wrapper
- [ ] Create `<AdminOnly>` wrapper
- [ ] Create `<RoleBasedRoute>` wrapper
- [ ] Add TypeScript types for roles

**Files to Create:**
- `components/auth/RoleGuard.tsx`
- `components/auth/StudentOnly.tsx`
- `components/auth/FacultyOnly.tsx`
- `components/auth/SponsorOnly.tsx`
- `components/auth/AdminOnly.tsx`
- `components/auth/RoleBasedRoute.tsx`
- `types/auth.ts`

**Estimated Time**: 6 hours

#### Task 2.2: Update Navigation Component
- [ ] Implement role-based link filtering
- [ ] Create role-specific menu items
- [ ] Hide unauthorized links
- [ ] Add role badges/icons

**Files to Update:**
- `components/layout/header.tsx`

**Estimated Time**: 4 hours

#### Task 2.3: Create Role-Specific Dashboard Redirects
- [ ] Update main dashboard to redirect by role
- [ ] Create dashboard routing logic
- [ ] Add role detection middleware

**Files to Update:**
- `app/dashboard/page.tsx`
- Create: `app/dashboard/student/page.tsx`
- Create: `app/dashboard/faculty/page.tsx`

**Estimated Time**: 4 hours

**Phase 2 Total**: ~14 hours (2 days)

---

### Phase 3: Enhanced Student Profile (Week 2)

#### Task 3.1: Update Student Profile Edit Form
- [ ] Add Contact Details section
  - Phone input with validation
  - LinkedIn URL input
  - GitHub URL input
  - Website URL input
  - Address textarea
- [ ] Add Preferred Industry section
  - Industry dropdown/autocomplete
  - Multi-select support
- [ ] Add Work Experience section
  - Form to add work experience
  - List view with edit/delete
  - Date pickers for start/end dates
  - Company, position, description fields
- [ ] Add Education section
  - Form to add education entries
  - List view with edit/delete
  - Institution, degree, field, dates, GPA

**Files to Update:**
- `app/profile/edit/page.tsx`

**Estimated Time**: 12 hours

#### Task 3.2: Create Work Experience Components
- [ ] Create `<WorkExperienceForm>` component
- [ ] Create `<WorkExperienceList>` component
- [ ] Create `<WorkExperienceCard>` component
- [ ] Add form validation
- [ ] Add date validation

**Files to Create:**
- `components/profile/WorkExperienceForm.tsx`
- `components/profile/WorkExperienceList.tsx`
- `components/profile/WorkExperienceCard.tsx`

**Estimated Time**: 6 hours

#### Task 3.3: Update Profile Display Page
- [ ] Add Contact Details display section
- [ ] Add Preferred Industry display
- [ ] Add Work Experience display section
- [ ] Add Education display section
- [ ] Role-specific sections (only show student sections to students)

**Files to Update:**
- `app/profile/page.tsx`

**Estimated Time**: 6 hours

**Phase 3 Total**: ~24 hours (3 days)

---

### Phase 4: Role-Specific Dashboards (Week 2-3)

#### Task 4.1: Create Student Dashboard
- [ ] Academic information card
- [ ] Upcoming events card (student-specific)
- [ ] Mentor match status card
- [ ] Resume status card
- [ ] Mission submissions card
- [ ] Quick actions (role-specific)

**Files to Create:**
- `app/dashboard/student/page.tsx`
- `components/dashboard/StudentDashboardCards.tsx`

**Estimated Time**: 8 hours

#### Task 4.2: Create Faculty Dashboard
- [ ] Teaching assignments card
- [ ] Mentoring requests card
- [ ] Student list card
- [ ] Office hours card
- [ ] Quick actions (faculty-specific)

**Files to Create:**
- `app/dashboard/faculty/page.tsx`
- `components/dashboard/FacultyDashboardCards.tsx`

**Estimated Time**: 6 hours

#### Task 4.3: Update Existing Dashboards
- [ ] Make sponsor dashboard role-aware
- [ ] Make admin dashboard role-aware
- [ ] Add role filtering to all dashboard components

**Files to Update:**
- `app/sponsor/dashboard/page.tsx`
- `app/admin/dashboard/page.tsx`

**Estimated Time**: 4 hours

**Phase 4 Total**: ~18 hours (2.5 days)

---

### Phase 5: Profile Completion Wizard (Week 3)

#### Task 5.1: Create Wizard Component
- [ ] Multi-step form component
- [ ] Step navigation (Next/Back)
- [ ] Progress indicator
- [ ] Step validation
- [ ] Save draft functionality

**Files to Create:**
- `components/profile/ProfileWizard.tsx`
- `components/profile/WizardStep.tsx`
- `components/profile/ProgressIndicator.tsx`

**Estimated Time**: 8 hours

#### Task 5.2: Create Wizard Steps
- [ ] Step 1: Basic Information
- [ ] Step 2: Contact Details
- [ ] Step 3: Academic Information
- [ ] Step 4: Professional Information
- [ ] Step 5: Work Experience
- [ ] Step 6: Career Goals & Industry

**Files to Create:**
- `components/profile/wizard/Step1BasicInfo.tsx`
- `components/profile/wizard/Step2Contact.tsx`
- `components/profile/wizard/Step3Academic.tsx`
- `components/profile/wizard/Step4Professional.tsx`
- `components/profile/wizard/Step5WorkExperience.tsx`
- `components/profile/wizard/Step6CareerGoals.tsx`

**Estimated Time**: 12 hours

#### Task 5.3: Profile Completeness Tracking
- [ ] Create completeness calculation function
- [ ] Add progress bar to profile page
- [ ] Show completion percentage
- [ ] Highlight missing required fields
- [ ] Prompt users to complete profile

**Files to Create:**
- `lib/profile/completeness.ts`
- Update: `app/profile/page.tsx`

**Estimated Time**: 4 hours

**Phase 5 Total**: ~24 hours (3 days)

---

### Phase 6: Testing & Refinement (Week 3-4)

#### Task 6.1: Role-Based Access Testing
- [ ] Test all role guards
- [ ] Test navigation for each role
- [ ] Test dashboard access for each role
- [ ] Test unauthorized access attempts
- [ ] Fix any bugs

**Estimated Time**: 8 hours

#### Task 6.2: Profile Form Testing
- [ ] Test student profile form (all fields)
- [ ] Test work experience CRUD
- [ ] Test education CRUD
- [ ] Test form validation
- [ ] Test data persistence

**Estimated Time**: 6 hours

#### Task 6.3: UI/UX Refinement
- [ ] Improve error messages
- [ ] Add loading states
- [ ] Improve form layouts
- [ ] Add tooltips/help text
- [ ] Mobile responsiveness

**Estimated Time**: 6 hours

**Phase 6 Total**: ~20 hours (2.5 days)

---

## 📊 Summary

### Total Estimated Time: ~114 hours (14.25 days)

### Phase Breakdown:
1. **Phase 1**: Database & Backend - 2 days
2. **Phase 2**: Role-Based Components - 2 days
3. **Phase 3**: Enhanced Student Profile - 3 days
4. **Phase 4**: Role-Specific Dashboards - 2.5 days
5. **Phase 5**: Profile Completion Wizard - 3 days
6. **Phase 6**: Testing & Refinement - 2.5 days

### Priority Order:
1. **High Priority** (Week 1):
   - Phase 1: Database Schema & Backend
   - Phase 2: Role-Based Components
   
2. **Medium Priority** (Week 2):
   - Phase 3: Enhanced Student Profile
   - Phase 4: Role-Specific Dashboards

3. **Low Priority** (Week 3-4):
   - Phase 5: Profile Completion Wizard
   - Phase 6: Testing & Refinement

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- ✅ Database migration runs successfully
- ✅ All new fields are queryable
- ✅ tRPC endpoints work for all new fields
- ✅ Role utilities are imported and working

### Phase 2 Complete When:
- ✅ Role guards hide/show content correctly
- ✅ Navigation only shows relevant links
- ✅ Dashboards redirect by role

### Phase 3 Complete When:
- ✅ Student can fill all new profile fields
- ✅ Contact details save correctly
- ✅ Work experience can be added/edited/deleted
- ✅ Education can be added/edited/deleted
- ✅ Preferred industry saves correctly

### Phase 4 Complete When:
- ✅ Student dashboard shows student-specific content only
- ✅ Faculty dashboard shows faculty-specific content only
- ✅ All dashboards are role-filtered

### Phase 5 Complete When:
- ✅ New students can complete profile via wizard
- ✅ Progress indicator works correctly
- ✅ Profile completeness calculation is accurate

### Phase 6 Complete When:
- ✅ All tests pass
- ✅ No role-based access bugs
- ✅ Forms validate correctly
- ✅ UI is responsive and polished

---

## 📝 Next Steps

1. **Review this roadmap** with team
2. **Prioritize phases** based on business needs
3. **Assign developers** to specific phases
4. **Set up project board** with tasks
5. **Begin Phase 1** implementation

---

## 🔗 Related Files

- Current Profile: `app/profile/page.tsx`
- Current Edit: `app/profile/edit/page.tsx`
- Current Dashboard: `app/dashboard/page.tsx`
- Auth Router: `server/routers/auth.router.ts`
- Database Schema: `database/schema.sql`
- Middleware: `middleware.ts`

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Ready for Implementation

