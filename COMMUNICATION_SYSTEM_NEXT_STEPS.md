# Communication System - Next Steps & Testing Guide

## ✅ Migration Complete!

Great! The database migration has been run successfully. The communication system is now **fully operational**.

---

## 🧪 Testing the System

### 1. Test Templates API

**Via tRPC (Recommended):**
```typescript
// In your React component or API route
const { data: templates } = trpc.communications.templates.getAll.useQuery();
console.log('Templates:', templates);
```

**Via Direct API:**
```bash
# Get all templates
curl http://localhost:3000/api/trpc/communications.templates.getAll
```

### 2. Create Your First Template

1. **Go to Admin UI:**
   - Navigate to: `http://localhost:3000/admin/communications/templates`
   - You should see the templates list page

2. **Create Template via API:**
```typescript
const createMutation = trpc.communications.templates.create.useMutation({
  onSuccess: (data) => {
    console.log('Template created:', data);
  },
});

createMutation.mutate({
  name: 'Welcome Email',
  type: 'email',
  subject: 'Welcome to {{event_name}}!',
  body: 'Hi {{user_name}}, welcome to {{event_name}}!',
  variables: {},
  is_active: true,
});
```

### 3. Test Queue Processing

**Add item to queue:**
```typescript
const addToQueue = trpc.communications.queue.add.useMutation();

addToQueue.mutate({
  template_id: 'your-template-id',
  recipient_id: 'user-id',
  scheduled_for: new Date().toISOString(),
  priority: 5,
});
```

**Process queue:**
```bash
# Call the queue processor endpoint
curl -X POST http://localhost:3000/api/communications/process-queue \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. Test Email Sending

**Check logs:**
```typescript
const { data: logs } = trpc.communications.logs.getAll.useQuery();
console.log('Email logs:', logs);
```

---

## 🚀 Quick Start: Create Your First Email Template

### Step 1: Create a Welcome Email Template

1. Go to `/admin/communications/templates`
2. Click "Create Template" (or use the API)
3. Fill in:
   - **Name:** Welcome Email
   - **Type:** Email
   - **Subject:** Welcome to {{event_name}}!
   - **Body:** 
     ```
     Hi {{user_name}},
     
     Thank you for registering for {{event_name}}!
     
     Event Details:
     - Date: {{event_date}}
     - Location: {{event_location}}
     
     We look forward to seeing you there!
     ```
   - **Variables:** `{ "user_name": "John", "event_name": "Tech Conference", "event_date": "2024-01-15", "event_location": "Main Hall" }`
   - **Target Audience:** registration
   - **Is Active:** Yes

### Step 2: Test the Template

**Render template with variables:**
```typescript
import { renderTemplate } from '@/lib/services/email-service';

const template = await getTemplateById('template-id');
const { subject, body } = await renderTemplate(template, {
  user_name: 'John Doe',
  event_name: 'Tech Conference',
  event_date: 'January 15, 2024',
  event_location: 'Main Hall',
});

console.log('Subject:', subject);
console.log('Body:', body);
```

### Step 3: Send a Test Email

**Add to queue and process:**
```typescript
// Add to queue
await trpc.communications.queue.add.mutate({
  template_id: 'template-id',
  recipient_id: 'user-id',
  scheduled_for: new Date().toISOString(),
  priority: 5,
  metadata: {
    user_name: 'John Doe',
    event_name: 'Tech Conference',
    event_date: 'January 15, 2024',
  },
});

// Process queue (or wait for cron job)
await fetch('/api/communications/process-queue', {
  method: 'POST',
});
```

---

## 🔧 Setting Up Automatic Queue Processing

### Option 1: Cron Job (Recommended for Production)

Set up a cron job to call the queue processor every 5 minutes:

```bash
# Add to your crontab
*/5 * * * * curl -X POST https://your-domain.com/api/communications/process-queue -H "Authorization: Bearer YOUR_SECRET_TOKEN"
```

### Option 2: Vercel Cron Jobs

If using Vercel, add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/communications/process-queue",
    "schedule": "*/5 * * * *"
  }]
}
```

