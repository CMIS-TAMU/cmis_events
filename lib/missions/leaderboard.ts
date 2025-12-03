/**
 * Leaderboard Computation for Technical Missions
 * 
 * Calculates and manages leaderboard rankings
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  totalPoints: number;
  averageScore: number;
  missionsCompleted: number;
  perfectScores: number;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    major: string | null;
    graduation_year: number | null;
  };
}

export interface LeaderboardFilters {
  limit?: number;
  offset?: number;
  minPoints?: number;
  maxRank?: number;
}

/**
 * Get leaderboard entries
 */
export async function getLeaderboard(
  filters: LeaderboardFilters = {}
): Promise<LeaderboardEntry[]> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const {
    limit = 50,
    offset = 0,
    minPoints = 0,
  } = filters;

  let query = supabase
    .from('student_points')
    .select(`
      *,
      users:user_id (
        id,
        email,
        full_name,
        major,
        graduation_year
      )
    `)
    .gte('total_points', minPoints)
    .order('total_points', { ascending: false })
    .order('average_score', { ascending: false })
    .order('missions_completed', { ascending: false })
    .order('last_updated', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  // Add rank to each entry
  return (data || []).map((entry, index) => ({
    rank: offset + index + 1,
    userId: entry.user_id,
    totalPoints: entry.total_points,
    averageScore: entry.average_score,
    missionsCompleted: entry.missions_completed,
    perfectScores: entry.missions_perfect_score,
    user: entry.users as any,
  }));
}

/**
 * Get user's leaderboard rank
 */
export async function getUserRank(userId: string): Promise<number | null> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Get user's points
  const { data: userPoints } = await supabase
    .from('student_points')
    .select('total_points, average_score, missions_completed')
    .eq('user_id', userId)
    .single();

  if (!userPoints || userPoints.total_points === 0) {
    return null;
  }

  // Count users with more points (using the same ranking logic)
  const { count } = await supabase
    .from('student_points')
    .select('*', { count: 'exact', head: true })
    .or(
      `total_points.gt.${userPoints.total_points},` +
      `and(total_points.eq.${userPoints.total_points},average_score.gt.${userPoints.average_score}),` +
      `and(total_points.eq.${userPoints.total_points},average_score.eq.${userPoints.average_score},missions_completed.gt.${userPoints.missions_completed})`
    );

  return (count || 0) + 1;
}

/**
 * Get top N users
 */
export async function getTopUsers(limit: number = 10): Promise<LeaderboardEntry[]> {
  return getLeaderboard({ limit, offset: 0 });
}

/**
 * Get users around a specific rank (for pagination context)
 */
export async function getUsersAroundRank(
  targetRank: number,
  contextSize: number = 5
): Promise<LeaderboardEntry[]> {
  const offset = Math.max(0, targetRank - contextSize - 1);
  const limit = contextSize * 2 + 1;

  return getLeaderboard({ limit, offset });
}

/**
 * Recalculate all ranks (useful for maintenance)
 * Note: This is expensive and should be run periodically, not on every update
 */
export async function recalculateLeaderboard(): Promise<void> {
  // The leaderboard is computed on-demand from student_points table
  // No separate recalculation needed - ranks are calculated in queries
  // This function exists for potential future optimizations (materialized views, etc.)
  console.log('Leaderboard recalculation not needed - computed on-demand');
}

