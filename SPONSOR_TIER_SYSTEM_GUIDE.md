# 🏆 Sponsor Tier System - Complete Guide

## Overview

The Sponsor Tier System provides a flexible, extensible framework for managing sponsor access levels, notification preferences, and feature permissions. The system supports three tiers (Basic, Standard, Premium) with different notification rules and access levels.

---

## 🎯 Features

### Tier-Based Access Control
- **Basic Tier**: Weekly digests only, basic access
- **Standard Tier**: Batched notifications, custom filters, analytics
- **Premium Tier**: Real-time notifications, unlimited features, priority access

### Intelligent Notification System
- Automatic surge detection and batching
- Per-event-type notification preferences
- Student filtering (major, GPA, skills, industry)
- Unsubscribe options per event type

### Admin Management
- View all sponsors with tier and engagement stats
- Bulk tier updates
- Filter by tier
- Individual sponsor details and history

### Sponsor Self-Service
- View tier benefits and usage stats
- Customize notification preferences
- Set student filters
- Manage contact preferences
- Unsubscribe from specific events

---

## 📦 Installation

### Step 1: Run Database Migrations

```bash
# 1. Run the main tier system migration
# Copy contents of database/migrations/add_sponsor_tier_system.sql
# Paste in Supabase SQL Editor and execute

# 2. Run the helper functions migration
# Copy contents of database/migrations/add_sponsor_stat_functions.sql
# Paste in Supabase SQL Editor and execute
```

### Step 2: Verify Installation

```sql
-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN (
  'sponsor_preferences',
  'notification_queue',
  'notification_logs',
  'sponsor_engagement_stats',
  'sponsor_saved_searches'
);

-- Check users table has sponsor_tier column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'sponsor_tier';

-- Check functions were created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
  'increment_sponsor_stat',
  'update_sponsor_last_login',
  'check_sponsor_export_limit',
  'check_sponsor_api_limit'
);
```

---

## 🔧 Usage

### For Developers

#### 1. Dispatching Notifications

```typescript
import { dispatchToSponsors } from '@/lib/communications/notification-dispatcher';

// When a student uploads a resume
await dispatchToSponsors({
  eventType: 'resume_upload',
  eventData: {
    student_name: 'John Doe',
    student_email: 'john@example.com',
    resume_url: 'https://...',
  },
  studentData: {
    major: 'Computer Science',
    graduation_year: 2025,
    gpa: 3.8,
    skills: ['Python', 'React', 'SQL'],
    preferred_industry: 'Technology',
  },
});
```

#### 2. Checking Feature Access

```typescript
import { canAccessFeature } from '@/lib/communications/sponsor-tiers';

// Check if sponsor can use custom filters
const hasAccess = await canAccessFeature(sponsorId, 'custom_filters');

if (!hasAccess) {
  return 'Upgrade to Standard or Premium to use custom filters';
}
```

#### 3. Checking Limits

```typescript
import { checkLimit } from '@/lib/communications/sponsor-tiers';

// Before allowing export
const { allowed, limit } = await checkLimit(
  sponsorId,
  'monthly_exports',
  currentExportCount
);

if (!allowed) {
  return `Monthly export limit reached (${limit} exports per month)`;
}

// Increment counter after successful export
await supabase.rpc('increment_sponsor_stat', {
  p_sponsor_id: sponsorId,
  p_stat_name: 'current_month_exports',
});
```

#### 4. Getting Sponsor Tier Info

```typescript
import { getSponsorTier, getTierConfig } from '@/lib/communications/sponsor-tiers';

const tier = await getSponsorTier(sponsorId);
const config = getTierConfig(tier);

console.log('Tier:', tier); // 'basic', 'standard', or 'premium'
console.log('Features:', config.features);
console.log('Limits:', config.limits);
```

---

### For Admins

#### Accessing the Admin Panel

Navigate to: `/admin/sponsors`

**Features:**
- View all sponsors with their tiers
- Filter by tier level
- Search by name or email
- View engagement statistics
- Bulk update tiers
- Individual tier changes
- Tier performance comparison

#### Changing Sponsor Tiers

**Individual Update:**
1. Go to `/admin/sponsors`
2. Find the sponsor in the table
3. Use the dropdown to select new tier
4. Change is applied immediately

**Bulk Update:**
1. Select multiple sponsors using checkboxes
2. Click "Bulk Update" button
3. Choose new tier
4. Optionally add a reason
5. Click "Update Tiers"

#### Monitoring Engagement

The admin panel shows:
- Total notifications sent (last 30 days)
- Total resumes viewed
- Average engagement rate
- Per-tier performance comparison

---

### For Sponsors

#### Accessing Preferences

Navigate to: `/sponsor/preferences`

#### Setting Notification Frequency

