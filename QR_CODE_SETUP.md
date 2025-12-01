# QR Code Check-in System Setup Guide

## Overview

The QR Code Check-in System allows event attendees to check in quickly using QR codes generated at registration. Admins and staff can scan these QR codes to mark attendance in real-time.

## Features

✅ **QR Code Generation**: Automatically generates secure QR codes on registration  
✅ **Email Integration**: QR codes included in registration confirmation emails  
✅ **Admin Scanner**: Web-based QR code scanner for check-in  
✅ **Real-time Check-in**: Instant status update when QR code is scanned  
✅ **Downloadable QR Codes**: Users can view and download QR codes from their registrations page  
✅ **Security**: HMAC-based token verification prevents QR code tampering

---

## Database Setup

### Step 1: Run Migration

Run the following SQL migration in your Supabase SQL Editor:

```sql
-- Add QR code token column to event_registrations
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS qr_code_token text;

-- Add checked_in_at timestamp
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;

-- Create index for faster QR code lookups
CREATE INDEX IF NOT EXISTS idx_event_registrations_qr_code_token 
ON event_registrations(qr_code_token);

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_event_registrations_status 
ON event_registrations(status);
```

**File:** `database/migrations/add_qr_code.sql`

---

## Environment Variables

Add to your `.env.local`:

```bash
# QR Code Secret (for token generation/verification)
QR_CODE_SECRET=your-secure-random-string-here
```

**Important:** Generate a secure random string for `QR_CODE_SECRET`. This is used to sign QR codes and prevent tampering.

---

## How It Works

### 1. Registration Flow

1. User registers for an event
2. System generates a unique QR code token using HMAC
3. Token is stored in `event_registrations.qr_code_token`
4. QR code is included in confirmation email
5. QR code is displayed on user's registrations page

### 2. QR Code Format

QR codes contain: `{registrationId}:{token}`

- **registrationId**: UUID of the registration
- **token**: 16-character HMAC signature

Example: `550e8400-e29b-41d4-a716-446655440000:a1b2c3d4e5f6g7h8`

### 3. Check-in Flow

1. Admin navigates to `/admin/checkin`
2. Admin scans or manually enters QR code data
3. System verifies QR code token
4. System updates registration status to `checked_in`
5. System records `checked_in_at` timestamp
6. Success/error message displayed

---

## User Features

### Viewing QR Code

1. Go to `/registrations`
2. Find your active registration
3. QR code is displayed automatically (for upcoming events)
4. Click "Download QR Code" to save as SVG

### Using QR Code at Event

1. Open your registrations page on mobile or print QR code
2. Show QR code to event staff/admin
3. Admin scans QR code using check-in page
4. You're automatically checked in!

---

## Admin Features

### Check-In Page (`/admin/checkin`)

**Access:** Admin and staff only

**Features:**
- Manual QR code entry (paste or type)
- Real-time check-in status
- Success/error feedback
- Registration details display
- Event and attendee information

### Usage:

1. Navigate to `/admin/checkin` (link in header)
2. Have attendee show their QR code
3. Either:
   - Scan QR code with a physical scanner (if connected)
   - Manually enter/paste QR code data
4. Click "Check In" button
5. View confirmation message

---

## API Endpoints

### Check-In API

**POST** `/api/checkin`

```json
{
  "qrData": "550e8400-e29b-41d4-a716-446655440000:a1b2c3d4e5f6g7h8"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully checked in",
  "registration": { ... }
}
```

**Response (Error):**
```json
{
  "error": "Already checked in",
  "registration": { ... }
}
```

### QR Code Image Generation

**GET** `/api/qr/generate?data={qrCodeToken}`

Returns a PNG image of the QR code.

**Usage in Email:**
```html
<img src="${appUrl}/api/qr/generate?data=${qrCodeToken}" alt="QR Code" />
```

---

## Security Considerations

1. **HMAC Verification**: QR codes are signed with HMAC-SHA256 to prevent tampering
2. **Token Storage**: QR code tokens are stored in the database for verification
3. **One-time Use**: QR codes can only be used for events that are upcoming
4. **Admin Access**: Check-in page is protected by admin middleware
5. **Status Validation**: System prevents checking in cancelled registrations

---

## Troubleshooting

### QR Code Not Appearing

- **Check database**: Ensure `qr_code_token` column exists
- **Check registration**: QR codes are only generated for successful registrations (not waitlist)
- **Check migration**: Run `database/migrations/add_qr_code.sql`

### Check-In Failing

- **Invalid QR code**: Verify QR code format is correct
- **Already checked in**: Check registration status
- **Cancelled registration**: Cannot check in cancelled registrations
- **Token mismatch**: Verify `QR_CODE_SECRET` matches the one used during generation

### Email QR Code Not Showing

- **Check email template**: Verify QR code image URL is correct
- **Check API endpoint**: Ensure `/api/qr/generate` is accessible
- **Check token**: Verify `qrCodeToken` is passed to email template

---

## Testing

### Test QR Code Generation

1. Register for an event
2. Check `event_registrations` table for `qr_code_token`
3. Visit `/registrations` to see QR code
4. Check confirmation email for QR code image

### Test Check-In

1. As admin, go to `/admin/checkin`
2. Copy QR code data from a registration
3. Paste into check-in form
4. Verify status updates to `checked_in`
5. Check `checked_in_at` timestamp is set

---

## Files Created/Modified

### New Files:
- `lib/qr/generate.ts` - QR code generation and verification
- `lib/qr/checkin.ts` - Check-in logic
- `components/qr/qr-code-display.tsx` - QR code display component
- `app/admin/checkin/page.tsx` - Admin check-in page
- `app/api/checkin/route.ts` - Check-in API endpoint
- `app/api/qr/generate/route.ts` - QR code image generation API
- `database/migrations/add_qr_code.sql` - Database migration

### Modified Files:
- `server/routers/registrations.router.ts` - Added QR code generation on registration
- `app/registrations/page.tsx` - Added QR code display
- `lib/email/templates.ts` - Added QR code to email template
- `app/api/email/send/route.ts` - Pass QR code token to email
- `components/layout/header.tsx` - Added check-in link for admins

---

## Next Steps

- ✅ QR code generation on registration
- ✅ QR code in confirmation emails
- ✅ Admin check-in scanner
- ✅ User QR code display
- 🔄 **Future enhancements:**
  - Physical QR code scanner integration
  - Bulk check-in features
  - Check-in analytics
  - Mobile app for check-in

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code in `lib/qr/` directory
3. Check server logs for error messages
4. Verify database migration was successful

