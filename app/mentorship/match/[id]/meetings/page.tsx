'use client';

import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, Clock, Video, Phone, Mail, MapPin, Plus, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function MeetingLogsPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    meeting_date: '',
    duration_minutes: '',
    meeting_type: 'virtual' as 'virtual' | 'in-person' | 'phone' | 'email',
    agenda: '',
    student_notes: '',
    mentor_notes: '',
  });

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    }
    getUser();
  }, []);

  const { data: match } = trpc.mentorship.getMatchById.useQuery(
    { match_id: matchId },
    { enabled: !!matchId && !!user }
  );

  const { data: meetingLogs, isLoading, refetch } = trpc.mentorship.getMeetingLogs.useQuery(
    { match_id: matchId },
    { enabled: !!matchId }
  );

  const logMeeting = trpc.mentorship.logMeeting.useMutation({
    onSuccess: () => {
      refetch();
      setIsDialogOpen(false);
      setFormData({
        meeting_date: '',
        duration_minutes: '',
        meeting_type: 'virtual',
        agenda: '',
        student_notes: '',
        mentor_notes: '',
      });
    },
  });

  const isStudent = user && match && match.student_id === user.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    logMeeting.mutate({
      match_id: matchId,
      meeting_date: new Date(formData.meeting_date).toISOString(),
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
      meeting_type: formData.meeting_type,
      agenda: formData.agenda || undefined,
      student_notes: isStudent ? formData.student_notes || undefined : undefined,
      mentor_notes: !isStudent ? formData.mentor_notes || undefined : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading meeting logs...</p>
        </div>
      </div>
    );
  }

  const totalMinutes = meetingLogs?.reduce((sum: number, log: any) => sum + (log.duration_minutes || 0), 0) || 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/mentorship/match/${matchId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Match Details
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Meeting Logs</h1>
            <p className="text-muted-foreground">
              Track and log your mentorship meetings
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Log Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log a New Meeting</DialogTitle>
                <DialogDescription>
                  Record details about your mentorship meeting
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meeting_date">Meeting Date *</Label>
                    <Input
                      id="meeting_date"
                      type="datetime-local"
                      value={formData.meeting_date}
                      onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                      id="duration_minutes"
                      type="number"
                      placeholder="60"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="meeting_type">Meeting Type *</Label>
                  <select
                    id="meeting_type"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.meeting_type}
                    onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value as any })}
                    required
                  >
                    <option value="virtual">Virtual</option>
                    <option value="in-person">In-Person</option>
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="agenda">Agenda</Label>
                  <textarea
                    id="agenda"
                    className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background"
                    placeholder="What was discussed in this meeting?"
                    value={formData.agenda}
                    onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  />
                </div>
                {isStudent ? (
                  <div>
                    <Label htmlFor="student_notes">Your Notes</Label>
                    <textarea
                      id="student_notes"
                      className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
                      placeholder="Add your notes about the meeting..."
                      value={formData.student_notes}
                      onChange={(e) => setFormData({ ...formData, student_notes: e.target.value })}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="mentor_notes">Your Notes</Label>
                    <textarea
                      id="mentor_notes"
                      className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
                      placeholder="Add your notes about the meeting..."
                      value={formData.mentor_notes}
                      onChange={(e) => setFormData({ ...formData, mentor_notes: e.target.value })}
                    />
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={logMeeting.isPending}>
                    {logMeeting.isPending ? 'Logging...' : 'Log Meeting'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Meetings</p>
                <p className="text-2xl font-bold">{meetingLogs?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">
                  {totalHours > 0 ? `${totalHours}h ` : ''}{remainingMinutes}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Average Duration</p>
                <p className="text-2xl font-bold">
                  {meetingLogs && meetingLogs.length > 0
                    ? `${Math.round(totalMinutes / meetingLogs.length)}m`
                    : '0m'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meeting Logs List */}
      {!meetingLogs || meetingLogs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No Meetings Logged</CardTitle>
            <CardDescription>
              Start tracking your mentorship meetings by logging your first meeting.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetingLogs.map((log: any) => {
            const meetingDate = new Date(log.meeting_date);
            const typeIcons = {
              virtual: Video,
              'in-person': MapPin,
              phone: Phone,
              email: Mail,
            };
            const TypeIcon = typeIcons[log.meeting_type as keyof typeof typeIcons] || Calendar;

            return (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <TypeIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">
                          {format(meetingDate, 'EEEE, MMMM d, yyyy')}
                        </CardTitle>
                        <CardDescription>
                          {format(meetingDate, 'h:mm a')}
                          {log.duration_minutes && ` • ${log.duration_minutes} minutes`}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {log.meeting_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {log.agenda && (
                    <div>
                      <p className="text-sm font-medium mb-1">Agenda</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.agenda}</p>
                    </div>
                  )}
                  {log.discussion_points && log.discussion_points.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Discussion Points</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {log.discussion_points.map((point: string, idx: number) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {log.action_items && log.action_items.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Action Items</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {log.action_items.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(log.student_notes || log.mentor_notes) && (
                    <div className="pt-4 border-t">
                      {log.student_notes && (
                        <div className="mb-2">
                          <p className="text-sm font-medium mb-1">Student Notes</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.student_notes}</p>
                        </div>
                      )}
                      {log.mentor_notes && (
                        <div>
                          <p className="text-sm font-medium mb-1">Mentor Notes</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.mentor_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