**Global Frequency:**
1. Go to Notification Preferences page
2. Set "Default Frequency" to:
   - Real-time (Premium only)
   - Batched (every few hours)
   - Daily (9 AM digest)
   - Weekly (Monday digest)
   - Never

**Event-Specific:**
1. Scroll to "Event-Specific Notifications"
2. Toggle on/off for each event type
3. Set individual frequency per event

#### Setting Student Filters

**Available Filters:**
- **Majors**: Select preferred majors (e.g., Computer Science)
- **Skills**: Choose required skills (e.g., Python, React)
- **Industries**: Filter by preferred industry
- **Minimum GPA**: Set GPA threshold
- **Graduation Years**: Select target graduation years

**Example:**
Only notify me about Computer Science students with Python skills, graduating in 2025-2026, with GPA ≥ 3.5.

#### Unsubscribing from Events

1. Go to "Event-Specific Notifications"
2. Uncheck the event types you don't want
3. Those events will be filtered out

---

## 🎨 Tier Configurations

### Basic Tier

**Features:**
- ❌ Real-time notifications
- ❌ Custom filters
- ❌ Priority access
- ❌ Detailed analytics
- ❌ Bulk export
- ❌ API access
- ❌ Dedicated support

**Notification Rules:**
- Default frequency: Weekly digest (Monday 9 AM)
- Batched during surge: Yes
- Max notifications per day: 1
- Event-specific customization: No

**Limits:**
- Student filters: 3
- Saved searches: 5
- Monthly exports: 10

---

### Standard Tier

**Features:**
- ❌ Real-time notifications
- ✅ Custom filters
- ❌ Priority access
- ✅ Detailed analytics
- ✅ Bulk export
- ❌ API access
- ❌ Dedicated support

**Notification Rules:**
- Default frequency: Batched (every 4 hours)
- Batched during surge: Yes
- Max notifications per day: 5
- Event-specific customization: Yes

**Limits:**
- Student filters: 10
- Saved searches: 20
- Monthly exports: 50

---

### Premium Tier

**Features:**
- ✅ Real-time notifications
- ✅ Custom filters
- ✅ Priority access
- ✅ Detailed analytics
- ✅ Bulk export
- ✅ API access
- ✅ Dedicated support

**Notification Rules:**
- Default frequency: Real-time (instant)
- Batched during surge: No
- Max notifications per day: Unlimited
- Event-specific customization: Yes

**Limits:**
- Student filters: Unlimited
- Saved searches: Unlimited
- Monthly exports: Unlimited

---

## 🔄 Batch Notification Processing

### Setup Cron Job

The system queues notifications for batched delivery. Set up a cron job to process them:

**Option 1: Supabase Edge Function**

```typescript
// functions/process-notifications/index.ts
import { processBatchedNotifications } from '@/lib/communications/notification-dispatcher';

Deno.serve(async (req) => {
  const result = await processBatchedNotifications();
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Option 2: External Cron (e.g., Vercel Cron)**

```typescript
// app/api/cron/process-notifications/route.ts
import { NextResponse } from 'next/server';
import { processBatchedNotifications } from '@/lib/communications/notification-dispatcher';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await processBatchedNotifications();
  return NextResponse.json(result);
}
```

**Schedule:**
- Run every hour for timely delivery
- Daily digest: Run at 9 AM
- Weekly digest: Run Monday at 9 AM

---

## 🛠️ Customization & Extension

### Adding a New Tier

1. **Update Type Definition** (`lib/communications/sponsor-tiers.ts`):

```typescript
export type SponsorTier = 'basic' | 'standard' | 'premium' | 'enterprise';
```

2. **Add Tier Configuration**:

```typescript
export const TIER_CONFIGS: Record<SponsorTier, TierConfig> = {
  // ... existing tiers ...
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    features: {
      immediateNotifications: true,
      customFilters: true,
      priorityAccess: true,
      detailedAnalytics: true,
      bulkExport: true,
      apiAccess: true,
      dedicatedSupport: true,
    },
    notificationRules: {
      defaultFrequency: 'real-time',
      batchDuringSurge: false,
      maxNotificationsPerDay: -1,
      canCustomizeByEventType: true,
    },
    limits: {
      maxStudentFilters: -1,
      maxSavedSearches: -1,
      monthlyExports: -1,
    },
  },
};
```

3. **Update Database Constraint**:

```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_sponsor_tier_check;
ALTER TABLE users ADD CONSTRAINT users_sponsor_tier_check 
  CHECK (sponsor_tier IN ('basic', 'standard', 'premium', 'enterprise'));
