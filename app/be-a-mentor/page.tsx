'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function BeAMentorPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect mentors into the actual mentor profile setup flow
    router.replace('/mentorship/profile');
  }, [router]);

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          Redirecting you to set up your mentor profile...
        </p>
      </div>
    </main>
  );
}

