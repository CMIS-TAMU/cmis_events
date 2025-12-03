'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const missionFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  category: z.string().optional(),
  tags: z.string().optional(), // Comma-separated
  requirements: z.string().optional(),
  submission_instructions: z.string().optional(),
  max_points: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1 && num <= 1000;
  }, 'Must be between 1 and 1000'),
  time_limit_minutes: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseInt(val);
    return !isNaN(num) && num > 0;
  }, 'Must be a positive number'),
  deadline: z.string().optional(),
});

type MissionFormData = z.infer<typeof missionFormSchema>;

export default function CreateMissionPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [starterFileUrl, setStarterFileUrl] = useState<string>('');
  const [starterFileName, setStarterFileName] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(false);

  const createMutation = trpc.missions.createMission.useMutation();
  const publishMutation = trpc.missions.publishMission.useMutation();
  const updateMutation = trpc.missions.updateMission.useMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MissionFormData>({
    resolver: zodResolver(missionFormSchema),
    defaultValues: {
      difficulty: 'intermediate',
      max_points: '100',
    },
  });

  const difficulty = watch('difficulty');

  useEffect(() => {
    async function checkSponsor() {
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

      if (role !== 'sponsor' && role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    }
    checkSponsor();
  }, [router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Just store the file name - we'll upload it after mission creation
    setStarterFileName(file.name);
    // Store the file reference for later upload
    // We'll access it from the input element when submitting
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      setValue('tags', [...tags, tagInput.trim()].join(','));
    }
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    setValue('tags', newTags.join(','));
  };

  const onSubmit = async (data: MissionFormData) => {
    try {
      // Convert datetime-local format to ISO string if deadline is provided
      let deadlineISO: string | undefined = undefined;
      if (data.deadline) {
        // datetime-local format is YYYY-MM-DDTHH:mm, convert to ISO
        const date = new Date(data.deadline);
        if (!isNaN(date.getTime())) {
          deadlineISO = date.toISOString();
        } else {
          // If already in ISO format, use as is
          deadlineISO = data.deadline;
        }
      }

      const missionData = {
        ...data,
        max_points: parseInt(data.max_points) || 100,
        time_limit_minutes: data.time_limit_minutes ? parseInt(data.time_limit_minutes) : undefined,
        deadline: deadlineISO,
        tags: tags.length > 0 ? tags : undefined,
        starter_files_url: starterFileUrl || undefined,
      };

      const mission = await createMutation.mutateAsync(missionData);

      // If we have a starter file, upload it now
      if (starterFileName) {
        const fileInput = document.getElementById('starter_file') as HTMLInputElement;
        const file = fileInput?.files?.[0];
        if (file) {
          try {
            console.log('[Create Mission] Uploading starter file:', {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              missionId: mission.id,
            });

            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('missionId', mission.id);

            console.log('[Create Mission] Sending upload request...');
            const uploadResponse = await fetch('/api/missions/upload-starter-files', {
              method: 'POST',
              body: uploadFormData,
            });

            console.log('[Create Mission] Upload response:', {
              status: uploadResponse.status,
              statusText: uploadResponse.statusText,
              ok: uploadResponse.ok,
            });

            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              console.log('Starter file upload successful:', uploadResult);
              // Update mission with starter file URL
              await updateMutation.mutateAsync({
                id: mission.id,
                starter_files_url: uploadResult.url,
              });
              console.log('Mission updated with starter file URL');
            } else {
              const errorData = await uploadResponse.json();
              console.error('Failed to upload starter file - Response:', {
                status: uploadResponse.status,
                statusText: uploadResponse.statusText,
                error: errorData,
              });
              alert(`Mission created but starter file upload failed: ${errorData.error || errorData.message || 'Unknown error'}. You can upload it later from the mission page.`);
            }
          } catch (error: any) {
            console.error('Error uploading starter file:', error);
            alert('Mission created but starter file upload failed. You can upload it later from the mission page.');
          }
        }
      }

      // If publish immediately is checked, publish the mission
      if (publishImmediately) {
        try {
          console.log('Publishing mission:', mission.id);
          const publishedMission = await publishMutation.mutateAsync({ missionId: mission.id });
          console.log('Mission published successfully:', publishedMission);
        } catch (error: any) {
          console.error('Error publishing mission:', error);
          // Show detailed error
          alert(`Mission created but failed to publish: ${error.message || error.toString()}. You can publish it manually from the mission page.`);
          // Still navigate to mission page
          router.push(`/sponsor/missions/${mission.id}`);
          return;
        }
      }

      router.push(`/sponsor/missions/${mission.id}`);
    } catch (error: any) {
      console.error('Error creating mission:', error);
      alert(error.message || 'Failed to create mission');
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
      <Link href="/sponsor/missions">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Missions
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Mission</CardTitle>
          <CardDescription>
            Create a technical challenge for students to solve
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)(e);
          }} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., Build a REST API with Authentication"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                {...register('description')}
                placeholder="Describe the challenge..."
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Difficulty and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty *</Label>
                <select
                  id="difficulty"
                  {...register('difficulty')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                {errors.difficulty && (
                  <p className="text-sm text-destructive">{errors.difficulty.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  {...register('category')}
                  placeholder="e.g., Web Development, Data Science"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <textarea
                id="requirements"
                {...register('requirements')}
                placeholder="Detailed requirements and specifications..."
                rows={6}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Submission Instructions */}
            <div className="space-y-2">
              <Label htmlFor="submission_instructions">Submission Instructions</Label>
              <textarea
                id="submission_instructions"
                {...register('submission_instructions')}
                placeholder="How should students submit their solutions?"
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Points and Time Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_points">Max Points</Label>
                <Input
                  id="max_points"
                  type="number"
                  {...register('max_points')}
                  min="1"
                  max="1000"
                  defaultValue="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time_limit_minutes">Time Limit (minutes)</Label>
                <Input
                  id="time_limit_minutes"
                  type="number"
                  {...register('time_limit_minutes')}
                  placeholder="Optional"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  {...register('deadline')}
                  className="w-full"
                  onChange={(e) => {
                    // Update form value immediately when date changes
                    setValue('deadline', e.target.value);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Select date and time. The value is saved automatically when you click outside or change the field.
                </p>
              </div>
            </div>

            {/* Starter Files */}
            <div className="space-y-2">
              <Label htmlFor="starter_file">Starter Files (Optional)</Label>
              <Input
                id="starter_file"
                type="file"
                accept=".zip,.pdf,.txt,.md"
                onChange={handleFileUpload}
                disabled={uploadingFile}
              />
              {starterFileName && (
                <p className="text-sm text-muted-foreground">
                  Selected: {starterFileName}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Upload ZIP, PDF, TXT, or MD files (max 50 MB)
              </p>
            </div>

            {/* Publish Immediately Option */}
            <div className="flex items-center space-x-2 pt-4">
              <input
                type="checkbox"
                id="publishImmediately"
                checked={publishImmediately}
                onChange={(e) => setPublishImmediately(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="publishImmediately" className="text-sm font-normal cursor-pointer">
                Publish
              </Label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || uploadingFile || publishMutation.isPending}
              >
                {isSubmitting || publishMutation.isPending
                  ? publishImmediately
                    ? 'Creating & Publishing...'
                    : 'Creating...'
                  : publishImmediately
                  ? 'Create & Publish Mission'
                  : 'Create Mission (Draft)'}
              </Button>
              <Link href="/sponsor/missions">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

