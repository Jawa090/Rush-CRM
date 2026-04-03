const db = require('../../config/database');
const googleCalendarService = require('../../services/googleCalendarService');

const getEvents = async (req, res, next) => {
  try {
    const { startDate, endDate, search } = req.query;
    let query = 'SELECT * FROM public.calendar_events WHERE org_id = $1';
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    } else {
      if (startDate) {
        query += ` AND end_time >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }
      if (endDate) {
        query += ` AND start_time <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }
    }


    query += ' ORDER BY start_time ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM public.calendar_events WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { title, description, startTime, endTime, location, color, allDay, recurrence } = req.body;

    const result = await db.query(
      `INSERT INTO public.calendar_events (org_id, created_by, title, description, start_time, end_time, location, color, is_all_day, recurrence_rule)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [req.user.orgId, req.user.id, title, description, startTime, endTime, location, color, allDay || false, recurrence]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, location, color, allDay, recurrence } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(title); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
    if (startTime !== undefined) { fields.push(`start_time = $${paramIndex++}`); values.push(startTime); }
    if (endTime !== undefined) { fields.push(`end_time = $${paramIndex++}`); values.push(endTime); }
    if (location !== undefined) { fields.push(`location = $${paramIndex++}`); values.push(location); }
    if (color !== undefined) { fields.push(`color = $${paramIndex++}`); values.push(color); }
    if (allDay !== undefined) { fields.push(`is_all_day = $${paramIndex++}`); values.push(allDay); }
    if (recurrence !== undefined) { fields.push(`recurrence_rule = $${paramIndex++}`); values.push(recurrence); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = now()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.calendar_events SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM public.calendar_events WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const authUrl = googleCalendarService.getAuthUrl(req.user.id, req.user.orgId);
    res.json({ url: authUrl });
  } catch (err) {
    next(err);
  }
};

const googleAuthCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    const { userId, orgId } = JSON.parse(state);

    const tokens = await googleCalendarService.handleCallback(code);
    const userInfo = await googleCalendarService.getUserInfo(tokens);

    // Check if connection already exists
    const existingConn = await db.query(
      'SELECT id FROM public.calendar_connections WHERE org_id = $1 AND user_id = $2 AND provider = $3',
      [orgId, userId, 'google']
    );

    if (existingConn.rows.length > 0) {
      // Update existing connection
      await db.query(
        `UPDATE public.calendar_connections 
         SET access_token = $1,
             refresh_token = COALESCE($2, refresh_token),
             expires_at = $3,
             calendar_name = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [
          tokens.access_token,
          tokens.refresh_token,
          tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          userInfo.email,
          existingConn.rows[0].id
        ]
      );
    } else {
      // Insert new connection
      await db.query(
        `INSERT INTO public.calendar_connections (org_id, user_id, provider, calendar_name, access_token, refresh_token, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          orgId,
          userId,
          'google',
          userInfo.email,
          tokens.access_token,
          tokens.refresh_token,
          tokens.expiry_date ? new Date(tokens.expiry_date) : null
        ]
      );
    }

    res.send(`
      <script>
        window.opener.postMessage('google-calendar-connected', '*');
        window.close();
      </script>
      <h1>Google Calendar Connected!</h1>
      <p>You can close this window now.</p>
    `);
  } catch (err) {
    console.error('OAuth Callback Error:', err.response?.data || err);
    res.status(500).send(`
      <h1>OAuth callback failed</h1>
      <pre>${err.message}</pre>
      <p>Please check backend logs for details.</p>
    `);
  }
};


const disconnectByProvider = async (req, res, next) => {
  try {
    const { provider } = req.query;
    await db.query(
      'DELETE FROM public.calendar_connections WHERE org_id = $1 AND user_id = $2 AND provider = $3',
      [req.user.orgId, req.user.id, provider]
    );
    res.json({ message: 'Calendar disconnected' });
  } catch (err) {
    next(err);
  }
};

const getConnections = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, provider, calendar_name, is_primary, last_sync_at FROM public.calendar_connections WHERE org_id = $1 AND user_id = $2',
      [req.user.orgId, req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const syncProvider = async (req, res, next) => {
  try {
    const { provider } = req.body;
    
    // 1. Fetch connection
    const conn = await db.query(
      'SELECT access_token, refresh_token FROM calendar_connections WHERE org_id = $1 AND user_id = $2 AND provider = $3',
      [req.user.orgId, req.user.id, provider]
    );

    if (conn.rows.length === 0) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // 2. Fetch events from Google
    if (provider === 'google') {
      const now = new Date();
      now.setMonth(now.getMonth() - 2); // get past 2 months
      
      const events = await googleCalendarService.listEvents(
        conn.rows[0].access_token, 
        conn.rows[0].refresh_token, 
        now.toISOString(),
        null // no end date (future)
      );

      // 3. Save to calendar_events
      for (const evt of events) {
        if (!evt.start || (!evt.start.dateTime && !evt.start.date)) continue;
        
        const startTime = evt.start.dateTime || evt.start.date;
        const endTime = evt.end?.dateTime || evt.end?.date || startTime;
        const isAllDay = !evt.start.dateTime;
        
        // Find existing to update, else insert (to avoid complex ON CONFLICT)
        const exist = await db.query(
          'SELECT id FROM calendar_events WHERE org_id = $1 AND external_calendar_id = $2 AND external_provider = $3',
          [req.user.orgId, evt.id, 'google']
        );

        if (exist.rows.length > 0) {
          await db.query(
            `UPDATE calendar_events 
             SET title = $1, description = $2, location = $3, start_time = $4, end_time = $5, is_all_day = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7`,
            [evt.summary || 'Google Event', evt.description, evt.location, startTime, endTime, isAllDay, exist.rows[0].id]
          );
        } else {
          await db.query(
            `INSERT INTO calendar_events (org_id, created_by, title, description, location, start_time, end_time, is_all_day, external_calendar_id, external_provider, color)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, '#3b82f6')`,
            [req.user.orgId, req.user.id, evt.summary || 'Google Event', evt.description, evt.location, startTime, endTime, isAllDay, evt.id, 'google']
          );
        }
      }
      
      // Update last sync
      await db.query(`UPDATE calendar_connections SET last_sync_at = CURRENT_TIMESTAMP WHERE org_id = $1 AND user_id = $2 AND provider = $3`, [req.user.orgId, req.user.id, provider]);
    }

    res.json({ success: true, message: 'Calendars synced successfully' });
  } catch (err) {
    if (err.message && err.message.includes('invalid_grant')) {
      return res.status(401).json({ error: 'Auth expired, please reconnect your calendar.' });
    }
    next(err);
  }
};

module.exports = {
  getEvents,
  getConnections,
  getById,
  create,
  update,
  remove,
  googleAuth,
  googleAuthCallback,
  disconnectByProvider,
  syncProvider,

};


