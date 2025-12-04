'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { WizardStepProps } from '../types';
import { ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { WorkExperienceForm, type WorkExperienceEntry } from '@/components/profile/work-experience-form';
import { WorkExperienceCard } from '@/components/profile/work-experience-card';

export function Step5WorkExperience({
  data,
  onUpdate,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: WizardStepProps) {
  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>(
    data.step5WorkExperience || []
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkExperienceEntry | null>(null);

  useEffect(() => {
    setWorkExperience(data.step5WorkExperience || []);
  }, [data]);

  const handleAdd = () => {
    setEditingEntry(null);
    setFormOpen(true);
  };

  const handleEdit = (entry: WorkExperienceEntry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const handleDelete = (entry: WorkExperienceEntry) => {
    if (confirm('Are you sure you want to delete this work experience entry?')) {
      const updated = workExperience.filter((e) => e.id !== entry.id);
      setWorkExperience(updated);
      onUpdate('step5WorkExperience', updated);
    }
  };

  const handleSave = (entry: WorkExperienceEntry) => {
    const updated = editingEntry
      ? workExperience.map((e) => (e.id === editingEntry.id ? { ...entry, id: entry.id || editingEntry.id } : e))
      : [...workExperience, { ...entry, id: entry.id || `temp-${Date.now()}` }];
    
    setWorkExperience(updated);
    onUpdate('step5WorkExperience', updated);
    setFormOpen(false);
    setEditingEntry(null);
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Work Experience</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add your professional work experience (optional but recommended)
        </p>
      </div>

      <div className="space-y-4">
        {workExperience.length > 0 && (
          <div className="space-y-3">
            {workExperience.map((entry, index) => (
              <div key={entry.id || index} className="relative">
                <WorkExperienceCard
                  entry={entry}
                  onEdit={() => handleEdit(entry)}
                  onDelete={() => handleDelete(entry)}
                />
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Work Experience
        </Button>

        {workExperience.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No work experience added yet. Click the button above to add one.
          </p>
        )}
      </div>

      <WorkExperienceForm
        entry={editingEntry}
        onSave={handleSave}
        onCancel={() => {
          setFormOpen(false);
          setEditingEntry(null);
        }}
        isOpen={formOpen}
      />

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="button" onClick={handleNext}>
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

