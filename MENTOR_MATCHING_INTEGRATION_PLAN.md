# 🎓 Mentor Matching System - Integration Plan

## 📋 Overview

This document outlines the complete integration plan for the Mentor Matching Flow into the CMIS Events platform. The system will enable alumni to sign up as mentors, get matched with students based on skills, goals, and interests, and manage ongoing mentorship relationships.

---

## 🛠️ Required Technologies

### ✅ Already Available in Your Stack

1. **Next.js 14+ (App Router)** - Frontend framework ✅
2. **TypeScript** - Type safety ✅
3. **Supabase (PostgreSQL)** - Database ✅
4. **Supabase Auth** - Authentication ✅
5. **tRPC** - Type-safe API layer ✅
6. **Zustand** - State management ✅
7. **Resend** - Email service ✅ (already in package.json)
8. **React Hook Form** - Form handling ✅
9. **Zod** - Schema validation ✅
10. **Tailwind CSS** - Styling ✅
11. **Radix UI** - UI components ✅

### 🔧 Additional Dependencies Needed

**None!** All required technologies are already in your stack. The system will integrate seamlessly.

---

## 🗄️ Database Schema

### New Tables Required

```sql
-- ============================================================================
-- MENTOR PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  areas_of_expertise text[], -- e.g., ['Software Engineering', 'Data Science']
  industries text[], -- e.g., ['Tech', 'Finance', 'Consulting']
  skills text[], -- e.g., ['Python', 'React', 'Leadership']
  preferred_help_types text[], -- e.g., ['Interview Prep', 'Career Advice', 'Project Guidance']
  availability_per_month integer DEFAULT 2, -- Number of hours/sessions per month
  bio text,
  linkedin_url text,
  company text,
  job_title text,
  years_of_experience integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- MATCH BATCHES (Groups of students suggested to a mentor)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentor_match_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending', -- pending, reviewed, archived
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz -- Optional: auto-archive after X days
);

-- ============================================================================
-- MATCH CANDIDATES (Students in a batch)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentor_match_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid REFERENCES mentor_match_batches(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  match_score numeric(5, 2), -- Calculated matching score (0-100)
  match_reasons jsonb, -- Why this student was matched
  mentor_response text, -- accepted, passed, pending
  mentor_notes text, -- Optional notes from mentor
  created_at timestamptz DEFAULT now(),
  UNIQUE (batch_id, student_id)
);

-- ============================================================================
-- MENTORSHIP OFFERS (Pending offers to students)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentorship_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  batch_id uuid REFERENCES mentor_match_batches(id) ON DELETE SET NULL,
  status text DEFAULT 'pending', -- pending, accepted, declined
  mentor_welcome_message text,
  preferred_contact_time text, -- e.g., "Weekends, 2-4 PM"
  student_response text, -- accepted, declined
  student_response_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- Optional: auto-expire after X days
  UNIQUE (mentor_id, student_id, status) WHERE status = 'pending'
);

-- ============================================================================
-- ACTIVE MENTORSHIPS
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  offer_id uuid REFERENCES mentorship_offers(id) ON DELETE SET NULL,
  status text DEFAULT 'active', -- active, completed, paused, ended
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  goals text[], -- Student's goals for this mentorship
  last_meeting_date timestamptz,
  next_meeting_date timestamptz,
  meeting_frequency text, -- e.g., "Weekly", "Bi-weekly", "Monthly"
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (mentor_id, student_id) WHERE status = 'active'
);

-- ============================================================================
-- MENTORSHIP MEETINGS (Optional: Track meeting history)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentorship_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorship_id uuid REFERENCES mentorships(id) ON DELETE CASCADE NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer,
  meeting_type text, -- video_call, in_person, phone, email
  meeting_url text, -- For video calls
  notes text,
  status text DEFAULT 'scheduled', -- scheduled, completed, cancelled, rescheduled
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- STUDENT PROFILES (Extended profile data for matching)
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  interests text[], -- Student interests/tags
  career_goals text[], -- Career aspirations
  top_projects jsonb, -- Array of project highlights
  growth_activity_score integer DEFAULT 0, -- Calculated from events, competitions, etc.
  seeking_mentorship boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user_id ON mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_skills ON mentor_profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_expertise ON mentor_profiles USING GIN(areas_of_expertise);
CREATE INDEX IF NOT EXISTS idx_mentor_match_batches_mentor_id ON mentor_match_batches(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_match_candidates_batch_id ON mentor_match_candidates(batch_id);
CREATE INDEX IF NOT EXISTS idx_mentor_match_candidates_student_id ON mentor_match_candidates(student_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_offers_mentor_id ON mentorship_offers(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_offers_student_id ON mentorship_offers(student_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_offers_status ON mentorship_offers(status);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor_id ON mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_student_id ON mentorships(student_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_status ON mentorships(status);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_interests ON student_profiles USING GIN(interests);
```

