/**
 * Profile Completeness Calculation
 * Calculates the percentage of profile completion based on required and optional fields
 */

export interface ProfileCompleteness {
  percentage: number;
  completedFields: string[];
  missingFields: string[];
  requiredFields: string[];
  optionalFields: string[];
}

/**
 * Required fields for student profile completion
 */
const STUDENT_REQUIRED_FIELDS = [
  'full_name',
  'email',
  'phone',
  'major',
  'degree_type',
] as const;

/**
 * Optional but recommended fields for students
 */
const STUDENT_OPTIONAL_FIELDS = [
  'linkedin_url',
  'github_url',
  'preferred_industry',
  'skills',
  'research_interests',
  'career_goals',
  'work_experience',
  'education',
  'resume_url',
] as const;

/**
 * Required fields for faculty profile completion
 */
const FACULTY_REQUIRED_FIELDS = [
  'full_name',
  'email',
  'phone',
] as const;

/**
 * Required fields for sponsor profile completion
 */
const SPONSOR_REQUIRED_FIELDS = [
  'full_name',
  'email',
  'phone',
] as const;

/**
 * Check if a field is present and not empty
 */
function isFieldComplete(field: string, user: any): boolean {
  const value = (user as any)[field];

  if (value === null || value === undefined || value === '') {
    return false;
  }

  // Check for empty arrays
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }

  // Check for empty JSONB objects/arrays
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return false;
  }

  return true;
}

/**
 * Get required fields based on user role
 */
function getRequiredFields(role: string): readonly string[] {
  switch (role) {
    case 'student':
      return STUDENT_REQUIRED_FIELDS;
    case 'faculty':
      return FACULTY_REQUIRED_FIELDS;
    case 'sponsor':
      return SPONSOR_REQUIRED_FIELDS;
    default:
      return [];
  }
}

/**
 * Get optional fields based on user role
 */
function getOptionalFields(role: string): readonly string[] {
  switch (role) {
    case 'student':
      return STUDENT_OPTIONAL_FIELDS;
    case 'faculty':
      return [];
    case 'sponsor':
      return [];
    default:
      return [];
  }
}

/**
 * Calculate profile completeness percentage
 */
export function calculateProfileCompleteness(user: any): ProfileCompleteness {
  if (!user) {
    return {
      percentage: 0,
      completedFields: [],
      missingFields: [],
      requiredFields: [],
      optionalFields: [],
    };
  }

  const role = user.role || 'student';
  const requiredFields = getRequiredFields(role);
  const optionalFields = getOptionalFields(role);

  const completedFields: string[] = [];
  const missingFields: string[] = [];

  // Check required fields
  requiredFields.forEach((field) => {
    if (isFieldComplete(field, user)) {
      completedFields.push(field);
    } else {
      missingFields.push(field);
    }
  });

  // Calculate percentage based on required fields only
  const totalRequired = requiredFields.length;
  const completedRequired = completedFields.length;
  const percentage = totalRequired > 0 
    ? Math.round((completedRequired / totalRequired) * 100)
    : 100;

  return {
    percentage,
    completedFields,
    missingFields,
    requiredFields: [...requiredFields],
    optionalFields: [...optionalFields],
  };
}

/**
 * Get a human-readable field name
 */
export function getFieldDisplayName(field: string): string {
  const fieldNames: Record<string, string> = {
    full_name: 'Full Name',
    email: 'Email',
    phone: 'Phone Number',
    major: 'Major',
    degree_type: 'Degree Type',
    linkedin_url: 'LinkedIn Profile',
    github_url: 'GitHub Profile',
    website_url: 'Website',
    preferred_industry: 'Preferred Industry',
    skills: 'Skills',
    research_interests: 'Research Interests',
    career_goals: 'Career Goals',
    work_experience: 'Work Experience',
    education: 'Education History',
    resume_url: 'Resume',
    address: 'Address',
  };

  return fieldNames[field] || field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Get completion status badge color
 */
export function getCompletionBadgeColor(percentage: number): string {
  if (percentage === 100) return 'bg-green-500';
  if (percentage >= 75) return 'bg-blue-500';
  if (percentage >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Check if profile is complete enough to use all features
 */
export function isProfileComplete(completeness: ProfileCompleteness): boolean {
  return completeness.percentage === 100;
}

/**
 * Get suggestions for improving profile completeness
 */
export function getProfileSuggestions(completeness: ProfileCompleteness): string[] {
  const suggestions: string[] = [];

  if (completeness.percentage < 100) {
    suggestions.push(`Complete ${completeness.missingFields.length} required field(s) to reach 100%`);
    
    completeness.missingFields.forEach((field) => {
      suggestions.push(`Add ${getFieldDisplayName(field)}`);
    });
  }

  // Add suggestions for optional fields if all required are complete
  if (completeness.percentage === 100) {
    suggestions.push('Add optional fields like LinkedIn, GitHub, or work experience to enhance your profile');
  }

  return suggestions;
}

