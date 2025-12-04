# 🔧 Technical Debt

## 📧 Email Notifications - Mini Mentorship Requests

### **Issue**
Mentors are not receiving email notifications when students create mini mentorship requests.

**Status:** ⚠️ To be fixed later

**Date Added:** Today

### **What's Implemented**
- ✅ Email template created (`miniMentorshipRequestNotificationEmail`)
- ✅ Email API endpoint supports `mini_mentorship_request` type
- ✅ Notification logic in `createRequest` mutation
- ✅ Direct email sending (using `sendEmail()` function)
- ✅ Comprehensive logging

### **Known Issues**
1. Emails not being delivered to `abhishekp1703@gmail.com`
2. Need to verify:
   - Mentor profile has `in_matching_pool = true`
   - Environment variables are set (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`)
   - Server was restarted after env changes
   - Resend account is active

### **Diagnostic Tools Created**
- `QUICK_DIAGNOSTIC.sql` - SQL script to check mentor setup
- `TEST_EMAIL_SETUP.sql` - Comprehensive email setup test
- `HOW_TO_FIX_EMAIL_NOTIFICATIONS.md` - Fix guide
- `EMAIL_NOTIFICATION_TROUBLESHOOTING.md` - Troubleshooting guide
- `DEBUG_EMAIL_NOTIFICATIONS.md` - Debug steps
- `HOW_TO_WATCH_CONSOLE_LOGS.md` - Console watching guide

### **Next Steps (When Fixing)**
1. Run diagnostic SQL scripts
2. Check console logs when creating request
3. Verify mentor `in_matching_pool = true`
4. Verify environment variables
5. Test email service directly
6. Check Resend dashboard for delivery status

### **Related Files**
- `server/routers/miniMentorship.router.ts` - Notification logic (lines 89-186)
- `lib/email/templates.ts` - Email template
- `app/api/email/send/route.ts` - Email API endpoint

---

**Priority:** Medium  
**Estimated Fix Time:** 1-2 hours  
**Assigned to:** TBD

