import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';
import { uploadResume, getResumeSignedUrl, deleteResume } from '@/lib/storage/resume';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const resumesRouter = router({
  // Upload resume
  upload: protectedProcedure
    .input(
      z.object({
        file: z.any(), // File will be handled separately
        major: z.string().optional(),
        gpa: z.number().min(0).max(4.0).optional(),
        skills: z.array(z.string()).optional(),
        graduationYear: z.number().int().min(2020).max(2030).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get current resume info to delete old one
      const { data: currentUser } = await supabase
        .from('users')
        .select('resume_url, resume_filename, resume_version')
        .eq('id', user.id)
        .single();

      // Delete old resume if exists
      if (currentUser?.resume_filename) {
        await deleteResume(currentUser.resume_filename);
      }

      // Note: File upload will be handled via API route
      // This endpoint just updates the database record
      const newVersion = (currentUser?.resume_version || 0) + 1;

      const { data, error } = await supabase
        .from('users')
        .update({
          resume_url: input.file?.url || null,
          resume_filename: input.file?.filename || null,
          resume_uploaded_at: new Date().toISOString(),
          resume_version: newVersion,
          major: input.major || null,
          gpa: input.gpa || null,
          skills: input.skills || null,
          graduation_year: input.graduationYear || null,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update resume: ${error.message}`);
      }

      return data;
    }),

  // Get user's resume
  getMyResume: protectedProcedure.query(async ({ ctx }) => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('users')
      .select('resume_url, resume_filename, resume_uploaded_at, resume_version, major, gpa, skills, graduation_year')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch resume: ${error.message}`);
    }

    // Get signed URL if resume exists
    if (data?.resume_filename) {
      const signedUrl = await getResumeSignedUrl(data.resume_filename);
      return {
        ...data,
        signedUrl,
      };
    }

    return data;
  }),

  // Delete resume
  delete: protectedProcedure.mutation(async ({ ctx }) => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get resume info
    const { data: userData } = await supabase
      .from('users')
      .select('resume_filename')
      .eq('id', user.id)
      .single();

    if (userData?.resume_filename) {
      await deleteResume(userData.resume_filename);
    }

    // Clear resume fields
    const { data, error } = await supabase
      .from('users')
      .update({
        resume_url: null,
        resume_filename: null,
        resume_uploaded_at: null,
        resume_version: 1,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to delete resume: ${error.message}`);
    }

    return { success: true };
  }),

  // Search resumes (for sponsors/admins)
  search: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        major: z.string().optional(),
        skills: z.array(z.string()).optional(),
        minGpa: z.number().optional(),
        maxGpa: z.number().optional(),
        graduationYear: z.number().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      let query = supabase
        .from('users')
        .select('id, email, full_name, major, gpa, skills, graduation_year, resume_uploaded_at')
        .not('resume_filename', 'is', null)
        .order('resume_uploaded_at', { ascending: false });

      if (input.search) {
        query = query.or(`full_name.ilike.%${input.search}%,email.ilike.%${input.search}%,major.ilike.%${input.search}%`);
      }

      if (input.major) {
        query = query.eq('major', input.major);
      }

      if (input.skills && input.skills.length > 0) {
        query = query.contains('skills', input.skills);
      }

      if (input.minGpa !== undefined) {
        query = query.gte('gpa', input.minGpa);
      }

      if (input.maxGpa !== undefined) {
        query = query.lte('gpa', input.maxGpa);
      }

      if (input.graduationYear) {
        query = query.eq('graduation_year', input.graduationYear);
      }

      query = query.range(input.offset, input.offset + input.limit - 1);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to search resumes: ${error.message}`);
      }

      return data || [];
    }),

  // Track resume view (for analytics)
  trackView: adminProcedure
    .input(z.object({ userId: z.string().uuid(), eventId: z.string().uuid().optional() }))
    .mutation(async ({ input }) => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.from('resume_views').insert({
        user_id: input.userId,
        viewed_by: user.id,
        event_id: input.eventId || null,
      });

      if (error) {
        throw new Error(`Failed to track view: ${error.message}`);
      }

      return { success: true };
    }),
});

