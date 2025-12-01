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
import { Plus, Edit, Trash2, Users, Trophy, Calendar } from 'lucide-react';

export default function AdminCompetitionsPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const { data: competitions, isLoading, refetch } = trpc.competitions.getAll.useQuery();
  const deleteMutation = trpc.competitions.delete.useMutation({
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

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the competition "${title}"? This will delete all associated teams, submissions, and scores.`)) {
      deleteMutation.mutate({ id });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading competitions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Case Competitions</h1>
          <p className="text-muted-foreground">
            Manage case competitions and judging
          </p>
        </div>
        <Link href="/admin/competitions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Competition
          </Button>
        </Link>
      </div>

      {competitions && competitions.length === 0 ? (
        <Card className="p-12">
          <CardContent className="text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No Competitions Yet</CardTitle>
            <CardDescription className="mb-4">
              Create your first case competition to get started
            </CardDescription>
            <Link href="/admin/competitions/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Competition
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {competitions?.map((competition: any) => {
            const event = competition.events;
            const deadline = competition.deadline ? new Date(competition.deadline) : null;
            const isPastDeadline = deadline && deadline < new Date();

            return (
              <Card key={competition.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl line-clamp-2">{competition.title}</CardTitle>
                    <Badge
                      variant={
                        competition.status === 'open' ? 'default' :
                        competition.status === 'closed' ? 'secondary' :
                        competition.status === 'judging' ? 'outline' :
                        'default'
                      }
                    >
                      {competition.status || 'open'}
                    </Badge>
                  </div>
                  {event && (
                    <CardDescription>
                      Event: {event.title}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {competition.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {competition.description}
                    </p>
                  )}
                  {deadline && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={isPastDeadline ? 'text-red-600' : 'text-muted-foreground'}>
                        Deadline: {format(deadline, 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      Team size: {competition.min_team_size || 2} - {competition.max_team_size || 4}
                    </span>
                  </div>
                  {competition.results_published && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                      Results Published
                    </Badge>
                  )}
                </CardContent>
                <CardContent className="pt-0 space-y-2">
                  <Link href={`/admin/competitions/${competition.id}`} className="block">
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleDelete(competition.id, competition.title)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

