'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/trpc';
import { toastUtil } from '@/lib/utils/toast';

interface SessionRegisterButtonProps {
  sessionId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function SessionRegisterButton({
  sessionId,
  onSuccess,
  onError,
  className,
}: SessionRegisterButtonProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  const utils = trpc.useUtils();
  const registerMutation = trpc.sessions.register.useMutation({
    onSuccess: () => {
      setIsRegistering(false);
      utils.sessions.getRegistrationStatus.invalidate({ session_id: sessionId });
      utils.sessions.getCapacity.invalidate({ session_id: sessionId });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      setIsRegistering(false);
      if (onError) {
        onError(error.message || 'Failed to register for session');
      } else {
        toastUtil.error('Registration failed', error.message || 'Failed to register for session. Please try again.');
      }
    },
  });

  const handleRegister = async () => {
    if (confirm('Register for this session?')) {
      setIsRegistering(true);
      registerMutation.mutate({ session_id: sessionId });
    }
  };

  return (
    <Button
      onClick={handleRegister}
      disabled={isRegistering}
      className={className}
    >
      {isRegistering ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Registering...
        </>
      ) : (
        'Register for Session'
      )}
    </Button>
  );
}

