'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Users, Loader2 } from 'lucide-react';

interface ResultsTabProps {
  competitionId: string;
}

export function ResultsTab({ competitionId }: ResultsTabProps) {
  const { data: results, isLoading, refetch } = trpc.competitions.getResults.useQuery({
    competition_id: competitionId,
  });
  const { data: competition } = trpc.competitions.getById.useQuery({
    id: competitionId,
  });

  const publishMutation = trpc.competitions.publishResults.useMutation({
    onSuccess: () => {
      refetch();
      alert('Results published successfully!');
    },
  });

  const handlePublish = async () => {
    if (confirm('Are you sure you want to publish the results? This will make them visible to all participants.')) {
      try {
        await publishMutation.mutateAsync({ competition_id: competitionId });
      } catch (error: any) {
        alert(error.message || 'Failed to publish results');
      }
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading results...</p>;
  }

  const isPublished = competition?.results_published;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Competition Results</h3>
          <p className="text-sm text-muted-foreground">
            View aggregated scores and publish results to participants
          </p>
        </div>
        {!isPublished && (
          <Button
            onClick={handlePublish}
            disabled={publishMutation.isPending || !results || results.length === 0}
          >
            {publishMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                Publish Results
              </>
            )}
          </Button>
        )}
        {isPublished && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            Results Published
          </Badge>
        )}
      </div>

      {!results || results.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              No results available yet. Judges need to submit scores first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {results.map((team: any, index: number) => {
            const rank = index + 1;
            const isWinner = rank === 1;
            const isSecond = rank === 2;
            const isThird = rank === 3;

            return (
              <Card key={team.id} className={isWinner ? 'border-yellow-400 bg-yellow-50/50' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex flex-col items-center justify-center min-w-[60px]">
                        {isWinner ? (
                          <Trophy className="h-8 w-8 text-yellow-500" />
                        ) : isSecond ? (
                          <Award className="h-8 w-8 text-gray-400" />
                        ) : isThird ? (
                          <Award className="h-8 w-8 text-orange-400" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="font-bold">{rank}</span>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground mt-1">#{rank}</span>
                      </div>

                      <div className="flex-1">
                        <h4 className="text-xl font-bold mb-2">{team.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{team.members?.length || 0} members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            <span className="font-semibold text-foreground">
                              Total Score: {team.totalScore?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

