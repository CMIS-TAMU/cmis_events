'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestEmailPage() {
  const [emails, setEmails] = useState('nisarg.sonar@tamu.edu,prasanna.salunkhe@tamu.edu');
  const [type, setType] = useState('event');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSend = async () => {
    setLoading(true);
    setResult(null);

    try {
      const emailList = emails.split(',').map(e => e.trim()).filter(e => e);
      
      const response = await fetch('/api/test-email-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: emailList,
          type,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Send Test Emails</CardTitle>
          <CardDescription>
            Send test emails to verify the email notification system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email Addresses (comma-separated)
            </label>
            <Input
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="email1@example.com,email2@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="event">Event Notification</option>
              <option value="reminder">24-Hour Reminder</option>
              <option value="digest">Sponsor Digest</option>
            </select>
          </div>

          <Button
            onClick={handleSend}
            disabled={loading || !emails.trim()}
            className="w-full"
          >
            {loading ? 'Sending...' : 'Send Test Emails'}
          </Button>

          {result && (
            <div className={`p-4 rounded-md ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className="font-semibold mb-2">
                {result.success ? '✅ Success!' : '❌ Error'}
              </h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


