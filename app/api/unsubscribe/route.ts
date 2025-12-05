import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Unsubscribe endpoint
 * GET /api/unsubscribe?token=xxx&category=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const category = searchParams.get('category') || 'all';

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Decode token to get user ID (simple base64 decode for now)
    // In production, use proper JWT or signed tokens
    let userId: string;
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      userId = decoded.split('-')[0];
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    // Get or create user preferences
    const { data: existingPrefs } = await supabase
      .from('communication_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingPrefs) {
      // Update existing preferences
      if (category === 'all') {
        await supabase
          .from('communication_preferences')
          .update({ email_enabled: false })
          .eq('user_id', userId);
      } else {
        // Add category to unsubscribe list
        const currentCategories = existingPrefs.unsubscribe_categories || [];
        if (!currentCategories.includes(category)) {
          await supabase
            .from('communication_preferences')
            .update({
              unsubscribe_categories: [...currentCategories, category],
            })
            .eq('user_id', userId);
        }
      }
    } else {
      // Create new preferences with unsubscribe
      await supabase
        .from('communication_preferences')
        .insert({
          user_id: userId,
          email_enabled: category === 'all' ? false : true,
          unsubscribe_categories: category === 'all' ? [] : [category],
        });
    }

    // Return success page HTML
    return new NextResponse(
      `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f3f4f6;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 500px;
    }
    h1 { color: #1f2937; margin: 0 0 20px; }
    p { color: #6b7280; line-height: 1.6; }
    .success { color: #10b981; font-size: 48px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="success">✓</div>
    <h1>Successfully Unsubscribed</h1>
    <p>You have been unsubscribed from ${category === 'all' ? 'all email notifications' : category + ' emails'}.</p>
    <p style="font-size: 14px; margin-top: 20px;">
      You can manage your preferences at any time in your account settings.
    </p>
  </div>
</body>
</html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  } catch (error: any) {
    console.error('Error processing unsubscribe:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}