### Updates to Existing Tables

```sql
-- Add mentor role to users table (if not exists)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_mentor boolean DEFAULT false;

-- Add mentorship-related fields to users metadata (optional)
-- Can use existing metadata jsonb column
```

---

## 🧮 Matching Algorithm Design

### Matching Score Calculation

The system will calculate a match score (0-100) based on:

1. **Skill Overlap (40%)**
   - Compare mentor skills vs student skills
   - Compare mentor expertise areas vs student interests
   - Formula: `(matching_skills / total_unique_skills) * 40`

2. **Career Goals Alignment (25%)**
   - Match mentor industries vs student career goals
   - Match mentor help types vs student needs
   - Formula: `(matching_goals / total_goals) * 25`

3. **Graduation Year Relevance (15%)**
   - Prefer students closer to graduation (higher priority)
   - Formula: `(graduation_year_weight) * 15`

4. **Growth Activity Score (20%)**
   - Based on event participation, competition wins, resume completeness
   - Formula: `(normalized_activity_score / 100) * 20`

### Matching Process Flow

```
1. Mentor completes profile → System marks user as mentor
2. Trigger matching engine:
   a. Query all active students (seeking_mentorship = true)
   b. Calculate match score for each student
   c. Sort by score (descending)
   d. Select top 3-4 students
   e. Create match batch
   f. Generate student profile snapshots
   g. Send email to mentor
3. Mentor reviews and selects students
4. System creates mentorship offers
5. Students receive notifications
6. Students accept/decline
7. System creates active mentorship
```

---

## 📧 Email Templates

### 1. Mentor Match Notification Email

**Subject:** `Suggested students you can mentor this semester`

**Template:**
```html
Hi {{mentor_name}},

We've found {{count}} students who could benefit from your expertise!

{{#each students}}
  <div class="student-card">
    <h3>{{name}} - {{degree}}</h3>
    <p><strong>Skills:</strong> {{skills}}</p>
    <p><strong>Interests:</strong> {{interests}}</p>
    <p><strong>Top Projects:</strong> {{projects}}</p>
    <a href="{{profile_link}}">View Full Profile</a>
    <a href="{{accept_link}}">I'd like to mentor this student</a>
    <a href="{{maybe_link}}">Maybe later</a>
  </div>
{{/each}}

Best regards,
CMIS Events Team
```

### 2. Student Mentorship Offer Email

**Subject:** `You've been selected for mentorship by {{mentor_name}}`

**Template:**
```html
Hi {{student_name}},

Great news! {{mentor_name}} has selected you for mentorship.

<strong>Mentor Profile:</strong>
- Company: {{company}}
- Job Title: {{job_title}}
- Expertise: {{expertise}}
- Years of Experience: {{years}}

{{#if welcome_message}}
  <p><strong>Message from mentor:</strong> {{welcome_message}}</p>
{{/if}}

<a href="{{accept_link}}">Accept Mentorship</a>
<a href="{{decline_link}}">Decline</a>
<a href="{{mentor_profile_link}}">View Mentor Profile</a>
```

### 3. Mentorship Confirmation Email

**Subject:** `Mentorship confirmed: {{mentor_name}} & {{student_name}}`

