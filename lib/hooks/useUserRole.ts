/**
 * Hook to get and manage user role
 * Provides easy access to current user's role with caching
 */

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/auth/roles';

interface UseUserRoleReturn {
  role: UserRole | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get the current user's role
 */
export function useUserRole(): UseUserRoleReturn {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRole = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error(`Failed to fetch user role: ${profileError.message}`);
      }

      setRole((profile?.role as UserRole) || 'user');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    role,
    isLoading,
    error,
    refetch: fetchRole,
  };
}

/**
 * Hook to check if user has a specific role
 */
export function useHasRole(requiredRole: UserRole): {
  hasRole: boolean;
  isLoading: boolean;
} {
  const { role, isLoading } = useUserRole();

  return {
    hasRole: role === requiredRole,
    isLoading,
  };
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useHasAnyRole(requiredRoles: UserRole[]): {
  hasAnyRole: boolean;
  isLoading: boolean;
} {
  const { role, isLoading } = useUserRole();

  return {
    hasAnyRole: role !== null && requiredRoles.includes(role),
    isLoading,
  };
}

