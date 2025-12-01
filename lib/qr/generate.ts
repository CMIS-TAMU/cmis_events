import QRCode from 'qrcode';
import crypto from 'crypto';

const QR_SECRET = process.env.QR_CODE_SECRET || 'default-secret-change-in-production';

/**
 * Generate a secure token for QR code
 */
export function generateQRToken(registrationId: string, eventId: string, userId: string): string {
  const payload = `${registrationId}:${eventId}:${userId}`;
  const hmac = crypto.createHmac('sha256', QR_SECRET);
  hmac.update(payload);
  const token = hmac.digest('hex');
  
  // Return a compact format: registrationId:token
  return `${registrationId}:${token.substring(0, 16)}`;
}

/**
 * Verify QR token
 */
export function verifyQRToken(token: string, registrationId: string, eventId: string, userId: string): boolean {
  const expectedToken = generateQRToken(registrationId, eventId, userId);
  return token === expectedToken;
}

/**
 * Generate QR code data URL (base64 image)
 */
export async function generateQRCodeDataURL(data: string): Promise<string> {
  try {
    const qrDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
    });
    return qrDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code SVG string
 */
export async function generateQRCodeSVG(data: string): Promise<string> {
  try {
    const qrSVG = await QRCode.toString(data, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 2,
    });
    return qrSVG;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw new Error('Failed to generate QR code SVG');
  }
}

/**
 * Parse QR code data
 */
export function parseQRData(qrData: string): { registrationId: string; token: string } | null {
  const parts = qrData.split(':');
  if (parts.length !== 2) {
    return null;
  }
  return {
    registrationId: parts[0],
    token: parts[1],
  };
}

