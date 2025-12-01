'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function SubmitPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: competition } = trpc.competitions.getById.useQuery(
    { id: competitionId },
    { enabled: !!competitionId }
  );
  const { data: myTeams, refetch: refetchTeams } = trpc.competitions.getMyTeams.useQuery();

  const submitMutation = trpc.competitions.submitTeamSubmission.useMutation({
    onSuccess: () => {
      refetchTeams();
      router.push(`/competitions/${competitionId}`);
    },
  });

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
    }
    getUser();
  }, []);

  // Find user's team for this competition
  const userTeam = myTeams?.find((t: any) => {
    if (t.case_competitions?.id !== competitionId) return false;
    return t.members?.includes(user?.id);
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.ms-powerpoint',
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload a PDF, DOC, DOCX, PPT, or PPTX file.');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !userTeam) {
      return;
    }

    // Check deadline
    const deadline = competition?.deadline ? new Date(competition.deadline) : null;
    if (deadline && deadline < new Date()) {
      alert('Submission deadline has passed.');
      return;
    }

    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${timestamp}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `competitions/${competitionId}/${userTeam.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('competition-submissions')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('competition-submissions')
        .getPublicUrl(filePath);

      // Submit via tRPC
      await submitMutation.mutateAsync({
        team_id: userTeam.id,
        submission_url: publicUrl,
        submission_filename: selectedFile.name,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to submit. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!competition || !userTeam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const deadline = competition.deadline ? new Date(competition.deadline) : null;
  const isPastDeadline = deadline && deadline < new Date();
  const hasSubmission = userTeam.submitted_at;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href={`/competitions/${competitionId}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Competition
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Submit Your Work</CardTitle>
          <CardDescription>
            Upload your team&apos;s submission for {competition.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {submitMutation.error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{submitMutation.error.message}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-2">Team: {userTeam.name}</p>
            {deadline && (
              <p className={`text-sm ${isPastDeadline ? 'text-red-600' : 'text-muted-foreground'}`}>
                Deadline: {deadline.toLocaleString()}
                {isPastDeadline && ' (Passed)'}
              </p>
            )}
          </div>

          {hasSubmission ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Submission Received</span>
              </div>
              <div className="p-4 border rounded-md bg-muted/50">
                <p className="text-sm font-medium mb-1">Submitted File:</p>
                <p className="text-sm text-muted-foreground">{userTeam.submission_filename}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Submitted on {new Date(userTeam.submitted_at).toLocaleString()}
                </p>
              </div>
              {userTeam.submission_url && (
                <Link href={userTeam.submission_url} target="_blank">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View Submission
                  </Button>
                </Link>
              )}
              <p className="text-sm text-muted-foreground">
                If you need to resubmit, upload a new file below.
              </p>
            </div>
          ) : null}

          {!isPastDeadline && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Submission *
                </label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {selectedFile ? selectedFile.name : 'Click to select file'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX, PPT, or PPTX (max 10MB)
                    </span>
                  </label>
                </div>
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>

              {competition.submission_instructions && (
                <div className="p-4 border rounded-md bg-muted/50">
                  <p className="text-sm font-medium mb-2">Submission Instructions:</p>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {competition.submission_instructions}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedFile || uploading || submitMutation.isPending}
                  className="flex-1"
                >
                  {uploading || submitMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
                <Link href={`/competitions/${competitionId}`}>
                  <Button type="button" variant="outline" disabled={uploading}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {isPastDeadline && !hasSubmission && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">
                The submission deadline has passed. You can no longer submit.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

