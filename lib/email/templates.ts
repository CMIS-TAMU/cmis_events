import { format } from 'date-fns';

interface Event {
  title: string;
  description?: string;
  starts_at: string;
  ends_at?: string;
  capacity?: number;
}

interface RegistrationConfirmationEmailProps {
  userName: string;
  event: Event;
  registrationId: string;
  isWaitlisted?: boolean;
  waitlistPosition?: number;
}

export function registrationConfirmationEmail({
  userName,
  event,
  registrationId,
  isWaitlisted = false,
  waitlistPosition,
}: RegistrationConfirmationEmailProps): string {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;

  if (isWaitlisted) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Waitlist Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">CMIS Event Management</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <h2 style="color: #333; margin-top: 0;">Waitlist Confirmation</h2>
    
    <p>Hello ${userName},</p>
    
    <p>Thank you for your interest in <strong>${event.title}</strong>.</p>
    
    <p>The event is currently at capacity, but we've added you to the waitlist. Your position is <strong>#${waitlistPosition}</strong>.</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">Event Details</h3>
      <p><strong>Event:</strong> ${event.title}</p>
      <p><strong>Date:</strong> ${format(startDate, 'EEEE, MMMM d, yyyy')}</p>
      <p><strong>Time:</strong> ${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</p>
      ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
    </div>
    
    <p>If a spot becomes available, we'll notify you immediately via email.</p>
    
    <p style="margin-top: 30px;">Best regards,<br>CMIS Event Management Team</p>
  </div>
</body>
</html>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">CMIS Event Management</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <h2 style="color: #333; margin-top: 0;">Registration Confirmed!</h2>
    
    <p>Hello ${userName},</p>
    
    <p>Your registration for <strong>${event.title}</strong> has been confirmed.</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
      <h3 style="margin-top: 0; color: #10b981;">Event Details</h3>
      <p><strong>Event:</strong> ${event.title}</p>
      <p><strong>Date:</strong> ${format(startDate, 'EEEE, MMMM d, yyyy')}</p>
      <p><strong>Time:</strong> ${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</p>
      ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
      <p><strong>Registration ID:</strong> ${registrationId}</p>
    </div>
    
    <p>We look forward to seeing you at the event!</p>
    
    <p style="margin-top: 30px;">Best regards,<br>CMIS Event Management Team</p>
  </div>
</body>
</html>
  `;
}

interface CancellationEmailProps {
  userName: string;
  event: Event;
}

export function cancellationEmail({ userName, event }: CancellationEmailProps): string {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Cancelled</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">CMIS Event Management</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <h2 style="color: #333; margin-top: 0;">Registration Cancelled</h2>
    
    <p>Hello ${userName},</p>
    
    <p>Your registration for <strong>${event.title}</strong> has been cancelled.</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
      <h3 style="margin-top: 0; color: #ef4444;">Event Details</h3>
      <p><strong>Event:</strong> ${event.title}</p>
      <p><strong>Date:</strong> ${format(startDate, 'EEEE, MMMM d, yyyy')}</p>
      <p><strong>Time:</strong> ${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</p>
    </div>
    
    <p>If you change your mind, you can register again if spots are still available.</p>
    
    <p style="margin-top: 30px;">Best regards,<br>CMIS Event Management Team</p>
  </div>
</body>
</html>
  `;
}

interface AdminNotificationEmailProps {
  adminName: string;
  userName: string;
  userEmail: string;
  event: Event;
  registrationId: string;
}

export function adminRegistrationNotificationEmail({
  adminName,
  userName,
  userEmail,
  event,
  registrationId,
}: AdminNotificationEmailProps): string {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Event Registration</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">CMIS Event Management</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <h2 style="color: #333; margin-top: 0;">New Event Registration</h2>
    
    <p>Hello ${adminName},</p>
    
    <p>A new registration has been received for <strong>${event.title}</strong>.</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">Registration Details</h3>
      <p><strong>User:</strong> ${userName} (${userEmail})</p>
      <p><strong>Event:</strong> ${event.title}</p>
      <p><strong>Date:</strong> ${format(startDate, 'EEEE, MMMM d, yyyy')}</p>
      <p><strong>Time:</strong> ${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</p>
      <p><strong>Registration ID:</strong> ${registrationId}</p>
    </div>
    
    <p style="margin-top: 30px;">Best regards,<br>CMIS Event Management System</p>
  </div>
</body>
</html>
  `;
}

