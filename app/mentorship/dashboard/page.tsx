'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, Users, MessageSquare, Calendar, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function MentorshipDashboardPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Fetch user's mentorship profile
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = trpc.mentorship.getProfile.useQuery();
  
  // Fetch active match
  const { data: activeMatch, isLoading: matchLoading, refetch: refetchMatch } = trpc.mentorship.getActiveMatch.useQuery();
  
  // Fetch match batch (pending recommendations)
  const { data: matchBatch, isLoading: batchLoading } = trpc.mentorship.getMatchBatch.useQuery();

  // Request mentor mutation
  const requestMentor = trpc.mentorship.requestMentor.useMutation({
    onSuccess: () => {
      refetchMatch();
      // Refetch batch after a delay to allow backend to create it
      setTimeout(() => {
        router.push('/mentorship/request');
      }, 1000);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleRequestMentor = async () => {
    setError(null);
    await requestMentor.mutateAsync({});
  };

  if (profileLoading || matchLoading || batchLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Check if user needs to create a profile
  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Mentorship Matching</CardTitle>
            <CardDescription>
              Create your mentorship profile to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You need to create a mentorship profile before you can request a mentor.
            </p>
            <Link href="/mentorship/profile">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasActiveMatch = activeMatch && activeMatch.status === 'active';
  const hasPendingBatch = matchBatch && matchBatch.status === 'pending';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mentorship Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your mentorship connections and requests
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-500 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Match Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Match
            </CardTitle>
            <CardDescription>Your active mentorship connection</CardDescription>
          </CardHeader>
          <CardContent>
            {hasActiveMatch ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Matched with Mentor</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mentor</p>
                  <p className="font-medium">
                    {activeMatch.mentor?.full_name || activeMatch.mentor?.email || 'Unknown'}
                  </p>
                </div>
                {activeMatch.match_score && (
                  <div>
                    <p className="text-sm text-muted-foreground">Match Score</p>
                    <p className="font-medium">{activeMatch.match_score}/100</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Matched On</p>
                  <p className="text-sm">
                    {new Date(activeMatch.matched_at).toLocaleDateString()}
                  </p>
                </div>
                <Link href={`/mentorship/match/${activeMatch.id}`}>
                  <Button variant="outline" className="w-full">
                    View Match Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : hasPendingBatch ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Pending Recommendations</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent your profile to {matchBatch.mentor_1_id ? '3' : matchBatch.mentor_2_id ? '2' : '1'} potential mentors. 
                  You&apos;ll be notified when one accepts.
                </p>
                <Link href="/mentorship/request">
                  <Button variant="outline" className="w-full">
                    View Recommendations
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">No Active Match</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Request a mentor to get matched with experienced professionals.
                </p>
                {profile.in_matching_pool && (
                  <Button onClick={handleRequestMentor} disabled={requestMentor.isPending} className="w-full">
                    {requestMentor.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Request a Mentor
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Profile Status
            </CardTitle>
            <CardDescription>Your mentorship profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Profile Type</p>
                <Badge variant={profile.profile_type === 'student' ? 'default' : 'secondary'}>
                  {profile.profile_type === 'student' ? 'Student' : 'Mentor'}
                </Badge>
              </div>
              {profile.profile_type === 'student' && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Major</p>
                    <p className="font-medium">{profile.major || 'Not set'}</p>
                  </div>
                  {profile.graduation_year && (
                    <div>
                      <p className="text-sm text-muted-foreground">Graduation Year</p>
                      <p className="font-medium">{profile.graduation_year}</p>
                    </div>
                  )}
                </>
              )}
              {profile.profile_type === 'mentor' && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p className="font-medium">{profile.industry || 'Not set'}</p>
                  </div>
                  {profile.current_mentees !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">Current Mentees</p>
                      <p className="font-medium">
                        {profile.current_mentees} / {profile.max_mentees || 3}
                      </p>
                    </div>
                  )}
                </>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Matching Pool</p>
                <Badge variant={profile.in_matching_pool ? 'default' : 'secondary'}>
                  {profile.in_matching_pool ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <Link href="/mentorship/profile">
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common mentorship tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/mentorship/questions">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Quick Questions
                </Button>
              </Link>
              {hasActiveMatch && (
                <Link href={`/mentorship/match/${activeMatch.id}/meetings`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Meeting Logs
                  </Button>
                </Link>
              )}
              <Link href="/mentorship/profile">
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

