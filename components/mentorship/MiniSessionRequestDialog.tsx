'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Calendar } from 'lucide-react';
import { trpc } from '@/lib/trpc/trpc';
import { toastUtil } from '@/lib/utils/toast';

interface MiniSessionRequestDialogProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function MiniSessionRequestDialog({ onSuccess, trigger }: MiniSessionRequestDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    session_type: 'interview_prep' as 'interview_prep' | 'skill_learning' | 'career_advice' | 'resume_review' | 'project_guidance' | 'technical_help' | 'portfolio_review' | 'networking_advice' | 'other',
    preferred_duration_minutes: 60 as 30 | 45 | 60,
    urgency: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    preferred_date_start: '',
    preferred_date_end: '',
    tags: [] as string[],
    tagInput: '',
    specific_questions: '',
  });

  const createRequest = trpc.miniMentorship.createRequest.useMutation({
    onSuccess: () => {
      toastUtil.success(
        'Mini session request created!',
        'A mentor will be able to see and claim your request.'
      );
      setIsOpen(false);
      setFormData({
        title: '',
        description: '',
        session_type: 'interview_prep',
        preferred_duration_minutes: 60,
        urgency: 'normal',
        preferred_date_start: '',
        preferred_date_end: '',
        tags: [],
        tagInput: '',
        specific_questions: '',
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Failed to create mini session request:', error);
      toastUtil.error(
        'Failed to create request',
        error.message || 'Please check your inputs and try again.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert date strings to Date objects (or undefined if empty)
    // Date input gives us YYYY-MM-DD format, we need to create a Date object
    const preferredDateStart = formData.preferred_date_start 
      ? new Date(formData.preferred_date_start + 'T00:00:00') // Add time to ensure correct timezone
      : undefined;
    const preferredDateEnd = formData.preferred_date_end 
      ? new Date(formData.preferred_date_end + 'T23:59:59') // End of day
      : undefined;

    // Validate dates if both are provided
    if (preferredDateStart && preferredDateEnd && preferredDateEnd < preferredDateStart) {
      toastUtil.error(
        'Invalid date range',
        'The end date must be after the start date.'
      );
      return;
    }

    // Ensure duration is a number (30, 45, or 60)
    const duration = typeof formData.preferred_duration_minutes === 'number' 
      ? formData.preferred_duration_minutes 
      : parseInt(String(formData.preferred_duration_minutes), 10);

    if (![30, 45, 60].includes(duration)) {
      toastUtil.error(
        'Invalid duration',
        'Please select a valid duration (30, 45, or 60 minutes).'
      );
      return;
    }

    createRequest.mutate({
      title: formData.title.trim(),
      description: formData.description.trim(),
      session_type: formData.session_type,
      preferred_duration_minutes: duration as 30 | 45 | 60,
      urgency: formData.urgency,
      preferred_date_start: preferredDateStart,
      preferred_date_end: preferredDateEnd,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      specific_questions: formData.specific_questions.trim() || undefined,
    });
  };

  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const sessionTypeLabels = {
    interview_prep: 'Interview Preparation',
    skill_learning: 'Skill Learning',
    career_advice: 'Career Advice',
    resume_review: 'Resume Review',
    project_guidance: 'Project Guidance',
    technical_help: 'Technical Help',
    portfolio_review: 'Portfolio Review',
    networking_advice: 'Networking Advice',
    other: 'Other',
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Request Mini Session
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a Mini Mentorship Session</DialogTitle>
          <DialogDescription>
            Request a quick 30-60 minute session with a mentor for specific help (interview prep, skill learning, etc.)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">What do you need help with? *</Label>
            <Input
              id="title"
              placeholder="e.g., Interview prep for Google SWE role"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              minLength={5}
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="session_type">Session Type *</Label>
            <select
              id="session_type"
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              value={formData.session_type}
              onChange={(e) => setFormData({ ...formData, session_type: e.target.value as any })}
              required
            >
              {Object.entries(sessionTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background"
              placeholder="Provide details about what you need help with..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              minLength={10}
              maxLength={2000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration *</Label>
              <select
                id="duration"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={formData.preferred_duration_minutes}
                onChange={(e) => setFormData({ ...formData, preferred_duration_minutes: parseInt(e.target.value) as 30 | 45 | 60 })}
                required
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>

            <div>
              <Label htmlFor="urgency">Urgency</Label>
              <select
                id="urgency"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preferred_date_start">Earliest Available Date</Label>
              <Input
                id="preferred_date_start"
                type="date"
                value={formData.preferred_date_start}
                onChange={(e) => setFormData({ ...formData, preferred_date_start: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label htmlFor="preferred_date_end">Latest Available Date</Label>
              <Input
                id="preferred_date_end"
                type="date"
                value={formData.preferred_date_end}
                onChange={(e) => setFormData({ ...formData, preferred_date_end: e.target.value })}
                min={formData.preferred_date_start || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specific_questions">Specific Questions (Optional)</Label>
            <textarea
              id="specific_questions"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background"
              placeholder="Any specific questions or topics you want to cover?"
              value={formData.specific_questions}
              onChange={(e) => setFormData({ ...formData, specific_questions: e.target.value })}
              maxLength={500}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (Optional)</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                placeholder="e.g., technical-interview, google, software-engineering"
                value={formData.tagInput}
                onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm cursor-pointer hover:bg-secondary/80"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRequest.isPending}>
              {createRequest.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Request...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

