'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  User, 
  FileText, 
  Mail, 
  Shield, 
  Edit,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Building2,
  GraduationCap,
  Briefcase,
  Calendar,
  Award
} from 'lucide-react';
import { format } from 'date-fns';
import { WorkExperienceCard, type WorkExperienceEntry } from '@/components/profile/work-experience-form';
import { EducationCard, type EducationEntry } from '@/components/profile/education-form';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push('/login');
        return;
      }

      setUser(authUser);

      // Get user profile from database
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(userProfile);
      }

      setLoading(false);
    }
    getUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const metadata = profile?.metadata || {};
  const skills = profile?.skills || [];
  const researchInterests = metadata?.research_interests || [];
  const workExperience = (profile?.work_experience || []) as WorkExperienceEntry[];
  const education = (profile?.education || []) as EducationEntry[];

  const hasStudentData = profile?.role === 'student' && (
    profile?.major ||
    skills.length > 0 ||
    researchInterests.length > 0 ||
    profile?.preferred_industry ||
    workExperience.length > 0 ||
    education.length > 0
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            View and manage your account information
          </p>
        </div>
        {profile?.role === 'student' && (
          <Link href="/profile/edit">
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        )}
      </div>

      {/* Basic Profile Information */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-sm">
                {profile?.full_name || user?.user_metadata?.full_name || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <p className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="capitalize">{profile?.role || user?.user_metadata?.role || 'user'}</span>
              </p>
            </div>
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile?.role === 'student' && (
              <Link href="/profile/edit" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Student Profile
                </Button>
              </Link>
            )}
            <Link href="/profile/resume" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Manage Resume
              </Button>
            </Link>
            <Link href="/registrations" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                My Registrations
              </Button>
            </Link>
            <Link href="/sessions" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                My Sessions
              </Button>
            </Link>
            {profile?.role === 'sponsor' && (
              <Link href="/sponsor/dashboard" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Sponsor Portal
                </Button>
              </Link>
            )}
            {profile?.role === 'admin' && (
              <Link href="/admin/dashboard" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Profile Details - Tabs */}
      {hasStudentData && (
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
                  {metadata?.career_goals && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Career Goals</p>
                      <p className="text-sm whitespace-pre-wrap">{metadata.career_goals}</p>
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
                          onEdit={() => router.push('/profile/edit?tab=education')}
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
                          onEdit={() => router.push('/profile/edit?tab=professional')}
                          onDelete={() => {}}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {workExperience.length === 0 && !profile?.preferred_industry && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No professional information available. <Link href="/profile/edit" className="text-primary hover:underline">Add information</Link>
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
                <CardDescription>How others can reach you</CardDescription>
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
                    No contact information available. <Link href="/profile/edit" className="text-primary hover:underline">Add contact details</Link>
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State for Non-Students or Students with No Data */}
      {!hasStudentData && profile?.role === 'student' && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Your profile is empty. Add information to get started!
            </p>
            <Link href="/profile/edit">
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
