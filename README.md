# CMIS Event Management System

[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

> A comprehensive, enterprise-grade event management platform for the Center for Management Information Systems (CMIS) at Texas A&M University.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

---

## 🎯 Overview

The CMIS Event Management System is a modern, full-stack web application designed to streamline event registration, attendance tracking, resume management, and sponsor-student interactions for CMIS events. Built with enterprise-grade practices, it replaces manual processes with intelligent automation, providing a seamless experience for students, faculty, sponsors, and administrators.

### Business Value

- **Zero Manual Processes**: Fully automated workflows from registration to check-in
- **Role-Based Access Control**: Secure, personalized experiences for each user type
- **Real-Time Analytics**: Comprehensive dashboards and reporting
- **Mobile-First Design**: Responsive UI works seamlessly on all devices
- **Scalable Architecture**: Built to handle growth and high traffic

### Repository Information

- **Organization**: [CMIS-TAMU](https://github.com/CMIS-TAMU)
- **Repository**: [cmis_events](https://github.com/CMIS-TAMU/cmis_events)
- **Primary Branch**: `main`
- **Development Branch**: `develop`

---

## ✨ Key Features

### 🔐 Authentication & User Management
- Multi-role signup (Student, Faculty, Sponsor, Admin)
- Secure email/password authentication
- Password reset and recovery
- Profile management with role-based onboarding
- Session management and security

### 📅 Event Management
- Event creation and editing with rich content
- Multi-session event support
- Capacity management with waitlist
- QR code generation for registrations
- Real-time attendance tracking
- Event analytics and reporting

### 👥 Registration System
- One-click event registration
- Automatic waitlist management
- Registration cancellation
- Email confirmations and notifications
- Registration history and tracking

### 💼 Resume Management
- PDF resume upload and storage
- Resume versioning
- Sponsor resume search and filtering
- Resume analytics (views, downloads)
- Bulk resume export

### 🤝 Mentorship System
- Automated mentor-student matching
- Mentor recommendation engine
- Request management and tracking
- Post-match communication tools
- Mentorship analytics

### 🏢 Sponsor Portal
- Tiered access system (Basic, Standard, Premium)
- Student resume browsing and search
- Custom notification preferences
- Engagement analytics dashboard
- Candidate shortlisting

### 🤖 AI-Powered Features
- Intelligent chatbot for event support
- Automated mentor recommendations
- Smart event suggestions
- Natural language query processing

### 📧 Communication System
- Automated email workflows
- Template-based notifications
- Real-time and batched notifications
- Email analytics and tracking
- Multi-channel communication preferences

### 📊 Analytics & Reporting
- Real-time dashboards for all roles
- Event attendance analytics
- User engagement metrics
- Sponsor engagement tracking
- Export capabilities (CSV, PDF)

---

## 🛠 Technology Stack

### Frontend
- **Framework**: [Next.js 16.0.7](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5.0](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **API Client**: [tRPC](https://trpc.io/)

### Backend
- **Runtime**: Node.js 20+
- **API Framework**: tRPC (Type-safe APIs)
- **Database**: PostgreSQL (via [Supabase](https://supabase.com/))
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Caching**: [Upstash Redis](https://upstash.com/)

### Infrastructure & Services
- **Hosting**: [Vercel](https://vercel.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Email Service**: [Resend](https://resend.com/)
- **Error Tracking**: [Sentry](https://sentry.io/)
- **AI Services**: OpenAI / Google Gemini

### Development Tools
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Linting**: ESLint 9 (Flat Config)
- **Formatting**: Prettier
- **Version Control**: Git + GitHub

---

## 🏗 Architecture

### Project Structure

```
cmis_events/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── admin/           # Admin dashboard
│   │   ├── student/         # Student dashboard
│   │   ├── sponsor/         # Sponsor dashboard
│   │   └── faculty/         # Faculty dashboard
│   ├── api/                 # API routes
│   │   ├── cron/            # Scheduled jobs
│   │   └── email/           # Email endpoints
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # Reusable UI components (shadcn)
│   ├── features/           # Feature-specific components
│   └── forms/              # Form components
├── lib/                     # Utilities and configurations
│   ├── supabase/           # Supabase client setup
│   ├── trpc/               # tRPC configuration
│   ├── communications/     # Email and notification services
│   └── utils/              # Helper functions
├── server/                  # Server-side code
│   ├── routers/            # tRPC routers
│   └── middleware/        # Auth & validation
├── database/               # Database scripts
│   ├── schema.sql         # Database schema
│   └── migrations/        # Database migrations
└── public/                 # Static assets
```

### Key Architectural Decisions

1. **Type-Safe APIs**: tRPC ensures end-to-end type safety between client and server
2. **Server Components**: Leveraging Next.js App Router for optimal performance
3. **Role-Based Access Control**: Middleware-based RBAC for security
4. **Database-First**: PostgreSQL with Supabase for reliability and scalability
5. **Component-Driven**: Reusable UI components for consistency

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 LTS or higher
- **pnpm**: Latest version
- **Git**: For version control
- **Supabase Account**: For database and auth
- **Vercel Account**: For deployment (optional, for local dev)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CMIS-TAMU/cmis_events.git
   cd cmis_events
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your service credentials:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Email (Resend)
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   
   # Redis (Upstash)
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   
   # AI Services (Optional)
   OPENAI_API_KEY=your_openai_key
   # OR
   GOOGLE_AI_API_KEY=your_google_ai_key
   
   # Sentry (Optional)
   SENTRY_AUTH_TOKEN=your_sentry_token
   ```

4. **Set up the database:**
   - Run migrations from `database/migrations/` in Supabase SQL Editor
   - Create storage buckets: `resumes` (private) and `event-images` (public)

5. **Start the development server:**
   ```bash
   pnpm dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Quick Verification

After installation, verify everything works:

```bash
# Check if server is running
curl http://localhost:3000/api/health

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

---

## 💻 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server (localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript type checking
```

### Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Follow TypeScript strict mode
   - Use ESLint and Prettier
   - Write descriptive commit messages

3. **Test your changes:**
   ```bash
   pnpm lint
   pnpm type-check
   pnpm build
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request:**
   - Target: `develop` branch
   - Include description of changes
   - Link any related issues

### Code Quality Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Next.js recommended rules + custom rules
- **Prettier**: Consistent code formatting
- **Git**: Conventional commit messages
- **Testing**: Manual testing required before PR

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature development branches
- `fix/*`: Bug fix branches
- `hotfix/*`: Critical production fixes

---

## 🚢 Deployment

### Environments

- **Development**: Local (`localhost:3000`)
- **Staging**: Vercel Preview (auto-deploy from `develop` branch)
- **Production**: Vercel Production (deploy from `main` branch)

### Deployment Process

1. **Push to `develop` branch:**
   - Automatically deploys to staging
   - Preview URL generated

2. **Test on staging:**
   - Verify all features work
   - Check for errors in Sentry

3. **Create PR to `main`:**
   - Code review required
   - All checks must pass

4. **Merge to `main`:**
   - Automatically deploys to production
   - Production URL: [https://cmis-events.vercel.app](https://cmis-events.vercel.app)

### Environment Variables

Ensure all environment variables are set in Vercel:
- Supabase credentials
- Resend API key
- Redis credentials
- AI service keys (if used)
- Sentry token (if used)

### Database Migrations

Run migrations in Supabase SQL Editor before deploying:
1. Copy migration SQL from `database/migrations/`
2. Paste into Supabase SQL Editor
3. Run and verify

---

## 📚 Documentation

### Essential Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**: Complete installation and configuration guide
- **[DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)**: Project timeline and milestones
- **[COMPLETE_FEATURES_DOCUMENTATION.md](./COMPLETE_FEATURES_DOCUMENTATION.md)**: Comprehensive feature list and improvements
- **[DEMO_PRESENTATION_SCRIPT.md](./DEMO_PRESENTATION_SCRIPT.md)**: Demo presentation guide
- **[DEMO_QUICK_REFERENCE.md](./DEMO_QUICK_REFERENCE.md)**: Quick reference for demos
- **[ARCHITECTURE_QUICK_REFERENCE.md](./ARCHITECTURE_QUICK_REFERENCE.md)**: System architecture overview
- **[TECH_DEBT.md](./TECH_DEBT.md)**: Known technical debt and future improvements

### Module-Specific Documentation

- **[lib/email/README.md](./lib/email/README.md)**: Email service integration guide
- **[public/images/logos/README.md](./public/images/logos/README.md)**: Logo usage guidelines

### Additional Resources

- **Environment Variables**: See `.env.example` for all required variables
- **Database Schema**: See `database/schema.sql`
- **API Documentation**: tRPC routers in `server/routers/`

---

## 👥 User Roles

### Student
- Register for events
- Upload and manage resume
- View event registrations
- Request mentorship
- Access AI chatbot

### Faculty
- Create and manage events
- Manage event sessions
- View event analytics
- Manage case competitions
- Access student profiles

### Sponsor
- Browse student resumes
- Search and filter candidates
- View event attendance
- Manage notification preferences
- Access engagement analytics
- Shortlist candidates

### Admin
- Full system access
- User management
- System configuration
- Comprehensive reporting
- Database management

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Contribution Process

1. **Fork the repository**
2. **Create a feature branch** from `develop`
3. **Make your changes** following code quality standards
4. **Test thoroughly** before submitting
5. **Create a Pull Request** with clear description

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write descriptive commit messages
- Add comments for complex logic
- Follow existing code patterns

### Pull Request Guidelines

- Clear title and description
- Link related issues
- Include screenshots for UI changes
- Ensure all checks pass
- Request review from maintainers

---

## 🆘 Support

### Getting Help

- **Documentation**: Check the [Documentation](#documentation) section
- **GitHub Issues**: Open an issue for bugs or feature requests
- **Team Contact**: Reach out to the development team

### Common Issues

- **Build Errors**: Check Node.js version (v20+), run `pnpm install` again
- **Database Errors**: Verify Supabase credentials and migrations
- **Email Not Sending**: Check Resend API key and domain verification
- **Authentication Issues**: Verify Supabase Auth configuration

### Reporting Bugs

When reporting bugs, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, browser)
- Error messages or screenshots

---

## 📝 License

This project is proprietary software for Texas A&M University Center for Management Information Systems (CMIS). All rights reserved.

---

## 🙏 Acknowledgments

- **Built for**: Center for Management Information Systems (CMIS)
- **Institution**: Texas A&M University
- **Thanks to**: All contributors and the open-source community

---

## 📊 Project Status

**Current Version**: 0.1.0  
**Status**: ✅ Production Ready  
**Last Updated**: December 2024

### Completed Features
- ✅ Authentication & User Management
- ✅ Event Management System
- ✅ Registration & Waitlist
- ✅ Resume Management
- ✅ Mentorship System
- ✅ Sponsor Portal
- ✅ AI Chatbot
- ✅ Email Notifications
- ✅ Analytics Dashboards

### In Progress
- 🔄 Performance optimizations
- 🔄 Additional AI features
- 🔄 Enhanced analytics

---

**Built with ❤️ by the CMIS Development Team**

For questions or support, please open a [GitHub Issue](https://github.com/CMIS-TAMU/cmis_events/issues).
