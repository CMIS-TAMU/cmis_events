/**
 * Role-based access control components
 * Provides components to conditionally render content based on user roles
 */

'use client';

import { ReactNode } from 'react';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { usePermission, useAnyPermission } from '@/lib/hooks/usePermissions';
import { hasRoleLevel, hasExactRole, hasAnyRole } from '@/lib/auth/roles';
import { hasPermission, hasAnyPermission as checkAnyPermission, hasAllPermissions } from '@/lib/auth/permissions';
import type { UserRole } from '@/lib/auth/roles';
import type { Permission } from '@/lib/auth/permissions';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireExactRole?: boolean;
  requireRoleLevel?: UserRole;
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean;
  fallback?: ReactNode;
  showError?: boolean;
}

/**
 * Main role guard component
 * Conditionally renders children based on role/permission checks
 */
export function RoleGuard({
  children,
  allowedRoles,
  requireExactRole = false,
  requireRoleLevel,
  requiredPermissions,
  requireAllPermissions = false,
  fallback = null,
  showError = false,
}: RoleGuardProps) {
  const { role, isLoading } = useUserRole();

  // Show loading state
  if (isLoading) {
    return null;
  }

  // Check role-based access
  if (allowedRoles) {
    const hasAccess = requireExactRole
      ? role && allowedRoles.some((r) => hasExactRole(role, r))
      : role && hasAnyRole(role, allowedRoles);

    if (!hasAccess) {
      if (showError) {
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don&apos;t have permission to access this content. Required role: {allowedRoles.join(' or ')}.
            </AlertDescription>
          </Alert>
        );
      }
      return <>{fallback}</>;
    }
  }

  // Check role level requirement
  if (requireRoleLevel && role) {
    if (!hasRoleLevel(role, requireRoleLevel)) {
      if (showError) {
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This content requires {requireRoleLevel} role or higher.
            </AlertDescription>
          </Alert>
        );
      }
      return <>{fallback}</>;
    }
  }

  // Check permissions
  if (requiredPermissions && requiredPermissions.length > 0 && role) {
    const hasAccess = requireAllPermissions
      ? hasAllPermissions(role, requiredPermissions)
      : checkAnyPermission(role, requiredPermissions);

    if (!hasAccess) {
      if (showError) {
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don&apos;t have the required permissions to access this content.
            </AlertDescription>
          </Alert>
        );
      }
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

/**
 * Guard component for student-only content
 */
export function StudentOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['student']} requireExactRole={true} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Guard component for faculty-only content
 */
export function FacultyOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['faculty']} requireExactRole={true} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Guard component for sponsor-only content
 */
export function SponsorOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['sponsor']} requireExactRole={true} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Guard component for admin-only content
 */
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin']} requireExactRole={true} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Guard component for authenticated users (any role)
 */
export function AuthenticatedOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return null;
  }

  if (!role) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Guard component for multiple roles
 */
export function MultiRoleGuard({
  children,
  allowedRoles,
  fallback = null,
}: {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={allowedRoles} requireExactRole={false} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Guard component for permission-based access
 */
export function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  fallback = null,
}: {
  children: ReactNode;
  permissions: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard
      requiredPermissions={permissions}
      requireAllPermissions={requireAll}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}

