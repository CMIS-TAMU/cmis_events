/**
 * Work Experience Card Component
 * Displays a single work experience entry
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Calendar, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import type { WorkExperienceEntry } from './work-experience-form';

interface WorkExperienceCardProps {
  entry: WorkExperienceEntry;
  onEdit: (entry: WorkExperienceEntry) => void;
  onDelete: (entry: WorkExperienceEntry) => void;
}

export function WorkExperienceCard({ entry, onEdit, onDelete }: WorkExperienceCardProps) {
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
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{entry.position}</h3>
                <p className="text-sm text-muted-foreground">{entry.company}</p>
              </div>
              {entry.is_current && (
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Current
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              {entry.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{entry.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {startDate} - {endDate}
                </span>
              </div>
            </div>

            {entry.description && (
              <p className="mt-3 text-sm text-muted-foreground">{entry.description}</p>
            )}
          </div>

          <div className="flex gap-2 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(entry)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(entry)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

