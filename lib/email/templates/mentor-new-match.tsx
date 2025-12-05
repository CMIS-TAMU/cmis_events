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

interface MentorNewMatchProps {
  mentorName: string;
  menteeName: string;
  menteeEmail: string;
  menteeMajor?: string;
  menteeYear?: string;
  menteeInterests: string[];
  menteeGoals?: string;
  profileLink: string;
  schedulingLink: string;
  suggestedTopics: string[];
}

export function MentorNewMatchEmail({
  mentorName,
  menteeName,
  menteeEmail,
  menteeMajor,
  menteeYear,
  menteeInterests,
  menteeGoals,
  profileLink,
  schedulingLink,
  suggestedTopics,
}: MentorNewMatchProps) {
  return (
    <BaseTemplate
      preview={`You've been matched with ${menteeName}!`}
    >
      <Text style={heading}>New Mentee Match</Text>

      <Text style={paragraph}>
        Hi {mentorName},
      </Text>

      <Text style={paragraph}>
        Great news! You&apos;ve been matched with a new mentee: <strong>{menteeName}</strong>.
      </Text>

      {/* Mentee Profile */}
      <Section style={profileSection}>
        <Text style={sectionHeading}>Mentee Profile</Text>
        
        <Row style={infoRow}>
          <Column style={infoLabel}>
            <Text style={label}>Name:</Text>
          </Column>
          <Column>
            <Text style={value}>{menteeName}</Text>
          </Column>
        </Row>

        <Row style={infoRow}>
          <Column style={infoLabel}>
            <Text style={label}>Email:</Text>
          </Column>
          <Column>
            <Text style={value}>{menteeEmail}</Text>
          </Column>
        </Row>

        {menteeMajor && (
          <Row style={infoRow}>
            <Column style={infoLabel}>
              <Text style={label}>Major:</Text>
            </Column>
            <Column>
              <Text style={value}>{menteeMajor}</Text>
            </Column>
          </Row>
        )}

        {menteeYear && (
          <Row style={infoRow}>
            <Column style={infoLabel}>
              <Text style={label}>Year:</Text>
            </Column>
            <Column>
              <Text style={value}>{menteeYear}</Text>
            </Column>
          </Row>
        )}

        {menteeInterests.length > 0 && (
          <Row style={infoRow}>
            <Column style={infoLabel}>
              <Text style={label}>Interests:</Text>
            </Column>
            <Column>
              <Text style={value}>{menteeInterests.join(', ')}</Text>
            </Column>
          </Row>
        )}

        {menteeGoals && (
          <Row style={infoRow}>
            <Column style={infoLabel}>
              <Text style={label}>Goals:</Text>
            </Column>
            <Column>
              <Text style={value}>{menteeGoals}</Text>
            </Column>
          </Row>
        )}
      </Section>

      {/* Suggested Discussion Topics */}
      {suggestedTopics.length > 0 && (
        <Section style={section}>
          <Text style={sectionHeading}>Suggested Discussion Topics</Text>
          <ul style={list}>
            {suggestedTopics.map((topic, index) => (
              <li key={index} style={listItem}>
                <Text style={paragraph}>{topic}</Text>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Hr style={divider} />

      {/* CTA Buttons */}
      <Section style={ctaSection}>
        <Button style={primaryButton} href={profileLink}>
          View Full Profile
        </Button>
        <Button style={secondaryButton} href={schedulingLink}>
          Schedule Meeting
        </Button>
      </Section>

      <Text style={paragraph}>
        We recommend reaching out within 48 hours to establish a connection. Good luck with your mentorship journey!
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

const profileSection = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const section = {
  margin: '24px 0',
};

const sectionHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 16px',
};

const infoRow = {
  margin: '12px 0',
};

const infoLabel = {
  width: '120px',
};

const label = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#64748b',
  margin: '0',
};

const value = {
  fontSize: '14px',
  color: '#1e293b',
  margin: '0',
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
  margin: '0',
};