### Option 3: Manual Processing

For testing, you can manually trigger:

```bash
curl -X POST http://localhost:3000/api/communications/process-queue
```

---

## 📊 Monitoring & Analytics

### View Queue Status

```typescript
const { data: queue } = trpc.communications.queue.getAll.useQuery({
  status: 'pending',
});
console.log('Pending items:', queue);
```

### View Email Logs

```typescript
const { data: logs } = trpc.communications.logs.getAll.useQuery({
  limit: 50,
});
console.log('Email logs:', logs);
```

### Get Statistics

```typescript
const { data: stats } = trpc.communications.logs.getStats.useQuery({
  start_date: '2024-01-01T00:00:00Z',
  end_date: new Date().toISOString(),
});
console.log('Stats:', stats);
```

---

## 🎯 Integration Examples

### 1. Send Email on Registration

**In your registration router:**
```typescript
import { triggerRegistrationEmail } from '@/lib/services/communication-triggers';

// After successful registration
await triggerRegistrationEmail(userId, eventId, registrationId);
```

### 2. Send Reminder Emails

**Set up daily cron job:**
```typescript
import { triggerEventReminders } from '@/lib/services/communication-triggers';

// Call this daily (e.g., via cron job)
await triggerEventReminders();
```

### 3. Send Cancellation Email

```typescript
import { triggerCancellationEmail } from '@/lib/services/communication-triggers';

// When user cancels
await triggerCancellationEmail(userId, eventId);
```

---

## 🔍 Troubleshooting

### Emails Not Sending?

1. **Check Resend API Key:**
   ```env
   RESEND_API_KEY=re_your_key_here
   ```

2. **Check Queue Status:**
   ```typescript
   const { data } = trpc.communications.queue.getAll.useQuery();
   // Check for items with status 'pending' or 'failed'
   ```

3. **Check Logs:**
   ```typescript
   const { data: logs } = trpc.communications.logs.getAll.useQuery({
     status: 'failed',
   });
   // Check error_message field
   ```

### Templates Not Rendering?

1. **Check Variables:**
   - Variables should be in format: `{{variable_name}}`
   - Make sure variables are passed in metadata

2. **Test Rendering:**
   ```typescript
   const { subject, body } = await renderTemplate(template, {
     user_name: 'Test User',
     event_name: 'Test Event',
   });
   console.log('Rendered:', { subject, body });
   ```

### Queue Not Processing?

1. **Check API Endpoint:**
   - Verify `/api/communications/process-queue` is accessible
   - Check for authentication errors

2. **Check Cron Job:**
   - Verify cron job is running
   - Check logs for errors

---

## 📝 Next Steps

1. ✅ **Migration Complete** - You're done with this!

2. **Create Templates:**
   - Create welcome email template
   - Create reminder email template
   - Create cancellation email template

3. **Set Up Triggers:**
   - Integrate registration trigger
   - Set up reminder cron job
   - Integrate cancellation trigger

4. **Set Up Queue Processing:**
   - Configure cron job
   - Test queue processing
   - Monitor queue status

5. **Complete Remaining UI (Optional):**
   - Schedule management UI
   - Queue monitoring UI
   - Logs dashboard
   - User preferences UI

---

## 🎉 System Status

✅ **Database:** Migrated and ready
✅ **API:** Fully functional
✅ **Email Service:** Ready to send
✅ **Queue System:** Ready to process
✅ **Templates UI:** Available at `/admin/communications/templates`

**The communication system is now fully operational!**

---

## 📚 Additional Resources

- **API Documentation:** See `server/routers/communications.router.ts`
- **Email Service:** See `lib/services/email-service.ts`
- **Queue Processor:** See `lib/services/queue-processor.ts`
- **Triggers:** See `lib/services/communication-triggers.ts`


