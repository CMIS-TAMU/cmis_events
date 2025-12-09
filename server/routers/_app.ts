import { router } from '../trpc';
import { authRouter } from './auth.router';
import { eventsRouter } from './events.router';
import { registrationsRouter } from './registrations.router';
import { resumesRouter } from './resumes.router';
import { sessionsRouter } from './sessions.router';
import { sponsorsRouter } from './sponsors.router';
import { competitionsRouter } from './competitions.router';
import { missionsRouter } from './missions.router';
import { feedbackRouter } from './feedback.router';
import { analyticsRouter } from './analytics.router';
import { mentorshipRouter } from './mentorship.router';
import { miniMentorshipRouter } from './mini-mentorship.router';
import { seatingRouter } from './seating.router';
import { newsletterRouter } from './newsletter.router';
import { communicationsRouter } from './communications.router';

// Main app router that combines all routers
export const appRouter = router({
  auth: authRouter,
  events: eventsRouter,
  registrations: registrationsRouter,
  resumes: resumesRouter,
  sessions: sessionsRouter,
  sponsors: sponsorsRouter,
  competitions: competitionsRouter,
  missions: missionsRouter,
  feedback: feedbackRouter,
  analytics: analyticsRouter,
  mentorship: mentorshipRouter,
  miniMentorship: miniMentorshipRouter,
  seating: seatingRouter,
  newsletter: newsletterRouter,
  communications: communicationsRouter,
});

// Export type for use in client
export type AppRouter = typeof appRouter;

