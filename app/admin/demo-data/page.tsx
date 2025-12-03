'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Users, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DemoDataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  const seedLeaderboard = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/seed-demo-leaderboard', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'Demo leaderboard data seeded successfully!',
        });
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to seed demo data',
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Demo Data Management</h1>
        <p className="text-muted-foreground">
          Generate fake data for demonstration purposes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard Demo Data
          </CardTitle>
          <CardDescription>
            Generate fake student points and rankings for the leaderboard demo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What this does:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Creates fake student points data</li>
              <li>Generates realistic rankings (10-15 entries)</li>
              <li>Includes varied scores, missions completed, and points</li>
              <li>Updates existing student_points table</li>
            </ul>
          </div>

          {result && (
            <Alert className={result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                {result.success ? (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {result.message}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>❌</span>
                    {result.error}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={seedLeaderboard}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Demo Data...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Leaderboard Demo Data
              </>
            )}
          </Button>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Note:</strong> This will create or update fake student points data. 
              Existing real data will be preserved but may be overwritten with demo data.
            </p>
            <p>
              After generating, visit the <a href="/leaderboard" className="text-blue-600 hover:underline">Leaderboard</a> page to see the demo data.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>View Demo Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/leaderboard')}
            >
              <Trophy className="mr-2 h-4 w-4" />
              View Leaderboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/missions')}
            >
              <Users className="mr-2 h-4 w-4" />
              View Missions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

