'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, FileText, Download, GraduationCap, Award, Calendar, X } from 'lucide-react';
import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { getResumeSignedUrl } from '@/lib/storage/resume';

export default function SponsorShortlistPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

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

  const { data: shortlist, isLoading, refetch } = trpc.sponsors.getShortlist.useQuery(
    undefined,
    { enabled: !loading }
  );

  const removeFromShortlistMutation = trpc.sponsors.removeFromShortlist.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const trackViewMutation = trpc.sponsors.trackResumeView.useMutation();

  const handleViewResume = async (userId: string, resumeFilename: string) => {
    await trackViewMutation.mutateAsync({ userId });
    const signedUrl = await getResumeSignedUrl(resumeFilename);
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    }
  };

  const handleRemove = async (userId: string) => {
    if (confirm('Remove this candidate from your shortlist?')) {
      await removeFromShortlistMutation.mutateAsync({ userId });
    }
  };

  const handleExportCSV = () => {
    if (!shortlist || shortlist.length === 0) return;

    const headers = ['Name', 'Email', 'Major', 'GPA', 'Graduation Year', 'Skills'];
    const rows = shortlist.map((candidate: any) => [
      candidate.full_name || 'N/A',
      candidate.email || 'N/A',
      candidate.major || 'N/A',
      candidate.gpa || 'N/A',
      candidate.graduation_year || 'N/A',
      (candidate.skills || []).join(', ') || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shortlist-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Shortlist</h1>
          <p className="text-muted-foreground">
            Manage your shortlisted candidates
          </p>
        </div>
        {shortlist && shortlist.length > 0 && (
          <Button onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {shortlist && shortlist.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shortlist.map((candidate: any) => (
            <Card key={candidate.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{candidate.full_name || 'N/A'}</CardTitle>
                    <CardDescription>{candidate.email}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(candidate.id)}
                    title="Remove from shortlist"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.major && (
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{candidate.major}</span>
                  </div>
                )}

                {candidate.gpa !== null && candidate.gpa !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>GPA: {candidate.gpa.toFixed(2)}</span>
                  </div>
                )}

                {candidate.graduation_year && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Graduating {candidate.graduation_year}</span>
                  </div>
                )}

                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 3).map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{candidate.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewResume(candidate.id, candidate.resume_filename)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <CardContent className="text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No Shortlisted Candidates</CardTitle>
            <CardDescription className="mb-4">
              Start building your shortlist by searching resumes
            </CardDescription>
            <Button onClick={() => router.push('/sponsor/resumes')}>
              Search Resumes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

