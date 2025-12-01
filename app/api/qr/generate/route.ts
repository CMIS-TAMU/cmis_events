import { NextRequest, NextResponse } from 'next/server';
import { generateQRCodeDataURL } from '@/lib/qr/generate';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const data = searchParams.get('data');

    if (!data) {
      return NextResponse.json(
        { error: 'QR code data is required' },
        { status: 400 }
      );
    }

    // Generate QR code as data URL (base64 PNG)
    const qrDataURL = await generateQRCodeDataURL(data);

    // Convert data URL to buffer
    const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Return as PNG image
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

