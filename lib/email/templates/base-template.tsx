import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Link,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface BaseTemplateProps {
  children: React.ReactNode;
  preview?: string;
  footerText?: string;
}

// CMIS Brand Colors (adjust based on your actual brand)
const colors = {
  primary: '#1e40af', // Blue
  secondary: '#64748b', // Slate
  background: '#f8fafc',
  text: '#1e293b',
  muted: '#64748b',
  border: '#e2e8f0',
};

export function BaseTemplate({
  children,
  preview,
  footerText = 'CMIS Events - Connecting Students with Opportunities',
}: BaseTemplateProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Text style={logo}>CMIS Events</Text>
              </Column>
            </Row>
          </Section>

          {/* Preview Text */}
          {preview && (
            <Text style={previewText}>{preview}</Text>
          )}

          {/* Main Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerTextStyle}>
              {footerText}
            </Text>
            <Text style={footerLinkStyle}>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`} style={link}>
                Visit CMIS Events
              </Link>
              {' • '}
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/notifications`}
                style={link}
              >
                Manage Preferences
              </Link>
              {' • '}
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe`}
                style={link}
              >
                Unsubscribe
              </Link>
            </Text>
            <Text style={footerMuted}>
              © {new Date().getFullYear()} CMIS Events. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: colors.background,
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px',
  backgroundColor: colors.primary,
  borderRadius: '8px 8px 0 0',
};

const logo = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0',
};

const previewText = {
  fontSize: '14px',
  lineHeight: '26px',
  color: colors.muted,
  padding: '0 24px',
  margin: '16px 0',
};

const content = {
  padding: '24px',
};

const hr = {
  borderColor: colors.border,
  margin: '32px 0',
};

const footer = {
  padding: '0 24px',
  textAlign: 'center' as const,
};

const footerTextStyle = {
  fontSize: '14px',
  lineHeight: '24px',
  color: colors.text,
  margin: '0 0 8px',
};

const footerLinkStyle = {
  fontSize: '12px',
  lineHeight: '20px',
  color: colors.muted,
  margin: '8px 0',
};

const link = {
  color: colors.primary,
  textDecoration: 'underline',
};

const footerMuted = {
  fontSize: '12px',
  lineHeight: '20px',
  color: colors.muted,
  margin: '16px 0 0',
};
