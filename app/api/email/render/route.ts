import { render } from '@react-email/render';
import { NextRequest, NextResponse } from 'next/server';
import { Legend8Plus } from '@/emails/Legend8Plus';
import { LoyalPartner } from '@/emails/LoyalPartner';
import { Comeback } from '@/emails/Comeback';
import { TopRecruiter } from '@/emails/TopRecruiter';
import { FirstTimerUpgrade } from '@/emails/FirstTimerUpgrade';
import { MentorHero } from '@/emails/MentorHero';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, props } = body;

    if (!template || !props) {
      return NextResponse.json(
        { error: 'Template name and props are required' },
        { status: 400 }
      );
    }

    let html: string;

    switch (template) {
      case 'legend-8-plus':
        html = await render(Legend8Plus(props));
        break;
      case 'loyal-partner':
        html = await render(LoyalPartner(props));
        break;
      case 'comeback':
        html = await render(Comeback(props));
        break;
      case 'top-recruiter':
        html = await render(TopRecruiter(props));
        break;
      case 'first-timer-upgrade':
        html = await render(FirstTimerUpgrade(props));
        break;
      case 'mentor-hero':
        html = await render(MentorHero(props));
        break;
      default:
        return NextResponse.json(
          { error: `Unknown template: ${template}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ html });
  } catch (error: any) {
    console.error('Error rendering email template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to render email template' },
      { status: 500 }
    );
  }
}

