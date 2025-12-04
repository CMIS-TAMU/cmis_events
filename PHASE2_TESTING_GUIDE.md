# Phase 2 Testing Guide

## Quick Test Checklist

### 1. Test Role Guards ✅

**Location**: `/test-roles` (if you created it) or any page using guards

**What to test**:
- [ ] Student-only content shows only for students
- [ ] Admin-only content shows only for admins
- [ ] Permission-based guards work correctly
- [ ] Loading states display properly
- [ ] Error messages show when `showError={true}`

### 2. Test Navigation Filtering ✅

**Location**: Header navigation (any page)

**What to test**:
- [ ] Logout: All navigation links hidden
- [ ] Login as Student: See student-appropriate links
- [ ] Login as Admin: See admin links (Admin, Sponsor)
- [ ] Login as Sponsor: See sponsor link
- [ ] Mobile menu also filters correctly

**Expected Links by Role**:

**Student/User**:
- Home, Events, Competitions
- Missions, Leaderboard, Dashboard
- Mentorship, My Registrations, My Sessions

**Admin**:
- All student links PLUS
- Sponsor link
- Admin link

**Sponsor**:
- Home, Events, Competitions
- Dashboard, Mentorship
- My Registrations, My Sessions
- Sponsor link

**Faculty**:
- Similar to student but may have additional links

### 3. Test Dashboard Routing ✅

**Location**: `/dashboard`

**What to test**:
- [ ] Login as Admin → Redirects to `/admin/dashboard`
- [ ] Login as Sponsor → Redirects to `/sponsor/dashboard`
- [ ] Login as Student → Stays on `/dashboard`
- [ ] Login as Faculty → Stays on `/dashboard`
- [ ] Role-specific cards show/hide correctly

### 4. Test Guard Components ✅

**Location**: `/dashboard` page

**What to test**:
- [ ] "Mentorship Program" card shows only for students/users
- [ ] "Admin Panel" card shows only for admins
- [ ] "Sponsor Portal" card shows for sponsors and admins
- [ ] "Faculty Resources" card shows only for faculty

---

## Manual Testing Steps

### Step 1: Test Navigation (5 minutes)

1. **Logout**:
   - Open browser
   - Navigate to any page
   - Check header: Should see "Sign in" and "Sign up" only
   - Should NOT see: Dashboard, Events (if auth required), etc.

2. **Login as Student**:
   - Log in with student account
   - Check header navigation
   - Verify student-appropriate links are visible
   - Verify admin/sponsor links are NOT visible

3. **Login as Admin**:
   - Log in with admin account
   - Check header navigation
   - Verify ALL links are visible (including Admin, Sponsor)
   - Verify "Admin" button appears in header

4. **Test Mobile Menu**:
   - Open mobile menu (hamburger icon)
   - Verify same filtering applies
   - Close menu and test different roles

### Step 2: Test Dashboard Redirects (5 minutes)

1. **Admin Redirect**:
   - Login as admin
   - Navigate to `/dashboard`
   - Should automatically redirect to `/admin/dashboard`
   - Verify redirect happens smoothly

2. **Sponsor Redirect**:
   - Login as sponsor
   - Navigate to `/dashboard`
   - Should automatically redirect to `/sponsor/dashboard`

3. **Student Dashboard**:
   - Login as student
   - Navigate to `/dashboard`
   - Should STAY on `/dashboard` (no redirect)
   - Verify role-specific cards are visible

### Step 3: Test Guard Components (10 minutes)

1. **Create Test Page** (optional):
   ```tsx
   // app/test-guards/page.tsx
   import { StudentOnly, AdminOnly, RoleGuard } from '@/components/auth';
   
   export default function TestGuards() {
     return (
       <div>
         <StudentOnly>
           <p>This should only show for students</p>
         </StudentOnly>
         
         <AdminOnly>
           <p>This should only show for admins</p>
         </AdminOnly>
       </div>
     );
   }
   ```

2. **Test Different Roles**:
   - Login as student → Only student content shows
   - Login as admin → Only admin content shows
   - Logout → No content shows

---

## Expected Behaviors

### Navigation Links Visibility

| Link | Public | Student | Faculty | Sponsor | Admin |
|------|--------|---------|---------|---------|-------|
| Home | ✅ | ✅ | ✅ | ✅ | ✅ |
| Events | ✅ | ✅ | ✅ | ✅ | ✅ |
| Competitions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Missions | ❌ | ✅ | ✅ | ❌ | ✅ |
| Leaderboard | ❌ | ✅ | ✅ | ❌ | ✅ |
| Dashboard | ❌ | ✅ | ✅ | ✅ | ✅ |
| Mentorship | ❌ | ✅ | ✅ | ✅ | ✅ |
| My Registrations | ❌ | ✅ | ✅ | ✅ | ✅ |
| My Sessions | ❌ | ✅ | ✅ | ✅ | ✅ |
| Sponsor | ❌ | ❌ | ❌ | ✅ | ✅ |
| Admin | ❌ | ❌ | ❌ | ❌ | ✅ |

### Dashboard Redirects

| Role | Redirect To |
|------|-------------|
| Admin | `/admin/dashboard` |
| Sponsor | `/sponsor/dashboard` |
| Student | `/dashboard` (stay) |
| Faculty | `/dashboard` (stay) |
| User | `/dashboard` (stay) |

---

## Troubleshooting

### Issue: Navigation links not filtering

**Check**:
1. Is `useUserRole` hook working?
2. Is role being fetched correctly?
3. Check browser console for errors
4. Verify role in database matches expected values

**Fix**:
- Clear browser cache
- Check network tab for API calls
- Verify role in Supabase `users` table

### Issue: Dashboard not redirecting

**Check**:
1. Is role loading correctly?
2. Check browser console for redirect errors
3. Verify redirect logic in dashboard page

**Fix**:
- Check `useEffect` dependencies
- Verify router.push is being called
- Check for conflicting redirects

### Issue: Guard components not working

**Check**:
1. Are guards imported correctly?
2. Is role being passed properly?
3. Check for TypeScript errors

**Fix**:
- Verify imports from `@/components/auth`
- Check role value in database
- Clear Next.js cache: `rm -rf .next`

---

## Quick Verification SQL

```sql
-- Check user roles
SELECT email, role FROM users WHERE email IN (
  'student@example.com',
  'admin@example.com',
  'sponsor@example.com',
  'faculty@example.com'
);

-- Verify role values match expected
SELECT DISTINCT role FROM users;
```

---

## Test Accounts Setup

Make sure you have test accounts for each role:

```sql
-- Update test accounts
UPDATE users SET role = 'student' WHERE email = 'student@test.com';
UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';
UPDATE users SET role = 'sponsor' WHERE email = 'sponsor@test.com';
UPDATE users SET role = 'faculty' WHERE email = 'faculty@test.com';
```

---

**Testing Time**: ~20 minutes  
**Status**: Ready for testing ✅
