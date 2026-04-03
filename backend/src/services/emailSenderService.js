const db = require('../config/database');
const gmailOAuth = require('./gmailOAuth');

/**
 * Generic email sending service that handles fetching 
 * mailbox tokens and sending via Gmail OAuth.
 */
class EmailSenderService {
  async send(userId, { to, subject, html, body }) {
    try {
      // 1. Find active Gmail mailbox for the user (Primary)
      let result = await db.query(
        'SELECT access_token, refresh_token, provider FROM connected_mailboxes WHERE user_id = $1 AND is_active = true LIMIT 1',
        [userId]
      );

      let mailbox = result.rows[0];

      // 2. Fallback: Find Google Calendar connection (Secondary)
      if (!mailbox) {
        result = await db.query(
          'SELECT access_token, refresh_token, provider FROM calendar_connections WHERE user_id = $1 AND provider = $2 LIMIT 1',
          [userId, 'google']
        );
        mailbox = result.rows[0];
      }

      if (!mailbox) {
        console.warn('No active Gmail or Google Calendar connection found for user:', userId);
        return { success: false, error: 'No Gmail/Calendar connection' };
      }

      await gmailOAuth.sendEmail(
        mailbox.access_token, 
        mailbox.refresh_token, 
        { to, subject, html, body }
      );

      return { success: true };
    } catch (error) {
      console.error('EmailSenderService error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailSenderService();
