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

interface RoleSpecificEventNotificationProps {
  userName: string;
  userRole: 'student' | 'sponsor' | 'mentor' | 'admin' | 'user';
  event: Event;
  appUrl?: string;
  unsubscribeToken?: string;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Student-specific event notification
 * Focus: Learning opportunities, networking with peers, career growth
 */
export function studentEventNotification({
  userName,
  event,
  appUrl,
  unsubscribeToken,
}: RoleSpecificEventNotificationProps): string {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;
  const firstName = userName.split(' ')[0];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background: linear-gradient(135deg, #500000 0%, #7a0000 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎓 New Event Just Added!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Perfect for your growth journey</p>
  </div>
  
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px;">
      Hi ${firstName}! 👋
    </p>
    
    <p style="color: #4b5563; font-size: 16px; margin: 0 0 25px;">
      We've got an exciting new event that's perfect for students like you! This is a great opportunity to learn, network with peers, and grow your skills.
    </p>
    
    <div style="background: linear-gradient(135deg, #fef3f2 0%, #fff7ed 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #500000;">
      <h2 style="margin: 0 0 15px; color: #500000; font-size: 24px;">${event.title}</h2>
      
      <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 8px 0; color: #374151;">
          <span style="font-weight: bold; color: #500000;">📅 When:</span><br>
          ${format(startDate, 'EEEE, MMMM d, yyyy')}<br>
          <span style="color: #6b7280; font-size: 14px;">${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</span>
        </p>
        ${event.capacity ? `
        <p style="margin: 8px 0; color: #374151;">
          <span style="font-weight: bold; color: #500000;">👥 Spots Available:</span> ${event.capacity}
        </p>
        ` : ''}
      </div>
      
      ${event.description ? `
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #4b5563; line-height: 1.7;">${event.description}</p>
      </div>
      ` : ''}
    </div>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <p style="margin: 0 0 10px; font-weight: bold; color: #1f2937;">Why you should attend:</p>
      <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
        <li>Learn from industry experts and peers</li>
        <li>Build your professional network</li>
        <li>Discover new opportunities and career paths</li>
        <li>Add valuable experiences to your portfolio</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/events/${event.id}" style="background: #500000; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(80,0,0,0.2);">
        View Event & Register →
      </a>
    </div>
    
    <p style="font-size: 13px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      Questions? Reply to this email or visit <a href="${appUrl}" style="color: #500000;">our website</a><br>
      <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #9ca3af; text-decoration: none;">Manage email preferences</a>
    </p>
  </div>
</body>
</html>
  `;
}

/**
 * Sponsor-specific event notification
 * Focus: Recruiting opportunities, student engagement, brand visibility
 */
export function sponsorEventNotification({
  userName,
  event,
  appUrl,
  unsubscribeToken,
}: RoleSpecificEventNotificationProps): string {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;
  const firstName = userName.split(' ')[0];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">💼 New Event Opportunity</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Connect with top talent</p>
  </div>
  
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px;">
      Hello ${firstName},
    </p>
    
    <p style="color: #4b5563; font-size: 16px; margin: 0 0 25px;">
      A new CMIS event has been scheduled that presents an excellent opportunity for your organization to connect with talented students and showcase your brand.
    </p>
    
    <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #1e40af;">
      <h2 style="margin: 0 0 15px; color: #1e40af; font-size: 24px;">${event.title}</h2>
      
      <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 8px 0; color: #374151;">
          <span style="font-weight: bold; color: #1e40af;">📅 Event Date:</span><br>
          ${format(startDate, 'EEEE, MMMM d, yyyy')}<br>
          <span style="color: #6b7280; font-size: 14px;">${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</span>
        </p>
        ${event.capacity ? `
        <p style="margin: 8px 0; color: #374151;">
          <span style="font-weight: bold; color: #1e40af;">👥 Expected Attendance:</span> Up to ${event.capacity} students
        </p>
        ` : ''}
      </div>
      
      ${event.description ? `
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #4b5563; line-height: 1.7;">${event.description}</p>
      </div>
      ` : ''}
    </div>
    
    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bae6fd;">
      <p style="margin: 0 0 10px; font-weight: bold; color: #1e40af;">Why this matters for sponsors:</p>
      <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
        <li>Connect with motivated students actively seeking opportunities</li>
        <li>Showcase your company culture and values</li>
        <li>Build relationships with future talent pipeline</li>
        <li>Increase brand visibility within the CMIS community</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/events/${event.id}" style="background: #1e40af; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(30,64,175,0.2);">
        View Event Details →
      </a>
    </div>
    
    <p style="font-size: 13px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      Interested in sponsoring? <a href="${appUrl}/sponsor/dashboard" style="color: #1e40af;">Visit your sponsor dashboard</a><br>
      <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #9ca3af; text-decoration: none;">Manage email preferences</a>
    </p>
  </div>
</body>
</html>
  `;
}

/**
 * Mentor-specific event notification
 * Focus: Mentoring opportunities, student engagement, knowledge sharing
 */
export function mentorEventNotification({
  userName,
  event,
  appUrl,
  unsubscribeToken,
}: RoleSpecificEventNotificationProps): string {
  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;
  const firstName = userName.split(' ')[0];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🤝 New Mentoring Opportunity</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Make a difference in students' lives</p>
  </div>
  
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px;">
      Hi ${firstName}! 👋
    </p>
    
    <p style="color: #4b5563; font-size: 16px; margin: 0 0 25px;">
      A new CMIS event has been created that could be a great opportunity for you to connect with students and share your expertise. Your guidance and mentorship make a real difference!
    </p>
    
    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #059669;">
      <h2 style="margin: 0 0 15px; color: #059669; font-size: 24px;">${event.title}</h2>
      
      <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 8px 0; color: #374151;">
          <span style="font-weight: bold; color: #059669;">📅 When:</span><br>
          ${format(startDate, 'EEEE, MMMM d, yyyy')}<br>
          <span style="color: #6b7280; font-size: 14px;">${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}</span>
        </p>
        ${event.capacity ? `
        <p style="margin: 8px 0; color: #374151;">
          <span style="font-weight: bold; color: #059669;">👥 Expected Participants:</span> Up to ${event.capacity} students
        </p>
        ` : ''}
      </div>
      
      ${event.description ? `
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #4b5563; line-height: 1.7;">${event.description}</p>
      </div>
      ` : ''}
    </div>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #bbf7d0;">
      <p style="margin: 0 0 10px; font-weight: bold; color: #059669;">Your impact as a mentor:</p>
      <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
        <li>Share your professional experience and insights</li>
        <li>Help students navigate their career paths</li>
        <li>Build meaningful connections with the next generation</li>
        <li>Contribute to the CMIS community's growth</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/events/${event.id}" style="background: #059669; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(5,150,105,0.2);">
        View Event & Get Involved →
      </a>
    </div>
    
    <p style="font-size: 13px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      Thank you for being part of our mentoring community! 🙏<br>
      <a href="${appUrl}/mentorship/dashboard" style="color: #059669;">Visit your mentorship dashboard</a><br>
      <a href="${appUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #9ca3af; text-decoration: none;">Manage email preferences</a>
    </p>
  </div>
</body>
</html>
  `;
}

/**
 * Main function that selects the appropriate template based on role
 */
export function getRoleSpecificEventNotification(props: RoleSpecificEventNotificationProps): string {
  const { userRole } = props;
  
  switch (userRole?.toLowerCase()) {
    case 'student':
      return studentEventNotification(props);
    case 'sponsor':
      return sponsorEventNotification(props);
    case 'mentor':
      return mentorEventNotification(props);
    default:
      // Fallback to student template for unknown roles
      return studentEventNotification(props);
  }
}


