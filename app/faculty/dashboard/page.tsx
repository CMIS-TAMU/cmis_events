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
import { FacultyOnly, AuthenticatedOnly } from '@/components/auth';
import {
  Loader2,
  Calendar,
  Users,
  GraduationCap,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ExternalLink,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';

export default function FacultyDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { role, isLoading: roleLoading } = useUserRole();

  // Fetch data
  const { data: profile } = trpc.auth.getCurrentUser.useQuery(undefined, {
    enabled: !loading && !roleLoading,
  });

  const { data: upcomingEvents } = trpc.events.getAll.useQuery(
    { upcoming: true, limit: 10 },
    { enabled: !loading && !roleLoading }
  );

  const { data: mentorRequests } = trpc.mentorship.getMentorMatchBatch.useQuery(undefined, {
    enabled: !loading && !roleLoading,
  });

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Get user role and verify faculty access
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userProfile?.role !== 'faculty' && userProfile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    }
    getUser();
  }, [router]);

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
      <FacultyOnly
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Access Restricted</p>
              <p className="text-muted-foreground">
                This dashboard is only available to faculty members.
              </p>
              <Link href="/dashboard" className="mt-4 inline-block">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        }
      >
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Faculty Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back{profile?.profile?.full_name ? `, ${profile.profile.full_name}` : ''}! Manage your teaching and mentoring activities.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Welcome Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Faculty Resources
                </CardTitle>
                <CardDescription>Your teaching and mentoring hub</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Role:</span> {role || 'faculty'}
                </p>
              </CardContent>
            </Card>

            {/* Mentor Requests Card */}
            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mentor Requests
                </CardTitle>
                <CardDescription>Student mentorship requests</CardDescription>
              </CardHeader>
              <CardContent>
                {mentorRequests && mentorRequests.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{mentorRequests.length}</span>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {mentorRequests.length === 1
                        ? 'New mentorship request'
                        : `${mentorRequests.length} new requests`}
                    </p>
                    <Link href="/mentorship/mentor/requests">
                      <Button className="w-full mt-2" size="sm">
                        View Requests
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">No pending requests</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Students can request you as a mentor
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Mentees Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Active Mentees
                </CardTitle>
                <CardDescription>Students you&apos;re mentoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    View and manage your active mentorship relationships
                  </p>
                  <Link href="/mentorship/mentor/mentees">
                    <Button variant="outline" className="w-full" size="sm">
                      Manage Mentees
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>Events and sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents && upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 3).map((event: any) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          {event.starts_at && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(event.starts_at), 'MMM d, yyyy • h:mm a')}
                            </p>
                          )}
                        </div>
                        <Link href={`/events/${event.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                    <Link href="/events">
                      <Button variant="outline" className="w-full">
                        View All Events
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      No upcoming events
                    </p>
                    <Link href="/events">
                      <Button variant="outline">Browse Events</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/mentorship/dashboard" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Mentorship Dashboard
                  </Button>
                </Link>
                <Link href="/mentorship/mentor/requests" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Requests
                  </Button>
                </Link>
                <Link href="/mentorship/mentor/questions" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Quick Questions
                  </Button>
                </Link>
                <Link href="/events" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Browse Events
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    My Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Teaching Resources Card */}
            <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle>Teaching & Mentoring</CardTitle>
                <CardDescription>Resources and tools</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Access mentoring tools and resources to help guide students
                </p>
                <div className="space-y-2">
                  <Link href="/mentorship/dashboard">
                    <Button variant="outline" className="w-full">
                      Mentorship Portal
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </FacultyOnly>
    </AuthenticatedOnly>
  );
}

