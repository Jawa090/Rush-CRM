const { google } = require('googleapis');
const db = require('../config/database');
const dotenv = require('dotenv');
dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const port = process.env.PORT || 3001;
const GOOGLE_CALENDAR_REDIRECT_URI = process.env.GOOGLE_CALENDAR_REDIRECT_URI || `${process.env.BACKEND_URL || `http://localhost:${port}`}/api/calendar/auth/google/callback`;

const createOAuthClient = (redirectUri = GOOGLE_CALENDAR_REDIRECT_URI) => {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    redirectUri
  );
};

const getAuthUrl = (userId, orgId) => {
  const oauth2Client = createOAuthClient();
  
  // Scopes for Gmail, Calendar, etc.
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.send',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: JSON.stringify({ userId, orgId }),
    prompt: 'consent', // Use prompt: 'consent' to ensure you get a refresh token
  });
};

const handleCallback = async (code) => {
  const oauth2Client = createOAuthClient();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Error in handleCallback (getToken):', error.response?.data || error);
    throw error;
  }
};


const getUserInfo = async (tokens) => {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(tokens);
  
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2'
  });
  
  const userInfo = await oauth2.userinfo.get();
  return userInfo.data;
};

const listEvents = async (accessToken, refreshToken, startDate, endDate) => {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  const listParams = {
    calendarId: 'primary',
    timeMin: startDate || new Date().toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  };

  if (endDate) {
    listParams.timeMax = endDate;
  }

  const response = await calendar.events.list(listParams);

  return response.data.items;
};

const createEvent = async (accessToken, refreshToken, eventData) => {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start: {
        dateTime: eventData.startTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'UTC',
      },
      attendees: eventData.attendees ? eventData.attendees.map(email => ({ email })) : [],
    },
    sendUpdates: 'none', // We send our own simplified email from the CRM
  });

  return response.data;
};

module.exports = {
  getAuthUrl,
  handleCallback,
  getUserInfo,
  listEvents,
  createEvent,
};
