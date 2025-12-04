'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/lib/trpc/trpc';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toastUtil } from '@/lib/utils/toast';

const sessionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  starts_at: z.string().min(1, 'Start time is required'),
  ends_at: z.string().min(1, 'End time is required'),
  capacity: z.string(),
}).refine((data) => new Date(data.ends_at) > new Date(data.starts_at), {
  message: 'End time must be after start time',
  path: ['ends_at'],
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface SessionDialogProps {
  eventId: string;
  session?: any;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SessionDialog({
  eventId,
  session,
  open,
  onClose,
  onSuccess,
}: SessionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: session ? {
      title: session.title,
      description: session.description || '',
      starts_at: session.starts_at ? new Date(session.starts_at).toISOString().slice(0, 16) : '',
      ends_at: session.ends_at ? new Date(session.ends_at).toISOString().slice(0, 16) : '',
      capacity: session.capacity?.toString() || '0',
    } : {
      title: '',
      description: '',
      starts_at: '',
      ends_at: '',
      capacity: '0',
    },
  });

  const createMutation = trpc.sessions.create.useMutation();
  const updateMutation = trpc.sessions.update.useMutation();

  useEffect(() => {
    if (session) {
      reset({
        title: session.title,
        description: session.description || '',
        starts_at: session.starts_at ? new Date(session.starts_at).toISOString().slice(0, 16) : '',
        ends_at: session.ends_at ? new Date(session.ends_at).toISOString().slice(0, 16) : '',
        capacity: session.capacity?.toString() || '0',
      });
    } else {
      reset({
        title: '',
        description: '',
        starts_at: '',
        ends_at: '',
        capacity: '0',
      });
    }
  }, [session, reset, open]);

  const onSubmit = async (data: SessionFormData) => {
    setIsSubmitting(true);
    try {
      if (session) {
        await updateMutation.mutateAsync({
          id: session.id,
          title: data.title,
          description: data.description || undefined,
          starts_at: new Date(data.starts_at).toISOString(),
          ends_at: new Date(data.ends_at).toISOString(),
          capacity: parseInt(data.capacity) || 0,
        });
      } else {
        await createMutation.mutateAsync({
          event_id: eventId,
          title: data.title,
          description: data.description || undefined,
          starts_at: new Date(data.starts_at).toISOString(),
          ends_at: new Date(data.ends_at).toISOString(),
          capacity: parseInt(data.capacity) || 0,
        });
      }
      onSuccess();
      toastUtil.success('Session saved successfully!');
    } catch (error: any) {
      toastUtil.error('Failed to save session', error.message || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-labelledby="session-dialog-title"
        aria-describedby="session-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="session-dialog-title">{session ? 'Edit Session' : 'Create Session'}</DialogTitle>
          <DialogDescription id="session-dialog-description">
            {session ? 'Update session details' : 'Add a new session to this event'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label={session ? 'Edit session form' : 'Create session form'}>
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500" aria-label="required">*</span>
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Opening Keynote"
              aria-required="true"
              aria-invalid={errors.title ? 'true' : 'false'}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-destructive" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Session description..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="starts_at">
                Start Time <span className="text-red-500" aria-label="required">*</span>
              </Label>
              <Input
                id="starts_at"
                type="datetime-local"
                {...register('starts_at')}
                aria-required="true"
                aria-invalid={errors.starts_at ? 'true' : 'false'}
                aria-describedby={errors.starts_at ? 'starts_at-error' : undefined}
              />
              {errors.starts_at && (
                <p id="starts_at-error" className="text-sm text-destructive" role="alert">
                  {errors.starts_at.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ends_at">
                End Time <span className="text-red-500" aria-label="required">*</span>
              </Label>
              <Input
                id="ends_at"
                type="datetime-local"
                {...register('ends_at')}
                aria-required="true"
                aria-invalid={errors.ends_at ? 'true' : 'false'}
                aria-describedby={errors.ends_at ? 'ends_at-error' : undefined}
              />
              {errors.ends_at && (
                <p id="ends_at-error" className="text-sm text-destructive" role="alert">
                  {errors.ends_at.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              min="0"
              {...register('capacity')}
              placeholder="0 for unlimited"
            />
            <p className="text-xs text-muted-foreground">
              Set to 0 for unlimited capacity
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              aria-label="Cancel and close dialog"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              aria-label={isSubmitting ? 'Saving session, please wait' : session ? 'Update session' : 'Create new session'}
            >
              {isSubmitting ? 'Saving...' : session ? 'Update Session' : 'Create Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

