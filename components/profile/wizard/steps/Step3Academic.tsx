'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WizardStepProps } from '../types';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export function Step3Academic({
  data,
  onUpdate,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: WizardStepProps) {
  const [formData, setFormData] = useState({
    major: data.step3Academic?.major || '',
    degree_type: data.step3Academic?.degree_type || '',
    gpa: data.step3Academic?.gpa?.toString() || '',
    expected_graduation: data.step3Academic?.expected_graduation || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      major: data.step3Academic?.major || '',
      degree_type: data.step3Academic?.degree_type || '',
      gpa: data.step3Academic?.gpa?.toString() || '',
      expected_graduation: data.step3Academic?.expected_graduation || '',
    });
  }, [data]);

  const handleNext = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.major.trim()) {
      newErrors.major = 'Major is required';
    }

    if (!formData.degree_type.trim()) {
      newErrors.degree_type = 'Degree type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdate('step3Academic', {
      ...formData,
      gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Academic Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us about your academic background
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="major">
            Major <span className="text-red-500">*</span>
          </Label>
          <Input
            id="major"
            type="text"
            placeholder="e.g., Computer Science, Engineering"
            value={formData.major}
            onChange={(e) => {
              setFormData({ ...formData, major: e.target.value });
              setErrors({ ...errors, major: '' });
            }}
            className={errors.major ? 'border-red-500' : ''}
          />
          {errors.major && (
            <p className="text-xs text-red-500">{errors.major}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="degree_type">
            Degree Type <span className="text-red-500">*</span>
          </Label>
          <select
            id="degree_type"
            value={formData.degree_type}
            onChange={(e) => {
              setFormData({ ...formData, degree_type: e.target.value });
              setErrors({ ...errors, degree_type: '' });
            }}
            className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
              errors.degree_type ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select degree type</option>
            <option value="bachelor">Bachelor&apos;s</option>
            <option value="master">Master&apos;s</option>
            <option value="phd">PhD</option>
            <option value="associate">Associate</option>
            <option value="certificate">Certificate</option>
          </select>
          {errors.degree_type && (
            <p className="text-xs text-red-500">{errors.degree_type}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gpa">GPA (Optional)</Label>
            <Input
              id="gpa"
              type="number"
              step="0.01"
              min="0"
              max="4.0"
              placeholder="3.75"
              value={formData.gpa}
              onChange={(e) =>
                setFormData({ ...formData, gpa: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_graduation">Expected Graduation</Label>
            <Input
              id="expected_graduation"
              type="month"
              value={formData.expected_graduation}
              onChange={(e) =>
                setFormData({ ...formData, expected_graduation: e.target.value })
              }
            />
          </div>
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

