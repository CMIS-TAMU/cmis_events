# Phase 5: Profile Completion Wizard

## Overview
Create a multi-step wizard to guide new users through completing their profile after signup, with progress tracking and validation.

## Goals
1. Guide new users through profile setup
2. Calculate and display profile completeness
3. Prompt users to complete missing required fields
4. Save draft data during wizard steps

---

## Task 5.1: Create Wizard Component

### Features
- ✅ Multi-step form component
- ✅ Step navigation (Next/Back buttons)
- ✅ Progress indicator
- ✅ Step validation
- ✅ Save draft functionality
- ✅ Skip non-required steps

### Files to Create
- `components/profile/wizard/ProfileWizard.tsx` - Main wizard component
- `components/profile/wizard/ProgressIndicator.tsx` - Progress bar component
- `components/profile/wizard/WizardStep.tsx` - Step wrapper component
- `components/profile/wizard/types.ts` - TypeScript types

### Estimated Time: 8 hours

---

## Task 5.2: Create Wizard Steps

### Steps to Create
1. **Step 1: Basic Information**
   - Full name
   - Email (pre-filled, read-only)
   - Phone number
   - Date of birth (optional)

2. **Step 2: Contact Details**
   - Address
   - LinkedIn URL
   - GitHub URL
   - Website URL

3. **Step 3: Academic Information**
   - Major
   - Degree type
   - GPA (optional)
   - Expected graduation date

4. **Step 4: Professional Information**
   - Preferred industry
   - Skills (tags/chips)
   - Research interests (tags/chips)

5. **Step 5: Work Experience**
   - Add/edit/delete work experience entries
   - Use existing WorkExperienceForm component

6. **Step 6: Career Goals & Industry**
   - Career goals (textarea)
   - Preferred industry (dropdown)
   - Resume upload (optional)

### Files to Create
- `components/profile/wizard/steps/Step1BasicInfo.tsx`
- `components/profile/wizard/steps/Step2Contact.tsx`
- `components/profile/wizard/steps/Step3Academic.tsx`
- `components/profile/wizard/steps/Step4Professional.tsx`
- `components/profile/wizard/steps/Step5WorkExperience.tsx`
- `components/profile/wizard/steps/Step6CareerGoals.tsx`

### Estimated Time: 12 hours

---

## Task 5.3: Profile Completeness Tracking

### Features
- ✅ Calculate completeness percentage
- ✅ Progress bar component
- ✅ Highlight missing required fields
- ✅ Prompt users to complete profile
- ✅ Show completion status on dashboard

### Implementation
- Create `lib/profile/completeness.ts` with calculation logic
- Update `app/profile/page.tsx` to show progress
- Update dashboard to show completion status
- Create completion prompt component

### Files to Create
- `lib/profile/completeness.ts` - Completeness calculation
- `components/profile/ProfileCompletionPrompt.tsx` - Prompt component

### Files to Update
- `app/profile/page.tsx` - Add progress bar
- `app/dashboard/page.tsx` - Show completion status

### Estimated Time: 4 hours

---

## Phase 5 Total: ~24 hours

---

## Implementation Order

1. **Create completeness calculation function** (Task 5.3)
   - Define required vs optional fields
   - Create calculation logic
   - Test with various profile states

2. **Create wizard component structure** (Task 5.1)
   - Wizard container
   - Step navigation
   - Progress indicator
   - State management

3. **Create individual wizard steps** (Task 5.2)
   - Step 1-6 components
   - Form validation
   - Integration with existing mutations

4. **Integrate wizard into signup flow** (Task 5.1)
   - Redirect new users to wizard
   - Check profile completeness on login
   - Allow skipping and returning later

5. **Add completion tracking to UI** (Task 5.3)
   - Progress bar on profile page
   - Completion status on dashboard
   - Prompt component for incomplete profiles

---

## User Flow

1. **New User Signs Up**
   - After email verification, redirect to `/profile/wizard`
   - Show welcome message
   - Guide through 6 steps

2. **Existing User with Incomplete Profile**
   - Dashboard shows "Complete Profile" prompt
   - Clicking redirects to `/profile/wizard?step=1`
   - Progress bar shows current completion

3. **User Completes Wizard**
   - Final step shows summary
   - "Complete Profile" button saves all data
   - Redirects to dashboard
   - Dashboard shows 100% completion

4. **User Skips Wizard**
   - Can skip at any step
   - Progress saved as draft
   - Can return later to complete

---

## Technical Considerations

### State Management
- Use React state for wizard form data
- Use tRPC mutations to save draft data
- Store wizard state in localStorage for persistence

### Validation
- Client-side validation for each step
- Server-side validation on final submit
- Show validation errors inline

### Draft Saving
- Auto-save after each step (optional)
- Save button on each step
- Load draft on wizard re-entry

### Navigation
- Next/Back buttons
- Progress dots (clickable to jump to step)
- Skip button on optional steps
- Cancel button (save draft and exit)

---

## Next Steps

Ready to start implementation! 🚀

