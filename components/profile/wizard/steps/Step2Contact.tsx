'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WizardStepProps } from '../types';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export function Step2Contact({
  data,
  onUpdate,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: WizardStepProps) {
  const [formData, setFormData] = useState({
    address: data.step2Contact?.address || '',
    linkedin_url: data.step2Contact?.linkedin_url || '',
    github_url: data.step2Contact?.github_url || '',
    website_url: data.step2Contact?.website_url || '',
  });

  useEffect(() => {
    setFormData({
      address: data.step2Contact?.address || '',
      linkedin_url: data.step2Contact?.linkedin_url || '',
      github_url: data.step2Contact?.github_url || '',
      website_url: data.step2Contact?.website_url || '',
    });
  }, [data]);

  const handleNext = () => {
    onUpdate('step2Contact', formData);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Contact Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add your contact information and social profiles (optional)
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            placeholder="123 Main St, City, State ZIP"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            autoComplete="street-address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin_url">LinkedIn Profile URL</Label>
          <Input
            id="linkedin_url"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={formData.linkedin_url}
            onChange={(e) =>
              setFormData({ ...formData, linkedin_url: e.target.value })
            }
            autoComplete="url"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github_url">GitHub Profile URL</Label>
          <Input
            id="github_url"
            type="url"
            placeholder="https://github.com/yourusername"
            value={formData.github_url}
            onChange={(e) =>
              setFormData({ ...formData, github_url: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website_url">Personal Website</Label>
          <Input
            id="website_url"
            type="url"
            placeholder="https://yourwebsite.com"
            value={formData.website_url}
            onChange={(e) =>
              setFormData({ ...formData, website_url: e.target.value })
            }
            autoComplete="url"
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          aria-label="Go to previous step"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back
        </Button>
        <Button 
          type="button" 
          onClick={handleNext}
          aria-label="Continue to next step"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

