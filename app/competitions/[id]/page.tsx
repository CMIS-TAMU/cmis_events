'use client';

import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar, Clock, Users, FileText, Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function CompetitionDetailPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [userTeam, setUserTeam] = useState<any>(null);

  const { data: competition, isLoading } = trpc.competitions.getById.useQuery(
    { id: competitionId },
    { enabled: !!competitionId }
  );
  const { data: teams } = trpc.competitions.getTeams.useQuery(
    { competition_id: competitionId },
    { enabled: !!competitionId }
  );
  const { data: myTeams } = trpc.competitions.getMyTeams.useQuery();

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      
      // Find user's team for this competition
      if (myTeams && authUser) {
        const team = myTeams.find((t: any) => 
          t.case_competitions?.id === competitionId && 
          t.members?.includes(authUser.id)
        );
        setUserTeam(team);
      }
    }
    getUser();
  }, [competitionId, myTeams]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading competition...</p>
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <CardContent>
            <p className="text-destructive">Competition not found</p>
            <Link href="/competitions">
              <Button variant="outline" className="mt-4">
                Back to Competitions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const event = competition.events;
  const deadline = competition.deadline ? new Date(competition.deadline) : null;
  const isPastDeadline = deadline && deadline < new Date();
  const isOpen = competition.status === 'open';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/competitions">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Competitions
        </Button>
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{competition.title}</h1>
            {event && (
              <p className="text-muted-foreground">Part of: {event.title}</p>
            )}
          </div>
          <Badge variant={
            competition.status === 'open' ? 'default' :
            competition.status === 'closed' ? 'secondary' :
            competition.status === 'judging' ? 'outline' :
            'default'
          }>
            {competition.status || 'open'}
          </Badge>
        </div>

        {competition.description && (
          <p className="text-lg text-muted-foreground mb-6">{competition.description}</p>
        )}

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {deadline && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className={isPastDeadline ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                Deadline: {format(deadline, 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Team size: {competition.min_team_size || 2} - {competition.max_team_size || 4}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>{teams?.length || 0} teams registered</span>
          </div>
        </div>
      </div>

      {competition.rules && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none whitespace-pre-wrap">
              {competition.rules}
            </div>
          </CardContent>
        </Card>
      )}

      {competition.submission_instructions && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Submission Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none whitespace-pre-wrap">
              {competition.submission_instructions}
            </div>
          </CardContent>
        </Card>
      )}

      {user ? (
        <div className="space-y-6">
          {userTeam ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Team: {userTeam.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Team members: {userTeam.members?.length || 0}</p>
                {userTeam.submitted_at ? (
                  <div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 mb-2">
                      Submission Received
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Submitted on {format(new Date(userTeam.submitted_at), 'MMM d, yyyy')}
                    </p>
                    {userTeam.submission_filename && (
                      <Link href={userTeam.submission_url || '#'} target="_blank" className="mt-2 inline-block">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View Submission
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <Link href={`/competitions/${competitionId}/submit`}>
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Your Work
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : isOpen && !isPastDeadline ? (
            <Card>
              <CardHeader>
                <CardTitle>Join the Competition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Form a team and participate in this case competition!
                </p>
                <Link href={`/competitions/${competitionId}/register`}>
                  <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Register Team
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : null}

          {competition.results_published && (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/competitions/${competitionId}/results`}>
                  <Button variant="outline">
                    <Trophy className="h-4 w-4 mr-2" />
                    View Results
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sign In to Participate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Sign in to register a team and participate in this competition
            </p>
            <Link href={`/login?redirect=/competitions/${competitionId}`}>
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

