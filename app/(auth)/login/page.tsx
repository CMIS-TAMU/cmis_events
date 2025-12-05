'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  // Decode redirect URL if it's URL-encoded (e.g., %2Fdashboard -> /dashboard)
  const redirect = redirectParam ? decodeURIComponent(redirectParam) : '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Check if it's an email verification error
        if (signInError.message.includes('Email not confirmed') || signInError.message.includes('not confirmed')) {
          setError('Please verify your email before signing in. Check your inbox for the verification link.');
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      if (data.user && data.session) {
        // Session exists, wait a moment for it to be saved
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Verify redirect URL is safe (starts with /)
        let safeRedirect = redirect || '/dashboard';
        if (!safeRedirect.startsWith('/')) {
          safeRedirect = '/dashboard';
        }
        
        // Redirect using Next.js router instead of window.location for better compatibility
        router.push(safeRedirect);
        router.refresh();
        return; // Exit early to prevent loading state reset
      } else if (data.user && !data.session) {
        // User exists but no session - might need email verification
        setError('Please verify your email before signing in. Check your inbox for the verification link.');
        setLoading(false);
      } else {
        setError('Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12 sm:px-6 lg:px-8 relative">
      {/* Decorative maroon accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#500000] via-[#6b0000] to-[#500000]" />
      
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-[#500000]">
        <CardHeader className="space-y-4 pb-2">
          {/* Official Logos */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logos/tamu-seal.png"
                alt="Texas A&M University Seal"
                width={56}
                height={56}
                className="object-contain"
              />
              <div className="h-10 w-px bg-gray-200" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logos/cmis-logo.jpeg"
                alt="CMIS Mays Business School"
                width={56}
                height={56}
                className="object-contain rounded"
              />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-[#500000]">CMIS Events</h1>
              <p className="text-xs text-muted-foreground">Mays Business School • Texas A&M University</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <CardTitle className="text-2xl font-bold text-center text-gray-800">Sign in to your account</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleLogin} aria-label="Sign in form">
          <CardContent className="space-y-4">
            {error && (
              <div 
                className="rounded-md bg-red-50 p-4"
                role="alert"
                aria-live="assertive"
              >
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'login-error' : undefined}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'login-error' : undefined}
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center justify-between">
              <Link
                href="/reset-password"
                className="text-sm text-primary hover:underline"
                aria-label="Reset your password"
              >
                Forgot password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              aria-label={loading ? 'Signing in, please wait' : 'Sign in to your account'}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

