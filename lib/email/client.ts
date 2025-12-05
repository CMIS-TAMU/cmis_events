import { sendBrevoEmail } from '@/server/brevoEmail';

const fromEmailAddress = process.env.BREVO_FROM_EMAIL;
const fromName = process.env.BREVO_FROM_NAME || 'CMIS Events';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string; // Optional - if not provided, uses default from Brevo env vars
}

/**
 * Send email via Brevo SMTP
 * Uses BREVO_FROM_EMAIL and BREVO_FROM_NAME from environment variables
 */
export async function sendEmail(options: EmailOptions) {
  if (!fromEmailAddress) {
    console.warn('BREVO_FROM_EMAIL is not set. Email not sent:', options.subject);
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Extract from email and name if provided, otherwise use defaults
    let fromEmail = fromEmailAddress;
    let fromNameValue = fromName;
    
    if (options.from) {
      // Parse "Name <email@domain.com>" format if provided
      const fromMatch = options.from.match(/^(.+?)\s*<(.+?)>$/);
      if (fromMatch) {
        fromNameValue = fromMatch[1].trim();
        fromEmail = fromMatch[2].trim();
      } else {
        fromEmail = options.from;
      }
    }

    await sendBrevoEmail({
      to: options.to,
      subject: options.subject,
      html: options.html,
      fromEmail,
      fromName: fromNameValue,
    });

    return { success: true, data: { id: 'sent' } };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}
