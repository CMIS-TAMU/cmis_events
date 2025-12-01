'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { ResumeUpload } from '@/components/resumes/resume-upload';
import { ResumeViewer } from '@/components/resumes/resume-viewer';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function ResumePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const { data: resume, isLoading: resumeLoading, refetch } = trpc.resumes.getMyResume.useQuery();

  const deleteResume = trpc.resumes.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        const role = profile?.role || 'user';
        setUserRole(role);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Still allow access even if profile fetch fails
        setUserRole('user');
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]); // Add dependency array to prevent infinite loop

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete your resume? This action cannot be undone.')) {
      await deleteResume.mutateAsync();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Resume</h1>
        <p className="text-muted-foreground">
          Upload and manage your resume for sponsor access
        </p>
      </div>

      <div className="space-y-6">
        {/* Resume Viewer */}
        {resume && resume.resume_filename && (
          <ResumeViewer
            resumeUrl={resume.resume_url || null}
            signedUrl={(resume as any).signedUrl || null}
            uploadedAt={resume.resume_uploaded_at || null}
            version={resume.resume_version || null}
            major={resume.major || null}
            gpa={resume.gpa || null}
            skills={resume.skills || null}
            graduationYear={resume.graduation_year || null}
            onDelete={handleDelete}
            showDelete={true}
          />
        )}

        {/* Upload Form */}
        {(!resume || !resume.resume_filename || showUpload) && (
          <ResumeUpload
            onSuccess={() => {
              setShowUpload(false);
              refetch();
            }}
          />
        )}

        {/* Replace Resume Button */}
        {resume && resume.resume_filename && !showUpload && (
          <Card>
            <CardContent className="p-6">
              <button
                onClick={() => setShowUpload(true)}
                className="text-sm text-primary hover:underline"
              >
                Upload a new version
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

