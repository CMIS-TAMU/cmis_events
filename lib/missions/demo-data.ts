/**
 * Demo data generator for leaderboard
 * Used for demo purposes to show ratings/leaderboard functionality
 */

export interface DemoLeaderboardEntry {
  user_id: string;
  total_points: number;
  average_score: number;
  missions_completed: number;
  users: {
    id: string;
    email: string;
    full_name: string;
    major: string | null;
    graduation_year: number | null;
  };
}

const demoNames = [
  { name: 'Alex Chen', major: 'Computer Science', year: 2025 },
  { name: 'Sarah Johnson', major: 'Data Science', year: 2024 },
  { name: 'Michael Rodriguez', major: 'Information Systems', year: 2025 },
  { name: 'Emily Wang', major: 'Computer Science', year: 2026 },
  { name: 'David Kim', major: 'Cybersecurity', year: 2024 },
  { name: 'Jessica Martinez', major: 'Data Science', year: 2025 },
  { name: 'Ryan Thompson', major: 'Information Systems', year: 2026 },
  { name: 'Olivia Brown', major: 'Computer Science', year: 2024 },
  { name: 'James Wilson', major: 'Cybersecurity', year: 2025 },
  { name: 'Sophia Davis', major: 'Data Science', year: 2026 },
  { name: 'Daniel Lee', major: 'Information Systems', year: 2024 },
  { name: 'Isabella Garcia', major: 'Computer Science', year: 2025 },
  { name: 'Matthew Taylor', major: 'Cybersecurity', year: 2026 },
  { name: 'Ava Anderson', major: 'Data Science', year: 2024 },
  { name: 'Christopher Moore', major: 'Information Systems', year: 2025 },
  { name: 'Mia Jackson', major: 'Computer Science', year: 2026 },
  { name: 'Andrew White', major: 'Cybersecurity', year: 2024 },
  { name: 'Charlotte Harris', major: 'Data Science', year: 2025 },
  { name: 'Joshua Martin', major: 'Information Systems', year: 2026 },
  { name: 'Amelia Clark', major: 'Computer Science', year: 2024 },
];

/**
 * Generate fake leaderboard data for demo
 */
export function generateDemoLeaderboard(count: number = 20): DemoLeaderboardEntry[] {
  const entries: DemoLeaderboardEntry[] = [];
  
  for (let i = 0; i < count && i < demoNames.length; i++) {
    const person = demoNames[i];
    const rank = i + 1;
    
    // Generate realistic scores based on rank
    // Top performers have higher scores
    const basePoints = 5000 - (rank * 200) + Math.floor(Math.random() * 300);
    const totalPoints = Math.max(100, basePoints);
    
    // Average score decreases slightly with rank, but stays high
    const baseScore = 95 - (rank * 1.5) + (Math.random() * 3);
    const averageScore = Math.max(75, Math.min(100, baseScore));
    
    // Missions completed increases with rank (top performers did more)
    const missionsCompleted = Math.max(5, 25 - rank + Math.floor(Math.random() * 5));
    
    entries.push({
      user_id: `demo-user-${i + 1}`,
      total_points: totalPoints,
      average_score: parseFloat(averageScore.toFixed(2)),
      missions_completed: missionsCompleted,
      users: {
        id: `demo-user-${i + 1}`,
        email: `demo${i + 1}@tamu.edu`,
        full_name: person.name,
        major: person.major,
        graduation_year: person.year,
      },
    });
  }
  
  return entries;
}

/**
 * Generate demo rank data for current user
 */
export function generateDemoMyRank(userId: string): {
  rank: number;
  totalPoints: number;
  averageScore: number;
  missionsCompleted: number;
} {
  // Random rank between 5-15 for demo
  const rank = Math.floor(Math.random() * 10) + 5;
  const totalPoints = 2000 + Math.floor(Math.random() * 1000);
  const averageScore = 80 + Math.random() * 15;
  const missionsCompleted = 8 + Math.floor(Math.random() * 7);
  
  return {
    rank,
    totalPoints,
    averageScore: parseFloat(averageScore.toFixed(2)),
    missionsCompleted,
  };
}

