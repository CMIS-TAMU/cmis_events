# Fix pnpm Installation Permission Error

You're getting a permission error when trying to install pnpm globally. Here are several solutions:

## Solution 1: Use Corepack (Recommended - Built into Node.js)

Node.js 16.9+ includes Corepack which manages package managers. This is the cleanest method:

```bash
# Enable corepack
corepack enable

# Install pnpm (or it will be installed automatically when needed)
corepack prepare pnpm@latest --activate

# Verify
pnpm --version
```

**No sudo needed!** ✅

---

## Solution 2: Use sudo (Quick but not ideal)

If you need it immediately:

```bash
sudo npm install -g pnpm
```

Then verify:

```bash
pnpm --version
```

**Note:** Using sudo can cause permission issues later. Consider Solution 1 or 3.

---

## Solution 3: Fix npm Permissions (Better long-term)

Create a directory for global npm packages in your home directory:

```bash
# Create directory for global packages
mkdir -p ~/.npm-global

# Configure npm to use the new directory
npm config set prefix '~/.npm-global'

# Add to your PATH (add this line to ~/.zshrc)
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc

# Reload your shell
source ~/.zshrc

# Now install pnpm without sudo
npm install -g pnpm

# Verify
pnpm --version
```

---

## Solution 4: Install via Homebrew (macOS)

If you have Homebrew installed:

```bash
brew install pnpm
```

Or use Homebrew to install Node.js with better permissions setup:

```bash
brew install node
# Then use corepack (Solution 1)
```

---

## Solution 5: Use npx (No installation needed)

You don't actually need to install pnpm globally. You can use npx:

```bash
# Use pnpm via npx (installs temporarily when needed)
npx pnpm@latest --version

# Or create an alias in ~/.zshrc
echo 'alias pnpm="npx pnpm@latest"' >> ~/.zshrc
source ~/.zshrc
```

---

## Recommended: Use Corepack (Solution 1)

Corepack is the modern way to manage package managers. It's built into Node.js and doesn't require sudo:

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm --version
```

---

## Verify Installation

After using any method above:

```bash
pnpm --version
```

Should show: `8.x.x` or higher

---

**Which solution would you like to use?** I recommend **Solution 1 (Corepack)** - it's the cleanest and doesn't require sudo! 🚀
