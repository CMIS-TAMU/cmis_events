'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Users, ArrowLeft } from 'lucide-react';

export default function CompetitionResultsPage() {
  const params = useParams();
  const competitionId = params.id as string;

  const { data: competition, isLoading: competitionLoading } = trpc.competitions.getById.useQuery(
    { id: competitionId },
    { enabled: !!competitionId }
  );
  const { data: results, isLoading: resultsLoading } = trpc.competitions.getResults.useQuery(
    { competition_id: competitionId },
    { enabled: !!competitionId }
  );

  if (competitionLoading || resultsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <CardContent>
            <p className="text-destructive">Competition not found</p>
            <Link href="/competitions">
              <Button variant="outline" className="mt-4">
                Back to Competitions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!competition.results_published) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href={`/competitions/${competitionId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Competition
          </Button>
        </Link>

        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">Results Not Yet Published</CardTitle>
            <CardDescription>
              The competition results have not been published yet. Check back later!
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href={`/competitions/${competitionId}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Competition
        </Button>
      </Link>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">{competition.title} - Results</h1>
        <p className="text-muted-foreground">
          Final rankings based on judge evaluations
        </p>
      </div>

      {!results || results.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No results available.</p>
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
              <Card
                key={team.id}
                className={
                  isWinner
                    ? 'border-yellow-400 bg-yellow-50/50 shadow-lg'
                    : isSecond
                    ? 'border-gray-300 bg-gray-50/50'
                    : isThird
                    ? 'border-orange-300 bg-orange-50/50'
                    : ''
                }
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex flex-col items-center justify-center min-w-[60px]">
                        {isWinner ? (
                          <div className="relative">
                            <Trophy className="h-10 w-10 text-yellow-500" />
                            <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-white">
                              1st
                            </Badge>
                          </div>
                        ) : isSecond ? (
                          <div className="relative">
                            <Award className="h-10 w-10 text-gray-400" />
                            <Badge className="absolute -top-2 -right-2 bg-gray-400 text-white">
                              2nd
                            </Badge>
                          </div>
                        ) : isThird ? (
                          <div className="relative">
                            <Award className="h-10 w-10 text-orange-400" />
                            <Badge className="absolute -top-2 -right-2 bg-orange-400 text-white">
                              3rd
                            </Badge>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="font-bold text-lg">{rank}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="text-2xl font-bold mb-2">{team.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{team.members?.length || 0} members</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-lg font-semibold">
                            Total Score: {team.totalScore?.toFixed(2) || '0.00'}
                          </span>
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

