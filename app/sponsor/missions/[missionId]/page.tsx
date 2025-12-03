'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, BarChart3, FileText, Users, Settings, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase/client';

export default function MissionManagementPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const missionId = params.missionId as string;
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  useEffect(() => {
    async function checkSponsor() {
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

      if (role !== 'sponsor' && role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    }
    checkSponsor();
  }, [router]);

  const { data: mission, isLoading: missionLoading } = trpc.missions.getMission.useQuery(
    { missionId },
    { enabled: !loading && !!missionId }
  );

  const { data: submissions, isLoading: submissionsLoading } = trpc.missions.getMissionSubmissions.useQuery(
    { missionId },
    { enabled: !loading && !!missionId && activeTab === 'submissions' }
  );

  const { data: analytics, isLoading: analyticsLoading } = trpc.missions.getMissionAnalytics.useQuery(
    { missionId },
    { enabled: !loading && !!missionId && activeTab === 'analytics' }
  );

  const publishMutation = trpc.missions.publishMission.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const updateMutation = trpc.missions.updateMission.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  if (loading || missionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Mission not found</p>
              <Link href="/sponsor/missions">
                <Button className="mt-4">Back to Missions</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      closed: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
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

  const getSubmissionStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; icon: any }> = {
      submitted: { className: 'bg-blue-100 text-blue-800', icon: Clock },
      reviewing: { className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      scored: { className: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      rejected: { className: 'bg-red-100 text-red-800', icon: XCircle },
    };
    return variants[status] || { className: 'bg-gray-100 text-gray-800', icon: Clock };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/sponsor/missions">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Missions
          </Button>
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{mission.title}</h1>
              <Badge className={getStatusBadge(mission.status)}>
                {mission.status}
              </Badge>
              <Badge className={getDifficultyBadge(mission.difficulty || 'intermediate')}>
                {mission.difficulty || 'intermediate'}
              </Badge>
            </div>
            <p className="text-gray-600">{mission.description}</p>
          </div>
          {mission.status === 'draft' && (
            <Link href={`/sponsor/missions/${missionId}?edit=true`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions
            {submissions && submissions.length > 0 && (
              <Badge className="ml-2">{submissions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mission.total_attempts || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mission.total_submissions || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Max Points</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mission.max_points || 100}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mission.category && (
                <div>
                  <span className="font-medium">Category:</span> {mission.category}
                </div>
              )}
              {mission.tags && mission.tags.length > 0 && (
                <div>
                  <span className="font-medium">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {mission.tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {mission.requirements && (
                <div>
                  <span className="font-medium">Requirements:</span>
                  <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                    {mission.requirements}
                  </p>
                </div>
              )}
              {mission.submission_instructions && (
                <div>
                  <span className="font-medium">Submission Instructions:</span>
                  <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                    {mission.submission_instructions}
                  </p>
                </div>
              )}
              {mission.deadline && (
                <div>
                  <span className="font-medium">Deadline:</span>{' '}
                  {new Date(mission.deadline).toLocaleString()}
                </div>
              )}
              {mission.time_limit_minutes && (
                <div>
                  <span className="font-medium">Time Limit:</span> {mission.time_limit_minutes} minutes
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-4">
          {submissionsLoading ? (
            <div className="text-center py-8">Loading submissions...</div>
          ) : submissions && submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission: any) => {
                const statusBadge = getSubmissionStatusBadge(submission.status);
                const StatusIcon = statusBadge.icon;
                const student = submission.users;

                return (
                  <Card key={submission.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {student?.full_name || student?.email || 'Student'}
                          </CardTitle>
                          <CardDescription>
                            {student?.email} • {student?.major && `${student.major} • `}
                            {student?.graduation_year && `Class of ${student.graduation_year}`}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusBadge.className}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {submission.status}
                          </Badge>
                          {submission.score !== null && (
                            <Badge variant="outline">
                              Score: {submission.score}/100
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
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
                        {submission.points_awarded !== null && (
                          <div className="text-sm">
                            <span className="font-medium">Points:</span> {submission.points_awarded}
                          </div>
                        )}
                      </div>

                      {submission.submission_text && (
                        <div className="mb-4">
                          <span className="font-medium text-sm">Submission Notes:</span>
                          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                            {submission.submission_text}
                          </p>
                        </div>
                      )}

                      {submission.submission_url && (
                        <div className="mb-4">
                          <a
                            href={submission.submission_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Submission Link →
                          </a>
                        </div>
                      )}

                      {submission.sponsor_feedback && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                          <span className="font-medium text-sm">Feedback:</span>
                          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                            {submission.sponsor_feedback}
                          </p>
                        </div>
                      )}

                      <Link href={`/sponsor/missions/${missionId}/submissions/${submission.id}`}>
                        <Button variant="outline" className="w-full">
                          {submission.status === 'submitted' || submission.status === 'reviewing'
                            ? 'Review Submission'
                            : 'View Details'}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                  <p className="text-gray-600">
                    Students haven&apos;t submitted solutions for this mission yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analyticsLoading ? (
            <div className="text-center py-8">Loading analytics...</div>
          ) : analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Submission Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">{analytics.totalSubmissions}</div>
                    <p className="text-sm text-muted-foreground">Total Submissions</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{analytics.avgScore.toFixed(1)}</div>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{analytics.totalPointsAwarded}</div>
                    <p className="text-sm text-muted-foreground">Total Points Awarded</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">{analytics.views}</div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{analytics.starts}</div>
                    <p className="text-sm text-muted-foreground">Students Started</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{analytics.completionRate}%</div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No analytics data yet</h3>
                  <p className="text-gray-600">
                    Analytics will appear once students start engaging with this mission.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mission Settings</CardTitle>
              <CardDescription>Manage your mission settings and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-medium">Status:</span>{' '}
                <Badge className={getStatusBadge(mission.status)}>
                  {mission.status}
                </Badge>
              </div>
              {mission.published_at && (
                <div>
                  <span className="font-medium">Published:</span>{' '}
                  {new Date(mission.published_at).toLocaleString()}
                </div>
              )}
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(mission.created_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {new Date(mission.updated_at).toLocaleString()}
              </div>

              <div className="flex gap-2 pt-4">
                {mission.status === 'draft' && (
                  <Button
                    onClick={async () => {
                      try {
                        await publishMutation.mutateAsync({ missionId });
                      } catch (error: any) {
                        alert(error.message || 'Failed to publish mission');
                      }
                    }}
                    disabled={publishMutation.isPending}
                  >
                    {publishMutation.isPending ? 'Publishing...' : 'Publish Mission'}
                  </Button>
                )}
                {mission.status === 'active' && (
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      try {
                        await updateMutation.mutateAsync({
                          id: missionId,
                          status: 'closed',
                        });
                      } catch (error: any) {
                        alert(error.message || 'Failed to close mission');
                      }
                    }}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? 'Closing...' : 'Close Mission'}
                  </Button>
                )}
                <Link href={`/sponsor/missions/${missionId}?edit=true`}>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Mission
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

