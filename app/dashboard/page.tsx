'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Sign out
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Role:</span>{' '}
                {user?.user_metadata?.role || 'student'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎓 Mentorship Program
            </CardTitle>
            <CardDescription>Connect with experienced mentors</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get guidance from industry professionals and alumni mentors
            </p>
            <div className="space-y-2">
              <Link href="/mentorship/dashboard" className="block">
                <Button className="w-full">
                  Request a Mentor
                </Button>
              </Link>
              <Link href="/mentorship/dashboard" className="block">
                <Button variant="outline" className="w-full">
                  View Mentorship Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Events</CardTitle>
            <CardDescription>Events you&apos;re registered for</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage your event registrations
            </p>
            <Link href="/registrations">
              <Button variant="outline" className="w-full">
                View My Registrations
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/events" className="block">
              <Button variant="outline" className="w-full">
                Browse Events
              </Button>
            </Link>
            <Link href="/missions" className="block">
              <Button variant="outline" className="w-full">
                Browse Missions
              </Button>
            </Link>
            <Link href="/leaderboard" className="block">
              <Button variant="outline" className="w-full">
                View Leaderboard
              </Button>
            </Link>
            <Link href="/registrations" className="block">
              <Button variant="outline" className="w-full">
                My Registrations
              </Button>
            </Link>
            <Link href="/profile/missions" className="block">
              <Button variant="outline" className="w-full">
                My Mission Submissions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

