import { Html, Head, Body, Container, Text, Link, Preview, Tailwind } from '@react-email/components';
import * as React from 'react';

interface TopRecruiterEmailProps {
  name: string;
  company: string;
  studentsMet: number;
  lastYear: number;
}

export const TopRecruiter = ({ name, company, studentsMet, lastYear }: TopRecruiterEmailProps) => (
  <Html>
    <Head />
    <Preview>
      {name}, you met {studentsMet} students in {lastYear}! You&apos;re a top recruiter — let&apos;s do it again.
    </Preview>
    <Tailwind>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>🎯 Top Recruiter Recognition!</Text>
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>
            We&apos;re impressed! In {lastYear}, {company} connected with <strong>{studentsMet} students</strong> at CMIS events.
            That&apos;s incredible impact!
          </Text>
          <Text style={paragraph}>
            As one of our top recruiters, you have priority access to our best talent and exclusive networking opportunities.
          </Text>
          <Text style={paragraph}>
            <Link href="https://cmisevents.vercel.app/events" style={button}>
              See Upcoming Events
            </Link>
          </Text>
          <Text style={paragraph}>
            Let&apos;s make {new Date().getFullYear()} even better!
            <br />
            Best regards,
            <br />
            The CMIS Team
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const heading = {
  fontSize: '24px',
  lineHeight: '32px',
  fontWeight: 'bold',
  color: '#500000',
  marginBottom: '20px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#333333',
  marginBottom: '16px',
};

const button = {
  backgroundColor: '#500000',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  width: 'fit-content',
  margin: '20px 0',
};

