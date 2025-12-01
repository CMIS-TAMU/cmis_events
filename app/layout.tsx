import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ChatProvider } from '@/components/chat';

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
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          
          {/* AI Chatbot - appears on all pages */}
          <ChatProvider
            config={{
              placeholder: 'Ask about CMIS events...',
              welcomeMessage: "Hi! 👋 I'm the CMIS Assistant. How can I help you with events today?",
              position: 'bottom-right',
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
