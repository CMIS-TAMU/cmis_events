/**
 * Role definitions and utilities for the CMIS Event Management System
 */

export type UserRole = 'student' | 'faculty' | 'sponsor' | 'admin' | 'user';

export const ROLES = {
  STUDENT: 'student' as const,
  FACULTY: 'faculty' as const,
  SPONSOR: 'sponsor' as const,
  ADMIN: 'admin' as const,
  USER: 'user' as const,
} as const;

/**
 * All valid roles
 */
export const VALID_ROLES: UserRole[] = ['student', 'faculty', 'sponsor', 'admin', 'user'];

/**
 * Role hierarchy (higher number = more permissions)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  student: 1,
  faculty: 2,
  sponsor: 3,
  admin: 4,
};

/**
 * Check if a role is valid
 */
export function isValidRole(role: string | null | undefined): role is UserRole {
  return role !== null && role !== undefined && VALID_ROLES.includes(role as UserRole);
}

/**
 * Check if user has at least the required role level
 */
export function hasRoleLevel(userRole: UserRole | null | undefined, requiredRole: UserRole): boolean {
  if (!userRole || !isValidRole(userRole)) {
    return false;
  }
  
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Check if user has exactly the specified role
 */
export function hasExactRole(userRole: UserRole | null | undefined, requiredRole: UserRole): boolean {
  return userRole === requiredRole;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRole: UserRole | null | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole || !isValidRole(userRole)) {
    return false;
  }
  return allowedRoles.includes(userRole);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole | string): string {
  const roleMap: Record<string, string> = {
    student: 'Student',
    faculty: 'Faculty',
    sponsor: 'Sponsor',
    admin: 'Administrator',
    user: 'User',
  };
  
  return roleMap[role] || role;
}

/**
 * Default role (used for new users)
 */
export const DEFAULT_ROLE: UserRole = 'user';

