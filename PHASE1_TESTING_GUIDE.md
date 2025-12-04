# 🧪 Phase 1 Testing Guide

## Overview

This guide will help you test all Phase 1 implementations:
1. Database Migration
2. Role Utilities
3. Permission System
4. React Hooks
5. tRPC Mutations

---

## ✅ Pre-Testing Checklist

Before starting, ensure:
- [ ] Supabase project is accessible
- [ ] Development server can run (`pnpm dev`)
- [ ] You have admin access to the database
- [ ] You have a test student account

---

## Step 1: Test Database Migration

### 1.1 Run the Migration

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Click on **SQL Editor** (left sidebar)

2. **Run the Migration**
   - Open: `database/migrations/add_student_profile_fields.sql`
   - Copy the entire file content
   - Paste into SQL Editor
   - Click **Run**

3. **Verify Migration Success**
   
   Run this SQL to check if columns were added:

   ```sql
   -- Check if new columns exist
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'users'
   AND column_name IN (
     'phone', 
     'linkedin_url', 
     'github_url', 
     'website_url', 
     'address',
     'preferred_industry',
     'degree_type',
     'work_experience',
     'education',
     'updated_at'
   )
   ORDER BY column_name;
   ```

   **Expected Result**: Should show all 10 columns

### 1.2 Verify Indexes

```sql
-- Check indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users'
AND indexname LIKE '%phone%' 
   OR indexname LIKE '%linkedin%'
   OR indexname LIKE '%preferred_industry%'
   OR indexname LIKE '%work_experience%'
   OR indexname LIKE '%education%';
```

### 1.3 Verify Trigger

```sql
-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_name = 'update_users_updated_at';
```

**Expected Result**: Should show the trigger exists

### 1.4 Test Updated_at Trigger

```sql
-- Test that updated_at auto-updates
-- First, check current updated_at for a user
SELECT id, email, updated_at 
FROM users 
WHERE email = 'your-test-email@example.com';

-- Update a field
UPDATE users 
SET full_name = 'Test User Updated'
WHERE email = 'your-test-email@example.com';

-- Check if updated_at changed
SELECT id, email, updated_at 
FROM users 
WHERE email = 'your-test-email@example.com';
```

**Expected Result**: `updated_at` should be updated automatically

---

## Step 2: Test Role Utilities (Manual Testing)

### 2.1 Create a Test Component

Create a test page to verify role utilities work:

1. **Create**: `app/test-roles/page.tsx`

2. **Test the hooks and utilities**:

```tsx
'use client';

import { useUserRole } from '@/lib/hooks/useUserRole';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestRolesPage() {
  const { role, isLoading, error } = useUserRole();
  const { permissions } = usePermissions();

  if (isLoading) {
    return <div>Loading role...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Role & Permissions Test</h1>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Role</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{role || 'Not logged in'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions ({permissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {permissions.map((perm) => (
                <li key={perm} className="text-sm">{perm}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

3. **Access the page**: `http://localhost:3000/test-roles`

4. **Verify**:
   - Role is displayed correctly
   - Permissions list shows correct permissions for your role

---

## Step 3: Test Permission System

### 3.1 Test Permission Checking

Add this to your test page:

```tsx
import { usePermission, useAnyPermission } from '@/lib/hooks/usePermissions';

// In your component:
const { hasPermission: canViewAdmin } = usePermission('admin.panel');
const { hasAnyPermission: canManageEvents } = useAnyPermission([
  'events.create',
  'events.edit',
  'events.delete'
]);

// Display results
<div>
  <p>Can view admin panel: {canViewAdmin ? '✅' : '❌'}</p>
  <p>Can manage events: {canManageEvents ? '✅' : '❌'}</p>
</div>
```

---

## Step 4: Test tRPC Mutations

### 4.1 Test Update Student Profile (Contact Details)

Create a test form or use tRPC dev tools:

```tsx
'use client';

import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TestProfileUpdate() {
  const updateProfile = trpc.auth.updateStudentProfile.useMutation({
    onSuccess: (data) => {
      console.log('✅ Profile updated:', data);
      alert('Profile updated successfully!');
    },
    onError: (error) => {
      console.error('❌ Error:', error);
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    updateProfile.mutate({
      phone: formData.get('phone') as string || undefined,
      linkedin_url: formData.get('linkedin_url') as string || undefined,
      github_url: formData.get('github_url') as string || undefined,
      website_url: formData.get('website_url') as string || undefined,
      address: formData.get('address') as string || undefined,
      preferred_industry: formData.get('industry') as string || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="phone" placeholder="Phone" />
      <Input name="linkedin_url" placeholder="LinkedIn URL" />
      <Input name="github_url" placeholder="GitHub URL" />
      <Input name="website_url" placeholder="Website URL" />
      <Input name="address" placeholder="Address" />
      <Input name="industry" placeholder="Preferred Industry" />
      <Button type="submit" disabled={updateProfile.isLoading}>
        {updateProfile.isLoading ? 'Saving...' : 'Update Profile'}
      </Button>
    </form>
  );
}
```

