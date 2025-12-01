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

    // Get user ID from auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      return NextResponse.json(
        { error: `Failed to find user: ${authError.message}` },
        { status: 500 }
      );
    }

    const user = authUsers.users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: `User with email ${email} not found in auth.users` },
        { status: 404 }
      );
    }

    // Check if user exists in public.users
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    // Insert or update user with admin role
    const { data, error } = existingUser
      ? await supabaseAdmin
          .from('users')
          .update({ role: 'admin' })
          .eq('id', user.id)
          .select()
          .single()
      : await supabaseAdmin
          .from('users')
          .insert({
            id: user.id,
            email: user.email || email,
            full_name: user.user_metadata?.full_name || 'Admin User',
            role: 'admin',
          })
          .select()
          .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to set admin role: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} is now an admin`,
      data: {
        email: data.email,
        role: data.role,
        id: data.id,
      },
    });
  } catch (error: any) {
    console.error('Error setting admin role:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