**Template:**
```html
Hi {{name}},

Your mentorship with {{other_party}} has been confirmed!

<strong>Next Steps:</strong>
1. Schedule your first meeting
2. Review suggested agenda for first session
3. Set goals together

<a href="{{dashboard_link}}">Go to Dashboard</a>
```

---

## 🔌 API Endpoints (tRPC Router)

### Mentor Router (`server/routers/mentors.router.ts`)

```typescript
export const mentorsRouter = router({
  // Create/Update mentor profile
  createMentorProfile: protectedProcedure
    .input(mentorProfileSchema)
    .mutation(async ({ ctx, input }) => { ... }),

  // Get mentor profile
  getMentorProfile: protectedProcedure
    .query(async ({ ctx }) => { ... }),

  // Get match batches for mentor
  getMatchBatches: protectedProcedure
    .query(async ({ ctx }) => { ... }),

  // Get students in a batch
  getBatchStudents: protectedProcedure
    .input(z.object({ batchId: z.string().uuid() }))
    .query(async ({ ctx, input }) => { ... }),

  // Respond to student match
  respondToMatch: protectedProcedure
    .input(z.object({
      candidateId: z.string().uuid(),
      response: z.enum(['accepted', 'passed', 'pending']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => { ... }),

  // Get active mentees
  getMentees: protectedProcedure
    .query(async ({ ctx }) => { ... }),

  // Get mentorship details
  getMentorship: protectedProcedure
    .input(z.object({ mentorshipId: z.string().uuid() }))
    .query(async ({ ctx, input }) => { ... }),

  // Trigger matching (admin only, or automatic)
  triggerMatching: protectedProcedure
    .input(z.object({ mentorId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => { ... }),
});
```

### Student Router (add to existing or create new)

```typescript
export const studentsRouter = router({
  // Create/Update student profile
  createStudentProfile: protectedProcedure
    .input(studentProfileSchema)
    .mutation(async ({ ctx, input }) => { ... }),

  // Get pending mentorship offers
  getPendingOffers: protectedProcedure
    .query(async ({ ctx }) => { ... }),

  // Respond to mentorship offer
  respondToOffer: protectedProcedure
    .input(z.object({
      offerId: z.string().uuid(),
      response: z.enum(['accepted', 'declined']),
    }))
    .mutation(async ({ ctx, input }) => { ... }),

  // Get active mentor
  getMyMentor: protectedProcedure
    .query(async ({ ctx }) => { ... }),
});
```

---

## 🎨 UI Components

### 1. Mentor Profile Creation Page
**Path:** `/mentor/setup`

**Components:**
- Multi-select for areas of expertise
- Multi-select for industries
- Multi-select for skills (with autocomplete)
- Radio buttons for preferred help types
- Number input for availability
- Textarea for bio
- Optional: LinkedIn URL, company, job title

### 2. Mentor Dashboard
**Path:** `/mentor/dashboard`

**Sections:**
- Current match batches (pending review)
- Active mentees list
- Mentorship statistics
- Quick actions (message mentee, schedule meeting)

### 3. Match Batch Review Page
**Path:** `/mentor/batches/[batchId]`

**Components:**
- Student cards with:
  - Name, degree, graduation year
  - Skills tags
  - Interests tags
  - Top 2 projects (with links)
  - Match score indicator
  - Action buttons (Accept, Pass, Maybe Later)

### 4. Student Mentorship Offers Page
**Path:** `/profile/mentorship/offers`

**Components:**
- Pending offers list
- Mentor profile cards
- Accept/Decline buttons
- View mentor profile link

### 5. Active Mentorship Dashboard
**Path:** `/profile/mentorship/active`

**Components:**
- Mentor info card
- Quick actions (Message, Schedule Meeting, Share Update)
- Goals tracking
- Meeting history
- Next meeting reminder

---

## 🔄 Integration Points

### 1. User Registration Flow
- Add checkbox: "I'm an alumni and want to be a mentor"
- If checked, redirect to `/mentor/setup` after signup

### 2. Student Profile Enhancement
- Add "Seeking Mentorship" toggle in profile settings
- Auto-populate student profile from existing data:
  - Skills from resume
  - Interests from metadata
  - Projects from competitions/events

