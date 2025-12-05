'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, User, Mail, Building, MapPin, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toastUtil } from '@/lib/utils/toast';

export default function RequestMentorPage() {
  const router = useRouter();
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  // Fetch match batch
  const { data: matchBatch, isLoading: batchLoading, refetch } = trpc.mentorship.getMatchBatch.useQuery();
  
  // Fetch active match to check if already matched
  const { data: activeMatch } = trpc.mentorship.getActiveMatch.useQuery();

  // Request mentor mutation
  const requestMentor = trpc.mentorship.requestMentor.useMutation({
    onSuccess: () => {
      refetch();
      setTimeout(() => refetch(), 1000); // Refetch after backend creates batch
    },
    onError: (error) => {
      console.error('Error requesting mentor:', error);
      toastUtil.error(
        'Failed to request mentor',
        error.message || 'Please try again or contact support if the problem persists.'
      );
    },
  });

  // Add timeout to prevent infinite spinning
  useEffect(() => {
    if (requestMentor.isPending) {
      const timeout = setTimeout(() => {
        if (requestMentor.isPending) {
          requestMentor.reset();
          toastUtil.error(
            'Request timeout',
            'The request is taking too long. This might mean there are no mentors available. Please contact support.'
          );
        }
      }, 30000); // 30 second timeout

      return () => clearTimeout(timeout);
    }
  }, [requestMentor]);

  useEffect(() => {
    // Auto-request if no batch exists and user doesn't have active match
    if (!batchLoading && !matchBatch && !activeMatch && !requestMentor.isPending && !requestMentor.isError) {
      requestMentor.mutate({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchLoading, matchBatch, activeMatch]);

  // Show error state if request failed
  if (requestMentor.isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Request Failed
            </CardTitle>
            <CardDescription>
              Unable to create mentor request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium mb-2">Error:</p>
                <p className="text-sm text-red-600">{requestMentor.error?.message || 'Unknown error occurred'}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    requestMentor.reset();
                    requestMentor.mutate({});
                  }}
                  variant="default"
                >
                  Try Again
                </Button>
                <Link href="/mentorship/dashboard">
                  <Button variant="outline">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (batchLoading || requestMentor.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Finding mentors...</p>
        </div>
      </div>
    );
  }

  // If already matched, redirect to dashboard
  if (activeMatch && activeMatch.status === 'active') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Already Matched</CardTitle>
            <CardDescription>You already have an active mentor match</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You are currently matched with a mentor. Visit your dashboard to view details.
            </p>
            <Link href="/mentorship/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no batch exists, show loading/creating state
  if (!matchBatch) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Finding Mentors</CardTitle>
            <CardDescription>We&apos;re finding the best mentors for you...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
            <p className="text-center text-sm text-muted-foreground mb-4">
              This may take a few moments. Please wait while we analyze your profile and match you with mentors.
            </p>
            {requestMentor.isError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">Error occurred:</p>
                <p className="text-sm text-red-600">{requestMentor.error?.message || 'Unknown error'}</p>
                <Button
                  onClick={() => requestMentor.mutate({})}
                  variant="outline"
                  className="mt-2"
                  size="sm"
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // If batch is claimed, show success
  if (matchBatch.status === 'claimed') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Match Confirmed!
            </CardTitle>
            <CardDescription>One of the recommended mentors has accepted your request</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Great news! Your mentorship match has been confirmed. You&apos;ll receive an email with next steps.
            </p>
            <Link href="/mentorship/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show mentor recommendations
  const mentors = [
    { id: matchBatch.mentor_1_id, score: matchBatch.mentor_1_score, data: matchBatch.mentor_1 },
    { id: matchBatch.mentor_2_id, score: matchBatch.mentor_2_score, data: matchBatch.mentor_2 },
    { id: matchBatch.mentor_3_id, score: matchBatch.mentor_3_score, data: matchBatch.mentor_3 },
  ].filter((m) => m.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Link href="/mentorship/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold mb-2">Mentor Recommendations</h1>
        <p className="text-muted-foreground">
          We&apos;ve found {mentors.length} potential mentors for you. These recommendations have been sent to the mentors for review.
        </p>
      </div>

      {matchBatch.status === 'pending' && (
        <Card className="mb-6 border-blue-500 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              Waiting for mentors to respond. You&apos;ll be notified when one accepts your request.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {mentors.map((mentor, index) => (
          <Card key={mentor.id} className="relative">
            {index === 0 && mentor.score && mentor.score > 80 && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500">Best Match</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {mentor.data?.full_name || mentor.data?.email || `Mentor ${index + 1}`}
              </CardTitle>
              <CardDescription>
                {mentor.score && (
                  <span className="text-sm font-medium">Match Score: {mentor.score}/100</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mentor.data?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{mentor.data.email}</span>
                  </div>
                )}
                {matchBatch.match_reasoning && typeof matchBatch.match_reasoning === 'object' && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Why this match?</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {Object.entries(
                        matchBatch.match_reasoning[`mentor_${index + 1}`] || {}
                      ).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <span className="font-medium">{value?.score || value || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Recommendations Sent</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent your profile to the recommended mentors along with match details.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Mentor Review</p>
                <p className="text-sm text-muted-foreground">
                  Mentors will review your profile and match details. They have 7 days to respond.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Match Confirmation</p>
                <p className="text-sm text-muted-foreground">
                  When a mentor accepts, you&apos;ll receive an email notification and can start your mentorship journey!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

