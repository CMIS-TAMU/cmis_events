# 🚀 Phase 3 & 4 Implementation Plan

## 📋 Overview

**Phase 3:** Student Flow (UI Components)
**Phase 4:** Leaderboard & Polish

---

## ✅ Prerequisites Check

### Backend (Already Complete ✅)
- [x] Database schema with all tables
- [x] tRPC endpoints for student operations:
  - `browseMissions` - Browse active missions
  - `getMission` - Get mission details
  - `startMission` - Start a mission (creates submission record)
  - `submitSolution` - Submit solution
  - `getMySubmissions` - Get student's submissions
  - `getLeaderboard` - Get leaderboard
  - `getMyRank` - Get student's rank

### Storage Buckets (Need to Verify)
- [ ] `mission-starter-files` bucket exists
- [ ] `mission-submissions` bucket exists
- [ ] RLS policies configured

### Navigation (Need to Add)
- [ ] Add "Missions" link to main navigation
- [ ] Add "Missions" link to student dashboard
- [ ] Add "Leaderboard" link to navigation

---

## 🎯 Phase 3: Student Flow

### 1. Mission Browse Page
**Path:** `/missions`
**File:** `app/missions/page.tsx`

**Features:**
- Filter bar (difficulty, category, tags)
- Search functionality
- Mission cards grid
- Sort options (newest, points, difficulty)
- Pagination

**Components Needed:**
- Mission card component
- Filter component
- Search bar

### 2. Mission Detail Page
**Path:** `/missions/[missionId]`
**File:** `app/missions/[missionId]/page.tsx`

**Features:**
- Mission header (title, sponsor, difficulty, points)
- Description and requirements
- Starter files download
- Submission form (files, links, text)
- "Start Mission" button
- Leaderboard preview (top 10)
- Status indicator (not started, in progress, submitted, reviewed)

**Components Needed:**
- Mission detail header
- Starter files download component
- Submission form component
- Leaderboard preview component

### 3. My Submissions Page
**Path:** `/profile/missions`
**File:** `app/profile/missions/page.tsx`

**Features:**
- Submissions list (status, score, points)
- Filter by status
- View submission details
- Leaderboard position card
- Points summary

**Components Needed:**
- Submission card component
- Status badges
- Points display

---

## 🏆 Phase 4: Leaderboard & Polish

### 1. Leaderboard Page
**Path:** `/leaderboard`
**File:** `app/leaderboard/page.tsx`

**Features:**
- Top 10/25/50/100 students
- Search for specific student
- My position highlight
- Filters (all-time, monthly, weekly)
- Stats cards (total students, avg points)

**Components Needed:**
- Leaderboard table/component
- Rank badges
- Stats cards

### 2. Integration Points
- [ ] Add leaderboard preview to homepage
- [ ] Add missions link to student dashboard
- [ ] Add leaderboard widget to profile page
- [ ] Add points display to profile

---

## 📦 Files to Create

### Phase 3:
```
app/
  missions/
    page.tsx                    # Browse missions
    [missionId]/
      page.tsx                  # Mission detail & submission
  profile/
    missions/
      page.tsx                  # My submissions
components/
  missions/
    mission-card.tsx            # Mission card component
    mission-detail-header.tsx   # Mission header
    submission-form.tsx         # Submission form
    starter-files-download.tsx  # Starter files component
```

### Phase 4:
```
app/
  leaderboard/
    page.tsx                    # Leaderboard page
components/
  leaderboard/
    leaderboard-table.tsx       # Leaderboard component
    rank-badge.tsx              # Rank badge
```

---

## 🔧 Technical Requirements

### API Endpoints (Already Available ✅)
- `trpc.missions.browseMissions.useQuery()`
- `trpc.missions.getMission.useQuery()`
- `trpc.missions.startMission.useMutation()`
- `trpc.missions.submitSolution.useMutation()`
- `trpc.missions.getMySubmissions.useQuery()`
- `trpc.missions.getLeaderboard.useQuery()`
- `trpc.missions.getMyRank.useQuery()`

### Storage Helpers (Already Available ✅)
- `uploadMissionSubmissionFiles()` - Upload submission files
- `getSubmissionFileSignedUrl()` - Get signed URLs

### Email Integration (Already Available ✅)
- Email notifications are handled in backend

---

## ⚠️ Prerequisites to Verify

### 1. Storage Buckets
**Check in Supabase:**
- Go to Storage → Check if buckets exist
- If not, create them:
  - `mission-starter-files` (public)
  - `mission-submissions` (private)

### 2. RLS Policies
**Check in Supabase:**
- Verify RLS policies are set up (from migration)
- Students can view active missions
- Students can create/view their submissions

### 3. Navigation Updates
- Add "Missions" to main header navigation
- Add "Missions" to student dashboard
- Add "Leaderboard" to navigation

---

## 🚀 Implementation Order

1. **Phase 3.1:** Mission Browse Page
2. **Phase 3.2:** Mission Detail Page
3. **Phase 3.3:** My Submissions Page
4. **Phase 4.1:** Leaderboard Page
5. **Phase 4.2:** Integration & Polish

---

## ✅ Ready to Start?

**Prerequisites Status:**
- ✅ Backend endpoints ready
- ✅ Storage helpers ready
- ⚠️ Need to verify storage buckets
- ⚠️ Need to add navigation links

**Next Step:** Verify storage buckets, then start building Phase 3!