### 3. Leaderboard Integration
- Use leaderboard data for growth activity score:
  - Event participation count
  - Competition wins/participations
  - Resume completeness
  - Profile completeness

### 4. Email Integration
- Use existing Resend setup
- Create email templates in `lib/emails/mentors/`
- Add email sending functions in `lib/emails/mentors/send-*.ts`

---

## 📦 File Structure

```
app/
  mentor/
    setup/
      page.tsx              # Mentor profile creation
    dashboard/
      page.tsx              # Mentor dashboard
    batches/
      [batchId]/
        page.tsx            # Review match batch
  profile/
    mentorship/
      offers/
        page.tsx            # View pending offers
      active/
        page.tsx            # Active mentorship dashboard

server/
  routers/
    mentors.router.ts       # Mentor tRPC router
    students.router.ts      # Student tRPC router (or extend existing)

lib/
  matching/
    engine.ts               # Matching algorithm
    scoring.ts              # Score calculation
  emails/
    mentors/
      match-notification.ts
      offer-notification.ts
      confirmation.ts

components/
  mentor/
    MentorProfileForm.tsx
    MatchBatchCard.tsx
    StudentMatchCard.tsx
    MenteeCard.tsx
  mentorship/
    OfferCard.tsx
    MentorCard.tsx
    MeetingScheduler.tsx

database/
  migrations/
    add_mentor_matching.sql # Complete schema migration
```

---

## 🚀 Implementation Phases

### Phase 1: Database & Backend (Week 1)
- [ ] Create database schema migration
- [ ] Create tRPC routers (mentors, students)
- [ ] Implement matching algorithm
- [ ] Create email templates
- [ ] Add email sending functions

### Phase 2: Mentor Flow (Week 2)
- [ ] Mentor profile creation page
- [ ] Mentor dashboard
- [ ] Match batch review page
- [ ] Mentor response handling

### Phase 3: Student Flow (Week 3)
- [ ] Student profile enhancement
- [ ] Mentorship offers page
- [ ] Offer acceptance/decline flow
- [ ] Active mentorship dashboard

### Phase 4: Integration & Polish (Week 4)
- [ ] Integrate with existing user flow
- [ ] Add to navigation
- [ ] Testing and bug fixes
- [ ] Documentation

---

## 🔐 Security & RLS Policies

### Row Level Security Policies

```sql
-- Mentor profiles: Users can only view/edit their own
CREATE POLICY "Users can view own mentor profile"
  ON mentor_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own mentor profile"
  ON mentor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Match candidates: Mentors can view their batches
CREATE POLICY "Mentors can view their match candidates"
  ON mentor_match_candidates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mentor_match_batches
      WHERE mentor_match_batches.id = mentor_match_candidates.batch_id
      AND mentor_match_batches.mentor_id = auth.uid()
    )
  );

-- Mentorship offers: Students can view their offers
CREATE POLICY "Students can view their offers"
  ON mentorship_offers FOR SELECT
  USING (auth.uid() = student_id);

-- Active mentorships: Both parties can view
CREATE POLICY "Mentors and students can view their mentorships"
  ON mentorships FOR SELECT
  USING (auth.uid() = mentor_id OR auth.uid() = student_id);
```

---

## 📊 Analytics & Tracking

### Metrics to Track
- Number of active mentors
- Number of students seeking mentorship
- Match success rate (offers → acceptances)
- Average mentorship duration
- Meeting frequency
- Satisfaction scores (future enhancement)

---

## ✅ Next Steps

1. **Review this plan** with your team
2. **Create database migration** file
3. **Start with Phase 1** (Database & Backend)
4. **Test matching algorithm** with sample data
5. **Build UI components** incrementally

---

## 🎯 Success Criteria

- ✅ Alumni can sign up as mentors
- ✅ System automatically matches mentors with students
- ✅ Mentors can review and select students
- ✅ Students receive and can accept/decline offers
- ✅ Active mentorships are tracked
- ✅ Email notifications work correctly
- ✅ Both parties have dashboards to manage relationships

---

**Ready to start implementation? Let's begin with the database schema!** 🚀

