# 🎯 Technical Challenges/Missions System - Integration Plan

## 📋 Overview

This document outlines the complete integration plan for the Technical Challenges/Missions system into the CMIS Events platform. This system enables sponsors to create technical challenges, students to submit solutions, and tracks points/leaderboards for gamification.

**Key Differences from Competitions:**
- ✅ Sponsor-created (not admin-only)
- ✅ Individual submissions (not team-based)
- ✅ Points-based gamification
- ✅ Real-time leaderboard
- ✅ Feedback from sponsors
- ✅ Points lead to opportunities (interviews, mentorship)

---

## 🛠️ Required Technologies

### ✅ Already Available in Your Stack

1. **Next.js 14+ (App Router)** - Frontend framework ✅
2. **TypeScript** - Type safety ✅
3. **Supabase (PostgreSQL)** - Database ✅
4. **Supabase Auth** - Authentication ✅
5. **Supabase Storage** - File storage ✅
6. **tRPC** - Type-safe API layer ✅
7. **Zustand** - State management ✅
8. **Resend** - Email service ✅
9. **React Hook Form** - Form handling ✅
10. **Zod** - Schema validation ✅
11. **Tailwind CSS** - Styling ✅
12. **Radix UI** - UI components ✅

### 🔧 Additional Dependencies Needed

**None!** All required technologies are already in your stack.

---

## 🗄️ Database Schema

### New Tables Required

```sql
-- ============================================================================
-- MISSIONS (Technical Challenges)
-- ============================================================================
CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
  category text, -- e.g., 'Web Development', 'Data Science', 'Mobile App', 'Algorithm'
  tags text[] DEFAULT '{}',
  requirements text, -- Detailed requirements
  starter_files_url text, -- URL to starter files in storage
  submission_instructions text,
  max_points integer DEFAULT 100,
  time_limit_minutes integer, -- Optional time limit
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  published_at timestamptz,
  deadline timestamptz,
  total_attempts integer DEFAULT 0,
  total_submissions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- MISSION SUBMISSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS mission_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  submission_url text, -- Link to code repository (GitHub, GitLab, etc.)
  submission_files jsonb, -- Array of file paths in storage
  submission_text text, -- Optional text explanation
  started_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  time_spent_minutes integer, -- Calculated from started_at to submitted_at
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'scored', 'rejected')),
  score numeric(5, 2), -- Final score (0-100)
  points_awarded integer DEFAULT 0, -- Points earned (can be different from score)
  sponsor_feedback text,
  sponsor_notes text, -- Internal notes (not visible to student)
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL, -- Sponsor who reviewed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (mission_id, student_id) -- One submission per student per mission
);

-- ============================================================================
-- MISSION INTERACTIONS (Track engagement)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mission_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  interaction_type text CHECK (interaction_type IN ('viewed', 'started', 'submitted', 'feedback_viewed')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (mission_id, user_id, interaction_type) -- Prevent duplicate tracking
);

-- ============================================================================
-- STUDENT POINTS (Gamification)
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_points integer DEFAULT 0,
  missions_completed integer DEFAULT 0,
  missions_perfect_score integer DEFAULT 0, -- Perfect scores (100%)
  average_score numeric(5, 2) DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- POINT TRANSACTIONS (Audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  mission_id uuid REFERENCES missions(id) ON DELETE SET NULL,
  submission_id uuid REFERENCES mission_submissions(id) ON DELETE SET NULL,
  points integer NOT NULL, -- Can be positive or negative
  reason text NOT NULL, -- e.g., 'Mission completion', 'Perfect score bonus', 'Bonus challenge'
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- LEADERBOARD (Materialized view or computed)
-- ============================================================================
-- We'll use a function to compute leaderboard on-demand
-- Or create a materialized view that refreshes periodically

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_missions_sponsor_id ON missions(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_difficulty ON missions(difficulty);
CREATE INDEX IF NOT EXISTS idx_missions_category ON missions(category);
CREATE INDEX IF NOT EXISTS idx_missions_tags ON missions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_mission_submissions_mission_id ON mission_submissions(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_submissions_student_id ON mission_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_mission_submissions_status ON mission_submissions(status);
CREATE INDEX IF NOT EXISTS idx_mission_submissions_score ON mission_submissions(score DESC);
CREATE INDEX IF NOT EXISTS idx_mission_interactions_mission_id ON mission_interactions(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_interactions_user_id ON mission_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_student_points_user_id ON student_points(user_id);
CREATE INDEX IF NOT EXISTS idx_student_points_total_points ON student_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_mission_id ON point_transactions(mission_id);
```

