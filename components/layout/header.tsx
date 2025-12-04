'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Menu, X, Calendar, User, LogOut, Shield, GraduationCap } from 'lucide-react';
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
    <header 
      className="sticky top-0 z-50 w-full border-b border-[#500000]/10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm"
      role="banner"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="flex items-center gap-2.5 font-bold text-xl text-[#500000] hover:opacity-90 transition-opacity"
            aria-label="CMIS Events home page"
          >
            <div className="w-9 h-9 rounded-lg bg-[#500000] flex items-center justify-center shadow-md">
              <Calendar className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold tracking-tight">CMIS Events</span>
              <span className="text-[10px] font-normal text-[#500000]/60 -mt-0.5">Texas A&M Mays</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav 
            className="hidden lg:flex items-center gap-1"
            role="navigation"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive(link.href) 
                    ? 'bg-[#500000] text-white shadow-md' 
                    : 'text-[#500000]/80 hover:bg-[#500000]/10 hover:text-[#500000]'
                }`}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {role === 'admin' && (
                <Link href="/admin/dashboard">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#500000] hover:bg-[#500000]/10"
                    aria-label="Go to admin dashboard"
                  >
                    <Shield className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[#500000] hover:bg-[#500000]/10"
                  aria-label="Go to your profile"
                >
                  <User className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  Profile
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-[#500000]/30 text-[#500000] hover:bg-[#500000] hover:text-white hover:border-[#500000]"
                aria-label="Sign out of your account"
              >
                <LogOut className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-[#500000] hover:bg-[#500000]/10"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button 
                  size="sm"
                  className="bg-[#500000] hover:bg-[#6b0000] text-white shadow-md"
                >
                  <GraduationCap className="h-4 w-4 mr-1.5" />
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-[#500000] hover:bg-[#500000]/10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-[#500000]/10 lg:hidden bg-white" id="mobile-navigation">
          <nav 
            className="container flex flex-col gap-1 px-4 py-4"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.href) 
                    ? 'bg-[#500000] text-white' 
                    : 'text-[#500000]/80 hover:bg-[#500000]/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-[#500000]/10">
              {user ? (
                <>
                  <Link href="/profile">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-[#500000] hover:bg-[#500000]/10" 
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-[#500000]/30 text-[#500000] hover:bg-[#500000] hover:text-white" 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button 
                      variant="ghost" 
                      className="w-full text-[#500000] hover:bg-[#500000]/10" 
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button 
                      className="w-full bg-[#500000] hover:bg-[#6b0000] text-white" 
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
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
