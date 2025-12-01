'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/trpc';
import { EventCard } from '@/components/events/event-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Calendar as CalendarIcon } from 'lucide-react';

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 12;

  const { data: events, isLoading, error, refetch } = trpc.events.getAll.useQuery({
    limit,
    offset: page * limit,
    upcoming: showUpcomingOnly || undefined,
  });

  // Filter events by search query on client side
  const filteredEvents = events?.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Events</h1>
        <p className="text-muted-foreground">
          Discover and register for upcoming CMIS events
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showUpcomingOnly ? 'default' : 'outline'}
            onClick={() => {
              setShowUpcomingOnly(!showUpcomingOnly);
              setPage(0);
            }}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Upcoming Only
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      )}

      {error && (
        <Card className="p-6">
          <CardContent>
            <p className="text-destructive">Error loading events: {error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filteredEvents.length === 0 && (
        <Card className="p-12">
          <CardContent className="text-center">
            <p className="text-muted-foreground text-lg mb-2">No events found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || showUpcomingOnly
                ? 'Try adjusting your search or filters'
                : 'Check back later for upcoming events'}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filteredEvents.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="flex items-center text-sm text-muted-foreground">
              Page {page + 1}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={filteredEvents.length < limit}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

