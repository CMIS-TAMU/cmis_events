import { Html, Head, Body, Container, Text, Link, Preview, Tailwind } from '@react-email/components';
import * as React from 'react';

interface Legend8PlusEmailProps {
  name: string;
  company: string;
  yearsActive: number;
  studentsMet: number;
}

export const Legend8Plus = ({ name, company, yearsActive, studentsMet }: Legend8PlusEmailProps) => (
  <Html>
    <Head />
    <Preview>
      {name}, you&apos;re a CMIS legend! {yearsActive} years of partnership — let&apos;s make it even more.
    </Preview>
    <Tailwind>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>🏆 You&apos;re a CMIS Legend!</Text>
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>
            We&apos;re honored to have {company} as part of the CMIS family for <strong>{yearsActive} years</strong>!
            You&apos;ve impacted <strong>{studentsMet}+ students</strong> and helped shape countless careers.
          </Text>
          <Text style={paragraph}>
            As a legend, you have exclusive access to our premium events and early opportunities.
          </Text>
          <Text style={paragraph}>
            <Link href="https://cmisevents.vercel.app/events" style={button}>
              Explore Upcoming Events
            </Link>
          </Text>
          <Text style={paragraph}>
            Thank you for being an integral part of our community.
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

