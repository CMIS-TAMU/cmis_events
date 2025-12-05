import { NextRequest, NextResponse } from 'next/server';
import { sendBrevoEmail } from '@/server/brevoEmail';

export const dynamic = 'force-dynamic';

/**
 * Test Brevo email endpoint
 * POST /api/test-brevo
 * Body: { to: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Recipient email (to) is required' },
        { status: 400 }
      );
    }

    await sendBrevoEmail({
      to,
      subject: 'Brevo test from CMIS',
      html: '<p>If you see this, Brevo SMTP is working.</p>',
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully via Brevo',
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint - Show usage
 */
export async function GET() {
  return NextResponse.json({
    message: 'Brevo Test Email API',
    usage: {
      method: 'POST',
      body: {
        to: 'your-email@example.com',
      },
    },
  });
}


