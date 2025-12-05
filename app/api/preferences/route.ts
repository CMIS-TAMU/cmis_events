import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/preferences - Get user's email preferences
 * POST /api/preferences - Update user's email preferences
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: preferences, error } = await supabase
      .from('communication_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    // Return default preferences if none exist
    return NextResponse.json({
      email_enabled: preferences?.email_enabled ?? true,
      sms_enabled: preferences?.sms_enabled ?? false,
      unsubscribe_categories: preferences?.unsubscribe_categories || [],
    });
  } catch (error: any) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email_enabled, sms_enabled, unsubscribe_categories } = body;

    // Check if preferences exist
    const { data: existing } = await supabase
      .from('communication_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('communication_preferences')
        .update({
          email_enabled: email_enabled !== undefined ? email_enabled : true,
          sms_enabled: sms_enabled !== undefined ? sms_enabled : false,
          unsubscribe_categories: unsubscribe_categories || [],
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      // Create new
      const { data, error } = await supabase
        .from('communication_preferences')
        .insert({
          user_id: user.id,
          email_enabled: email_enabled !== undefined ? email_enabled : true,
          sms_enabled: sms_enabled !== undefined ? sms_enabled : false,
          unsubscribe_categories: unsubscribe_categories || [],
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