```

---

### Adding a New Event Type

1. **Update Type** (`lib/communications/sponsor-tiers.ts`):

```typescript
export type EventType = 
  | 'resume_upload' 
  | 'new_student' 
  | 'profile_update' 
  | 'mission_submission'
  | 'event_registration'
  | 'mentor_request'
  | 'internship_application'; // New
```

2. **Add Label** (`app/sponsor/preferences/page.tsx`):

```typescript
const EVENT_TYPE_LABELS: Record<EventType, string> = {
  // ... existing labels ...
  internship_application: 'Internship Applications',
};
```

3. **Dispatch Notifications**:

```typescript
await dispatchToSponsors({
  eventType: 'internship_application',
  eventData: { /* ... */ },
  studentData: { /* ... */ },
});
```

---

## 📊 Database Schema

### Key Tables

**sponsor_preferences**
- Stores notification preferences and filters per sponsor

**notification_queue**
- Queues notifications for batched delivery

**notification_logs**
- Tracks all sent notifications for analytics

**sponsor_engagement_stats**
- Aggregated engagement metrics per sponsor

**sponsor_saved_searches**
- Saved student search criteria with notifications

---

## 🚀 Best Practices

1. **Always Check Filters**: Use `matchesSponsorFilters()` before sending notifications
2. **Respect Tier Limits**: Check limits before allowing actions
3. **Log Everything**: All notifications go through `notification_logs`
4. **Handle Surge**: System automatically batches during high volume
5. **Monthly Resets**: Run `reset_monthly_sponsor_limits()` monthly via cron

---

## 🐛 Troubleshooting

### Notifications Not Sending

1. Check sponsor's tier and preferences
2. Verify notification frequency isn't set to "never"
3. Check if student matches filters
4. Look at notification_logs for errors

### Tier Not Updating

1. Verify user role is "sponsor"
2. Check database constraint
3. Look for errors in admin panel

### Batching Not Working

1. Ensure cron job is running
2. Check notification_queue table
3. Verify scheduled_for timestamps

---

## 📝 API Reference

See `server/routers/sponsors.router.ts` for complete tRPC API.

**Key Endpoints:**
- `sponsors.getMyTier` - Get current user's tier
- `sponsors.getMyPreferences` - Get notification preferences
- `sponsors.updateMyPreferences` - Update preferences
- `sponsors.getAllSponsors` - Admin: List all sponsors
- `sponsors.updateSponsorTier` - Admin: Change tier
- `sponsors.bulkUpdateTiers` - Admin: Bulk tier changes

---

## 🎓 Examples

### Example 1: New Resume Upload Flow

```typescript
// In resume upload handler
const student = await getStudent(studentId);

await dispatchToSponsors({
  eventType: 'resume_upload',
  eventData: {
    student_name: student.full_name,
    student_email: student.email,
    resume_url: student.resume_url,
    uploaded_at: new Date().toISOString(),
  },
  studentData: {
    major: student.major,
    graduation_year: student.graduation_year,
    gpa: student.gpa,
    skills: student.skills,
    preferred_industry: student.preferred_industry,
  },
});
```

### Example 2: Checking Export Limits

```typescript
// Before CSV export
const canExport = await supabase
  .rpc('check_sponsor_export_limit', { p_sponsor_id: sponsorId })
  .single();

if (!canExport.data) {
  throw new Error('Monthly export limit reached');
}

// ... perform export ...

// Increment counter
await supabase.rpc('increment_sponsor_stat', {
  p_sponsor_id: sponsorId,
  p_stat_name: 'current_month_exports',
});
```

---

## 🔐 Security Considerations

1. **RLS Policies**: All tables have Row Level Security enabled
2. **Admin-Only Actions**: Tier changes require admin role
3. **Sponsor Isolation**: Sponsors can only see their own data
4. **Rate Limiting**: Consider adding rate limits to API endpoints

---

## 📈 Future Enhancements

- [ ] Email open tracking (webhooks)
- [ ] Click tracking for analytics
- [ ] A/B testing for notification content
- [ ] Machine learning for optimal send times
- [ ] Mobile push notifications
- [ ] SMS notifications for premium tiers
- [ ] Slack/Teams integrations
- [ ] Custom webhook endpoints

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [tRPC Documentation](https://trpc.io/)
- [Email Best Practices](https://sendgrid.com/blog/email-best-practices/)

---

## ✅ Implementation Checklist

- [x] Create sponsor-tiers.ts library
- [x] Create database migrations
- [x] Create admin sponsors page
- [x] Create sponsor preferences page
- [x] Create notification dispatcher
- [x] Create tRPC router
- [ ] Set up cron job for batch processing
- [ ] Test tier-based notifications
- [ ] Test student filtering
- [ ] Test surge batching
- [ ] Train admins on tier management
- [ ] Document API for integrations

---

**Need Help?**
Contact the development team or refer to the inline code documentation.

