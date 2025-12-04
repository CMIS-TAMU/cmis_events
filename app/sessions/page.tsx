'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, Clock, Users, ArrowRight, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/trpc';
import { toastUtil } from '@/lib/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

export default function MySessionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  const { data: mySessions, isLoading } = trpc.sessions.getMySessions.useQuery(
    undefined,
    { enabled: !!user }
  );

  const utils = trpc.useUtils();
  const cancelMutation = trpc.sessions.cancel.useMutation({
    onSuccess: () => {
      utils.sessions.getMySessions.invalidate();
      toastUtil.success('Session registration cancelled', 'You have successfully cancelled your session registration.');
    },
    onError: (error: any) => {
      toastUtil.error('Failed to cancel registration', error.message || 'Please try again.');
    },
  });

  const handleCancel = async (sessionId: string) => {
    // Using confirm dialog - can be replaced with custom dialog later
    if (confirm('Are you sure you want to cancel your registration for this session?')) {
      await cancelMutation.mutateAsync({ session_id: sessionId });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const upcomingSessions = mySessions?.filter((reg: any) => {
    const session = reg.event_sessions;
    return session && new Date(session.starts_at) > new Date();
  }) || [];

  const pastSessions = mySessions?.filter((reg: any) => {
    const session = reg.event_sessions;
    return session && new Date(session.starts_at) <= new Date();
  }) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Sessions</h1>
        <p className="text-muted-foreground">
          View and manage your registered sessions
        </p>
      </div>

      {/* Upcoming Sessions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Sessions</h2>
        {upcomingSessions.length === 0 ? (
          <Card className="p-12">
            <CardContent className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No Upcoming Sessions</CardTitle>
              <CardDescription>
                You haven&apos;t registered for any upcoming sessions yet.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingSessions.map((registration: any) => {
              const session = registration.event_sessions;
              const event = session?.events;
              const startDate = new Date(session.starts_at);
              const endDate = new Date(session.ends_at);

              return (
                <Card key={registration.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{session.title}</CardTitle>
                        {event && (
                          <CardDescription className="mt-1">
                            {event.title}
                          </CardDescription>
                        )}
                        {session.description && (
                          <CardDescription className="mt-2">
                            {session.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="default">Registered</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(startDate, 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {event && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/events/${event.id}`)}
                        >
                          View Event
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancel(session.id)}
                        disabled={cancelMutation.isPending}
                      >
                        Cancel Registration
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Past Sessions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pastSessions.map((registration: any) => {
              const session = registration.event_sessions;
              const event = session?.events;
              const startDate = new Date(session.starts_at);
              const endDate = new Date(session.ends_at);

              return (
                <Card key={registration.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{session.title}</CardTitle>
                        {event && (
                          <CardDescription className="mt-1">
                            {event.title}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(startDate, 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

