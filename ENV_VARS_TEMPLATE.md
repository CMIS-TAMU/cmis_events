# Environment Variables for Vercel Deployment

Copy these variables and set them in Vercel Dashboard → Settings → Environment Variables

## 🔴 REQUIRED Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## 🟡 HIGHLY RECOMMENDED

```
OPENAI_API_KEY=sk-xxxxx
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

## 🔐 SECURITY (Generate Random Strings)

Use these commands to generate:
```bash
openssl rand -hex 16  # For JWT_SECRET, ENCRYPTION_KEY
openssl rand -hex 8   # For others
```

```
JWT_SECRET=<generate_32_char_string>
ENCRYPTION_KEY=<generate_32_char_string>
QR_CODE_SECRET=<generate_random_string>
CRON_SECRET=<generate_random_string>
QUEUE_PROCESSOR_TOKEN=<generate_random_string>
```

## 🟢 OPTIONAL

```
SENTRY_AUTH_TOKEN=xxxxx
SENTRY_DSN=xxxxx
AI_PROVIDER=openai
AI_CHAT_MODEL=gpt-3.5-turbo
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Note**: Set `NEXT_PUBLIC_APP_URL` AFTER first deployment with your actual Vercel URL!

