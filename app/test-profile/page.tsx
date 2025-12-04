'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Using inline textarea instead of Textarea component
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TestProfilePage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  
  const updateProfile = trpc.auth.updateStudentProfile.useMutation({
    onSuccess: (data) => {
      console.log('✅ Profile updated:', data);
      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    },
    onError: (error) => {
      console.error('❌ Error:', error);
      alert(`Error: ${error.message}`);
    },
  });

  const updateWorkExp = trpc.auth.updateWorkExperience.useMutation({
    onSuccess: (data) => {
      console.log('✅ Work experience updated:', data);
      alert('Work experience updated successfully!');
    },
    onError: (error) => {
      console.error('❌ Error:', error);
      alert(`Error: ${error.message}`);
    },
  });

  const updateEducation = trpc.auth.updateEducation.useMutation({
    onSuccess: (data) => {
      console.log('✅ Education updated:', data);
      alert('Education updated successfully!');
    },
    onError: (error) => {
      console.error('❌ Error:', error);
      alert(`Error: ${error.message}`);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateProfile.mutate({
      phone: formData.get('phone') as string || undefined,
      linkedin_url: formData.get('linkedin_url') as string || undefined,
      github_url: formData.get('github_url') as string || undefined,
      website_url: formData.get('website_url') as string || undefined,
      address: formData.get('address') as string || undefined,
      preferred_industry: formData.get('industry') as string || undefined,
      degree_type: formData.get('degree_type') as 'bachelor' | 'master' | 'phd' | 'associate' | 'certificate' || undefined,
    });
  };

  const handleWorkExpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateWorkExp.mutate({
      work_experience: [
        {
          company: formData.get('company') as string,
          position: formData.get('position') as string,
          start_date: formData.get('start_date') as string,
          end_date: formData.get('end_date') as string || null,
          description: formData.get('description') as string || undefined,
          is_current: formData.get('is_current') === 'on',
          location: formData.get('location') as string || undefined,
        },
      ],
    });
  };

  const handleEducationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateEducation.mutate({
      education: [
        {
          institution: formData.get('institution') as string,
          degree: formData.get('degree') as string,
          field_of_study: formData.get('field_of_study') as string,
          start_date: formData.get('edu_start_date') as string,
          end_date: formData.get('edu_end_date') as string || null,
          gpa: formData.get('gpa') ? parseFloat(formData.get('gpa') as string) : undefined,
          is_current: formData.get('edu_is_current') === 'on',
          location: formData.get('edu_location') as string || undefined,
        },
      ],
    });
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Profile Update Test Page</h1>
        <p className="text-muted-foreground">
          Testing Phase 1 tRPC mutations for student profile updates
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <p>Profile updated successfully! Redirecting...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Details Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test: Update Contact Details</CardTitle>
          <CardDescription>Test updating phone, LinkedIn, GitHub, etc.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Preferred Industry</Label>
                <Input id="industry" name="industry" placeholder="Software, Finance, Healthcare" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input id="linkedin_url" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/yourname" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input id="github_url" name="github_url" type="url" placeholder="https://github.com/yourusername" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input id="website_url" name="website_url" type="url" placeholder="https://yourwebsite.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <textarea
                id="address"
                name="address"
                placeholder="123 Main St, City, State, ZIP"
                rows={2}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree_type">Degree Type</Label>
              <select
                id="degree_type"
                name="degree_type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select...</option>
                <option value="bachelor">Bachelor</option>
                <option value="master">Master</option>
                <option value="phd">PhD</option>
                <option value="associate">Associate</option>
                <option value="certificate">Certificate</option>
              </select>
            </div>
            <Button type="submit" disabled={updateProfile.isLoading} className="w-full">
              {updateProfile.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Update Contact Details'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Work Experience Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test: Update Work Experience</CardTitle>
          <CardDescription>Test adding work experience entry</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWorkExpSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" required placeholder="Tech Corp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" name="position" required placeholder="Software Engineer" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" name="start_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date (leave empty if current)</Label>
                <Input id="end_date" name="end_date" type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input id="location" name="location" placeholder="City, State" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Job responsibilities..."
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="is_current" name="is_current" className="rounded" />
              <Label htmlFor="is_current" className="font-normal">Current Position</Label>
            </div>
            <Button type="submit" disabled={updateWorkExp.isLoading} className="w-full">
              {updateWorkExp.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Work Experience'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Education Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test: Update Education</CardTitle>
          <CardDescription>Test adding education entry</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEducationSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input id="institution" name="institution" required placeholder="Texas A&M University" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="degree">Degree</Label>
                <Input id="degree" name="degree" required placeholder="Bachelor of Science" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field_of_study">Field of Study</Label>
                <Input id="field_of_study" name="field_of_study" required placeholder="Computer Science" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edu_start_date">Start Date</Label>
                <Input id="edu_start_date" name="edu_start_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edu_end_date">End Date (leave empty if current)</Label>
                <Input id="edu_end_date" name="edu_end_date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpa">GPA (Optional)</Label>
                <Input id="gpa" name="gpa" type="number" step="0.01" min="0" max="4.0" placeholder="3.75" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu_location">Location (Optional)</Label>
              <Input id="edu_location" name="edu_location" placeholder="College Station, TX" />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="edu_is_current" name="edu_is_current" className="rounded" />
              <Label htmlFor="edu_is_current" className="font-normal">Currently Enrolled</Label>
            </div>
            <Button type="submit" disabled={updateEducation.isLoading} className="w-full">
              {updateEducation.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Education'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> This is a test page. Make sure you&apos;re logged in as a student 
              to test these mutations. Check the browser console and network tab for detailed results.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