---

## 🧮 Points Calculation System

### Point Award Rules

1. **Base Points (Mission Completion)**
   - Score 0-50: `score * 0.5` points
   - Score 51-75: `score * 0.75` points
   - Score 76-99: `score * 1.0` points
   - Score 100: `100 * 1.5` points (perfect score bonus)

2. **Difficulty Multipliers**
   - Beginner: `base_points * 1.0`
   - Intermediate: `base_points * 1.2`
   - Advanced: `base_points * 1.5`
   - Expert: `base_points * 2.0`

3. **Time Bonus (Optional)**
   - If submitted before deadline: `+10%` bonus
   - If submitted within 24 hours: `+5%` bonus

4. **Streak Bonus (Future Enhancement)**
   - 3 consecutive perfect scores: `+50` bonus points
   - 5 consecutive perfect scores: `+100` bonus points

### Leaderboard Calculation

```typescript
// Leaderboard ranks students by:
1. Total points (descending)
2. Average score (descending) - tiebreaker
3. Missions completed (descending) - tiebreaker
4. Last activity date (descending) - tiebreaker
```

---

## 🔌 API Endpoints (tRPC Router)

### Missions Router (`server/routers/missions.router.ts`)

```typescript
export const missionsRouter = router({
  // ========== SPONSOR ENDPOINTS ==========
  
  // Create mission (sponsor only)
  createMission: sponsorProcedure
    .input(missionCreateSchema)
    .mutation(async ({ ctx, input }) => { ... }),

  // Get sponsor's missions
  getMyMissions: sponsorProcedure
    .query(async ({ ctx }) => { ... }),

  // Update mission
  updateMission: sponsorProcedure
    .input(missionUpdateSchema)
    .mutation(async ({ ctx, input }) => { ... }),

  // Publish mission
  publishMission: sponsorProcedure
    .input(z.object({ missionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => { ... }),

  // Get submissions for a mission
  getMissionSubmissions: sponsorProcedure
    .input(z.object({ missionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => { ... }),

  // Review submission (score and feedback)
  reviewSubmission: sponsorProcedure
    .input(reviewSubmissionSchema)
    .mutation(async ({ ctx, input }) => { ... }),

  // Get mission analytics
  getMissionAnalytics: sponsorProcedure
    .input(z.object({ missionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => { ... }),

  // ========== STUDENT ENDPOINTS ==========
  
  // Browse active missions
  browseMissions: protectedProcedure
    .input(browseMissionsSchema)
    .query(async ({ ctx, input }) => { ... }),

  // Get mission details
  getMission: protectedProcedure
    .input(z.object({ missionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => { ... }),

  // Start mission (creates interaction record)
  startMission: protectedProcedure
    .input(z.object({ missionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => { ... }),

  // Submit solution
  submitSolution: protectedProcedure
    .input(submitSolutionSchema)
    .mutation(async ({ ctx, input }) => { ... }),

  // Get my submissions
  getMySubmissions: protectedProcedure
    .query(async ({ ctx }) => { ... }),

  // Get submission details
  getSubmission: protectedProcedure
    .input(z.object({ submissionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => { ... }),

  // ========== LEADERBOARD ENDPOINTS ==========
  
  // Get leaderboard
  getLeaderboard: protectedProcedure
    .input(leaderboardSchema)
    .query(async ({ ctx, input }) => { ... }),

  // Get my leaderboard position
  getMyRank: protectedProcedure
    .query(async ({ ctx }) => { ... }),

  // ========== ADMIN ENDPOINTS ==========
  
  // Get all missions (admin)
  getAllMissions: adminProcedure
    .query(async ({ ctx }) => { ... }),

  // Get platform analytics
  getPlatformAnalytics: adminProcedure
    .query(async ({ ctx }) => { ... }),
});
```

---

## 📧 Email Notifications

### 1. Mission Published Notification

