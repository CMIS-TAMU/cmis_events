'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc/trpc';

const resumeSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.type === 'application/pdf',
    'Only PDF files are allowed'
  ).refine(
    (file) => file.size <= 10 * 1024 * 1024,
    'File size must be less than 10 MB'
  ),
  major: z.string().optional(),
  gpa: z.string().optional().refine(
    (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 4.0),
    'GPA must be between 0 and 4.0'
  ),
  skills: z.string().optional(),
  graduationYear: z.string().optional().refine(
    (val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 2020 && parseInt(val) <= 2030),
    'Graduation year must be between 2020 and 2030'
  ),
});

type ResumeFormData = z.infer<typeof resumeSchema>;

interface ResumeUploadProps {
  onSuccess?: () => void;
}

export function ResumeUpload({ onSuccess }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
  });

  const selectedFile = watch('file');

  const onSubmit = async (data: ResumeFormData) => {
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.major) formData.append('major', data.major);
      if (data.gpa) formData.append('gpa', data.gpa);
      if (data.skills) {
        const skillsArray = data.skills.split(',').map(s => s.trim()).filter(s => s);
        formData.append('skills', JSON.stringify(skillsArray));
      }
      if (data.graduationYear) formData.append('graduationYear', data.graduationYear);

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload resume');
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setValue('file', undefined as any);
      setValue('major', '');
      setValue('gpa', '');
      setValue('skills', '');
      setValue('graduationYear', '');
    } catch (err: any) {
      setError(err.message || 'An error occurred while uploading resume');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('file', file);
      setError(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Resume</CardTitle>
        <CardDescription>
          Upload your resume (PDF, max 10 MB) and add optional information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Resume (PDF)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                accept=".pdf,application/pdf"
                {...register('file')}
                onChange={handleFileChange}
                ref={fileInputRef}
                className="flex-1"
              />
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{selectedFile.name}</span>
                <span className="text-xs">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
            {errors.file && (
              <p className="text-sm text-destructive">{errors.file.message}</p>
            )}
          </div>

          {/* Optional Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="major">Major (Optional)</Label>
              <Input
                id="major"
                {...register('major')}
                placeholder="e.g., Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpa">GPA (Optional)</Label>
              <Input
                id="gpa"
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                {...register('gpa')}
                placeholder="e.g., 3.75"
              />
              {errors.gpa && (
                <p className="text-sm text-destructive">{errors.gpa.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (Optional)</Label>
              <Input
                id="skills"
                {...register('skills')}
                placeholder="e.g., Python, JavaScript, React (comma-separated)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="graduationYear">Graduation Year (Optional)</Label>
              <Input
                id="graduationYear"
                type="number"
                min="2020"
                max="2030"
                {...register('graduationYear')}
                placeholder="e.g., 2025"
              />
              {errors.graduationYear && (
                <p className="text-sm text-destructive">{errors.graduationYear.message}</p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-600">Resume uploaded successfully!</p>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={uploading || !selectedFile} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

