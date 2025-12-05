'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  X,
  User,
  LogOut,
  Shield,
  GraduationCap,
  ChevronDown,
  LayoutDashboard,
  Target,
  Trophy,
  CalendarCheck,
  Clock,
  Users,
  Building2,
  Briefcase,
} from 'lucide-react';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { hasPermission } from '@/lib/auth/permissions';
import type { UserRole } from '@/lib/auth/roles';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { role, isLoading: roleLoading } = useUserRole();

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
  const isActiveGroup = (paths: string[]) => paths.some(p => pathname.startsWith(p));

  // Permission checks
  const canViewMentorship = role && hasPermission(role, 'mentorship.view' as any);
  const canViewSponsor = role && ['sponsor', 'admin'].includes(role) && hasPermission(role, 'sponsor.portal' as any);
  const canViewAdmin = role === 'admin' && hasPermission(role, 'admin.panel' as any);
  const canViewRegistrations = role && hasPermission(role, 'registrations.view' as any);
  const canViewEvents = role && hasPermission(role, 'events.view' as any);

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-[#500000]/10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm"
      role="banner"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-8">
          <Link 
            href="/" 
            className="flex items-center gap-3 font-bold text-xl text-[#500000] hover:opacity-90 transition-opacity"
            aria-label="CMIS Events home page"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md bg-[#500000] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logos/atm-mays.jpg"
                alt="Texas A&M"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold tracking-tight">CMIS Events</span>
              <span className="text-[10px] font-medium text-[#500000]/60 -mt-0.5 tracking-wide uppercase">
                Mays Business School
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav 
            className="hidden lg:flex items-center gap-1"
            role="navigation"
            aria-label="Main navigation"
          >
            {/* Primary Links - Always Visible */}
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive('/') 
                  ? 'bg-[#500000] text-white shadow-md' 
                  : 'text-[#500000]/80 hover:bg-[#500000]/10 hover:text-[#500000]'
              }`}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              Home
            </Link>

            <Link
              href="/events"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive('/events') || pathname.startsWith('/events/')
                  ? 'bg-[#500000] text-white shadow-md' 
                  : 'text-[#500000]/80 hover:bg-[#500000]/10 hover:text-[#500000]'
              }`}
              aria-current={isActive('/events') ? 'page' : undefined}
            >
              Events
            </Link>

            <Link
              href="/competitions"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive('/competitions') || pathname.startsWith('/competitions/')
                  ? 'bg-[#500000] text-white shadow-md' 
                  : 'text-[#500000]/80 hover:bg-[#500000]/10 hover:text-[#500000]'
              }`}
              aria-current={isActive('/competitions') ? 'page' : undefined}
            >
              Competitions
            </Link>

            {/* Authenticated User Navigation */}
            {user && !roleLoading && (
              <>
                {/* Vertical Separator */}
                <div className="h-6 w-px bg-[#500000]/15 mx-2" aria-hidden="true" />

                {/* Activities Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        isActiveGroup(['/missions', '/leaderboard'])
                          ? 'bg-[#500000] text-white shadow-md' 
                          : 'text-[#500000]/80 hover:bg-[#500000]/10 hover:text-[#500000]'
                      }`}
                    >
                      <Target className="h-4 w-4" />
                      Activities
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel>Student Activities</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/missions">
                      <DropdownMenuItem className={isActive('/missions') ? 'bg-[#500000]/10' : ''}>
                        <Target className="h-4 w-4 mr-2.5 text-[#500000]/70" />
                        Missions
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/leaderboard">
                      <DropdownMenuItem className={isActive('/leaderboard') ? 'bg-[#500000]/10' : ''}>
                        <Trophy className="h-4 w-4 mr-2.5 text-[#500000]/70" />
                        Leaderboard
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* My Dashboard Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        isActiveGroup(['/dashboard', '/registrations', '/sessions'])
                          ? 'bg-[#500000] text-white shadow-md' 
                          : 'text-[#500000]/80 hover:bg-[#500000]/10 hover:text-[#500000]'
                      }`}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      My Dashboard
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel>Your Activity</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/dashboard">
                      <DropdownMenuItem className={isActive('/dashboard') ? 'bg-[#500000]/10' : ''}>
                        <LayoutDashboard className="h-4 w-4 mr-2.5 text-[#500000]/70" />
                        Overview
                      </DropdownMenuItem>
                    </Link>
                    {canViewRegistrations && (
                      <Link href="/registrations">
                        <DropdownMenuItem className={isActive('/registrations') ? 'bg-[#500000]/10' : ''}>
                          <CalendarCheck className="h-4 w-4 mr-2.5 text-[#500000]/70" />
                          My Registrations
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {canViewEvents && (
                      <Link href="/sessions">
                        <DropdownMenuItem className={isActive('/sessions') ? 'bg-[#500000]/10' : ''}>
                          <Clock className="h-4 w-4 mr-2.5 text-[#500000]/70" />
                          My Sessions
                        </DropdownMenuItem>
                      </Link>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mentorship Link */}
                {canViewMentorship && (
                  <Link
                    href="/mentorship/dashboard"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      pathname.startsWith('/mentorship')
                        ? 'bg-[#500000] text-white shadow-md' 
                        : 'text-[#500000]/80 hover:bg-[#500000]/10 hover:text-[#500000]'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Mentorship
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Right Side - Role Badges & User Menu */}
        <div className="hidden lg:flex items-center gap-2">
          {user && !roleLoading && (
            <>
              {/* Sponsor Portal Badge */}
              {canViewSponsor && (
                <Link href="/sponsor/dashboard">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                  >
                    <Building2 className="h-4 w-4 mr-1.5" />
                    Sponsor
                  </Button>
                </Link>
              )}

              {/* Admin Portal Badge */}
              {canViewAdmin && (
                <Link href="/admin/dashboard">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#500000] bg-[#500000]/10 hover:bg-[#500000]/20 border border-[#500000]/20"
                  >
                    <Shield className="h-4 w-4 mr-1.5" />
                    Admin
                  </Button>
                </Link>
              )}

              {/* Separator before user menu */}
              <div className="h-6 w-px bg-[#500000]/15 mx-1" aria-hidden="true" />

              {/* User Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-[#500000] hover:bg-[#500000]/10 gap-2"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#500000] to-[#6b0000] flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#500000]">My Account</span>
                      {role && (
                        <span className="text-xs font-normal text-[#500000]/50 capitalize">{role}</span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2.5 text-[#500000]/70" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/profile/resume">
                    <DropdownMenuItem>
                      <Briefcase className="h-4 w-4 mr-2.5 text-[#500000]/70" />
                      Resume
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2.5" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Sign In / Sign Up for guests */}
          {!user && (
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
                  className="bg-gradient-to-r from-[#500000] to-[#6b0000] hover:from-[#5d0000] hover:to-[#7a0000] text-white shadow-md"
                >
                  <GraduationCap className="h-4 w-4 mr-1.5" />
                  Get Started
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
            className="container flex flex-col px-4 py-4"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {/* Primary Links */}
            <div className="flex flex-col gap-1">
              <span className="px-4 py-2 text-xs font-semibold text-[#500000]/50 uppercase tracking-wider">
                Explore
              </span>
              <Link
                href="/"
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive('/') 
                    ? 'bg-[#500000] text-white' 
                    : 'text-[#500000]/80 hover:bg-[#500000]/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/events"
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive('/events') 
                    ? 'bg-[#500000] text-white' 
                    : 'text-[#500000]/80 hover:bg-[#500000]/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                href="/competitions"
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive('/competitions') 
                    ? 'bg-[#500000] text-white' 
                    : 'text-[#500000]/80 hover:bg-[#500000]/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Competitions
              </Link>
            </div>

            {user && !roleLoading && (
              <>
                {/* Student Activities */}
                <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-[#500000]/10">
                  <span className="px-4 py-2 text-xs font-semibold text-[#500000]/50 uppercase tracking-wider">
                    Activities
                  </span>
                  <Link
                    href="/missions"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive('/missions') 
                        ? 'bg-[#500000] text-white' 
                        : 'text-[#500000]/80 hover:bg-[#500000]/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Target className="h-4 w-4" />
                    Missions
                  </Link>
                  <Link
                    href="/leaderboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive('/leaderboard') 
                        ? 'bg-[#500000] text-white' 
                        : 'text-[#500000]/80 hover:bg-[#500000]/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Trophy className="h-4 w-4" />
                    Leaderboard
                  </Link>
                </div>

                {/* My Dashboard */}
                <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-[#500000]/10">
                  <span className="px-4 py-2 text-xs font-semibold text-[#500000]/50 uppercase tracking-wider">
                    My Dashboard
                  </span>
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive('/dashboard') 
                        ? 'bg-[#500000] text-white' 
                        : 'text-[#500000]/80 hover:bg-[#500000]/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Overview
                  </Link>
                  {canViewRegistrations && (
                    <Link
                      href="/registrations"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive('/registrations') 
                          ? 'bg-[#500000] text-white' 
                          : 'text-[#500000]/80 hover:bg-[#500000]/10'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <CalendarCheck className="h-4 w-4" />
                      My Registrations
                    </Link>
                  )}
                  {canViewEvents && (
                    <Link
                      href="/sessions"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive('/sessions') 
                          ? 'bg-[#500000] text-white' 
                          : 'text-[#500000]/80 hover:bg-[#500000]/10'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Clock className="h-4 w-4" />
                      My Sessions
                    </Link>
                  )}
                </div>

                {/* Mentorship */}
                {canViewMentorship && (
                  <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-[#500000]/10">
                    <span className="px-4 py-2 text-xs font-semibold text-[#500000]/50 uppercase tracking-wider">
                      Mentorship
                    </span>
                    <Link
                      href="/mentorship/dashboard"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        pathname.startsWith('/mentorship')
                          ? 'bg-[#500000] text-white' 
                          : 'text-[#500000]/80 hover:bg-[#500000]/10'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Users className="h-4 w-4" />
                      Mentorship Dashboard
                    </Link>
                  </div>
                )}

                {/* Role-Specific Portals */}
                {(canViewSponsor || canViewAdmin) && (
                  <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-[#500000]/10">
                    <span className="px-4 py-2 text-xs font-semibold text-[#500000]/50 uppercase tracking-wider">
                      Portals
                    </span>
                    {canViewSponsor && (
                      <Link
                        href="/sponsor/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          pathname.startsWith('/sponsor')
                            ? 'bg-amber-100 text-amber-800' 
                            : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Building2 className="h-4 w-4" />
                        Sponsor Portal
                      </Link>
                    )}
                    {canViewAdmin && (
                      <Link
                        href="/admin/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          pathname.startsWith('/admin')
                            ? 'bg-[#500000] text-white' 
                            : 'text-[#500000] bg-[#500000]/10 hover:bg-[#500000]/20'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        Admin Portal
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Account Section */}
            <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-[#500000]/10">
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-[#500000] hover:bg-[#500000]/10"
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
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant="ghost" 
                      className="w-full text-[#500000] hover:bg-[#500000]/10"
                    >
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      className="w-full bg-gradient-to-r from-[#500000] to-[#6b0000] hover:from-[#5d0000] hover:to-[#7a0000] text-white"
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Get Started
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
