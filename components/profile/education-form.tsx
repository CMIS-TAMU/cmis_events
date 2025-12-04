/**
 * Education Form Component
 * Allows adding/editing education history entries
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Save, X } from 'lucide-react';

export interface EducationEntry {
  id?: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string; // ISO date string (YYYY-MM-DD)
  end_date?: string | null;
  gpa?: number;
  is_current?: boolean;
  location?: string;
}

interface EducationFormProps {
  entry?: EducationEntry | null;
  onSave: (entry: EducationEntry) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function EducationForm({ entry, onSave, onCancel, isOpen }: EducationFormProps) {
  const [formData, setFormData] = useState<EducationEntry>({
    institution: entry?.institution || '',
    degree: entry?.degree || '',
    field_of_study: entry?.field_of_study || '',
    start_date: entry?.start_date || new Date().toISOString().split('T')[0],
    end_date: entry?.end_date || null,
    gpa: entry?.gpa || undefined,
    is_current: entry?.is_current || false,
    location: entry?.location || '',
    ...(entry?.id && { id: entry.id }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.institution.trim() || !formData.degree.trim() || !formData.field_of_study.trim()) {
      return;
    }

    // If current education, set end_date to null
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
          <DialogTitle>{entry ? 'Edit Education' : 'Add Education'}</DialogTitle>
          <DialogDescription>
            Add your educational background to your profile
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="institution">Institution *</Label>
            <Input
              id="institution"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              placeholder="e.g., University of California, Berkeley"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="degree">Degree *</Label>
              <Input
                id="degree"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g., Bachelor of Science"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field_of_study">Field of Study *</Label>
              <Input
                id="field_of_study"
                value={formData.field_of_study}
                onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                placeholder="e.g., Computer Science"
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
              placeholder="e.g., Berkeley, CA"
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
              <Label htmlFor="end_date">End Date (or Expected)</Label>
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
              I am currently studying here
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gpa">GPA (Optional)</Label>
            <Input
              id="gpa"
              type="number"
              step="0.01"
              min="0"
              max="4.0"
              value={formData.gpa || ''}
              onChange={(e) => setFormData({ ...formData, gpa: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="e.g., 3.75"
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

