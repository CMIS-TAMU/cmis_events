/**
 * Work Experience Form Component
 * Allows adding/editing work experience entries
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Save, X } from 'lucide-react';

export interface WorkExperienceEntry {
  id?: string;
  company: string;
  position: string;
  start_date: string; // ISO date string (YYYY-MM-DD)
  end_date?: string | null;
  description?: string;
  is_current?: boolean;
  location?: string;
}

interface WorkExperienceFormProps {
  entry?: WorkExperienceEntry | null;
  onSave: (entry: WorkExperienceEntry) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function WorkExperienceForm({ entry, onSave, onCancel, isOpen }: WorkExperienceFormProps) {
  const [formData, setFormData] = useState<WorkExperienceEntry>({
    company: entry?.company || '',
    position: entry?.position || '',
    start_date: entry?.start_date || new Date().toISOString().split('T')[0],
    end_date: entry?.end_date || null,
    description: entry?.description || '',
    is_current: entry?.is_current || false,
    location: entry?.location || '',
    ...(entry?.id && { id: entry.id }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company.trim() || !formData.position.trim()) {
      return;
    }

    // If current job, set end_date to null
    const dataToSave = {
      ...formData,
      end_date: formData.is_current ? null : formData.end_date || null,
    };

    onSave(dataToSave);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit Work Experience' : 'Add Work Experience'}</DialogTitle>
          <DialogDescription>
            Add your professional work experience to enhance your profile
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g., Google, Microsoft"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position/Title *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g., Software Engineer, Intern"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., San Francisco, CA"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value, is_current: false })}
                disabled={formData.is_current}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_current"
              checked={formData.is_current}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  is_current: e.target.checked,
                  end_date: e.target.checked ? null : formData.end_date,
                });
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is_current" className="font-normal cursor-pointer">
              I currently work here
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your responsibilities and achievements..."
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

