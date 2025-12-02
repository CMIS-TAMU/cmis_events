import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/server';

/**
 * API route to set user role to admin
 * This uses service role to bypass RLS
 * Only for development/testing - should be restricted in production
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminSupabase();

    // Get user ID from auth.users using RPC or direct query
    // First, try to get user from public.users by email to get the ID
    const { data: existingByEmail } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    // If user exists in public.users, use that ID
    let userId = existingByEmail?.id;

    // If not found, we need to query auth.users directly via SQL
    // Since we can't directly query auth.users from client, we'll create/update by email
    // The INSERT will handle both cases

    // Use RPC call to get user ID from auth.users, or update by email
    // First try to update existing user by email
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role: 'admin' })
      .eq('email', email)
      .select()
      .maybeSingle();

    let data, error;
    
    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update role: ${updateError.message}` },
        { status: 500 }
      );
    }

    // If user was updated, return success
    if (updatedUser) {
      return NextResponse.json({
        success: true,
        message: `User ${email} is now an admin`,
        data: {
          email: updatedUser.email,
          role: updatedUser.role,
          id: updatedUser.id,
        },
      });
    } else {
      // User doesn't exist in public.users - create it
      // We need to get the ID from auth.users via SQL
      // Use a SQL function or create with a placeholder ID that will be updated
      // For now, try to insert and let the trigger handle it, or use RPC
      
      // Try to create user profile - will need ID from auth.users
      // Since we can't easily get it, we'll use a workaround:
      // Update by email after ensuring user exists via trigger
      
      return NextResponse.json(
        { 
          error: 'User profile not found. Please ensure user exists in auth.users. Try signing up first or use SQL fix.',
          hint: 'Run the SQL fix script in SET_ADMIN_VIA_API.md instead'
        },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Error setting admin role:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

