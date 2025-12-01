import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/client';
import {
  registrationConfirmationEmail,
  cancellationEmail,
  adminRegistrationNotificationEmail,
} from '@/lib/email/templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    let html: string;
    let subject: string;
    let to: string | string[];

    switch (type) {
      case 'registration_confirmation': {
        const { userName, event, registrationId, isWaitlisted, waitlistPosition, qrCodeToken } = data;
        html = registrationConfirmationEmail({
          userName,
          event,
          registrationId,
          isWaitlisted,
          waitlistPosition,
          qrCodeToken,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        });
        subject = isWaitlisted
          ? `Waitlist Confirmation: ${event.title}`
          : `Registration Confirmed: ${event.title}`;
        to = data.userEmail;
        break;
      }

      case 'cancellation': {
        const { userName, event } = data;
        html = cancellationEmail({ userName, event });
        subject = `Registration Cancelled: ${event.title}`;
        to = data.userEmail;
        break;
      }

      case 'admin_notification': {
        const { adminName, userName, userEmail, event, registrationId } = data;
        html = adminRegistrationNotificationEmail({
          adminName,
          userName,
          userEmail,
          event,
          registrationId,
        });
        subject = `New Registration: ${event.title}`;
        to = data.adminEmail;
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    const result = await sendEmail({
      to,
      subject,
      html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    console.error('Error in email API route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

