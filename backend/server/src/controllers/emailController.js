const db = require('../config/database');
const gmailOAuth = require('../services/gmailOAuth');

// Get connected mailboxes
const getMailboxes = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM connected_mailboxes 
       WHERE user_id = $1 AND org_id = $2 AND is_active = true
       ORDER BY created_at DESC`,
      [req.user.id, req.user.orgId]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Connect a new mailbox
const connectMailbox = async (req, res, next) => {
  try {
    const { provider, email_address, display_name, access_token, refresh_token, expires_at } = req.body;

    if (!provider || !email_address) {
      return res.status(400).json({ error: 'Provider and email address are required' });
    }

    const result = await db.query(
      `INSERT INTO connected_mailboxes (org_id, user_id, provider, email_address, display_name, access_token, refresh_token, token_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.orgId, req.user.id, provider, email_address, display_name || null, access_token || null, refresh_token || null, expires_at || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Get email messages
const getMessages = async (req, res, next) => {
  try {
    const { folder = 'All', limit = 50, offset = 0 } = req.query;
    
    // For now, return mock data since we don't have real email integration
    const mockMessages = [
      {
        id: '1',
        subject: 'Welcome to our CRM system',
        sender_email: 'support@company.com',
        sender_name: 'Support Team',
        received_at: new Date().toISOString(),
        is_read: false,
        folder: folder
      }
    ];
    
    res.json(mockMessages);
  } catch (err) {
    next(err);
  }
};

// Get OAuth URL for email providers
const getOAuthUrl = async (req, res, next) => {
  try {
    const { provider } = req.params;
    
    console.log(`📧 Generating OAuth URL for provider: ${provider}`);
    
    if (provider === 'gmail' || provider === 'gmail-mail-auth') {
      try {
        // Generate state parameter with user info for security
        const state = JSON.stringify({
          userId: req.user.id,
          orgId: req.user.orgId,
          timestamp: Date.now()
        });
        
        const authUrl = gmailOAuth.getAuthUrl(state);
        console.log(`✅ Generated Gmail OAuth URL successfully`);
        
        res.json({ 
          success: true,
          authUrl: authUrl,
          provider: 'gmail'
        });
      } catch (error) {
        console.error('❌ Gmail OAuth error:', error.message);
        res.status(500).json({ 
          error: 'Failed to generate Gmail OAuth URL',
          message: error.message,
          details: 'Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured in your environment variables'
        });
      }
    } else if (provider === 'outlook' || provider === 'outlook-mail-auth') {
      // Placeholder for Outlook OAuth
      res.status(501).json({ 
        error: 'Outlook OAuth not implemented yet',
        message: 'Outlook integration is coming soon'
      });
    } else {
      res.status(400).json({ 
        error: 'Unsupported provider',
        message: `Provider '${provider}' is not supported. Supported providers: gmail, outlook`
      });
    }
  } catch (err) {
    console.error('❌ OAuth URL generation error:', err);
    next(err);
  }
};

// Handle OAuth callback and exchange code for tokens
const handleOAuthCallback = async (req, res, next) => {
  try {
    const { code, state, provider = 'gmail' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    console.log(`📧 Processing OAuth callback for ${provider}`);
    
    if (provider === 'gmail') {
      try {
        // Exchange code for tokens
        const tokens = await gmailOAuth.exchangeCodeForTokens(code);
        
        // Get user info
        const userInfo = await gmailOAuth.getUserInfo(tokens.access_token);
        
        // Test the connection
        const connectionTest = await gmailOAuth.testConnection(tokens.access_token);
        
        if (!connectionTest.success) {
          throw new Error(`Gmail connection test failed: ${connectionTest.error}`);
        }
        
        // Parse state to get user info
        let userId = req.user.id;
        let orgId = req.user.orgId;
        
        if (state) {
          try {
            const stateData = JSON.parse(state);
            userId = stateData.userId || req.user.id;
            orgId = stateData.orgId || req.user.orgId;
          } catch (e) {
            console.warn('Could not parse state parameter:', e.message);
          }
        }
        
        // Save mailbox to database
        const result = await db.query(
          `INSERT INTO connected_mailboxes (
            org_id, user_id, provider, email_address, display_name, 
            access_token, refresh_token, token_expires_at, is_active, sync_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
          ON CONFLICT (org_id, user_id, email_address) 
          DO UPDATE SET 
            access_token = EXCLUDED.access_token,
            refresh_token = EXCLUDED.refresh_token,
            token_expires_at = EXCLUDED.token_expires_at,
            is_active = true,
            sync_status = 'connected',
            updated_at = now()
          RETURNING *`,
          [
            orgId,
            userId,
            'gmail',
            userInfo.email,
            userInfo.name || userInfo.email,
            tokens.access_token,
            tokens.refresh_token,
            tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            true,
            'connected'
          ]
        );
        
        console.log(`✅ Gmail mailbox connected successfully: ${userInfo.email}`);
        
        res.json({
          success: true,
          message: 'Gmail connected successfully',
          mailbox: result.rows[0],
          userInfo: {
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture
          },
          connectionTest: connectionTest
        });
        
      } catch (error) {
        console.error('❌ Gmail OAuth callback error:', error);
        res.status(500).json({
          error: 'Failed to connect Gmail',
          message: error.message
        });
      }
    } else {
      res.status(400).json({
        error: 'Unsupported provider',
        message: `Provider '${provider}' is not supported for OAuth callback`
      });
    }
  } catch (err) {
    console.error('❌ OAuth callback error:', err);
    next(err);
  }
};

// Disconnect mailbox
const disconnectMailbox = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'UPDATE connected_mailboxes SET is_active = false WHERE id = $1 AND user_id = $2 AND org_id = $3 RETURNING *',
      [id, req.user.id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mailbox not found' });
    }

    res.json({ message: 'Mailbox disconnected' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMailboxes,
  connectMailbox,
  getMessages,
  getOAuthUrl,
  handleOAuthCallback,
  disconnectMailbox,
};