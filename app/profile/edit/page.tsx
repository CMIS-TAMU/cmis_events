'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Save, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { 
  WorkExperienceForm,
  WorkExperienceCard,
  type WorkExperienceEntry 
} from '@/components/profile/index';
import { 
  EducationForm,
  EducationCard,
  type EducationEntry 
} from '@/components/profile/index';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState('basic');

  // Form state - Academic
  const [major, setMajor] = useState('');
  const [skills, setSkills] = useState('');
  const [researchInterests, setResearchInterests] = useState('');
  const [careerGoals, setCareerGoals] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [gpa, setGpa] = useState('');
  const [degreeType, setDegreeType] = useState('');

  // Form state - Contact
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [address, setAddress] = useState('');

  // Form state - Professional
  const [preferredIndustry, setPreferredIndustry] = useState('');

  // Work Experience state
  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>([]);
  const [workExpFormOpen, setWorkExpFormOpen] = useState(false);
  const [editingWorkExp, setEditingWorkExp] = useState<WorkExperienceEntry | null>(null);

  // Education state
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [educationFormOpen, setEducationFormOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<EducationEntry | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateProfile = trpc.auth.updateStudentProfile.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setSaving(false);
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    },
    onError: (err) => {
      setError(err.message);
      setSaving(false);
    },
  });

  const updateWorkExperienceMutation = trpc.auth.updateWorkExperience.useMutation({
    onSuccess: () => {
      // Refresh work experience data
      loadProfile();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const updateEducationMutation = trpc.auth.updateEducation.useMutation({
    onSuccess: () => {
      // Refresh education data
      loadProfile();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const loadProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      router.push('/login');
      return;
    }

    setUser(authUser);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      setLoading(false);
      return;
    }

    setUserRole(profile?.role || 'user');

    // Load existing data
    if (profile) {
      // Academic fields
      setMajor(profile.major || '');
      setSkills((profile.skills || []).join(', '));
      
      const metadata = profile.metadata || {};
      const interests = metadata.research_interests || [];
      setResearchInterests(Array.isArray(interests) ? interests.join(', ') : '');
      
      setCareerGoals(metadata.career_goals || '');
      setGraduationYear(profile.graduation_year?.toString() || '');
      setGpa(profile.gpa?.toString() || '');
      setDegreeType(profile.degree_type || '');

      // Contact details
      setPhone(profile.phone || '');
      setLinkedinUrl(profile.linkedin_url || '');
      setGithubUrl(profile.github_url || '');
      setWebsiteUrl(profile.website_url || '');
      setAddress(profile.address || '');

      // Professional
      setPreferredIndustry(profile.preferred_industry || '');

      // Work experience (JSONB array)
      const workExp = profile.work_experience || [];
      setWorkExperience(Array.isArray(workExp) ? workExp : []);

      // Education (JSONB array)
      const edu = profile.education || [];
      setEducation(Array.isArray(edu) ? edu : []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    // Parse skills and research interests from comma-separated strings
    const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
    const interestsArray = researchInterests.split(',').map(s => s.trim()).filter(s => s);

    // Clean URLs (remove empty strings)
    const linkedin = linkedinUrl.trim() || undefined;
    const github = githubUrl.trim() || undefined;
    const website = websiteUrl.trim() || undefined;

    updateProfile.mutate({
      major: major || undefined,
      skills: skillsArray.length > 0 ? skillsArray : undefined,
      research_interests: interestsArray.length > 0 ? interestsArray : undefined,
      career_goals: careerGoals || undefined,
      graduation_year: graduationYear ? parseInt(graduationYear) : undefined,
      gpa: gpa ? parseFloat(gpa) : undefined,
      degree_type: degreeType ? (degreeType as 'bachelor' | 'master' | 'phd' | 'associate' | 'certificate') : undefined,
      phone: phone || undefined,
      linkedin_url: linkedin,
      github_url: github,
      website_url: website,
      address: address || undefined,
      preferred_industry: preferredIndustry || undefined,
    });
  };

  const handleWorkExperienceSave = (entry: WorkExperienceEntry) => {
    const updated = editingWorkExp
      ? workExperience.map((e) => (e.id === editingWorkExp.id ? entry : e))
      : [...workExperience, entry];

    updateWorkExperienceMutation.mutate({ work_experience: updated });
    setWorkExpFormOpen(false);
    setEditingWorkExp(null);
  };

  const handleWorkExperienceDelete = (entry: WorkExperienceEntry) => {
    if (confirm('Are you sure you want to delete this work experience entry?')) {
      const updated = workExperience.filter((e) => e.id !== entry.id);
      updateWorkExperienceMutation.mutate({ work_experience: updated });
    }
  };

  const handleEducationSave = (entry: EducationEntry) => {
    const updated = editingEducation
      ? education.map((e) => (e.id === editingEducation.id ? entry : e))
      : [...education, entry];

    updateEducationMutation.mutate({ education: updated });
    setEducationFormOpen(false);
    setEditingEducation(null);
  };

  const handleEducationDelete = (entry: EducationEntry) => {
    if (confirm('Are you sure you want to delete this education entry?')) {
      const updated = education.filter((e) => e.id !== entry.id);
      updateEducationMutation.mutate({ education: updated });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Only students can edit student profile
  if (userRole !== 'student') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-900">
            Only students can edit student profile information.
          </p>
        </div>
        <div className="mt-4">
          <Link href="/profile">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <Link href="/profile" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Link>
        <h1 className="text-4xl font-bold mb-2">Edit Student Profile</h1>
        <p className="text-muted-foreground">
          Update your information to help us match you with the right mentors and opportunities
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Information */}
          <TabsContent value="basic" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>
                  Your academic background and interests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="major">Major *</Label>
                    <Input
                      id="major"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="degreeType">Degree Type</Label>
                    <select
                      id="degreeType"
                      value={degreeType}
                      onChange={(e) => setDegreeType(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Select degree type</option>
                      <option value="bachelor">Bachelor&apos;s</option>
                      <option value="master">Master&apos;s</option>
                      <option value="phd">PhD</option>
                      <option value="associate">Associate</option>
                      <option value="certificate">Certificate</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Technical Skills</Label>
                  <Input
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g., Python, JavaScript, React (comma-separated)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple skills with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="researchInterests">Research Interests</Label>
                  <Input
                    id="researchInterests"
                    value={researchInterests}
                    onChange={(e) => setResearchInterests(e.target.value)}
                    placeholder="e.g., Machine Learning, Web Development, IoT (comma-separated)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple interests with commas. Used for mentor matching.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="careerGoals">Career Goals</Label>
                  <textarea
                    id="careerGoals"
                    value={careerGoals}
                    onChange={(e) => setCareerGoals(e.target.value)}
                    placeholder="e.g., Software Engineering, Research in AI, Product Management"
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe your career aspirations. Used for mentor matching.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      min="2020"
                      max="2030"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="e.g., 2025"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gpa">GPA (Optional)</Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.0"
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      placeholder="e.g., 3.75"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Contact Details */}
          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  How others can reach you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., +1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g., City, State, Country"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="e.g., https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub Profile URL</Label>
                  <Input
                    id="githubUrl"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="e.g., https://github.com/yourusername"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Personal Website/Portfolio URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="e.g., https://yourwebsite.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Professional */}
          <TabsContent value="professional" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                  Your professional background and career preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="preferredIndustry">Preferred Industry</Label>
                  <Input
                    id="preferredIndustry"
                    value={preferredIndustry}
                    onChange={(e) => setPreferredIndustry(e.target.value)}
                    placeholder="e.g., Software, Finance, Healthcare, Consulting"
                  />
                  <p className="text-xs text-muted-foreground">
                    The industry you&apos;re most interested in pursuing
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Work Experience</h3>
                      <p className="text-sm text-muted-foreground">
                        Add your professional work experience
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        setEditingWorkExp(null);
                        setWorkExpFormOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                  </div>

                  {workExperience.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No work experience added yet. Click &quot;Add Experience&quot; to get started.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {workExperience.map((entry) => (
                        <WorkExperienceCard
                          key={entry.id || entry.company}
                          entry={entry}
                          onEdit={(e) => {
                            setEditingWorkExp(e);
                            setWorkExpFormOpen(true);
                          }}
                          onDelete={handleWorkExperienceDelete}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Education */}
          <TabsContent value="education" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Education History</CardTitle>
                <CardDescription>
                  Your educational background
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Education</h3>
                    <p className="text-sm text-muted-foreground">
                      Add your educational qualifications
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setEditingEducation(null);
                      setEducationFormOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>

                {education.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No education history added yet. Click &quot;Add Education&quot; to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {education.map((entry) => (
                      <EducationCard
                        key={entry.id || entry.institution}
                        entry={entry}
                        onEdit={(e) => {
                          setEditingEducation(e);
                          setEducationFormOpen(true);
                        }}
                        onDelete={handleEducationDelete}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Error and Success Messages */}
        <div className="mt-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <p className="text-sm text-green-600">
                Profile updated successfully! Redirecting...
              </p>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 mt-6">
          <Button
            type="submit"
            disabled={saving || !major}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
          <Link href="/profile">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>

      {/* Work Experience Form Dialog */}
      <WorkExperienceForm
        entry={editingWorkExp}
        onSave={handleWorkExperienceSave}
        onCancel={() => {
          setWorkExpFormOpen(false);
          setEditingWorkExp(null);
        }}
        isOpen={workExpFormOpen}
      />

      {/* Education Form Dialog */}
      <EducationForm
        entry={editingEducation}
        onSave={handleEducationSave}
        onCancel={() => {
          setEducationFormOpen(false);
          setEditingEducation(null);
        }}
        isOpen={educationFormOpen}
      />

      {/* Info Card */}
      <Card className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>💡 Tip:</strong> The more information you provide, the better we can match you with mentors, 
            opportunities, and resources that align with your interests and career goals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
