import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CMIS Event Management System',
  description: 'Event management platform for CMIS at Texas A&M University',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
