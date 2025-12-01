import { NextRequest, NextResponse } from 'next/server';
import { checkInWithQR } from '@/lib/qr/checkin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrData } = body;

    if (!qrData) {
      return NextResponse.json(
        { error: 'QR code data is required' },
        { status: 400 }
      );
    }

    const result = await checkInWithQR(qrData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, registration: result.registration },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      registration: result.registration,
    });
  } catch (error: any) {
    console.error('Check-in API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

