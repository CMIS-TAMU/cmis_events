import { NextRequest, NextResponse } from 'next/server';
import { brevoTransporter } from '@/server/brevoEmail';

export const dynamic = 'force-dynamic';

/**
 * Test Brevo SMTP connection
 * GET /api/test-brevo-connection
 */
export async function GET() {
  try {
    const host = process.env.BREVO_SMTP_HOST;
    const port = process.env.BREVO_SMTP_PORT;
    const user = process.env.BREVO_SMTP_USER;
    const pass = process.env.BREVO_SMTP_KEY;
    const fromEmail = process.env.BREVO_FROM_EMAIL;
    const fromName = process.env.BREVO_FROM_NAME;

    // Check which variables are set
    const envStatus = {
      BREVO_SMTP_HOST: host ? '✅ SET' : '❌ MISSING',
      BREVO_SMTP_PORT: port ? `✅ SET (${port})` : '❌ MISSING',
      BREVO_SMTP_USER: user ? `✅ SET (${user.substring(0, 10)}...)` : '❌ MISSING',
      BREVO_SMTP_KEY: pass ? `✅ SET (${pass.substring(0, 10)}...)` : '❌ MISSING',
      BREVO_FROM_EMAIL: fromEmail ? `✅ SET (${fromEmail})` : '❌ MISSING',
      BREVO_FROM_NAME: fromName ? `✅ SET (${fromName})` : '❌ MISSING (using default)',
    };

    // Try to verify connection
    let connectionStatus = 'Not tested';
    let connectionError = null;

    if (host && user && pass) {
      try {
        await brevoTransporter.verify();
        connectionStatus = '✅ Connection successful!';
      } catch (error: any) {
        connectionStatus = '❌ Connection failed';
        connectionError = {
          code: error.code,
          command: error.command,
          response: error.response,
          responseCode: error.responseCode,
          message: error.message,
        };
      }
    } else {
      connectionStatus = '⚠️ Cannot test - missing credentials';
    }

    return NextResponse.json({
      environment: envStatus,
      connection: {
        status: connectionStatus,
        error: connectionError,
      },
      recommendations: connectionError?.code === 'EAUTH' ? [
        '1. Verify BREVO_SMTP_USER is your SMTP login email (not account email)',
        '2. Verify BREVO_SMTP_KEY is your SMTP key (not API key)',
        '3. Ensure BREVO_FROM_EMAIL matches a verified email in Brevo',
        '4. Try regenerating your SMTP key in Brevo dashboard',
        '5. Make sure FROM email matches or is related to SMTP user email',
      ] : [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


