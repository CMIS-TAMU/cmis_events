'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trophy, 
  MessageSquare, 
  BarChart3,
  AlertCircle,
  TrendingUp,
  UserPlus,
  Activity,
  QrCode,
  Briefcase,
  Zap,
  ArrowRight,
  Loader2,
  RefreshCw,
  Building2,
  Mail,
  Eye,
  Award
} from 'lucide-react';
import { format } from 'date-fns';
import type { DashboardData, Alert, UpcomingEvent, EventNeedingAttention } from '@/types/dashboard';
import { DashboardSkeleton } from '@/components/admin/DashboardSkeletons';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Use new comprehensive dashboard endpoint with caching
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError,
    refetch 
  } = trpc.analytics.getDashboard.useQuery(undefined, {
    staleTime: 30000, // Data is fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    retry: 2, // Retry failed requests twice
    retryDelay: 1000, // Wait 1 second between retries
  });

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      
      // Get user role
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      const role = profile?.role || 'user';
      setUserRole(role);
      
      if (role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      
      setLoading(false);
    }
    getUser();
  }, [router]);

  // Show skeleton loader while loading
  if (loading || dashboardLoading) {
    return <DashboardSkeleton />;
  }

  // Handle dashboard error
  if (dashboardError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Failed to Load Dashboard
            </CardTitle>
            <CardDescription>
              {dashboardError.message || 'An error occurred while loading dashboard data'}
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

  // Type-safe data extraction
  const dashboard: DashboardData = dashboardData || {
    metrics: {
      total_users: 0,
      new_users_7d: 0,
      total_events: 0,
      upcoming_events: 0,
      events_today: 0,
      events_this_week: 0,
      total_registrations: 0,
      pending_mentorship_requests: 0,
      active_competitions: 0,
      open_mini_sessions: 0,
      // Sponsor engagement metrics
      total_sponsors: 0,
      active_sponsors_30d: 0,
      low_engagement_sponsors: 0,
      total_resume_views: 0,
      sponsor_notification_rate: 0,
    },
    alerts: [],
    upcoming_events: [],
    events_needing_attention: [],
  };

  const metrics = dashboard.metrics;
  const alerts: Alert[] = dashboard.alerts;
  const upcomingEvents: UpcomingEvent[] = dashboard.upcoming_events;
  const eventsNeedingAttention: EventNeedingAttention[] = dashboard.events_needing_attention;

  const highPriorityAlerts = alerts.filter(a => a.severity === 'high');
  const mediumPriorityAlerts = alerts.filter(a => a.severity === 'medium');

  // Calculate user growth percentage (placeholder - would need previous week's data)
  const userGrowth = metrics.new_users_7d > 0 ? '+' + metrics.new_users_7d : '0';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Command center for managing events, users, and system operations
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/admin/events/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Alerts Banner - Critical Items */}
      {highPriorityAlerts.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="h-5 w-5" />
              Action Required ({highPriorityAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highPriorityAlerts.slice(0, 3).map((alert, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex-1">
                    <p className="font-medium text-red-900">{alert.title}</p>
                    <p className="text-sm text-red-700">{alert.description}</p>
                  </div>
                  <Link href={alert.action_url}>
                    <Button variant="outline" size="sm">
                      View
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ))}
              {highPriorityAlerts.length > 3 && (
                <p className="text-sm text-red-700 text-center pt-2">
                  +{highPriorityAlerts.length - 3} more alerts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics - Hero Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* System Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.total_users || 0}</div>
            <div className="flex items-center gap-2 mt-1">
              {metrics.new_users_7d > 0 && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <UserPlus className="h-3 w-3" />
                  +{metrics.new_users_7d} this week
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Events Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.total_events || 0}</div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>{metrics.events_today || 0} today</span>
              <span>•</span>
              <span>{metrics.events_this_week || 0} this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.total_registrations || 0}</div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>{metrics.pending_mentorship_requests || 0} mentor req</span>
              <span>•</span>
              <span>{metrics.active_competitions || 0} competitions</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{alerts.length}</div>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <Badge variant={highPriorityAlerts.length > 0 ? 'destructive' : 'secondary'}>
                {highPriorityAlerts.length} high
              </Badge>
              {mediumPriorityAlerts.length > 0 && (
                <Badge variant="outline">{mediumPriorityAlerts.length} medium</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Bar */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Link href="/admin/events/new">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </Link>
              <Link href="/admin/checkin">
                <Button variant="outline" className="w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  Check-in Tool
                </Button>
              </Link>
              <Link href="/admin/competitions">
                <Button variant="outline" className="w-full">
                  <Trophy className="h-4 w-4 mr-2" />
                  Competitions
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link href="/admin/registrations">
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Registrations
                </Button>
              </Link>
              <Link href="/admin/mentorship">
                <Button variant="outline" className="w-full">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Mentorship
                </Button>
              </Link>
              <Link href="/admin/sponsors">
                <Button variant="outline" className="w-full">
                  <Building2 className="h-4 w-4 mr-2" />
                  Sponsors
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sponsor Engagement Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Sponsor Engagement
                </CardTitle>
                <CardDescription>Track sponsor activity and engagement metrics</CardDescription>
              </div>
              <Link href="/admin/sponsors">
                <Button variant="outline">
                  Manage Sponsors
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Total Sponsors */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Sponsors</p>
                      <p className="text-2xl font-bold">{metrics.total_sponsors || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Sponsors */}
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Active (30d)</p>
                      <p className="text-2xl font-bold">{metrics.active_sponsors_30d || 0}</p>
                      {metrics.total_sponsors > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((metrics.active_sponsors_30d / metrics.total_sponsors) * 100)}% active
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Low Engagement */}
              <Card className={`${metrics.low_engagement_sponsors > 0 ? 'border-orange-200 bg-orange-50/50' : 'border-gray-200 bg-gray-50/50'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`h-8 w-8 ${metrics.low_engagement_sponsors > 0 ? 'text-orange-600' : 'text-gray-600'}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Low Engagement</p>
                      <p className="text-2xl font-bold">{metrics.low_engagement_sponsors || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">60+ days inactive</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resume Views */}
              <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Eye className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Resume Views</p>
                      <p className="text-2xl font-bold">{metrics.total_resume_views || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Rate */}
              <Card className="border-indigo-200 bg-indigo-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Mail className="h-8 w-8 text-indigo-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Notif. Rate</p>
                      <p className="text-2xl font-bold">{metrics.sponsor_notification_rate || 0}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Opened</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Upcoming Events This Week - Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events (This Week)
              </CardTitle>
              <CardDescription>Events happening in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events scheduled this week</p>
                  <Link href="/admin/events/new" className="mt-4 inline-block">
                    <Button variant="outline" size="sm">
                      Create Event
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event: any) => {
                    const isToday = new Date(event.starts_at).toDateString() === new Date().toDateString();
                    const fillRate = event.fill_rate || 0;
                    
                    return (
                      <div 
                        key={event.id} 
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
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(event.starts_at), 'MMM d, yyyy • h:mm a')}
                              </span>
                              {event.capacity > 0 && (
                                <span>
                                  {event.registered} / {event.capacity} registered
                                </span>
                              )}
                            </div>
                            {event.capacity > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      fillRate >= 80 ? 'bg-green-500' :
                                      fillRate >= 50 ? 'bg-blue-500' :
                                      fillRate >= 20 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(fillRate, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{fillRate}%</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {isToday && (
                              <Link href={`/admin/checkin?event=${event.id}`}>
                                <Button variant="default" size="sm">
                                  <QrCode className="h-4 w-4 mr-1" />
                                  Check-in
                                </Button>
                              </Link>
                            )}
                            <Link href={`/admin/events/${event.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Manage
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Events Needing Attention */}
          {eventsNeedingAttention.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-900">
                  <AlertCircle className="h-5 w-5" />
                  Events Needing Attention
                </CardTitle>
                <CardDescription>Events with low registration rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {eventsNeedingAttention.map((event: any) => {
                    const fillRate = event.capacity > 0 ? Math.round((event.registered / event.capacity) * 100) : 0;
                    return (
                      <div key={event.id} className="p-3 bg-white rounded-lg border border-yellow-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-yellow-900">{event.title}</p>
                            <p className="text-sm text-yellow-700">
                              {event.registered} of {event.capacity} registered ({fillRate}% full)
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                              {format(new Date(event.starts_at), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                          <Link href={`/admin/events/${event.id}/edit`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* All Alerts */}
          {alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Alerts & Notifications
                </CardTitle>
                <CardDescription>Items requiring your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {alerts.slice(0, 10).map((alert, idx) => {
                    const Icon = alert.type === 'low_registration' ? Users :
                                alert.type === 'missing_rubric' ? Trophy :
                                alert.type === 'upcoming_checkin' ? QrCode :
                                AlertCircle;
                    
                    return (
                      <Link 
                        key={idx} 
                        href={alert.action_url}
                        className="block p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <Icon className={`h-4 w-4 mt-0.5 ${
                            alert.severity === 'high' ? 'text-red-600' :
                            alert.severity === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{alert.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {alert.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {alerts.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{alerts.length - 10} more alerts
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Engagement Metrics</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mentorship Requests:</span>
                    <span className="font-medium">{metrics.pending_mentorship_requests || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mini Sessions:</span>
                    <span className="font-medium">{metrics.open_mini_sessions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Competitions:</span>
                    <span className="font-medium">{metrics.active_competitions || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Links Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Admin Features</CardTitle>
          <CardDescription>Access all administrative tools and features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/events">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Event Management
              </Button>
            </Link>
            <Link href="/admin/registrations">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                All Registrations
              </Button>
            </Link>
            <Link href="/admin/checkin">
              <Button variant="outline" className="w-full justify-start">
                <QrCode className="h-4 w-4 mr-2" />
                Check-in Tool
              </Button>
            </Link>
            <Link href="/admin/competitions">
              <Button variant="outline" className="w-full justify-start">
                <Trophy className="h-4 w-4 mr-2" />
                Competitions
              </Button>
            </Link>
            <Link href="/admin/feedback">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link href="/admin/mentorship">
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="h-4 w-4 mr-2" />
                Mentorship
              </Button>
            </Link>
            <Link href="/admin/sponsors">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Sponsors
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
