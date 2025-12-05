import Link from 'next/link';
import { Building2, Mail, MapPin, ExternalLink } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#500000] text-white">
      {/* Main Footer Content */}
      <div className="container px-4 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logos/atm-mays.jpg"
                  alt="Texas A&M University"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight">CMIS Events</span>
                <span className="text-xs text-white/60 uppercase tracking-wider">Mays Business School</span>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              Event management platform for the Center for Management and Information Systems at Texas A&M University&apos;s Mays Business School.
            </p>
            {/* University Seal */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white p-1 shadow-md overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logos/tamu-seal.png"
                  alt="Texas A&M University Seal"
                  width={52}
                  height={52}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="text-xs text-white/60 leading-tight">
                <div className="font-semibold text-white/80">Texas A&M University</div>
                <div>Est. 1876</div>
              </div>
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

      {/* Official Links Bar */}
      <div className="border-t border-white/10 bg-[#3d0000]">
        <div className="container px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/50">
            <a 
              href="https://mays.tamu.edu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors inline-flex items-center gap-1"
            >
              Mays Business School
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="hidden sm:inline">•</span>
            <a 
              href="https://www.tamu.edu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors inline-flex items-center gap-1"
            >
              Texas A&M University
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="hidden sm:inline">•</span>
            <a 
              href="https://cmis.tamu.edu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors inline-flex items-center gap-1"
            >
              CMIS Official Site
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logos/mays-horizontal.png"
                alt="Mays Business School"
                width={150}
                height={36}
                className="object-contain brightness-0 invert opacity-70"
              />
            </div>
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
