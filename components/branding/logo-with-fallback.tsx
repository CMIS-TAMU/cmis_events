'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LogoWithFallbackProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
  priority?: boolean;
}

/**
 * Logo component with fallback for when the image file doesn't exist yet.
 * Displays a styled fallback (like ATM text or icon) when image fails to load.
 */
export function LogoWithFallback({
  src,
  alt,
  width,
  height,
  className,
  fallbackIcon,
  priority = false,
}: LogoWithFallbackProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    // Render fallback
    if (fallbackIcon) {
      return <>{fallbackIcon}</>;
    }

    // Default fallback: styled ATM text in maroon
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-[#500000] text-white font-bold',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-xs">A&M</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setImageError(true)}
    />
  );
}

// Pre-configured logo components
export function TAMULogoWithFallback({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <LogoWithFallback
      src="/images/logos/atm-mays.png"
      alt="Texas A&M University"
      width={size}
      height={size}
      className={cn('object-contain', className)}
      priority
      fallbackIcon={
        <div
          className={cn(
            'flex items-center justify-center bg-[#500000] text-white font-bold rounded-lg',
            className
          )}
          style={{ width: size, height: size }}
        >
          <span style={{ fontSize: size * 0.25 }}>ATM</span>
        </div>
      }
    />
  );
}

export function TAMUSealWithFallback({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <LogoWithFallback
      src="/images/logos/tamu-seal.png"
      alt="Texas A&M University Seal"
      width={size}
      height={size}
      className={cn('object-contain', className)}
      priority
      fallbackIcon={
        <div
          className={cn(
            'flex items-center justify-center bg-white border-4 border-[#500000] text-[#500000] font-bold rounded-full',
            className
          )}
          style={{ width: size, height: size }}
        >
          <span style={{ fontSize: size * 0.2 }}>1876</span>
        </div>
      }
    />
  );
}

export function CMISLogoWithFallback({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <LogoWithFallback
      src="/images/logos/cmis-logo.png"
      alt="CMIS - Mays Business School"
      width={size}
      height={size}
      className={cn('object-contain rounded', className)}
      priority
      fallbackIcon={
        <div
          className={cn(
            'flex items-center justify-center bg-[#500000] text-white font-bold rounded',
            className
          )}
          style={{ width: size, height: size }}
        >
          <div className="text-center leading-tight">
            <span style={{ fontSize: size * 0.2 }}>CMIS</span>
          </div>
        </div>
      }
    />
  );
}

export function MaysLogoWithFallback({ className }: { className?: string }) {
  return (
    <LogoWithFallback
      src="/images/logos/mays-horizontal.png"
      alt="Mays Business School - Texas A&M University"
      width={200}
      height={48}
      className={cn('object-contain', className)}
      priority
      fallbackIcon={
        <div className={cn('text-center', className)}>
          <div className="font-bold text-sm">MAYS BUSINESS SCHOOL</div>
          <div className="text-xs opacity-70">Texas A&M University</div>
        </div>
      }
    />
  );
}

