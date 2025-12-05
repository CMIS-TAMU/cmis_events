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

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['email', 'sms', 'social']),
  channel: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().min(1, 'Body is required'),
  target_audience: z.string().optional(),
  is_active: z.boolean(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export default function CreateTemplatePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const createMutation = trpc.communications.templates.create.useMutation({
    onSuccess: () => {
      router.push('/admin/communications/templates');
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      is_active: true,
      type: 'email',
    },
  });

  const templateType = watch('type');

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

  const onSubmit = async (data: TemplateFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        description: data.description || null,
        type: data.type,
        channel: data.channel || null,
        subject: data.subject || null,
        body: data.body,
        variables: {},
        target_audience: data.target_audience || null,
        is_active: data.is_active,
      });
    } catch (error) {
      console.error('Error creating template:', error);
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/admin/communications/templates"
        className="inline-flex items-center mb-6 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Templates
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
          <CardDescription>
            Create a new email, SMS, or social media communication template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {createMutation.error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{createMutation.error.message}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="e.g., Welcome Email"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  {...register('type')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="social">Social Media</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of this template"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {templateType === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  {...register('subject')}
                  placeholder="e.g., Welcome to {{event_name}}!"
                />
                <p className="text-xs text-muted-foreground">
                  Use variables like <code className="text-xs bg-muted px-1 py-0.5 rounded">{"{{variable_name}}"}</code> for dynamic content
                </p>
                {errors.subject && (
                  <p className="text-sm text-destructive">{errors.subject.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="body">Body Content *</Label>
              <textarea
                id="body"
                {...register('body')}
                placeholder={
                  templateType === 'email'
                    ? '<h1>Hi {{user_name}}!</h1><p>Thank you for registering...</p>'
                    : templateType === 'sms'
                    ? 'Hi {{user_name}}, thank you for registering for {{event_name}}!'
                    : 'Post content here...'
                }
                className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              />
              <p className="text-xs text-muted-foreground">
                {templateType === 'email' ? (
                  <>
                    HTML is supported. Use variables like <code className="text-xs bg-muted px-1 py-0.5 rounded">{"{{variable_name}}"}</code> for dynamic content
                  </>
                ) : (
                  <>
                    Use variables like <code className="text-xs bg-muted px-1 py-0.5 rounded">{"{{variable_name}}"}</code> for dynamic content
                  </>
                )}
              </p>
              {errors.body && (
                <p className="text-sm text-destructive">{errors.body.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <Input
                  id="channel"
                  {...register('channel')}
                  placeholder="e.g., email, sms, twitter"
                />
                {errors.channel && (
                  <p className="text-sm text-destructive">{errors.channel.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_audience">Target Audience</Label>
                <Input
                  id="target_audience"
                  {...register('target_audience')}
                  placeholder="e.g., registration, reminder, cancellation"
                />
                <p className="text-xs text-muted-foreground">
                  Used for filtering and user preferences
                </p>
                {errors.target_audience && (
                  <p className="text-sm text-destructive">{errors.target_audience.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                {...register('is_active')}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="text-sm font-normal">
                Template is active (can be used immediately)
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/communications/templates')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Template
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Variable Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p className="font-semibold">Common Variables:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><code>{`{{user_name}}`}</code> - User&apos;s full name</li>
              <li><code>{`{{event_name}}`}</code> - Event title</li>
              <li><code>{`{{event_date}}`}</code> - Event date</li>
              <li><code>{`{{event_location}}`}</code> - Event location</li>
              <li><code>{`{{registration_id}}`}</code> - Registration ID</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              Variables are replaced with actual values when emails are sent.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

