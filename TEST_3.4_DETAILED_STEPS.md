# 🧪 Test 3.4: QR Code Check-in Validation - Detailed Steps

**Test Purpose:** Verify that the check-in system properly validates QR codes and prevents invalid check-ins.

**Prerequisites:**
- ✅ Development server running (`pnpm dev`)
- ✅ Admin account logged in
- ✅ At least one valid registration exists with a QR code

---

## 📋 **TEST SCENARIO 1: Invalid QR Code Format**

### Objective:
Test that the system rejects QR codes with invalid format.

### Step-by-Step Instructions:

1. **Open Check-in Page**
   - Open your browser
   - Navigate to: `http://localhost:3000/admin/checkin`
   - ✅ Page should load showing "Check-In Scanner"

2. **Enter Invalid Format QR Code**
   - In the "QR Code Data" input field, enter:
     ```
     invalid-qr-code-without-colon
     ```
   - ✅ Notice: No colon (`:`) separator

3. **Attempt Check-in**
   - Click the "Check In" button
   - Wait for response

4. **Verify Error Message**
   - ✅ Right side panel should show:
     - ❌ Red "Failed" indicator (XCircle icon)
     - Error message: **"Invalid QR code format"**
     - ❌ No registration details should appear

### Expected Result:
✅ System rejects QR code with error: "Invalid QR code format"

### What to Check:
- [ ] Error appears in red
- [ ] Message is clear and specific
- [ ] System doesn't attempt to process the invalid format

---

## 📋 **TEST SCENARIO 2: Non-existent Registration ID**

### Objective:
Test that the system rejects QR codes for registrations that don't exist.

### Step-by-Step Instructions:

1. **Generate Fake Registration ID**
   - Create a fake UUID format (looks like: `123e4567-e89b-12d3-a456-426614174000`)
   - Create a fake token (16 characters, e.g., `abc123def456ghij`)
   - Combine with colon separator

2. **Enter Non-existent QR Code**
   - In the "QR Code Data" input field, enter:
     ```
     123e4567-e89b-12d3-a456-426614174000:abc123def456ghij
     ```
   - ✅ Note: Format is correct, but registration doesn't exist

3. **Attempt Check-in**
   - Click the "Check In" button
   - Wait for response

4. **Verify Error Message**
   - ✅ Right side panel should show:
     - ❌ Red "Failed" indicator
     - Error message: **"Registration not found"**
     - ❌ No registration details should appear

### Expected Result:
✅ System rejects QR code with error: "Registration not found"

### What to Check:
- [ ] Error appears in red
- [ ] Message indicates registration doesn't exist
- [ ] System doesn't crash or show generic error

---

## 📋 **TEST SCENARIO 3: Invalid QR Code Token**

### Objective:
Test that the system rejects QR codes with invalid token signatures.

### Step-by-Step Instructions:

1. **Get a Valid Registration ID**
   - First, register for an event as a student (or use existing registration)
   - Go to `/registrations` page
   - Find a valid QR code data
   - ✅ Format should be: `registration-id:token`

2. **Modify the Token**
   - Copy the valid QR code data
   - Change the token part (after the colon)
   - Example: If valid is `abc-123:token123456789`, change to `abc-123:wrongtoken123`

3. **Enter Invalid Token QR Code**
   - In the "QR Code Data" input field, paste the modified QR code:
     ```
     [valid-registration-id]:[wrong-token]
     ```
   - ✅ Note: Registration ID exists, but token is wrong

4. **Attempt Check-in**
   - Click the "Check In" button
   - Wait for response

5. **Verify Error Message**
   - ✅ Right side panel should show:
     - ❌ Red "Failed" indicator
     - Error message: **"Invalid QR code"**
     - ❌ Registration details may appear (for context)

### Expected Result:
✅ System rejects QR code with error: "Invalid QR code"

### What to Check:
- [ ] Error appears in red
- [ ] Message indicates QR code is invalid
- [ ] System detects token mismatch

---

## 📋 **TEST SCENARIO 4: Already Checked-in User**

### Objective:
Test that the system prevents double check-ins.

### Step-by-Step Instructions:

1. **Check-in a User First**
   - Get a valid QR code from a registered user
   - Go to `/admin/checkin`
   - Enter the valid QR code
   - Click "Check In"
   - ✅ Should show "Success!" message
   - ✅ Status should show "Checked In"

2. **Note the QR Code Data**
   - Copy the QR code data you just used
   - Keep it for the next step

3. **Attempt to Check-in Same User Again**
   - Clear the input field (or refresh page)
   - Enter the **same QR code** again:
     ```
     [same-registration-id]:[same-token]
     ```
   - Click "Check In" button again
   - Wait for response

4. **Verify Error Message**
   - ✅ Right side panel should show:
     - ❌ Red "Failed" indicator
     - Error message: **"Already checked in"**
     - ✅ Registration details should appear showing:
       - Event name
       - Attendee name/email
       - Status badge showing "checked in"

5. **Verify Status Display**
   - Check the status badge in the error message
   - ✅ Should show "checked in" status
   - ✅ Should be highlighted appropriately

### Expected Result:
✅ System rejects check-in with error: "Already checked in" and shows registration details

### What to Check:
- [ ] Error message is clear
- [ ] Registration details are shown (helps admin understand why)
- [ ] Status badge shows "checked in"
- [ ] System doesn't allow duplicate check-ins

