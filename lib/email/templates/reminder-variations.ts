import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description?: string;
  starts_at: string;
  ends_at?: string;
}

interface ReminderProps {
  userName: string;
  event: Event;
  appUrl?: string;
  unsubscribeToken?: string;
  userRole?: string;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Variation 1: Friendly Reminder
export function reminderVariation1({
  userName,
  event,
  unsubscribeToken,
  userRole,
}: ReminderProps): string {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;

  const roleTips: Record<string, string> = {
    student: 'Bring your resume and be ready to network!',
    sponsor: 'Looking forward to meeting talented students.',
    mentor: 'Great opportunity to connect with mentees.',
    faculty: 'Thank you for supporting our students.',
  };

  const tip = roleTips[userRole || 'student'] || 'We look forward to seeing you!';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">⏰ Reminder: Event Tomorrow!</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
    <p>Hi ${userName}! 👋</p>
    
    <p>Just a friendly reminder that you're registered for:</p>
    
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
      <h2 style="margin-top: 0; color: #059669;">${event.title}</h2>
      <p><strong>📅 Date:</strong> ${format(startDate, 'EEEE, MMMM d, yyyy')}</p>
      <p><strong>🕐 Time:</strong> ${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</p>
    </div>
    
    <div style="background: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; color: #065f46;"><strong>💡 Tip:</strong> ${tip}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/events/${event.id}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Event Details</a>
    </div>
    
    <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
      <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #6b7280;">Unsubscribe from reminders</a>
    </p>
  </div>
</body>
</html>
  `;
}

// Variation 2: Professional Reminder
export function reminderVariation2({
  userName,
  event,
  unsubscribeToken,
}: ReminderProps): string {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1e40af; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px;">Event Reminder</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
    <p>Dear ${userName},</p>
    
    <p>This is a reminder that you are registered for the following event, scheduled for tomorrow:</p>
    
    <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px; background: #f3f4f6; border: 1px solid #e5e7eb;"><strong>Event:</strong></td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">${event.title}</td>
      </tr>
      <tr>
        <td style="padding: 10px; background: #f3f4f6; border: 1px solid #e5e7eb;"><strong>Date:</strong></td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">${format(startDate, 'EEEE, MMMM d, yyyy')}</td>
      </tr>
      <tr>
        <td style="padding: 10px; background: #f3f4f6; border: 1px solid #e5e7eb;"><strong>Time:</strong></td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</td>
      </tr>
    </table>
    
    <p>Please ensure you arrive on time. If you need to cancel your registration, please do so as soon as possible.</p>
    
    <div style="text-align: center; margin: 25px 0;">
      <a href="${appUrl}/events/${event.id}" style="background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View Event</a>
    </div>
    
    <p style="font-size: 11px; color: #6b7280; margin-top: 30px; text-align: center;">
      <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #6b7280;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
  `;
}

// Variation 3: Last-Minute Details
export function reminderVariation3({
  userName,
  event,
  unsubscribeToken,
}: ReminderProps): string {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f59e0b; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">📌 Last-Minute Reminder</h1>
  </div>
  
  <div style="background: #fffbeb; padding: 30px; border: 2px solid #f59e0b; border-radius: 0 0 8px 8px;">
    <p><strong>${userName}</strong>,</p>
    
    <p>Your event is <strong>tomorrow</strong>! Here are the details:</p>
    
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #92400e;">${event.title}</h2>
      <p><strong>When:</strong> ${format(startDate, 'EEEE, MMMM d')} at ${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</p>
    </div>
    
    <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0;"><strong>What to bring:</strong></p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Your registration confirmation (QR code)</li>
        <li>Valid ID</li>
        <li>Notebook and pen</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/events/${event.id}" style="background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View Full Details</a>
    </div>
    
    <p style="font-size: 12px; color: #92400e; text-align: center; margin-top: 30px;">
      <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #92400e;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
  `;
}

// Variation 4: Minimal Reminder
export function reminderVariation4({
  userName,
  event,
  unsubscribeToken,
}: ReminderProps): string {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="border-left: 4px solid #6366f1; padding-left: 20px; margin: 30px 0;">
    <h1 style="margin: 0 0 10px; color: #1f2937;">${event.title}</h1>
    <p style="margin: 0; color: #6b7280;">Tomorrow at ${format(startDate, 'h:mm a')}</p>
  </div>
  
  <p style="color: #374151;">Hi ${userName},</p>
  
  <p style="color: #374151;">This is a reminder that you're registered for the event above. We look forward to seeing you there.</p>
  
  <div style="margin: 25px 0;">
    <a href="${appUrl}/events/${event.id}" style="color: #6366f1; text-decoration: underline;">View details →</a>
  </div>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  <p style="font-size: 11px; color: #9ca3af;">
    <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #9ca3af;">Unsubscribe</a>
  </p>
</body>
</html>
  `;
}

// Variation 5: Action-Oriented Reminder
export function reminderVariation5({
  userName,
  event,
  unsubscribeToken,
}: ReminderProps): string {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #dc2626; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">⏰ Don't Forget!</h1>
    <p style="color: white; margin: 10px 0 0; font-size: 16px;">Your event is tomorrow</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #dc2626; border-radius: 0 0 8px 8px;">
    <p><strong>${userName}</strong>,</p>
    
    <p>You're all set for <strong>${event.title}</strong> tomorrow!</p>
    
    <div style="background: #fef2f2; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 10px;"><strong>Event Details:</strong></p>
      <p style="margin: 5px 0;">📅 ${format(startDate, 'EEEE, MMMM d, yyyy')}</p>
      <p style="margin: 5px 0;">🕐 ${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</p>
    </div>
    
    <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-weight: bold;">✅ You're confirmed!</p>
      <p style="margin: 5px 0 0; font-size: 14px;">Make sure to arrive 10 minutes early for check-in.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/events/${event.id}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View Event & Get Directions</a>
    </div>
    
    <p style="font-size: 11px; color: #6b7280; text-align: center; margin-top: 30px;">
      <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #6b7280;">Unsubscribe from reminders</a>
    </p>
  </div>
</body>
</html>
  `;
}


