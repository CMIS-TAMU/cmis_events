# 🎯 Mini Mentorship System - Implementation Plan

## 📋 Overview

**Mini Mentorship** is a short-term, on-demand mentorship system where students can request quick sessions (30-60 minutes) with mentors for specific needs like:
- Interview preparation
- Quick skill learning
- Career advice
- Resume review
- Project guidance
- Technical problem-solving

**Key Difference from Existing Features:**
- **Quick Questions** = Text-based, asynchronous Q&A
- **Full Mentorship** = Semester-long commitment, ongoing relationship
- **Mini Mentorship** = One-time video/phone sessions, specific goals, scheduled meetings

---

## 🎯 Core Features

### 1. Student Side - Request Mini Session
- ✅ Create a mini mentorship request
- ✅ Specify what they need help with (interview prep, learning X, etc.)
- ✅ Choose preferred duration (30min, 45min, 60min)
- ✅ Select preferred time slots (availability)
- ✅ View claimed sessions and status
- ✅ Schedule confirmed session
- ✅ Join video call when time comes
- ✅ Rate/review after session

### 2. Mentor Side - Browse & Claim
- ✅ Browse open mini session requests
- ✅ Filter by topic, duration, urgency
- ✅ Claim a request
- ✅ Schedule specific time slot with student
- ✅ View my claimed sessions
- ✅ Join video call
- ✅ Rate/review after session

### 3. Session Management
- ✅ Automatic Zoom/Google Meet link generation
- ✅ Email reminders (24hr, 1hr before)
- ✅ Session completion tracking
- ✅ Post-session feedback
- ✅ Session history

---

## 🗄️ Database Schema

