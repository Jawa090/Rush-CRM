const db = require('../../config/database');

const sync = async (req, res, next) => {
  try {
    const { action, mailbox_id, full_sync } = req.body;
    if (action === 'health') return res.json({ status: 'ok' });
    if (action === 'refresh_token') return res.json({ success: true });
    if (action === 'sync') return res.json({ success: true, messages_synced: 0 });
    if (action === 'verify') return res.json({ verified: true, message: 'IMAP credentials accepted (mock verifier)' });
    res.json({ error: 'Unknown action' });
  } catch (error) {
    next(error);
  }
};

const getMailboxes = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM connected_mailboxes WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const createMailbox = async (req, res, next) => {
  try {
    const { user_id, org_id, provider, email_address, display_name, imap_host, imap_port, smtp_host, smtp_port, imap_username, smtp_username, encrypted_password } = req.body;
    const { rows } = await db.query(
      `INSERT INTO connected_mailboxes (user_id, org_id, provider, email_address, display_name, imap_host, imap_port, smtp_host, smtp_port, imap_username, smtp_username, encrypted_password, is_active, sync_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true,'pending') RETURNING *`,
      [user_id || req.user.id, org_id || req.user.orgId, provider, email_address, display_name, imap_host, imap_port, smtp_host, smtp_port, imap_username, smtp_username, encrypted_password]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

const deleteMailbox = async (req, res, next) => {
  try {
    await db.query('UPDATE connected_mailboxes SET is_active = false WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { folder, starred, mailbox_id, search } = req.query;
    let query = 'SELECT * FROM emails WHERE user_id = $1';
    const params = [req.user.id];
    let i = 2;
    if (starred === 'true') {
      query += ` AND is_starred = true`;
    } else if (folder) {
      query += ` AND folder = $${i}`;
      params.push(folder);
      i++;
    }
    if (mailbox_id) {
      query += ` AND mailbox_id = $${i}`;
      params.push(mailbox_id);
      i++;
    }
    if (search) {
      query += ` AND (subject ILIKE $${i} OR from_address ILIKE $${i} OR body_text ILIKE $${i})`;
      params.push(`%${search}%`);
      i++;
    }
    query += ' ORDER BY received_at DESC LIMIT 100';
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const updateMessage = async (req, res, next) => {
  try {
    const fields = Object.entries(req.body).map(([k, v], i) => `${k} = $${i + 2}`).join(', ');
    const values = Object.values(req.body);
    await db.query(`UPDATE emails SET ${fields} WHERE id = $1 AND user_id = $${values.length + 2}`, [req.params.id, ...values, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const bulkUpdateMessages = async (req, res, next) => {
  try {
    const { ids, update } = req.body;
    const fields = Object.entries(update).map(([k, v], i) => `${k} = $${i + 1}`).join(', ');
    const values = Object.values(update);
    await db.query(`UPDATE emails SET ${fields} WHERE id = ANY($${values.length + 1}) AND user_id = $${values.length + 2}`, [...values, ids, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const getCounts = async (req, res, next) => {
  try {
    const { mailbox_id } = req.query;
    const counts = {};
    for (const f of ['inbox', 'sent', 'drafts', 'spam', 'trash', 'archive']) {
      let q = 'SELECT COUNT(*) FROM emails WHERE user_id = $1 AND folder = $2';
      const p = [req.user.id, f];
      if (mailbox_id) {
        q += ' AND mailbox_id = $3';
        p.push(mailbox_id);
      }
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
  } catch (err) {
    next(err);
  }
};

const getAttachments = async (req, res, next) => {
  res.json([]);
};

const getCrmLinks = async (req, res, next) => {
  res.json([]);
};

const createCrmLink = async (req, res, next) => {
  res.json({ success: true });
};

const deleteCrmLink = async (req, res, next) => {
  res.json({ success: true });
};

async function processGmailCallback(req) {
  const { code, state } = req;
  const gmailOAuth = require('../../services/gmailOAuth');
  if (!code) throw new Error('Authorization code is required');

  const tokens = await gmailOAuth.exchangeCodeForTokens(code);
  const userInfo = await gmailOAuth.getUserInfo(tokens.access_token);
  const connectionTest = await gmailOAuth.testConnection(tokens.access_token);
  
  if (!connectionTest.success) {
    throw new Error(`Gmail connection test failed: ${connectionTest.error}`);
  }

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
    userInfo,
  };
}

const oauthCallback = async (req, res, next) => {
  try {
    const { code, state, provider = 'gmail' } = req.body;
    console.log(`📧 Processing OAuth callback for ${provider}`);

    if (provider === 'gmail') {
      try {
        const { mailbox, userInfo } = await processGmailCallback({ ...req, code, state });
        res.json({ success: true, message: 'Gmail connected successfully', mailbox, userInfo });
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

const oauthCallbackGet = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    console.log('📧 Processing OAuth callback (GET) for gmail');
    const { mailbox, userInfo } = await processGmailCallback({ ...req, code, state });
    res.json({ success: true, message: 'Gmail connected successfully', mailbox, userInfo });
  } catch (err) {
    console.error('❌ Gmail OAuth callback (GET) error:', err);
    next(err);
  }
};

const getOauthUrl = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const normalized = provider === 'gmail-mail-auth' ? 'gmail' : provider;
    
    console.log(`📧 OAuth URL requested for provider: ${provider}`);
    
    if (normalized === 'gmail') {
      const gmailOAuth = require('../../services/gmailOAuth');
      
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

const sendEmail = async (req, res, next) => {
  res.json({ error: 'Email sending not implemented' });
};

module.exports = {
  sync,
  getMailboxes,
  createMailbox,
  deleteMailbox,
  getMessages,
  updateMessage,
  bulkUpdateMessages,
  getCounts,
  getAttachments,
  getCrmLinks,
  createCrmLink,
  deleteCrmLink,
  oauthCallback,
  oauthCallbackGet,
  getOauthUrl,
  sendEmail,
};
