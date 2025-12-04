import { Html, Head, Body, Container, Text, Link, Preview, Tailwind } from '@react-email/components';
import * as React from 'react';

interface ComebackEmailProps {
  name: string;
  company: string;
  yearsMissing: number;
}

export const Comeback = ({ name, company, yearsMissing }: ComebackEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Hey {name}, we&apos;ve missed {company}! It&apos;s been {yearsMissing} years — let&apos;s reconnect.
    </Preview>
    <Tailwind>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>👋 We Miss You, {name}!</Text>
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>
            It&apos;s been a while since we last saw {company} at a CMIS event. We noticed it&apos;s been <strong>{yearsMissing} years</strong>!
          </Text>
          <Text style={paragraph}>
            We&apos;d love to welcome you back. Our upcoming events are packed with opportunities to connect with top talent and make a meaningful impact.
          </Text>
          <Text style={paragraph}>
            <Link href="https://cmisevents.vercel.app/events" style={button}>
              Explore Upcoming Events
            </Link>
          </Text>
          <Text style={paragraph}>
            Let&apos;s reconnect and create more amazing experiences together!
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

