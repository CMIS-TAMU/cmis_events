'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WizardStepProps } from '../types';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface Step1BasicInfoProps extends WizardStepProps {
  userEmail: string;
}

export function Step1BasicInfo({
  data,
  onUpdate,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  userEmail,
}: Step1BasicInfoProps) {
  const [formData, setFormData] = useState({
    full_name: data.step1BasicInfo?.full_name || '',
    phone: data.step1BasicInfo?.phone || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      full_name: data.step1BasicInfo?.full_name || '',
      phone: data.step1BasicInfo?.phone || '',
    });
  }, [data]);

  const handleNext = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdate('step1BasicInfo', formData);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Basic Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Let&apos;s start with your basic information
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={userEmail}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Your email cannot be changed
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="full_name"
            type="text"
            placeholder="John Doe"
            value={formData.full_name}
            onChange={(e) => {
              setFormData({ ...formData, full_name: e.target.value });
              setErrors({ ...errors, full_name: '' });
            }}
            className={errors.full_name ? 'border-red-500' : ''}
          />
          {errors.full_name && (
            <p className="text-xs text-red-500">{errors.full_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value });
              setErrors({ ...errors, phone: '' });
            }}
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isFirstStep}
        >
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

