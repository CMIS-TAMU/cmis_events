/**
 * Permission matrix for role-based access control
 */

import type { UserRole } from './roles';

export type Permission =
  | 'events.view'
  | 'events.create'
  | 'events.edit'
  | 'events.delete'
  | 'events.register'
  | 'registrations.view'
  | 'registrations.manage'
  | 'dashboard.view'
  | 'dashboard.student'
  | 'dashboard.faculty'
  | 'dashboard.sponsor'
  | 'dashboard.admin'
  | 'profile.view'
  | 'profile.edit'
  | 'profile.student.edit'
  | 'profile.faculty.edit'
  | 'resumes.view'
  | 'resumes.upload'
  | 'resumes.search'
  | 'mentorship.view'
  | 'mentorship.request'
  | 'mentorship.manage'
  | 'sponsor.portal'
  | 'admin.panel'
  | 'admin.users'
  | 'admin.events'
  | 'admin.analytics'
  | 'admin.registrations'
  | 'admin.mentorship';

/**
 * Permission matrix: maps roles to their allowed permissions
 */
export const PERMISSIONS: Record<UserRole, Permission[]> = {
  student: [
    'events.view',
    'events.register',
    'registrations.view',
    'dashboard.view',
    'dashboard.student',
    'profile.view',
    'profile.edit',
    'profile.student.edit',
    'resumes.view',
    'resumes.upload',
    'mentorship.view',
    'mentorship.request',
  ],
  
  faculty: [
    'events.view',
    'events.register',
    'registrations.view',
    'dashboard.view',
    'dashboard.faculty',
    'profile.view',
    'profile.edit',
    'profile.faculty.edit',
    'resumes.view',
    'mentorship.view',
    'mentorship.manage',
  ],
  
  sponsor: [
    'events.view',
    'registrations.view',
    'dashboard.view',
    'dashboard.sponsor',
    'profile.view',
    'profile.edit',
    'resumes.view',
    'resumes.search',
    'sponsor.portal',
  ],
  
  admin: [
    // Admin has all permissions
    'events.view',
    'events.create',
    'events.edit',
    'events.delete',
    'events.register',
    'registrations.view',
    'registrations.manage',
    'dashboard.view',
    'dashboard.student',
    'dashboard.faculty',
    'dashboard.sponsor',
    'dashboard.admin',
    'profile.view',
    'profile.edit',
    'profile.student.edit',
    'profile.faculty.edit',
    'resumes.view',
    'resumes.upload',
    'resumes.search',
    'mentorship.view',
    'mentorship.request',
    'mentorship.manage',
    'sponsor.portal',
    'admin.panel',
    'admin.users',
    'admin.events',
    'admin.analytics',
    'admin.registrations',
    'admin.mentorship',
  ],
  
  user: [
    'events.view',
    'dashboard.view',
    'profile.view',
    'profile.edit',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role || !PERMISSIONS[role]) {
    return false;
  }
  
  return PERMISSIONS[role].includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: UserRole | null | undefined,
  permissions: Permission[]
): boolean {
  if (!role || !PERMISSIONS[role]) {
    return false;
  }
  
  return permissions.some((permission) => PERMISSIONS[role]!.includes(permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(
  role: UserRole | null | undefined,
  permissions: Permission[]
): boolean {
  if (!role || !PERMISSIONS[role]) {
    return false;
  }
  
  return permissions.every((permission) => PERMISSIONS[role]!.includes(permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole | null | undefined): Permission[] {
  if (!role || !PERMISSIONS[role]) {
    return [];
  }
  
  return PERMISSIONS[role]!;
}

