/**
 * Education Card Component
 * Displays a single education entry
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Calendar, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import type { EducationEntry } from './education-form';

interface EducationCardProps {
  entry: EducationEntry;
  onEdit: (entry: EducationEntry) => void;
  onDelete: (entry: EducationEntry) => void;
}

export function EducationCard({ entry, onEdit, onDelete }: EducationCardProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const startDate = formatDate(entry.start_date);
  const endDate = entry.is_current ? 'Present' : formatDate(entry.end_date);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{entry.degree}</h3>
                <p className="text-sm text-muted-foreground">{entry.institution}</p>
                <p className="text-sm font-medium mt-1">{entry.field_of_study}</p>
              </div>
              {entry.is_current && (
                <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Current
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              {entry.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>{entry.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>
                  {startDate} - {endDate}
                </span>
              </div>
              {entry.gpa && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">GPA: {entry.gpa.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(entry)}
              className="h-8 w-8"
              aria-label={`Edit education at ${entry.institution}`}
            >
              <Edit className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(entry)}
              className="h-8 w-8 text-destructive hover:text-destructive"
              aria-label={`Delete education at ${entry.institution}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

