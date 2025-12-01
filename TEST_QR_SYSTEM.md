# QR Code System - Quick Test Guide

## ✅ Pre-Test Checklist

1. **Database Migration** (Required)
   - Run `database/migrations/add_qr_code.sql` in Supabase SQL Editor
   - Verify columns exist: `qr_code_token`, `checked_in_at`

2. **Environment Variable** (Required)
   - Add `QR_CODE_SECRET=your-secure-random-string` to `.env.local`

3. **Server Running**
   - `pnpm dev` should be running on port 3000

## 🧪 Test Steps

### Test 1: QR Code Generation on Registration

1. **Register for an event:**
   - Go to `/events`
   - Click on any event
   - Click "Register"
   - Confirm registration

2. **Verify QR code generated:**
   - Check database: `event_registrations` table
   - Look for `qr_code_token` column (should have a value)
   - Format: `{uuid}:{16-char-token}`

3. **Check email:**
   - Check your email for confirmation
   - QR code image should be visible in email

### Test 2: QR Code Display on Registrations Page

1. **View registrations:**
   - Go to `/registrations`
   - Find your active registration

2. **Verify QR code:**
   - QR code should be displayed
   - "Download QR Code" button should work
   - QR code should be scannable

### Test 3: Admin Check-In

1. **Access check-in page:**
   - Login as admin
   - Go to `/admin/checkin`
   - Should see check-in interface

2. **Test check-in:**
   - Copy QR code data from a registration
   - Paste into check-in form
   - Click "Check In"
   - Should see success message

3. **Verify status update:**
   - Check database: `event_registrations` table
   - Status should be `checked_in`
   - `checked_in_at` should have timestamp

### Test 4: QR Code API

1. **Test image generation:**
   - Get a QR code token from database
   - Visit: `http://localhost:3000/api/qr/generate?data={token}`
   - Should see PNG image of QR code

## 🐛 Common Issues

**QR code not appearing:**
- Check if migration was run
- Check if `qr_code_token` exists in database
- Check browser console for errors

**Check-in failing:**
- Verify QR code format is correct
- Check `QR_CODE_SECRET` matches
- Verify registration status is `registered` (not `cancelled`)

**Email QR code not showing:**
- Check `/api/qr/generate` endpoint is accessible
- Verify `NEXT_PUBLIC_APP_URL` is set correctly

## ✅ Success Criteria

- ✅ QR codes generated on registration
- ✅ QR codes visible in emails
- ✅ QR codes displayed on registrations page
- ✅ Admin can check in using QR code
- ✅ Status updates correctly to `checked_in`
- ✅ QR code images generate via API

