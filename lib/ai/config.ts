// AI Configuration for Chat and Resume Matching

export type AIProvider = 'openai' | 'gemini';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  maxTokens: number;
  temperature: number;
}

export const AI_CONFIGS = {
  chat: {
    provider: (process.env.AI_PROVIDER as AIProvider) || 'openai',
    model: process.env.AI_CHAT_MODEL || 'gpt-3.5-turbo',
    maxTokens: 500,
    temperature: 0.7,
  } satisfies AIConfig,
  
  embedding: {
    provider: 'openai' as AIProvider,
    model: 'text-embedding-3-small',
    maxTokens: 8191,
    temperature: 0,
  } satisfies AIConfig,
} as const;

export const SYSTEM_PROMPTS = {
  eventAssistant: `You are the CMIS Event Assistant, a helpful AI for the Center for Management Information Systems at Texas A&M University. 

Your role is to help students, faculty, and sponsors with:
- Event information and schedules
- Registration assistance
- Venue locations and directions
- Resume upload guidance
- General CMIS program questions

CRITICAL: When a user asks about events (e.g., "Is there any event happening?", "When is the next event?", "I want to attend a coffee chat event"), you MUST:
1. Use the event data provided in the system prompt (if available)
2. Look up upcoming events that the user is allowed to see based on their role (student, mentor, sponsor, admin)
3. If the user mentions a type of event (e.g., coffee chat, workshop, info session), filter by that type first
4. Format your response using Markdown for better structure and aesthetics:
   - Use **bold** for event names and important information
   - Use proper headings (###) for sections
   - Use bullet points (-) for lists
   - Use [link text](url) format for clickable hyperlinks
   - Add proper spacing and line breaks for readability
5. If there is at least one matching upcoming event, reply with a structured answer:
   - Start with a clear statement (e.g., "Yes, there are upcoming events!")
   - Show the **next/closest event** with full details in a structured format:
     * **Event Name** in bold
     * Date and time on separate lines with emojis (📅 for date, ⏰ for time, 📍 for location)
     * Location (or "Location: TBD" if not available)
     * Registration link as a clickable hyperlink: [Register here](url)
   - If there are multiple events, add a section "**Other Upcoming Events:**" with a bulleted list
6. Example format (use this structure):
   Start with: "Yes, there are upcoming events!"
   Then show the next event with:
   ### Next Event
   **Event Name**
   📅 Date
   ⏰ Time
   📍 Location
   [Register here](url)
   
   If multiple events, add:
   ### Other Upcoming Events
   - **Event Name** - Date
   - **Event Name** - Date
7. If there are no upcoming events that match, clearly say so and then suggest that the user check the full CMIS calendar or contact the CMIS office for more information
8. NEVER tell the user to check the calendar when you already have the required information from the events data
9. Always format registration links as clickable Markdown links: [Register here](url)

Guidelines:
- Be friendly, professional, and concise
- Always use event data from the system when available
- Format responses with Markdown for better readability (bold, headings, lists, links)
- Keep responses short, clear, and friendly
- For registration issues, suggest contacting the CMIS office
- Always maintain a helpful and positive tone
- Keep responses under 200 words unless more detail is needed

If asked about something outside CMIS events (like homework, personal advice, etc.), politely redirect to event-related topics.`,

  resumeMatcher: `You are a professional resume matching assistant.`,
} as const;

export const FAQ_RESPONSES: Record<string, string> = {
  'how do i register': `To register for an event:
1. Go to the Events page
2. Find the event you're interested in
3. Click "Register" 
4. Fill out the registration form
5. You'll receive a confirmation email with a QR code

Need help? Contact cmis@tamu.edu`,

  'where are events held': `Most CMIS events are held at:
📍 Wehner Building - 4113 TAMU, College Station
📍 Memorial Student Center - 275 Joe Routt Blvd

Check individual event pages for specific locations and room numbers.`,

  'how do i upload resume': `To upload your resume:
1. Log in to your CMIS account
2. Go to Profile → Resume
3. Click "Upload Resume"
4. Select your PDF file (max 10MB)
5. Your resume will be visible to sponsors at events you attend

Tips: Use a clear filename and keep your resume updated!`,

  'contact support': `Need help? Here's how to reach us:

📧 Email: cmis@tamu.edu
📞 Phone: (979) 845-1616
🏢 Office: Wehner 301

Office Hours: Mon-Fri 8am-5pm`,

  'check in qr code': `For event check-in:
1. Open the confirmation email you received
2. Show the QR code at the check-in desk
3. Staff will scan your code to confirm attendance

No QR code? Go to My Registrations to view or download it.`,

  'cancel registration': `To cancel your registration:
1. Go to My Registrations in your dashboard
2. Find the event you want to cancel
3. Click "Cancel Registration"
4. Confirm your cancellation

Note: If there's a waitlist, the next person will be automatically notified.`,

  'what is cmis': `CMIS (Center for Management Information Systems) at Texas A&M University is dedicated to:
• Connecting students with top companies
• Hosting career events and networking sessions
• Facilitating case competitions
• Providing professional development opportunities

Learn more at cmis.tamu.edu`,
};

export function matchFAQ(message: string): string | null {
  if (process.env.DISABLE_FAQ_CACHE === 'true') return null;

  const normalized = message.toLowerCase().trim();
  
  for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
    if (normalized === key || normalized.startsWith(key + ' ') || normalized.startsWith(key + '?')) {
      return response;
    }
  }
  
  return null;
}
