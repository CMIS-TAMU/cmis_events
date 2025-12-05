'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Users, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Target,
  Building2,
  Eye,
  Download,
  Mail,
  Award,
  TrendingUp,
  Activity,
  RefreshCw,
  AlertCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { format } from 'date-fns';

export default function SponsorDashboardPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

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

  const { 
    data: stats, 
    isLoading, 
    error,
    refetch 
  } = trpc.sponsors.getDashboardStats.useQuery(
    undefined,
    { 
      enabled: !loading,
      staleTime: 30000, // Cache for 30 seconds
      refetchOnWindowFocus: false,
    }
  );

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Failed to Load Dashboard
            </CardTitle>
            <CardDescription>
              {error.message || 'An error occurred while loading dashboard data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button onClick={() => refetch()} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">
                  Go to Main Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const engagement = stats?.engagement || {};
  const tierConfig = stats?.tierConfig;
  const upcomingEvents = stats?.upcomingEvents || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Sponsor Dashboard</h1>
          <p className="text-muted-foreground">
            Track your engagement, view events, and manage student connections
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tier Information Banner */}
      {stats?.tier && tierConfig && (
        <Card className="mb-6 border-primary bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{tierConfig.name} Tier</h3>
                  <p className="text-sm text-muted-foreground">
                    {tierConfig.features.join(' • ')}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {stats.tier.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics - Hero Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Resume Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resume Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{engagement.resumes_viewed || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total views</p>
          </CardContent>
        </Card>

        {/* Resume Downloads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{engagement.resumes_downloaded || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Resumes downloaded</p>
          </CardContent>
        </Card>

        {/* Students Contacted */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Contacted</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{engagement.students_contacted || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total contacted</p>
          </CardContent>
        </Card>

        {/* Shortlisted */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.shortlistedCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Candidates</p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Your Engagement Metrics
                </CardTitle>
                <CardDescription>Track your activity and engagement with students</CardDescription>
              </div>
              <Link href="/sponsor/preferences">
                <Button variant="outline">
                  Manage Preferences
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Resume Views */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Eye className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Resume Views</p>
                      <p className="text-2xl font-bold">{engagement.resumes_viewed || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Downloads */}
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Download className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Downloads</p>
                      <p className="text-2xl font-bold">{engagement.resumes_downloaded || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Resumes saved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Students Contacted */}
              <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Mail className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contacted</p>
                      <p className="text-2xl font-bold">{engagement.students_contacted || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shortlisted */}
              <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Shortlisted</p>
                      <p className="text-2xl font-bold">{stats?.shortlistedCount || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Candidates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Last Login */}
              <Card className="border-gray-200 bg-gray-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-gray-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Active</p>
                      <p className="text-sm font-bold">
                        {engagement.last_login 
                          ? format(new Date(engagement.last_login), 'MMM d')
                          : 'Never'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Login time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Upcoming Events - Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events (Next 7 Days)
                  </CardTitle>
                  <CardDescription>Events happening in the coming week</CardDescription>
                </div>
                <Link href="/events">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events scheduled this week</p>
                  <Link href="/events" className="mt-4 inline-block">
                    <Button variant="outline" size="sm">
                      Browse Events
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event: any) => {
                    const isToday = new Date(event.starts_at).toDateString() === new Date().toDateString();
                    
                    return (
                      <Link 
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="block"
                      >
                        <div 
                          className={`p-4 border rounded-lg hover:bg-accent/50 transition-colors ${
                            isToday ? 'border-primary bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{event.title}</h3>
                                {isToday && (
                                  <Badge variant="default" className="text-xs">Today</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(event.starts_at), 'MMM d, yyyy • h:mm a')}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/sponsor/resumes">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Search Resumes
                </Button>
              </Link>
              <Link href="/sponsor/shortlist">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  My Shortlist
                </Button>
              </Link>
              <Link href="/sponsor/missions">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Technical Missions
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Browse Events
                </Button>
              </Link>
              <Link href="/sponsor/preferences">
                <Button variant="outline" className="w-full justify-start">
                  <Award className="h-4 w-4 mr-2" />
                  Preferences
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* System Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Available Resources</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Resumes:</span>
                    <span className="font-medium">{stats?.totalResumes || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Events:</span>
                    <span className="font-medium">{upcomingEvents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Registrations:</span>
                    <span className="font-medium">{stats?.totalRegistrations || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Attendance:</span>
                    <span className="font-medium">{stats?.totalAttendance || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All Features Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Sponsor Features</CardTitle>
          <CardDescription>Access all sponsor tools and features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/sponsor/resumes">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Resume Search
              </Button>
            </Link>
            <Link href="/sponsor/shortlist">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                My Shortlist
              </Button>
            </Link>
            <Link href="/sponsor/missions">
              <Button variant="outline" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Technical Missions
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Browse Events
              </Button>
            </Link>
            <Link href="/sponsor/preferences">
              <Button variant="outline" className="w-full justify-start">
                <Award className="h-4 w-4 mr-2" />
                Preferences
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
