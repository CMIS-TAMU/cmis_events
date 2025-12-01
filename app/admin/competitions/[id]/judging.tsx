'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

interface JudgingTabProps {
  competitionId: string;
}

export function JudgingTab({ competitionId }: JudgingTabProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, Record<string, { score: number; comments: string }>>>({});

  const { data: teams } = trpc.competitions.getTeams.useQuery({
    competition_id: competitionId,
  });
  const { data: rubrics } = trpc.competitions.getRubrics.useQuery({
    competition_id: competitionId,
  });

  const submitScoreMutation = trpc.competitions.submitScore.useMutation({
    onSuccess: () => {
      alert('Score saved successfully!');
    },
  });

  const handleScoreChange = (teamId: string, rubricId: string, score: number) => {
    if (!scores[teamId]) {
      scores[teamId] = {};
    }
    if (!scores[teamId][rubricId]) {
      scores[teamId][rubricId] = { score: 0, comments: '' };
    }
    scores[teamId][rubricId].score = score;
    setScores({ ...scores });
  };

  const handleCommentsChange = (teamId: string, rubricId: string, comments: string) => {
    if (!scores[teamId]) {
      scores[teamId] = {};
    }
    if (!scores[teamId][rubricId]) {
      scores[teamId][rubricId] = { score: 0, comments: '' };
    }
    scores[teamId][rubricId].comments = comments;
    setScores({ ...scores });
  };

  const handleSaveScore = async (teamId: string, rubricId: string) => {
    const scoreData = scores[teamId]?.[rubricId];
    if (!scoreData) return;

    try {
      await submitScoreMutation.mutateAsync({
        team_id: teamId,
        rubric_id: rubricId,
        score: scoreData.score,
        comments: scoreData.comments || undefined,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to save score');
    }
  };

  const teamsWithSubmissions = teams?.filter((team: any) => team.submitted_at) || [];

  if (!rubrics || rubrics.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No rubrics defined yet. Please create rubrics first before judging.
          </p>
          <p className="text-sm text-muted-foreground">
            Go to the &quot;Judging Rubrics&quot; tab to add rubrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (teamsWithSubmissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            No teams have submitted their work yet. Judging will be available once teams submit.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Judge Teams</h3>
        <p className="text-sm text-muted-foreground">
          Review submissions and score teams based on the rubrics
        </p>
      </div>

      <div className="grid gap-6">
        {teamsWithSubmissions.map((team: any) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{team.name}</CardTitle>
                  {team.submission_filename && (
                    <CardDescription className="mt-1">
                      Submitted: {new Date(team.submitted_at).toLocaleDateString()}
                    </CardDescription>
                  )}
                </div>
                {team.submission_url && (
                  <Link href={team.submission_url} target="_blank">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Submission
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {rubrics.map((rubric: any) => {
                const scoreData = scores[team.id]?.[rubric.id] || { score: 0, comments: '' };
                const maxScore = rubric.max_score || 10;

                return (
                  <div key={rubric.id} className="p-4 border rounded-md space-y-3">
                    <div>
                      <h4 className="font-semibold">{rubric.criterion}</h4>
                      {rubric.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {rubric.description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Max: {maxScore}</Badge>
                        <Badge variant="outline">Weight: {rubric.weight}</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`score-${team.id}-${rubric.id}`}>
                        Score (0 - {maxScore})
                      </Label>
                      <Input
                        id={`score-${team.id}-${rubric.id}`}
                        type="number"
                        min="0"
                        max={maxScore}
                        value={scoreData.score}
                        onChange={(e) =>
                          handleScoreChange(team.id, rubric.id, parseInt(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`comments-${team.id}-${rubric.id}`}>
                        Comments (Optional)
                      </Label>
                      <textarea
                        id={`comments-${team.id}-${rubric.id}`}
                        value={scoreData.comments}
                        onChange={(e) =>
                          handleCommentsChange(team.id, rubric.id, e.target.value)
                        }
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Add your feedback and comments..."
                      />
                    </div>

                    <Button
                      onClick={() => handleSaveScore(team.id, rubric.id)}
                      disabled={submitScoreMutation.isPending}
                      size="sm"
                    >
                      {submitScoreMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Score
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

