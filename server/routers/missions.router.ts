import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';
import { calculatePoints, getPointsReason } from '@/lib/missions/points-calculator';
import { createAdminSupabase } from '@/lib/supabase/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper to check if user is sponsor (uses admin client to bypass RLS)
async function checkSponsor(userId: string): Promise<boolean> {
  const supabaseAdmin = createAdminSupabase();
  const { data } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
  
  return data?.role === 'sponsor' || data?.role === 'admin';
}

// Sponsor procedure (requires sponsor or admin role)
const sponsorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error('User not authenticated');
  }

  // First check if role is already in context (from tRPC context)
  if (ctx.user.role === 'sponsor' || ctx.user.role === 'admin') {
    return next({ ctx });
  }

  // If not in context, check database using admin client
  const isSponsor = await checkSponsor(ctx.user.id);
  if (!isSponsor) {
    console.error(`[Sponsor Check Failed] User ID: ${ctx.user.id}, Email: ${ctx.user.email}, Context Role: ${ctx.user.role}`);
    throw new Error('Access denied. Sponsor role required.');
  }

  return next({ ctx });
});

// Schemas
const missionCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  requirements: z.string().optional(),
  starter_files_url: z.string().url().optional(),
  submission_instructions: z.string().optional(),
  max_points: z.number().int().min(1).max(1000).default(100),
  time_limit_minutes: z.number().int().positive().optional(),
  deadline: z.string().optional().refine((val) => {
    if (!val) return true;
    // Accept datetime-local format (YYYY-MM-DDTHH:mm) or ISO datetime
    const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    const isoDatetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;
    return datetimeLocalRegex.test(val) || isoDatetimeRegex.test(val) || !isNaN(Date.parse(val));
  }, 'Invalid datetime format'),
});

const missionUpdateSchema = missionCreateSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['draft', 'active', 'closed', 'archived']).optional(),
});

const submitSolutionSchema = z.object({
  mission_id: z.string().uuid(),
  submission_url: z.string().url().optional(),
  submission_files: z.array(z.object({
    url: z.string().url(),
    filename: z.string(),
  })).optional(),
  submission_text: z.string().optional(),
});

const reviewSubmissionSchema = z.object({
  submission_id: z.string().uuid(),
  score: z.number().min(0).max(100),
  sponsor_feedback: z.string().optional(),
  sponsor_notes: z.string().optional(),
});

const browseMissionsSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

