'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { SessionDialog } from '@/components/sessions/session-dialog';

export default function EventSessionsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);

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

      const role = profile?.role || 'user';
      setUserRole(role);

      if (role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    }
    checkAdmin();
  }, [router]);

  const { data: event } = trpc.events.getById.useQuery({ id: eventId });
  const { data: sessions, refetch } = trpc.sessions.getByEvent.useQuery({ event_id: eventId });

  const deleteMutation = trpc.sessions.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      deleteMutation.mutate({ id: sessionId });
    }
  };

  const handleEdit = (session: any) => {
    setEditingSession(session);
    setShowDialog(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/admin/events/${eventId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Event
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Sessions: {event?.title || 'Loading...'}
            </h1>
            <p className="text-muted-foreground">
              Manage sessions for this event
            </p>
          </div>
          <Button onClick={() => { setEditingSession(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Session
          </Button>
        </div>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((session: any) => {
            const startDate = new Date(session.starts_at);
            const endDate = new Date(session.ends_at);
            return (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{session.title}</CardTitle>
                      {session.description && (
                        <CardDescription className="mt-2">
                          {session.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(session)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <strong>Date:</strong> {format(startDate, 'MMM d, yyyy')}
                    </p>
                    <p>
                      <strong>Time:</strong> {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                    </p>
                    {session.capacity > 0 && (
                      <p>
                        <strong>Capacity:</strong> {session.capacity}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12">
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              No sessions created yet. Add your first session to get started.
            </p>
            <Button onClick={() => { setEditingSession(null); setShowDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Session
            </Button>
          </CardContent>
        </Card>
      )}

      {showDialog && (
        <SessionDialog
          eventId={eventId}
          session={editingSession}
          open={showDialog}
          onClose={() => {
            setShowDialog(false);
            setEditingSession(null);
          }}
          onSuccess={() => {
            setShowDialog(false);
            setEditingSession(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

