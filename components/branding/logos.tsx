'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

// Logo paths - these should match the files in public/images/logos/
export const LOGO_PATHS = {
  cmisLogo: '/images/logos/cmis-logo.png',        // CMIS Mays logo (maroon background)
  tamuSeal: '/images/logos/tamu-seal.png',         // Texas A&M University official seal
  atmMays: '/images/logos/atm-mays.png',           // ATM Mays two-tone logo
  maysHorizontal: '/images/logos/mays-horizontal.png', // Horizontal Mays Business School logo
} as const;

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
}

const sizeMap = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 96, height: 96 },
};

// Texas A&M ATM Logo Component
export function TAMULogo({ className, size = 'md' }: LogoProps) {
  const dimensions = sizeMap[size];
  return (
    <Image
      src={LOGO_PATHS.atmMays}
      alt="Texas A&M University"
      width={dimensions.width}
      height={dimensions.height}
      className={cn('object-contain', className)}
      priority
    />
  );
}

// Texas A&M Seal Component
export function TAMUSeal({ className, size = 'md' }: LogoProps) {
  const dimensions = sizeMap[size];
  return (
    <Image
      src={LOGO_PATHS.tamuSeal}
      alt="Texas A&M University Seal"
      width={dimensions.width}
      height={dimensions.height}
      className={cn('object-contain', className)}
      priority
    />
  );
}

// CMIS Logo Component
export function CMISLogo({ className, size = 'md' }: LogoProps) {
  const dimensions = sizeMap[size];
  return (
    <Image
      src={LOGO_PATHS.cmisLogo}
      alt="CMIS - Mays Business School"
      width={dimensions.width}
      height={dimensions.height}
      className={cn('object-contain', className)}
      priority
    />
  );
}

// Mays Business School Horizontal Logo
export function MaysLogo({ className }: { className?: string }) {
  return (
    <Image
      src={LOGO_PATHS.maysHorizontal}
      alt="Mays Business School - Texas A&M University"
      width={200}
      height={48}
      className={cn('object-contain', className)}
      priority
    />
  );
}

// Combined ATM Brand Mark with Text
export function ATMBrandMark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="w-10 h-10 bg-[#500000] rounded flex items-center justify-center overflow-hidden">
        <Image
          src={LOGO_PATHS.atmMays}
          alt="Texas A&M"
          width={40}
          height={40}
          className="object-cover"
          priority
        />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-bold text-lg tracking-tight text-[#500000]">CMIS Events</span>
        <span className="text-[10px] font-medium text-[#500000]/60 tracking-wide uppercase">
          Mays Business School
        </span>
      </div>
    </div>
  );
}

