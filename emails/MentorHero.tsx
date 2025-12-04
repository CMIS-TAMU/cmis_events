import { Html, Head, Body, Container, Text, Link, Preview, Tailwind } from '@react-email/components';
import * as React from 'react';

interface MentorHeroEmailProps {
  name: string;
  company: string;
  yearsActive: number;
  studentsMet: number;
}

export const MentorHero = ({ name, company, yearsActive, studentsMet }: MentorHeroEmailProps) => (
  <Html>
    <Head />
    <Preview>
      {name}, you&apos;re a mentor hero! {yearsActive} years of guiding students — thank you for everything.
    </Preview>
    <Tailwind>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>💙 Mentor Hero, {name}!</Text>
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>
            You&apos;ve been a mentor with CMIS for <strong>{yearsActive} years</strong>, guiding and inspiring <strong>{studentsMet}+ students</strong>.
            Your impact is immeasurable!
          </Text>
          <Text style={paragraph}>
            Mentors like you are the heart of our community. We&apos;d love to have you back for our upcoming mentorship sessions.
          </Text>
          <Text style={paragraph}>
            <Link href="https://cmisevents.vercel.app/events" style={button}>
              View Mentorship Opportunities
            </Link>
          </Text>
          <Text style={paragraph}>
            Thank you for being a guiding light for our students.
            <br />
            With gratitude,
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