**To:** All students (or students matching tags)
**Subject:** `New Technical Challenge: {{mission_title}}`

**Template:**
```html
Hi {{student_name}},

A new technical challenge has been published!

<strong>{{mission_title}}</strong>
Difficulty: {{difficulty}}
Points: Up to {{max_points}} points
Category: {{category}}

<a href="{{mission_link}}">View Challenge</a>

Good luck!
CMIS Events Team
```

### 2. Submission Received Notification

**To:** Sponsor
**Subject:** `New submission for {{mission_title}}`

**Template:**
```html
Hi {{sponsor_name}},

You have received a new submission for your mission "{{mission_title}}".

<strong>Student:</strong> {{student_name}}
<strong>Submitted:</strong> {{submitted_at}}

<a href="{{review_link}}">Review Submission</a>
```

### 3. Submission Reviewed Notification

**To:** Student
**Subject:** `Your submission has been reviewed: {{mission_title}}`

**Template:**
```html
Hi {{student_name}},

Your submission for "{{mission_title}}" has been reviewed!

<strong>Score:</strong> {{score}}/100
<strong>Points Awarded:</strong> {{points_awarded}}
<strong>Your Total Points:</strong> {{total_points}}
<strong>Leaderboard Rank:</strong> #{{rank}}

{{#if feedback}}
<strong>Feedback:</strong>
{{feedback}}
{{/if}}

<a href="{{submission_link}}">View Details</a>
```

### 4. Perfect Score Achievement

**To:** Student
**Subject:** `🎉 Perfect Score! You earned bonus points`

**Template:**
```html
Congratulations {{student_name}}!

You achieved a perfect score on "{{mission_title}}"!

<strong>Bonus Points:</strong> +{{bonus_points}}
<strong>Total Points:</strong> {{total_points}}
<strong>Rank:</strong> #{{rank}}

Keep up the excellent work!
```

---

## 🎨 UI Components

### 1. Sponsor Mission Creation Page
**Path:** `/sponsor/missions/create`

**Components:**
- Mission form (title, description, difficulty, category, tags)
- Requirements editor
- Starter files upload
- Submission instructions
- Points configuration
- Time limit settings
- Preview and publish

### 2. Sponsor Mission Dashboard
**Path:** `/sponsor/missions`

**Sections:**
- My missions list (draft, active, closed)
- Quick stats (total submissions, avg score, engagement)
- Recent submissions
- Analytics overview

### 3. Mission Management Page
**Path:** `/sponsor/missions/[missionId]`

**Tabs:**
- Overview (stats, engagement)
- Submissions (list with filters)
- Analytics (charts, engagement metrics)
- Settings (edit, close, archive)

### 4. Submission Review Page
**Path:** `/sponsor/missions/[missionId]/submissions/[submissionId]`

**Components:**
- Student profile card
- Submission content (files, links, text)
- Scoring interface (0-100 slider)
- Feedback textarea
- Internal notes (sponsor-only)
- Submit review button

### 5. Student Mission Browse Page
**Path:** `/missions`

**Components:**
- Filter bar (difficulty, category, tags)
- Mission cards grid
- Search functionality
- Sort options (newest, points, difficulty)

### 6. Mission Detail Page
**Path:** `/missions/[missionId]`

**Components:**
- Mission header (title, sponsor, difficulty, points)
- Description and requirements
- Starter files download
- Submission form
- Leaderboard preview (top 10)
- "Start Mission" button

### 7. My Submissions Page
**Path:** `/profile/missions`

**Components:**
- Submissions list (status, score, points)
- Filter by status
- View submission details
- Leaderboard position card

### 8. Leaderboard Page
**Path:** `/leaderboard`

**Components:**
- Top 10/25/50/100 students
- Search for specific student
- My position highlight
- Filters (all-time, monthly, weekly)
- Stats cards (total students, avg points)

---

## 🔄 Integration Points

### 1. Sponsor Role Check
- Add `is_sponsor` check to existing sponsor router
- Or use existing `role` field (if 'sponsor' role exists)

### 2. Storage Bucket
- Create `mission-starter-files` bucket in Supabase Storage
- Create `mission-submissions` bucket
- Set up RLS policies

