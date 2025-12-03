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
  const [profileType] = useState<'mentor'>('mentor'); // Fixed to mentor only
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common form state
  const [bio, setBio] = useState('');
  const [communicationPrefs, setCommunicationPrefs] = useState<string[]>([]);
  const [meetingFrequency, setMeetingFrequency] = useState<string>('monthly');
  const [mentorshipType, setMentorshipType] = useState<string>('');

  // Form state - Mentor
  const [industry, setIndustry] = useState('');
  const [organization, setOrganization] = useState('');
  const [jobDesignation, setJobDesignation] = useState('');
  const [tamuGradYear, setTamuGradYear] = useState('');
  const [location, setLocation] = useState('');
  const [areasOfExpertise, setAreasOfExpertise] = useState('');
  const [maxMentees, setMaxMentees] = useState('3');
  // Mentor contact fields
  const [preferredName, setPreferredName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');

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
      setBio(existingProfile.bio || '');
      setCommunicationPrefs(existingProfile.communication_preferences || []);
      setMeetingFrequency(existingProfile.meeting_frequency || 'monthly');
      setMentorshipType(existingProfile.mentorship_type || '');

      // Mentor fields
      setIndustry(existingProfile.industry || '');
      setOrganization(existingProfile.organization || '');
      setJobDesignation(existingProfile.job_designation || '');
      setTamuGradYear(existingProfile.tamu_graduation_year?.toString() || '');
      setLocation(existingProfile.location || '');
      setAreasOfExpertise((existingProfile.areas_of_expertise || []).join(', '));
      setMaxMentees(existingProfile.max_mentees?.toString() || '3');
      // Mentor contact fields
      setPreferredName(existingProfile.preferred_name || '');
      setPhoneNumber(existingProfile.phone_number || '');
      setLinkedinUrl(existingProfile.linkedin_url || '');
      setWebsiteUrl(existingProfile.website_url || '');
      setContactEmail(existingProfile.contact_email || '');
    }
  }, [existingProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Parse comma-separated arrays
      const areasOfExpertiseArray = areasOfExpertise
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (!industry) {
        setError('Industry is required');
        setLoading(false);
        return;
      }

      const profileData: any = {
        profile_type: 'mentor',
        industry,
        in_matching_pool: true,
        availability_status: 'active',
      };

      // Add optional fields only if they have values
      if (bio) profileData.bio = bio;
      if (communicationPrefs.length > 0) profileData.communication_preferences = communicationPrefs;
      if (meetingFrequency) profileData.meeting_frequency = meetingFrequency;
      if (mentorshipType) profileData.mentorship_type = mentorshipType;

      if (organization) profileData.organization = organization;
      if (jobDesignation) profileData.job_designation = jobDesignation;
      if (tamuGradYear) profileData.tamu_graduation_year = parseInt(tamuGradYear);
      if (location) profileData.location = location;
      if (areasOfExpertiseArray.length > 0) profileData.areas_of_expertise = areasOfExpertiseArray;
      if (maxMentees) profileData.max_mentees = parseInt(maxMentees);
      // Contact information fields
      if (preferredName) profileData.preferred_name = preferredName;
      if (phoneNumber) profileData.phone_number = phoneNumber;
      if (linkedinUrl) profileData.linkedin_url = linkedinUrl;
      if (websiteUrl) profileData.website_url = websiteUrl;
      if (contactEmail) profileData.contact_email = contactEmail;

      if (existingProfile) {
        await updateProfile.mutateAsync(profileData);
      } else {
        await createProfile.mutateAsync(profileData);
      }
    } catch (err: any) {
      console.error('Profile save error:', err);
      const errorMessage = err.message || err.data?.message || 'Failed to save profile. Please check the browser console for details.';
      setError(errorMessage);
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

  const handleMentorshipTypeChange = (type: string) => {
    setMentorshipType(type);
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
          {existingProfile ? 'Edit' : 'Create'} Mentor Profile
        </h1>
        <p className="text-muted-foreground">
          Set up your mentor profile to connect with students seeking guidance
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

      <form onSubmit={handleSubmit} className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Mentor Information</CardTitle>
            <CardDescription>
              Provide details to help us match you with the right students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Mentor Contact Information */}
                <div className="space-y-4 border-b pb-4 mb-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="preferredName">Preferred Name</Label>
                    <Input
                      id="preferredName"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                      placeholder="e.g., John Doe"
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">Your preferred display name for mentorship</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="contact@example.com"
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">Optional: if different from account email</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                      <Input
                        id="linkedinUrl"
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/yourname"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl">Website/Portfolio URL</Label>
                      <Input
                        id="websiteUrl"
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4 border-b pb-4 mb-4">
                  <h3 className="text-lg font-semibold">Professional Information</h3>
                  
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
                </div>

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
              <select
                id="mentorshipType"
                value={mentorshipType}
                onChange={(e) => handleMentorshipTypeChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              >
                <option value="">Select mentorship type</option>
                <option value="career">Career</option>
                <option value="research">Research</option>
                <option value="project">Project</option>
                <option value="general">General</option>
              </select>
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

