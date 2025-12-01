'use client';

import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Trophy, Users, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CompetitionsPage() {
  const { data: competitions, isLoading } = trpc.competitions.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading competitions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Case Competitions</h1>
        <p className="text-muted-foreground">
          Participate in case competitions and showcase your skills
        </p>
      </div>

      {competitions && competitions.length === 0 ? (
        <Card className="p-12">
          <CardContent className="text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No Competitions Available</CardTitle>
            <CardDescription>
              Check back soon for upcoming case competitions
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {competitions?.map((competition: any) => {
            const event = competition.events;
            const deadline = competition.deadline ? new Date(competition.deadline) : null;
            const isPastDeadline = deadline && deadline < new Date();
            const isOpen = competition.status === 'open';

            return (
              <Card key={competition.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl line-clamp-2">{competition.title}</CardTitle>
                    <Badge
                      variant={
                        competition.status === 'open' ? 'default' :
                        competition.status === 'closed' ? 'secondary' :
                        competition.status === 'judging' ? 'outline' :
                        'default'
                      }
                    >
                      {competition.status || 'open'}
                    </Badge>
                  </div>
                  {event && (
                    <CardDescription>
                      {event.title}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {competition.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {competition.description}
                    </p>
                  )}
                  {deadline && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className={isPastDeadline ? 'text-red-600' : 'text-muted-foreground'}>
                        Deadline: {format(deadline, 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      Team size: {competition.min_team_size || 2} - {competition.max_team_size || 4}
                    </span>
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <Link href={`/competitions/${competition.id}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

