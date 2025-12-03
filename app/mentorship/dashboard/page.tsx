'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, Users, MessageSquare, Calendar, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function MentorshipDashboardPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  // Get user role from users table
  useEffect(() => {
    async function getUserRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(profile?.role || null);
      }
      setIsLoadingRole(false);
    }
    getUserRole();
  }, []);

  // Fetch user's mentorship profile (only for mentors - students don't need it)
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = trpc.mentorship.getProfile.useQuery();
  
  // Fetch active match
  const { data: activeMatch, isLoading: matchLoading, refetch: refetchMatch } = trpc.mentorship.getActiveMatch.useQuery();
  
  // Fetch match batch (pending recommendations) - for students (works without profile)
  const { data: matchBatch, isLoading: batchLoading } = trpc.mentorship.getMatchBatch.useQuery(undefined, {
    enabled: userRole === 'student',
  });
  
  // Fetch mentor match batches (where they're recommended) - for mentors (need profile)
  const { data: mentorMatchBatches, isLoading: mentorBatchLoading } = trpc.mentorship.getMentorMatchBatch.useQuery(undefined, {
    enabled: profile?.profile_type === 'mentor',
  });
  
  // Fetch all matches for mentors (to show all their mentees)
  const { data: allMatches, isLoading: allMatchesLoading } = trpc.mentorship.getMatches.useQuery(undefined, {
    enabled: profile?.profile_type === 'mentor',
  });

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

  if (isLoadingRole || profileLoading || matchLoading || batchLoading || mentorBatchLoading || allMatchesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Determine if user is mentor or student
  const isMentor = userRole !== 'student' && profile?.profile_type === 'mentor';
  const isStudent = userRole === 'student';

  // Mentors need a profile, students don't
  if (isMentor && !profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Mentorship Matching</CardTitle>
            <CardDescription>
              Create your mentor profile to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You need to create a mentor profile before you can receive mentorship requests.
            </p>
            <Link href="/mentorship/profile">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Mentor Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // For students: check their active match (with mentor)
  // For mentors: check their active matches (with mentees)
  const hasActiveMatch = activeMatch && activeMatch.status === 'active';
  const hasPendingBatch = matchBatch && matchBatch.status === 'pending';
  
  // For mentors: get active matches where they are the mentor
  const mentorActiveMatches = isMentor && allMatches && profile?.user_id
    ? allMatches.filter((m: any) => m.mentor_id === profile.user_id && m.status === 'active')
    : [];
  
  // For mentors: check if they have pending match batches (students requesting them)
  const hasPendingMentorBatch = isMentor && mentorMatchBatches && mentorMatchBatches.length > 0;

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
            <CardDescription>
              {isMentor ? 'Your current mentees and requests' : 'Your active mentorship connection'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* STUDENT VIEW */}
            {isStudent && hasActiveMatch && (
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
            )}
            
            {isStudent && hasPendingBatch && !hasActiveMatch && (
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
            )}
            
            {isStudent && !hasActiveMatch && !hasPendingBatch && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">No Active Match</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Request a mentor to get matched with experienced professionals.
                </p>
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
              </div>
            )}
            
            {/* MENTOR VIEW */}
            {isMentor && mentorActiveMatches.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Active Mentees ({mentorActiveMatches.length})</span>
                </div>
                <div className="space-y-3">
                  {mentorActiveMatches.map((match: any) => (
                      <div key={match.id} className="p-3 border rounded-lg">
                        <p className="font-medium">
                          {match.student?.full_name || match.student?.email || 'Unknown Student'}
                        </p>
                        {match.match_score && (
                          <p className="text-xs text-muted-foreground">
                            Match Score: {match.match_score}/100
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Matched: {new Date(match.matched_at).toLocaleDateString()}
                        </p>
                        <Link href={`/mentorship/match/${match.id}`}>
                          <Button variant="outline" size="sm" className="w-full mt-2">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {isMentor && hasPendingMentorBatch && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Pending Student Requests</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You have {mentorMatchBatches?.length || 0} student{mentorMatchBatches?.length !== 1 ? 's' : ''} waiting for your response.
                </p>
                <Link href="/mentorship/mentor/requests">
                  <Button variant="outline" className="w-full">
                    View Requests
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
            
            {isMentor && mentorActiveMatches.length === 0 && !hasPendingMentorBatch && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">No Active Mentees</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {profile?.in_matching_pool 
                    ? "You're in the matching pool. Students will be able to request you as a mentor."
                    : "Join the matching pool to help students find mentorship."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {isStudent ? 'Account Information' : 'Profile Status'}
            </CardTitle>
            <CardDescription>
              {isStudent ? 'Your account details' : 'Your mentorship profile information'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isStudent ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <Badge variant="default">Student</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">Ready to request a mentor</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No profile needed. We&apos;ll use your existing account data to match you with mentors.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Profile Type</p>
                    <Badge variant="secondary">Mentor</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p className="font-medium">{profile?.industry || 'Not set'}</p>
                  </div>
                  {profile && profile.current_mentees !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">Current Mentees</p>
                      <p className="font-medium">
                        {profile.current_mentees} / {profile.max_mentees || 3}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Matching Pool</p>
                    <Badge variant={profile?.in_matching_pool ? 'default' : 'secondary'}>
                      {profile?.in_matching_pool ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <Link href="/mentorship/profile">
                    <Button variant="outline" className="w-full">
                      Edit Profile
                    </Button>
                  </Link>
                </>
              )}
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
              {!isStudent && (
                <Link href="/mentorship/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Update Profile
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

