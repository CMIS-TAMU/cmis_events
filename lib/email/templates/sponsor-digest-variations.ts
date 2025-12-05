import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description?: string;
  starts_at: string;
  capacity?: number;
  registered_count?: number;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  major?: string;
  graduation_year?: number;
  resume_url?: string;
}

interface SponsorDigestProps {
  sponsorName: string;
  events: Event[];
  newStudents?: Student[];
  topResumes?: Student[];
  appUrl?: string;
  unsubscribeToken?: string;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Variation 1: Comprehensive Digest
export function sponsorDigestVariation1({
  sponsorName,
  events,
  newStudents,
  topResumes,
  unsubscribeToken,
}: SponsorDigestProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1e40af; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">📊 Weekly Sponsor Digest</h1>
    <p style="color: #bfdbfe; margin: 10px 0 0;">${format(new Date(), 'MMMM d, yyyy')}</p>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
    <p>Dear ${sponsorName},</p>
    
    <p>Here's your weekly update on upcoming events and new student activity:</p>
    
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1e40af;">
      <h2 style="margin-top: 0; color: #1e40af;">📅 Upcoming Events (Next 30 Days)</h2>
      ${events.length === 0 ? '<p>No upcoming events in the next 30 days.</p>' : ''}
      ${events.map(event => {
        const startDate = new Date(event.starts_at);
        return `
        <div style="padding: 15px; background: #f3f4f6; border-radius: 4px; margin: 10px 0;">
          <h3 style="margin: 0 0 5px; color: #111827;">${event.title}</h3>
          <p style="margin: 5px 0; color: #6b7280;">${format(startDate, 'MMMM d, yyyy')} at ${format(startDate, 'h:mm a')}</p>
          <p style="margin: 5px 0; color: #059669;"><strong>${event.registered_count || 0} students registered</strong></p>
          <a href="${appUrl}/events/${event.id}" style="color: #1e40af; text-decoration: underline; font-size: 14px;">View Event →</a>
        </div>
        `;
      }).join('')}
    </div>
    
    ${newStudents && newStudents.length > 0 ? `
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
      <h2 style="margin-top: 0; color: #10b981;">🆕 New Students This Week</h2>
      ${newStudents.slice(0, 5).map(student => `
        <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0; font-weight: bold;">${student.full_name}</p>
          <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
            ${student.major || ''}${student.graduation_year ? ` • Class of ${student.graduation_year}` : ''}
          </p>
        </div>
      `).join('')}
      <div style="margin-top: 15px;">
        <a href="${appUrl}/sponsor/resumes" style="color: #10b981; text-decoration: underline;">Browse All Resumes →</a>
      </div>
    </div>
    ` : ''}
    
    ${topResumes && topResumes.length > 0 ? `
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <h2 style="margin-top: 0; color: #f59e0b;">⭐ Featured Resumes</h2>
      ${topResumes.slice(0, 3).map(student => `
        <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0; font-weight: bold;">${student.full_name}</p>
          <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${student.major || ''}</p>
          ${student.resume_url ? `<a href="${appUrl}/resumes/${student.id}" style="color: #f59e0b; text-decoration: underline; font-size: 14px;">View Resume →</a>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/sponsor/dashboard" style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Sponsor Portal</a>
    </div>
    
    <p style="font-size: 12px; color: #6b7280; margin-top: 30px; text-align: center;">
      <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #6b7280;">Unsubscribe from weekly digest</a>
    </p>
  </div>
</body>
</html>
  `;
}

// Variation 2: Event-Focused Digest
export function sponsorDigestVariation2({
  sponsorName,
  events,
  unsubscribeToken,
}: SponsorDigestProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">🎯 Your Weekly Event Update</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
    <p>Hi ${sponsorName}! 👋</p>
    
    <p>Here are the events happening in the next 30 days where you can connect with students:</p>
    
    ${events.length === 0 ? '<p>No upcoming events scheduled.</p>' : ''}
    ${events.map(event => {
      const startDate = new Date(event.starts_at);
      return `
      <div style="background: white; padding: 20px; border-radius: 6px; margin: 15px 0; border: 2px solid #667eea;">
        <h2 style="margin: 0 0 10px; color: #667eea;">${event.title}</h2>
        <p style="margin: 5px 0; color: #6b7280;">📅 ${format(startDate, 'MMMM d, yyyy')} • 🕐 ${format(startDate, 'h:mm a')}</p>
        <p style="margin: 10px 0; color: #059669; font-weight: bold;">${event.registered_count || 0} students registered</p>
        <a href="${appUrl}/events/${event.id}" style="color: #667eea; text-decoration: underline; font-weight: bold;">RSVP to Event →</a>
      </div>
      `;
    }).join('')}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/sponsor/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View All Events</a>
    </div>
    
    <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 30px;">
      <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #6b7280;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
  `;
}

// Variation 3: Student-Focused Digest
export function sponsorDigestVariation3({
  sponsorName,
  events,
  newStudents,
  topResumes,
  unsubscribeToken,
}: SponsorDigestProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #10b981; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">🌟 New Talent This Week</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
    <p>Hello ${sponsorName},</p>
    
    <p>Here's what's new on the platform this week:</p>
    
    ${newStudents && newStudents.length > 0 ? `
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
      <h2 style="margin-top: 0; color: #10b981;">🆕 ${newStudents.length} New Students Joined</h2>
      ${newStudents.slice(0, 5).map(student => `
        <div style="padding: 12px; background: #f0fdf4; border-radius: 4px; margin: 8px 0;">
          <p style="margin: 0; font-weight: bold;">${student.full_name}</p>
          <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">
            ${student.major || 'Major not specified'}${student.graduation_year ? ` • ${student.graduation_year}` : ''}
          </p>
        </div>
      `).join('')}
      <div style="margin-top: 15px;">
        <a href="${appUrl}/sponsor/resumes" style="color: #10b981; font-weight: bold; text-decoration: underline;">Browse All New Students →</a>
      </div>
    </div>
    ` : ''}
    
    ${topResumes && topResumes.length > 0 ? `
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <h2 style="margin-top: 0; color: #f59e0b;">⭐ Top Resumes This Week</h2>
      ${topResumes.slice(0, 5).map(student => `
        <div style="padding: 12px; background: #fffbeb; border-radius: 4px; margin: 8px 0;">
          <p style="margin: 0; font-weight: bold;">${student.full_name}</p>
          <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${student.major || ''}</p>
          ${student.resume_url ? `<a href="${appUrl}/resumes/${student.id}" style="color: #f59e0b; text-decoration: underline; font-size: 14px;">View Resume →</a>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${events.length > 0 ? `
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #6366f1;">
      <h2 style="margin-top: 0; color: #6366f1;">📅 Upcoming Events</h2>
      ${events.slice(0, 3).map(event => {
        const startDate = new Date(event.starts_at);
        return `
        <p style="margin: 8px 0;">
          <strong>${event.title}</strong><br>
          <span style="color: #6b7280; font-size: 14px;">${format(startDate, 'MMMM d')} • ${event.registered_count || 0} students</span>
        </p>
        `;
      }).join('')}
      <a href="${appUrl}/events" style="color: #6366f1; text-decoration: underline; font-size: 14px;">View All Events →</a>
    </div>
    ` : ''}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/sponsor/resumes" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Browse Student Resumes</a>
    </div>
    
    <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 30px;">
      <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #6b7280;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
  `;
}

// Variation 4: Minimal Digest
export function sponsorDigestVariation4({
  sponsorName,
  events,
  unsubscribeToken,
}: SponsorDigestProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="border-bottom: 2px solid #d1d5db; padding-bottom: 15px; margin-bottom: 25px;">
    <h1 style="margin: 0; color: #111827;">Weekly Sponsor Update</h1>
    <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">${format(new Date(), 'MMMM d, yyyy')}</p>
  </div>
  
  <p>${sponsorName},</p>
  
  ${events.length === 0 ? '<p>No upcoming events in the next 30 days.</p>' : ''}
  ${events.map(event => {
    const startDate = new Date(event.starts_at);
    return `
    <div style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
      <h3 style="margin: 0 0 5px; color: #111827;">${event.title}</h3>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        ${format(startDate, 'MMMM d, yyyy')} • ${event.registered_count || 0} registered
      </p>
      <a href="${appUrl}/events/${event.id}" style="color: #6366f1; text-decoration: underline; font-size: 14px; margin-top: 5px; display: inline-block;">View →</a>
    </div>
    `;
  }).join('')}
  
  <div style="margin: 25px 0;">
    <a href="${appUrl}/sponsor/dashboard" style="color: #6366f1; text-decoration: underline;">Go to dashboard →</a>
  </div>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  <p style="font-size: 11px; color: #9ca3af; text-align: center;">
    <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #9ca3af;">Unsubscribe</a>
  </p>
</body>
</html>
  `;
}

// Variation 5: Statistics-Focused Digest
export function sponsorDigestVariation5({
  sponsorName,
  events,
  newStudents,
  unsubscribeToken,
}: SponsorDigestProps): string {
  const totalRegistrations = events.reduce((sum, e) => sum + (e.registered_count || 0), 0);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #111827; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0;">📈 Weekly Statistics</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
    <p>${sponsorName},</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
      <div style="background: white; padding: 20px; border-radius: 6px; text-align: center; border: 2px solid #6366f1;">
        <div style="font-size: 32px; font-weight: bold; color: #6366f1;">${events.length}</div>
        <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Upcoming Events</p>
      </div>
      <div style="background: white; padding: 20px; border-radius: 6px; text-align: center; border: 2px solid #10b981;">
        <div style="font-size: 32px; font-weight: bold; color: #10b981;">${totalRegistrations}</div>
        <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Total Registrations</p>
      </div>
    </div>
    
    ${newStudents && newStudents.length > 0 ? `
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; border: 2px solid #f59e0b;">
      <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${newStudents.length}</div>
      <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">New Students This Week</p>
    </div>
    ` : ''}
    
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #111827;">
      <h2 style="margin-top: 0; color: #111827;">Event Highlights</h2>
      ${events.length === 0 ? '<p>No upcoming events.</p>' : ''}
      ${events.slice(0, 3).map(event => {
        const startDate = new Date(event.starts_at);
        return `
        <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0; font-weight: bold;">${event.title}</p>
          <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
            ${format(startDate, 'MMM d')} • ${event.registered_count || 0} students
          </p>
        </div>
        `;
      }).join('')}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/sponsor/dashboard" style="background: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Full Dashboard</a>
    </div>
    
    <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 30px;">
      <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #6b7280;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
  `;
}


