'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc/trpc';
import { Mail, CheckCircle2, Sparkles, GraduationCap, Users, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type RoleType = 'student' | 'mentor' | 'sponsor' | 'general';

const roleOptions: { value: RoleType; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  {
    value: 'student',
    label: 'Student',
    icon: GraduationCap,
    description: 'Event invites & career opportunities',
  },
  {
    value: 'mentor',
    label: 'Mentor',
    icon: Users,
    description: 'Mentorship requests & impact updates',
  },
  {
    value: 'sponsor',
    label: 'Sponsor',
    icon: Building2,
    description: 'Talent pipeline & partnership updates',
  },
];

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType>('student');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
      setEmail('');
      setName('');
      setErrorMessage('');
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    subscribeMutation.mutate({
      email: email.trim(),
      full_name: name.trim() || undefined,
      role: selectedRole,
    });
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">You&apos;re In!</h3>
        <p className="text-white/80 max-w-md mx-auto">
          Welcome to the CMIS community! Check your inbox for a confirmation email.
        </p>
        <Button
          variant="ghost"
          className="mt-6 text-white/70 hover:text-white hover:bg-white/10"
          onClick={() => setIsSuccess(false)}
        >
          Subscribe another email
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <div className="space-y-3">
          <Label className="text-white/90 text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            I am a...
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {roleOptions.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={cn(
                    'relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200',
                    isSelected
                      ? 'border-white bg-white/15 shadow-lg shadow-white/10'
                      : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                  )}
                >
                  <Icon className={cn(
                    'h-6 w-6 mb-2 transition-colors',
                    isSelected ? 'text-white' : 'text-white/70'
                  )} />
                  <span className={cn(
                    'font-semibold text-sm',
                    isSelected ? 'text-white' : 'text-white/80'
                  )}>
                    {role.label}
                  </span>
                  <span className={cn(
                    'text-[10px] mt-1 text-center leading-tight',
                    isSelected ? 'text-white/80' : 'text-white/50'
                  )}>
                    {role.description}
                  </span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-[#500000]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Fields */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white focus:ring-white/30"
            />
          </div>
          <div className="flex-1">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white focus:ring-white/30"
            />
          </div>
          <Button
            type="submit"
            disabled={subscribeMutation.isPending}
            className="h-12 px-8 bg-white text-[#500000] hover:bg-white/90 font-semibold shadow-lg shadow-black/20 transition-all hover:scale-105"
          >
            {subscribeMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#500000]/30 border-t-[#500000] rounded-full animate-spin" />
                Subscribing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Subscribe
              </span>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <p className="text-red-300 text-sm text-center animate-in fade-in slide-in-from-top-2">
            {errorMessage}
          </p>
        )}

        {/* Privacy Note */}
        <p className="text-white/50 text-xs text-center">
          By subscribing, you agree to receive emails from CMIS. Unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}

