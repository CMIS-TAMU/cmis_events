# 🛠️ Technical Missions System - Technology Requirements

## ✅ Technologies Already in Your Stack

**No additional dependencies needed!** All required technologies are already installed in your project.

### Current Stack (All Required ✅)

1. **Next.js 14+ (App Router)** ✅
   - Already installed
   - Used for: Frontend pages, API routes, Server Components

2. **TypeScript** ✅
   - Already installed
   - Used for: Type safety across all code

3. **Supabase (PostgreSQL)** ✅
   - Already configured
   - Used for: Database (missions, submissions, points, leaderboard)

4. **Supabase Auth** ✅
   - Already configured
   - Used for: User authentication, role-based access control

5. **Supabase Storage** ✅
   - Already configured
   - Used for: Starter files, submission files
   - **New buckets needed:**
     - `mission-starter-files` (public or RLS)
     - `mission-submissions` (private, RLS enabled)

6. **tRPC** ✅
   - Already installed (`@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@trpc/next`)
   - Used for: Type-safe API endpoints

7. **Zustand** ✅
   - Already installed
   - Used for: Client-side state management (optional, for UI state)

8. **Resend** ✅
   - Already installed (`resend` package)
   - Used for: Email notifications (mission published, submission reviewed, etc.)

9. **React Hook Form** ✅
   - Already installed
   - Used for: Mission creation forms, submission forms

10. **Zod** ✅
    - Already installed
    - Used for: Schema validation (mission schemas, submission schemas)

11. **Tailwind CSS** ✅
    - Already configured
    - Used for: All UI styling

12. **Radix UI** ✅
    - Already installed (multiple packages)
    - Used for: UI components (dialogs, tabs, forms, etc.)

---

## 📦 New Files to Create

### Database
- ✅ `database/migrations/add_technical_missions.sql` (Created)

### Backend
- `server/routers/missions.router.ts` (tRPC router)
- `lib/missions/points-calculator.ts` (Created)
- `lib/missions/leaderboard.ts` (Leaderboard computation)
- `lib/storage/mission-files.ts` (Storage helpers)

### Frontend Pages
- `app/sponsor/missions/create/page.tsx`
- `app/sponsor/missions/[missionId]/page.tsx`
- `app/sponsor/missions/[missionId]/submissions/[submissionId]/page.tsx`
- `app/missions/page.tsx`
- `app/missions/[missionId]/page.tsx`
- `app/leaderboard/page.tsx`
- `app/profile/missions/page.tsx`

### Components
- `components/missions/MissionCard.tsx`
- `components/missions/MissionFilters.tsx`
- `components/missions/SubmissionCard.tsx`
- `components/missions/ReviewForm.tsx`
- `components/missions/LeaderboardTable.tsx`
- `components/missions/PointsBadge.tsx`

### Email Templates
- `lib/emails/missions/published.ts`
- `lib/emails/missions/submission-received.ts`
- `lib/emails/missions/reviewed.ts`
- `lib/emails/missions/perfect-score.ts`

---

## 🔧 Configuration Needed

### 1. Supabase Storage Buckets

Create two new storage buckets in Supabase:

**Bucket 1: `mission-starter-files`**
- Public: Yes (or configure RLS)
- Allowed file types: ZIP, PDF, TXT, MD
- Max file size: 50 MB

**Bucket 2: `mission-submissions`**
- Public: No (private)
- RLS enabled: Yes
- Allowed file types: ZIP, PDF, TXT, MD, CODE files
- Max file size: 100 MB

### 2. Environment Variables

No new environment variables needed! All required are already set:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `RESEND_API_KEY` ✅ (for emails)

### 3. Database Migration

Run the migration file:
```sql
-- File: database/migrations/add_technical_missions.sql
-- Run in Supabase SQL Editor
```

---

## 🔄 Integration with Existing Systems

### 1. User Roles
- Uses existing `users.role` field
- Sponsor role: `role = 'sponsor'` or `role = 'admin'`
- Student role: `role = 'user'` (default)

### 2. Authentication
- Uses existing Supabase Auth
- Uses existing `protectedProcedure`, `adminProcedure`
- New: `sponsorProcedure` (similar to admin, checks for sponsor role)

### 3. Storage
- Uses existing Supabase Storage setup
- New buckets for missions (see above)

### 4. Email System
- Uses existing Resend integration
- New email templates for missions

### 5. Points System (New)
- New tables: `student_points`, `point_transactions`
- Integrates with:
  - Mission submissions
  - Leaderboard
  - Future: Interview eligibility, mentorship matching

---

## 📊 Data Flow Integration

### Mission Creation Flow
```
Sponsor → tRPC (missions.createMission)
  → Supabase (missions table, status: 'draft')
  → Supabase Storage (starter files)
  → Sponsor publishes
  → Status: 'active'
  → Resend (email to students)
  → Mission appears in browse page
```

### Submission Flow
```
Student → tRPC (missions.submitSolution)
  → Supabase (mission_submissions table)
  → Update mission.total_attempts
  → Create mission_interaction record
  → Resend (email to sponsor)
  → Sponsor reviews
  → Calculate points
  → Update student_points
  → Create point_transaction
  → Recalculate leaderboard
  → Resend (email to student)
```

---

## 🎯 Key Features Using Existing Tech

### 1. Real-time Leaderboard
- **Tech:** Supabase PostgreSQL + tRPC
- **Implementation:** Computed on-demand or materialized view
- **Updates:** Triggered when points are awarded

### 2. File Uploads
- **Tech:** Supabase Storage (already used for resumes)
- **Implementation:** Similar to resume upload system
- **New:** Multiple file support for submissions

### 3. Email Notifications
- **Tech:** Resend (already configured)
- **Implementation:** Similar to event registration emails
- **New:** Mission-specific templates

### 4. Points Calculation
- **Tech:** PostgreSQL functions + TypeScript
- **Implementation:** Database functions + client-side validation
- **Formula:** Score × Difficulty Multiplier × Bonuses

### 5. Analytics Dashboard
- **Tech:** Supabase queries + tRPC
- **Implementation:** Aggregate queries (similar to sponsor dashboard)
- **Metrics:** Submissions, scores, engagement, top performers

---

## 🚀 Implementation Steps

### Phase 1: Database Setup (30 minutes)
1. Run migration SQL in Supabase
2. Create storage buckets
3. Test RLS policies

### Phase 2: Backend (2-3 hours)
1. Create tRPC router (`missions.router.ts`)
2. Implement points calculator
3. Create leaderboard computation
4. Add email templates

### Phase 3: Sponsor UI (3-4 hours)
1. Mission creation page
2. Mission dashboard
3. Submission review interface
4. Analytics dashboard

### Phase 4: Student UI (3-4 hours)
1. Mission browse page
2. Mission detail page
3. Submission form
4. My submissions page
5. Leaderboard page

### Phase 5: Integration & Testing (2-3 hours)
1. Connect all flows
2. Test email notifications
3. Test points calculation
4. Test leaderboard updates
5. Bug fixes

**Total Estimated Time: 10-14 hours**

---

## ✅ Summary

**What you need:**
- ✅ Nothing new! All technologies are already in your stack.

**What to do:**
1. Run database migration
2. Create storage buckets
3. Build tRPC router
4. Create UI components
5. Integrate with existing systems

**Integration points:**
- Uses existing auth system
- Uses existing storage setup
- Uses existing email service
- Uses existing UI components
- New: Points system (but uses same tech stack)

---

**Ready to start? The database migration is ready to run!** 🚀

