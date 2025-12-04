'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressIndicator } from '@/components/profile/wizard/ProgressIndicator';
import { Step1BasicInfo } from '@/components/profile/wizard/steps/Step1BasicInfo';
import { Step2Contact } from '@/components/profile/wizard/steps/Step2Contact';
import { Step3Academic } from '@/components/profile/wizard/steps/Step3Academic';
import { Step4Professional } from '@/components/profile/wizard/steps/Step4Professional';
import { Step5WorkExperience } from '@/components/profile/wizard/steps/Step5WorkExperience';
import { Step6CareerGoals } from '@/components/profile/wizard/steps/Step6CareerGoals';
import type { WizardStepData } from '@/components/profile/wizard/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/trpc';
import { Loader2 } from 'lucide-react';
import { toastUtil } from '@/lib/utils/toast';

const TOTAL_STEPS = 6;
const STEP_LABELS = [
  'Basic Info',
  'Contact',
  'Academic',
  'Professional',
  'Experience',
  'Goals',
];

export default function ProfileWizardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardStepData>({});
  const [userEmail, setUserEmail] = useState<string>('');

  const updateProfile = trpc.auth.updateStudentProfile.useMutation();
  const updateWorkExperience = trpc.auth.updateWorkExperience.useMutation();

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setUserEmail(user.email || '');

      // Load existing profile data
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Normalize degree_type from database to match enum values
        const normalizeDegreeType = (degreeType: string | undefined): string => {
          if (!degreeType) return '';
          const normalized = degreeType.toLowerCase().trim();
          // Map common variations to enum values
          const degreeMap: Record<string, string> = {
            "bachelor's": "bachelor",
            "bachelors": "bachelor",
            "master's": "master",
            "masters": "master",
            "phd": "phd",
            "doctorate": "phd",
            "associate": "associate",
            "certificate": "certificate",
          };
          return degreeMap[normalized] || normalized;
        };

        // Pre-populate wizard data from existing profile
        setWizardData({
          step1BasicInfo: {
            full_name: profile.full_name || '',
            phone: profile.phone || '',
          },
          step2Contact: {
            address: profile.address || '',
            linkedin_url: profile.linkedin_url || '',
            github_url: profile.github_url || '',
            website_url: profile.website_url || '',
          },
          step3Academic: {
            major: profile.major || '',
            degree_type: normalizeDegreeType(profile.degree_type),
          },
          step4Professional: {
            preferred_industry: profile.preferred_industry || '',
            skills: Array.isArray(profile.skills) ? profile.skills : [],
            research_interests: Array.isArray(profile.research_interests)
              ? profile.research_interests
              : [],
          },
          step5WorkExperience: Array.isArray(profile.work_experience)
            ? profile.work_experience
            : [],
          step6CareerGoals: {
            career_goals: profile.career_goals || '',
            resume_url: profile.resume_url || '',
          },
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepUpdate = (stepKey: keyof WizardStepData, data: any) => {
    setWizardData((prev) => ({
      ...prev,
      [stepKey]: data,
    }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save all wizard data
      const step1 = wizardData.step1BasicInfo || {};
      const step2 = wizardData.step2Contact || {};
      const step3 = wizardData.step3Academic || {};
      const step4 = wizardData.step4Professional || {};
      const step6 = wizardData.step6CareerGoals || {};

      // Normalize degree_type to match backend enum values
      const normalizeDegreeType = (degreeType: string | undefined): string | undefined => {
        if (!degreeType) return undefined;
        const normalized = degreeType.toLowerCase().trim();
        // Map common variations to enum values
        const degreeMap: Record<string, string> = {
          "bachelor's": "bachelor",
          "bachelors": "bachelor",
          "master's": "master",
          "masters": "master",
          "phd": "phd",
          "doctorate": "phd",
          "associate": "associate",
          "certificate": "certificate",
        };
        return degreeMap[normalized] || normalized;
      };

      await updateProfile.mutateAsync({
        phone: step1.phone,
        address: step2.address,
        linkedin_url: step2.linkedin_url,
        github_url: step2.github_url,
        website_url: step2.website_url,
        major: step3.major,
        degree_type: normalizeDegreeType(step3.degree_type) as 'bachelor' | 'master' | 'phd' | 'associate' | 'certificate' | undefined,
        preferred_industry: step4.preferred_industry,
        skills: step4.skills || [],
        research_interests: step4.research_interests || [],
        career_goals: step6.career_goals,
      });

      // Save work experience if any
      if (wizardData.step5WorkExperience && wizardData.step5WorkExperience.length > 0) {
        await updateWorkExperience.mutateAsync({
          work_experience: wizardData.step5WorkExperience,
        });
      }

      // Redirect to dashboard
      toastUtil.success('Profile completed!', 'Your profile has been saved successfully.');
      router.push('/dashboard?wizard=complete');
    } catch (error: any) {
      console.error('Error completing wizard:', error);
      toastUtil.error(
        'Failed to save profile',
        error.message || 'Please try again or contact support if the problem persists.'
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Let&apos;s set up your profile. This will only take a few minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              stepLabels={STEP_LABELS}
              className="mb-8"
            />

            <div className="min-h-[400px]">
              {currentStep === 1 && (
                <Step1BasicInfo
                  data={wizardData}
                  onUpdate={handleStepUpdate}
                  onNext={handleNext}
                  onBack={handleBack}
                  isFirstStep={true}
                  isLastStep={false}
                  userEmail={userEmail}
                />
              )}
              {currentStep === 2 && (
                <Step2Contact
                  data={wizardData}
                  onUpdate={handleStepUpdate}
                  onNext={handleNext}
                  onBack={handleBack}
                  isFirstStep={false}
                  isLastStep={false}
                />
              )}
              {currentStep === 3 && (
                <Step3Academic
                  data={wizardData}
                  onUpdate={handleStepUpdate}
                  onNext={handleNext}
                  onBack={handleBack}
                  isFirstStep={false}
                  isLastStep={false}
                />
              )}
              {currentStep === 4 && (
                <Step4Professional
                  data={wizardData}
                  onUpdate={handleStepUpdate}
                  onNext={handleNext}
                  onBack={handleBack}
                  isFirstStep={false}
                  isLastStep={false}
                />
              )}
              {currentStep === 5 && (
                <Step5WorkExperience
                  data={wizardData}
                  onUpdate={handleStepUpdate}
                  onNext={handleNext}
                  onBack={handleBack}
                  isFirstStep={false}
                  isLastStep={false}
                />
              )}
              {currentStep === 6 && (
                <Step6CareerGoals
                  data={wizardData}
                  onUpdate={handleStepUpdate}
                  onNext={handleComplete}
                  onBack={handleBack}
                  isFirstStep={false}
                  isLastStep={true}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

