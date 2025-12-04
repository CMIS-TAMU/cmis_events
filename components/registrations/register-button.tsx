'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RegisterButtonProps {
  eventId: string;
  eventTitle: string;
  className?: string;
}

export function RegisterButton({ eventId, eventTitle, className }: RegisterButtonProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: registrationStatusData, refetch: refetchStatus } = trpc.registrations.getStatus.useQuery(
    { event_id: eventId },
    { enabled: !!eventId }
  );

  const registerMutation = trpc.registrations.register.useMutation({
    onSuccess: (data) => {
      setRegistrationStatus('success');
      refetchStatus();
      // Refresh the page after a short delay to show updated status
      setTimeout(() => {
        router.refresh();
      }, 2000);
    },
    onError: (error) => {
      setRegistrationStatus('error');
      setErrorMessage(error.message);
    },
  });

  const handleRegister = () => {
    setShowDialog(true);
    setRegistrationStatus('idle');
    setErrorMessage('');
  };

  const confirmRegister = () => {
    registerMutation.mutate({ event_id: eventId });
  };

  // If already registered, show status
  if (registrationStatusData && registrationStatusData.status === 'registered') {
    return (
      <Button disabled className={className}>
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Registered
      </Button>
    );
  }

  if (registrationStatusData && registrationStatusData.status === 'cancelled') {
    return (
      <Button onClick={handleRegister} className={className}>
        Register Again
      </Button>
    );
  }

  return (
    <>
      <Button 
        onClick={handleRegister} 
        className={className} 
        disabled={registerMutation.isPending}
        aria-label={`Register for ${eventTitle}`}
      >
        {registerMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
            Registering...
          </>
        ) : (
          'Register for Event'
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent aria-labelledby="registration-dialog-title" aria-describedby="registration-dialog-description">
          <DialogHeader>
            <DialogTitle id="registration-dialog-title">Confirm Registration</DialogTitle>
            <DialogDescription id="registration-dialog-description">
              Are you sure you want to register for &quot;{eventTitle}&quot;?
            </DialogDescription>
          </DialogHeader>

          {registrationStatus === 'idle' && (
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                aria-label="Cancel registration"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmRegister} 
                disabled={registerMutation.isPending}
                aria-label={`Confirm registration for ${eventTitle}`}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                    Registering...
                  </>
                ) : (
                  'Confirm Registration'
                )}
              </Button>
            </DialogFooter>
          )}

          {registrationStatus === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-medium">Registration successful!</p>
              </div>
              <p className="text-sm text-muted-foreground">
                You have been successfully registered for this event. A confirmation email will be sent shortly.
              </p>
              <DialogFooter>
                <Button onClick={() => setShowDialog(false)}>Close</Button>
              </DialogFooter>
            </div>
          )}

          {registrationStatus === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Registration failed</p>
              </div>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Close
                </Button>
                <Button onClick={confirmRegister}>Try Again</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