```sql
-- ============================================================================
-- Mini Mentorship System - Database Schema
-- ============================================================================

-- 1. Mini Session Requests (created by students)
CREATE TABLE IF NOT EXISTS mini_mentorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Request details
  title text NOT NULL, -- e.g., "Interview prep for Google SWE role"
  description text NOT NULL,
  session_type text NOT NULL CHECK (session_type IN (
    'interview_prep',
    'skill_learning', 
    'career_advice',
    'resume_review',
    'project_guidance',
    'technical_help',
    'portfolio_review',
    'networking_advice',
    'other'
  )),
  
  -- Session preferences
  preferred_duration_minutes integer DEFAULT 60 CHECK (preferred_duration_minutes IN (30, 45, 60)),
  urgency text DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  
  -- Availability (when student is available)
  preferred_date_start date, -- Earliest available date
  preferred_date_end date, -- Latest available date
  preferred_time_slots jsonb DEFAULT '[]'::jsonb, -- Array of time ranges
  timezone text DEFAULT 'America/Chicago',
  
  -- Additional context
  tags text[], -- ['technical-interview', 'google', 'software-engineering']
  relevant_experience text, -- What experience does student have?
  specific_questions text, -- Specific things they want to cover
  resume_url text, -- Link to resume if relevant
  portfolio_url text, -- Link to portfolio if relevant
  
  -- Status tracking
  status text DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'scheduled', 'completed', 'cancelled', 'expired')),
  
  -- Assignment
  claimed_by_mentor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  claimed_at timestamptz,
  
  -- Session details (filled when scheduled)
  scheduled_session_id uuid REFERENCES mini_mentorship_sessions(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- Auto-expire after 7 days if not claimed
  updated_at timestamptz DEFAULT now()
);

-- Indexes for mini_mentorship_requests
CREATE INDEX IF NOT EXISTS idx_mini_requests_student ON mini_mentorship_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_mini_requests_status ON mini_mentorship_requests(status);
CREATE INDEX IF NOT EXISTS idx_mini_requests_type ON mini_mentorship_requests(session_type);
CREATE INDEX IF NOT EXISTS idx_mini_requests_mentor ON mini_mentorship_requests(claimed_by_mentor_id);
CREATE INDEX IF NOT EXISTS idx_mini_requests_tags ON mini_mentorship_requests USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_mini_requests_created ON mini_mentorship_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_mini_requests_expires ON mini_mentorship_requests(expires_at) WHERE status = 'open';

-- 2. Mini Mentorship Sessions (scheduled sessions)
CREATE TABLE IF NOT EXISTS mini_mentorship_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES mini_mentorship_requests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session scheduling
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes IN (30, 45, 60)),
  timezone text DEFAULT 'America/Chicago',
  
  -- Meeting details
  meeting_type text DEFAULT 'virtual' CHECK (meeting_type IN ('virtual', 'phone', 'in-person')),
  meeting_platform text DEFAULT 'zoom' CHECK (meeting_platform IN ('zoom', 'google-meet', 'teams', 'phone', 'other')),
  meeting_link text, -- Zoom/Google Meet link
  meeting_id text, -- Meeting ID if applicable
  meeting_passcode text, -- Passcode if applicable
  location text, -- Physical location if in-person
  
  -- Status tracking
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'no-show')),
  started_at timestamptz,
  ended_at timestamptz,
  actual_duration_minutes integer, -- Actual session duration
  
  -- Reminders
  reminder_24hr_sent_at timestamptz,
  reminder_1hr_sent_at timestamptz,
  
  -- Session notes (after completion)
  student_notes text,
  mentor_notes text,
  topics_covered text[],
  action_items text[],
  follow_up_needed boolean DEFAULT false,
  
  -- Ratings (after session)
  student_rating integer CHECK (student_rating >= 1 AND student_rating <= 5),
  student_feedback text,
  mentor_rating integer CHECK (mentor_rating >= 1 AND mentor_rating <= 5),
  mentor_feedback text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CHECK (student_id != mentor_id)
);

-- Indexes for mini_mentorship_sessions
CREATE INDEX IF NOT EXISTS idx_mini_sessions_student ON mini_mentorship_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_mini_sessions_mentor ON mini_mentorship_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mini_sessions_status ON mini_mentorship_sessions(status);
CREATE INDEX IF NOT EXISTS idx_mini_sessions_scheduled ON mini_mentorship_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_mini_sessions_request ON mini_mentorship_sessions(request_id);

-- 3. Mini Mentorship Session Availability (for scheduling)
CREATE TABLE IF NOT EXISTS mini_mentorship_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Availability window
  available_from timestamptz NOT NULL,
  available_until timestamptz NOT NULL,
  timezone text DEFAULT 'America/Chicago',
  
  -- Status
  is_available boolean DEFAULT true,
  blocked_reason text, -- Why is this blocked?
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CHECK (available_until > available_from)
);

-- Indexes for availability
CREATE INDEX IF NOT EXISTS idx_mini_availability_mentor ON mini_mentorship_availability(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mini_availability_from ON mini_mentorship_availability(available_from);
CREATE INDEX IF NOT EXISTS idx_mini_availability_until ON mini_mentorship_availability(available_until);
CREATE INDEX IF NOT EXISTS idx_mini_availability_available ON mini_mentorship_availability(is_available) WHERE is_available = true;
```

---

## 🎨 UI Components

### Student Pages

#### 1. `/app/mentorship/mini-sessions/request/page.tsx`
- Form to create mini session request
- Fields:
  - Title (what do you need help with?)
  - Session type (dropdown)
  - Description
  - Duration (30/45/60 min)
  - Preferred dates
  - Time slots
  - Urgency
  - Tags
  - Relevant files (resume, portfolio)

#### 2. `/app/mentorship/mini-sessions/my-requests/page.tsx`
- List of student's mini session requests
- Status: Open, Claimed, Scheduled, Completed
- Actions: View, Cancel, Reschedule

#### 3. `/app/mentorship/mini-sessions/[sessionId]/page.tsx`
- Session details page
- View meeting link
- Join button (when time comes)
- Session notes
- Rate/review form (after completion)

### Mentor Pages

#### 4. `/app/mentorship/mini-sessions/browse/page.tsx`
- Browse all open requests
- Filters: Session type, duration, urgency, tags
- Search by title/description
- Claim button

#### 5. `/app/mentorship/mini-sessions/my-sessions/page.tsx`
- List of mentor's claimed/scheduled sessions
- Status: Claimed, Scheduled, Completed
- Actions: Schedule, Cancel, Join, Complete

#### 6. `/app/mentorship/mini-sessions/schedule/[requestId]/page.tsx`
- Schedule specific session time
- Calendar picker
- Time slot selection
- Generate meeting link
- Confirm and send invitation

---

## 🔧 Backend API (tRPC)

### Routers: `server/routers/miniMentorship.router.ts`

#### Student Procedures:

