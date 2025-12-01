'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Camera, Loader2 } from 'lucide-react';

interface CheckInResult {
  success: boolean;
  message: string;
  registration?: {
    id: string;
    status: string;
    events: {
      title: string;
      starts_at: string;
    };
    users: {
      email: string;
      full_name?: string;
    };
  };
}

export default function CheckInPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
  const [qrInput, setQrInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role || 'user';
      setUserRole(role);

      if (role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    }
    checkAdmin();
  }, [router]);

  const handleCheckIn = async (qrData: string) => {
    if (!qrData.trim()) return;

    setScanning(true);
    setCheckInResult(null);

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData: qrData.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setCheckInResult({
          success: true,
          message: data.message,
          registration: data.registration,
        });
        setQrInput('');
        // Clear result after 3 seconds
        setTimeout(() => setCheckInResult(null), 5000);
      } else {
        setCheckInResult({
          success: false,
          message: data.error || 'Check-in failed',
          registration: data.registration,
        });
      }
    } catch (error: any) {
      setCheckInResult({
        success: false,
        message: error.message || 'An error occurred',
      });
    } finally {
      setScanning(false);
    }
  };

  const handleManualInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrInput.trim()) {
      handleCheckIn(qrInput);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Check-In Scanner</h1>
        <p className="text-muted-foreground">
          Scan QR codes to check in attendees for events
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Scanner/Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
            <CardDescription>
              Scan a QR code or manually enter the code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleManualInput} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="qr-input" className="text-sm font-medium">
                  QR Code Data
                </label>
                <input
                  id="qr-input"
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Enter QR code or scan..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={scanning}
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={scanning || !qrInput.trim()}
              >
                {scanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking in...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Check In
                  </>
                )}
              </Button>
            </form>

            <div className="text-xs text-muted-foreground text-center">
              Tip: You can paste QR code data directly or use a physical scanner
            </div>
          </CardContent>
        </Card>

        {/* Result Section */}
        <Card>
          <CardHeader>
            <CardTitle>Check-In Result</CardTitle>
          </CardHeader>
          <CardContent>
            {!checkInResult ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Scan a QR code to check in</p>
                </div>
              </div>
            ) : checkInResult.success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Success!</span>
                </div>
                <p className="text-sm">{checkInResult.message}</p>
                {checkInResult.registration && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div>
                      <span className="text-sm font-medium">Event:</span>{' '}
                      <span className="text-sm">
                        {checkInResult.registration.events?.title}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Attendee:</span>{' '}
                      <span className="text-sm">
                        {checkInResult.registration.users?.full_name ||
                          checkInResult.registration.users?.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Email:</span>{' '}
                      <span className="text-sm">
                        {checkInResult.registration.users?.email}
                      </span>
                    </div>
                    <Badge variant="default" className="mt-2">
                      Checked In
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold">Failed</span>
                </div>
                <p className="text-sm">{checkInResult.message}</p>
                {checkInResult.registration && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div>
                      <span className="text-sm font-medium">Status:</span>{' '}
                      <Badge
                        variant={
                          checkInResult.registration.status === 'checked_in'
                            ? 'default'
                            : checkInResult.registration.status === 'cancelled'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {checkInResult.registration.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {checkInResult.registration.events && (
                      <div>
                        <span className="text-sm font-medium">Event:</span>{' '}
                        <span className="text-sm">
                          {checkInResult.registration.events.title}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. Scan or enter the QR code from the attendee&apos;s registration confirmation</p>
          <p>2. The system will automatically check them in if the QR code is valid</p>
          <p>3. A success message will confirm the check-in</p>
          <p className="text-muted-foreground mt-4">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            Only admins and staff can access this page
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