### 4.2 Test Work Experience Mutation

```tsx
const updateWorkExp = trpc.auth.updateWorkExperience.useMutation({
  onSuccess: (data) => {
    console.log('✅ Work experience updated:', data);
  },
});

// Test data
const testWorkExp = [
  {
    company: 'Tech Corp',
    position: 'Software Engineer Intern',
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    description: 'Developed web applications',
    is_current: false,
  },
  {
    company: 'Startup Inc',
    position: 'Full Stack Developer',
    start_date: '2024-07-01',
    is_current: true,
    description: 'Building SaaS platform',
  },
];

// Update
updateWorkExp.mutate({ work_experience: testWorkExp });
```

### 4.3 Test Education Mutation

```tsx
const updateEducation = trpc.auth.updateEducation.useMutation({
  onSuccess: (data) => {
    console.log('✅ Education updated:', data);
  },
});

// Test data
const testEducation = [
  {
    institution: 'Texas A&M University',
    degree: 'Bachelor of Science',
    field_of_study: 'Computer Science',
    start_date: '2020-09-01',
    end_date: '2024-05-15',
    gpa: 3.75,
    is_current: false,
  },
];

// Update
updateEducation.mutate({ education: testEducation });
```

---

## Step 5: Verify Data in Database

After running mutations, verify data was saved:

```sql
-- Check student profile with new fields
SELECT 
  id,
  email,
  full_name,
  phone,
  linkedin_url,
  github_url,
  website_url,
  address,
  preferred_industry,
  degree_type,
  work_experience,
  education,
  updated_at
FROM users
WHERE email = 'your-test-email@example.com';
```

**Expected Result**: All new fields should show the data you entered

---

## Step 6: Test Error Handling

### 6.1 Test Non-Student Role

Try updating student profile as a non-student:

1. Log in as admin/faculty/sponsor
2. Try to call `updateStudentProfile` mutation
3. **Expected**: Should get "Only students can update student profile" error

### 6.2 Test Invalid Data

Try submitting invalid data:
- Invalid URL format
- Missing required fields
- Invalid date formats

**Expected**: Should get validation errors

---

## Step 7: Quick Test Checklist

### Database ✅
- [ ] Migration runs without errors
- [ ] All 10 new columns exist
- [ ] Indexes are created
- [ ] Trigger works (updated_at auto-updates)

### Role System ✅
- [ ] `useUserRole()` returns correct role
- [ ] Role is cached properly
- [ ] Role updates on auth state change

### Permissions ✅
- [ ] Permissions match role correctly
- [ ] `usePermission()` works
- [ ] `useAnyPermission()` works
- [ ] Permission checking is accurate

### tRPC Mutations ✅
- [ ] `updateStudentProfile` saves contact details
- [ ] `updateStudentProfile` saves preferred industry
- [ ] `updateWorkExperience` saves work experience
- [ ] `updateEducation` saves education
- [ ] Error handling works (non-student role)
- [ ] Validation errors work

### Data Persistence ✅
- [ ] Data saves correctly
- [ ] Data retrieves correctly
- [ ] JSONB fields work properly
- [ ] updated_at updates automatically

---

## 🐛 Troubleshooting

### Issue: Migration fails
**Solution**: Check if columns already exist, or manually drop and recreate

### Issue: Role is null
**Solution**: 
- Check if user is logged in
- Check if user has a role in database
- Check RLS policies

### Issue: Mutation fails with "Only students can update"
**Solution**: 
- Verify user role in database: `SELECT role FROM users WHERE email = 'your-email';`
- Update role if needed: `UPDATE users SET role = 'student' WHERE email = 'your-email';`

### Issue: Hooks not updating
**Solution**: 
- Check if auth state listener is working
- Check browser console for errors
- Verify Supabase client is configured correctly

---

## ✅ Success Criteria

Phase 1 is successfully tested when:

1. ✅ All database columns exist and are accessible
2. ✅ Role utilities work correctly
3. ✅ Permission system accurately reflects roles
4. ✅ Hooks return correct data
5. ✅ All mutations work and save data
6. ✅ Error handling works properly
7. ✅ Data persists correctly

---

## 📝 Test Results Template

```
Phase 1 Test Results
Date: ___________
Tester: ___________

Database Migration:
  [ ] Pass  [ ] Fail  Notes: ___________

Role Utilities:
  [ ] Pass  [ ] Fail  Notes: ___________

Permission System:
  [ ] Pass  [ ] Fail  Notes: ___________

React Hooks:
  [ ] Pass  [ ] Fail  Notes: ___________

tRPC Mutations:
  [ ] Pass  [ ] Fail  Notes: ___________

Overall Status: [ ] PASS  [ ] FAIL

Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________
```

---

**Ready to test! Start with Step 1: Database Migration** 🚀

