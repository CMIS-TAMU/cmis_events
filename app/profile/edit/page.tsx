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
import { Loader2, ArrowLeft, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');

  // Form state
  const [major, setMajor] = useState('');
  const [skills, setSkills] = useState('');
  const [researchInterests, setResearchInterests] = useState('');
  const [careerGoals, setCareerGoals] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [gpa, setGpa] = useState('');
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

  useEffect(() => {
    async function loadProfile() {
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
        setMajor(profile.major || '');
        setSkills((profile.skills || []).join(', '));
        
        // Load research interests from metadata
        const metadata = profile.metadata || {};
        const interests = metadata.research_interests || [];
        setResearchInterests(Array.isArray(interests) ? interests.join(', ') : '');
        
        setCareerGoals(metadata.career_goals || '');
        setGraduationYear(profile.graduation_year?.toString() || '');
        setGpa(profile.gpa?.toString() || '');
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    // Parse skills and research interests from comma-separated strings
    const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
    const interestsArray = researchInterests.split(',').map(s => s.trim()).filter(s => s);

    updateProfile.mutate({
      major: major || undefined,
      skills: skillsArray.length > 0 ? skillsArray : undefined,
      research_interests: interestsArray.length > 0 ? interestsArray : undefined,
      career_goals: careerGoals || undefined,
      graduation_year: graduationYear ? parseInt(graduationYear) : undefined,
      gpa: gpa ? parseFloat(gpa) : undefined,
    });
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/profile" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Link>
        <h1 className="text-4xl font-bold mb-2">Edit Student Profile</h1>
        <p className="text-muted-foreground">
          Update your information to help us match you with the right mentors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>
            Fill in your academic and professional details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Major */}
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

            {/* Skills */}
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

            {/* Research Interests */}
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

            {/* Career Goals */}
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

            {/* Graduation Year and GPA */}
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

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <p className="text-sm text-green-600">
                  Profile updated successfully! Redirecting...
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
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
                    Save Changes
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
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> The more information you provide (skills, research interests, career goals), 
            the better we can match you with mentors who share your interests and can help guide your career path.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

