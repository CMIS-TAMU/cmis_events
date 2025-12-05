import { render } from '@react-email/render';
import type { ReactElement } from 'react';
import { sendBrevoEmail } from '@/server/brevoEmail';

const fromEmailAddress = process.env.BREVO_FROM_EMAIL;
const fromName = process.env.BREVO_FROM_NAME || 'CMIS Events';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!fromEmailAddress) {
  console.warn('BREVO_FROM_EMAIL is not set. Email functionality will be disabled.');
}

// ============================================================================
// TYPES
// ============================================================================

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react?: ReactElement;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
  metadata?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    type?: string;
  }>;
}

export interface SendEmailResult {
  success: boolean;
  data?: {
    id: string;
  };
  error?: unknown;
  retryAfter?: number;
}

export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  retryableErrors?: string[];
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export enum EmailErrorType {
  RATE_LIMIT = 'rate_limit',
  INVALID_EMAIL = 'invalid_email',
  NETWORK_ERROR = 'network_error',
  TEMPORARY_FAILURE = 'temporary_failure',
  PERMANENT_FAILURE = 'permanent_failure',
  UNKNOWN = 'unknown',
}

export function categorizeError(error: unknown): {
  type: EmailErrorType;
  retryable: boolean;
  retryAfter?: number;
} {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = errorMessage.toLowerCase();

  // Rate limit errors
  if (errorString.includes('rate limit') || errorString.includes('429')) {
    return {
      type: EmailErrorType.RATE_LIMIT,
      retryable: true,
      retryAfter: 60000, // 1 minute
    };
  }

  // Invalid email errors
  if (
    errorString.includes('invalid email') ||
    errorString.includes('invalid recipient') ||
    errorString.includes('bounce')
  ) {
    return {
      type: EmailErrorType.INVALID_EMAIL,
      retryable: false,
    };
  }

  // Network errors
  if (
    errorString.includes('network') ||
    errorString.includes('timeout') ||
    errorString.includes('econnrefused')
  ) {
    return {
      type: EmailErrorType.NETWORK_ERROR,
      retryable: true,
      retryAfter: 5000, // 5 seconds
    };
  }

  // Temporary failures
  if (
    errorString.includes('temporary') ||
    errorString.includes('503') ||
    errorString.includes('502')
  ) {
    return {
      type: EmailErrorType.TEMPORARY_FAILURE,
      retryable: true,
      retryAfter: 15000, // 15 seconds
    };
  }

  // Default to unknown, but retryable
  return {
    type: EmailErrorType.UNKNOWN,
    retryable: true,
    retryAfter: 10000, // 10 seconds
  };
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendWithRetry(
  options: SendEmailOptions,
  attempt: number = 1,
  config: RetryConfig = {}
): Promise<SendEmailResult> {
  const maxRetries = config.maxRetries || 3;
  const retryDelay = config.retryDelay || 10000;

  try {
    if (!fromEmailAddress) {
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    // Render React component to HTML if provided
    let html = options.html;
    let text = options.text;

    if (options.react) {
      html = await render(options.react);
      // Generate plain text version (basic)
      text = text || html.replace(/<[^>]*>/g, '').trim();
    }

    // Parse from email if provided
    let fromEmailValue = fromEmailAddress;
    let fromNameValue = fromName;
    
    if (options.from) {
      const fromMatch = options.from.match(/^(.+?)\s*<(.+?)>$/);
      if (fromMatch) {
        fromNameValue = fromMatch[1].trim();
        fromEmailValue = fromMatch[2].trim();
      } else {
        fromEmailValue = options.from;
      }
    }

    // Note: Brevo SMTP doesn't support replyTo, tags, or attachments in the same way
    // These are logged but not sent
    if (options.replyTo) {
      console.log('[Brevo] replyTo not supported via SMTP:', options.replyTo);
    }
    if (options.tags) {
      console.log('[Brevo] tags not supported via SMTP:', options.tags);
    }
    if (options.attachments) {
      console.log('[Brevo] attachments not supported in current implementation');
    }

    await sendBrevoEmail({
      to: options.to,
      subject: options.subject,
      html: html || '',
      text: text,
      fromEmail: fromEmailValue,
      fromName: fromNameValue,
    });

    const data = { id: 'sent' };
    const error = null;

    if (error) {
      const errorInfo = categorizeError(error);

      // Don't retry if not retryable
      if (!errorInfo.retryable || attempt >= maxRetries) {
        return {
          success: false,
          error,
          retryAfter: errorInfo.retryAfter,
        };
      }

      // Wait before retry
      const delay = errorInfo.retryAfter || retryDelay * attempt;
      await sleep(delay);

      // Retry
      return sendWithRetry(options, attempt + 1, config);
    }

    return {
      success: true,
      data: data || undefined,
    };
  } catch (error: unknown) {
    const errorInfo = categorizeError(error);

    // Don't retry if not retryable or max retries reached
    if (!errorInfo.retryable || attempt >= maxRetries) {
      return {
        success: false,
        error,
        retryAfter: errorInfo.retryAfter,
      };
    }

    // Wait before retry
    const delay = errorInfo.retryAfter || retryDelay * attempt;
    await sleep(delay);

    // Retry
    return sendWithRetry(options, attempt + 1, config);
  }
}

// ============================================================================
// EMAIL TRACKING
// ============================================================================

export function generateTrackingPixelUrl(logId: string): string {
  return `${appUrl}/api/communications/track-email?logId=${logId}&action=open`;
}

export function generateTrackingLinkUrl(
  logId: string,
  originalUrl: string
): string {
  return `${appUrl}/api/communications/track-email?logId=${logId}&action=click&url=${encodeURIComponent(originalUrl)}`;
}

// ============================================================================
// MAIN SEND FUNCTION
// ============================================================================

/**
 * Send email with retry logic and error handling
 */
export async function sendEmail(
  options: SendEmailOptions,
  retryConfig?: RetryConfig
): Promise<SendEmailResult> {
  return sendWithRetry(options, 1, retryConfig);
}

/**
 * Send bulk emails with rate limiting
 */
export async function sendBulkEmails(
  emails: SendEmailOptions[],
  options: {
    batchSize?: number;
    delayBetweenBatches?: number;
    retryConfig?: RetryConfig;
  } = {}
): Promise<Array<{ email: SendEmailOptions; result: SendEmailResult }>> {
  const batchSize = options.batchSize || 10;
  const delayBetweenBatches = options.delayBetweenBatches || 1000;
  const results: Array<{ email: SendEmailOptions; result: SendEmailResult }> = [];

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    // Send batch in parallel
    const batchResults = await Promise.all(
      batch.map(async (email) => ({
        email,
        result: await sendEmail(email, options.retryConfig),
      }))
    );

    results.push(...batchResults);

    // Wait between batches to avoid rate limits
    if (i + batchSize < emails.length) {
      await sleep(delayBetweenBatches);
    }
  }

  return results;
}
