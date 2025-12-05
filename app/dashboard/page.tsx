'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { RoleGuard, AuthenticatedOnly, StudentOnly } from '@/components/auth';
import { 
  Loader2, 
  Calendar, 
  FileText, 
  GraduationCap, 
  Briefcase,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  ExternalLink,
  Zap,
  Video
} from 'lucide-react';
import { format } from 'date-fns';
import { ProfileCompletenessCard } from '@/components/profile/ProfileCompletenessCard';
import { calculateProfileCompleteness } from '@/lib/profile/completeness';
import { RecommendedMentorsCard } from '@/components/mentorship/RecommendedMentorsCard';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { role, isLoading: roleLoading } = useUserRole();

  // Fetch data
  const { data: profile } = trpc.auth.getCurrentUser.useQuery(undefined, {
    enabled: !loading && !roleLoading,
  });

  const { data: upcomingEvents } = trpc.events.getAll.useQuery(
    { upcoming: true, limit: 5 },
    { enabled: !loading && !roleLoading }
  );

  const { data: registrations } = trpc.registrations.getMyRegistrations.useQuery(undefined, {
    enabled: !loading && !roleLoading,
  });

  const { data: resume } = trpc.resumes.getMyResume.useQuery(undefined, {
    enabled: !loading && !roleLoading && (role === 'student' || role === 'user'),
  });

  const { data: activeMatch } = trpc.mentorship.getActiveMatch.useQuery(undefined, {
    enabled: !loading && !roleLoading && (role === 'student' || role === 'user'),
  });

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, [router]);

  // Redirect to role-specific dashboard when role is loaded
  useEffect(() => {
    if (!roleLoading && role) {
      if (window.location.pathname === '/dashboard') {
        switch (role) {
          case 'admin':
            router.push('/admin/dashboard');
            return;
          case 'sponsor':
            router.push('/sponsor/dashboard');
            return;
          case 'faculty':
            router.push('/faculty/dashboard');
            return;
          case 'student':
          case 'user':
          default:
            // Students and default users stay on main dashboard
            break;
        }
      }
    }
  }, [role, roleLoading, router]);

  // Calculate profile completion for display
  const profileCompleteness = profile?.profile 
    ? calculateProfileCompleteness(profile.profile)
    : { percentage: 0, missingFields: [] };

  // Get upcoming registrations
  const upcomingRegistrations = registrations?.filter((reg: any) => {
    if (!reg.events?.starts_at) return false;
    return new Date(reg.events.starts_at) > new Date();
  }).slice(0, 3) || [];

  if (loading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedOnly
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">Please log in to access the dashboard.</div>
        </div>
      }
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {role === 'student' ? 'Student Dashboard' : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            Welcome back{profile?.profile?.full_name ? `, ${profile.profile.full_name}` : ''}! Here&apos;s your overview.
          </p>
        </div>

        {/* Student-Specific Dashboard */}
        <StudentOnly>
          {/* Profile Completion Prompt (shown if incomplete) */}
          {profile?.profile && profileCompleteness.percentage < 100 && (
            <div className="mb-6">
              <ProfileCompletenessCard profile={profile.profile} />
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">

            {/* Academic Summary Card */}
            {profile?.profile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Academic Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {profile.profile.major && (
                    <div>
                      <p className="text-xs text-muted-foreground">Major</p>
                      <p className="text-sm font-medium">{profile.profile.major}</p>
                    </div>
                  )}
                  {profile.profile.graduation_year && (
                    <div>
                      <p className="text-xs text-muted-foreground">Graduation Year</p>
                      <p className="text-sm font-medium">{profile.profile.graduation_year}</p>
                    </div>
                  )}
                  {profile.profile.gpa && (
                    <div>
                      <p className="text-xs text-muted-foreground">GPA</p>
                      <p className="text-sm font-medium">{profile.profile.gpa.toFixed(2)}</p>
                    </div>
                  )}
                  {(!profile.profile.major && !profile.profile.graduation_year) && (
                    <p className="text-sm text-muted-foreground">Add your academic information</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Resume Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resume Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resume?.resume_url ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Resume Uploaded</span>
                    </div>
                    {resume.resume_uploaded_at && (
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {format(new Date(resume.resume_uploaded_at), 'MMM d, yyyy')}
                      </p>
                    )}
                    {resume.resume_version && (
                      <p className="text-xs text-muted-foreground">
                        Version {resume.resume_version}
                      </p>
                    )}
                    <Link href="/profile/resume">
                      <Button variant="outline" className="w-full mt-2" size="sm">
                        Manage Resume
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">No Resume Uploaded</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload your resume to increase visibility to sponsors
                    </p>
                    <Link href="/profile/resume">
                      <Button className="w-full mt-2" size="sm">
                        Upload Resume
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Second Row - Events and Mentorship */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {/* Upcoming Events Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>Events you&apos;re registered for</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingRegistrations.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingRegistrations.map((reg: any) => (
                      <div
                        key={reg.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{reg.events?.title}</p>
                          {reg.events?.starts_at && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(reg.events.starts_at), 'MMM d, yyyy • h:mm a')}
                            </p>
                          )}
                          {reg.status === 'waitlist' && (
                            <Badge variant="outline" className="mt-1">
                              Waitlisted
                            </Badge>
                          )}
                        </div>
                        <Link href={`/events/${reg.events?.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                    <Link href="/registrations">
                      <Button variant="outline" className="w-full">
                        View All Registrations
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      No upcoming event registrations
                    </p>
                    <Link href="/events">
                      <Button variant="outline">Browse Events</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mentorship Status Card - Show active match OR recommendations */}
            {activeMatch ? (
              <Card className="border-primary bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎓 Mentorship Program
                  </CardTitle>
                  <CardDescription>Connect with mentors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Active Match</span>
                    </div>
                    {activeMatch.mentor?.full_name && (
                      <p className="text-sm">
                        Mentor: <span className="font-medium">{activeMatch.mentor.full_name}</span>
                      </p>
                    )}
                    <Link href="/mentorship/dashboard">
                      <Button className="w-full mt-2" size="sm">
                        View Match Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <RecommendedMentorsCard />
            )}
          </div>

          {/* Third Row - Quick Actions and Discover */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/events" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Browse Events
                  </Button>
                </Link>
                <Link href="/profile/edit" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
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
                    <Clock className="h-4 w-4 mr-2" />
                    My Sessions
                  </Button>
                </Link>
                {(role === 'student' || role === 'user' || role === 'faculty') && (
                  <Link href="/mentorship/dashboard" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Zap className="h-4 w-4 mr-2" />
                      Mini Mentorship
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Discover Events */}
            {upcomingEvents && upcomingEvents.length > 0 && (
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Discover Events
                  </CardTitle>
                  <CardDescription>Upcoming events you might be interested in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3">
                    {upcomingEvents.slice(0, 3).map((event: any) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <p className="font-medium text-sm mb-1">{event.title}</p>
                        {event.starts_at && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.starts_at), 'MMM d, yyyy')}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                  <Link href="/events" className="block mt-4">
                    <Button variant="outline" className="w-full">
                      View All Events
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </StudentOnly>

        {/* Faculty Dashboard Preview (redirects to /faculty/dashboard) */}
        <RoleGuard allowedRoles={['faculty']}>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                Faculty dashboard features coming soon. Redirecting...
              </p>
              <Link href="/faculty/dashboard">
                <Button>Go to Faculty Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </RoleGuard>

        {/* Admin/Sponsor Quick Links (should redirect but show link if they land here) */}
        <RoleGuard allowedRoles={['admin']}>
          <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
            <CardContent className="pt-6">
              <Link href="/admin/dashboard">
                <Button className="w-full">
                  Go to Admin Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </RoleGuard>

        <RoleGuard allowedRoles={['sponsor', 'admin']}>
          <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-6">
              <Link href="/sponsor/dashboard">
                <Button className="w-full">
                  Go to Sponsor Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </RoleGuard>
      </div>
    </AuthenticatedOnly>
  );
}
