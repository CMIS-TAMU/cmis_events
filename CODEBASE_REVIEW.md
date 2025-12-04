# Codebase Review: Inconsistencies & Improvements

**Date:** 2024  
**Scope:** Functionality, Consistency, Code Quality

---

## 🔴 Critical Issues

### 1. **Inconsistent Supabase Client Creation**

**Problem:** Multiple patterns for creating Supabase clients across routers.

**Current Patterns:**
- `createClient(supabaseUrl, supabaseAnonKey)` - Creates new client without cookie handling
- `ctx.supabase` - Client from context with cookie handling (PREFERRED)
- `getAdminSupabase()` - Local function in mentorship router
- `createAdminSupabase()` - From lib/supabase/server.ts

**Issues:**
- Many routers create new clients instead of using `ctx.supabase`
- Cookie-based auth won't work properly without context client
- Duplicate code for admin client creation

**Affected Files:**
- `server/routers/events.router.ts` - All procedures create new clients
- `server/routers/registrations.router.ts` - Creates new clients, calls `getUser()` redundantly
- `server/routers/auth.router.ts` - Creates new clients in `protectedProcedure`
- `server/routers/competitions.router.ts` - Multiple new client creations
- `server/routers/mentorship.router.ts` - Mix of patterns

**Recommendation:**
```typescript
// ✅ GOOD: Use context client
.mutation(async ({ ctx, input }) => {
  const supabase = ctx.supabase; // Has cookie handling
  // ctx.user is already available in protectedProcedure
})

// ❌ BAD: Create new client
.mutation(async ({ ctx, input }) => {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user } } = await supabase.auth.getUser(); // Redundant!
})
```

---

### 2. **Redundant User Authentication Checks**

**Problem:** Many `protectedProcedure` endpoints create new Supabase clients and call `getUser()` even though `ctx.user` is already available.

**Examples:**
- `auth.router.ts:getCurrentUser` - Protected procedure but still calls `getUser()`
- `auth.router.ts:updateProfile` - Has `ctx.user` but creates new client
- `events.router.ts:create` - Admin procedure but creates new client
- `registrations.router.ts:register` - Has context but creates new client

**Impact:**
- Unnecessary database queries
- Cookie handling issues
- Performance degradation
- Potential auth inconsistencies

**Fix Pattern:**
```typescript
// ✅ GOOD
protectedProcedure.mutation(async ({ ctx, input }) => {
  const userId = ctx.user.id; // Already authenticated
  const supabase = ctx.supabase; // Has session cookies
  // No need to call getUser() again
})

// ❌ BAD
protectedProcedure.mutation(async ({ ctx, input }) => {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user } } = await supabase.auth.getUser(); // Redundant!
  if (!user) throw new Error('Not authenticated'); // Already checked!
})
```

---

### 3. **Inconsistent Error Handling**

**Problem:** Mix of error types and messages.

**Current Patterns:**
- `throw new Error('message')` - Generic errors
- `throw new TRPCError({ code, message })` - Structured errors (PREFERRED)
- Some errors include `.message` from Supabase, others don't

**Examples:**
- Some: `throw new Error('User not found')`
- Others: `throw new TRPCError({ code: 'UNAUTHORIZED', message: '...' })`
- Some: `throw new Error(\`Failed: ${error.message}\`)`
- Others: `throw new Error('Failed')`

**Recommendation:** Standardize on TRPCError for better client handling:
```typescript
// ✅ GOOD
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'User not found',
});

// ✅ GOOD for database errors
throw new TRPCError({
  code: 'INTERNAL_SERVER_ERROR',
  message: `Failed to update profile: ${error.message}`,
  cause: error,
});
```

---

### 4. **Missing Error Checks**

**Problem:** Some database queries don't check for errors before using data.

**Examples:**
- `auth.router.ts:getCurrentUser` - Doesn't check `profileError`
- `events.router.ts:getById` - Returns data without checking if null
- Multiple places use `.single()` without checking if record exists

**Fix:**
```typescript
// ✅ GOOD
const { data, error } = await supabase.from('users').select('*').single();
if (error) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: 'User not found',
  });
}
if (!data) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: 'User not found',
  });
}
```

---

## 🟡 Medium Priority Issues

### 5. **Code Duplication - Admin Supabase Client**

**Problem:** Two ways to create admin clients:
- `getAdminSupabase()` function in `mentorship.router.ts`
- `createAdminSupabase()` in `lib/supabase/server.ts`

**Recommendation:** Remove local function, use centralized one:
```typescript
// ✅ GOOD: Use from lib
import { createAdminSupabase } from '@/lib/supabase/server';
const supabase = createAdminSupabase();

// ❌ BAD: Local duplicate
function getAdminSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey, {...});
}
```

