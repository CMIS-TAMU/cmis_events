'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  Star,
  Download,
  RefreshCw,
  CheckCircle2,
  UserPlus,
  Ticket,
  Loader2,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  const { data: overview, refetch: refetchOverview, isLoading: overviewLoading } = 
    trpc.analytics.getOverview.useQuery({ days: period });
  const { data: registrationTrends } = trpc.analytics.getRegistrationTrends.useQuery({ days: period });
  const { data: eventPerformance } = trpc.analytics.getEventPerformance.useQuery({ limit: 10 });
  const { data: userDistribution } = trpc.analytics.getUserDistribution.useQuery();
  const { data: popularEvents } = trpc.analytics.getPopularEvents.useQuery({ limit: 5 });

  useEffect(() => {
    async function checkAdmin() {
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

      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    }
    checkAdmin();
  }, [router]);

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map((row: any) => 
        headers.map(h => {
          const val = row[h];
          if (typeof val === 'string' && val.includes(',')) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val ?? '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor event performance and user engagement
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Period:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchOverview()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${overviewLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{overview?.total_users || 0}</p>
                {overview?.new_users ? (
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <UserPlus className="h-3 w-3" />
                    +{overview.new_users} new
                  </p>
                ) : null}
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-3xl font-bold">{overview?.total_events || 0}</p>
                {overview?.events_in_period ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    {overview.events_in_period} in period
                  </p>
                ) : null}
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Registrations</p>
                <p className="text-3xl font-bold">{overview?.total_registrations || 0}</p>
                {overview?.registrations_in_period ? (
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <Ticket className="h-3 w-3" />
                    +{overview.registrations_in_period} in period
                  </p>
                ) : null}
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  <p className="text-3xl font-bold">{overview?.avg_rating || '-'}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {overview?.feedback_count || 0} reviews
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mb-8">
        {/* Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Registration Trends
            </CardTitle>
            <CardDescription>Daily registrations over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {!registrationTrends || registrationTrends.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No registration data available
              </div>
            ) : (
              <div className="h-[200px] flex items-end gap-1">
                {registrationTrends.slice(-30).map((day: any, i: number) => {
                  const maxReg = Math.max(...registrationTrends.map((d: any) => d.registrations));
                  const height = maxReg > 0 ? (day.registrations / maxReg) * 100 : 0;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-primary/80 hover:bg-primary transition-colors rounded-t cursor-pointer group relative"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${day.date}: ${day.registrations} registrations`}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {format(new Date(day.date), 'MMM d')}: {day.registrations}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Distribution
            </CardTitle>
            <CardDescription>Users by role</CardDescription>
          </CardHeader>
          <CardContent>
            {!userDistribution || Object.keys(userDistribution).length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No user data available
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(userDistribution).map(([role, count]) => {
                  const total = Object.values(userDistribution).reduce((a, b) => a + b, 0);
                  const percentage = Math.round(((count as number) / total) * 100);
                  return (
                    <div key={role}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{role}</span>
                        <span className="text-sm text-muted-foreground">
                          {count as number} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mb-8">
        {/* Popular Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Upcoming Events
            </CardTitle>
            <CardDescription>Events with highest registration counts</CardDescription>
          </CardHeader>
          <CardContent>
            {!popularEvents || popularEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No upcoming events
              </p>
            ) : (
              <div className="space-y-3">
                {popularEvents.map((event: any, i: number) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{i + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{event.registered}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.fill_rate !== null ? `${event.fill_rate}% full` : 'Unlimited'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Recent Event Performance
            </CardTitle>
            <CardDescription>Attendance and feedback metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {!eventPerformance || eventPerformance.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No event data available
              </p>
            ) : (
              <div className="space-y-3">
                {eventPerformance.slice(0, 5).map((event: any) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium truncate flex-1">{event.title}</p>
                      {event.avg_rating && (
                        <div className="flex items-center gap-1 ml-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold">{event.avg_rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{event.registered} registered</span>
                      <span>{event.checked_in} checked in</span>
                      {event.fill_rate !== null && (
                        <Badge variant={event.fill_rate >= 80 ? 'default' : 'secondary'}>
                          {event.fill_rate}% full
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>Download data as CSV for further analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <ExportButton type="events" period={period} />
            <ExportButton type="registrations" period={period} />
            <ExportButton type="users" period={period} />
            <ExportButton type="feedback" period={period} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export button component that handles its own data fetching
function ExportButton({ type, period }: { type: 'events' | 'registrations' | 'users' | 'feedback'; period: number }) {
  const [isExporting, setIsExporting] = useState(false);
  const { refetch } = trpc.analytics.exportData.useQuery(
    { type, days: period },
    { enabled: false }
  );

  const icons: Record<string, any> = {
    events: Calendar,
    registrations: Ticket,
    users: Users,
    feedback: Star,
  };
  const Icon = icons[type];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await refetch();
      const data = result.data;
      
      if (!data || data.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map((row: any) => 
          headers.map(h => {
            const val = row[h];
            if (typeof val === 'string' && val.includes(',')) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val ?? '';
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Icon className="h-4 w-4 mr-2" />
      )}
      Export {type.charAt(0).toUpperCase() + type.slice(1)}
    </Button>
  );
}

