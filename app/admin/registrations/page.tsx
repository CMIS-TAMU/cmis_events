'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Download, Calendar, Mail } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  starts_at: string;
  capacity: number;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
}

interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  registered_at: string;
  events: Event;
  users: User;
}

export default function AdminRegistrationsPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: events } = trpc.events.getAll.useQuery({ limit: 100 });
  const { data: registrations, isLoading, refetch } = trpc.registrations.getAll.useQuery({
    event_id: selectedEvent !== 'all' ? selectedEvent : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
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

  // Filter registrations by search query
  const filteredRegistrations = registrations?.filter((reg: Registration) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      reg.users?.email?.toLowerCase().includes(query) ||
      reg.users?.full_name?.toLowerCase().includes(query) ||
      reg.events?.title?.toLowerCase().includes(query)
    );
  }) || [];

  // Group registrations by status
  const registered = filteredRegistrations.filter((r: Registration) => r.status === 'registered');
  const cancelled = filteredRegistrations.filter((r: Registration) => r.status === 'cancelled');
  const checkedIn = filteredRegistrations.filter((r: Registration) => r.status === 'checked_in');

  // Group by event
  const registrationsByEvent = filteredRegistrations.reduce((acc: Record<string, Registration[]>, reg: Registration) => {
    const eventId = reg.event_id;
    if (!acc[eventId]) {
      acc[eventId] = [];
    }
    acc[eventId].push(reg);
    return acc;
  }, {});

  const handleExportCSV = () => {
    const csv = [
      ['Event', 'User Email', 'User Name', 'Status', 'Registered At'].join(','),
      ...filteredRegistrations.map((reg: Registration) =>
        [
          `"${reg.events?.title || 'N/A'}"`,
          `"${reg.users?.email || 'N/A'}"`,
          `"${reg.users?.full_name || 'N/A'}"`,
          `"${reg.status}"`,
          `"${format(new Date(reg.registered_at), 'yyyy-MM-dd HH:mm')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Registrations</h1>
          <p className="text-muted-foreground">
            View and manage all event registrations
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRegistrations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Registered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{registered.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{cancelled.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{checkedIn.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Events</option>
              {events?.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="cancelled">Cancelled</option>
              <option value="checked_in">Checked In</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Registrations List */}
      {filteredRegistrations.length === 0 ? (
        <Card className="p-12">
          <CardContent className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No Registrations Found</CardTitle>
            <CardDescription>
              {searchQuery || selectedEvent !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'No registrations yet'}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(registrationsByEvent).map(([eventId, eventRegs]) => {
            const regs = eventRegs as Registration[];
            const event = regs[0]?.events;
            if (!event) return null;

            return (
              <Card key={eventId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription>
                        {format(new Date(event.starts_at), 'MMMM d, yyyy')} •{' '}
                        {regs.length} registration{regs.length !== 1 ? 's' : ''}
                        {event.capacity > 0 && ` • Capacity: ${event.capacity}`}
                      </CardDescription>
                    </div>
                    <Link href={`/events/${eventId}`}>
                      <Button variant="outline" size="sm">
                        View Event
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">User</th>
                          <th className="text-left p-2 font-medium">Email</th>
                          <th className="text-left p-2 font-medium">Status</th>
                          <th className="text-left p-2 font-medium">Registered At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {regs.map((reg: Registration) => (
                          <tr key={reg.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">
                              {reg.users?.full_name || 'N/A'}
                              {reg.users?.role && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {reg.users.role}
                                </Badge>
                              )}
                            </td>
                            <td className="p-2">
                              <a
                                href={`mailto:${reg.users?.email}`}
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                <Mail className="h-3 w-3" />
                                {reg.users?.email || 'N/A'}
                              </a>
                            </td>
                            <td className="p-2">
                              <Badge
                                variant={
                                  reg.status === 'registered'
                                    ? 'default'
                                    : reg.status === 'cancelled'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                {reg.status.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="p-2 text-sm text-muted-foreground">
                              {format(new Date(reg.registered_at), 'MMM d, yyyy HH:mm')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

