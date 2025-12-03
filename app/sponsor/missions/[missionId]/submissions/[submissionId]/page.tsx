'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Download, ExternalLink, GraduationCap, Award, Clock } from 'lucide-react';
import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const reviewSchema = z.object({
  score: z.number().min(0).max(100),
  sponsor_feedback: z.string().optional(),
  sponsor_notes: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function SubmissionReviewPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params.missionId as string;
  const submissionId = params.submissionId as string;
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

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

  const { data: submission, isLoading: submissionLoading } = trpc.missions.getSubmission.useQuery(
    { submissionId },
    { enabled: !loading && !!submissionId }
  );

  const reviewMutation = trpc.missions.reviewSubmission.useMutation({
    onSuccess: () => {
      router.push(`/sponsor/missions/${missionId}`);
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      score: submission?.score || 0,
      sponsor_feedback: submission?.sponsor_feedback || '',
      sponsor_notes: submission?.sponsor_notes || '',
    },
  });

  // Update form when submission loads
  useEffect(() => {
    if (submission) {
      setValue('score', submission.score || 0);
      setValue('sponsor_feedback', submission.sponsor_feedback || '');
      setValue('sponsor_notes', submission.sponsor_notes || '');
    }
  }, [submission, setValue]);

  const score = watch('score');

  const onSubmit = async (data: ReviewFormData) => {
    try {
      await reviewMutation.mutateAsync({
        submission_id: submissionId,
        score: data.score,
        sponsor_feedback: data.sponsor_feedback || undefined,
        sponsor_notes: data.sponsor_notes || undefined,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to review submission');
    }
  };

  if (loading || submissionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Submission not found</p>
              <Link href={`/sponsor/missions/${missionId}`}>
                <Button className="mt-4">Back to Mission</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mission = (submission.missions as any) || {};
  const student = (submission.users as any) || {};

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/sponsor/missions/${missionId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mission
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Review Submission</h1>
        <p className="text-gray-600">Mission: {mission?.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Student Info & Submission */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-lg font-semibold">
                  {student.full_name || student.email || 'Student'}
                </div>
                <div className="text-sm text-gray-600">{student.email}</div>
              </div>
              {student.major && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{student.major}</span>
                </div>
              )}
              {student.graduation_year && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Class of {student.graduation_year}</span>
                </div>
              )}
              {student.skills && student.skills.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {student.skills.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submission Details */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="font-medium">Started:</span>{' '}
                  {submission.started_at
                    ? new Date(submission.started_at).toLocaleString()
                    : 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Submitted:</span>{' '}
                  {submission.submitted_at
                    ? new Date(submission.submitted_at).toLocaleString()
                    : 'Not submitted'}
                </div>
                {submission.time_spent_minutes && (
                  <div>
                    <span className="font-medium">Time Spent:</span>{' '}
                    {submission.time_spent_minutes} minutes
                  </div>
                )}
              </div>

              {submission.submission_url && (
                <div>
                  <Label>Submission Link</Label>
                  <div className="mt-2">
                    <a
                      href={submission.submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Submission
                    </a>
                  </div>
                </div>
              )}

              {submission.submission_files && Array.isArray(submission.submission_files) && submission.submission_files.length > 0 && (
                <div>
                  <Label>Submission Files</Label>
                  <div className="mt-2 space-y-2">
                    {submission.submission_files.map((file: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{file.filename || `File ${idx + 1}`}</span>
                        {file.url && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {submission.submission_text && (
                <div>
                  <Label>Submission Notes</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{submission.submission_text}</p>
                  </div>
                </div>
              )}

              {submission.status === 'scored' && submission.sponsor_feedback && (
                <div>
                  <Label>Previous Feedback</Label>
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{submission.sponsor_feedback}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Review Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Review & Score</CardTitle>
              <CardDescription>Provide feedback and assign a score</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Score Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="score">Score (0-100)</Label>
                    <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                      {score}
                    </span>
                  </div>
                  <input
                    type="range"
                    id="score"
                    min="0"
                    max="100"
                    step="1"
                    {...register('score', { valueAsNumber: true })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    onChange={(e) => setValue('score', parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                  {errors.score && (
                    <p className="text-sm text-destructive">{errors.score.message}</p>
                  )}
                </div>

                {/* Feedback (visible to student) */}
                <div className="space-y-2">
                  <Label htmlFor="sponsor_feedback">Feedback (Visible to Student)</Label>
                  <textarea
                    id="sponsor_feedback"
                    {...register('sponsor_feedback')}
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Provide constructive feedback for the student..."
                  />
                </div>

                {/* Internal Notes (sponsor only) */}
                <div className="space-y-2">
                  <Label htmlFor="sponsor_notes">Internal Notes (Private)</Label>
                  <textarea
                    id="sponsor_notes"
                    {...register('sponsor_notes')}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Private notes (not visible to student)..."
                  />
                </div>

                {/* Estimated Points */}
                {mission && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="text-sm">
                      <span className="font-medium">Estimated Points:</span>{' '}
                      <span className="text-lg font-bold">
                        {score >= 90
                          ? Math.round((mission.max_points || 100) * 1.5 * (mission.difficulty === 'expert' ? 2 : mission.difficulty === 'advanced' ? 1.5 : mission.difficulty === 'intermediate' ? 1.2 : 1))
                          : score >= 70
                          ? Math.round(score * (mission.difficulty === 'expert' ? 2 : mission.difficulty === 'advanced' ? 1.5 : mission.difficulty === 'intermediate' ? 1.2 : 1))
                          : Math.round(score * 0.75 * (mission.difficulty === 'expert' ? 2 : mission.difficulty === 'advanced' ? 1.5 : mission.difficulty === 'intermediate' ? 1.2 : 1))}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on score, difficulty, and bonus rules
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || reviewMutation.isPending}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting || reviewMutation.isPending
                    ? 'Saving Review...'
                    : submission.status === 'scored'
                    ? 'Update Review'
                    : 'Submit Review'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

