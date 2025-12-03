'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Medal, Award, TrendingUp, User } from 'lucide-react';
import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';

export default function LeaderboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login');
        return;
      }
      setUser(authUser);
      setLoading(false);
    }
    getUser();
  }, [router]);

  const { data: leaderboard, isLoading } = trpc.missions.getLeaderboard.useQuery(
    { limit, offset: page * limit },
    { enabled: !loading }
  );

  const { data: myRank } = trpc.missions.getMyRank.useQuery(
    undefined,
    { enabled: !loading }
  );

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-orange-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mission Leaderboard</h1>
        <p className="text-muted-foreground">
          Top performers in technical missions
        </p>
      </div>

      {/* My Rank Card */}
      {myRank && myRank.rank && (
        <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Your Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Rank</div>
                <div className="text-3xl font-bold text-yellow-600">#{myRank.rank}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Points</div>
                <div className="text-3xl font-bold text-yellow-600">{myRank.totalPoints || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Average Score</div>
                <div className="text-3xl font-bold text-green-600">
                  {myRank.averageScore > 0 ? myRank.averageScore.toFixed(1) : '0'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Missions Completed</div>
                <div className="text-3xl font-bold text-blue-600">{myRank.missionsCompleted || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>
            Rankings based on total points, average score, and missions completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!leaderboard || leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No rankings yet</h3>
              <p className="text-gray-600">
                Complete missions to appear on the leaderboard
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Rank</th>
                      <th className="text-left py-3 px-4 font-semibold">Student</th>
                      <th className="text-right py-3 px-4 font-semibold">Total Points</th>
                      <th className="text-right py-3 px-4 font-semibold">Avg Score</th>
                      <th className="text-right py-3 px-4 font-semibold">Missions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry: any) => {
                      const userData = entry.users as any;
                      const isCurrentUser = user && user.id === entry.user_id;
                      const rankIcon = getRankIcon(entry.rank);
                      const rankBadge = getRankBadge(entry.rank);

                      return (
                        <tr
                          key={entry.user_id}
                          className={`border-b hover:bg-gray-50 transition-colors ${
                            isCurrentUser ? 'bg-yellow-50' : ''
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {rankIcon || (
                                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${rankBadge}`}>
                                  #{entry.rank}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {userData?.full_name || userData?.email || 'Anonymous'}
                                  {isCurrentUser && (
                                    <Badge variant="outline" className="ml-2">You</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {userData?.major && `${userData.major}`}
                                  {userData?.graduation_year && ` • Class of ${userData.graduation_year}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Trophy className="h-4 w-4 text-yellow-600" />
                              <span className="font-semibold">{entry.total_points || 0}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="font-semibold">
                                {entry.average_score > 0 ? entry.average_score.toFixed(1) : '0'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-semibold">{entry.missions_completed || 0}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, leaderboard.length)} of top performers
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={leaderboard.length < limit}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

