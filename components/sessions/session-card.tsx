'use client';

import { format } from 'date-fns';
import { Clock, Users, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Session {
  id: string;
  event_id: string;
  title: string;
  description?: string | null;
  starts_at: string;
  ends_at: string;
  capacity: number;
}

interface SessionCardProps {
  session: Session;
  registered?: boolean;
  remaining?: number;
  onRegister?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}

export function SessionCard({
  session,
  registered = false,
  remaining,
  onRegister,
  onCancel,
  showActions = true,
}: SessionCardProps) {
  const startDate = new Date(session.starts_at);
  const endDate = new Date(session.ends_at);
  const isFull = session.capacity > 0 && remaining !== undefined && remaining <= 0;
  const isUpcoming = new Date(session.starts_at) > new Date();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{session.title}</CardTitle>
            {session.description && (
              <CardDescription className="mt-2">{session.description}</CardDescription>
            )}
          </div>
          {registered && (
            <Badge variant="default" className="ml-2">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Registered
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{format(startDate, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}</span>
          </div>
          {session.capacity > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {remaining !== undefined ? (
                  <>
                    {remaining} / {session.capacity} spots left
                  </>
                ) : (
                  <>
                    {session.capacity} capacity
                  </>
                )}
              </span>
            </div>
          )}
        </div>

        {showActions && isUpcoming && (
          <div className="flex gap-2">
            {registered ? (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel Registration
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onRegister}
                disabled={isFull}
              >
                {isFull ? 'Full' : 'Register for Session'}
              </Button>
            )}
          </div>
        )}

        {isFull && !registered && (
          <p className="text-sm text-muted-foreground">This session is full</p>
        )}
      </CardContent>
    </Card>
  );
}

