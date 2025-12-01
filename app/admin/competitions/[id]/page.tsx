'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Trophy, FileText, Edit, Award } from 'lucide-react';

export default function CompetitionManagementPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const { data: competition, isLoading } = trpc.competitions.getById.useQuery(
    { id: competitionId },
    { enabled: !!competitionId }
  );
  const { data: teams } = trpc.competitions.getTeams.useQuery(
    { competition_id: competitionId },
    { enabled: !!competitionId }
  );
  const { data: rubrics } = trpc.competitions.getRubrics.useQuery(
    { competition_id: competitionId },
    { enabled: !!competitionId }
  );

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role || 'user';
      setUserRole(role);

      if (role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    }
    checkAdmin();
  }, [router]);

  if (loading || isLoading || !competition) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading competition...</p>
        </div>
      </div>
    );
  }

  const event = competition.events;
  const deadline = competition.deadline ? new Date(competition.deadline) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/admin/competitions">
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
              <p className="text-muted-foreground">Event: {event.title}</p>
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
          <p className="text-muted-foreground mb-4">{competition.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {deadline && (
            <div className="flex items-center gap-2">
              <span>Deadline: {format(deadline, 'MMM d, yyyy h:mm a')}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Team size: {competition.min_team_size || 2} - {competition.max_team_size || 4}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>{teams?.length || 0} teams registered</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="teams" className="space-y-6">
        <TabsList>
          <TabsTrigger value="teams">Teams ({teams?.length || 0})</TabsTrigger>
          <TabsTrigger value="rubrics">Judging Rubrics ({rubrics?.length || 0})</TabsTrigger>
          <TabsTrigger value="judging">Judging</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Teams</CardTitle>
              <CardDescription>View and manage competition teams</CardDescription>
            </CardHeader>
            <CardContent>
              {teams && teams.length > 0 ? (
                <div className="space-y-4">
                  {teams.map((team: any) => (
                    <Card key={team.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{team.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {team.members?.length || 0} members
                            </p>
                            {team.submitted_at && (
                              <Badge variant="outline" className="mt-2">
                                Submitted: {format(new Date(team.submitted_at), 'MMM d, yyyy')}
                              </Badge>
                            )}
                          </div>
                          {team.submission_filename && (
                            <Link href={team.submission_url} target="_blank">
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                View Submission
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No teams registered yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rubrics">
          <Card>
            <CardHeader>
              <CardTitle>Judging Rubrics</CardTitle>
              <CardDescription>Define criteria for judging teams</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Rubric management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="judging">
          <Card>
            <CardHeader>
              <CardTitle>Judging Interface</CardTitle>
              <CardDescription>Score and evaluate team submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Judging interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Competition Results</CardTitle>
              <CardDescription>View and publish competition results</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Results view coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Competition Settings</CardTitle>
              <CardDescription>Edit competition details and status</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/admin/competitions/${competitionId}/edit`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Competition
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