### 3. Points Integration with Opportunities
- Link points to:
  - Interview eligibility (e.g., 500+ points)
  - Mentorship matching (higher points = better matches)
  - Event priority access
  - Resume visibility boost

### 4. Leaderboard Integration
- Display on:
  - Homepage (top 10)
  - Student dashboard
  - Mission detail pages
  - Profile pages

---

## 📦 File Structure

```
app/
  sponsor/
    missions/
      create/
        page.tsx              # Create mission
      [missionId]/
        page.tsx              # Mission management
        submissions/
          [submissionId]/
            page.tsx          # Review submission
  missions/
    page.tsx                  # Browse missions
    [missionId]/
      page.tsx                # Mission detail
      submit/
        page.tsx              # Submission form
  leaderboard/
    page.tsx                  # Leaderboard
  profile/
    missions/
      page.tsx                # My submissions

server/
  routers/
    missions.router.ts        # Missions tRPC router

lib/
  missions/
    points-calculator.ts      # Points calculation logic
    leaderboard.ts            # Leaderboard computation
  storage/
    mission-files.ts          # Storage helpers
  emails/
    missions/
      published.ts
      submission-received.ts
      reviewed.ts
      perfect-score.ts

components/
  missions/
    MissionCard.tsx
    MissionFilters.tsx
    SubmissionCard.tsx
    ReviewForm.tsx
    LeaderboardTable.tsx
    PointsBadge.tsx

database/
  migrations/
    add_technical_missions.sql
```

---

## 🚀 Implementation Phases

### Phase 1: Database & Backend (Week 1)
- [ ] Create database schema migration
- [ ] Create tRPC router (missions, submissions, leaderboard)
- [ ] Implement points calculation logic
- [ ] Create storage helpers
- [ ] Add email templates

### Phase 2: Sponsor Flow (Week 2)
- [ ] Mission creation page
- [ ] Mission dashboard
- [ ] Submission review interface
- [ ] Analytics dashboard

### Phase 3: Student Flow (Week 3)
- [ ] Mission browse page
- [ ] Mission detail page
- [ ] Submission form
- [ ] My submissions page

### Phase 4: Leaderboard & Polish (Week 4)
- [ ] Leaderboard page
- [ ] Points integration
- [ ] Email notifications
- [ ] Testing and bug fixes

---

## 🔐 Security & RLS Policies

### Row Level Security Policies

```sql
-- Missions: Sponsors can create/view/edit their own
CREATE POLICY "Sponsors can create missions"
  ON missions FOR INSERT
  WITH CHECK (auth.uid() = sponsor_id);

CREATE POLICY "Sponsors can view their missions"
  ON missions FOR SELECT
  USING (auth.uid() = sponsor_id);

-- Students can view active missions
CREATE POLICY "Students can view active missions"
  ON missions FOR SELECT
  USING (status = 'active');

-- Submissions: Students can create/view their own
CREATE POLICY "Students can create submissions"
  ON mission_submissions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their submissions"
  ON mission_submissions FOR SELECT
  USING (auth.uid() = student_id);

-- Sponsors can view submissions for their missions
CREATE POLICY "Sponsors can view their mission submissions"
  ON mission_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM missions
      WHERE missions.id = mission_submissions.mission_id
      AND missions.sponsor_id = auth.uid()
    )
  );
```

---

## 📊 Analytics & Metrics

### Sponsor Analytics
- Total submissions
- Average score
- Completion rate
- Engagement metrics (views, starts, submissions)
- Top performers

### Platform Analytics (Admin)
- Total missions created
- Total submissions
- Active students
- Points distribution
- Category popularity
- Difficulty distribution

---

## ✅ Next Steps

1. **Review this plan** with your team
2. **Create database migration** file
3. **Start with Phase 1** (Database & Backend)
4. **Test points calculation** with sample data
5. **Build UI components** incrementally

---

## 🎯 Success Criteria

- ✅ Sponsors can create and manage missions
- ✅ Students can browse and submit solutions
- ✅ Sponsors can review and provide feedback
- ✅ Points are calculated and awarded correctly
- ✅ Leaderboard updates in real-time
- ✅ Email notifications work
- ✅ Analytics provide insights
- ✅ System integrates smoothly with existing features

---

**Ready to start implementation? Let's begin with the database schema!** 🚀

