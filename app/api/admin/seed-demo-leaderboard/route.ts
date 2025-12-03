import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Demo student names for fake data
const DEMO_NAMES = [
  'Alex Chen',
  'Sarah Johnson',
  'Michael Rodriguez',
  'Emily Davis',
  'David Kim',
  'Jessica Martinez',
  'Ryan Thompson',
  'Amanda Wilson',
  'James Anderson',
  'Lisa Brown',
  'Christopher Lee',
  'Michelle Garcia',
  'Daniel White',
  'Ashley Taylor',
  'Matthew Harris',
];

const MAJORS = [
  'Computer Science',
  'Information Systems',
  'Data Science',
  'Cybersecurity',
  'Software Engineering',
  'Business Analytics',
];

const GRADUATION_YEARS = [2024, 2025, 2026, 2027];

/**
 * Seed demo leaderboard data
 * This creates fake student points for demonstration purposes
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createAdminSupabase();

    // Get all existing users (students)
    const { data: existingUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role')
      .eq('role', 'user')
      .limit(20);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    const students = existingUsers || [];
    const demoData: Array<{
      user_id: string;
      total_points: number;
      missions_completed: number;
      missions_perfect_score: number;
      average_score: number;
    }> = [];

    // Generate fake data for existing students
    students.forEach((student, index) => {
      const missionsCompleted = Math.floor(Math.random() * 15) + 1; // 1-15 missions
      const perfectScores = Math.floor(missionsCompleted * 0.3); // 30% perfect scores
      const averageScore = 60 + Math.random() * 35; // 60-95 average
      const totalPoints = Math.floor(
        missionsCompleted * averageScore * (0.8 + Math.random() * 0.4) // Varied point calculation
      );

      demoData.push({
        user_id: student.id,
        total_points: totalPoints,
        missions_completed: missionsCompleted,
        missions_perfect_score: perfectScores,
        average_score: Math.round(averageScore * 100) / 100,
      });
    });

    // If we don't have enough students, create demo entries
    if (students.length < 10) {
      const needed = 10 - students.length;
      for (let i = 0; i < needed; i++) {
        const missionsCompleted = Math.floor(Math.random() * 15) + 1;
        const perfectScores = Math.floor(missionsCompleted * 0.3);
        const averageScore = 60 + Math.random() * 35;
        const totalPoints = Math.floor(
          missionsCompleted * averageScore * (0.8 + Math.random() * 0.4)
        );

        // Create a demo user
        const demoName = DEMO_NAMES[i % DEMO_NAMES.length];
        const demoEmail = `demo${i + 1}@example.com`;
        const major = MAJORS[Math.floor(Math.random() * MAJORS.length)];
        const graduationYear = GRADUATION_YEARS[Math.floor(Math.random() * GRADUATION_YEARS.length)];

        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert({
            email: demoEmail,
            full_name: demoName,
            role: 'user',
            major: major,
            graduation_year: graduationYear,
          })
          .select()
          .single();

        if (!createError && newUser) {
          demoData.push({
            user_id: newUser.id,
            total_points: totalPoints,
            missions_completed: missionsCompleted,
            missions_perfect_score: perfectScores,
            average_score: Math.round(averageScore * 100) / 100,
          });
        }
      }
    }

    // Sort by total points (descending) for realistic ranking
    demoData.sort((a, b) => b.total_points - a.total_points);

    // Upsert student points
    const upsertPromises = demoData.map((data) =>
      supabaseAdmin
        .from('student_points')
        .upsert(
          {
            ...data,
            last_updated: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        )
    );

    const results = await Promise.all(upsertPromises);
    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      console.error('Some upserts failed:', errors);
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${demoData.length} demo leaderboard entries`,
      data: {
        entriesCreated: demoData.length,
        topScore: demoData[0]?.total_points || 0,
      },
    });
  } catch (error: any) {
    console.error('Demo leaderboard seed error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to seed demo leaderboard',
      },
      { status: 500 }
    );
  }
}

