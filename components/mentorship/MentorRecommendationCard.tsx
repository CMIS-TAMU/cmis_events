'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, 
  Loader2,
  Star,
  TrendingUp,
  Award,
  Briefcase,
  CheckCircle
} from 'lucide-react';

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
  
  // Determine match quality
  const getMatchQuality = () => {
    if (matchScore >= 80) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-500' };
    if (matchScore >= 60) return { label: 'Great', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', ring: 'ring-blue-500' };
    if (matchScore >= 40) return { label: 'Good', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', ring: 'ring-amber-500' };
    return { label: 'Fair', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', ring: 'ring-gray-400' };
  };

  const matchQuality = getMatchQuality();

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Rank badge colors
  const getRankStyle = () => {
    switch (rank) {
      case 1:
        return 'from-amber-400 to-amber-600 shadow-amber-200';
      case 2:
        return 'from-slate-300 to-slate-500 shadow-slate-200';
      case 3:
        return 'from-orange-400 to-orange-600 shadow-orange-200';
      default:
        return 'from-gray-400 to-gray-600 shadow-gray-200';
    }
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-[#500000]/30 ${isLoading ? 'opacity-75' : ''}`}>
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#500000] to-[#800000]" />
      
      <CardContent className="p-5 pt-6">
        <div className="flex gap-4">
          {/* Left: Avatar with rank */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#500000] to-[#800000] flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {getInitials(mentor.name)}
            </div>
            {/* Rank badge */}
            <div className={`absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gradient-to-br ${getRankStyle()} flex items-center justify-center shadow-md`}>
              <span className="text-white text-xs font-bold">#{rank}</span>
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex-1 min-w-0">
            {/* Name and Match Score */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <h4 className="font-semibold text-lg truncate">{mentor.name}</h4>
                {(mentor.job_designation || mentor.organization) && (
                  <p className="text-sm text-muted-foreground truncate">
                    {mentor.job_designation}
                    {mentor.job_designation && mentor.organization && ' at '}
                    {mentor.organization}
                  </p>
                )}
              </div>
              
              {/* Match Score Circle */}
              <div className={`flex-shrink-0 w-14 h-14 rounded-full ${matchQuality.bg} ${matchQuality.border} border-2 flex flex-col items-center justify-center`}>
                <span className={`text-lg font-bold ${matchQuality.color}`}>{Math.round(matchScore)}%</span>
              </div>
            </div>

            {/* Industry */}
            {mentor.industry && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                <Building2 className="h-3.5 w-3.5" />
                <span>{mentor.industry}</span>
              </div>
            )}

            {/* Expertise Tags */}
            {mentor.areas_of_expertise && mentor.areas_of_expertise.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {mentor.areas_of_expertise.slice(0, 4).map((area, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="text-xs font-medium bg-[#500000]/5 text-[#500000] hover:bg-[#500000]/10"
                  >
                    {area}
                  </Badge>
                ))}
                {mentor.areas_of_expertise.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{mentor.areas_of_expertise.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={onSelect}
              disabled={isLoading}
              className="w-full bg-[#500000] hover:bg-[#6b0000] shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Selecting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Select as Mentor
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
