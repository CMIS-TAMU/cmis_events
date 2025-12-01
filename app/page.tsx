'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ArrowRight } from 'lucide-react';
import { EventCard } from '@/components/events/event-card';
import { trpc } from '@/lib/trpc/trpc';

export default function Home() {
  const { data: upcomingEvents, isLoading } = trpc.events.getAll.useQuery({
    limit: 3,
    upcoming: true,
  });

  return (
    <main className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">
          CMIS Event Management System
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover and register for events at the Center for Management and Information Systems
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/events">
            <Button size="lg">
              Browse All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Upcoming Events</h2>
            <p className="text-muted-foreground">
              Don&apos;t miss out on these exciting events
            </p>
          </div>
          <Link href="/events">
            <Button variant="outline">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        )}

        {!isLoading && upcomingEvents && upcomingEvents.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!isLoading && (!upcomingEvents || upcomingEvents.length === 0) && (
          <Card className="p-12">
            <CardContent className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No Upcoming Events</CardTitle>
              <CardDescription>
                Check back later for new events
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Quick Links */}
      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Browse Events</CardTitle>
            <CardDescription>
              Explore all available events and find something that interests you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/events">
              <Button variant="outline" className="w-full">
                View Events
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Dashboard</CardTitle>
            <CardDescription>
              Manage your registrations and view your event history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create an account to register for events and access exclusive features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/signup">
              <Button variant="outline" className="w-full">
                Sign Up
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
