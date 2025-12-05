import { NextRequest, NextResponse } from 'next/server';
import { trackEmailOpen, trackEmailClick } from '@/lib/services/email-service';

export const dynamic = 'force-dynamic';

/**
 * Track email opens and clicks
 * This endpoint is called when users interact with tracking pixels/links in emails
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const logId = searchParams.get('logId');
    const action = searchParams.get('action'); // 'open' or 'click'

    if (!logId) {
      return NextResponse.json({ error: 'logId is required' }, { status: 400 });
    }

    if (action === 'open') {
      await trackEmailOpen(logId);
      // Return 1x1 transparent pixel
      const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      );
      return new NextResponse(pixel, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } else if (action === 'click') {
      await trackEmailClick(logId);
      // Redirect to original URL if provided
      const redirectUrl = searchParams.get('url') || '/';
      return NextResponse.redirect(redirectUrl);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error tracking email:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


