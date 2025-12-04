'use client';

import { useUserRole } from '@/lib/hooks/useUserRole';
import { usePermission, useAnyPermission, useUserPermissions } from '@/lib/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function TestRolesPage() {
  const { role, isLoading: roleLoading, error: roleError } = useUserRole();
  const { permissions, isLoading: permLoading } = useUserPermissions();
  
  // Test specific permissions
  const { hasPermission: canViewAdmin } = usePermission('admin.panel');
  const { hasPermission: canCreateEvents } = usePermission('events.create');
  const { hasPermission: canViewEvents } = usePermission('events.view');
  const { hasAnyPermission: canManageEvents } = useAnyPermission([
    'events.create',
    'events.edit',
    'events.delete',
  ]);

  if (roleLoading || permLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (roleError) {
    return (
      <div className="container mx-auto p-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Role</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{roleError.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Role & Permissions Test Page</h1>
        <p className="text-muted-foreground">
          Testing Phase 1 implementations: Role utilities and permission system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Role */}
        <Card>
          <CardHeader>
            <CardTitle>Current Role</CardTitle>
            <CardDescription>Your assigned role in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {role ? (
              <div className="flex items-center gap-2">
                <Badge variant={role === 'admin' ? 'destructive' : 'default'} className="text-lg px-3 py-1">
                  {role}
                </Badge>
              </div>
            ) : (
              <p className="text-muted-foreground">Not logged in</p>
            )}
          </CardContent>
        </Card>

        {/* Permissions Count */}
        <Card>
          <CardHeader>
            <CardTitle>Total Permissions</CardTitle>
            <CardDescription>Number of permissions for your role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{permissions.length}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {role ? `Permissions for ${role} role` : 'No role assigned'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Permission Tests */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Permission Tests</CardTitle>
          <CardDescription>Testing specific permission checks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <span className="font-medium">View Admin Panel</span>
              {canViewAdmin ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <span className="font-medium">Create Events</span>
              {canCreateEvents ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <span className="font-medium">View Events</span>
              {canViewEvents ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <span className="font-medium">Manage Events (Any Permission)</span>
              {canManageEvents ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Permissions List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Permissions ({permissions.length})</CardTitle>
          <CardDescription>Complete list of permissions for your role</CardDescription>
        </CardHeader>
        <CardContent>
          {permissions.length > 0 ? (
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {permissions.map((perm) => (
                <Badge key={perm} variant="outline" className="justify-start text-xs">
                  {perm}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No permissions assigned</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

