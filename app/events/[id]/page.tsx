'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, Clock, Users, MapPin, ArrowLeft, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { RegisterButton } from '@/components/registrations/register-button';
import { CancelButton } from '@/components/registrations/cancel-button';
import { SessionCard } from '@/components/sessions/session-card';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Get user role from database
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(profile?.role || 'user');
      }
    }
    getUser();
  }, []);

  const { data: event, isLoading, error } = trpc.events.getById.useQuery(
    { id: eventId },
    { enabled: !!eventId }
  );

  const { data: registrationStatus } = trpc.registrations.getStatus.useQuery(
    { event_id: eventId },
    { enabled: !!eventId && !!user }
  );

  const { data: waitlistStatus } = trpc.registrations.getWaitlistStatus.useQuery(
    { event_id: eventId },
    { enabled: !!eventId && !!user }
  );

  const { data: sessions } = trpc.sessions.getByEvent.useQuery(
    { event_id: eventId },
    { enabled: !!eventId }
  );

  const deleteMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      router.push('/events');
    },
  });

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate({ id: eventId });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <CardContent>
            <p className="text-destructive">
              {error?.message || 'Event not found'}
            </p>
            <Button onClick={() => router.push('/events')} className="mt-4">
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;
  const isUpcoming = startDate > new Date();
  const isPast = endDate ? endDate < new Date() : startDate < new Date();

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {event.image_url ? (
            <div className="relative h-96 w-full rounded-lg overflow-hidden">
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="h-96 w-full rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Calendar className="h-24 w-24 text-primary/30" />
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    {isUpcoming && (
                      <Badge variant="default">Upcoming</Badge>
                    )}
                    {isPast && (
                      <Badge variant="secondary">Past Event</Badge>
                    )}
                  </div>
                </div>
                {userRole === 'admin' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/events/${eventId}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(startDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">
                    {format(startDate, 'h:mm a')}
                    {endDate && ` - ${format(endDate, 'h:mm a')}`}
                  </p>
                </div>
              </div>

              {event.capacity > 0 && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-sm text-muted-foreground">
                      {event.capacity} attendees
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isUpcoming && user && (
            <Card id="register">
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {registrationStatus && registrationStatus.status === 'registered' ? (
                  <>
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">You are registered for this event</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Registered on {format(new Date(registrationStatus.registered_at), 'MMM d, yyyy')}
                    </p>
                    <CancelButton
                      eventId={eventId}
                      eventTitle={event.title}
                      variant="outline"
                      size="default"
                    />
                  </>
                ) : waitlistStatus ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-yellow-600 mb-2">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">You&apos;re on the waitlist</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Position: <strong>#{waitlistStatus.position}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You&apos;ll be automatically registered if a spot opens up. We&apos;ll notify you by email.
                    </p>
                  </div>
                ) : (
                  <RegisterButton
                    eventId={eventId}
                    eventTitle={event.title}
                    className="w-full"
                  />
                )}
              </CardContent>
            </Card>
          )}

          {!user && isUpcoming && (
            <Card>
              <CardHeader>
                <CardTitle>Register</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in to register for this event
                </p>
                <Button
                  className="w-full"
                  onClick={() => router.push(`/login?redirect=/events/${eventId}`)}
                >
                  Sign In to Register
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Sessions Section */}
      {sessions && sessions.length > 0 && (
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Event Sessions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.map((session: any) => (
              <SessionCardWithActions
                key={session.id}
                session={session}
                eventId={eventId}
                userId={user?.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Component to handle session card with dynamic actions
function SessionCardWithActions({ session, eventId, userId }: { session: any; eventId: string; userId?: string }) {
  const utils = trpc.useUtils();
  const { data: registrationStatus } = trpc.sessions.getRegistrationStatus.useQuery(
    { session_id: session.id },
    { enabled: !!userId }
  );
  const { data: capacity } = trpc.sessions.getCapacity.useQuery(
    { session_id: session.id },
    { enabled: !!session.id }
  );

  const registerMutation = trpc.sessions.register.useMutation({
    onSuccess: () => {
      utils.sessions.getRegistrationStatus.invalidate({ session_id: session.id });
      utils.sessions.getCapacity.invalidate({ session_id: session.id });
    },
  });

  const cancelMutation = trpc.sessions.cancel.useMutation({
    onSuccess: () => {
      utils.sessions.getRegistrationStatus.invalidate({ session_id: session.id });
      utils.sessions.getCapacity.invalidate({ session_id: session.id });
    },
  });

  const handleRegister = () => {
    if (confirm('Register for this session?')) {
      registerMutation.mutate({ session_id: session.id });
    }
  };

  const handleCancel = () => {
    if (confirm('Cancel your registration for this session?')) {
      cancelMutation.mutate({ session_id: session.id });
    }
  };

  const remaining = capacity && typeof capacity === 'object' && 'remaining' in capacity
    ? capacity.remaining as number
    : undefined;

  return (
    <SessionCard
      session={session}
      registered={!!registrationStatus}
      remaining={remaining}
      onRegister={handleRegister}
      onCancel={handleCancel}
      showActions={!!userId}
    />
  );
}

