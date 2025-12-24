# API Key Setup Guide

This guide helps you set up API keys for semantic search embeddings.

## 🔑 Why You Need API Keys

The semantic search feature uses AI services (OpenAI or Google Gemini) to generate vector embeddings. You need at least one API key to enable this feature.

## 📝 Step 1: Get an API Key

### Option A: Google Gemini (Recommended - Free Tier Available)

1. **Sign up/Login:**
   - Go to https://platform.openai.com
   - Create an account or log in

2. **Get API Key:**
   - Navigate to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)
   - ⚠️ **Important:** Save it immediately - you won't be able to see it again!

3. **Add Credits:**
   - Go to: https://platform.openai.com/account/billing
   - Add payment method (required for API usage)
   - Note: Embeddings are relatively inexpensive (~$0.0001 per event)

### Option B: OpenAI (Paid Service)

## 🔧 Step 2: Add to .env.local

1. **Open `.env.local` file** in your project root
2. **Add your API key:**

   For Google Gemini (Recommended):
   ```env
   GOOGLE_AI_API_KEY=your-actual-gemini-key-here
   ```

   OR for OpenAI:
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Save the file**

## ✅ Step 3: Verify Setup

Run the diagnostic script:

```bash
pnpm check-api-keys
```

This will show:
- ✅ If keys are found and look valid
- ❌ If keys are missing or appear to be placeholders

## 🚀 Step 4: Test It

Try indexing events:

```bash
pnpm index-events
```

If successful, you'll see:
```
✅ Indexed: "Event Name"
```

## 🐛 Troubleshooting

### Error: "No embedding API keys found"

**Solution:**
- Check `.env.local` file exists
- Verify key name is exactly: `OPENAI_API_KEY` or `GOOGLE_AI_API_KEY`
- No spaces around the `=` sign
- Key is not wrapped in quotes (unless it contains special characters)

### Error: "Incorrect API key provided"

**Solution:**
- Verify the key is correct (copy-paste it again)
- For OpenAI: Key should start with `sk-`
- Check if you have API credits/quota available
- Regenerate the key if needed

### Error: "API key appears to be a placeholder"

**Solution:**
- Replace placeholder values like `your_openai_key` with your actual key
- Don't use example keys from documentation

### Key Not Loading from .env.local

**Solution:**
- Ensure `.env.local` is in the project root (same directory as `package.json`)
- Restart your terminal/IDE after adding keys
- For scripts: They should automatically load `.env.local` now (we added dotenv)

## 💰 Cost Estimates

### OpenAI Embeddings

- **Model:** `text-embedding-3-small` (recommended)
- **Cost:** ~$0.02 per 1M tokens
- **Typical event:** ~100-500 tokens = $0.00001 - $0.00005 per event
- **100 events:** ~$0.001 - $0.005

**Very affordable!** $1 can index thousands of events.

### Google Gemini

- **Free tier:** Available with usage limits
- **Pricing:** Check https://ai.google.dev/pricing

## 🔒 Security Best Practices

1. **Never commit `.env.local` to Git**
   - Already in `.gitignore` ✅

2. **Use separate keys for development/production**
   - Development: Personal API key
   - Production: Organization/billing key

3. **Set usage limits** in your API provider dashboard
   - Prevents unexpected charges

4. **Rotate keys periodically**
   - Especially if shared or exposed

## 📚 Additional Resources

- OpenAI API Docs: https://platform.openai.com/docs
- Google Gemini Docs: https://ai.google.dev/docs
- Embedding Models: https://platform.openai.com/docs/guides/embeddings

## ❓ Quick Check Commands

```bash
# Check if keys are configured
pnpm check-api-keys

# Index events (tests the keys)
pnpm index-events

# View .env.local location
ls -la .env.local
```

