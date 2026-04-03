const { google } = require('googleapis');

class GmailOAuthService {
  constructor() {
    this.oauth2Client = null;
    this.initializeOAuth();
  }

  initializeOAuth() {
    // Check if Google OAuth credentials are configured
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const port = process.env.PORT || 4000;
    const redirectUri = process.env.GOOGLE_GMAIL_REDIRECT_URI || `${process.env.BACKEND_URL || `http://localhost:${port}`}/api/email/oauth-callback`;


    // Check for placeholder values
    const isPlaceholder = (value) => {
      return !value || 
             value === 'your-google-client-id-here' || 
             value === 'your-google-client-secret-here' ||
             value.includes('your-') ||
             value.includes('placeholder');
    };

    if (!clientId || !clientSecret || isPlaceholder(clientId) || isPlaceholder(clientSecret)) {
      console.warn('⚠️  Google OAuth credentials not configured properly.');
      console.warn('   Current GOOGLE_CLIENT_ID:', clientId ? `${clientId.substring(0, 10)}...` : 'not set');
      console.warn('   Current GOOGLE_CLIENT_SECRET:', clientSecret ? 'set but may be placeholder' : 'not set');
      console.warn('   Please follow these steps:');
      console.warn('   1. Go to https://console.cloud.google.com/');
      console.warn('   2. Create OAuth 2.0 credentials');
      console.warn('   3. Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
      console.warn('   4. Restart the server');
      return;
    }

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    console.log('✅ Google OAuth initialized successfully');
  }

  /**
   * Generate OAuth URL for Gmail authentication
   */
  getAuthUrl(state = null) {
    if (!this.oauth2Client) {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      
      if (!clientId || clientId === 'your-google-client-id-here') {
        throw new Error('Google Client ID not configured. Please set GOOGLE_CLIENT_ID in your .env file with a real value from Google Cloud Console.');
      }
      
      if (!clientSecret || clientSecret === 'your-google-client-secret-here') {
        throw new Error('Google Client Secret not configured. Please set GOOGLE_CLIENT_SECRET in your .env file with a real value from Google Cloud Console.');
      }
      
      throw new Error('Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables.');
    }

    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: state // Can be used to pass user/org info
    });

    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code) {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth not configured');
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Get user info from Google
   */
  async getUserInfo(accessToken) {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth not configured');
    }

    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();
      return data;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw new Error('Failed to get user information from Google');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken) {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth not configured');
    }

    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Test Gmail API connection
   */
  async testConnection(accessToken) {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth not configured');
    }

    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      this.oauth2Client.setCredentials({ access_token: accessToken });
      await gmail.users.getProfile({ userId: 'me' });
      return { success: true };
    } catch (error) {
      console.error('Gmail connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * List messages from Gmail
   */
  async listMessages(accessToken, options = {}) {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth not configured');
    }
    const { maxResults = 50, q = '' } = options;
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q,
    });
    
    return response.data;
  }

  /**
   * Get specific message details
   */
  async getMessage(accessToken, messageId) {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth not configured');
    }
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });
    
    return response.data;
  }

  /**
   * Send an email using Gmail API
   */
  async sendEmail(accessToken, refreshToken, { to, subject, body, html, attachments = [] }) {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth not configured');
    }

    try {
      this.oauth2Client.setCredentials({ 
        access_token: accessToken,
        refresh_token: refreshToken
      });
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const boundary = 'foo_bar_baz' + Date.now();
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      
      let message = [
        `To: ${to}`,
        `Subject: ${utf8Subject}`,
        'MIME-Version: 1.0',
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        'Content-Transfer-Encoding: base64',
        '',
        Buffer.from(html || body).toString('base64'),
        '',
      ].join('\r\n');

      for (const attachment of attachments) {
        const { filename, content, mimeType } = attachment;
        message += [
          `--${boundary}`,
          `Content-Type: ${mimeType}; name="${filename}"`,
          'Content-Transfer-Encoding: base64',
          `Content-Disposition: attachment; filename="${filename}"`,
          '',
          content, // Already base64 from backend controller
          '',
        ].join('\r\n');
      }

      message += `--${boundary}--`;

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      return res.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email via Google');
    }
  }
}

module.exports = new GmailOAuthService();