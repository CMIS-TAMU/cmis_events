import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description?: string;
  starts_at: string;
  ends_at?: string;
  capacity?: number;
  image_url?: string;
}

interface EventNotificationProps {
  userName: string;
  event: Event;
  appUrl?: string;
  unsubscribeToken?: string;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Variation 1: Professional & Formal
export function eventNotificationVariation1({
  userName,
  event,
  unsubscribeToken,
}: EventNotificationProps): string {
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
  <div style="background: #1e40af; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">New Event Available</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
    <p>Dear ${userName},</p>
    
    <p>We're excited to announce a new event that may be of interest to you:</p>
    
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1e40af;">
      <h2 style="margin-top: 0; color: #1e40af;">${event.title}</h2>
      <p><strong>Date:</strong> ${format(startDate, 'EEEE, MMMM d, yyyy')}</p>
      <p><strong>Time:</strong> ${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</p>
      ${event.description ? `<p>${event.description}</p>` : ''}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/events/${event.id}" style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Event & Register</a>
    </div>
    
    <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
      <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #6b7280;">Unsubscribe from event notifications</a>
    </p>
  </div>
</body>
</html>
  `;
}

// Variation 2: Friendly & Casual
export function eventNotificationVariation2({
  userName,
  event,
  unsubscribeToken,
}: EventNotificationProps): string {
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
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">🎉 New Event Just Added!</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
    <p>Hi ${userName}! 👋</p>
    
    <p>We just added a new event that we think you'll love:</p>
    
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="margin-top: 0; color: #667eea;">${event.title}</h2>
      <p>📅 <strong>${format(startDate, 'EEEE, MMMM d, yyyy')}</strong></p>
      <p>🕐 <strong>${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</strong></p>
      ${event.description ? `<p>${event.description}</p>` : ''}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/events/${event.id}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Check It Out →</a>
    </div>
    
    <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
      <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #6b7280;">Not interested? Unsubscribe here</a>
    </p>
  </div>
</body>
</html>
  `;
}

// Variation 3: Minimal & Clean
export function eventNotificationVariation3({
  userName,
  event,
  unsubscribeToken,
}: EventNotificationProps): string {
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
  <div style="border-top: 3px solid #10b981; padding: 30px 0;">
    <h1 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">${event.title}</h1>
    
    <p style="color: #6b7280; margin: 0 0 30px;">${userName},</p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0 0 10px;"><strong>When:</strong> ${format(startDate, 'MMMM d, yyyy')} at ${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</p>
      ${event.description ? `<p style="margin: 10px 0 0;">${event.description}</p>` : ''}
    </div>
    
    <a href="${appUrl}/events/${event.id}" style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Register Now</a>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    <p style="font-size: 12px; color: #9ca3af;">
      <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #9ca3af;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
  `;
}

// Variation 4: Urgent & Action-Oriented
export function eventNotificationVariation4({
  userName,
  event,
  unsubscribeToken,
}: EventNotificationProps): string {
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
  <div style="background: #dc2626; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <p style="color: white; margin: 0; font-weight: bold; font-size: 14px; text-transform: uppercase;">Limited Spots Available</p>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 2px solid #dc2626; border-radius: 0 0 8px 8px;">
    <h1 style="color: #dc2626; margin-top: 0;">${event.title}</h1>
    
    <p><strong>${userName}</strong>, don't miss out on this opportunity!</p>
    
    <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${format(startDate, 'MMMM d, yyyy')}</p>
      <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</p>
      ${event.description ? `<p style="margin: 10px 0 5px;">${event.description}</p>` : ''}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/events/${event.id}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">Reserve Your Spot Now</a>
    </div>
    
    <p style="font-size: 11px; color: #6b7280; text-align: center; margin-top: 30px;">
      <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #6b7280;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
  `;
}

// Variation 5: Informative & Detailed
export function eventNotificationVariation5({
  userName,
  event,
  unsubscribeToken,
}: EventNotificationProps): string {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; line-height: 1.8; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="border-bottom: 2px solid #d1d5db; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="margin: 0; color: #111827; font-size: 28px;">Event Announcement</h1>
  </div>
  
  <p>Dear ${userName},</p>
  
  <p>We are pleased to inform you about an upcoming event that aligns with your interests and professional development goals.</p>
  
  <div style="background: #f9fafb; padding: 25px; border-radius: 6px; margin: 25px 0;">
    <h2 style="margin-top: 0; color: #111827;">${event.title}</h2>
    
    <table style="width: 100%; margin: 15px 0;">
      <tr>
        <td style="padding: 8px 0; color: #4b5563;"><strong>Date:</strong></td>
        <td style="padding: 8px 0;">${format(startDate, 'EEEE, MMMM d, yyyy')}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #4b5563;"><strong>Time:</strong></td>
        <td style="padding: 8px 0;">${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</td>
      </tr>
      ${event.capacity ? `
      <tr>
        <td style="padding: 8px 0; color: #4b5563;"><strong>Capacity:</strong></td>
        <td style="padding: 8px 0;">${event.capacity} attendees</td>
      </tr>
      ` : ''}
    </table>
    
    ${event.description ? `
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #374151;">${event.description}</p>
    </div>
    ` : ''}
  </div>
  
  <p>We encourage you to register early, as spaces may be limited. This event presents an excellent opportunity for networking and professional growth.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${appUrl}/events/${event.id}" style="background: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Learn More & Register</a>
  </div>
  
  <p style="font-size: 12px; color: #6b7280; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    Best regards,<br>
    CMIS Events Team
  </p>
  
  <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 30px;">
    <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #9ca3af;">Manage email preferences</a>
  </p>
</body>
</html>
  `;
}


