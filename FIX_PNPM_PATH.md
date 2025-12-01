# Fix pnpm Command Not Found

## Quick Fix for Current Terminal Session

Run this command to add pnpm to your PATH:

```bash
export PATH=~/.npm-global/bin:$PATH
```

Then verify:

```bash
pnpm --version
```

## Permanent Fix

### For Zsh (default on macOS):

Add this line to your `~/.zshrc` file (it should already be there from the installation):

```bash
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### For Bash:

Add this line to your `~/.bashrc` or `~/.bash_profile`:

```bash
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

## Verify Installation

After adding to PATH:

```bash
pnpm --version
# Should show: 10.24.0
```

## Alternative: Use Full Path

If you don't want to modify PATH, you can use the full path:

```bash
~/.npm-global/bin/pnpm add <package-name>
```

## Quick Command to Run Now

```bash
export PATH=~/.npm-global/bin:$PATH && pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
```

---

**The PATH is now set for this session. You can run pnpm commands!** ✅
