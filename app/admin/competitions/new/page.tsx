'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const competitionFormSchema = z.object({
  event_id: z.string().uuid('Please select an event'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  rules: z.string().optional(),
  submission_instructions: z.string().optional(),
  deadline: z.string().optional(),
  max_team_size: z.string(),
  min_team_size: z.string(),
});

type CompetitionFormData = z.infer<typeof competitionFormSchema>;

export default function NewCompetitionPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const { data: events } = trpc.events.getAll.useQuery({ limit: 100 });
  const createMutation = trpc.competitions.create.useMutation({
    onSuccess: (data) => {
      router.push(`/admin/competitions/${data.id}`);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompetitionFormData>({
    resolver: zodResolver(competitionFormSchema),
    defaultValues: {
      max_team_size: '4',
      min_team_size: '2',
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

  const onSubmit = async (data: CompetitionFormData) => {
    try {
      await createMutation.mutateAsync({
        event_id: data.event_id,
        title: data.title,
        description: data.description || undefined,
        rules: data.rules || undefined,
        submission_instructions: data.submission_instructions || undefined,
        deadline: data.deadline || undefined,
        max_team_size: parseInt(data.max_team_size) || 4,
        min_team_size: parseInt(data.min_team_size) || 2,
      });
    } catch (error: any) {
      console.error('Error creating competition:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/admin/competitions">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Competitions
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Competition</CardTitle>
          <CardDescription>
            Set up a new case competition for an event
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {createMutation.error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{createMutation.error.message}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="event_id">Event *</Label>
              <select
                id="event_id"
                {...register('event_id')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select an event</option>
                {events?.map((event: any) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
              {errors.event_id && (
                <p className="text-sm text-red-600">{errors.event_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Competition Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., Annual Business Case Competition"
                required
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Brief description of the competition..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rules">Rules</Label>
              <textarea
                id="rules"
                {...register('rules')}
                rows={6}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Competition rules and guidelines..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submission_instructions">Submission Instructions</Label>
              <textarea
                id="submission_instructions"
                {...register('submission_instructions')}
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Instructions for teams on how to submit their work..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deadline">Submission Deadline</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  {...register('deadline')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_team_size">Min Team Size</Label>
                <Input
                  id="min_team_size"
                  type="number"
                  min="1"
                  {...register('min_team_size')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_team_size">Max Team Size</Label>
                <Input
                  id="max_team_size"
                  type="number"
                  min="1"
                  {...register('max_team_size')}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || createMutation.isPending}
                className="flex-1"
              >
                {isSubmitting || createMutation.isPending ? 'Creating...' : 'Create Competition'}
              </Button>
              <Link href="/admin/competitions">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

