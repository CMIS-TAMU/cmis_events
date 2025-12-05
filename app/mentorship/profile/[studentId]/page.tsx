'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  User, 
  FileText, 
  Mail, 
  ArrowLeft,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Building2,
  GraduationCap,
  Briefcase,
  Calendar,
  Award,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { WorkExperienceCard, type WorkExperienceEntry, EducationCard, type EducationEntry } from '@/components/profile/index';

export default function StudentProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;
  const [activeTab, setActiveTab] = useState('overview');

  // Get student profile
  const { data: profile, isLoading, error } = trpc.mentorship.getStudentProfile.useQuery(
    { student_id: studentId },
    { enabled: !!studentId }
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Error Loading Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || 'Failed to load student profile'}
            </p>
            <Link href="/mentorship/mentor/requests">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Requests
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Student Not Found</CardTitle>
            <CardDescription>The student profile you&apos;re looking for doesn&apos;t exist</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/mentorship/mentor/requests">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Requests
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metadata = profile?.metadata || {};
  const skills = profile?.skills || [];
  const researchInterests = metadata?.research_interests || [];
  const workExperience = (profile?.work_experience || []) as WorkExperienceEntry[];
  const education = (profile?.education || []) as EducationEntry[];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Link href="/mentorship/mentor/requests" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Student Requests
        </Link>
        <h1 className="text-4xl font-bold mb-2">Student Profile</h1>
        <p className="text-muted-foreground">
          Review student information before making a decision
        </p>
      </div>

      {/* Basic Profile Information */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Student account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-sm font-medium">
                {profile?.full_name || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {profile?.email}
              </p>
            </div>
            {profile?.phone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </p>
                <p className="text-sm mt-1">{profile.phone}</p>
              </div>
            )}
            {profile?.created_at && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-sm">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Links */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & Links</CardTitle>
            <CardDescription>Student&apos;s online presence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile?.linkedin_url && (
              <div>
                <a 
                  href={profile.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-2"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Profile
                </a>
              </div>
            )}
            {profile?.github_url && (
              <div>
                <a 
                  href={profile.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  GitHub Profile
                </a>
              </div>
            )}
            {profile?.website_url && (
              <div>
                <a 
                  href={profile.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Website/Portfolio
                </a>
              </div>
            )}
            {!profile?.linkedin_url && !profile?.github_url && !profile?.website_url && (
              <p className="text-sm text-muted-foreground">No contact links available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Profile Details - Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6">
            {/* Academic Summary */}
            {(profile?.major || profile?.degree_type || profile?.graduation_year) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Academic Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile?.major && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Major</p>
                      <p className="text-sm">{profile.major}</p>
                    </div>
                  )}
                  {profile?.degree_type && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Degree Type</p>
                      <p className="text-sm capitalize">{profile.degree_type}</p>
                    </div>
                  )}
                  {profile?.graduation_year && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Graduation Year</p>
                      <p className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {profile.graduation_year}
                      </p>
                    </div>
                  )}
                  {profile?.gpa && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">GPA</p>
                      <p className="text-sm flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        {profile.gpa.toFixed(2)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Technical Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Research Interests */}
            {researchInterests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Research Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {researchInterests.map((interest: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preferred Industry */}
            {profile?.preferred_industry && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Preferred Industry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{profile.preferred_industry}</p>
                </CardContent>
              </Card>
            )}

            {/* Career Goals */}
            {metadata?.career_goals && (
              <Card>
                <CardHeader>
                  <CardTitle>Career Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{metadata.career_goals}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="mt-6">
          <div className="grid gap-6">
            {/* Academic Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.major && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Major</p>
                    <p className="text-sm">{profile.major}</p>
                  </div>
                )}
                {profile?.degree_type && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Degree Type</p>
                    <p className="text-sm capitalize">{profile.degree_type}</p>
                  </div>
                )}
                {profile?.graduation_year && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Graduation Year</p>
                    <p className="text-sm">{profile.graduation_year}</p>
                  </div>
                )}
                {profile?.gpa && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">GPA</p>
                    <p className="text-sm">{profile.gpa.toFixed(2)}</p>
                  </div>
                )}
                {skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Technical Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {researchInterests.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Research Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {researchInterests.map((interest: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education History */}
            {education.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {education.map((entry) => (
                      <EducationCard
                        key={entry.id || entry.institution}
                        entry={entry}
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Professional Tab */}
        <TabsContent value="professional" className="mt-6">
          <div className="grid gap-6">
            {/* Preferred Industry */}
            {profile?.preferred_industry && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Preferred Industry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{profile.preferred_industry}</p>
                </CardContent>
              </Card>
            )}

            {/* Work Experience */}
            {workExperience.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workExperience.map((entry) => (
                      <WorkExperienceCard
                        key={entry.id || entry.company}
                        entry={entry}
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Career Goals */}
            {metadata?.career_goals && (
              <Card>
                <CardHeader>
                  <CardTitle>Career Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{metadata.career_goals}</p>
                </CardContent>
              </Card>
            )}

            {workExperience.length === 0 && !profile?.preferred_industry && !metadata?.career_goals && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No professional information available.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Student contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </p>
                  <p className="text-sm mt-1">{profile.phone}</p>
                </div>
              )}
              {profile?.address && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </p>
                  <p className="text-sm mt-1">{profile.address}</p>
                </div>
              )}
              {profile?.linkedin_url && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </p>
                  <a 
                    href={profile.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-1 block"
                  >
                    {profile.linkedin_url}
                  </a>
                </div>
              )}
              {profile?.github_url && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </p>
                  <a 
                    href={profile.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-1 block"
                  >
                    {profile.github_url}
                  </a>
                </div>
              )}
              {profile?.website_url && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website/Portfolio
                  </p>
                  <a 
                    href={profile.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-1 block"
                  >
                    {profile.website_url}
                  </a>
                </div>
              )}
              {!profile?.phone && !profile?.address && !profile?.linkedin_url && !profile?.github_url && !profile?.website_url && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No contact information available.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Back Button */}
      <div className="mt-6">
        <Link href="/mentorship/mentor/requests">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Student Requests
          </Button>
        </Link>
      </div>
    </div>
  );
}

