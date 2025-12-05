'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  Building2, 
  TrendingUp,
  Loader2,
  Star,
  Award
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MentorRecommendationCardProps {
  mentor: {
    id: string;
    name: string;
    email: string;
    industry?: string;
    organization?: string;
    job_designation?: string;
    bio?: string;
    areas_of_expertise?: string[];
    match_score?: number;
    match_reasons?: string[];
  };
  rank: number;
  onSelect: () => void;
  isLoading?: boolean;
}

export function MentorRecommendationCard({
  mentor,
  rank,
  onSelect,
  isLoading = false,
}: MentorRecommendationCardProps) {
  const matchScore = mentor.match_score || 0;
  const matchReasons = mentor.match_reasons || [];
  
  // Determine match quality badge
  const getMatchQuality = () => {
    if (matchScore >= 80) return { label: 'Excellent Match', variant: 'default' as const, icon: Star };
    if (matchScore >= 60) return { label: 'Good Match', variant: 'secondary' as const, icon: TrendingUp };
    return { label: 'Fair Match', variant: 'outline' as const, icon: Award };
  };

  const matchQuality = getMatchQuality();
  const MatchIcon = matchQuality.icon;

  return (
    <Card className="border-2 hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Mentor Info */}
          <div className="flex-1 space-y-3">
            {/* Header with rank and name */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">#{rank}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-base truncate">{mentor.name}</h4>
                  <Badge variant={matchQuality.variant} className="text-xs">
                    <MatchIcon className="h-3 w-3 mr-1" />
                    {matchQuality.label}
                  </Badge>
                </div>
                
                {/* Job Title and Organization */}
                {(mentor.job_designation || mentor.organization) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    {mentor.job_designation && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {mentor.job_designation}
                      </span>
                    )}
                    {mentor.organization && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {mentor.organization}
                      </span>
                    )}
                  </div>
                )}

                {/* Industry */}
                {mentor.industry && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Industry: {mentor.industry}
                  </p>
                )}

                {/* Match Score Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Match Score</span>
                    <span className="font-semibold">{Math.round(matchScore)}%</span>
                  </div>
                  <Progress value={matchScore} className="h-2" />
                </div>

                {/* Match Reasons */}
                {matchReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {matchReasons.slice(0, 3).map((reason, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                    {matchReasons.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{matchReasons.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Areas of Expertise */}
                {mentor.areas_of_expertise && mentor.areas_of_expertise.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Expertise:</p>
                    <div className="flex flex-wrap gap-1">
                      {mentor.areas_of_expertise.slice(0, 3).map((area, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {mentor.areas_of_expertise.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{mentor.areas_of_expertise.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Action Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={onSelect}
              disabled={isLoading}
              className="min-w-[120px]"
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Selecting...
                </>
              ) : (
                'Select Mentor'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