1. **`createRequest`** - Create a mini session request
   ```typescript
   createRequest: protectedProcedure
     .input(z.object({
       title: z.string(),
       description: z.string(),
       session_type: z.enum([...]),
       preferred_duration_minutes: z.enum([30, 45, 60]),
       urgency: z.enum(['low', 'normal', 'high', 'urgent']),
       preferred_date_start: z.date(),
       preferred_date_end: z.date(),
       tags: z.array(z.string()).optional(),
       // ... other fields
     }))
     .mutation(async ({ ctx, input }) => { ... })
   ```

2. **`getMyRequests`** - Get student's requests
3. **`getRequestById`** - Get specific request details
4. **`cancelRequest`** - Cancel an open request
5. **`getMySessions`** - Get student's scheduled/completed sessions
6. **`joinSession`** - Get meeting link to join
7. **`submitSessionFeedback`** - Rate/review after session

#### Mentor Procedures:

8. **`getOpenRequests`** - Browse open requests (with filters)
9. **`claimRequest`** - Claim a request
10. **`getClaimedRequests`** - Get mentor's claimed requests
11. **`scheduleSession`** - Schedule specific time slot
12. **`generateMeetingLink`** - Generate Zoom/Google Meet link
13. **`getMyMentorSessions`** - Get mentor's sessions
14. **`completeSession`** - Mark session as completed, add notes
15. **`submitMentorFeedback`** - Rate/review student

#### Admin Procedures:

16. **`getAllSessions`** - Admin view of all sessions
17. **`getAnalytics`** - Statistics and analytics

---

## 🚀 Implementation Steps

### Phase 1: Database & Backend (2-3 days)

#### Day 1: Database Schema
- ✅ Create migration file: `database/migrations/add_mini_mentorship_system.sql`
- ✅ Run migration in Supabase
- ✅ Add RLS policies
- ✅ Test queries

#### Day 2: Backend API
- ✅ Create `server/routers/miniMentorship.router.ts`
- ✅ Implement all student procedures
- ✅ Implement all mentor procedures
- ✅ Add error handling
- ✅ Test with tRPC client

#### Day 3: Meeting Link Generation
- ✅ Research Zoom/Google Meet API options
- ✅ Implement meeting link generation
- ✅ Store links in database
- ✅ Test link generation

### Phase 2: Student UI (2 days)

#### Day 4: Request Creation
- ✅ Create request form page
- ✅ Add session type selector
- ✅ Add duration selector
- ✅ Add date/time picker
- ✅ Add file upload (resume/portfolio)
- ✅ Submit request

#### Day 5: Student Dashboard
- ✅ My requests page
- ✅ Request status cards
- ✅ Session details page
- ✅ Join meeting button
- ✅ Feedback form

### Phase 3: Mentor UI (2 days)

#### Day 6: Browse & Claim
- ✅ Browse open requests page
- ✅ Filters and search
- ✅ Request detail cards
- ✅ Claim request functionality
- ✅ My claimed requests page

#### Day 7: Schedule & Manage
- ✅ Schedule session page
- ✅ Calendar/time picker
- ✅ Generate meeting link
- ✅ My sessions page
- ✅ Complete session form

### Phase 4: Integration & Polish (1-2 days)

#### Day 8: Email Notifications
- ✅ Email when request is claimed
- ✅ Email when session is scheduled
- ✅ Reminder emails (24hr, 1hr)
- ✅ Post-session follow-up email

#### Day 9: Testing & Bug Fixes
- ✅ End-to-end testing
- ✅ Fix bugs
- ✅ UI polish
- ✅ Mobile responsiveness

---

## 📧 Email Templates

### 1. Request Created (to student)
```
Subject: Your Mini Mentorship Request Has Been Posted

Hi [Student Name],

Your mini mentorship request "[Title]" has been posted and is now visible to mentors.

Mentors can claim your request and schedule a session with you. You'll receive an email when someone claims it.

[View Request] [Dashboard]
```

### 2. Request Claimed (to student)
```
Subject: A Mentor Claimed Your Mini Mentorship Request!

Hi [Student Name],

Great news! [Mentor Name] has claimed your request for "[Title]".

They'll schedule a specific time slot with you soon. You'll receive another email when the session is scheduled.

[View Request] [Dashboard]
```

