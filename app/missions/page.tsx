'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Trophy, Clock, Users, Target, ArrowRight, Plus } from 'lucide-react';
import { trpc } from '@/lib/trpc/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function MissionsBrowsePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [userRole, setUserRole] = useState<string>('');
  const [loadingRole, setLoadingRole] = useState(true);

  const { data: missions, isLoading } = trpc.missions.browseMissions.useQuery({
    search: searchTerm || undefined,
    difficulty: difficultyFilter !== 'all' ? difficultyFilter as any : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    limit: 50,
    offset: 0,
  });

  useEffect(() => {
    async function checkUserRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
          setUserRole(profile?.role || 'user');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setLoadingRole(false);
      }
    }
    checkUserRole();
  }, []);

  const isSponsorOrAdmin = userRole === 'sponsor' || userRole === 'admin';

  const getDifficultyBadge = (difficulty: string) => {
    const variants: Record<string, string> = {
      beginner: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800',
    };
    return variants[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const sortedMissions = missions ? [...missions].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
    } else if (sortBy === 'points') {
      return (b.max_points || 100) - (a.max_points || 100);
    } else if (sortBy === 'difficulty') {
      const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
      return (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0) - 
             (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0);
    }
    return 0;
  }) : [];

  const categories = missions ? Array.from(new Set(missions.map(m => m.category).filter(Boolean))) : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Technical Missions</h1>
          <p className="text-muted-foreground">
            Challenge yourself with technical problems and earn points
          </p>
        </div>
        {!loadingRole && isSponsorOrAdmin && (
          <Link href="/sponsor/missions/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Mission
            </Button>
          </Link>
        )}
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search missions by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Difficulty Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="newest">Newest First</option>
                  <option value="points">Most Points</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-end">
                <p className="text-sm text-muted-foreground">
                  {sortedMissions.length} mission{sortedMissions.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missions Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading missions...</p>
        </div>
      ) : sortedMissions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No missions found</h3>
              <p className="text-gray-600">
                {searchTerm || difficultyFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No active missions available at the moment'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMissions.map((mission) => (
            <Card key={mission.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">{mission.title}</CardTitle>
                  <Badge className={getDifficultyBadge(mission.difficulty || 'intermediate')}>
                    {mission.difficulty || 'intermediate'}
                  </Badge>
                </div>
                {mission.category && (
                  <CardDescription>{mission.category}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {mission.description}
                </p>

                {/* Tags */}
                {mission.tags && mission.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mission.tags.slice(0, 3).map((tag: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {mission.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{mission.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>{mission.max_points || 100} points</span>
                  </div>
                  {mission.time_limit_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{mission.time_limit_minutes} min</span>
                    </div>
                  )}
                  {mission.total_attempts !== undefined && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{mission.total_attempts} attempts</span>
                    </div>
                  )}
                </div>

                {/* Deadline */}
                {mission.deadline && (
                  <div className="text-xs text-muted-foreground mb-4">
                    Deadline: {new Date(mission.deadline).toLocaleDateString()}
                  </div>
                )}

                {/* Action Button */}
                <Link href={`/missions/${mission.id}`} className="mt-auto">
                  <Button className="w-full">
                    View Mission
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

