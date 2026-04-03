const db = require('../../config/database');
const gmailOAuth = require('../../services/gmailOAuth');

// Helper to process Gmail OAuth callback
const processGmailCallbackInternal = async (code, state, currentUser) => {
  if (!code) throw new Error('Authorization code is required');

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
  let userId = currentUser?.id;
  let orgId = currentUser?.orgId;

  if (state) {
    try {
      const stateData = typeof state === 'string' ? JSON.parse(state) : state;
      userId = stateData.userId || userId;
      orgId = stateData.orgId || orgId;
    } catch (e) {
      console.warn('Could not parse state parameter:', e.message);
    }
  }

  if (!userId) {
    throw new Error('User context missing. Please try connecting again.');
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

  return {
    mailbox: result.rows[0],
    userInfo: {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture
    },
    connectionTest
  };
};

/**
 * Sync email mailbox
 */
const syncEmail = async (req, res, next) => {
  try {
    const { action, mailbox_id } = req.body;
    if (action === 'health') return res.json({ status: 'ok' });
    
    // Get mailbox
    const mbResult = await db.query(
      'SELECT * FROM connected_mailboxes WHERE id = $1 AND user_id = $2',
      [mailbox_id, req.user.id]
    );
    const mailbox = mbResult.rows[0];
    if (!mailbox) return res.status(404).json({ error: 'Mailbox not found' });    if (action === 'sync') {
      console.log(`📧 Deep syncing emails for: ${mailbox.email_address}`);
      
      const labelsToSync = ['INBOX', 'SENT', 'DRAFT', 'STARRED', 'SPAM', 'TRASH'];
      let totalSynced = 0;

      for (const label of labelsToSync) {
        try {
          console.log(`  - Fetching label: ${label}`);
          const list = await gmailOAuth.listMessages(mailbox.access_token, { 
            maxResults: 40, 
            q: label === 'STARRED' ? 'is:starred' : `label:${label}` 
          });

          if (list.messages) {
            for (const msg of list.messages) {
              try {
                // Check if already exists
                const existing = await db.query('SELECT id FROM emails WHERE message_id = $1', [msg.id]);
                if (existing.rows.length > 0) continue;

                // Fetch details
                const details = await gmailOAuth.getMessage(mailbox.access_token, msg.id);
                const headers = details.payload.headers;
                const labelIds = details.labelIds || [];
                
                const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
                
                const from = getHeader('From');
                const subject = getHeader('Subject');
                const date = getHeader('Date');
                const snippet = details.snippet;

                // Determine folder
                let folder = 'inbox';
                if (labelIds.includes('SENT')) folder = 'sent';
                else if (labelIds.includes('DRAFT')) folder = 'drafts';
                else if (labelIds.includes('SPAM')) folder = 'spam';
                else if (labelIds.includes('TRASH')) folder = 'trash';
                else if (!labelIds.includes('INBOX')) folder = 'archive';
                
                const isStarred = labelIds.includes('STARRED');
                const isRead = !labelIds.includes('UNREAD');
                
                // Body extraction (already defined recursive logic)
                let bodyText = '';
                let bodyHtml = '';
                const processParts = (parts) => {
                  for (const part of parts) {
                    if (part.mimeType === 'text/plain' && part.body.data) {
                      bodyText = Buffer.from(part.body.data, 'base64').toString();
                    } else if (part.mimeType === 'text/html' && part.body.data) {
                      bodyHtml = Buffer.from(part.body.data, 'base64').toString();
                    } else if (part.parts) {
                      processParts(part.parts);
                    }
                  }
                };

                if (details.payload.parts) {
                  processParts(details.payload.parts);
                } else if (details.payload.body.data) {
                  const data = Buffer.from(details.payload.body.data, 'base64').toString();
                  if (details.payload.mimeType === 'text/html') bodyHtml = data;
                  else bodyText = data;
                }

                // Save to DB
                await db.query(
                  `INSERT INTO emails (
                    org_id, user_id, mailbox_id, message_id, thread_id, 
                    from_name, from_address, subject, snippet, body_text, body_html, received_at, 
                    folder, is_starred, is_read
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
                  [
                    mailbox.org_id, mailbox.user_id, mailbox.id, msg.id, details.threadId,
                    from.split('<')[0].trim() || from, from.includes('<') ? from.split('<')[1].split('>')[0] : from,
                    subject, snippet, bodyText, bodyHtml, new Date(date),
                    folder, isStarred, isRead
                  ]
                );
                totalSynced++;
              } catch (e) { /* skip individual errors */ }
            }
          }
        } catch (labelError) {
          console.error(`Error syncing label ${label}:`, labelError.message);
        }
      }

      await db.query('UPDATE connected_mailboxes SET last_sync_at = now(), sync_status = $1 WHERE id = $2', ['synced', mailbox.id]);
      return res.json({ success: true, messages_synced: totalSynced });
    }
    
    res.json({ error: 'Unknown action' });
  } catch (error) { 
    console.error('❌ Sync error:', error);
    next(error); 
  }
};

/**
 * Get connected mailboxes
 */
const getMailboxes = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM connected_mailboxes WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

/**
 * Connect a new mailbox (Directly via IMAP/SMTP)
 */
const connectMailbox = async (req, res, next) => {
  try {
    const { user_id, org_id, provider, email_address, display_name, imap_host, imap_port, smtp_host, smtp_port, imap_username, smtp_username, encrypted_password } = req.body;
    const { rows } = await db.query(
      `INSERT INTO connected_mailboxes (user_id, org_id, provider, email_address, display_name, imap_host, imap_port, smtp_host, smtp_port, imap_username, smtp_username, encrypted_password, is_active, sync_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true,'pending') RETURNING *`,
      [user_id || req.user.id, org_id || req.user.orgId, provider, email_address, display_name, imap_host, imap_port, smtp_host, smtp_port, imap_username, smtp_username, encrypted_password]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

/**
 * Disconnect mailbox
 */
const disconnectMailbox = async (req, res, next) => {
  try {
    await db.query('UPDATE connected_mailboxes SET is_active = false WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

/**
 * Get email messages with filters
 */
const getMessages = async (req, res, next) => {
  try {
    const { folder, starred, mailbox_id, search } = req.query;
    let query = 'SELECT * FROM emails WHERE user_id = $1';
    const params = [req.user.id];
    let i = 2;
    if (starred === 'true') { query += ` AND is_starred = true`; }
    else if (folder) { query += ` AND folder = $${i++}`; params.push(folder); }
    if (mailbox_id) { query += ` AND mailbox_id = $${i++}`; params.push(mailbox_id); }
    if (search) { query += ` AND (subject ILIKE $${i} OR from_address ILIKE $${i} OR body_text ILIKE $${i})`; params.push(`%${search}%`); i++; }
    query += ' ORDER BY received_at DESC LIMIT 100';
    const { rows } = await db.query(query, params);
    
    // If no real messages yet, maybe return mock data? 
    // The previous emailController.js had mocks but the route was actually using DB.
    // I'll stick to DB for now.
    res.json(rows);
  } catch (err) { next(err); }
};

/**
 * Update a single message
 */
const updateMessage = async (req, res, next) => {
  try {
    const fields = Object.entries(req.body).map(([k, v], i) => `${k} = $${i + 2}`).join(', ');
    const values = Object.values(req.body);
    await db.query(`UPDATE emails SET ${fields} WHERE id = $1 AND user_id = $${values.length + 2}`, [req.params.id, ...values, req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

/**
 * Bulk update messages
 */
const bulkUpdateMessages = async (req, res, next) => {
  try {
    const { ids, update } = req.body;
    const fields = Object.entries(update).map(([k, v], i) => `${k} = $${i + 1}`).join(', ');
    const values = Object.values(update);
    await db.query(`UPDATE emails SET ${fields} WHERE id = ANY($${values.length + 1}) AND user_id = $${values.length + 2}`, [...values, ids, req.user.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

/**
 * Get unread/starred counts
 */
const getMessageCounts = async (req, res, next) => {
  try {
    const { mailbox_id } = req.query;
    const counts = {};
    for (const f of ['inbox', 'sent', 'drafts', 'spam', 'trash', 'archive']) {
      let q = 'SELECT COUNT(*) FROM emails WHERE user_id = $1 AND folder = $2';
      const p = [req.user.id, f];
      if (mailbox_id) { q += ' AND mailbox_id = $3'; p.push(mailbox_id); }
      if (f === 'inbox') q += ' AND is_read = false';
      const { rows } = await db.query(q, p);
      counts[f] = parseInt(rows[0].count);
    }
    const starQ = mailbox_id
      ? 'SELECT COUNT(*) FROM emails WHERE user_id = $1 AND is_starred = true AND mailbox_id = $2'
      : 'SELECT COUNT(*) FROM emails WHERE user_id = $1 AND is_starred = true';
    const { rows } = await db.query(starQ, mailbox_id ? [req.user.id, mailbox_id] : [req.user.id]);
    counts['starred'] = parseInt(rows[0].count);
    res.json(counts);
  } catch (err) { next(err); }
};

/**
 * Get attachments (placeholder)
 */
const getAttachments = async (req, res, next) => {
  res.json([]);
};

/**
 * Get CRM links (placeholder)
 */
const getCRMLinks = async (req, res, next) => {
  res.json([]);
};

/**
 * Create CRM link (placeholder)
 */
const createCRMLink = async (req, res, next) => {
  res.json({ success: true });
};

/**
 * Delete CRM link (placeholder)
 */
const deleteCRMLink = async (req, res, next) => {
  res.json({ success: true });
};

/**
 * Generate OAuth URL for providers
 */
const getOAuthUrl = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const normalized = provider === 'gmail-mail-auth' ? 'gmail' : provider;
    
    console.log(`📧 OAuth URL requested for provider: ${provider}`);
    
    if (normalized === 'gmail') {
      try {
        const state = JSON.stringify({
          userId: req.user.id,
          orgId: req.user.orgId,
          timestamp: Date.now()
        });
        
        const authUrl = gmailOAuth.getAuthUrl(state);
        
        res.json({ 
          success: true,
          authUrl: authUrl,
          provider: 'gmail'
        });
      } catch (error) {
        console.error('Gmail OAuth error:', error.message);
        res.status(500).json({ 
          error: 'Failed to generate Gmail OAuth URL',
          message: error.message,
          details: 'Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured'
        });
      }
    } else {
      res.status(400).json({ 
        error: 'Unsupported provider',
        message: `Provider '${provider}' is not supported. Use 'gmail' for Gmail integration.`
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Handle OAuth callback (POST)
 */
const handleOAuthCallback = async (req, res, next) => {
  try {
    const { code, state, provider = 'gmail' } = req.body;
    console.log(`📧 Processing OAuth callback for ${provider}`);

    if (provider === 'gmail') {
      try {
        const result = await processGmailCallbackInternal(code, state, req.user);
        res.json({ success: true, message: 'Gmail connected successfully', ...result });
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
    next(err);
  }
};

/**
 * Handle OAuth callback (GET)
 */
const handleOAuthCallbackGet = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    console.log('📧 Processing OAuth callback (GET) for gmail');
    const result = await processGmailCallbackInternal(code, state, req.user);
    
    // Instead of JSON, send a nice success page that notifies the opener and closes
    res.send(`
      <html>
      <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f0f7ff; color: #1e3a8a;">
        <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center;">
          <h1 style="margin-bottom: 0.5rem; color: #10b981;">✅ Gmail Connected!</h1>
          <p>Your mailbox has been securely linked.</p>
          <p>This window will close automatically...</p>
          <div style="margin: 1.5rem auto; width: 40px; height: 40px; border: 4px solid #10b981; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
        <script>
          // Notify the opener window that connection is successful
          if (window.opener) {
            window.opener.postMessage('gmail-connected', '*');
          }
          
          setTimeout(() => {
            window.close();
          }, 2000);
          
          // CSS for spinner
          const style = document.createElement('style');
          style.innerHTML = '@keyframes spin { to { transform: rotate(360deg); } }';
          document.head.appendChild(style);
        </script>
      </body>
      </html>
    `);

  } catch (err) {
    console.error('❌ Gmail OAuth callback (GET) error:', err);
    res.status(500).send(`
      <div style="font-family: sans-serif; padding: 2rem; border: 1px solid #fee2e2; background: #fef2f2; border-radius: 8px; color: #991b1b; text-align: center;">
        <h2 style="margin-top: 0;">❌ Connection Failed</h2>
        <p>${err.message}</p>
        <button onclick="window.close()" style="background: #991b1b; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">Close Window</button>
      </div>
    `);
  }
};

/**
 * Send email (placeholder)
 * Send email through connected mailbox
 */
const sendEmail = async (req, res, next) => {
  try {
    const { to, cc, bcc, subject, body, html, mailbox_id, attachments } = req.query.to ? req.query : req.body;

    // Get active mailbox
    let mailbox;
    if (mailbox_id) {
      const result = await db.query(
        'SELECT * FROM connected_mailboxes WHERE id = $1 AND user_id = $2 AND is_active = true',
        [mailbox_id, req.user.id]
      );
      mailbox = result.rows[0];
    } else {
      const result = await db.query(
        'SELECT * FROM connected_mailboxes WHERE user_id = $1 AND is_active = true LIMIT 1',
        [req.user.id]
      );
      mailbox = result.rows[0];
    }

    if (!mailbox) {
      return res.status(404).json({ error: 'No active mailbox found. Please connect your Gmail account.' });
    }

    // Send via Google
    const sentData = await gmailOAuth.sendEmail(mailbox.access_token, mailbox.refresh_token, { 
      to, 
      subject, 
      body, 
      html,
      attachments 
    });

    // Save to local 'sent' folder in database
    try {
      await db.query(
        `INSERT INTO emails (
          org_id, user_id, mailbox_id, message_id, thread_id, 
          from_name, from_address, to_address, subject, snippet, body_text, body_html, 
          folder, is_read, received_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'sent', true, now())`,
        [
          mailbox.org_id,
          mailbox.user_id,
          mailbox.id,
          sentData.id,
          sentData.threadId,
          mailbox.display_name || mailbox.email_address,
          mailbox.email_address,
          to,
          subject,
          (body || html || '').substring(0, 100),
          body,
          html,
        ]
      );
    } catch (dbErr) {
      console.warn('Failed to save sent email to local DB:', dbErr.message);
    }

    res.json({ success: true, message: 'Email sent successfully', messageId: sentData.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  syncEmail,
  getMailboxes,
  connectMailbox,
  disconnectMailbox,
  getMessages,
  updateMessage,
  bulkUpdateMessages,
  getMessageCounts,
  getAttachments,
  getCRMLinks,
  createCRMLink,
  deleteCRMLink,
  getOAuthUrl,
  handleOAuthCallback,
  handleOAuthCallbackGet,
  sendEmail
};
