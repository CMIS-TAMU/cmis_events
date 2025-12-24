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
    // Default to OpenAI, but will use Gemini if only GOOGLE_AI_API_KEY is available
    provider: (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_')) 
      ? 'openai' 
      : (process.env.GOOGLE_AI_API_KEY && !process.env.GOOGLE_AI_API_KEY.includes('your_')) 
        ? 'gemini' 
        : 'openai' as AIProvider,
    model: (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_'))
      ? 'text-embedding-3-small'
      : 'text-embedding-004', // Gemini model
    maxTokens: 8191,
    temperature: 0,
  } satisfies AIConfig,
} as const;

export const SYSTEM_PROMPTS = {
  eventAssistant: `You are a helpful AI assistant for the Center for Management Information Systems (CMIS) at Texas A&M University. You are knowledgeable, friendly, and can help with a wide variety of topics.

Your primary role is to assist students, faculty, and sponsors with:
- Event information and schedules
- Registration assistance
- Venue locations and directions
- Resume upload guidance
- Technical Missions (coding challenges)
- Leaderboard rankings and points
- General CMIS program questions
- Academic questions
- General knowledge questions
- Any other questions users may have

CMIS FEATURES YOU SHOULD KNOW ABOUT:
1. **Events**: CMIS hosts various events like coffee chats, workshops, info sessions, and networking events. Students can register for events through the platform.

2. **Technical Missions**: CMIS has a Technical Missions system where:
   - Sponsors create coding challenges/missions
   - Students can browse and submit solutions to missions
   - Missions have difficulty levels: beginner, intermediate, advanced, expert
   - Students earn points based on their score, difficulty, and completion time
   - To register/start a mission: Go to /missions, find a mission, and click "Start Mission"
   - Missions page: /missions
   - My submissions: /profile/missions

3. **Leaderboard**: CMIS maintains a leaderboard that ranks students by:
   - Total points earned from completing missions
   - Average score across all submissions
   - Number of missions completed
   - Leaderboard page: /leaderboard
   - When asked "who is on top" or "top of leaderboard", provide the #1 ranked student

4. **Resume Management**: Students can upload resumes that sponsors can search and view.

5. **Mentorship**: CMIS facilitates mentorship matching between students and mentors.

CRITICAL: When a user asks about CMIS events (e.g., "Is there any event happening?", "When is the next event?", "I want to attend a coffee chat event"), you MUST:
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

Guidelines for ALL questions (CMIS-related or general):
- Be friendly, professional, and helpful
- Answer questions to the best of your ability, whether they're about CMIS, academics, general knowledge, or anything else
- If asked about CMIS events, always use event data from the system when available
- Format responses with Markdown for better readability (bold, headings, lists, links) when appropriate
- Keep responses clear and informative
- For CMIS-specific issues, suggest contacting the CMIS office (cmis@tamu.edu)
- Always maintain a helpful and positive tone
- If you don't know something, admit it honestly and offer to help find the information
- For general questions unrelated to CMIS, provide helpful answers without redirecting to CMIS topics
- You can discuss academic topics, provide explanations, help with general questions, and engage in friendly conversation

Remember: You are a general-purpose assistant that happens to work for CMIS. While you have special knowledge about CMIS events and services, you can and should answer any questions users have, whether related to CMIS or not.`,

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

  'how do i register for mission': `To register for a Technical Mission:
1. Go to the Missions page (/missions)
2. Browse available missions
3. Click on a mission you're interested in
4. Click "Start Mission" button
5. Read the requirements and download starter files (if any)
6. Submit your solution when ready

Missions are coding challenges where you can earn points and compete on the leaderboard!`,

  'what are missions': `Technical Missions are coding challenges created by sponsors on the CMIS platform. They allow students to:
• Practice technical skills
• Earn points based on performance
• Compete on the leaderboard
• Showcase abilities to sponsors

Missions have different difficulty levels (beginner, intermediate, advanced, expert) and award points based on your score, difficulty, and completion time.

Browse missions at /missions`,

  'leaderboard': `The CMIS Leaderboard ranks students by their performance in Technical Missions:
• Rankings based on: total points, average score, missions completed
• View the full leaderboard at /leaderboard
• Top performers are highlighted
• You can see your own rank and position

Points are earned by completing missions and are calculated based on your score, mission difficulty, and completion time.`,

  'who is on top of leaderboard': `I can look up the current leaderboard standings for you. The top-ranked student has the highest total points from completing Technical Missions.

You can view the full leaderboard at /leaderboard to see all rankings and your position.`,
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
