'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/trpc';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Using native select since Select component may not exist
import { Loader2, ArrowLeft, Clock, Tag, User, AlertCircle, Calendar, Search, Filter, CheckCircle2 } from 'lucide-react';
import { toastUtil } from '@/lib/utils/toast';
import { format } from 'date-fns';

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

const urgencyColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function MiniSessionsBrowsePage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get current user ID
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    }
    getUser();
  }, []);

  // Fetch open requests
  const { data: openRequests, isLoading, refetch } = trpc.miniMentorship.getOpenRequests.useQuery(
    sessionTypeFilter !== 'all' ? { session_type: sessionTypeFilter as any } : undefined,
    {
      enabled: !!currentUserId,
      refetchOnWindowFocus: false,
      staleTime: 30000, // Refetch every 30 seconds
    }
  );

  // Fetch mentor profile to check if they're a mentor
  const { data: profile } = trpc.mentorship.getProfile.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Claim request mutation
  const claimRequest = trpc.miniMentorship.claimRequest.useMutation({
    onSuccess: (data) => {
      toastUtil.success(
        'Request claimed!',
        'You can now schedule the session with the student.'
      );
      refetch();
      // Redirect to dashboard after claiming (we'll add a claimed requests page later)
      router.push('/mentorship/dashboard');
    },
    onError: (error) => {
      toastUtil.error(
        'Failed to claim request',
        error.message || 'Please try again.'
      );
    },
  });

  const handleClaimRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to claim this mini session request? You will be able to schedule a time with the student.')) {
      return;
    }
    claimRequest.mutate({ request_id: requestId });
  };

  // Filter requests by search query
  const filteredRequests = openRequests?.filter((request: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.title?.toLowerCase().includes(query) ||
      request.description?.toLowerCase().includes(query) ||
      request.student?.full_name?.toLowerCase().includes(query) ||
      request.student?.email?.toLowerCase().includes(query) ||
      request.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    );
  }) || [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Check if user is a mentor
  if (profile && profile.profile_type !== 'mentor') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>This page is only available for mentors</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You need to have a mentor profile to browse mini session requests.
            </p>
            <Link href="/mentorship/profile">
              <Button>Create Mentor Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Link href="/mentorship/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold mb-2">Browse Mini Session Requests</h1>
        <p className="text-muted-foreground">
          Students are looking for quick mentorship sessions. Claim a request to help a student!
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title, description, student name, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="session-type">Session Type</Label>
              <select
                id="session-type"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={sessionTypeFilter}
                onChange={(e) => setSessionTypeFilter(e.target.value)}
              >
                <option value="all">All Session Types</option>
                {Object.entries(sessionTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Requests Available</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || sessionTypeFilter !== 'all'
                ? 'No requests match your filters. Try adjusting your search.'
                : 'There are currently no open mini session requests. Check back later!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
            </p>
          </div>
          {filteredRequests.map((request: any) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{request.title}</CardTitle>
                      <Badge variant="outline" className={urgencyColors[request.urgency]}>
                        {request.urgency}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          {sessionTypeLabels[request.session_type] || request.session_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {request.preferred_duration_minutes} min
                        </span>
                        {request.student && (
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {request.student.full_name || request.student.email}
                          </span>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleClaimRequest(request.id)}
                    disabled={claimRequest.isPending}
                    size="lg"
                  >
                    {claimRequest.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Claim Request
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground">{request.description}</p>
                  </div>

                  {request.tags && request.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {request.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {request.specific_questions && (
                    <div>
                      <p className="text-sm font-medium mb-1">Specific Questions</p>
                      <p className="text-sm text-muted-foreground">{request.specific_questions}</p>
                    </div>
                  )}

                  {(request.preferred_date_start || request.preferred_date_end) && (
                    <div>
                      <p className="text-sm font-medium mb-1">Preferred Availability</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {request.preferred_date_start && request.preferred_date_end ? (
                          <span>
                            {format(new Date(request.preferred_date_start), 'MMM d, yyyy')} - {format(new Date(request.preferred_date_end), 'MMM d, yyyy')}
                          </span>
                        ) : request.preferred_date_start ? (
                          <span>From {format(new Date(request.preferred_date_start), 'MMM d, yyyy')}</span>
                        ) : request.preferred_date_end ? (
                          <span>Until {format(new Date(request.preferred_date_end), 'MMM d, yyyy')}</span>
                        ) : null}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Requested {format(new Date(request.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

