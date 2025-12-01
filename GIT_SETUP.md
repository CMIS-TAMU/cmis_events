# Git Repository Setup

Instructions for connecting your local project to the GitHub repository.

## Repository Information

- **GitHub URL:** https://github.com/CMIS-TAMU/cmis-event-management-system
- **Organization:** CMIS-TAMU
- **Repository Name:** cmis-event-management-system

## Initial Setup

If you're starting fresh and need to connect this local directory to the GitHub repository:

### Option 1: Clone the Repository (Recommended for New Setup)

```bash
# Navigate to your projects directory
cd ~/Documents/Projects

# Clone the repository
git clone https://github.com/CMIS-TAMU/cmis-event-management-system.git
cd cmis-event-management-system

# The repository is now cloned with all documentation
```

### Option 2: Connect Existing Local Directory

If you already have a local directory with files (like this one):

```bash
# Navigate to your project directory
cd ~/Documents/Projects/CMIS-Cursor  # or wherever your project is

# Initialize git if not already done
git init

# Add the remote repository
git remote add origin https://github.com/CMIS-TAMU/cmis-event-management-system.git

# Verify the remote
git remote -v
# Should show:
# origin  https://github.com/CMIS-TAMU/cmis-event-management-system.git (fetch)
# origin  https://github.com/CMIS-TAMU/cmis-event-management-system.git (push)

# Create .gitignore if it doesn't exist
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Environment variables
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Sentry
.sentryclirc
EOF

# Add all files
git add .

# Create initial commit
git commit -m "docs: Add complete setup and documentation"

# Push to main branch (if empty repository)
git branch -M main
git push -u origin main
```

## Branch Strategy

The project uses the following branch strategy:

- **`main`** - Production-ready code
- **`develop`** - Integration branch for features
- **`feature/*`** - Feature development branches
- **`fix/*`** - Bug fix branches

### Setting Up Branch Protection (One-time setup on GitHub)

1. Go to repository settings: https://github.com/CMIS-TAMU/cmis-event-management-system/settings
2. Navigate to "Branches"
3. Add rule for `main` branch:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings

4. Add rule for `develop` branch:
   - ✅ Require pull request reviews before merging (optional)
   - ✅ Require status checks to pass

## Daily Workflow

### Creating a Feature Branch

```bash
# Make sure you're on develop and up to date
git checkout develop
git pull origin develop

# Create and switch to new feature branch
git checkout -b feature/event-registration

# Work on your feature, make commits
git add .
git commit -m "feat: add event registration form"

# Push to remote
git push origin feature/event-registration
```

### Creating a Pull Request

1. Push your feature branch to GitHub
2. Go to: https://github.com/CMIS-TAMU/cmis-event-management-system
3. Click "Compare & pull request"
4. Fill in PR description
5. Request review from team members
6. Wait for approval and CI checks
7. Merge to `develop`

### Syncing with Remote

```bash
# Fetch latest changes
git fetch origin

# Merge remote changes
git pull origin develop

# Or rebase (if preferred)
git pull --rebase origin develop
```

## First-Time Contributor Setup

If you're a new team member:

```bash
# Clone the repository
git clone https://github.com/CMIS-TAMU/cmis-event-management-system.git
cd cmis-event-management-system

# Install dependencies
pnpm install

# Create your feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

## Commit Message Guidelines

Follow conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve registration duplicate issue"
git commit -m "docs: update setup guide"
git commit -m "refactor: improve event query performance"
```

## Troubleshooting

### Remote Already Exists

If you get "remote origin already exists" error:

```bash
# Check current remote
git remote -v

# Remove existing remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/CMIS-TAMU/cmis-event-management-system.git
```

### Authentication Issues

If you get authentication errors:

```bash
# Use personal access token instead of password
# Generate token: https://github.com/settings/tokens

# Or use SSH instead
git remote set-url origin git@github.com:CMIS-TAMU/cmis-event-management-system.git
```

### Merge Conflicts

```bash
# Pull latest changes
git pull origin develop

# Resolve conflicts in your editor
# Stage resolved files
git add .

# Complete merge
git commit -m "merge: resolve conflicts with develop"
```

## Team Collaboration

### Adding Team Members

1. Go to repository settings
2. Navigate to "Collaborators" or "Manage access"
3. Add team members with appropriate permissions

### Code Review Process

1. Create PR with clear description
2. Assign reviewers
3. Address feedback
4. Once approved, merge (squash merge recommended)

## Useful Commands

```bash
# Check status
git status

# View commit history
git log --oneline --graph

# View branches
git branch -a

# Switch branch
git checkout branch-name

# Create and switch
git checkout -b new-branch

# Stash changes
git stash
git stash pop

# View remote
git remote -v

# Fetch without merging
git fetch origin

# View differences
git diff
```

---

**Need help?** Check the [Setup Guide](./SETUP_GUIDE.md) or contact the team.

