interface NewsletterSubscriptionConfirmationProps {
  recipientName: string;
  recipientRole: string;
  appUrl: string;
  unsubscribeUrl: string;
}

export function newsletterSubscriptionConfirmationEmail({
  recipientName,
  recipientRole,
  appUrl,
  unsubscribeUrl,
}: NewsletterSubscriptionConfirmationProps): string {
  const firstName = recipientName?.split(' ')[0] || recipientName || 'there';
  
  // Role-specific messaging
  const roleMessages: Record<string, { headline: string; benefits: string[]; cta: string; ctaLink: string }> = {
    student: {
      headline: "You're Now Part of the CMIS Community!",
      benefits: [
        'Exclusive event invitations and early registration access',
        'Career opportunities and internship announcements',
        'Mentorship program updates and matching notifications',
        'Technical mission challenges and competition alerts',
      ],
      cta: 'Explore Events',
      ctaLink: `${appUrl}/events`,
    },
    mentor: {
      headline: 'Thank You for Joining Our Mentor Network!',
      benefits: [
        'Notifications when students need your expertise',
        'Upcoming mentorship events and networking sessions',
        'Mini mentorship session requests',
        'Impact reports on student success stories',
      ],
      cta: 'View Mentorship Dashboard',
      ctaLink: `${appUrl}/mentorship`,
    },
    sponsor: {
      headline: 'Welcome to the CMIS Partnership Network!',
      benefits: [
        'Talent pipeline updates and top student highlights',
        'Sponsorship opportunities for upcoming events',
        'Exclusive recruiting event invitations',
        'ROI reports on your partnership engagement',
      ],
      cta: 'Explore Partnership Options',
      ctaLink: `${appUrl}/be-a-sponsor`,
    },
    general: {
      headline: "You're Now Subscribed to CMIS Updates!",
      benefits: [
        'Latest news about CMIS events and programs',
        'Networking opportunities with industry professionals',
        'Career development resources and tips',
        'Community highlights and success stories',
      ],
      cta: 'Visit CMIS',
      ctaLink: appUrl,
    },
  };

  const message = roleMessages[recipientRole] || roleMessages.general;
  const accentColor = recipientRole === 'student' ? '#00C2A2' 
    : recipientRole === 'mentor' ? '#6B48FF'
    : recipientRole === 'sponsor' ? '#3B82F6'
    : '#500000';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CMIS Newsletter</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <!-- Header with Texas A&M maroon -->
    <tr>
      <td style="background: linear-gradient(135deg, #500000, #700000); padding: 40px 32px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 12px;">🎉</div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: white; letter-spacing: -0.5px;">
          ${message.headline}
        </h1>
        <p style="margin: 12px 0 0; font-size: 15px; color: rgba(255,255,255,0.85);">
          Center for Management & Information Systems • Texas A&M
        </p>
      </td>
    </tr>
    
    <!-- Main Content -->
    <tr>
      <td style="padding: 40px 32px;">
        <p style="margin: 0 0 20px; font-size: 16px; color: #333; line-height: 1.6;">
          Hey ${firstName}! 👋
        </p>
        
        <p style="margin: 0 0 24px; font-size: 16px; color: #555; line-height: 1.7;">
          Thank you for subscribing to the CMIS newsletter. We're excited to keep you in the loop with everything happening in our community.
        </p>

        <!-- Benefits Box -->
        <div style="background: linear-gradient(to right, ${accentColor}08, ${accentColor}03); border-left: 4px solid ${accentColor}; border-radius: 0 12px 12px 0; padding: 24px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #333;">
            What you'll receive:
          </h3>
          <ul style="margin: 0; padding: 0 0 0 20px; color: #555;">
            ${message.benefits.map(benefit => `
              <li style="margin: 8px 0; line-height: 1.5;">${benefit}</li>
            `).join('')}
          </ul>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${message.ctaLink}" style="display: inline-block; background: ${accentColor}; color: white; padding: 14px 36px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px ${accentColor}40;">
            ${message.cta}
          </a>
        </div>

        <!-- Stay Connected -->
        <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #333;">
            Stay Connected With Us
          </p>
          <p style="margin: 0; font-size: 14px; color: #666;">
            Follow us on social media for daily updates, event photos, and community highlights!
          </p>
        </div>
      </td>
    </tr>
    
    <!-- Aggie Spirit Footer -->
    <tr>
      <td style="background: #500000; padding: 32px; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: white;">
          Gig 'em, Aggies! 👍
        </p>
        <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7);">
          Mays Business School • Texas A&M University
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding: 24px 32px; text-align: center; background: #f9fafb;">
        <p style="margin: 0 0 12px; font-size: 13px; color: #888;">
          You're receiving this email because you subscribed to the CMIS newsletter.
        </p>
        <p style="margin: 0; font-size: 13px;">
          <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe</a>
          <span style="color: #ccc; margin: 0 8px;">|</span>
          <a href="${appUrl}" style="color: #666; text-decoration: underline;">Visit CMIS</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

