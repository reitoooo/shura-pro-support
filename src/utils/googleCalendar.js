/**
 * Google Calendar API Utility
 */

export async function addEventToCalendar(accessToken, sessionData) {
  if (!accessToken) {
    throw new Error('No access token provided. Please log in with Google.');
  }

  // Create start and end times
  const startTime = new Date(); // Using current time as the end of the session
  
  // Ensure a minimum of 15 minutes so it's visible on the calendar
  const MIN_DURATION = 15 * 60 * 1000;
  let durationMs = sessionData.duration || MIN_DURATION;
  if (durationMs < MIN_DURATION) {
    durationMs = MIN_DURATION;
  }
  
  const endTime = new Date(startTime.getTime() + durationMs);

  const event = {
    summary: `🔥 修羅プロ: ${sessionData.description || '活動記録'}`,
    description: `熱ポイント: ${sessionData.points}pt\nモード: ${sessionData.mode}\nハードル: Level ${sessionData.hurdle}`,
    colorId: '11', // Red/Tomato color in Google Calendar
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google Calendar API Error: ${errorData.error.message}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to add event to Google Calendar', error);
    throw error;
  }
}
