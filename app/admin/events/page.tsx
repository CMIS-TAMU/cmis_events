'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Calendar, Users } from 'lucide-react';
import { EventCard } from '@/components/events/event-card';

export default function AdminEventsPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const { data: events, isLoading, refetch } = trpc.events.getAll.useQuery({ limit: 100 });
  const deleteMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
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

  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      deleteMutation.mutate({ id: eventId });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const upcomingEvents = events?.filter((e) => new Date(e.starts_at) > new Date()) || [];
  const pastEvents = events?.filter((e) => new Date(e.starts_at) <= new Date()) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Events</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage all events
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Past Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastEvents.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <Card className="p-12">
            <CardContent className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No Upcoming Events</CardTitle>
              <CardDescription className="mb-4">
                Create your first event to get started
              </CardDescription>
              <Link href="/admin/events/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="relative">
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <Link href={`/admin/events/${event.id}/edit`}>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(event.id, event.title)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Link href={`/events/${event.id}`}>
                  <EventCard event={event} showRegisterButton={false} />
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Past Events</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event) => (
              <Card key={event.id} className="relative opacity-75">
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <Link href={`/admin/events/${event.id}/edit`}>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(event.id, event.title)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Link href={`/events/${event.id}`}>
                  <EventCard event={event} showRegisterButton={false} />
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

