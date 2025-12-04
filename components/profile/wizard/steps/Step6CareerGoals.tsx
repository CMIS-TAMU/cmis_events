'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { WizardStepProps } from '../types';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function Step6CareerGoals({
  data,
  onUpdate,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: WizardStepProps) {
  const [formData, setFormData] = useState({
    career_goals: data.step6CareerGoals?.career_goals || '',
  });

  useEffect(() => {
    setFormData({
      career_goals: data.step6CareerGoals?.career_goals || '',
    });
  }, [data]);

  const handleComplete = () => {
    onUpdate('step6CareerGoals', formData);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Career Goals</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us about your career aspirations and goals
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="career_goals">Career Goals</Label>
          <Textarea
            id="career_goals"
            placeholder="Describe your career goals, aspirations, and what you hope to achieve..."
            value={formData.career_goals}
            onChange={(e) =>
              setFormData({ ...formData, career_goals: e.target.value })
            }
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            This information helps mentors and advisors understand your career direction
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">🎉 Almost Done!</h3>
          <p className="text-sm text-blue-800">
            Once you complete this step, your profile will be ready. You can always
            update it later from your profile page.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="button" onClick={handleComplete} size="lg">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Complete Profile
        </Button>
      </div>
    </div>
  );
}

