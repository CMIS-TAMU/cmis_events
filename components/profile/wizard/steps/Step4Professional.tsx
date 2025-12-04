'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WizardStepProps } from '../types';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export function Step4Professional({
  data,
  onUpdate,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: WizardStepProps) {
  const [formData, setFormData] = useState({
    preferred_industry: data.step4Professional?.preferred_industry || '',
    skills: (data.step4Professional?.skills || []).join(', '),
    research_interests: (data.step4Professional?.research_interests || []).join(', '),
  });

  useEffect(() => {
    setFormData({
      preferred_industry: data.step4Professional?.preferred_industry || '',
      skills: (data.step4Professional?.skills || []).join(', '),
      research_interests: (data.step4Professional?.research_interests || []).join(', '),
    });
  }, [data]);

  const handleNext = () => {
    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);
    const interestsArray = formData.research_interests
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);

    onUpdate('step4Professional', {
      preferred_industry: formData.preferred_industry,
      skills: skillsArray,
      research_interests: interestsArray,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Professional Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Share your skills, interests, and career preferences
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="preferred_industry">Preferred Industry</Label>
          <Input
            id="preferred_industry"
            type="text"
            placeholder="e.g., Technology, Finance, Healthcare"
            value={formData.preferred_industry}
            onChange={(e) =>
              setFormData({ ...formData, preferred_industry: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="skills">Skills</Label>
          <Input
            id="skills"
            type="text"
            placeholder="e.g., Python, JavaScript, Machine Learning (comma-separated)"
            value={formData.skills}
            onChange={(e) =>
              setFormData({ ...formData, skills: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            Separate multiple skills with commas
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="research_interests">Research Interests</Label>
          <Input
            id="research_interests"
            type="text"
            placeholder="e.g., AI, Data Science, Cybersecurity (comma-separated)"
            value={formData.research_interests}
            onChange={(e) =>
              setFormData({ ...formData, research_interests: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            Separate multiple interests with commas
          </p>
        </div>
      </div>

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

