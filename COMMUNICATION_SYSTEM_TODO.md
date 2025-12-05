# Communication System Implementation Todo List

## Phase 1: Database Schema & Setup ✅ COMPLETED
- [x] Create database migration file (`database/migrations/add_communication_system.sql`)
- [x] Create TypeScript types (`lib/types/communications.ts`)
- [x] Update database schema file (`database/schema.sql`)

## Phase 2: Database Migration & Verification
- [ ] Run migration in Supabase SQL Editor
- [ ] Verify all 8 tables created successfully
- [ ] Verify RLS policies are enabled
- [ ] Verify indexes are created
- [ ] Test foreign key constraints
- [ ] Verify triggers for `updated_at` work

## Phase 3: Core API & Services
- [ ] Create Supabase client utilities for communication tables
- [ ] Create tRPC router for communication templates (`server/api/routers/communications.ts`)
  - [ ] `getTemplates` - List all templates
  - [ ] `getTemplateById` - Get single template
  - [ ] `createTemplate` - Create new template
  - [ ] `updateTemplate` - Update template
  - [ ] `deleteTemplate` - Delete template
  - [ ] `toggleTemplateActive` - Enable/disable template
- [ ] Create tRPC router for communication schedules
  - [ ] `getSchedules` - List all schedules
  - [ ] `createSchedule` - Create new schedule
  - [ ] `updateSchedule` - Update schedule
  - [ ] `pauseSchedule` - Pause schedule
  - [ ] `resumeSchedule` - Resume schedule
  - [ ] `deleteSchedule` - Delete schedule
- [ ] Create tRPC router for communication queue
  - [ ] `getQueue` - List queue items
  - [ ] `addToQueue` - Add item to queue
  - [ ] `processQueue` - Process pending items
  - [ ] `retryFailed` - Retry failed items
- [ ] Create tRPC router for communication logs
  - [ ] `getLogs` - List communication logs
  - [ ] `getLogsByRecipient` - Get logs for user
  - [ ] `getLogsByTemplate` - Get logs for template
  - [ ] `getLogStats` - Get statistics
- [ ] Create tRPC router for preferences
  - [ ] `getPreferences` - Get user preferences
  - [ ] `updatePreferences` - Update preferences
  - [ ] `unsubscribe` - Unsubscribe from category

## Phase 4: Email Service Integration
- [ ] Set up Resend email service
- [ ] Create email service utility (`lib/services/email.ts`)
  - [ ] `sendEmail` - Send single email
  - [ ] `sendBulkEmail` - Send bulk emails
  - [ ] `sendScheduledEmail` - Send scheduled email
  - [ ] `trackEmailOpen` - Track email opens
  - [ ] `trackEmailClick` - Track email clicks
- [ ] Create email template renderer
  - [ ] Variable substitution
  - [ ] Template variation selection (A/B testing)
  - [ ] HTML/text rendering
- [ ] Create webhook handlers for email tracking
  - [ ] Open tracking webhook
  - [ ] Click tracking webhook
  - [ ] Bounce tracking webhook

## Phase 5: Queue Processing System
- [ ] Create queue processor service (`lib/services/queue-processor.ts`)
  - [ ] `processPendingQueue` - Process pending items
  - [ ] `processScheduledQueue` - Process scheduled items
  - [ ] `handleFailedItems` - Handle failed items
  - [ ] `retryFailedItems` - Retry logic
- [ ] Create cron job or scheduled task
  - [ ] Run every 5 minutes to process queue
  - [ ] Process items by priority
  - [ ] Respect rate limits
- [ ] Implement surge mode handling
  - [ ] Detect registration surges
  - [ ] Batch emails during surge
  - [ ] Respect max emails per recipient per day

## Phase 6: Template Management UI
- [ ] Create templates list page (`app/admin/communications/templates`)
  - [ ] Display all templates
  - [ ] Filter by type, status
  - [ ] Search functionality
- [ ] Create template editor page (`app/admin/communications/templates/[id]`)
  - [ ] Form for creating/editing templates
  - [ ] Variable preview
  - [ ] Preview mode
  - [ ] Save draft functionality
- [ ] Create template variations manager
  - [ ] Add/edit variations
  - [ ] Set weights for A/B testing
  - [ ] Enable/disable variations

## Phase 7: Schedule Management UI
- [ ] Create schedules list page (`app/admin/communications/schedules`)
  - [ ] Display all schedules
  - [ ] Filter by status, event
  - [ ] Show next send time
- [ ] Create schedule editor page (`app/admin/communications/schedules/[id]`)
  - [ ] Form for creating/editing schedules
  - [ ] Trigger type selector
  - [ ] Recurrence settings
  - [ ] Recipient filter builder
- [ ] Create schedule preview/test
  - [ ] Preview recipients
  - [ ] Test send to admin

## Phase 8: Queue & Logs UI
- [ ] Create queue monitoring page (`app/admin/communications/queue`)
  - [ ] Display pending items
  - [ ] Show processing status
  - [ ] Manual retry option
  - [ ] Cancel items
- [ ] Create logs dashboard (`app/admin/communications/logs`)
  - [ ] Display all logs
  - [ ] Filter by status, channel, date
  - [ ] Export logs
  - [ ] Statistics dashboard

## Phase 9: User Preferences UI
- [ ] Create preferences page (`app/settings/communications`)
  - [ ] Email/SMS toggle
  - [ ] Category unsubscribe checkboxes
  - [ ] Preferred time windows
  - [ ] Save preferences

## Phase 10: Trigger System
- [ ] Implement event registration trigger
  - [ ] Detect new registration
  - [ ] Queue welcome email
- [ ] Implement event reminder trigger
  - [ ] Schedule reminder emails
  - [ ] 24h before, 1h before
- [ ] Implement event cancellation trigger
  - [ ] Queue cancellation email
- [ ] Implement waitlist promotion trigger
  - [ ] Queue promotion email when spot opens
- [ ] Implement custom triggers
  - [ ] Webhook-based triggers
  - [ ] Manual triggers

## Phase 11: Testing
- [ ] Unit tests for email service
- [ ] Unit tests for queue processor
- [ ] Integration tests for tRPC routers
- [ ] E2E tests for template management
- [ ] E2E tests for schedule management
- [ ] Test email delivery
- [ ] Test queue processing
- [ ] Test surge mode
- [ ] Test user preferences

## Phase 12: Documentation
- [ ] API documentation
- [ ] User guide for template creation
- [ ] Admin guide for schedule management
- [ ] Developer guide for adding triggers
- [ ] Troubleshooting guide

## Phase 13: Performance & Optimization
- [ ] Optimize queue queries
- [ ] Add caching for templates
- [ ] Implement rate limiting
- [ ] Monitor email delivery rates
- [ ] Optimize bulk email sending

## Phase 14: Advanced Features
- [ ] A/B testing for templates
- [ ] Email analytics dashboard
- [ ] Automated template optimization
- [ ] Smart send time optimization
- [ ] Multi-language support

---

## Quick Reference

### Database Tables
1. `communication_templates` - Email templates
2. `communication_schedules` - Scheduled sends
3. `communication_queue` - Pending emails
4. `communication_logs` - Sent emails tracking
5. `sponsor_tiers` - Sponsor levels
6. `communication_preferences` - User preferences
7. `email_template_variations` - Template variations
8. `surge_mode_config` - Surge handling config

### Key Files
- Migration: `database/migrations/add_communication_system.sql`
- Types: `lib/types/communications.ts`
- Schema: `database/schema.sql`

### Next Steps
1. Run database migration in Supabase
2. Create tRPC routers
3. Set up email service
4. Build admin UI


