'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/trpc';
import { Button } from '@/components/ui/button';
import { X, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CancelButtonProps {
  eventId: string;
  eventTitle: string;
  onCancel?: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function CancelButton({
  eventId,
  eventTitle,
  onCancel,
  variant = 'outline',
  size = 'default',
}: CancelButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [cancelStatus, setCancelStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const cancelMutation = trpc.registrations.cancel.useMutation({
    onSuccess: () => {
      setCancelStatus('success');
      if (onCancel) {
        onCancel();
      }
      // Refresh after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    onError: (error) => {
      setCancelStatus('error');
      setErrorMessage(error.message);
    },
  });

  const handleCancel = () => {
    setShowDialog(true);
    setCancelStatus('idle');
    setErrorMessage('');
  };

  const confirmCancel = () => {
    cancelMutation.mutate({ event_id: eventId });
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleCancel}
        disabled={cancelMutation.isPending}
        aria-label={`Cancel registration for ${eventTitle}`}
      >
        {cancelMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
            Cancelling...
          </>
        ) : (
          <>
            <X className="h-4 w-4 mr-2" aria-hidden="true" />
            Cancel Registration
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent aria-labelledby="cancel-dialog-title" aria-describedby="cancel-dialog-description">
          <DialogHeader>
            <DialogTitle id="cancel-dialog-title">Cancel Registration</DialogTitle>
            <DialogDescription id="cancel-dialog-description">
              Are you sure you want to cancel your registration for &quot;{eventTitle}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {cancelStatus === 'idle' && (
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                aria-label="Keep your registration"
              >
                Keep Registration
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmCancel} 
                disabled={cancelMutation.isPending}
                aria-label={`Confirm cancellation of registration for ${eventTitle}`}
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Registration'
                )}
              </Button>
            </DialogFooter>
          )}

          {cancelStatus === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Registration cancelled</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Your registration has been cancelled. If there was a waitlist, the next person will be notified.
              </p>
              <DialogFooter>
                <Button onClick={() => setShowDialog(false)}>Close</Button>
              </DialogFooter>
            </div>
          )}

          {cancelStatus === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Cancellation failed</p>
              </div>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Close
                </Button>
                <Button onClick={confirmCancel}>Try Again</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

