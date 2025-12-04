'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Menu, X, Calendar, User, LogOut, Shield } from 'lucide-react';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { hasPermission } from '@/lib/auth/permissions';
import type { UserRole } from '@/lib/auth/roles';

interface NavLink {
  href: string;
  label: string;
  requiresAuth?: boolean;
  allowedRoles?: UserRole[];
  requiredPermission?: string;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { role, isLoading: roleLoading } = useUserRole();

  // Get user auth state
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  // Define all navigation links with access requirements
  const allNavLinks: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/competitions', label: 'Competitions' },
    // Authenticated-only links
    { 
      href: '/missions', 
      label: 'Missions', 
      requiresAuth: true 
    },
    { 
      href: '/leaderboard', 
      label: 'Leaderboard', 
      requiresAuth: true 
    },
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      requiresAuth: true 
    },
    { 
      href: '/mentorship/dashboard', 
      label: 'Mentorship', 
      requiresAuth: true,
      requiredPermission: 'mentorship.view'
    },
    { 
      href: '/registrations', 
      label: 'My Registrations', 
      requiresAuth: true,
      requiredPermission: 'registrations.view'
    },
    { 
      href: '/sessions', 
      label: 'My Sessions', 
      requiresAuth: true,
      requiredPermission: 'events.view'
    },
    // Role-specific links
    { 
      href: '/sponsor/dashboard', 
      label: 'Sponsor', 
      requiresAuth: true,
      allowedRoles: ['sponsor', 'admin'],
      requiredPermission: 'sponsor.portal'
    },
    { 
      href: '/admin/dashboard', 
      label: 'Admin', 
      requiresAuth: true,
      allowedRoles: ['admin'],
      requiredPermission: 'admin.panel'
    },
  ];

  // Filter navigation links based on auth and role
  const navLinks = allNavLinks.filter((link) => {
    // Public links always show
    if (!link.requiresAuth) {
      return true;
    }

    // If link requires auth, user must be logged in
    if (!user || roleLoading) {
      return false;
    }

    // Check role restrictions
    if (link.allowedRoles && role) {
      if (!link.allowedRoles.includes(role)) {
        return false;
      }
    }

    // Check permission requirements
    if (link.requiredPermission && role) {
      if (!hasPermission(role, link.requiredPermission as any)) {
        return false;
      }
    }

    return true;
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Calendar className="h-6 w-6" />
            <span>CMIS Events</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {role === 'admin' && (
                <Link href="/admin/dashboard">
                  <Button variant="ghost" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <nav className="container flex flex-col gap-4 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t">
              {user ? (
                <>
                  <Link href="/profile">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
