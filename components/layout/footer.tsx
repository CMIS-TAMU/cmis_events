import Link from 'next/link';
import { Calendar, GraduationCap, Building2, Mail, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#500000] text-white">
      {/* Main Footer Content */}
      <div className="container px-4 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">CMIS Events</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              Event management platform for the Center for Management and Information Systems at Texas A&M University&apos;s Mays Business School.
            </p>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <GraduationCap className="h-4 w-4" />
              <span>Mays Business School</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-white/30 rounded-full" />
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/events" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">Browse Events</span>
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">Case Competitions</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">Leaderboard</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-white/30 rounded-full" />
              Get Involved
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/be-a-sponsor" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <Building2 className="h-3.5 w-3.5 mr-1" />
                  <span className="group-hover:translate-x-1 transition-transform">Become a Sponsor</span>
                </Link>
              </li>
              <li>
                <Link href="/be-a-mentor" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">Become a Mentor</span>
                </Link>
              </li>
              <li>
                <Link href="/mentorship/dashboard" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">Mentorship Program</span>
                </Link>
              </li>
              <li>
                <Link href="/missions" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">Technical Missions</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-white/30 rounded-full" />
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-white/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Mays Business School<br />
                  Texas A&M University<br />
                  College Station, TX 77843
                </span>
              </li>
              <li>
                <a href="mailto:cmis@mays.tamu.edu" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  cmis@mays.tamu.edu
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <p>&copy; {currentYear} CMIS at Texas A&M University. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
