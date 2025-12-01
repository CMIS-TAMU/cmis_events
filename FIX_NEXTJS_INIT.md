# Fix Next.js Initialization - Directory Name Issue

The error occurs because `create-next-app` doesn't allow capital letters in the directory name when initializing in the current directory.

## Solution Options

### Option 1: Specify Project Name Explicitly (Recommended)

Since you already have files in this directory, specify a valid project name:

```bash
cd /Users/abhishekpatil/Documents/Projects/CMIS-Cursor

# Use a valid npm name (lowercase, no capitals)
npx create-next-app@latest . --typescript --tailwind --app --use-pnpm --no-src-dir --name cmis-event-management-system
```

Or if that doesn't work, create package.json first:

```bash
cd /Users/abhishekpatil/Documents/Projects/CMIS-Cursor

# Create package.json with valid name first
cat > package.json << 'EOF'
{
  "name": "cmis-event-management-system",
  "version": "0.1.0",
  "private": true
}
EOF

# Then initialize Next.js
npx create-next-app@latest . --typescript --tailwind --app --use-pnpm --no-src-dir
```

### Option 2: Initialize in a New Directory, Then Move

```bash
cd /Users/abhishekpatil/Documents/Projects

# Create Next.js app in a temp directory with valid name
npx create-next-app@latest cmis-events-temp --typescript --tailwind --app --use-pnpm

# Move contents to your project directory
cd cmis-events-temp
mv * ../CMIS-Cursor/
mv .* ../CMIS-Cursor/ 2>/dev/null || true

# Clean up
cd ..
rmdir cmis-events-temp
cd CMIS-Cursor
```

### Option 3: Use Custom Package Name in package.json

Manually create the Next.js setup:

```bash
cd /Users/abhishekpatil/Documents/Projects/CMIS-Cursor

# Create package.json with valid name
cat > package.json << 'EOF'
{
  "name": "cmis-event-management-system",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
EOF

# Install Next.js dependencies
pnpm add react react-dom next
pnpm add -D typescript @types/node @types/react @types/react-dom tailwindcss postcss autoprefixer eslint eslint-config-next
```

---

## Recommended: Option 1 with Explicit Name

Try this command:

```bash
cd /Users/abhishekpatil/Documents/Projects/CMIS-Cursor
npx create-next-app@latest . --typescript --tailwind --app --use-pnpm --no-src-dir
```

If it still complains, create package.json first with a valid name, then run create-next-app.

---

## What's Happening

`create-next-app` tries to use the directory name as the package name. Since "CMIS-Cursor" has capital letters, it violates npm naming rules. We need to either:

- Use a different directory name (not ideal since you have files)
- Specify a valid package name explicitly
- Create package.json first with a valid name

---

**Try Option 1 first - create package.json with a valid name, then run create-next-app!** 🚀