---

## 📋 **TEST SCENARIO 5: Cancelled Registration**

### Objective:
Test that the system prevents checking in cancelled registrations.

### Step-by-Step Instructions:

1. **Cancel a Registration**
   - Log in as a student
   - Go to `/registrations` page
   - Find an active registration
   - Click "Cancel Registration"
   - Confirm cancellation
   - ✅ Registration should show "Cancelled" status

2. **Get the QR Code Before Cancellation**
   - ⚠️ **Important:** Note the QR code data before cancelling (or get it from email)
   - Or check the database for the `qr_code_token` field

3. **Try to Check-in Cancelled Registration**
   - Log in as admin
   - Go to `/admin/checkin`
   - Enter the QR code from the cancelled registration:
     ```
     [cancelled-registration-id]:[token]
     ```
   - Click "Check In"

4. **Verify Error Message**
   - ✅ Right side panel should show:
     - ❌ Red "Failed" indicator
     - Error message: **"Registration was cancelled"**
     - ✅ Registration details should appear showing:
       - Event name
       - Attendee name/email
       - Status badge showing "cancelled"

5. **Verify Status Display**
   - Check the status badge
   - ✅ Should show "cancelled" status (red/destructive style)

### Expected Result:
✅ System rejects check-in with error: "Registration was cancelled" and shows registration details

### What to Check:
- [ ] Error message is clear
- [ ] Registration details are shown
- [ ] Status badge shows "cancelled" in red
- [ ] System prevents checking in cancelled registrations

---

## 📋 **BONUS TEST: Empty QR Code**

### Objective:
Test that the system handles empty input gracefully.

### Step-by-Step Instructions:

1. **Open Check-in Page**
   - Go to `/admin/checkin`

2. **Leave Input Empty**
   - Leave the "QR Code Data" field empty
   - Try to click "Check In"

3. **Verify Button Disabled**
   - ✅ "Check In" button should be **disabled** (grayed out)
   - ✅ Button should not be clickable

4. **Try Submitting**
   - Try pressing Enter in the input field
   - ✅ Should not submit if field is empty

### Expected Result:
✅ "Check In" button is disabled when input is empty

---

## 🎯 **VALIDATION SUMMARY TABLE**

| Test Case | QR Code Input | Expected Error | Status Badge |
|-----------|--------------|----------------|--------------|
| Invalid Format | `no-colon-format` | "Invalid QR code format" | None |
| Non-existent ID | `fake-uuid:fake-token` | "Registration not found" | None |
| Invalid Token | `valid-id:wrong-token` | "Invalid QR code" | May show |
| Already Checked-in | `checked-id:token` | "Already checked in" | "checked in" |
| Cancelled | `cancelled-id:token` | "Registration was cancelled" | "cancelled" |
| Empty Input | (empty) | Button disabled | N/A |

---

## ✅ **SUCCESS CRITERIA**

All tests pass if:

1. ✅ Invalid QR code formats are rejected with clear error messages
2. ✅ Non-existent registrations are detected
3. ✅ Invalid tokens are rejected
4. ✅ Already checked-in users cannot check in again
5. ✅ Cancelled registrations cannot be checked in
6. ✅ Error messages are clear and helpful
7. ✅ Registration details appear when relevant (for context)
8. ✅ Empty input is prevented at UI level

---

## 🐛 **TROUBLESHOOTING**

### Issue: Error messages not showing
**Solution:**
- Check browser console for JavaScript errors
- Verify API route `/api/checkin` is accessible
- Check network tab for API response

### Issue: "Registration not found" for valid QR code
**Solution:**
- Verify the registration exists in database
- Check that `qr_code_token` field is set on registration
- Verify UUID format is correct

### Issue: Invalid token accepted
**Solution:**
- Check `QR_CODE_SECRET` environment variable is set
- Verify token verification logic in `lib/qr/checkin.ts`
- Ensure tokens match between generation and verification

### Issue: Already checked-in not detected
**Solution:**
- Verify `status` field updates to `checked_in` in database
- Check `checked_in_at` timestamp is set
- Verify status check in validation logic

---

## 📝 **TEST CHECKLIST**

Print this and check off as you complete each test:

- [ ] Test 1: Invalid QR code format
- [ ] Test 2: Non-existent registration ID
- [ ] Test 3: Invalid QR code token
- [ ] Test 4: Already checked-in user
- [ ] Test 5: Cancelled registration
- [ ] Bonus: Empty input handling

---

## 🎬 **QUICK TEST SCRIPT**

For rapid testing, use this sequence:

1. **Test Invalid Format (30 seconds)**
   ```
   Input: "invalid-format"
   Expected: "Invalid QR code format"
   ```

2. **Test Non-existent ID (30 seconds)**
   ```
   Input: "00000000-0000-0000-0000-000000000000:fake-token-123"
   Expected: "Registration not found"
   ```

3. **Test Already Checked-in (1 minute)**
   - Check in a valid user
   - Try same QR code again
   - Expected: "Already checked in"

4. **Test Cancelled (1 minute)**
   - Cancel a registration
   - Try to check in with its QR code
   - Expected: "Registration was cancelled"

**Total time: ~3 minutes for all validation tests**

---

**Ready to test!** 🚀

Start with Test 1 and work through each scenario. Document any issues you find!

