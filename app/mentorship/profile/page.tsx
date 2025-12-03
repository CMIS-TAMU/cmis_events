'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save, CheckCircle2 } from 'lucide-react';

export default function MentorshipProfilePage() {
  const router = useRouter();
  const [profileType, setProfileType] = useState<'student' | 'mentor'>('student');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state - Student
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [researchInterests, setResearchInterests] = useState('');
  const [careerGoals, setCareerGoals] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState('');
  const [gpa, setGpa] = useState('');
  const [bio, setBio] = useState('');
  const [communicationPrefs, setCommunicationPrefs] = useState<string[]>([]);
  const [meetingFrequency, setMeetingFrequency] = useState<string>('monthly');
  const [mentorshipType, setMentorshipType] = useState<string[]>([]);

  // Form state - Mentor
  const [industry, setIndustry] = useState('');
  const [organization, setOrganization] = useState('');
  const [jobDesignation, setJobDesignation] = useState('');
  const [tamuGradYear, setTamuGradYear] = useState('');
  const [location, setLocation] = useState('');
  const [areasOfExpertise, setAreasOfExpertise] = useState('');
  const [maxMentees, setMaxMentees] = useState('3');

  // Check existing profile
  const { data: existingProfile, isLoading: profileLoading, refetch } = trpc.mentorship.getProfile.useQuery();
  
  const createProfile = trpc.mentorship.createProfile.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push('/mentorship/dashboard');
      }, 2000);
    },
    onError: (err) => {
      setError(err.message);
      setLoading(false);
    },
  });

  const updateProfile = trpc.mentorship.updateProfile.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setLoading(false);
      refetch();
      setTimeout(() => {
        router.push('/mentorship/dashboard');
      }, 2000);
    },
    onError: (err) => {
      setError(err.message);
      setLoading(false);
    },
  });

  // Load existing profile data
  useEffect(() => {
    if (existingProfile) {
      setProfileType(existingProfile.profile_type || 'student');
      setMajor(existingProfile.major || '');
      setGraduationYear(existingProfile.graduation_year?.toString() || '');
      setResearchInterests((existingProfile.research_interests || []).join(', '));
      setCareerGoals(existingProfile.career_goals || '');
      setTechnicalSkills((existingProfile.technical_skills || []).join(', '));
      setGpa(existingProfile.gpa?.toString() || '');
      setBio(existingProfile.bio || '');
      setCommunicationPrefs(existingProfile.communication_preferences || []);
      setMeetingFrequency(existingProfile.meeting_frequency || 'monthly');
      setMentorshipType(existingProfile.mentorship_type || []);

      // Mentor fields
      setIndustry(existingProfile.industry || '');
      setOrganization(existingProfile.organization || '');
      setJobDesignation(existingProfile.job_designation || '');
      setTamuGradYear(existingProfile.tamu_graduation_year?.toString() || '');
      setLocation(existingProfile.location || '');
      setAreasOfExpertise((existingProfile.areas_of_expertise || []).join(', '));
      setMaxMentees(existingProfile.max_mentees?.toString() || '3');
    }
  }, [existingProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Parse comma-separated arrays
      const researchInterestsArray = researchInterests
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      const technicalSkillsArray = technicalSkills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      const areasOfExpertiseArray = areasOfExpertise
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const profileData: any = {
        profile_type: profileType,
        bio,
        communication_preferences: communicationPrefs,
        meeting_frequency: meetingFrequency,
        mentorship_type: mentorshipType,
        in_matching_pool: true,
        availability_status: 'active',
      };

      if (profileType === 'student') {
        if (!major) {
          setError('Major is required');
          setLoading(false);
          return;
        }
        profileData.major = major;
        if (graduationYear) profileData.graduation_year = parseInt(graduationYear);
        if (researchInterestsArray.length > 0) profileData.research_interests = researchInterestsArray;
        if (careerGoals) profileData.career_goals = careerGoals;
        if (technicalSkillsArray.length > 0) profileData.technical_skills = technicalSkillsArray;
        if (gpa) profileData.gpa = parseFloat(gpa);
      } else {
        if (!industry) {
          setError('Industry is required');
          setLoading(false);
          return;
        }
        profileData.industry = industry;
        if (organization) profileData.organization = organization;
        if (jobDesignation) profileData.job_designation = jobDesignation;
        if (tamuGradYear) profileData.tamu_graduation_year = parseInt(tamuGradYear);
        if (location) profileData.location = location;
        if (areasOfExpertiseArray.length > 0) profileData.areas_of_expertise = areasOfExpertiseArray;
        if (maxMentees) profileData.max_mentees = parseInt(maxMentees);
      }

      if (existingProfile) {
        await updateProfile.mutateAsync(profileData);
      } else {
        await createProfile.mutateAsync(profileData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      setLoading(false);
    }
  };

  const toggleCommunicationPref = (pref: string) => {
    setCommunicationPrefs(prev =>
      prev.includes(pref)
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  const toggleMentorshipType = (type: string) => {
    setMentorshipType(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold mb-2">
          {existingProfile ? 'Edit' : 'Create'} Mentorship Profile
        </h1>
        <p className="text-muted-foreground">
          Set up your profile to connect with {profileType === 'student' ? 'mentors' : 'students'}
        </p>
      </div>

      {success && (
        <Card className="mb-6 border-green-500 bg-green-50">
          <CardContent className="p-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-800">Profile saved successfully! Redirecting...</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile Type</CardTitle>
          <CardDescription>Choose whether you&apos;re a student or mentor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={profileType === 'student' ? 'default' : 'outline'}
              onClick={() => setProfileType('student')}
              disabled={!!existingProfile}
            >
              Student
            </Button>
            <Button
              type="button"
              variant={profileType === 'mentor' ? 'default' : 'outline'}
              onClick={() => setProfileType('mentor')}
              disabled={!!existingProfile}
            >
              Mentor
            </Button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{profileType === 'student' ? 'Student' : 'Mentor'} Information</CardTitle>
            <CardDescription>
              Provide details to help us match you with the right {profileType === 'student' ? 'mentor' : 'student'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {profileType === 'student' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="major">Major *</Label>
                  <Input
                    id="major"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g., Computer Science"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      min="2020"
                      max="2030"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="2025"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gpa">GPA</Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.0"
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      placeholder="3.5"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="researchInterests">Research Interests (comma-separated)</Label>
                  <Input
                    id="researchInterests"
                    value={researchInterests}
                    onChange={(e) => setResearchInterests(e.target.value)}
                    placeholder="e.g., Machine Learning, Data Science, AI"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple interests with commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="technicalSkills">Technical Skills (comma-separated)</Label>
                  <Input
                    id="technicalSkills"
                    value={technicalSkills}
                    onChange={(e) => setTechnicalSkills(e.target.value)}
                    placeholder="e.g., Python, React, SQL"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple skills with commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="careerGoals">Career Goals</Label>
                  <textarea
                    id="careerGoals"
                    value={careerGoals}
                    onChange={(e) => setCareerGoals(e.target.value)}
                    placeholder="Describe your career goals and what you hope to achieve..."
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={loading}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Technology, Finance, Healthcare"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g., Microsoft, Google"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobDesignation">Job Title</Label>
                    <Input
                      id="jobDesignation"
                      value={jobDesignation}
                      onChange={(e) => setJobDesignation(e.target.value)}
                      placeholder="e.g., Software Engineer"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tamuGradYear">TAMU Graduation Year</Label>
                    <Input
                      id="tamuGradYear"
                      type="number"
                      min="1900"
                      max="2030"
                      value={tamuGradYear}
                      onChange={(e) => setTamuGradYear(e.target.value)}
                      placeholder="2015"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Austin, TX"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="areasOfExpertise">Areas of Expertise (comma-separated)</Label>
                  <Input
                    id="areasOfExpertise"
                    value={areasOfExpertise}
                    onChange={(e) => setAreasOfExpertise(e.target.value)}
                    placeholder="e.g., Software Engineering, Product Management, Leadership"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple areas with commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMentees">Max Number of Mentees</Label>
                  <Input
                    id="maxMentees"
                    type="number"
                    min="1"
                    max="10"
                    value={maxMentees}
                    onChange={(e) => setMaxMentees(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Communication Preferences</Label>
              <div className="flex flex-wrap gap-2">
                {['email', 'slack', 'zoom', 'in-person'].map((pref) => (
                  <Button
                    key={pref}
                    type="button"
                    variant={communicationPrefs.includes(pref) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleCommunicationPref(pref)}
                    disabled={loading}
                  >
                    {pref}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingFrequency">Preferred Meeting Frequency</Label>
              <select
                id="meetingFrequency"
                value={meetingFrequency}
                onChange={(e) => setMeetingFrequency(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="as-needed">As Needed</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Mentorship Type</Label>
              <div className="flex flex-wrap gap-2">
                {['career', 'research', 'project', 'general'].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={mentorshipType.includes(type) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleMentorshipType(type)}
                    disabled={loading}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

