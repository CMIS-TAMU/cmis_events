# ✅ Verify Brevo Environment Variables

Since you've already added the variables to `.env.local` (lines 47-55), let's check a few things:

## Common Issues:

### 1. **Server Not Restarted** ⚠️ MOST COMMON
Environment variables only load when the server starts. If you added them while the server was running, they won't be loaded.

**Fix**: 
- Stop the dev server (Ctrl+C)
- Start it again: `pnpm dev`

### 2. **Variable Name Typos**
Check that your `.env.local` has EXACTLY these names (case-sensitive, no spaces):

```env
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_value_here
BREVO_SMTP_KEY=your_value_here
BREVO_FROM_EMAIL=your_value_here
BREVO_FROM_NAME=CMIS Events
```

**Common mistakes:**
- ❌ `BREVO_FROM_EMAIL = value` (spaces around =)
- ❌ `# BREVO_FROM_EMAIL=value` (commented out)
- ❌ `BREVO_FROM_EMAIL="value"` (quotes might cause issues)
- ❌ `brevo_from_email=value` (wrong case)

### 3. **Check Your .env.local Format**

Your lines 47-55 should look like this (no quotes, no spaces):

```env
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=actual_email@example.com
BREVO_SMTP_KEY=actual_key_here
BREVO_FROM_EMAIL=actual_email@example.com
BREVO_FROM_NAME=CMIS Events
```

### 4. **Verify in Next.js**

After restarting, you can check if Next.js sees the variables by temporarily adding this to any API route:

```typescript
console.log('BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL ? 'SET' : 'NOT SET');
```

## Quick Test:

1. **Stop your dev server** (if running)
2. **Verify .env.local** has the 6 Brevo variables (lines 47-55)
3. **Start dev server**: `pnpm dev`
4. **Test**: Create an event or use `/api/test-brevo`

If it still doesn't work after restarting, share what you see in lines 47-55 (you can mask the actual values) and I'll help debug further.


