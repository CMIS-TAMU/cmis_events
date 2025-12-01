'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Event {
  id: string;
  title: string;
  description?: string;
  capacity: number;
  image_url?: string;
  starts_at: string;
  ends_at?: string;
  created_at?: string;
}

interface EventCardProps {
  event: Event;
  showRegisterButton?: boolean;
}

export function EventCard({ event, showRegisterButton = true }: EventCardProps) {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;
  const isUpcoming = startDate > new Date();
  const isPast = endDate ? endDate < new Date() : startDate < new Date();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {event.image_url ? (
        <div className="relative h-48 w-full">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="h-48 w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Calendar className="h-16 w-16 text-primary/30" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
          {isUpcoming && (
            <Badge variant="default" className="shrink-0">
              Upcoming
            </Badge>
          )}
          {isPast && (
            <Badge variant="secondary" className="shrink-0">
              Past
            </Badge>
          )}
        </div>
        {event.description && (
          <CardDescription className="line-clamp-2">
            {event.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
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
        {event.capacity > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Capacity: {event.capacity}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link href={`/events/${event.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
        {showRegisterButton && isUpcoming && (
          <Link href={`/events/${event.id}#register`} className="flex-1">
            <Button className="w-full">Register</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}

