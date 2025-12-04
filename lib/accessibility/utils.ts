/**
 * Accessibility Utilities
 * Helper functions for improving accessibility throughout the app
 */

/**
 * Generate ARIA label from text content
 */
export function getAriaLabel(text: string, context?: string): string {
  if (context) {
    return `${text} ${context}`;
  }
  return text;
}

/**
 * Generate ARIA described by ID
 */
export function getAriaDescribedBy(...ids: (string | undefined)[]): string | undefined {
  const validIds = ids.filter((id): id is string => !!id);
  return validIds.length > 0 ? validIds.join(' ') : undefined;
}

/**
 * Generate unique ID for accessibility
 */
export function generateId(prefix: string = 'acc'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Check if user is likely using a screen reader
 * (Based on reduced motion preferences)
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Announce to screen readers via live region
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return;

  const announcer = document.getElementById('aria-live-announcer') || createLiveRegion(priority);
  
  // Clear and set message
  announcer.textContent = '';
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
}

/**
 * Create aria-live region for announcements
 */
function createLiveRegion(priority: 'polite' | 'assertive'): HTMLElement {
  const announcer = document.createElement('div');
  announcer.id = 'aria-live-announcer';
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;';
  document.body.appendChild(announcer);
  return announcer;
}

/**
 * Get keyboard shortcut description
 */
export function getKeyboardShortcut(key: string, mod?: 'ctrl' | 'cmd' | 'alt' | 'shift'): string {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl';
  
  if (mod === 'cmd' || mod === 'ctrl') {
    return `${modKey}+${key.toUpperCase()}`;
  }
  if (mod === 'alt') {
    return `Alt+${key.toUpperCase()}`;
  }
  if (mod === 'shift') {
    return `Shift+${key.toUpperCase()}`;
  }
  return key.toUpperCase();
}

/**
 * Focus trap utility for modals
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }

  element.addEventListener('keydown', handleTabKey);
  firstElement?.focus();

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

