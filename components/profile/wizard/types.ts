/**
 * Types for Profile Wizard
 */

export interface WizardStepData {
  step1BasicInfo?: {
    full_name?: string;
    phone?: string;
    date_of_birth?: string;
  };
  step2Contact?: {
    address?: string;
    linkedin_url?: string;
    github_url?: string;
    website_url?: string;
  };
  step3Academic?: {
    major?: string;
    degree_type?: string;
    gpa?: number;
    expected_graduation?: string;
  };
  step4Professional?: {
    preferred_industry?: string;
    skills?: string[];
    research_interests?: string[];
  };
  step5WorkExperience?: Array<{
    company: string;
    position: string;
    start_date: string;
    end_date?: string;
    current: boolean;
    description?: string;
  }>;
  step6CareerGoals?: {
    career_goals?: string;
    resume_url?: string;
  };
}

export interface WizardStepProps {
  data: WizardStepData;
  onUpdate: (stepKey: keyof WizardStepData, data: any) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export type WizardStepKey = 
  | 'step1BasicInfo'
  | 'step2Contact'
  | 'step3Academic'
  | 'step4Professional'
  | 'step5WorkExperience'
  | 'step6CareerGoals';

