'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/trpc';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, User, Mail, GraduationCap, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { toastUtil } from '@/lib/utils/toast';

export default function MentorRequestsPage() {
  const router = useRouter();
  const [selectingBatchId, setSelectingBatchId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch match batches where this mentor is recommended
  const { data: matchBatches, isLoading, refetch } = trpc.mentorship.getMentorMatchBatch.useQuery();
  
  // Fetch mentor profile to check capacity
  const { data: profile } = trpc.mentorship.getProfile.useQuery();
  
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
  
  // Select student mutation
  const selectStudent = trpc.mentorship.selectStudent.useMutation({
    onSuccess: () => {
      refetch();
      router.push('/mentorship/dashboard');
    },
    onError: (err) => {
      toastUtil.error('Failed to select student', err.message || 'Please try again.');
      setSelectingBatchId(null);
    },
  });

  const handleSelectStudent = async (batchId: string) => {
    if (!confirm('Are you sure you want to select this student? This will create an active mentorship match.')) {
      return;
    }
    setSelectingBatchId(batchId);
    await selectStudent.mutateAsync({ batch_id: batchId });
  };

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
              You need to have a mentor profile to view student requests.
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Link href="/mentorship/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold mb-2">Student Requests</h1>
        <p className="text-muted-foreground">
          Students have requested mentorship. Review their profiles and select students you&apos;d like to mentor.
        </p>
      </div>

      {profile && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Mentorship Capacity</p>
                <p className="text-sm text-muted-foreground">
                  Current: {profile.current_mentees || 0} / Max: {profile.max_mentees || 3}
                </p>
              </div>
              {profile.current_mentees !== undefined && profile.max_mentees && profile.current_mentees >= profile.max_mentees && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  At Capacity
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!matchBatches || matchBatches.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              No Pending Requests
            </CardTitle>
            <CardDescription>You don&apos;t have any pending student requests at the moment</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              When students request mentors, you&apos;ll appear here if you match their criteria. 
              Make sure your profile is complete and you&apos;re in the matching pool.
            </p>
            <Link href="/mentorship/profile">
              <Button variant="outline">Update Profile</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {matchBatches.map((batch: any) => {
            // Determine mentor position and score
            const isMentor1 = batch.mentor_1_id === currentUserId;
            const isMentor2 = batch.mentor_2_id === currentUserId;
            const isMentor3 = batch.mentor_3_id === currentUserId;
            
            const mentorPosition = isMentor1 ? 1 : isMentor2 ? 2 : 3;
            const matchScore = isMentor1 
              ? batch.mentor_1_score 
              : isMentor2 
              ? batch.mentor_2_score 
              : batch.mentor_3_score;
            
            const isAtCapacity = profile && profile.max_mentees && (profile.current_mentees || 0) >= profile.max_mentees;
            
            return (
              <Card key={batch.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5" />
                        {batch.student?.full_name || batch.student?.email || 'Student'}
                      </CardTitle>
                      <CardDescription>
                        Requested on {new Date(batch.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      {matchScore && (
                        <Badge className="bg-blue-100 text-blue-800 mb-2">
                          Match Score: {matchScore}/100
                        </Badge>
                      )}
                      {mentorPosition && (
                        <p className="text-xs text-muted-foreground">
                          Position: {mentorPosition === 1 ? '1st' : mentorPosition === 2 ? '2nd' : '3rd'} Choice
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Student Info */}
                    <div className="space-y-2">
                      {batch.student?.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{batch.student.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Match Reasoning */}
                    {batch.match_reasoning && typeof batch.match_reasoning === 'object' && (
                      <div className="pt-4 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Why this match?</p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {Object.entries(
                            batch.match_reasoning[`mentor_${mentorPosition}`] || {}
                          ).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace('_', ' ')}:</span>
                              <span className="font-medium">{value?.score || value || 'N/A'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t flex gap-3">
                      <Button
                        onClick={() => handleSelectStudent(batch.id)}
                        disabled={selectingBatchId === batch.id || isAtCapacity || selectStudent.isPending}
                        className="flex-1"
                      >
                        {selectingBatchId === batch.id || selectStudent.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Select Student
                          </>
                        )}
                      </Button>
                      <Link href={`/mentorship/profile/${batch.student?.id}`}>
                        <Button variant="outline">
                          <User className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                    </div>

                    {isAtCapacity && (
                      <div className="rounded-md bg-yellow-50 p-3 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <p className="text-xs text-yellow-800">
                          You&apos;re at your maximum mentee capacity. Update your profile to increase capacity.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How This Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Student Requests Mentor</p>
                <p className="text-sm text-muted-foreground">
                  Students create requests and our algorithm matches them with top 3 mentors based on compatibility.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Review & Select</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll see requests where you&apos;re in the top 3. Review the student profile and match details.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Match Confirmed</p>
                <p className="text-sm text-muted-foreground">
                  When you select a student, the match is confirmed and both parties are notified via email.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

