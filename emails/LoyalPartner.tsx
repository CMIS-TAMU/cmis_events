import { Html, Head, Body, Container, Text, Link, Preview, Tailwind } from '@react-email/components';
import * as React from 'react';

interface LoyalPartnerEmailProps {
  name: string;
  company: string;
  yearsActive: number;
  studentsMet: number;
}

export const LoyalPartner = ({ name, company, yearsActive, studentsMet }: LoyalPartnerEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Thank you, {name}! {yearsActive} years of partnership with {company} — let&apos;s continue the journey.
    </Preview>
    <Tailwind>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>🙏 Thank You, {name}!</Text>
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>
            We wanted to express our gratitude for {company}&apos;s <strong>{yearsActive} years</strong> of partnership with CMIS.
            Together, we&apos;ve connected with <strong>{studentsMet}+ students</strong> and created lasting impact.
          </Text>
          <Text style={paragraph}>
            Your continued support means the world to us. We&apos;d love to have you back for our upcoming events.
          </Text>
          <Text style={paragraph}>
            <Link href="https://cmisevents.vercel.app/events" style={button}>
              View Upcoming Events
            </Link>
          </Text>
          <Text style={paragraph}>
            Looking forward to another amazing year together!
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

