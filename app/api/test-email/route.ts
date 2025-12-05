import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/resend-client';
import { SponsorNewRegistrationEmail } from '@/lib/email/templates/sponsor-new-registration';
import { SponsorWeeklyDigestEmail } from '@/lib/email/templates/sponsor-weekly-digest';
import { MentorNewMatchEmail } from '@/lib/email/templates/mentor-new-match';
import { EventReminderEmail } from '@/lib/email/templates/event-reminder';

export const dynamic = 'force-dynamic';

/**
 * Test email endpoint
 * POST /api/test-email
 * Body: { type: 'sponsor-registration' | 'weekly-digest' | 'mentor-match' | 'event-reminder', to: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Recipient email (to) is required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'sponsor-registration': {
        result = await sendEmail({
          to,
          subject: 'New Student Registration - Test',
          react: SponsorNewRegistrationEmail({
            sponsorName: 'Test Sponsor',
            eventName: 'Tech Career Fair 2024',
            eventDate: 'March 15, 2024',
            studentCount: 25,
            studentsByMajor: [
              { major: 'Computer Science', count: 10 },
              { major: 'Business', count: 8 },
              { major: 'Engineering', count: 7 },
            ],
            studentsByYear: [
              { year: '2024', count: 5 },
              { year: '2025', count: 12 },
              { year: '2026', count: 8 },
            ],
            dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sponsor/dashboard`,
            viewProfilesLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sponsor/resumes`,
            downloadResumesLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sponsor/resumes`,
          }),
        });
        break;
      }

      case 'weekly-digest': {
        result = await sendEmail({
          to,
          subject: 'Your Weekly Summary - Test',
          react: SponsorWeeklyDigestEmail({
            sponsorName: 'Test Sponsor',
            weekStart: 'March 1, 2024',
            weekEnd: 'March 7, 2024',
            totalRegistrations: 150,
            events: [
              {
                id: '1',
                name: 'Tech Career Fair',
                date: 'March 15, 2024',
                location: 'Main Hall',
              },
              {
                id: '2',
                name: 'Networking Mixer',
                date: 'March 20, 2024',
                location: 'Student Center',
              },
            ],
            topStudents: [
              {
                id: '1',
                name: 'John Doe',
                major: 'Computer Science',
                year: '2025',
                profileLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/1`,
              },
              {
                id: '2',
                name: 'Jane Smith',
                major: 'Business',
                year: '2024',
                profileLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/2`,
              },
            ],
            upcomingOpportunities: [
              'Spring Career Fair - March 15',
              'Resume Review Session - March 12',
              'Interview Prep Workshop - March 18',
            ],
            engagementMetrics: {
              profileViews: 45,
              resumeDownloads: 12,
              messagesSent: 8,
            },
            dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sponsor/dashboard`,
          }),
        });
        break;
      }

      case 'mentor-match': {
        result = await sendEmail({
          to,
          subject: 'New Mentee Match - Test',
          react: MentorNewMatchEmail({
            mentorName: 'Test Mentor',
            menteeName: 'Sarah Johnson',
            menteeEmail: 'sarah.johnson@example.com',
            menteeMajor: 'Computer Science',
            menteeYear: '2025',
            menteeInterests: ['Software Development', 'Machine Learning', 'Open Source'],
            menteeGoals: 'Looking to break into the tech industry and build a strong professional network.',
            profileLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/sarah`,
            schedulingLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/mentorship/schedule`,
            suggestedTopics: [
              'Career path in software development',
              'Building a professional portfolio',
              'Networking strategies',
              'Interview preparation',
            ],
          }),
        });
        break;
      }

      case 'event-reminder': {
        result = await sendEmail({
          to,
          subject: 'Event Reminder: Tech Career Fair 2024',
          react: EventReminderEmail({
            studentName: 'Test Student',
            eventName: 'Tech Career Fair 2024',
            eventDate: 'March 15, 2024',
            eventTime: '10:00 AM - 2:00 PM',
            eventLocation: 'Main Hall, Student Center',
            eventDescription: 'Connect with top tech companies and explore career opportunities.',
            whatToBring: [
              'Multiple copies of your resume',
              'Professional attire',
              'Questions for recruiters',
              'Notebook and pen',
            ],
            sponsors: [
              { id: '1', name: 'Google', company: 'Alphabet Inc.' },
              { id: '2', name: 'Microsoft', company: 'Microsoft Corporation' },
              { id: '3', name: 'Amazon', company: 'Amazon.com Inc.' },
            ],
            calendarLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/1/calendar`,
            eventLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/1`,
          }),
        });
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        emailId: result.data?.id,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          retryAfter: result.retryAfter,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint - Show available test email types
 */
export async function GET() {
  return NextResponse.json({
    message: 'Test Email API',
    availableTypes: [
      'sponsor-registration',
      'weekly-digest',
      'mentor-match',
      'event-reminder',
    ],
    usage: {
      method: 'POST',
      body: {
        type: 'sponsor-registration | weekly-digest | mentor-match | event-reminder',
        to: 'recipient@example.com',
      },
    },
  });
}
