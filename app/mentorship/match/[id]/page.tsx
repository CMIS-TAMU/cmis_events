'use client';

import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Calendar, Star, MessageSquare, AlertTriangle, CheckCircle2, Clock, ArrowRight, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [isStudent, setIsStudent] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: '',
    feedback_type: 'general' as 'general' | 'match-quality' | 'session' | 'final',
  });

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        setIsStudent(profile?.role === 'student');
      }
    }
    getUser();
  }, []);

  const { data: match, isLoading, error } = trpc.mentorship.getMatchById.useQuery(
    { match_id: matchId },
    { enabled: !!matchId && !!user }
  );

  const { data: feedback, refetch: refetchFeedback } = trpc.mentorship.getFeedback.useQuery(
    { match_id: matchId },
    { enabled: !!matchId }
  );

  const submitFeedback = trpc.mentorship.submitFeedback.useMutation({
    onSuccess: () => {
      refetchFeedback();
      setIsFeedbackDialogOpen(false);
      setFeedbackData({
        rating: 5,
        comment: '',
        feedback_type: 'general',
      });
    },
  });

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback.mutate({
      match_id: matchId,
      rating: feedbackData.rating,
      comment: feedbackData.comment || undefined,
      feedback_type: feedbackData.feedback_type,
    });
  };

  const { data: meetingLogs } = trpc.mentorship.getMeetingLogs.useQuery(
    { match_id: matchId },
    { enabled: !!matchId }
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive mb-4">
              {error?.message || 'Match not found'}
            </p>
            <Link href="/mentorship/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const partner = isStudent ? match.mentor : match.student;
  const matchDate = new Date(match.matched_at);
  const lastMeetingDate = match.last_meeting_at ? new Date(match.last_meeting_at) : null;
  const totalMeetings = meetingLogs?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/mentorship/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold mb-2">Match Details</h1>
        <p className="text-muted-foreground">
          Your mentorship connection with {partner?.full_name || partner?.email || 'your mentor'}
        </p>
      </div>

      {/* Match Status Alert */}
      {match.is_at_risk && (
        <Card className="mb-6 border-yellow-500 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Match Health Alert</p>
              <p className="text-xs text-yellow-700">{match.at_risk_reason || 'This match needs attention'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Match Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Match Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Match Score</p>
                  <p className="text-2xl font-bold">{match.match_score || 'N/A'}/100</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={match.status === 'active' ? 'default' : 'secondary'}>
                    {match.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Matched On</p>
                  <p className="font-medium">{format(matchDate, 'MMM d, yyyy')}</p>
                </div>
                {lastMeetingDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Meeting</p>
                    <p className="font-medium">{format(lastMeetingDate, 'MMM d, yyyy')}</p>
                  </div>
                )}
              </div>
              {match.match_reasoning && typeof match.match_reasoning === 'object' && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Why this match?</p>
                  <div className="space-y-2 text-sm">
                    {Object.entries(match.match_reasoning).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-medium">{value?.score || value || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Partner Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {isStudent ? 'Mentor Profile' : 'Student Profile'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-lg">{partner?.full_name || 'Not provided'}</p>
              </div>
              {partner?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{partner.email}</p>
                </div>
              )}
              {isStudent && partner && (
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm font-medium">Skills & Interests</p>
                  {partner.major && (
                    <div>
                      <p className="text-xs text-muted-foreground">Major</p>
                      <p className="text-sm">{partner.major}</p>
                    </div>
                  )}
                  {partner.skills && Array.isArray(partner.skills) && partner.skills.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Skills</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {partner.skills.map((skill: string) => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meeting Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Meeting Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Meetings</p>
                  <p className="text-2xl font-bold">{totalMeetings}</p>
                </div>
                {lastMeetingDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Meeting</p>
                    <p className="font-medium">{format(lastMeetingDate, 'MMM d, yyyy')}</p>
                  </div>
                )}
              </div>
              <Link href={`/mentorship/match/${matchId}/meetings`}>
                <Button variant="outline" className="w-full mt-4">
                  View Meeting Logs
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/mentorship/match/${matchId}/meetings`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Meetings
                </Button>
              </Link>
              <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Feedback</DialogTitle>
                    <DialogDescription>
                      Share your feedback about this mentorship match
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="feedback_type">Feedback Type</Label>
                      <select
                        id="feedback_type"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={feedbackData.feedback_type}
                        onChange={(e) => setFeedbackData({ ...feedbackData, feedback_type: e.target.value as any })}
                      >
                        <option value="general">General</option>
                        <option value="match-quality">Match Quality</option>
                        <option value="session">Session</option>
                        <option value="final">Final</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="rating">Rating *</Label>
                      <div className="flex items-center gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setFeedbackData({ ...feedbackData, rating })}
                            className={`p-2 rounded ${
                              feedbackData.rating >= rating
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          >
                            <Star
                              className={`h-6 w-6 ${
                                feedbackData.rating >= rating ? 'fill-current' : ''
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {feedbackData.rating}/5
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="comment">Comment (Optional)</Label>
                      <textarea
                        id="comment"
                        className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
                        placeholder="Share your thoughts about this mentorship..."
                        value={feedbackData.comment}
                        onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsFeedbackDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitFeedback.isPending}>
                        {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Match Health */}
          {match.health_score !== null && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Match Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {match.health_score >= 4 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : match.health_score >= 3 ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">{match.health_score}/5</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Feedback */}
          {feedback && feedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feedback.slice(0, 3).map((fb: any) => (
                    <div key={fb.id} className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <div className="flex-1">
                        <p className="text-xs font-medium">{fb.rating}/5</p>
                        {fb.comment && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{fb.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

