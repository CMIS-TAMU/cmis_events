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

interface SponsorNewRegistrationProps {
  sponsorName: string;
  eventName: string;
  eventDate: string;
  studentCount: number;
  studentsByMajor: Array<{ major: string; count: number }>;
  studentsByYear: Array<{ year: string; count: number }>;
  dashboardLink: string;
  viewProfilesLink: string;
  downloadResumesLink: string;
}

export function SponsorNewRegistrationEmail({
  sponsorName,
  eventName,
  eventDate,
  studentCount,
  studentsByMajor,
  studentsByYear,
  dashboardLink,
  viewProfilesLink,
  downloadResumesLink,
}: SponsorNewRegistrationProps) {
  return (
    <BaseTemplate
      preview={`${studentCount} new student${studentCount !== 1 ? 's have' : ' has'} registered for ${eventName}`}
    >
      <Text style={heading}>New Student Registration</Text>

      <Text style={paragraph}>
        Hi {sponsorName},
      </Text>

      <Text style={paragraph}>
        Great news! <strong>{studentCount} new student{studentCount !== 1 ? 's have' : ' has'}</strong> registered for <strong>{eventName}</strong>.
      </Text>

      {/* Student Breakdown */}
      <Section style={statsSection}>
        <Row>
          <Column style={statColumn}>
            <Text style={statNumber}>{studentCount}</Text>
            <Text style={statLabel}>Total Students</Text>
          </Column>
        </Row>
      </Section>

      {/* By Major */}
      {studentsByMajor.length > 0 && (
        <Section style={breakdownSection}>
          <Text style={sectionHeading}>By Major</Text>
          {studentsByMajor.map((item, index) => (
            <Row key={index} style={breakdownRow}>
              <Column>
                <Text style={breakdownLabel}>{item.major || 'Undeclared'}</Text>
              </Column>
              <Column style={breakdownValueColumn}>
                <Text style={breakdownValue}>{item.count}</Text>
              </Column>
            </Row>
          ))}
        </Section>
      )}

      {/* By Year */}
      {studentsByYear.length > 0 && (
        <Section style={breakdownSection}>
          <Text style={sectionHeading}>By Year</Text>
          {studentsByYear.map((item, index) => (
            <Row key={index} style={breakdownRow}>
              <Column>
                <Text style={breakdownLabel}>{item.year}</Text>
              </Column>
              <Column style={breakdownValueColumn}>
                <Text style={breakdownValue}>{item.count}</Text>
              </Column>
            </Row>
          ))}
        </Section>
      )}

      <Hr style={divider} />

      {/* CTA Buttons */}
      <Section style={ctaSection}>
        <Button style={primaryButton} href={viewProfilesLink}>
          View Student Profiles
        </Button>
        <Button style={secondaryButton} href={downloadResumesLink}>
          Download Resumes
        </Button>
        <Button style={tertiaryButton} href={dashboardLink}>
          Go to Dashboard
        </Button>
      </Section>

      <Text style={paragraph}>
        Event Date: <strong>{eventDate}</strong>
      </Text>

      <Text style={paragraph}>
        Don&apos;t miss this opportunity to connect with talented students!
      </Text>
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

const statsSection = {
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const statColumn = {
  textAlign: 'center' as const,
};

const statNumber = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0',
};

const statLabel = {
  fontSize: '14px',
  color: '#64748b',
  margin: '4px 0 0',
};

const breakdownSection = {
  margin: '24px 0',
};

const sectionHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 12px',
};

const breakdownRow = {
  margin: '8px 0',
};

const breakdownLabel = {
  fontSize: '14px',
  color: '#1e293b',
  margin: '0',
};

const breakdownValueColumn = {
  textAlign: 'right' as const,
};

const breakdownValue = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1e40af',
  margin: '0',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
};

const ctaSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
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
  margin: '0 0 12px',
};

const secondaryButton = {
  backgroundColor: '#ffffff',
  border: '2px solid #1e40af',
  borderRadius: '6px',
  color: '#1e40af',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px 24px',
  margin: '0 0 12px',
};

const tertiaryButton = {
  backgroundColor: 'transparent',
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'underline',
  textAlign: 'center' as const,
  display: 'block',
  margin: '12px 0 0',
};
