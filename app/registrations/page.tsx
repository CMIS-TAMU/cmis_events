'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, Clock as ClockIcon } from 'lucide-react';
import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CancelButton } from '@/components/registrations/cancel-button';

interface Event {
  id: string;
  title: string;
  description?: string;
  starts_at: string;
  ends_at?: string;
  capacity: number;
  image_url?: string;
}

interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  registered_at: string;
  events: Event;
}

export default function MyRegistrationsPage() {
  const { data: registrations, isLoading, error, refetch } = trpc.registrations.getMyRegistrations.useQuery();

  const handleCancel = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading your registrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <CardContent>
            <p className="text-destructive">Error loading registrations: {error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeRegistrations = registrations?.filter(
    (reg: Registration) => reg.status === 'registered'
  ) || [];
  const cancelledRegistrations = registrations?.filter(
    (reg: Registration) => reg.status === 'cancelled'
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Registrations</h1>
        <p className="text-muted-foreground">
          Manage your event registrations and view your event history
        </p>
      </div>

      {/* Active Registrations */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Active Registrations</h2>
        {activeRegistrations.length === 0 ? (
          <Card className="p-12">
            <CardContent className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No Active Registrations</CardTitle>
              <CardDescription>
                You haven&apos;t registered for any events yet. Browse events to get started!
              </CardDescription>
              <Link href="/events" className="mt-4 inline-block">
                <Button>Browse Events</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeRegistrations.map((registration: Registration) => {
              const event = registration.events;
              const startDate = new Date(event.starts_at);
              const endDate = event.ends_at ? new Date(event.ends_at) : null;
              const isUpcoming = startDate > new Date();

              return (
                <Card key={registration.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
                      <Badge variant={isUpcoming ? 'default' : 'secondary'}>
                        {isUpcoming ? 'Upcoming' : 'Past'}
                      </Badge>
                    </div>
                    {event.description && (
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(startDate, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(startDate, 'h:mm a')}
                        {endDate && ` - ${format(endDate, 'h:mm a')}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Registered on {format(new Date(registration.registered_at), 'MMM d, yyyy')}</span>
                    </div>
                  </CardContent>
                  <CardContent className="pt-0 space-y-2">
                    <Link href={`/events/${event.id}`} className="block">
                      <Button variant="outline" className="w-full">
                        View Event
                      </Button>
                    </Link>
                    {isUpcoming && (
                      <CancelButton
                        eventId={event.id}
                        eventTitle={event.title}
                        onCancel={handleCancel}
                        variant="outline"
                        size="default"
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Cancelled Registrations */}
      {cancelledRegistrations.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Cancelled Registrations</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cancelledRegistrations.map((registration: Registration) => {
              const event = registration.events;
              const startDate = new Date(event.starts_at);

              return (
                <Card key={registration.id} className="opacity-60">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
                      <Badge variant="secondary">Cancelled</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(startDate, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Cancelled on {format(new Date(registration.registered_at), 'MMM d, yyyy')}</span>
                    </div>
                  </CardContent>
                  <CardContent className="pt-0">
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" className="w-full">
                        View Event
                      </Button>
                    </Link>
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

