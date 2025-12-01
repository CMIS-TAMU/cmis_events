import { createClient } from '@supabase/supabase-js';
import { verifyQRToken, parseQRData } from './generate';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface CheckInResult {
  success: boolean;
  message: string;
  registration?: any;
}

/**
 * Check in a user using QR code data
 */
export async function checkInWithQR(qrData: string): Promise<CheckInResult> {
  try {
    const parsed = parseQRData(qrData);
    if (!parsed) {
      return {
        success: false,
        message: 'Invalid QR code format',
      };
    }

    const { registrationId, token } = parsed;

    // Get registration from database
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select(`
        *,
        events (*),
        users:user_id (
          id,
          email,
          full_name
        )
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      return {
        success: false,
        message: 'Registration not found',
      };
    }

    // Verify token using stored QR code token or verify against generated token
    let isValid = false;
    if (registration.qr_code_token) {
      // If QR code token exists in DB, compare directly
      isValid = `${registrationId}:${token}` === registration.qr_code_token;
    } else {
      // Otherwise verify using the token generation function
      isValid = verifyQRToken(
        `${registrationId}:${token}`,
        registration.id,
        registration.event_id,
        registration.user_id
      );
    }

    if (!isValid) {
      return {
        success: false,
        message: 'Invalid QR code',
      };
    }

    // Check if already checked in
    if (registration.status === 'checked_in') {
      return {
        success: false,
        message: 'Already checked in',
        registration,
      };
    }

    // Check if cancelled
    if (registration.status === 'cancelled') {
      return {
        success: false,
        message: 'Registration was cancelled',
        registration,
      };
    }

    // Update status to checked_in
    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({ 
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
      })
      .eq('id', registrationId);

    if (updateError) {
      return {
        success: false,
        message: `Failed to check in: ${updateError.message}`,
      };
    }

    return {
      success: true,
      message: 'Successfully checked in',
      registration: {
        ...registration,
        status: 'checked_in',
      },
    };
  } catch (error: any) {
    console.error('Check-in error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred during check-in',
    };
  }
}

