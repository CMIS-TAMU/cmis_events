import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/client';
import {
  registrationConfirmationEmail,
  cancellationEmail,
  adminRegistrationNotificationEmail,
  mentorNotificationEmail,
  miniMentorshipRequestNotificationEmail,
  sponsorNewEventNotificationEmail,
} from '@/lib/email/templates';
import {
  missionPublishedEmail,
  submissionReceivedEmail,
  submissionReviewedEmail,
  perfectScoreEmail,
} from '@/lib/emails/missions';

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

      case 'mentor_notification': {
        const { mentorName, studentName, studentEmail, studentMajor, studentSkills, matchScore, batchId, mentorPosition, studentNotes } = data;
        html = mentorNotificationEmail({
          mentorName,
          studentName,
          studentEmail,
          studentMajor,
          studentSkills,
          matchScore,
          batchId,
          mentorPosition,
          studentNotes,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        });
        subject = `New Mentorship Request - Match Score: ${matchScore}/100`;
        to = data.mentorEmail;
        break;
      }

      case 'mission_published': {
        const { studentName, mission } = data;
        html = missionPublishedEmail({
          studentName,
          mission,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        });
        subject = `New Technical Challenge: ${mission.title}`;
        to = data.studentEmail;
        break;
      }

      case 'submission_received': {
        const { sponsorName, mission, student, submissionId } = data;
        html = submissionReceivedEmail({
          sponsorName,
          mission,
          student,
          submissionId,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        });
        subject = `New submission for ${mission.title}`;
        to = data.sponsorEmail;
        break;
      }

      case 'submission_reviewed': {
        const { studentName, mission, score, pointsAwarded, totalPoints, rank, feedback } = data;
        html = submissionReviewedEmail({
          studentName,
          mission,
          score,
          pointsAwarded,
          totalPoints,
          rank,
          feedback,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        });
        subject = `Your submission has been reviewed: ${mission.title}`;
        to = data.studentEmail;
        break;
      }

      case 'perfect_score': {
        const { studentName, mission, bonusPoints, totalPoints, rank } = data;
        html = perfectScoreEmail({
          studentName,
          mission,
          bonusPoints,
          totalPoints,
          rank,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        });
        subject = `🎉 Perfect Score! You earned bonus points`;
        to = data.studentEmail;
        break;
      }

      case 'mini_mentorship_request': {
        const { mentorName, requestTitle, requestDescription, sessionType, duration, urgency, studentName, preferredDates, tags } = data;
        html = miniMentorshipRequestNotificationEmail({
          mentorName,
          requestTitle,
          requestDescription,
          sessionType,
          duration,
          urgency,
          studentName,
          preferredDates,
          tags,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        });
        subject = urgency === 'urgent' 
          ? `🚨 URGENT: New Mini Session Request - ${requestTitle}`
          : urgency === 'high'
            ? `⚠️ High Priority: New Mini Session Request - ${requestTitle}`
            : `New Mini Session Request - ${requestTitle}`;
        to = data.mentorEmail;
        break;
      }

      case 'sponsor_new_event': {
        const { sponsorName, event, eventId } = data;
        html = sponsorNewEventNotificationEmail({
          sponsorName,
          event,
          eventId,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        });
        subject = data.subject || `🎉 New Event: ${event.title}`;
        to = data.to;
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

