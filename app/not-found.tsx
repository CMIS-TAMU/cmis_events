import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-4xl mb-2">404</CardTitle>
          <CardDescription className="text-lg">
            Page Not Found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex gap-2">
            <Link href="/">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Go home
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Browse events
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

