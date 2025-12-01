import { router } from '../trpc';
import { authRouter } from './auth.router';
import { eventsRouter } from './events.router';
import { registrationsRouter } from './registrations.router';

// Main app router that combines all routers
export const appRouter = router({
  auth: authRouter,
  events: eventsRouter,
  registrations: registrationsRouter,
});

// Export type for use in client
export type AppRouter = typeof appRouter;

