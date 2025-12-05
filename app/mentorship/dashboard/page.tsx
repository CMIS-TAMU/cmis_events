'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  UserPlus, 
  Users, 
  MessageSquare, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Video, 
  Clock, 
  Zap,
  Sparkles,
  GraduationCap,
  User,
  ChevronRight,
  ExternalLink,
  Heart
} from 'lucide-react';
import { MiniSessionRequestDialog } from '@/components/mentorship/MiniSessionRequestDialog';
import { RecommendedMentorsCard } from '@/components/mentorship/RecommendedMentorsCard';
import { format } from 'date-fns';

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

  // Determine if user is mentor or student (calculate early for use in queries)
  const isStudent = userRole === 'student';

  // Fetch user's mentorship profile (only for mentors - students don't need it)
  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = trpc.mentorship.getProfile.useQuery(undefined, {
    enabled: userRole !== 'student',
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
  
  // Fetch active match
  const { data: activeMatch, isLoading: matchLoading, error: matchError, refetch: refetchMatch } = trpc.mentorship.getActiveMatch.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    networkMode: 'online',
  });
  
  // Fetch match batch (pending recommendations) - for students
  const { data: matchBatch, isLoading: batchLoading, error: batchError } = trpc.mentorship.getMatchBatch.useQuery(undefined, {
    enabled: userRole === 'student',
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    networkMode: 'online',
  });
  
  // Fetch mentor match batches - for mentors
  const { data: mentorMatchBatches, isLoading: mentorBatchLoading, error: mentorBatchError } = trpc.mentorship.getMentorMatchBatch.useQuery(undefined, {
    enabled: userRole !== 'student' && !!profile?.profile_type && profile.profile_type === 'mentor',
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });
  
  // Fetch all matches for mentors
  const { data: allMatches, isLoading: allMatchesLoading, error: allMatchesError } = trpc.mentorship.getMatches.useQuery(undefined, {
    enabled: userRole !== 'student' && !!profile?.profile_type && profile.profile_type === 'mentor',
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const isMentor = userRole !== 'student' && profile?.profile_type === 'mentor';

  // Fetch mini session requests for students
  const { data: miniSessionRequests, isLoading: miniRequestsLoading, error: miniRequestsError, refetch: refetchMiniRequests } = trpc.miniMentorship.getMyRequests.useQuery(undefined, {
    enabled: userRole === 'student',
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    throwOnError: false,
  });

  // Request mentor mutation
  const requestMentor = trpc.mentorship.requestMentor.useMutation({
    onSuccess: () => {
      refetchMatch();
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

  const isEssentialLoading = isLoadingRole;
  const hasCriticalError = matchError || (userRole === 'student' ? batchError : false);
  
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  useEffect(() => {
    if (isEssentialLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isEssentialLoading]);
  
  const shouldShowContent = !isEssentialLoading || loadingTimeout;
  
  if (isEssentialLoading && !loadingTimeout && !hasCriticalError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#500000]/5 to-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#500000] to-[#800000] flex items-center justify-center shadow-lg">
            <Users className="h-8 w-8 text-white animate-pulse" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-[#500000] mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading your mentorship dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (loadingTimeout && !shouldShowContent) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Loading Timeout
            </CardTitle>
            <CardDescription>
              The dashboard is taking longer than expected to load
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This might indicate a connection issue. You can try reloading or continue to view partial content.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()} variant="default">
                  Reload Page
                </Button>
                <Button onClick={() => setLoadingTimeout(false)} variant="outline">
                  Continue Anyway
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingTimeout || hasCriticalError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              {loadingTimeout ? 'Loading Timeout' : 'Error Loading Dashboard'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {loadingTimeout 
                  ? 'The dashboard is taking too long to load. This might indicate a connection issue or missing data.'
                  : (matchError?.message || batchError?.message || 'An error occurred while loading the dashboard.')}
              </p>
              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()} variant="default">
                  Reload Page
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline">
                    Go to Main Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isMentor && !profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-2 border-dashed">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#500000] to-[#800000] flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to Mentorship</CardTitle>
            <CardDescription>
              Create your mentor profile to start receiving mentorship requests
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <Link href="/mentorship/profile">
              <Button size="lg" className="bg-[#500000] hover:bg-[#6b0000]">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Mentor Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const hasActiveMatch = activeMatch && activeMatch.status === 'active';
  const hasPendingBatch = matchBatch && matchBatch.status === 'pending';
  
  const mentorActiveMatches = isMentor && allMatches && profile?.user_id
    ? allMatches.filter((m: any) => m.mentor_id === profile.user_id && m.status === 'active')
    : [];
  
  const hasPendingMentorBatch = isMentor && mentorMatchBatches && mentorMatchBatches.length > 0;

  // Helper for status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Open</Badge>;
      case 'claimed':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Claimed</Badge>;
      case 'scheduled':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-gray-500">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const sessionTypeLabels: Record<string, string> = {
    interview_prep: 'Interview Prep',
    skill_learning: 'Skill Learning',
    career_advice: 'Career Advice',
    resume_review: 'Resume Review',
    project_guidance: 'Project Guidance',
    technical_help: 'Technical Help',
    portfolio_review: 'Portfolio Review',
    networking_advice: 'Networking',
    other: 'Other',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#500000]/5 via-background to-background">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#500000] to-[#6b0000] text-white">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mentorship Dashboard</h1>
              <p className="text-white/80">Connect with experienced professionals to accelerate your career</p>
            </div>
          </div>
          
          {/* Quick Stats for Students */}
          {isStudent && (
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{hasActiveMatch ? '1' : '0'}</div>
                <div className="text-sm text-white/70">Active Mentor</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{miniSessionRequests?.filter((r: any) => r.status === 'open').length || 0}</div>
                <div className="text-sm text-white/70">Open Sessions</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{miniSessionRequests?.filter((r: any) => r.status === 'completed').length || 0}</div>
                <div className="text-sm text-white/70">Completed</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* STUDENT VIEW */}
        {isStudent && (
          <div className="space-y-8">
            
            {/* Active Mentor Connection */}
            {hasActiveMatch && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-5 w-5 text-[#500000]" />
                  <h2 className="text-xl font-semibold">Your Mentor</h2>
                </div>
                <Card className="border-2 border-[#500000]/20 bg-gradient-to-r from-[#500000]/5 to-transparent overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#500000] to-[#800000] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {(activeMatch.mentor?.full_name || 'M')[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{activeMatch.mentor?.full_name || 'Your Mentor'}</h3>
                          <p className="text-sm text-muted-foreground">{activeMatch.mentor?.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active Match
                            </Badge>
                            {activeMatch.match_score && (
                              <Badge variant="secondary">{activeMatch.match_score}% Match</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link href={`/mentorship/match/${activeMatch.id}`}>
                        <Button className="bg-[#500000] hover:bg-[#6b0000]">
                          View Details
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Mentor Recommendations - Only when no active match */}
            {!hasActiveMatch && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-[#500000]" />
                  <h2 className="text-xl font-semibold">Find Your Mentor</h2>
                </div>
                <RecommendedMentorsCard />
              </section>
            )}

            {/* Pending Batch Status - Only show if pending and no active match */}
            {hasPendingBatch && !hasActiveMatch && (
              <Card className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Pending Mentor Recommendations</h3>
                        <p className="text-sm text-muted-foreground">
                          We&apos;ve sent your profile to potential mentors. You&apos;ll be notified when one accepts.
                        </p>
                      </div>
                    </div>
                    <Link href="/mentorship/request">
                      <Button variant="outline">
                        View Status
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mini Mentorship Sessions */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#500000]" />
                  <h2 className="text-xl font-semibold">Mini Sessions</h2>
                </div>
                <MiniSessionRequestDialog
                  onSuccess={() => refetchMiniRequests()}
                  trigger={
                    <Button className="bg-[#500000] hover:bg-[#6b0000]">
                      <Video className="h-4 w-4 mr-2" />
                      Request Session
                    </Button>
                  }
                />
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      Video call
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      30-60 min
                    </span>
                    <span>One-time sessions for targeted help</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {miniRequestsError ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        Mini mentorship feature is not available yet.
                      </p>
                    </div>
                  ) : miniRequestsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : miniSessionRequests && miniSessionRequests.length > 0 ? (
                    <div className="space-y-3">
                      {miniSessionRequests.slice(0, 4).map((request: any) => (
                        <div 
                          key={request.id} 
                          className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-[#500000]/10 flex items-center justify-center flex-shrink-0">
                              <Video className="h-5 w-5 text-[#500000]" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{request.title}</p>
                                {getStatusBadge(request.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {sessionTypeLabels[request.session_type] || request.session_type} • {request.preferred_duration_minutes} min
                              </p>
                              {request.claimed_mentor && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Mentor: {request.claimed_mentor?.full_name || 'Assigned'}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground pl-4">
                            {format(new Date(request.created_at), 'MMM d')}
                          </div>
                        </div>
                      ))}
                      
                      {miniSessionRequests.length > 4 && (
                        <div className="text-center pt-2">
                          <p className="text-xs text-muted-foreground">
                            + {miniSessionRequests.length - 4} more sessions
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center">
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No mini sessions yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Request a session for quick help with specific topics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Quick Actions */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-[#500000]" />
                <h2 className="text-xl font-semibold">Quick Actions</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/mentorship/questions" className="block">
                  <Card className="h-full hover:border-[#500000]/30 hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#500000]/10 flex items-center justify-center group-hover:bg-[#500000]/20 transition-colors">
                          <MessageSquare className="h-5 w-5 text-[#500000]" />
                        </div>
                        <div>
                          <h3 className="font-medium">Quick Questions</h3>
                          <p className="text-sm text-muted-foreground">Ask the community</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {hasActiveMatch && (
                  <Link href={`/mentorship/match/${activeMatch.id}/meetings`} className="block">
                    <Card className="h-full hover:border-[#500000]/30 hover:shadow-md transition-all cursor-pointer group">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#500000]/10 flex items-center justify-center group-hover:bg-[#500000]/20 transition-colors">
                            <Calendar className="h-5 w-5 text-[#500000]" />
                          </div>
                          <div>
                            <h3 className="font-medium">Meeting Logs</h3>
                            <p className="text-sm text-muted-foreground">Track your meetings</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}

                {!hasActiveMatch && !hasPendingBatch && (
                  <Card 
                    className="h-full hover:border-[#500000]/30 hover:shadow-md transition-all cursor-pointer group"
                    onClick={handleRequestMentor}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#500000]/10 flex items-center justify-center group-hover:bg-[#500000]/20 transition-colors">
                          {requestMentor.isPending ? (
                            <Loader2 className="h-5 w-5 text-[#500000] animate-spin" />
                          ) : (
                            <UserPlus className="h-5 w-5 text-[#500000]" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">Request Mentor</h3>
                          <p className="text-sm text-muted-foreground">Get matched</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          </div>
        )}

        {/* MENTOR VIEW */}
        {isMentor && (
          <div className="space-y-8">
            {/* Active Mentees */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-[#500000]" />
                <h2 className="text-xl font-semibold">Your Mentees</h2>
              </div>
              
              {mentorActiveMatches.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {mentorActiveMatches.map((match: any) => (
                    <Card key={match.id} className="border-2 hover:border-[#500000]/30 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#500000] to-[#800000] flex items-center justify-center text-white text-lg font-bold">
                              {(match.student?.full_name || 'S')[0].toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold">{match.student?.full_name || 'Student'}</h3>
                              <p className="text-sm text-muted-foreground">
                                Matched: {new Date(match.matched_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Link href={`/mentorship/match/${match.id}`}>
                            <Button variant="outline" size="sm">
                              View
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-dashed">
                  <CardContent className="p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No active mentees</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {profile?.in_matching_pool 
                        ? "You're in the matching pool - students can request you as a mentor" 
                        : "Join the matching pool to receive mentorship requests"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Pending Requests */}
            {hasPendingMentorBatch && (
              <Card className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Pending Requests</h3>
                        <p className="text-sm text-muted-foreground">
                          {mentorMatchBatches?.length || 0} student{mentorMatchBatches?.length !== 1 ? 's' : ''} waiting for your response
                        </p>
                      </div>
                    </div>
                    <Link href="/mentorship/mentor/requests">
                      <Button className="bg-[#500000] hover:bg-[#6b0000]">
                        Review Requests
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mini Sessions Browse */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#500000]" />
                  <h2 className="text-xl font-semibold">Mini Sessions</h2>
                </div>
                <Link href="/mentorship/mini-sessions/browse">
                  <Button className="bg-[#500000] hover:bg-[#6b0000]">
                    Browse Requests
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#500000]/10 flex items-center justify-center">
                      <Video className="h-6 w-6 text-[#500000]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Help Students with Quick Sessions</h3>
                      <p className="text-sm text-muted-foreground">
                        Browse open requests for 30-60 minute mentorship sessions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Profile & Quick Actions */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-[#500000]" />
                <h2 className="text-xl font-semibold">Profile & Actions</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/mentorship/profile" className="block">
                  <Card className="h-full hover:border-[#500000]/30 hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#500000]/10 flex items-center justify-center group-hover:bg-[#500000]/20 transition-colors">
                          <UserPlus className="h-5 w-5 text-[#500000]" />
                        </div>
                        <div>
                          <h3 className="font-medium">Edit Profile</h3>
                          <p className="text-sm text-muted-foreground">Update your info</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/mentorship/questions" className="block">
                  <Card className="h-full hover:border-[#500000]/30 hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#500000]/10 flex items-center justify-center group-hover:bg-[#500000]/20 transition-colors">
                          <MessageSquare className="h-5 w-5 text-[#500000]" />
                        </div>
                        <div>
                          <h3 className="font-medium">Answer Questions</h3>
                          <p className="text-sm text-muted-foreground">Help students</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Card className="h-full border-2">
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={profile?.in_matching_pool ? 'default' : 'secondary'}>
                          {profile?.in_matching_pool ? 'In Pool' : 'Not in Pool'}
                        </Badge>
                        {profile && profile.current_mentees !== undefined && (
                          <span className="text-sm text-muted-foreground">
                            {profile.current_mentees}/{profile.max_mentees || 3} mentees
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {profile?.industry || 'Industry not set'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
