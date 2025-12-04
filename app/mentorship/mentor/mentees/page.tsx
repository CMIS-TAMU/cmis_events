'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Mail, Calendar, Star, AlertTriangle, CheckCircle2, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function MentorMenteesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    }
    getUser();
  }, []);

  const { data: matches, isLoading, error } = trpc.mentorship.getMatches.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Filter for active matches where user is mentor
  const activeMentees = matches?.filter((match: any) => 
    match.mentor_id === user?.id && match.status === 'active'
  ) || [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading mentees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive mb-4">{error.message}</p>
            <Link href="/mentorship/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/mentorship/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold mb-2">My Mentees</h1>
        <p className="text-muted-foreground">
          Manage your mentorship relationships with students
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Mentees</p>
                <p className="text-2xl font-bold">{activeMentees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Healthy Matches</p>
                <p className="text-2xl font-bold">
                  {activeMentees.filter((m: any) => !m.is_at_risk).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-bold">
                  {activeMentees.filter((m: any) => m.is_at_risk).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mentees List */}
      {activeMentees.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No Active Mentees</CardTitle>
            <CardDescription>
              You don&apos;t have any active mentees at the moment. Students will appear here once they request you as a mentor.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeMentees.map((match: any) => {
            const student = match.student;
            const matchDate = new Date(match.matched_at);
            const lastMeetingDate = match.last_meeting_at ? new Date(match.last_meeting_at) : null;

            return (
              <Card key={match.id} className={match.is_at_risk ? 'border-yellow-500' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      {/* Student Info */}
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <h3 className="text-xl font-semibold">
                            {student?.full_name || student?.email || 'Unknown Student'}
                          </h3>
                          {match.is_at_risk && (
                            <Badge variant="destructive">Needs Attention</Badge>
                          )}
                        </div>
                        {student?.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-8">
                            <Mail className="h-4 w-4" />
                            <span>{student.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Match Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-8">
                        <div>
                          <p className="text-xs text-muted-foreground">Match Score</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <p className="font-medium">{match.match_score || 'N/A'}/100</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Matched On</p>
                          <p className="font-medium text-sm">{format(matchDate, 'MMM d, yyyy')}</p>
                        </div>
                        {lastMeetingDate && (
                          <div>
                            <p className="text-xs text-muted-foreground">Last Meeting</p>
                            <p className="font-medium text-sm">{format(lastMeetingDate, 'MMM d, yyyy')}</p>
                          </div>
                        )}
                        {match.health_score !== null && (
                          <div>
                            <p className="text-xs text-muted-foreground">Health Score</p>
                            <p className="font-medium text-sm">{match.health_score}/5</p>
                          </div>
                        )}
                      </div>

                      {/* At Risk Warning */}
                      {match.is_at_risk && match.at_risk_reason && (
                        <div className="ml-8 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <AlertTriangle className="h-4 w-4 inline mr-1" />
                            {match.at_risk_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link href={`/mentorship/match/${match.id}`}>
                        <Button variant="default" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/mentorship/match/${match.id}/meetings`}>
                        <Button variant="outline" className="w-full">
                          Meetings
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