---

### 6. **Inconsistent Use of Context User**

**Problem:** Some routers properly use `ctx.user`, others ignore it.

**Good Examples:**
- `mentorship.router.ts` - Mostly uses `ctx.user.id`
- `feedback.router.ts` - Uses `ctx.user.id`

**Bad Examples:**
- `auth.router.ts:getCurrentUser` - Ignores context user
- `auth.router.ts:updateProfile` - Creates new client
- `registrations.router.ts` - Multiple redundant `getUser()` calls

---

### 7. **Missing Null Checks**

**Problem:** Several places assume data exists without checks.

**Examples:**
- `events.router.ts:getById` - Returns data directly, might be null
- `auth.router.ts:getCurrentUser` - Returns `profile || null` but should check error first

---

### 8. **Inconsistent Query Error Handling**

**Problem:** Some queries check errors, others silently fail.

**Pattern to Follow:**
```typescript
const { data, error } = await supabase.from('table').select('*');

if (error) {
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: `Database error: ${error.message}`,
  });
}

return data || []; // Provide fallback
```

---

## 🟢 Low Priority / Improvements

### 9. **Missing Input Validation**

**Problem:** Some endpoints could benefit from stricter Zod validation.

**Examples:**
- UUID validation could be stricter
- String length limits
- Email format validation

---

### 10. **Performance: Multiple Database Calls**

**Problem:** Some endpoints make multiple sequential queries that could be optimized.

**Example:**
```typescript
// Current: 3 queries
const { data: eventData } = await supabase.from('events').select('*').single();
const { data: userData } = await supabase.auth.getUser();
const { data: userProfile } = await supabase.from('users').select('*').single();

// Could be: 2 queries (event + user with join)
```

---

### 11. **Missing Type Safety**

**Problem:** Some return types use `any` or loose typing.

**Examples:**
- `mentorship.router.ts` - Uses `as any` for mentor objects
- Multiple places use loose typing for Supabase responses

---

## 📋 Priority Action Items

### High Priority (Fix Immediately)

1. **Standardize Supabase Client Usage**
   - Use `ctx.supabase` in all protected/admin procedures
   - Remove redundant `getUser()` calls
   - Use `createAdminSupabase()` from lib (not local function)

2. **Fix Authentication Patterns**
   - Use `ctx.user` directly in protected procedures
   - Remove redundant auth checks

3. **Standardize Error Handling**
   - Use `TRPCError` consistently
   - Include proper error codes
   - Add error context where helpful

### Medium Priority (Next Sprint)

4. **Add Missing Error Checks**
   - Check all database query errors
   - Add null checks before using data
   - Handle edge cases properly

5. **Remove Code Duplication**
   - Consolidate admin client creation
   - Extract common patterns to utilities

### Low Priority (Future)

6. **Performance Optimization**
   - Batch database queries where possible
   - Add database indexes for common queries
   - Consider caching for read-heavy endpoints

7. **Type Safety Improvements**
   - Add proper TypeScript types
   - Remove `any` types
   - Use Supabase generated types

---

## 🔧 Recommended Refactoring Order

### Phase 1: Critical Fixes
1. Update `auth.router.ts` to use `ctx.supabase` and `ctx.user`
2. Update `events.router.ts` to use context clients
3. Update `registrations.router.ts` to use context

### Phase 2: Standardization
4. Standardize error handling across all routers
5. Remove duplicate admin client function
6. Add missing error checks

### Phase 3: Improvements
7. Optimize database queries
8. Improve type safety
9. Add comprehensive error handling

---

## 📝 Files Requiring Immediate Attention

### Critical
- `server/routers/auth.router.ts` - 5 issues
- `server/routers/events.router.ts` - 4 issues
- `server/routers/registrations.router.ts` - 4 issues

### Important
- `server/routers/competitions.router.ts` - 3 issues
- `server/routers/mentorship.router.ts` - 2 issues (mostly good but has local admin function)

### Low
- `server/routers/analytics.router.ts` - Minor improvements
- `server/routers/sponsors.router.ts` - Minor improvements

---

## ✅ Good Patterns Found

1. **Mentorship Router** - Mostly uses context properly
2. **Feedback Router** - Good use of `ctx.user`
3. **tRPC Setup** - Proper context structure
4. **Protected Procedures** - Good authentication middleware

---

## 🎯 Summary

**Total Issues Found:** 11 major inconsistencies  
**Critical:** 4  
**Medium:** 4  
**Low:** 3  

**Main Theme:** Inconsistent use of context (user + supabase client) and error handling patterns.

**Recommended Next Steps:**
1. Create refactoring checklist
2. Start with auth.router.ts (highest impact)
3. Create shared utility functions for common patterns
4. Document patterns for future development
