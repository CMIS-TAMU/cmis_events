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
  qrCodeToken?: string;
  appUrl?: string;
}

export function registrationConfirmationEmail({
  userName,
  event,
  registrationId,
  isWaitlisted = false,
  waitlistPosition,
  qrCodeToken,
  appUrl = 'http://localhost:3000',
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
    
    ${qrCodeToken ? `
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">Check-In QR Code</h3>
      <p style="margin-bottom: 15px;">Show this QR code at the event for quick check-in:</p>
      <div style="display: inline-block; padding: 15px; background: white; border: 2px solid #e0e0e0; border-radius: 5px;">
        <img src="${appUrl}/api/qr/generate?data=${encodeURIComponent(qrCodeToken)}" alt="QR Code" style="max-width: 200px; height: auto;" />
      </div>
      <p style="margin-top: 15px; font-size: 12px; color: #666;">You can also view and download your QR code from your <a href="${appUrl}/registrations" style="color: #667eea;">registrations page</a>.</p>
    </div>
    ` : ''}
    
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

interface MentorNotificationEmailProps {
  mentorName: string;
  studentName: string;
  studentEmail: string;
  studentMajor?: string;
  studentSkills?: string[];
  matchScore: number;
  batchId: string;
  mentorPosition: number; // 1, 2, or 3
  studentNotes?: string;
  appUrl?: string;
}

export function mentorNotificationEmail({
  mentorName,
  studentName,
  studentEmail,
  studentMajor,
  studentSkills = [],
  matchScore,
  batchId,
  mentorPosition,
  studentNotes,
  appUrl = 'http://localhost:3000',
}: MentorNotificationEmailProps): string {
  const positionText = mentorPosition === 1 ? '1st' : mentorPosition === 2 ? '2nd' : '3rd';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Mentorship Request</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">CMIS Mentorship Program</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <h2 style="color: #333; margin-top: 0;">New Mentorship Request</h2>
    
    <p>Hello ${mentorName},</p>
    
    <p>A student has been matched with you and is requesting mentorship guidance!</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">Student Profile</h3>
      <p><strong>Name:</strong> ${studentName}</p>
      <p><strong>Email:</strong> ${studentEmail}</p>
      ${studentMajor ? `<p><strong>Major:</strong> ${studentMajor}</p>` : ''}
      ${studentSkills.length > 0 ? `<p><strong>Skills:</strong> ${studentSkills.join(', ')}</p>` : ''}
      <p><strong>Match Score:</strong> ${matchScore}/100</p>
      <p><strong>Your Position:</strong> ${positionText} Choice</p>
    </div>
    
    ${studentNotes ? `
    <div style="background: #fff9e6; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0;"><strong>Student Notes:</strong></p>
      <p style="margin: 10px 0 0 0;">${studentNotes}</p>
    </div>
    ` : ''}
    
    <div style="background: #e0f2fe; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
      <p style="margin: 0;"><strong>⏰ Important:</strong> You have 7 days to respond to this request. If you don't accept, another mentor may be selected.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/mentorship/mentor/requests" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View & Accept Request</a>
    </div>
    
    <p style="margin-top: 30px; font-size: 14px; color: #666;">
      You can also view this request in your <a href="${appUrl}/mentorship/mentor/requests" style="color: #667eea;">Mentorship Dashboard</a>.
    </p>
    
    <p style="margin-top: 30px;">Thank you for being part of our mentorship program!</p>
    
    <p style="margin-top: 30px;">Best regards,<br>CMIS Mentorship Program Team</p>
  </div>
</body>
</html>
  `;
}
