import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const competitionsRouter = router({
  // Get all competitions
  getAll: protectedProcedure.query(async () => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase
      .from('case_competitions')
      .select(`
        *,
        events (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch competitions: ${error.message}`);
    }

    return data || [];
  }),

  // Get competition by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data, error } = await supabase
        .from('case_competitions')
        .select(`
          *,
          events (*)
        `)
        .eq('id', input.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch competition: ${error.message}`);
      }

      return data;
    }),

  // Get competitions for an event
  getByEvent: protectedProcedure
    .input(z.object({ event_id: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data, error } = await supabase
        .from('case_competitions')
        .select(`
          *,
          events (*)
        `)
        .eq('event_id', input.event_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch competitions: ${error.message}`);
      }

      return data || [];
    }),

  // Create competition (admin only)
  create: adminProcedure
    .input(
      z.object({
        event_id: z.string().uuid(),
        title: z.string().min(1),
        description: z.string().optional(),
        rules: z.string().optional(),
        submission_instructions: z.string().optional(),
        deadline: z.string().optional(),
        max_team_size: z.number().default(4),
        min_team_size: z.number().default(2),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data, error } = await supabase
        .from('case_competitions')
        .insert({
          event_id: input.event_id,
          title: input.title,
          description: input.description,
          rules: input.rules,
          submission_instructions: input.submission_instructions,
          deadline: input.deadline,
          max_team_size: input.max_team_size,
          min_team_size: input.min_team_size,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create competition: ${error.message}`);
      }

      return data;
    }),

  // Update competition (admin only)
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        rules: z.string().optional(),
        submission_instructions: z.string().optional(),
        deadline: z.string().optional(),
        max_team_size: z.number().optional(),
        min_team_size: z.number().optional(),
        status: z.enum(['open', 'closed', 'judging', 'completed']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from('case_competitions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update competition: ${error.message}`);
      }

      return data;
    }),

  // Delete competition (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { error } = await supabase
        .from('case_competitions')
        .delete()
        .eq('id', input.id);

      if (error) {
        throw new Error(`Failed to delete competition: ${error.message}`);
      }

      return { success: true };
    }),

  // Get teams for a competition
  getTeams: protectedProcedure
    .input(z.object({ competition_id: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('competition_id', input.competition_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch teams: ${error.message}`);
      }

      return data || [];
    }),

  // Get user's teams
  getMyTeams: protectedProcedure.query(async ({ ctx }) => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        case_competitions (*,
          events (*)
        )
      `)
      .contains('members', [user.id]);

    if (error) {
      throw new Error(`Failed to fetch teams: ${error.message}`);
    }

    return data || [];
  }),

  // Create team
  createTeam: protectedProcedure
    .input(
      z.object({
        competition_id: z.string().uuid(),
        name: z.string().min(1),
        members: z.array(z.string().uuid()),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!input.members.includes(user.id)) {
        throw new Error('You must include yourself in the team');
      }

      // Get competition to check team size limits
      const { data: competition } = await supabase
        .from('case_competitions')
        .select('min_team_size, max_team_size')
        .eq('id', input.competition_id)
        .single();

      if (competition) {
        if (input.members.length < (competition.min_team_size || 2)) {
          throw new Error(`Team must have at least ${competition.min_team_size || 2} members`);
        }
        if (input.members.length > (competition.max_team_size || 4)) {
          throw new Error(`Team can have at most ${competition.max_team_size || 4} members`);
        }
      }

      const { data, error } = await supabase
        .from('teams')
        .insert({
          competition_id: input.competition_id,
          name: input.name,
          members: input.members,
          team_leader_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create team: ${error.message}`);
      }

      return data;
    }),

  // Update team
  updateTeam: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        members: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user is team leader
      const { data: team } = await supabase
        .from('teams')
        .select('team_leader_id, competition_id')
        .eq('id', input.id)
        .single();

      if (!team || team.team_leader_id !== user.id) {
        throw new Error('Only team leader can update team');
      }

      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update team: ${error.message}`);
      }

      return data;
    }),

  // Delete team
  deleteTeam: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user is team leader
      const { data: team } = await supabase
        .from('teams')
        .select('team_leader_id')
        .eq('id', input.id)
        .single();

      if (!team || team.team_leader_id !== user.id) {
        throw new Error('Only team leader can delete team');
      }

      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', input.id);

      if (error) {
        throw new Error(`Failed to delete team: ${error.message}`);
      }

      return { success: true };
    }),

  // Submit team submission (upload file)
  submitTeamSubmission: protectedProcedure
    .input(
      z.object({
        team_id: z.string().uuid(),
        submission_url: z.string().url(),
        submission_filename: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user is team member
      const { data: team } = await supabase
        .from('teams')
        .select('members, competition_id')
        .eq('id', input.team_id)
        .single();

      if (!team || !team.members.includes(user.id)) {
        throw new Error('Only team members can submit');
      }

      // Check deadline
      const { data: competition } = await supabase
        .from('case_competitions')
        .select('deadline')
        .eq('id', team.competition_id)
        .single();

      if (competition?.deadline && new Date(competition.deadline) < new Date()) {
        throw new Error('Submission deadline has passed');
      }

      const { data, error } = await supabase
        .from('teams')
        .update({
          submission_url: input.submission_url,
          submission_filename: input.submission_filename,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', input.team_id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to submit: ${error.message}`);
      }

      return data;
    }),

  // Get rubrics for competition
  getRubrics: protectedProcedure
    .input(z.object({ competition_id: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data, error } = await supabase
        .from('competition_rubrics')
        .select('*')
        .eq('competition_id', input.competition_id)
        .order('order_index', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch rubrics: ${error.message}`);
      }

      return data || [];
    }),

  // Create rubric (admin only)
  createRubric: adminProcedure
    .input(
      z.object({
        competition_id: z.string().uuid(),
        criterion: z.string().min(1),
        description: z.string().optional(),
        max_score: z.number().default(10),
        weight: z.number().default(1.0),
        order_index: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data, error } = await supabase
        .from('competition_rubrics')
        .insert(input)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create rubric: ${error.message}`);
      }

      return data;
    }),

  // Submit score (judge)
  submitScore: protectedProcedure
    .input(
      z.object({
        team_id: z.string().uuid(),
        rubric_id: z.string().uuid(),
        score: z.number().min(0),
        comments: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user is assigned judge
      const { data: team } = await supabase
        .from('teams')
        .select('competition_id')
        .eq('id', input.team_id)
        .single();

      if (!team) {
        throw new Error('Team not found');
      }

      const { data: judgeAssignment } = await supabase
        .from('competition_judges')
        .select('judge_id')
        .eq('competition_id', team.competition_id)
        .eq('judge_id', user.id)
        .single();

      if (!judgeAssignment) {
        throw new Error('You are not assigned as a judge for this competition');
      }

      const { data, error } = await supabase
        .from('competition_scores')
        .upsert({
          team_id: input.team_id,
          judge_id: user.id,
          rubric_id: input.rubric_id,
          score: input.score,
          comments: input.comments,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'team_id,judge_id,rubric_id'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to submit score: ${error.message}`);
      }

      return data;
    }),

  // Get scores for team (judges and team leader can view)
  getTeamScores: protectedProcedure
    .input(z.object({ team_id: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: scores, error } = await supabase
        .from('competition_scores')
        .select(`
          *,
          competition_rubrics (*),
          users:judge_id (id, email, full_name)
        `)
        .eq('team_id', input.team_id);

      if (error) {
        throw new Error(`Failed to fetch scores: ${error.message}`);
      }

      return scores || [];
    }),

  // Get competition results (aggregated scores)
  getResults: protectedProcedure
    .input(z.object({ competition_id: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Get all teams with their aggregated scores
      const { data: teams } = await supabase
        .from('teams')
        .select('*')
        .eq('competition_id', input.competition_id);

      if (!teams) {
        return [];
      }

      // Get all scores and calculate totals
      const results = await Promise.all(
        teams.map(async (team) => {
          const { data: scores } = await supabase
            .from('competition_scores')
            .select(`
              score,
              competition_rubrics!inner(weight, max_score)
            `)
            .eq('team_id', team.id);

          let totalScore = 0;
          if (scores) {
            totalScore = scores.reduce((sum, s: any) => {
              const rubric = s.competition_rubrics;
              return sum + (s.score * (rubric.weight || 1.0));
            }, 0);
          }

          return {
            ...team,
            totalScore,
            scoreCount: scores?.length || 0,
          };
        })
      );

      // Sort by score descending
      return results.sort((a, b) => b.totalScore - a.totalScore);
    }),

  // Assign judge (admin only)
  assignJudge: adminProcedure
    .input(
      z.object({
        competition_id: z.string().uuid(),
        judge_id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data, error } = await supabase
        .from('competition_judges')
        .insert(input)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to assign judge: ${error.message}`);
      }

      return data;
    }),

  // Publish results (admin only)
  publishResults: adminProcedure
    .input(z.object({ competition_id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data, error } = await supabase
        .from('case_competitions')
        .update({ results_published: true, status: 'completed' })
        .eq('id', input.competition_id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to publish results: ${error.message}`);
      }

      return data;
    }),
});