const leaderboardSchema = z.object({
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

export const missionsRouter = router({
  // ========== SPONSOR ENDPOINTS ==========

  // Create mission (sponsor only)
  createMission: sponsorProcedure
    .input(missionCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Use user from context (already authenticated by sponsorProcedure)
      const userId = ctx.user.id;

      // Use admin client to bypass RLS for mission creation
      const supabaseAdmin = createAdminSupabase();

      const { data, error } = await supabaseAdmin
        .from('missions')
        .insert({
          sponsor_id: userId,
          ...input,
          status: 'draft',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create mission: ${error.message}`);
      }

      return data;
    }),

  // Get sponsor's missions
  getMyMissions: sponsorProcedure
    .query(async ({ ctx }) => {
      // Use admin client to bypass RLS
      const supabaseAdmin = createAdminSupabase();

      const { data, error } = await supabaseAdmin
        .from('missions')
        .select('*')
        .eq('sponsor_id', ctx.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch missions: ${error.message}`);
      }

      return data || [];
    }),

  // Get mission by ID (sponsor can view their own, students can view active)
  getMission: protectedProcedure
    .input(z.object({ missionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Use admin client to bypass RLS for reading missions
      const supabaseAdmin = createAdminSupabase();

      const { data: mission, error } = await supabaseAdmin
        .from('missions')
        .select('*')
        .eq('id', input.missionId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch mission: ${error.message}`);
      }

      if (!mission) {
        throw new Error('Mission not found');
      }

      // Check if user is sponsor or mission is active
      const isSponsor = await checkSponsor(ctx.user.id);
      if (!isSponsor && mission.status !== 'active' && mission.status !== 'closed') {
        throw new Error('Mission not available');
      }

      // Additional check: if sponsor, verify they own this mission
      if (isSponsor && mission.sponsor_id !== ctx.user.id) {
        throw new Error('Access denied. This mission belongs to another sponsor.');
      }

      return mission;
    }),

  // Update mission
  updateMission: sponsorProcedure
    .input(missionUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { id, ...updates } = input;

      // Verify mission belongs to sponsor
      const { data: mission } = await supabase
        .from('missions')
        .select('sponsor_id, published_at')
        .eq('id', id)
        .single();

      if (!mission || mission.sponsor_id !== ctx.user.id) {
        throw new Error('Mission not found or access denied');
      }

      // If publishing, set published_at
      if (updates.status === 'active' && !mission.published_at) {
        (updates as any).published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('missions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update mission: ${error.message}`);
      }

      return data;
    }),

  // Publish mission
  publishMission: sponsorProcedure
    .input(z.object({ missionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Use admin client to bypass RLS
      const supabaseAdmin = createAdminSupabase();

      // First verify mission belongs to sponsor
      const { data: mission } = await supabaseAdmin
        .from('missions')
        .select('sponsor_id')
        .eq('id', input.missionId)
        .single();

      if (!mission || mission.sponsor_id !== ctx.user.id) {
        throw new Error('Mission not found or access denied');
      }

      const { data, error } = await supabaseAdmin
        .from('missions')
        .update({
          status: 'active',
          published_at: new Date().toISOString(),
        })
        .eq('id', input.missionId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to publish mission: ${error.message}`);
      }

      // Send email notification to students (async, don't wait)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      fetch(`${appUrl}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mission_published',
          studentName: 'Student', // Will be replaced when sending to multiple students
          studentEmail: '', // Will be populated when sending to multiple students
          mission: {
            id: data.id,
            title: data.title,
            difficulty: data.difficulty,
            category: data.category,
            max_points: data.max_points,
          },
        }),
      }).catch((err) => console.error('Failed to send mission published email:', err));

      return data;
    }),

  // Get submissions for a mission
  getMissionSubmissions: sponsorProcedure
    .input(z.object({ missionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      // User is already authenticated via ctx.user from protectedProcedure/sponsorProcedure

      // Verify mission belongs to sponsor
      const { data: mission } = await supabase
        .from('missions')
        .select('sponsor_id')
        .eq('id', input.missionId)
        .single();

      if (!mission || mission.sponsor_id !== ctx.user.id) {
        throw new Error('Mission not found or access denied');
      }

      const { data, error } = await supabase
        .from('mission_submissions')
        .select(`
          *,
          users:student_id (
            id,
            email,
            full_name,
            major,
            graduation_year,
            skills
          )
        `)
        .eq('mission_id', input.missionId)
        .order('submitted_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch submissions: ${error.message}`);
      }

      return data || [];
    }),

  // Review submission (score and feedback)
  reviewSubmission: sponsorProcedure
    .input(reviewSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const supabaseAdmin = createAdminSupabase();

      // Get submission with mission details
      const { data: submission, error: subError } = await supabase
        .from('mission_submissions')
        .select(`
          *,
          missions:mission_id (
            id,
            sponsor_id,
            difficulty,
            max_points
          )
        `)
        .eq('id', input.submission_id)
        .single();

      if (subError || !submission) {
        throw new Error('Submission not found');
      }

      const mission = submission.missions as any;
      if (mission.sponsor_id !== ctx.user.id) {
        throw new Error('Access denied');
      }

      // Calculate points
      const pointsResult = calculatePoints({
        score: input.score,
        difficulty: mission.difficulty,
        maxPoints: mission.max_points || 100,
      });

      // Update submission
      const { data: updatedSubmission, error: updateError } = await supabaseAdmin
        .from('mission_submissions')
        .update({
          score: input.score,
          points_awarded: pointsResult.totalPoints,
          sponsor_feedback: input.sponsor_feedback,
          sponsor_notes: input.sponsor_notes,
          status: 'scored',
          reviewed_at: new Date().toISOString(),
          reviewed_by: ctx.user.id,
        })
        .eq('id', input.submission_id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to review submission: ${updateError.message}`);
      }

      // Update student points using database function
      const { error: pointsError } = await supabaseAdmin.rpc('update_student_points', {
        p_user_id: submission.student_id,
        p_points: pointsResult.totalPoints,
        p_score: input.score,
      });

      if (pointsError) {
        console.error('Error updating student points:', pointsError);
        // Continue anyway - points can be recalculated
      }

      // Create point transaction
      await supabaseAdmin
        .from('point_transactions')
        .insert({
          user_id: submission.student_id,
          mission_id: mission.id,
          submission_id: input.submission_id,
          points: pointsResult.totalPoints,
          reason: getPointsReason(input.score, mission.difficulty, input.score === 100),
        });

      // Get student info and rank for email
      const { data: studentUser } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', submission.student_id)
        .single();

      const { data: studentPoints } = await supabase
        .from('student_points')
        .select('total_points')
        .eq('user_id', submission.student_id)
        .single();

      // Get student rank
      const { count: rankCount } = await supabase
        .from('student_points')
        .select('*', { count: 'exact', head: true })
        .or(
          `total_points.gt.${studentPoints?.total_points || 0},` +
          `and(total_points.eq.${studentPoints?.total_points || 0},average_score.gt.${updatedSubmission.score || 0})`
        );
      const rank = (rankCount || 0) + 1;

      // Send email notification to student (async)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const emailType = input.score === 100 ? 'perfect_score' : 'submission_reviewed';
      
      fetch(`${appUrl}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          studentName: studentUser?.full_name || 'Student',
          studentEmail: studentUser?.email || '',
          mission: {
            id: mission.id,
            title: mission.title,
          },
          score: input.score,
          pointsAwarded: pointsResult.totalPoints,
          totalPoints: studentPoints?.total_points || 0,
          rank: rank,
          feedback: input.sponsor_feedback,
          bonusPoints: input.score === 100 ? pointsResult.totalPoints - (mission.max_points || 100) : 0,
        }),
      }).catch((err) => console.error('Failed to send submission reviewed email:', err));

      return updatedSubmission;
    }),

  // Get mission analytics
  getMissionAnalytics: sponsorProcedure
    .input(z.object({ missionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      // User is already authenticated via ctx.user from protectedProcedure/sponsorProcedure

      // Verify mission belongs to sponsor
      const { data: mission } = await supabase
        .from('missions')
        .select('sponsor_id')
        .eq('id', input.missionId)
        .single();

      if (!mission || mission.sponsor_id !== ctx.user.id) {
        throw new Error('Mission not found or access denied');
      }

      // Get submission stats
      const { data: submissions } = await supabase
        .from('mission_submissions')
        .select('score, points_awarded, submitted_at')
        .eq('mission_id', input.missionId)
        .eq('status', 'scored');

      const totalSubmissions = submissions?.length || 0;
      const avgScore = submissions && submissions.length > 0
        ? submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length
        : 0;
      const totalPointsAwarded = submissions?.reduce((sum, s) => sum + (s.points_awarded || 0), 0) || 0;

      // Get interaction stats
      const { data: interactions } = await supabase
        .from('mission_interactions')
        .select('interaction_type')
        .eq('mission_id', input.missionId);

      const views = interactions?.filter(i => i.interaction_type === 'viewed').length || 0;
      const starts = interactions?.filter(i => i.interaction_type === 'started').length || 0;

      return {
        totalSubmissions,
        avgScore: Math.round(avgScore * 100) / 100,
        totalPointsAwarded,
        views,
        starts,
        completionRate: starts > 0 ? Math.round((totalSubmissions / starts) * 100) : 0,
      };
    }),

  // ========== STUDENT ENDPOINTS ==========

  // Browse active missions
  browseMissions: protectedProcedure
    .input(browseMissionsSchema)
    .query(async ({ ctx, input }) => {
      // Use admin client to bypass RLS for reading active missions
      const supabaseAdmin = createAdminSupabase();

      let query = supabaseAdmin
        .from('missions')
        .select('*')
        .eq('status', 'active')
        .order('published_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.difficulty) {
        query = query.eq('difficulty', input.difficulty);
      }

      if (input.category) {
        query = query.eq('category', input.category);
      }

      if (input.tags && input.tags.length > 0) {
        query = query.contains('tags', input.tags);
      }

      if (input.search) {
        query = query.or(`title.ilike.%${input.search}%,description.ilike.%${input.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch missions: ${error.message}`);
      }

      return data || [];
    }),

  // Start mission (creates interaction record)
  startMission: protectedProcedure
    .input(z.object({ missionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Use admin client to bypass RLS
      const supabaseAdmin = createAdminSupabase();

      // Check if mission is active
      const { data: mission } = await supabaseAdmin
        .from('missions')
        .select('id, status')
        .eq('id', input.missionId)
        .single();

      if (!mission || mission.status !== 'active') {
        throw new Error('Mission not available');
      }

      // Create interaction (allow duplicates - just track that user started)
      const { error: interactionError } = await supabaseAdmin
        .from('mission_interactions')
        .insert({
          mission_id: input.missionId,
          user_id: ctx.user.id,
          interaction_type: 'started',
        });

      // Ignore duplicate errors (user may have already started before)
      if (interactionError && interactionError.code !== '23505') {
        throw new Error(`Failed to start mission: ${interactionError.message}`);
      }

      // Create submission record with started_at
      const { data: submission, error: subError } = await supabaseAdmin
        .from('mission_submissions')
        .upsert({
          mission_id: input.missionId,
          student_id: ctx.user.id,
          started_at: new Date().toISOString(),
          status: 'submitted',
        }, {
          onConflict: 'mission_id,student_id',
        })
        .select()
        .single();

      if (subError && subError.code !== '23505') { // Ignore duplicate key errors
        throw new Error(`Failed to create submission: ${subError.message}`);
      }

      return { success: true, submission };
    }),

  // Submit solution
  submitSolution: protectedProcedure
    .input(submitSolutionSchema)
    .mutation(async ({ ctx, input }) => {
      // Use admin client to bypass RLS
      const supabaseAdmin = createAdminSupabase();

      // Get submission
      const { data: submission, error: subError } = await supabaseAdmin
        .from('mission_submissions')
        .select('*, missions:mission_id (*)')
        .eq('mission_id', input.mission_id)
        .eq('student_id', ctx.user.id)
        .single();

      if (subError || !submission) {
        throw new Error('Submission not found. Please start the mission first.');
      }

      const mission = submission.missions as any;

      // Check deadline
      if (mission.deadline && new Date(mission.deadline) < new Date()) {
        throw new Error('Submission deadline has passed');
      }

      // Calculate time spent
      const startedAt = new Date(submission.started_at);
      const now = new Date();
      const timeSpentMinutes = Math.round((now.getTime() - startedAt.getTime()) / (1000 * 60));

      // Update submission
      const { data: updatedSubmission, error: updateError } = await supabaseAdmin
        .from('mission_submissions')
        .update({
          submission_url: input.submission_url,
          submission_files: input.submission_files || [],
          submission_text: input.submission_text,
          submitted_at: new Date().toISOString(),
          time_spent_minutes: timeSpentMinutes,
          status: 'submitted',
        })
        .eq('id', submission.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to submit: ${updateError.message}`);
      }

      // Create interaction
      await supabaseAdmin
        .from('mission_interactions')
        .upsert({
          mission_id: input.mission_id,
          user_id: ctx.user.id,
          interaction_type: 'submitted',
        }, {
          onConflict: 'mission_id,user_id,interaction_type',
        });

      // Get sponsor and student info for email
      const { data: sponsorUser } = await supabaseAdmin
        .from('users')
        .select('email, full_name')
        .eq('id', mission.sponsor_id)
        .single();

      const { data: studentUser } = await supabaseAdmin
        .from('users')
        .select('email, full_name')
        .eq('id', ctx.user.id)
        .single();

      // Send email notification to sponsor (async)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      fetch(`${appUrl}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'submission_received',
          sponsorName: sponsorUser?.full_name || 'Sponsor',
          sponsorEmail: sponsorUser?.email || '',
          mission: {
            id: mission.id,
            title: mission.title,
          },
          student: {
            name: studentUser?.full_name || 'Student',
            email: studentUser?.email || '',
          },
          submissionId: updatedSubmission.id,
        }),
      }).catch((err) => console.error('Failed to send submission received email:', err));

      return updatedSubmission;
    }),

  // Get my submissions
  getMySubmissions: protectedProcedure
    .query(async ({ ctx }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      // User is already authenticated via ctx.user from protectedProcedure/sponsorProcedure

      const { data, error } = await supabase
        .from('mission_submissions')
        .select(`
          *,
          missions:mission_id (
            id,
            title,
            difficulty,
            category,
            max_points
          )
        `)
        .eq('student_id', ctx.user.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch submissions: ${error.message}`);
      }

      return data || [];
    }),

  // Get submission details
  getSubmission: protectedProcedure
    .input(z.object({ submissionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Use admin client to bypass RLS
      const supabaseAdmin = createAdminSupabase();

      const { data, error } = await supabaseAdmin
        .from('mission_submissions')
        .select(`
          *,
          missions:mission_id (
            id,
            title,
            difficulty,
            category,
            max_points,
            sponsor_id
          )
        `)
        .eq('id', input.submissionId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch submission: ${error.message}`);
      }

      // Check access
      const mission = data.missions as any;
      if (data.student_id !== ctx.user.id && mission.sponsor_id !== ctx.user.id) {
        throw new Error('Access denied');
      }

      return data;
    }),

  // ========== LEADERBOARD ENDPOINTS ==========

  // Get leaderboard
  getLeaderboard: protectedProcedure
    .input(leaderboardSchema)
    .query(async ({ ctx, input }) => {
      // Use admin client to bypass RLS
      const supabaseAdmin = createAdminSupabase();

      const { data, error } = await supabaseAdmin
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
        .order('total_points', { ascending: false })
        .order('average_score', { ascending: false })
        .order('missions_completed', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new Error(`Failed to fetch leaderboard: ${error.message}`);
      }

      // Add rank
      let leaderboard = (data || []).map((entry, index) => ({
        ...entry,
        rank: input.offset + index + 1,
      }));

      // If no real data, add demo data for demo purposes
      if (leaderboard.length === 0) {
        const { generateDemoLeaderboard } = await import('@/lib/missions/demo-data');
        const demoData = generateDemoLeaderboard(input.limit);
        leaderboard = demoData.map((entry, index) => ({
          ...entry,
          rank: input.offset + index + 1,
        }));
      }

      return leaderboard;
    }),

  // Get my leaderboard position
  getMyRank: protectedProcedure
    .query(async ({ ctx }) => {
      // Use admin client to bypass RLS
      const supabaseAdmin = createAdminSupabase();

      // Get my points
      const { data: myPoints } = await supabaseAdmin
        .from('student_points')
        .select('total_points, average_score, missions_completed')
        .eq('user_id', ctx.user.id)
        .single();

      // If no real data, return demo data for demo purposes
      if (!myPoints) {
        const { generateDemoMyRank } = await import('@/lib/missions/demo-data');
        return generateDemoMyRank(ctx.user.id);
      }

      // Count users with more points
      const { count } = await supabaseAdmin
        .from('student_points')
        .select('*', { count: 'exact', head: true })
        .or(`total_points.gt.${myPoints.total_points},and(total_points.eq.${myPoints.total_points},average_score.gt.${myPoints.average_score}),and(total_points.eq.${myPoints.total_points},average_score.eq.${myPoints.average_score},missions_completed.gt.${myPoints.missions_completed})`);

      return {
        rank: (count || 0) + 1,
        totalPoints: myPoints.total_points,
        averageScore: myPoints.average_score,
        missionsCompleted: myPoints.missions_completed,
      };
    }),

  // ========== ADMIN ENDPOINTS ==========

  // Get all missions (admin)
  getAllMissions: adminProcedure
    .query(async ({ ctx }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          users:sponsor_id (
            id,
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch missions: ${error.message}`);
      }

      return data || [];
    }),

  // Get platform analytics (admin)
  getPlatformAnalytics: adminProcedure
    .query(async ({ ctx }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Total missions
      const { count: totalMissions } = await supabase
        .from('missions')
        .select('*', { count: 'exact', head: true });

      // Active missions
      const { count: activeMissions } = await supabase
        .from('missions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Total submissions
      const { count: totalSubmissions } = await supabase
        .from('mission_submissions')
        .select('*', { count: 'exact', head: true });

      // Total students with points
      const { count: activeStudents } = await supabase
        .from('student_points')
        .select('*', { count: 'exact', head: true })
        .gt('total_points', 0);

      // Total points awarded
      const { data: pointsData } = await supabase
        .from('point_transactions')
        .select('points')
        .gt('points', 0);

      const totalPointsAwarded = pointsData?.reduce((sum, t) => sum + t.points, 0) || 0;

      return {
        totalMissions: totalMissions || 0,
        activeMissions: activeMissions || 0,
        totalSubmissions: totalSubmissions || 0,
        activeStudents: activeStudents || 0,
        totalPointsAwarded,
      };
    }),
});

