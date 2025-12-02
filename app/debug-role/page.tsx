'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DebugRolePage() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryDetails, setQueryDetails] = useState<any>(null);

  useEffect(() => {
    async function getDebugInfo() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      setAuthUser(user);
      
      if (authError) {
        setQueryError(`Auth error: ${authError.message}`);
        setLoading(false);
        return;
      }

      if (user) {
        // Try querying by ID first
        const { data: profileById, error: errorById } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        // Also try querying by email as fallback
        const { data: profileByEmail, error: errorByEmail } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email || '')
          .maybeSingle();

        // Store query details for debugging
        setQueryDetails({
          queryById: {
            userId: user.id,
            result: profileById,
            error: errorById?.message || null,
          },
          queryByEmail: {
            email: user.email,
            result: profileByEmail,
            error: errorByEmail?.message || null,
          },
        });

        // Use whichever query worked, or show error
        if (profileById) {
          setProfile(profileById);
          setQueryError(null);
        } else if (profileByEmail) {
          setProfile(profileByEmail);
          setQueryError(errorById?.message || 'Query by ID failed, but found by email');
        } else {
          setProfile(null);
          setQueryError(
            `Failed to find profile. ID query error: ${errorById?.message || 'No result'}. Email query error: ${errorByEmail?.message || 'No result'}`
          );
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    }
    getDebugInfo();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Role Debug Information</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Auth User (Supabase Auth)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify(authUser, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Profile (Database)</CardTitle>
          </CardHeader>
          <CardContent>
            {queryError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 font-semibold">Query Error:</p>
                <p className="text-red-700 text-sm">{queryError}</p>
              </div>
            )}
            <pre className="bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify(profile, null, 2) || 'null'}
            </pre>
            {queryDetails && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                  Show Query Details
                </summary>
                <pre className="mt-2 bg-muted p-4 rounded-md overflow-auto text-xs">
                  {JSON.stringify(queryDetails, null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> {authUser?.email || 'Not logged in'}
              </p>
              <p>
                <strong>Database Role:</strong> {profile?.role || 'Not found'}
              </p>
              <p>
                <strong>Is Admin?</strong>{' '}
                {profile?.role === 'admin' ? (
                  <span className="text-green-600 font-bold">✅ YES</span>
                ) : (
                  <span className="text-red-600 font-bold">❌ NO</span>
                )}
              </p>
              <p>
                <strong>Can Access Admin?</strong>{' '}
                {profile?.role === 'admin' ? (
                  <span className="text-green-600 font-bold">✅ YES</span>
                ) : (
                  <span className="text-red-600 font-bold">❌ NO - Need to set role to "admin"</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {profile?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-green-600 font-semibold">✅ You are set as admin!</p>
                <p>Try these links:</p>
                <div className="space-y-2">
                  <a href="/admin/dashboard" className="block text-blue-600 hover:underline">
                    /admin/dashboard
                  </a>
                  <a href="/admin/competitions" className="block text-blue-600 hover:underline">
                    /admin/competitions
                  </a>
                  <a href="/competitions" className="block text-blue-600 hover:underline">
                    /competitions (public competitions list)
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {profile && profile.role !== 'admin' && (
          <Card className="border-red-300 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600">⚠️ Not Set as Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Your current role is: <strong>{profile.role || 'user'}</strong>
              </p>
              <p className="mb-4">
                To become admin, run this SQL in Supabase:
              </p>
              <pre className="bg-white p-4 rounded-md border overflow-auto mb-4">
{`UPDATE users 
SET role = 'admin' 
WHERE email = '${authUser?.email}';`}
              </pre>
              <Button
                onClick={() => {
                  window.location.reload();
                }}
              >
                Refresh After Running SQL
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

