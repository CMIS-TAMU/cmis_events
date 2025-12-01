# Environment Variables Template

Copy the content below into a file named `.env.local` in your project root.

**Important:** Never commit `.env.local` to version control!

```bash
# ============================================
# CMIS Event Management System
# Environment Variables
# ============================================

# ============================================
# Supabase Configuration
# ============================================
# Get these from: https://supabase.com/dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database connection string (optional, for direct DB access)
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# ============================================
# N8N Automation (Railway)
# ============================================
# Webhook URL from your N8N instance deployed on Railway
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.railway.app
N8N_WEBHOOK_SECRET=generate_a_random_secret_string_here

# ============================================
# Redis (Upstash)
# ============================================
# Get these from: https://console.upstash.com/
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here

# ============================================
# Email Service (Resend)
# ============================================
# Get API key from: https://resend.com/api-keys
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# ============================================
# AI Services (Choose one or both)
# ============================================
# OpenAI: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your_openai_api_key_here

# OR Google AI (Gemini): https://aistudio.google.com/app/apikey
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# ============================================
# Cloudinary (Image Storage)
# ============================================
# Get from: https://console.cloudinary.com/console
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ============================================
# Sentry (Error Tracking)
# ============================================
# Get from: https://sentry.io/ → Project Settings → Client Keys (DSN)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here

# ============================================
# Application Configuration
# ============================================
# App URL (development: localhost, production: your domain)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development

# ============================================
# Security Secrets
# ============================================
# Generate random strings for production!
# You can generate with: openssl rand -base64 32
JWT_SECRET=generate_a_random_string_here_min_32_chars
ENCRYPTION_KEY=generate_a_random_32_character_string_here

# QR Code secret for generating secure QR codes
QR_CODE_SECRET=generate_another_random_string_here

# ============================================
# Optional: Analytics & Monitoring
# ============================================
# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# PostHog (optional alternative)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# ============================================
# Development/Testing (Optional)
# ============================================
# Set to 'true' to enable debug logging
DEBUG=false

# Test mode (disables real emails, etc.)
TEST_MODE=false
```

## How to Use This Template

1. **Create the file:**
   ```bash
   touch .env.local
   ```

2. **Copy this template** into `.env.local`

3. **Fill in your actual values:**
   - Replace all `your_*` placeholders with real values
   - Generate secrets for security keys
   - Get API keys from service dashboards

4. **Verify:**
   - Check that `.env.local` is in `.gitignore`
   - Never commit this file to Git!

## Getting API Keys

See [SETUP_GUIDE.md](./SETUP_GUIDE.md#service-configuration) for detailed instructions on obtaining each API key.

## Security Notes

- All `NEXT_PUBLIC_*` variables are exposed to the browser
- Keep `SUPABASE_SERVICE_ROLE_KEY` and other secrets secure
- Use different keys for development and production
- Rotate secrets regularly in production

## Minimum for Development

To get started quickly, you only need:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
NODE_ENV=development
```

Add other services as you need them.

