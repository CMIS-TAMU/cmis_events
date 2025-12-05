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

interface Sponsor {
  id: string;
  name: string;
  company?: string;
}

interface EventReminderProps {
  studentName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventDescription?: string;
  whatToBring?: string[];
  sponsors: Sponsor[];
  calendarLink: string;
  eventLink: string;
}

export function EventReminderEmail({
  studentName,
  eventName,
  eventDate,
  eventTime,
  eventLocation,
  eventDescription,
  whatToBring,
  sponsors,
  calendarLink,
  eventLink,
}: EventReminderProps) {
  return (
    <BaseTemplate
      preview={`Reminder: ${eventName} is coming up soon!`}
    >
      <Text style={heading}>Event Reminder</Text>

      <Text style={paragraph}>
        Hi {studentName},
      </Text>

      <Text style={paragraph}>
        This is a friendly reminder that <strong>{eventName}</strong> is coming up soon!
      </Text>

      {/* Event Details Card */}
      <Section style={eventCard}>
        <Text style={eventNameStyle}>{eventName}</Text>
        
        <Row style={detailRow}>
          <Column style={detailIcon}>
            <Text style={icon}>📅</Text>
          </Column>
          <Column>
            <Text style={detailLabel}>Date & Time</Text>
            <Text style={detailValue}>
              {eventDate} at {eventTime}
            </Text>
          </Column>
        </Row>

        <Row style={detailRow}>
          <Column style={detailIcon}>
            <Text style={icon}>📍</Text>
          </Column>
          <Column>
            <Text style={detailLabel}>Location</Text>
            <Text style={detailValue}>{eventLocation}</Text>
          </Column>
        </Row>

        {eventDescription && (
          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>About</Text>
              <Text style={detailValue}>{eventDescription}</Text>
            </Column>
          </Row>
        )}
      </Section>

      {/* What to Bring */}
      {whatToBring && whatToBring.length > 0 && (
        <Section style={section}>
          <Text style={sectionHeading}>What to Bring</Text>
          <ul style={list}>
            {whatToBring.map((item, index) => (
              <li key={index} style={listItem}>
                <Text style={paragraph}>{item}</Text>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Attending Sponsors */}
      {sponsors.length > 0 && (
        <Section style={section}>
          <Text style={sectionHeading}>Attending Companies</Text>
          <Text style={paragraph}>
            This event will feature representatives from:
          </Text>
          <ul style={list}>
            {sponsors.map((sponsor) => (
              <li key={sponsor.id} style={listItem}>
                <Text style={paragraph}>
                  <strong>{sponsor.name}</strong>
                  {sponsor.company && ` (${sponsor.company})`}
                </Text>
              </li>
            ))}
          </ul>
          <Text style={paragraph}>
            This is a great opportunity to network and learn about career opportunities!
          </Text>
        </Section>
      )}

      <Hr style={divider} />

      {/* CTA Buttons */}
      <Section style={ctaSection}>
        <Button style={primaryButton} href={calendarLink}>
          Add to Calendar
        </Button>
        <Button style={secondaryButton} href={eventLink}>
          View Event Details
        </Button>
      </Section>

      <Text style={paragraph}>
        We look forward to seeing you there!
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

const eventCard = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '2px solid #e2e8f0',
};

const eventNameStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 20px',
};

const detailRow = {
  margin: '16px 0',
};

const detailIcon = {
  width: '40px',
  textAlign: 'center' as const,
};

const icon = {
  fontSize: '20px',
  margin: '0',
};

const detailLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px',
  letterSpacing: '0.5px',
};

const detailValue = {
  fontSize: '16px',
  color: '#1e293b',
  margin: '0',
};

const section = {
  margin: '24px 0',
};

const sectionHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 12px',
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
