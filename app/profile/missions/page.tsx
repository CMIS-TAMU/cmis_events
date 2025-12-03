'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Clock, CheckCircle2, XCircle, AlertCircle, Eye, ArrowRight } from 'lucide-react';
import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';

export default function MyMissionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login');
        return;
      }
      setUser(authUser);
      setLoading(false);
    }
    getUser();
  }, [router]);

  const { data: submissions, isLoading } = trpc.missions.getMySubmissions.useQuery(
    undefined,
    { enabled: !loading }
  );

  const { data: myRank } = trpc.missions.getMyRank.useQuery(
    undefined,
    { enabled: !loading }
  );

  const filteredSubmissions = submissions?.filter((submission: any) => {
    if (statusFilter === 'all') return true;
    return submission.status === statusFilter;
  }) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; icon: any; text: string }> = {
      submitted: { className: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Submitted' },
      reviewing: { className: 'bg-purple-100 text-purple-800', icon: Clock, text: 'Under Review' },
      scored: { className: 'bg-green-100 text-green-800', icon: CheckCircle2, text: 'Reviewed' },
      rejected: { className: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
    };
    return variants[status] || { className: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: status };
  };

  const getDifficultyBadge = (difficulty: string) => {
    const variants: Record<string, string> = {
      beginner: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800',
    };
    return variants[difficulty] || 'bg-gray-100 text-gray-800';
  };

  // Calculate stats
  const stats = {
    total: submissions?.length || 0,
    submitted: submissions?.filter((s: any) => s.status === 'submitted').length || 0,
    reviewed: submissions?.filter((s: any) => s.status === 'scored').length || 0,
    totalPoints: submissions?.reduce((sum: number, s: any) => sum + (s.points_awarded || 0), 0) || 0,
    avgScore: submissions && submissions.length > 0
      ? submissions.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / submissions.length
      : 0,
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Mission Submissions</h1>
        <p className="text-muted-foreground">
          Track your progress and view your submission history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.totalPoints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.avgScore > 0 ? stats.avgScore.toFixed(1) : '0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leaderboard Rank</CardTitle>
            <Trophy className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {myRank?.rank ? `#${myRank.rank}` : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Link */}
      {myRank && (
        <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Your Leaderboard Position</h3>
                <p className="text-sm text-muted-foreground">
                  Rank #{myRank.rank} with {myRank.totalPoints || 0} points
                </p>
              </div>
              <Link href="/leaderboard">
                <Button>
                  View Leaderboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="reviewing">Under Review</option>
              <option value="scored">Reviewed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
              <p className="text-gray-600 mb-4">
                {statusFilter !== 'all'
                  ? 'No submissions match this filter'
                  : 'Start completing missions to see your submissions here'}
              </p>
              <Link href="/missions">
                <Button>
                  Browse Missions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission: any) => {
            const mission = submission.missions as any;
            const statusInfo = getStatusBadge(submission.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{mission?.title || 'Mission'}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        {mission?.difficulty && (
                          <Badge className={getDifficultyBadge(mission.difficulty)}>
                            {mission.difficulty}
                          </Badge>
                        )}
                        {mission?.category && (
                          <Badge variant="outline">{mission.category}</Badge>
                        )}
                        <Badge className={statusInfo.className}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo.text}
                        </Badge>
                      </div>
                    </div>
                    {submission.score !== null && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {submission.score}/100
                        </div>
                        {submission.points_awarded !== null && (
                          <div className="text-sm text-yellow-600 font-semibold">
                            +{submission.points_awarded} points
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="text-sm">
                      <span className="font-medium">Submitted:</span>{' '}
                      {submission.submitted_at
                        ? new Date(submission.submitted_at).toLocaleString()
                        : 'Not submitted'}
                    </div>
                    {submission.time_spent_minutes && (
                      <div className="text-sm">
                        <span className="font-medium">Time Spent:</span>{' '}
                        {submission.time_spent_minutes} minutes
                      </div>
                    )}
                    {submission.reviewed_at && (
                      <div className="text-sm">
                        <span className="font-medium">Reviewed:</span>{' '}
                        {new Date(submission.reviewed_at).toLocaleString()}
                      </div>
                    )}
                    {mission?.max_points && (
                      <div className="text-sm">
                        <span className="font-medium">Max Points:</span>{' '}
                        {mission.max_points}
                      </div>
                    )}
                  </div>

                  {submission.sponsor_feedback && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-md">
                      <span className="font-medium text-sm">Feedback:</span>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{submission.sponsor_feedback}</p>
                    </div>
                  )}

                  <Link href={`/missions/${submission.mission_id}`}>
                    <Button variant="outline" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      View Mission Details
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

