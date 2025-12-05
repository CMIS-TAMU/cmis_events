// ============================================================================
// SEND SCHEDULER
// ============================================================================

export type TimeWindow = 'morning' | 'lunch' | 'afternoon' | 'end_of_day';

export interface TimeWindowConfig {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

const TIME_WINDOWS: Record<TimeWindow, TimeWindowConfig> = {
  morning: { start: '09:00', end: '10:00' },
  lunch: { start: '12:00', end: '13:00' },
  afternoon: { start: '14:00', end: '15:30' },
  end_of_day: { start: '16:00', end: '17:30' },
};

// ============================================================================
// TIME CALCULATION
// ============================================================================

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to Date
 */
function minutesToDate(minutes: number, baseDate: Date): Date {
  const date = new Date(baseDate);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  date.setHours(hours, mins, 0, 0);
  return date;
}

/**
 * Check if date is a weekend
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Check if date is a holiday (basic US holidays)
 */
function isHoliday(date: Date): boolean {
  const month = date.getMonth();
  const day = date.getDate();

  // New Year's Day
  if (month === 0 && day === 1) return true;
  // Independence Day
  if (month === 6 && day === 4) return true;
  // Christmas
  if (month === 11 && day === 25) return true;
  // Thanksgiving (4th Thursday of November)
  if (month === 10) {
    const thanksgiving = getThanksgivingDate(date.getFullYear());
    if (date.getTime() === thanksgiving.getTime()) return true;
  }

  return false;
}

/**
 * Get Thanksgiving date (4th Thursday of November)
 */
function getThanksgivingDate(year: number): Date {
  const nov1 = new Date(year, 10, 1);
  const dayOfWeek = nov1.getDay();
  const daysToAdd = dayOfWeek <= 4 ? 25 - dayOfWeek : 32 - dayOfWeek;
  return new Date(year, 10, 1 + daysToAdd);
}

/**
 * Calculate randomized send time within window
 */
export function calculateSendTime(
  timeWindow: TimeWindow,
  baseDate: Date = new Date(),
  avoidWeekends: boolean = true,
  avoidHolidays: boolean = true
): Date {
  const window = TIME_WINDOWS[timeWindow];
  const startMinutes = timeToMinutes(window.start);
  const endMinutes = timeToMinutes(window.end);
  const windowDuration = endMinutes - startMinutes;

  // Random minutes within window (e.g., 9:17, 9:23, 9:41 - not round numbers)
  const randomMinutes = Math.floor(Math.random() * windowDuration);
  const sendMinutes = startMinutes + randomMinutes;

  let sendDate = minutesToDate(sendMinutes, baseDate);

  // Avoid weekends
  if (avoidWeekends && isWeekend(sendDate)) {
    // Move to next Monday
    const daysToAdd = sendDate.getDay() === 0 ? 1 : 8 - sendDate.getDay();
    sendDate = new Date(sendDate);
    sendDate.setDate(sendDate.getDate() + daysToAdd);
    sendDate = minutesToDate(sendMinutes, sendDate);
  }

  // Avoid holidays
  if (avoidHolidays && isHoliday(sendDate)) {
    // Move to next day
    sendDate = new Date(sendDate);
    sendDate.setDate(sendDate.getDate() + 1);
    sendDate = minutesToDate(sendMinutes, sendDate);
  }

  return sendDate;
}

/**
 * Get optimal time window for email type
 */
export function getOptimalTimeWindow(emailType: string): TimeWindow {
  // Business hours emails
  if (
    emailType.includes('sponsor') ||
    emailType.includes('professional') ||
    emailType.includes('business')
  ) {
    return 'morning'; // 9-10 AM
  }

  // Student notifications
  if (
    emailType.includes('student') ||
    emailType.includes('reminder') ||
    emailType.includes('event')
  ) {
    return 'afternoon'; // 2-3:30 PM
  }

  // Urgent/time-sensitive
  if (emailType.includes('urgent') || emailType.includes('immediate')) {
    return 'morning'; // Send ASAP in morning window
  }

  // Digests and summaries
  if (emailType.includes('digest') || emailType.includes('summary')) {
    return 'end_of_day'; // 4-5:30 PM
  }

  // Default to morning
  return 'morning';
}

/**
 * Respect recipient timezone
 */
export function respectRecipientTimezone(
  recipient: { timezone?: string },
  baseTime: Date
): Date {
  // If no timezone specified, use server timezone
  if (!recipient.timezone) {
    return baseTime;
  }

  // Convert base time to recipient timezone
  // This is a simplified version - in production, use a library like date-fns-tz
  try {
    const recipientTime = new Date(
      baseTime.toLocaleString('en-US', { timeZone: recipient.timezone })
    );
    return recipientTime;
  } catch {
    // Invalid timezone, use base time
    return baseTime;
  }
}

/**
 * Stagger sends over time period
 */
export function staggerSends(
  recipientCount: number,
  durationMinutes: number
): Date[] {
  const sendTimes: Date[] = [];
  const now = new Date();
  const interval = durationMinutes / recipientCount;

  for (let i = 0; i < recipientCount; i++) {
    const sendTime = new Date(now.getTime() + i * interval * 60 * 1000);
    sendTimes.push(sendTime);
  }

  return sendTimes;
}

/**
 * Check if date is a holiday
 */
export function checkHolidays(date: Date): boolean {
  return isHoliday(date);
}

/**
 * Get next business day
 */
export function getNextBusinessDay(date: Date): Date {
  let nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  while (isWeekend(nextDay) || isHoliday(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }

  return nextDay;
}


