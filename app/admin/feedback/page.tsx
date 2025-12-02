'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  Star,
  TrendingUp,
  Search,
  Download,
  BarChart3,
  Trash2,
  Loader2,
} from 'lucide-react';

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const { data: events } = trpc.events.getAll.useQuery({ limit: 100 });
  const { data: trends } = trpc.feedback.getTrends.useQuery({ days: 90 });
  const { data: feedbackList, refetch: refetchFeedback } = trpc.feedback.getByEvent.useQuery(
    { event_id: selectedEvent! },
    { enabled: !!selectedEvent }
  );
  const { data: summary } = trpc.feedback.getSummary.useQuery(
    { event_id: selectedEvent! },
    { enabled: !!selectedEvent }
  );

  const deleteMutation = trpc.feedback.delete.useMutation({
    onSuccess: () => refetchFeedback(),
  });

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

  const filteredEvents = events?.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const exportFeedback = () => {
    if (!feedbackList) return;

    const csv = [
      ['Date', 'Rating', 'Comment', 'User', 'Anonymous'].join(','),
      ...feedbackList.map((f: any) => [
        format(new Date(f.created_at), 'yyyy-MM-dd HH:mm'),
        f.rating,
        `"${(f.comment || '').replace(/"/g, '""')}"`,
        f.user_id ? (f.users?.email || 'Unknown') : 'Anonymous',
        f.user_id ? 'No' : 'Yes',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${selectedEvent}.csv`;
    a.click();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      await deleteMutation.mutateAsync({ id });
    }
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Feedback Management</h1>
        <p className="text-muted-foreground">
          View and analyze event feedback from attendees
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sidebar - Event Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Select Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {filteredEvents.map((event) => {
                    const eventTrend = trends?.find((t: any) => t.event_id === event.id);
                    return (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedEvent === event.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <p className="font-medium truncate">{event.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {format(new Date(event.starts_at), 'MMM d, yyyy')}
                          </span>
                          {eventTrend && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-xs">{eventTrend.avg_rating}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trends Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!trends || trends.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No feedback data yet
                </p>
              ) : (
                <div className="space-y-3">
                  {trends.slice(0, 5).map((trend: any) => (
                    <div key={trend.event_id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{trend.event_title}</p>
                        <p className="text-xs text-muted-foreground">
                          {trend.total_responses} response{trend.total_responses !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{trend.avg_rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedEvent ? (
            <Card className="p-12">
              <CardContent className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">Select an Event</CardTitle>
                <CardDescription>
                  Choose an event from the list to view its feedback
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Stats */}
              {summary && (
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold">{summary.total_responses}</p>
                        <p className="text-sm text-muted-foreground">Responses</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                          <span className="text-3xl font-bold">{summary.avg_rating || '-'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Avg Rating</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground mb-2 text-center">Distribution</p>
                      <div className="flex items-end justify-center gap-1 h-12">
                        {[5, 4, 3, 2, 1].map((r) => {
                          const count = summary.rating_distribution[r] || 0;
                          const maxCount = Math.max(...Object.values(summary.rating_distribution as Record<string, number>));
                          const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                          return (
                            <div key={r} className="flex flex-col items-center gap-1 flex-1">
                              <div
                                className="w-full bg-yellow-400 rounded-t max-w-[20px]"
                                style={{ height: `${Math.max(height, 4)}%`, minHeight: '4px' }}
                              />
                              <span className="text-xs">{r}★</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Feedback List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Feedback Responses</CardTitle>
                      <CardDescription>
                        {feedbackList?.length || 0} response{feedbackList?.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={exportFeedback} disabled={!feedbackList?.length}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!feedbackList || feedbackList.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No feedback received yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {feedbackList.map((feedback: any) => (
                        <div key={feedback.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= feedback.rating
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              {!feedback.user_id && (
                                <Badge variant="secondary">Anonymous</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(feedback.created_at), 'MMM d, yyyy h:mm a')}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDelete(feedback.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          {feedback.user_id && feedback.users && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {feedback.users.full_name || feedback.users.email}
                            </p>
                          )}
                          {feedback.comment && (
                            <p className="text-sm">{feedback.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

