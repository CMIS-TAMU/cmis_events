'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Upload, Link as LinkIcon, FileText, Trophy, Clock, Users, Target, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';

export default function MissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params.missionId as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState<'not_started' | 'in_progress' | 'submitted' | 'reviewing' | 'scored'>('not_started');
  const [submission, setSubmission] = useState<any>(null);
  
  // Submission form state
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const { data: mission, isLoading: missionLoading } = trpc.missions.getMission.useQuery(
    { missionId },
    { enabled: !loading && !!missionId }
  );

  const { data: mySubmissions } = trpc.missions.getMySubmissions.useQuery(
    undefined,
    { enabled: !loading && !!user }
  );

  // Find submission for this mission
  useEffect(() => {
    if (mySubmissions && missionId) {
      const missionSubmission = mySubmissions.find((s: any) => s.mission_id === missionId);
      if (missionSubmission) {
        setSubmission(missionSubmission);
        if (missionSubmission.status === 'scored') {
          setSubmissionStatus('scored');
        } else if (missionSubmission.status === 'reviewing') {
          setSubmissionStatus('reviewing');
        } else if (missionSubmission.submitted_at) {
          setSubmissionStatus('submitted');
        } else if (missionSubmission.started_at) {
          setSubmissionStatus('in_progress');
        }
      }
    }
  }, [mySubmissions, missionId]);

  const startMissionMutation = trpc.missions.startMission.useMutation({
    onSuccess: () => {
      setSubmissionStatus('in_progress');
      router.refresh();
    },
  });

  const submitSolutionMutation = trpc.missions.submitSolution.useMutation({
    onSuccess: () => {
      setSubmissionStatus('submitted');
      router.refresh();
    },
  });

  const handleStartMission = async () => {
    try {
      await startMissionMutation.mutateAsync({ missionId });
    } catch (error: any) {
      alert(error.message || 'Failed to start mission');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validate file sizes (100 MB max per file)
      const maxSize = 100 * 1024 * 1024;
      const invalidFiles = files.filter(f => f.size > maxSize);
      if (invalidFiles.length > 0) {
        alert(`Some files exceed 100 MB limit. Please select smaller files.`);
        return;
      }
      setSubmissionFiles([...submissionFiles, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSubmissionFiles(submissionFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!submissionUrl && !submissionText && submissionFiles.length === 0) {
      alert('Please provide at least one submission method (URL, text, or files)');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedFiles: Array<{ url: string; filename: string }> = [];

      // Upload files if any
      if (submissionFiles.length > 0 && user) {
        setUploading(true);
        
        // Upload files via API route
        const formData = new FormData();
        submissionFiles.forEach((file) => {
          formData.append('files', file);
        });
        formData.append('missionId', missionId);
        formData.append('studentId', user.id);

        const uploadResponse = await fetch('/api/missions/upload-submission-files', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload files');
        }

        const uploadResult = await uploadResponse.json();
        setUploading(false);

        if (!uploadResult.success || !uploadResult.files) {
          throw new Error(uploadResult.error || 'Failed to upload files');
        }
        uploadedFiles = uploadResult.files;
      }

      // Submit solution
      await submitSolutionMutation.mutateAsync({
        mission_id: missionId,
        submission_url: submissionUrl || undefined,
        submission_text: submissionText || undefined,
        submission_files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      });

      // Reset form
      setSubmissionUrl('');
      setSubmissionText('');
      setSubmissionFiles([]);
    } catch (error: any) {
      alert(error.message || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; icon: any; text: string }> = {
      not_started: { className: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: 'Not Started' },
      in_progress: { className: 'bg-blue-100 text-blue-800', icon: Clock, text: 'In Progress' },
      submitted: { className: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Submitted' },
      reviewing: { className: 'bg-purple-100 text-purple-800', icon: Clock, text: 'Under Review' },
      scored: { className: 'bg-green-100 text-green-800', icon: CheckCircle2, text: 'Reviewed' },
    };
    return variants[status] || variants.not_started;
  };

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
              <Link href="/missions">
                <Button className="mt-4">Back to Missions</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusBadge(submissionStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/missions">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Missions
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{mission.title}</h1>
              <Badge className={getDifficultyBadge(mission.difficulty || 'intermediate')}>
                {mission.difficulty || 'intermediate'}
              </Badge>
              <Badge className={statusInfo.className}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusInfo.text}
              </Badge>
            </div>
            {mission.category && (
              <p className="text-muted-foreground">{mission.category}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-1 text-lg font-bold text-yellow-600">
                <Trophy className="h-5 w-5" />
                {mission.max_points || 100} points
              </div>
              {mission.time_limit_minutes && (
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {mission.time_limit_minutes} min limit
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Mission Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{mission.description}</p>
            </CardContent>
          </Card>

          {/* Requirements */}
          {mission.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{mission.requirements}</p>
              </CardContent>
            </Card>
          )}

          {/* Submission Instructions */}
          {mission.submission_instructions && (
            <Card>
              <CardHeader>
                <CardTitle>Submission Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{mission.submission_instructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Starter Files */}
          {mission.starter_files_url && (
            <Card>
              <CardHeader>
                <CardTitle>Starter Files</CardTitle>
                <CardDescription>Download starter files to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={mission.starter_files_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Download className="h-4 w-4" />
                  Download Starter Files
                </a>
              </CardContent>
            </Card>
          )}

          {/* Submission Form */}
          {submissionStatus !== 'not_started' && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Solution</CardTitle>
                <CardDescription>
                  {submissionStatus === 'submitted' || submissionStatus === 'reviewing' || submissionStatus === 'scored'
                    ? 'Your submission has been received'
                    : 'Upload your solution files, provide a link, or add notes'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {submissionStatus === 'submitted' || submissionStatus === 'reviewing' || submissionStatus === 'scored' ? (
                  <div className="space-y-4">
                    {submission?.submission_url && (
                      <div>
                        <Label>Submission Link</Label>
                        <div className="mt-2">
                          <a
                            href={submission.submission_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <LinkIcon className="h-4 w-4" />
                            {submission.submission_url}
                          </a>
                        </div>
                      </div>
                    )}
                    {submission?.submission_text && (
                      <div>
                        <Label>Submission Notes</Label>
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm whitespace-pre-wrap">{submission.submission_text}</p>
                        </div>
                      </div>
                    )}
                    {submission?.score !== null && (
                      <div className="p-4 bg-green-50 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Score</Label>
                            <div className="text-2xl font-bold text-green-600">
                              {submission.score}/100
                            </div>
                          </div>
                          {submission.points_awarded !== null && (
                            <div>
                              <Label>Points Awarded</Label>
                              <div className="text-2xl font-bold text-yellow-600">
                                {submission.points_awarded}
                              </div>
                            </div>
                          )}
                        </div>
                        {submission.sponsor_feedback && (
                          <div className="mt-4">
                            <Label>Feedback</Label>
                            <p className="text-sm mt-2 whitespace-pre-wrap">{submission.sponsor_feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Submission URL */}
                    <div className="space-y-2">
                      <Label htmlFor="submission_url">Submission Link (Optional)</Label>
                      <Input
                        id="submission_url"
                        type="url"
                        placeholder="https://github.com/your-username/project"
                        value={submissionUrl}
                        onChange={(e) => setSubmissionUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Link to your GitHub repo, deployed app, or other submission
                      </p>
                    </div>

                    {/* Submission Text */}
                    <div className="space-y-2">
                      <Label htmlFor="submission_text">Submission Notes (Optional)</Label>
                      <textarea
                        id="submission_text"
                        rows={4}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Add any notes about your submission..."
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                      />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="submission_files">Upload Files (Optional)</Label>
                      <Input
                        id="submission_files"
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload code files, documentation, or other assets (max 100 MB per file)
                      </p>
                      {submissionFiles.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {submissionFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{file.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(idx)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || uploading}
                      className="w-full"
                    >
                      {uploading ? (
                        <>Uploading files...</>
                      ) : submitting ? (
                        <>Submitting...</>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Submit Solution
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Info & Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Mission Info */}
          <Card>
            <CardHeader>
              <CardTitle>Mission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mission.tags && mission.tags.length > 0 && (
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {mission.tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {mission.deadline && (
                <div>
                  <Label>Deadline</Label>
                  <p className="text-sm mt-1">
                    {new Date(mission.deadline).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <Label>Attempts</Label>
                <p className="text-sm mt-1">{mission.total_attempts || 0} students attempted</p>
              </div>
              <div>
                <Label>Submissions</Label>
                <p className="text-sm mt-1">{mission.total_submissions || 0} solutions submitted</p>
              </div>
            </CardContent>
          </Card>

          {/* Start Mission Button */}
          {submissionStatus === 'not_started' && (
            <Card>
              <CardHeader>
                <CardTitle>Ready to Start?</CardTitle>
                <CardDescription>
                  Click below to begin this mission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleStartMission}
                  disabled={startMissionMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  <Target className="mr-2 h-5 w-5" />
                  {startMissionMutation.isPending ? 'Starting...' : 'Start Mission'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* View My Submissions Link */}
          <Card>
            <CardHeader>
              <CardTitle>My Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/profile/missions">
                <Button variant="outline" className="w-full">
                  View All My Submissions
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

