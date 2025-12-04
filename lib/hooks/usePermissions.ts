/**
 * Hook to check user permissions based on role
 */

'use client';

import { useUserRole } from './useUserRole';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  type Permission,
} from '@/lib/auth/permissions';
import type { UserRole } from '@/lib/auth/roles';

/**
 * Hook to check if user has a specific permission
 */
export function usePermission(permission: Permission): {
  hasPermission: boolean;
  isLoading: boolean;
} {
  const { role, isLoading } = useUserRole();

  return {
    hasPermission: role ? hasPermission(role, permission) : false,
    isLoading,
  };
}

/**
 * Hook to check if user has any of the specified permissions
 */
export function useAnyPermission(permissions: Permission[]): {
  hasAnyPermission: boolean;
  isLoading: boolean;
} {
  const { role, isLoading } = useUserRole();

  return {
    hasAnyPermission: role ? hasAnyPermission(role, permissions) : false,
    isLoading,
  };
}

/**
 * Hook to check if user has all of the specified permissions
 */
export function useAllPermissions(permissions: Permission[]): {
  hasAllPermissions: boolean;
  isLoading: boolean;
} {
  const { role, isLoading } = useUserRole();

  return {
    hasAllPermissions: role ? hasAllPermissions(role, permissions) : false,
    isLoading,
  };
}

/**
 * Hook to get all permissions for the current user
 */
export function useUserPermissions(): {
  permissions: Permission[];
  isLoading: boolean;
} {
  const { role, isLoading } = useUserRole();

  return {
    permissions: role ? getRolePermissions(role) : [],
    isLoading,
  };
}

/**
 * Hook with combined role and permission information
 */
export function useAuth(): {
  role: UserRole | null;
  permissions: Permission[];
  isLoading: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
} {
  const { role, isLoading } = useUserRole();
  const permissions = role ? getRolePermissions(role) : [];

  return {
    role,
    permissions,
    isLoading,
    hasPermission: (permission: Permission) =>
      role ? hasPermission(role, permission) : false,
    hasAnyPermission: (perms: Permission[]) =>
      role ? hasAnyPermission(role, perms) : false,
    hasAllPermissions: (perms: Permission[]) =>
      role ? hasAllPermissions(role, perms) : false,
  };
}

