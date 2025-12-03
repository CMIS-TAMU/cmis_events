import { router } from '../trpc';
import { authRouter } from './auth.router';
import { eventsRouter } from './events.router';
import { registrationsRouter } from './registrations.router';
import { resumesRouter } from './resumes.router';
import { sessionsRouter } from './sessions.router';
import { sponsorsRouter } from './sponsors.router';
import { competitionsRouter } from './competitions.router';
import { feedbackRouter } from './feedback.router';
import { analyticsRouter } from './analytics.router';
import { mentorshipRouter } from './mentorship.router';
import { seatingRouter } from './seating.router';

// Main app router that combines all routers
export const appRouter = router({
  auth: authRouter,
  events: eventsRouter,
  registrations: registrationsRouter,
  resumes: resumesRouter,
  sessions: sessionsRouter,
  sponsors: sponsorsRouter,
  competitions: competitionsRouter,
  feedback: feedbackRouter,
  analytics: analyticsRouter,
  mentorship: mentorshipRouter,
  seating: seatingRouter,
});

// Export type for use in client
export type AppRouter = typeof appRouter;

