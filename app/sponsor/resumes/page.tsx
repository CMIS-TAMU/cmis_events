'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Download, FileText, Star, StarOff, GraduationCap, Award, Calendar } from 'lucide-react';
import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';

export default function SponsorResumesPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [minGpa, setMinGpa] = useState('');
  const [maxGpa, setMaxGpa] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
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

  const { data: shortlist } = trpc.sponsors.getShortlist.useQuery(undefined, { enabled: !loading });
  const shortlistIds = new Set(shortlist?.map((c: any) => c.id) || []);

  const { data: resumes, isLoading, refetch } = trpc.sponsors.searchResumes.useQuery({
    search: searchTerm || undefined,
    major: majorFilter || undefined,
    minGpa: minGpa ? parseFloat(minGpa) : undefined,
    maxGpa: maxGpa ? parseFloat(maxGpa) : undefined,
    graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
    skills: selectedSkills.length > 0 ? selectedSkills : undefined,
    limit: 50,
  }, {
    enabled: !loading,
  });

  const addToShortlistMutation = trpc.sponsors.addToShortlist.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const removeFromShortlistMutation = trpc.sponsors.removeFromShortlist.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const trackViewMutation = trpc.sponsors.trackResumeView.useMutation();

  const handleViewResume = async (userId: string, resumeFilename: string) => {
    // Track view
    await trackViewMutation.mutateAsync({ userId });
    
    // Get signed URL from API route and open in new tab
    try {
      const response = await fetch(`/api/resume/signed-url?path=${encodeURIComponent(resumeFilename)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.signedUrl) {
          window.open(data.signedUrl, '_blank');
        }
      } else {
        alert('Failed to load resume');
      }
    } catch (error) {
      console.error('Error getting signed URL:', error);
      alert('Failed to load resume');
    }
  };

  const handleToggleShortlist = async (userId: string, isInShortlist: boolean) => {
    try {
      if (isInShortlist) {
        await removeFromShortlistMutation.mutateAsync({ userId });
      } else {
        await addToShortlistMutation.mutateAsync({ userId });
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update shortlist');
    }
  };

  const handleExportCSV = () => {
    if (!resumes || resumes.length === 0) return;

    const headers = ['Name', 'Email', 'Major', 'GPA', 'Graduation Year', 'Skills'];
    const rows = resumes.map((resume: any) => [
      resume.full_name || 'N/A',
      resume.email || 'N/A',
      resume.major || 'N/A',
      resume.gpa || 'N/A',
      resume.graduation_year || 'N/A',
      (resume.skills || []).join(', ') || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-search-${new Date().toISOString().split('T')[0]}.csv`;
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

  // Get unique majors for filter
  const uniqueMajors: string[] = Array.from(new Set(resumes?.map((r: any) => r.major).filter(Boolean) || [])) as string[];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Resume Search</h1>
        <p className="text-muted-foreground">
          Search and filter student resumes by major, skills, GPA, and more
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Name, email, or major..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Major</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={majorFilter}
                onChange={(e) => setMajorFilter(e.target.value)}
              >
                <option value="">All Majors</option>
                {uniqueMajors.map((major: string) => (
                  <option key={major} value={major}>{major}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">GPA Range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  placeholder="Min"
                  value={minGpa}
                  onChange={(e) => setMinGpa(e.target.value)}
                />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  placeholder="Max"
                  value={maxGpa}
                  onChange={(e) => setMaxGpa(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Graduation Year</label>
              <Input
                type="number"
                min="2020"
                max="2030"
                placeholder="e.g., 2025"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setMajorFilter('');
              setMinGpa('');
              setMaxGpa('');
              setGraduationYear('');
              setSelectedSkills([]);
            }}>
              Clear Filters
            </Button>
            {resumes && resumes.length > 0 && (
              <Button onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {resumes?.length || 0} {resumes?.length === 1 ? 'resume' : 'resumes'} found
        </p>
      </div>

      {resumes && resumes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume: any) => (
            <Card key={resume.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{resume.full_name || 'N/A'}</CardTitle>
                    <CardDescription>{resume.email}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleShortlist(resume.id, shortlistIds.has(resume.id))}
                    title={shortlistIds.has(resume.id) ? "Remove from shortlist" : "Add to shortlist"}
                  >
                    {shortlistIds.has(resume.id) ? (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {resume.major && (
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{resume.major}</span>
                  </div>
                )}

                {resume.gpa !== null && resume.gpa !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>GPA: {resume.gpa.toFixed(2)}</span>
                  </div>
                )}

                {resume.graduation_year && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Graduating {resume.graduation_year}</span>
                  </div>
                )}

                {resume.skills && resume.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.slice(0, 3).map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {resume.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{resume.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewResume(resume.id, resume.resume_filename)}
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
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No Resumes Found</CardTitle>
            <CardDescription>
              Try adjusting your search filters
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

