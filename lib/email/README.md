# Email Integration

This directory contains the email service integration using Resend.

## Setup

1. **Get Resend API Key:**
   - Sign up at https://resend.com
   - Go to API Keys: https://resend.com/api-keys
   - Create a new API key
   - Copy the key

2. **Configure Environment Variables:**
   Add to your `.env.local`:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
   ```

3. **Verify Domain (Production):**
   - Add your domain in Resend dashboard
   - Verify DNS records
   - Use verified domain in `RESEND_FROM_EMAIL`

## Email Templates

### Registration Confirmation
- Sent when a user registers for an event
- Includes event details and registration ID
- Supports waitlist notifications

### Cancellation Notification
- Sent when a user cancels their registration
- Includes event details

### Admin Notification
- Sent to admins when a new registration is received
- Includes user and event details

## Usage

Emails are automatically sent when:
- User registers for an event (via `registrations.register` mutation)
- User cancels a registration (via `registrations.cancel` mutation)

The email sending happens asynchronously and won't block the API response.

## Testing

To test email sending without Resend configured:
- The system will log warnings but continue to function
- Emails won't be sent, but registration/cancellation will still work

## API Endpoint

`POST /api/email/send`

Body:
```json
{
  "type": "registration_confirmation" | "cancellation" | "admin_notification",
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "event": {
    "title": "Event Title",
    "description": "Event description",
    "starts_at": "2024-01-01T10:00:00Z",
    "ends_at": "2024-01-01T12:00:00Z"
  },
  "registrationId": "uuid-here",
  "isWaitlisted": false,
  "waitlistPosition": null
}
```

