import * as React from 'react';
import {
  Section,
  Row,
  Column,
  Text,
  Button,
  Hr,
} from '@react-email/components';
import { BaseTemplate } from './base-template';

interface Event {
  id: string;
  name: string;
  date: string;
  location?: string;
}

interface Student {
  id: string;
  name: string;
  major?: string;
  year?: string;
  profileLink: string;
}

interface SponsorWeeklyDigestProps {
  sponsorName: string;
  weekStart: string;
  weekEnd: string;
  totalRegistrations: number;
  events: Event[];
  topStudents: Student[];
  upcomingOpportunities: string[];
  engagementMetrics: {
    profileViews: number;
    resumeDownloads: number;
    messagesSent: number;
  };
  dashboardLink: string;
}

export function SponsorWeeklyDigestEmail({
  sponsorName,
  weekStart,
  weekEnd,
  totalRegistrations,
  events,
  topStudents,
  upcomingOpportunities,
  engagementMetrics,
  dashboardLink,
}: SponsorWeeklyDigestProps) {
  return (
    <BaseTemplate
      preview={`Your weekly summary: ${totalRegistrations} registrations, ${events.length} events, and more`}
    >
      <Text style={heading}>Weekly Summary</Text>

      <Text style={paragraph}>
        Hi {sponsorName},
      </Text>

      <Text style={paragraph}>
        Here&apos;s your weekly summary for {weekStart} - {weekEnd}:
      </Text>

      {/* Key Stats */}
      <Section style={statsGrid}>
        <Row>
          <Column style={statBox}>
            <Text style={statNumber}>{totalRegistrations}</Text>
            <Text style={statLabel}>New Registrations</Text>
          </Column>
          <Column style={statBox}>
            <Text style={statNumber}>{events.length}</Text>
            <Text style={statLabel}>Active Events</Text>
          </Column>
        </Row>
        <Row>
          <Column style={statBox}>
            <Text style={statNumber}>{engagementMetrics.profileViews}</Text>
            <Text style={statLabel}>Profile Views</Text>
          </Column>
          <Column style={statBox}>
            <Text style={statNumber}>{engagementMetrics.resumeDownloads}</Text>
            <Text style={statLabel}>Resume Downloads</Text>
          </Column>
        </Row>
      </Section>

      {/* Event Highlights */}
      {events.length > 0 && (
        <Section style={section}>
          <Text style={sectionHeading}>Event Highlights</Text>
          {events.map((event) => (
            <Row key={event.id} style={eventRow}>
              <Column>
                <Text style={eventName}>{event.name}</Text>
                <Text style={eventDetails}>
                  {event.date} {event.location && `• ${event.location}`}
                </Text>
              </Column>
            </Row>
          ))}
        </Section>
      )}

      {/* Top Student Profiles */}
      {topStudents.length > 0 && (
        <Section style={section}>
          <Text style={sectionHeading}>Top Student Profiles</Text>
          {topStudents.slice(0, 5).map((student) => (
            <Row key={student.id} style={studentRow}>
              <Column>
                <Text style={studentName}>{student.name}</Text>
                <Text style={studentDetails}>
                  {student.major && `${student.major} • `}
                  {student.year && `Class of ${student.year}`}
                </Text>
                <Button style={viewProfileButton} href={student.profileLink}>
                  View Profile
                </Button>
              </Column>
            </Row>
          ))}
        </Section>
      )}

      {/* Upcoming Opportunities */}
      {upcomingOpportunities.length > 0 && (
        <Section style={section}>
          <Text style={sectionHeading}>Upcoming Opportunities</Text>
          <ul style={list}>
            {upcomingOpportunities.map((opportunity, index) => (
              <li key={index} style={listItem}>
                <Text style={paragraph}>{opportunity}</Text>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Hr style={divider} />

      <Button style={primaryButton} href={dashboardLink}>
        View Full Dashboard
      </Button>
    </BaseTemplate>
  );
}

// Styles
const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 16px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#1e293b',
  margin: '0 0 16px',
};

const statsGrid = {
  margin: '24px 0',
};

const statBox = {
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
  width: '50%',
};

const statNumber = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0',
};

const statLabel = {
  fontSize: '12px',
  color: '#64748b',
  margin: '4px 0 0',
  textTransform: 'uppercase' as const,
};

const section = {
  margin: '32px 0',
};

const sectionHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 16px',
};

const eventRow = {
  margin: '12px 0',
  padding: '12px',
  backgroundColor: '#f8fafc',
  borderRadius: '6px',
};

const eventName = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 4px',
};

const eventDetails = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
};

const studentRow = {
  margin: '16px 0',
  padding: '16px',
  backgroundColor: '#f8fafc',
  borderRadius: '6px',
};

const studentName = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 4px',
};

const studentDetails = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0 0 8px',
};

const viewProfileButton = {
  backgroundColor: '#1e40af',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '8px 16px',
  margin: '8px 0 0',
};

const list = {
  paddingLeft: '20px',
  margin: '0',
};

const listItem = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#1e293b',
  margin: '8px 0',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
};

const primaryButton = {
  backgroundColor: '#1e40af',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px 24px',
  margin: '0',
};
