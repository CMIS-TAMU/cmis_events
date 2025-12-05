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
    <Card className="overflow-hidden hover-lift border-0 shadow-lg group">
      {event.image_url ? (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      ) : (
        <div className="h-48 w-full bg-gradient-to-br from-[#500000] via-[#6b0000] to-[#500000] flex items-center justify-center relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="event-diamonds" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M20 0L40 20L20 40L0 20Z" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#event-diamonds)" />
            </svg>
          </div>
          <Calendar className="h-16 w-16 text-white/40" />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl line-clamp-2 text-[#500000] group-hover:text-[#6b0000] transition-colors">
            {event.title}
          </CardTitle>
          {isUpcoming && (
            <Badge className="shrink-0 bg-[#500000] hover:bg-[#6b0000] text-white border-0">
              Upcoming
            </Badge>
          )}
          {isPast && (
            <Badge variant="secondary" className="shrink-0 bg-gray-100 text-gray-600">
              Past
            </Badge>
          )}
        </div>
        {event.description && (
          <CardDescription className="line-clamp-2 text-muted-foreground">
            {event.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-2.5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-8 h-8 rounded-lg bg-[#500000]/10 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-[#500000]" />
          </div>
          <span className="font-medium">{format(startDate, 'EEEE, MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-8 h-8 rounded-lg bg-[#500000]/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-[#500000]" />
          </div>
          <span>
            {format(startDate, 'h:mm a')}
            {endDate && ` - ${format(endDate, 'h:mm a')}`}
          </span>
        </div>
        {event.capacity > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-lg bg-[#500000]/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-[#500000]" />
            </div>
            <span>Capacity: {event.capacity} attendees</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-3 pt-2">
        <Link href={`/events/${event.id}`} className="flex-1">
          <Button 
            variant="outline" 
            className="w-full border-[#500000]/30 text-[#500000] hover:bg-[#500000]/10 hover:border-[#500000]/50 font-medium"
          >
            View Details
          </Button>
        </Link>
        {showRegisterButton && isUpcoming && (
          <Link href={`/events/${event.id}#register`} className="flex-1">
            <Button className="w-full bg-[#500000] hover:bg-[#6b0000] text-white font-medium shadow-md">
              Register
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
