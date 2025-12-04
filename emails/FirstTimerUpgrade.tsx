import { Html, Head, Body, Container, Text, Link, Preview, Tailwind } from '@react-email/components';
import * as React from 'react';

interface FirstTimerUpgradeEmailProps {
  name: string;
  company: string;
}

export const FirstTimerUpgrade = ({ name, company }: FirstTimerUpgradeEmailProps) => (
  <Html>
    <Head />
    <Preview>
      {name}, you joined us once — let&apos;s make it a partnership! Upgrade your involvement with {company}.
    </Preview>
    <Tailwind>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>🚀 Ready to Level Up?</Text>
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>
            We loved having {company} at our event! You&apos;ve seen what CMIS can do — now let&apos;s make it a regular partnership.
          </Text>
          <Text style={paragraph}>
            As a returning partner, you&apos;ll get:
          </Text>
          <Text style={list}>
            • Early access to top talent
            <br />
            • Priority event registration
            <br />
            • Exclusive networking opportunities
            <br />
            • Customized engagement packages
          </Text>
          <Text style={paragraph}>
            <Link href="https://cmisevents.vercel.app/events" style={button}>
              Explore Partnership Opportunities
            </Link>
          </Text>
          <Text style={paragraph}>
            Let&apos;s build something amazing together!
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

const list = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#333333',
  marginBottom: '16px',
  paddingLeft: '20px',
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

