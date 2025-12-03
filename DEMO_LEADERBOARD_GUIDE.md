# 🎭 Demo Leaderboard Data Guide

## Overview

This feature allows you to generate fake student ratings and leaderboard data for demonstration purposes. Perfect for showcasing the platform to stakeholders!

---

## 🚀 Quick Start

### Option 1: Via Admin Dashboard
1. Log in as an **Admin** user
2. Go to **Admin Dashboard** (`/admin/dashboard`)
3. Find the **"Demo Data"** card
4. Click **"Generate Leaderboard Data"**
5. You'll be taken to the demo data page

### Option 2: Direct Access
1. Navigate to `/admin/demo-data`
2. Click **"Generate Leaderboard Demo Data"** button
3. Wait for success message
4. Visit `/leaderboard` to see the fake ratings!

---

## 📊 What Gets Generated

The demo data includes:

- **10-15 fake student entries** with:
  - Random names (e.g., "Alex Chen", "Sarah Johnson")
  - Varied majors (Computer Science, Information Systems, etc.)
  - Different graduation years (2024-2027)
  - **Total Points**: 100-5000+ points
  - **Missions Completed**: 1-15 missions
  - **Average Score**: 60-95%
  - **Perfect Scores**: ~30% of completed missions

- **Realistic Rankings**:
  - Sorted by total points (descending)
  - Varied point distributions
  - Different completion rates

---

## 🎯 Demo Flow

### For Your Demo:

1. **Generate Demo Data**
   - Go to `/admin/demo-data`
   - Click "Generate Leaderboard Demo Data"
   - Wait for success message

2. **Show Leaderboard**
   - Navigate to `/leaderboard`
   - Show top performers with rankings
   - Highlight top 3 badges (🥇 🥈 🥉)

3. **Show Student View**
   - Navigate to `/profile/missions` (as a student)
   - Show "My Rank" card
   - Show stats (points, average score, missions completed)

4. **Show Mission Details**
   - Navigate to `/missions`
   - Show active missions
   - Show mission cards with points and difficulty

---

## 🔄 Regenerating Data

You can regenerate the demo data anytime:
- Just click the button again
- It will update existing entries or create new ones
- Old data will be overwritten with new fake data

---

## ⚠️ Important Notes

- **This is FAKE data** - Only for demonstration purposes
- **Existing real data** may be overwritten
- **Demo users** are created with email pattern: `demo1@example.com`, `demo2@example.com`, etc.
- **Real student data** will be mixed with demo data if they exist

---

## 🎨 What It Looks Like

After generating, the leaderboard will show:
- Top performers with rankings
- Points, scores, and missions completed
- Student names, majors, graduation years
- Special badges for top 3 positions

---

## 🛠️ Technical Details

- **API Route**: `/api/admin/seed-demo-leaderboard`
- **Database Table**: `student_points`
- **Method**: Upserts data (creates or updates)
- **Access**: Admin only

---

## ✅ Ready for Demo!

1. Generate the data
2. Show the leaderboard
3. Impress your audience! 🎉

---

**Happy Demo! 🚀**

