'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  calculateProfileCompleteness, 
  getFieldDisplayName,
  getProfileSuggestions 
} from '@/lib/profile/completeness';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProfileCompletenessCardProps {
  profile: any;
}

export function ProfileCompletenessCard({ profile }: ProfileCompletenessCardProps) {
  const completeness = calculateProfileCompleteness(profile);
  const suggestions = getProfileSuggestions(completeness);
  const isComplete = completeness.percentage === 100;

  if (!profile || profile.role !== 'student') {
    return null;
  }

  return (
    <Card className={isComplete ? 'border-green-200 bg-green-50/50' : 'border-yellow-200 bg-yellow-50/50'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            <CardTitle>Profile Completeness</CardTitle>
          </div>
          <span className={`text-2xl font-bold ${isComplete ? 'text-green-600' : 'text-yellow-600'}`}>
            {completeness.percentage}%
          </span>
        </div>
        <CardDescription>
          {isComplete
            ? 'Your profile is complete! 🎉'
            : `Complete ${completeness.missingFields.length} more field(s) to finish your profile.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={completeness.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completeness.completedFields.length} of {completeness.requiredFields.length} required fields completed
          </p>
        </div>

        {/* Missing Fields */}
        {completeness.missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Missing Required Fields:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {completeness.missingFields.slice(0, 3).map((field) => (
                <li key={field}>{getFieldDisplayName(field)}</li>
              ))}
              {completeness.missingFields.length > 3 && (
                <li>...and {completeness.missingFields.length - 3} more</li>
              )}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-sm font-medium text-blue-900 mb-1">💡 Suggestions:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-800">
              {suggestions.slice(0, 2).map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        {!isComplete && (
          <Link href="/profile/wizard" className="block">
            <Button className="w-full" variant={isComplete ? 'outline' : 'default'}>
              {isComplete ? 'Update Profile' : 'Complete Profile'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

