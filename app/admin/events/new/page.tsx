'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  capacity: z.string(),
  image_url: z.string().url().optional().or(z.literal('')),
  starts_at: z.string().min(1, 'Start date is required'),
  ends_at: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const createMutation = trpc.events.create.useMutation({
    onSuccess: (data) => {
      router.push(`/admin/events/${data.id}/edit`);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      capacity: '0',
      starts_at: new Date().toISOString().slice(0, 16),
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

  const onSubmit = async (data: EventFormData) => {
    try {
      const capacity = parseInt(data.capacity, 10) || 0;
      await createMutation.mutateAsync({
        title: data.title,
        description: data.description || undefined,
        capacity,
        image_url: data.image_url || undefined,
        starts_at: new Date(data.starts_at).toISOString(),
        ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : undefined,
      });
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/admin/events" className="inline-flex items-center mb-6 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>Fill in the details to create a new event</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register('description')}
                placeholder="Enter event description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="starts_at">Start Date & Time *</Label>
                <Input
                  id="starts_at"
                  type="datetime-local"
                  {...register('starts_at')}
                />
                {errors.starts_at && (
                  <p className="text-sm text-destructive">{errors.starts_at.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ends_at">End Date & Time</Label>
                <Input
                  id="ends_at"
                  type="datetime-local"
                  {...register('ends_at')}
                />
                {errors.ends_at && (
                  <p className="text-sm text-destructive">{errors.ends_at.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="0"
                {...register('capacity')}
                placeholder="0 for unlimited"
              />
                {errors.capacity && (
                  <p className="text-sm text-destructive">{errors.capacity.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Leave as 0 for unlimited capacity
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  {...register('image_url')}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.image_url && (
                  <p className="text-sm text-destructive">{errors.image_url.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Event'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

