'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Download, FileText, Star, StarOff, GraduationCap, Award, Calendar, Brain, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
  const [searchType, setSearchType] = useState<'keyword' | 'semantic'>('semantic');
  const [jobDescription, setJobDescription] = useState('Looking for a software engineer with React and JavaScript experience. Should have strong problem-solving skills.');

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

  // Keyword search
  const { data: keywordResumes, isLoading: keywordLoading, refetch } = trpc.sponsors.searchResumes.useQuery({
    search: searchTerm || undefined,
    major: majorFilter || undefined,
    minGpa: minGpa ? parseFloat(minGpa) : undefined,
    maxGpa: maxGpa ? parseFloat(maxGpa) : undefined,
    graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
    skills: selectedSkills.length > 0 ? selectedSkills : undefined,
    limit: 50,
  }, {
    enabled: !loading && searchType === 'keyword',
  });

  // Semantic search
  const { data: semanticResumes, isLoading: semanticLoading } = trpc.sponsors.searchResumesSemantic.useQuery({
    jobDescription: jobDescription || searchTerm || 'software engineer',
    threshold: 0.5,
    limit: 50,
    skills: selectedSkills.length > 0 ? selectedSkills : undefined,
    major: majorFilter || undefined,
    minGpa: minGpa ? parseFloat(minGpa) : undefined,
  }, {
    enabled: !loading && searchType === 'semantic' && (!!jobDescription || !!searchTerm),
  });

  // Use appropriate results based on search type
  const resumes = searchType === 'semantic' ? semanticResumes : keywordResumes;
  const isLoading = searchType === 'semantic' ? semanticLoading : keywordLoading;

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
      {/* Header with Search Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-gradient-to-b from-[#500000] to-[#800000] rounded-full" />
          <h1 className="text-3xl font-bold text-[#500000]">Resume Search</h1>
          {searchType === 'semantic' && (
            <Badge className="bg-gradient-to-r from-[#500000] to-[#600000] text-white border-0 shadow-md flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </Badge>
          )}
        </div>
        <Tabs value={searchType} onValueChange={(v) => setSearchType(v as 'keyword' | 'semantic')}>
          <TabsList className="bg-gray-100">
            <TabsTrigger 
              value="keyword" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#500000]"
            >
              <Search className="h-4 w-4" />
              Keyword
            </TabsTrigger>
            <TabsTrigger 
              value="semantic" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#500000] data-[state=active]:to-[#600000] data-[state=active]:text-white"
            >
              <Brain className="h-4 w-4" />
              Semantic
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Search and Filters Row */}
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Search Section */}
        <div className="lg:col-span-2">
          {searchType === 'semantic' ? (
            <Card className="shadow-lg border-2 border-[#500000]/10 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#500000] to-[#600000]" />
              <CardContent className="p-4">
                <label className="text-sm font-semibold flex items-center gap-2 text-[#500000] mb-2">
                  <Brain className="h-4 w-4" />
                  Job Description
                </label>
                <Textarea
                  placeholder="e.g., Looking for a software engineer with React experience..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={3}
                  className="resize-none border-2 border-blue-200 focus:border-blue-400"
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-2 border-[#500000]/10 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#500000] to-[#600000]" />
              <CardContent className="p-4">
                <label className="text-sm font-semibold flex items-center gap-2 text-[#500000] mb-2">
                  <Search className="h-4 w-4" />
                  Search
                </label>
                <Input
                  placeholder="Name, email, or major..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-2"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Filters */}
        <Card className="shadow-lg border-2 border-[#500000]/10 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#800000] to-[#500000]" />
          <CardContent className="p-4">
            <label className="text-sm font-semibold flex items-center gap-2 text-[#500000] mb-3">
              <Filter className="h-4 w-4" />
              Filters
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Major</label>
                <select
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs mt-1"
                  value={majorFilter}
                  onChange={(e) => setMajorFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {uniqueMajors.map((major: string) => (
                    <option key={major} value={major}>{major}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">GPA</label>
                <div className="flex gap-1 mt-1">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    placeholder="Min"
                    value={minGpa}
                    onChange={(e) => setMinGpa(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    placeholder="Max"
                    value={maxGpa}
                    onChange={(e) => setMaxGpa(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">Year</label>
                <Input
                  type="number"
                  min="2020"
                  max="2030"
                  placeholder="2025"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setJobDescription('');
                    setMajorFilter('');
                    setMinGpa('');
                    setMaxGpa('');
                    setGraduationYear('');
                    setSelectedSkills([]);
                  }}
                  className="flex-1 text-xs h-7"
                >
                  Clear
                </Button>
                {resumes && resumes.length > 0 && (
                  <Button 
                    onClick={handleExportCSV}
                    size="sm"
                    className="bg-gradient-to-r from-[#500000] to-[#600000] hover:from-[#600000] hover:to-[#700000] text-white text-xs h-7"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[#500000]">
          {isLoading ? 'Searching...' : `${resumes?.length || 0} ${resumes?.length === 1 ? 'result' : 'results'}`}
        </span>
        {searchType === 'semantic' && !isLoading && resumes && resumes.length > 0 && (
          <Badge className="bg-gradient-to-r from-[#500000] to-[#600000] text-white border-0 text-xs px-2 py-0.5">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Match
          </Badge>
        )}
      </div>

      {resumes && resumes.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
          {resumes.map((resume: any, index: number) => (
            <Card 
              key={resume.id} 
              className="group overflow-hidden border-2 hover:border-[#500000]/30 transition-all shadow-md hover:shadow-lg"
            >
              {/* Colorful top border */}
              <div className={`h-1 ${
                index % 4 === 0 ? 'bg-gradient-to-r from-[#500000] to-[#600000]' :
                index % 4 === 1 ? 'bg-gradient-to-r from-[#600000] to-[#800000]' :
                index % 4 === 2 ? 'bg-gradient-to-r from-[#800000] to-[#500000]' :
                'bg-gradient-to-r from-[#500000] via-[#600000] to-[#800000]'
              }`} />
              <CardHeader className="pb-2 pt-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <CardTitle className="text-base font-bold text-[#500000] truncate">{resume.full_name || 'N/A'}</CardTitle>
                      {searchType === 'semantic' && 'matchScore' in resume && (
                        <Badge 
                          className={`text-xs px-1.5 py-0 ${
                            resume.matchScore >= 80 
                              ? 'bg-green-500 text-white' 
                              : resume.matchScore >= 60 
                              ? 'bg-blue-500 text-white'
                              : 'bg-yellow-500 text-white'
                          }`}
                        >
                          {resume.matchScore}%
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs truncate">{resume.email}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-yellow-50 flex-shrink-0"
                    onClick={() => handleToggleShortlist(resume.id, shortlistIds.has(resume.id))}
                    title={shortlistIds.has(resume.id) ? "Remove from shortlist" : "Add to shortlist"}
                  >
                    {shortlistIds.has(resume.id) ? (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <Star className="h-4 w-4 text-gray-300 hover:text-yellow-400" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0 pb-3">
                {resume.major && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-medium text-gray-800 truncate">{resume.major}</span>
                  </div>
                )}

                <div className="flex gap-2 text-xs">
                  {resume.gpa !== null && resume.gpa !== undefined && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded flex-1">
                      <Award className="h-3 w-3 text-green-600" />
                      <span className="font-bold text-[#500000]">{resume.gpa.toFixed(2)}</span>
                    </div>
                  )}
                  {resume.graduation_year && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 rounded flex-1">
                      <Calendar className="h-3 w-3 text-purple-600" />
                      <span className="font-bold text-[#500000]">{resume.graduation_year}</span>
                    </div>
                  )}
                </div>

                {resume.skills && resume.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.slice(0, 2).map((skill: string, idx: number) => (
                      <Badge 
                        key={idx} 
                        className="bg-[#500000]/10 text-[#500000] border border-[#500000]/20 text-[10px] px-1.5 py-0"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {resume.skills.length > 2 && (
                      <Badge className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0">
                        +{resume.skills.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-[#500000] to-[#600000] hover:from-[#600000] hover:to-[#700000] text-white text-xs h-8"
                  size="sm"
                  onClick={() => handleViewResume(resume.id, resume.resume_filename)}
                >
                  <FileText className="h-3 w-3 mr-1.5" />
                  View Resume
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !isLoading && (
        <Card className="p-8 border-dashed border-2 border-[#500000]/20 bg-[#500000]/5">
          <CardContent className="text-center">
            <FileText className="h-12 w-12 text-[#500000]/40 mx-auto mb-3" />
            <CardTitle className="mb-2 text-lg text-[#500000]">No Results Found</CardTitle>
            <CardDescription className="text-sm">
              Try adjusting your search or filters
            </CardDescription>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}

