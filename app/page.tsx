'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ArrowRight, Users, Trophy, Briefcase, GraduationCap, Sparkles, Building2, Star, ChevronRight } from 'lucide-react';
import { EventCard } from '@/components/events/event-card';
import { trpc } from '@/lib/trpc/trpc';

export default function Home() {
  const { data: upcomingEvents, isLoading } = trpc.events.getAll.useQuery({
    limit: 3,
    upcoming: true,
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section with Texas A&M Spirit */}
      <section className="relative overflow-hidden bg-[#500000] min-h-[85vh] flex items-center">
        {/* Animated background patterns */}
        <div className="absolute inset-0">
          {/* Geometric shapes */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          
          {/* Diamond pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="diamonds" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M30 0L60 30L30 60L0 30Z" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#diamonds)" />
            </svg>
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm mb-8">
              <GraduationCap className="h-4 w-4" />
              <span className="font-medium">Mays Business School • Texas A&M University</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
              CMIS
              <span className="block text-3xl md:text-4xl lg:text-5xl font-medium text-white/90 mt-2">
                Event Management System
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-white/80 mb-4 max-w-3xl mx-auto font-light">
              Center for Management & Information Systems
            </p>
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
              Connect with industry leaders, develop your skills, and build your future in the world of business technology.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <Button size="lg" className="bg-white text-[#500000] hover:bg-white/90 font-semibold text-lg px-8 py-6 group">
                  Explore Events
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/be-a-sponsor">
                <Button size="lg" className="bg-white/10 border-2 border-white text-white hover:bg-white/20 font-semibold text-lg px-8 py-6">
                  <Building2 className="mr-2 h-5 w-5" />
                  Partner With Us
                </Button>
              </Link>
              <Link href="/be-a-mentor">
                <Button size="lg" className="bg-white/10 border-2 border-white text-white hover:bg-white/20 font-semibold text-lg px-8 py-6">
                  <Users className="mr-2 h-5 w-5" />
                  Become a Mentor
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-1">500+</div>
                <div className="text-white/70 text-sm md:text-base">Active Members</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-4xl md:text-5xl font-bold text-white mb-1">50+</div>
                <div className="text-white/70 text-sm md:text-base">Events Per Year</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-1">100+</div>
                <div className="text-white/70 text-sm md:text-base">Industry Partners</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#500000] mb-4">
              Why Join CMIS?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Empowering future business leaders through technology, mentorship, and real-world experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Trophy,
                title: 'Case Competitions',
                description: 'Compete against top students and showcase your problem-solving skills to industry leaders',
              },
              {
                icon: Briefcase,
                title: 'Career Development',
                description: 'Exclusive access to sponsor companies, resume reviews, and mock interviews',
              },
              {
                icon: Users,
                title: 'Mentorship Program',
                description: 'Connect with experienced professionals who guide your career journey',
              },
              {
                icon: Sparkles,
                title: 'Technical Missions',
                description: 'Hands-on challenges that build practical skills employers value most',
              }
            ].map((feature, idx) => (
              <Card key={idx} className="border shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#500000] to-[#800000] flex items-center justify-center mb-4 shadow-lg">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl text-[#500000]">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-8 bg-[#500000] rounded-full" />
                <h2 className="text-4xl md:text-5xl font-bold text-[#500000]">
                  Upcoming Events
                </h2>
              </div>
              <p className="text-muted-foreground text-lg ml-5">
                Don&apos;t miss these opportunities to grow and connect
              </p>
            </div>
            <Link href="/events">
              <Button variant="outline" className="border-[#500000] text-[#500000] hover:bg-[#500000] hover:text-white font-semibold group">
                View All Events
                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {isLoading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-3 text-muted-foreground">
                <div className="w-5 h-5 border-2 border-[#500000] border-t-transparent rounded-full animate-spin" />
                <span>Loading events...</span>
              </div>
            </div>
          )}

          {!isLoading && upcomingEvents && upcomingEvents.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          {!isLoading && (!upcomingEvents || upcomingEvents.length === 0) && (
            <Card className="p-16 border-dashed border-2 border-[#500000]/20 bg-[#500000]/5">
              <CardContent className="text-center">
                <div className="w-20 h-20 rounded-full bg-[#500000]/10 flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-[#500000]/60" />
                </div>
                <CardTitle className="text-2xl mb-3 text-[#500000]">No Upcoming Events</CardTitle>
                <CardDescription className="text-base max-w-md mx-auto">
                  We&apos;re planning exciting new events. Check back soon or browse our past events!
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Call to Action Cards */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Browse Events Card */}
            <Card className="group overflow-hidden border shadow-xl hover:shadow-2xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-[#500000] to-[#800000]" />
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-[#500000]/10 flex items-center justify-center mb-3 group-hover:bg-[#500000] transition-colors">
                  <Calendar className="h-6 w-6 text-[#500000] group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-2xl text-[#500000]">Browse Events</CardTitle>
                <CardDescription className="text-base">
                  Explore workshops, networking sessions, and career fairs designed for your success
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/events">
                  <Button className="w-full bg-[#500000] hover:bg-[#6b0000] text-white font-semibold group">
                    View Events
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Dashboard Card */}
            <Card className="group overflow-hidden border shadow-xl hover:shadow-2xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-[#6b0000] to-[#500000]" />
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-[#500000]/10 flex items-center justify-center mb-3 group-hover:bg-[#500000] transition-colors">
                  <Star className="h-6 w-6 text-[#500000] group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-2xl text-[#500000]">My Dashboard</CardTitle>
                <CardDescription className="text-base">
                  Track your registrations, view achievements, and manage your CMIS profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard">
                  <Button className="w-full bg-[#500000] hover:bg-[#6b0000] text-white font-semibold group">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Get Started Card */}
            <Card className="group overflow-hidden border shadow-xl hover:shadow-2xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-[#800000] to-[#6b0000]" />
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-[#500000]/10 flex items-center justify-center mb-3 group-hover:bg-[#500000] transition-colors">
                  <GraduationCap className="h-6 w-6 text-[#500000] group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-2xl text-[#500000]">Get Started</CardTitle>
                <CardDescription className="text-base">
                  Join the CMIS community and unlock exclusive opportunities for Aggies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/signup">
                  <Button className="w-full bg-[#500000] hover:bg-[#6b0000] text-white font-semibold group">
                    Sign Up Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Spirit Section */}
      <section className="py-20 bg-[#500000] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-10 left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              From Good Bull to Great Careers
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              At CMIS, we believe in the Aggie spirit of excellence, integrity, and leadership. 
              Join a community that transforms students into tomorrow&apos;s industry leaders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-[#500000] hover:bg-white/90 font-bold text-lg px-10 py-6 shadow-xl">
                  Join CMIS Today
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" className="bg-white/10 border-2 border-white text-white hover:bg-white/20 font-semibold text-lg px-10 py-6">
                  Explore Opportunities
                </Button>
              </Link>
            </div>
            
            {/* Gig 'em */}
            <div className="mt-16 pt-10 border-t border-white/20">
              <p className="text-3xl md:text-4xl font-bold text-white tracking-wider">
                Gig &apos;em, Aggies! 👍
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