### 3. Session Scheduled (to both)
```
Subject: Your Mini Mentorship Session is Scheduled

Hi [Name],

Your mini mentorship session has been scheduled:

📅 Date: [Date]
⏰ Time: [Time]
⏱️ Duration: [Duration]
🔗 Meeting Link: [Link]

Add to Calendar: [Link]

We'll send you a reminder 24 hours and 1 hour before the session.

[View Session Details]
```

### 4. Session Reminder (24hr)
```
Subject: Reminder: Mini Mentorship Session Tomorrow

Hi [Name],

This is a friendly reminder that you have a mini mentorship session scheduled:

📅 Tomorrow at [Time]
🔗 Join: [Link]

[View Session Details]
```

### 5. Session Reminder (1hr)
```
Subject: Reminder: Mini Mentorship Session in 1 Hour

Hi [Name],

Your mini mentorship session starts in 1 hour!

🔗 Join: [Link]

[View Session Details]
```

### 6. Post-Session Follow-up
```
Subject: How was your Mini Mentorship Session?

Hi [Name],

Thank you for your mini mentorship session! We hope it was helpful.

Please take a moment to share your feedback:

[Rate Session] [Dashboard]
```

---

## 🔐 Row-Level Security (RLS) Policies

```sql
-- Mini Mentorship Requests
ALTER TABLE mini_mentorship_requests ENABLE ROW LEVEL SECURITY;

-- Students can view their own requests
CREATE POLICY "Students can view own requests"
  ON mini_mentorship_requests
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can create requests
CREATE POLICY "Students can create requests"
  ON mini_mentorship_requests
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Mentors can view open requests
CREATE POLICY "Mentors can view open requests"
  ON mini_mentorship_requests
  FOR SELECT
  USING (
    status = 'open' OR
    claimed_by_mentor_id = auth.uid()
  );

-- Mentors can claim requests (update)
CREATE POLICY "Mentors can claim requests"
  ON mini_mentorship_requests
  FOR UPDATE
  USING (
    status = 'open' AND
    EXISTS (
      SELECT 1 FROM mentorship_profiles
      WHERE user_id = auth.uid()
      AND profile_type = 'mentor'
      AND in_matching_pool = true
    )
  );

-- Mini Mentorship Sessions
ALTER TABLE mini_mentorship_sessions ENABLE ROW LEVEL SECURITY;

-- Students and mentors can view their sessions
CREATE POLICY "Users can view own sessions"
  ON mini_mentorship_sessions
  FOR SELECT
  USING (
    student_id = auth.uid() OR
    mentor_id = auth.uid()
  );

-- Only mentors can create sessions (when scheduling)
CREATE POLICY "Mentors can create sessions"
  ON mini_mentorship_sessions
  FOR INSERT
  WITH CHECK (
    mentor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM mentorship_profiles
      WHERE user_id = auth.uid()
      AND profile_type = 'mentor'
    )
  );
```

---

## 🎯 Success Metrics

### Engagement Metrics:
- Number of mini session requests per month
- Average time from request to claim
- Average time from claim to scheduled session
- Session completion rate
- Repeat usage (students who request multiple sessions)

### Quality Metrics:
- Average student rating
- Average mentor rating
- Session satisfaction scores
- Follow-up session requests

### Efficiency Metrics:
- Average response time (request to claim)
- Average scheduling time
- Session no-show rate
- Cancellation rate

---

## 🚀 Quick Start Implementation

**Ready to implement? Let's start with:**

1. **Database Migration** - Create tables and RLS policies
2. **Backend API** - Basic CRUD operations for requests
3. **Student Request Form** - Simple form to create requests
4. **Mentor Browse Page** - View and claim requests
5. **Session Scheduling** - Basic scheduling flow
6. **Meeting Links** - Generate and store links
7. **Email Notifications** - Basic email flow

**Estimated Time:** 5-7 days for MVP

---

## 💡 Future Enhancements

1. **Smart Matching** - Suggest mentors based on request content
2. **Group Sessions** - Multiple students in one session
3. **Session Recordings** - Option to record (with consent)
4. **Integration with Calendar** - Auto-sync with Google Calendar
5. **Payment System** - Optional paid sessions for external mentors
6. **Session Templates** - Pre-defined session structures
7. **AI-Powered Matching** - Match requests to best mentors automatically

---

**Ready to start implementing?** 🚀

Let me know if you'd like to begin with the database migration or if you have any questions about the design!

