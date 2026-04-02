const db = require('../config/database');
const crypto = require('crypto');
const axios = require('axios');

class WebhookService {
  async triggerWebhooks(eventType, payload, orgId) {
    // Get all active webhooks for this event type
    const result = await db.query(
      `SELECT * FROM marketing_webhooks 
       WHERE org_id = $1 AND is_active = true AND $2 = ANY(event_types)`,
      [orgId, eventType]
    );

    const webhooks = result.rows;

    // Queue webhooks for async processing
    for (const webhook of webhooks) {
      await this.queueWebhook(webhook.id, eventType, payload);
    }

    return { queued: webhooks.length };
  }

  async queueWebhook(webhookId, eventType, payload) {
    await db.query(
      `INSERT INTO marketing_webhook_queue 
       (webhook_id, event_type, payload, next_retry_at)
       VALUES ($1, $2, $3, NOW())`,
      [webhookId, eventType, payload]
    );
  }

  async processQueue() {
    // Get pending webhooks
    const result = await db.query(
      `SELECT wq.*, w.url, w.method, w.headers, w.secret_key, w.timeout_seconds, w.retry_count as max_retries
       FROM marketing_webhook_queue wq
       JOIN marketing_webhooks w ON wq.webhook_id = w.id
       WHERE wq.status = 'pending' AND wq.next_retry_at <= NOW()
       LIMIT 10`
    );

    const queue = result.rows;

    for (const item of queue) {
      await this.executeWebhook(item);
    }

    return { processed: queue.length };
  }

  async executeWebhook(queueItem) {
    const startTime = Date.now();
    
    try {
      // Mark as processing
      await db.query(
        'UPDATE marketing_webhook_queue SET status = $1 WHERE id = $2',
        ['processing', queueItem.id]
      );

      // Prepare request
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Marketing-CRM-Webhook/1.0',
        ...(queueItem.headers || {}),
      };

      // Add signature if secret key exists
      if (queueItem.secret_key) {
        const signature = this.generateSignature(queueItem.payload, queueItem.secret_key);
        headers['X-Webhook-Signature'] = signature;
      }

      // Add timestamp
      headers['X-Webhook-Timestamp'] = new Date().toISOString();
      headers['X-Event-Type'] = queueItem.event_type;

      // Make request
      const response = await axios({
        method: queueItem.method || 'POST',
        url: queueItem.url,
        data: queueItem.payload,
        headers,
        timeout: (queueItem.timeout_seconds || 30) * 1000,
      });

      const duration = Date.now() - startTime;

      // Log success
      await this.logWebhook({
        webhookId: queueItem.webhook_id,
        eventType: queueItem.event_type,
        payload: queueItem.payload,
        requestHeaders: headers,
        responseStatus: response.status,
        responseBody: JSON.stringify(response.data).slice(0, 1000),
        duration,
        status: 'success',
      });

      // Update webhook stats
      await db.query(
        `UPDATE marketing_webhooks 
         SET success_count = success_count + 1, last_triggered_at = NOW()
         WHERE id = $1`,
        [queueItem.webhook_id]
      );

      // Mark as completed
      await db.query(
        'UPDATE marketing_webhook_queue SET status = $1, processed_at = NOW() WHERE id = $2',
        ['completed', queueItem.id]
      );

    } catch (error) {
      const duration = Date.now() - startTime;

      // Log failure
      await this.logWebhook({
        webhookId: queueItem.webhook_id,
        eventType: queueItem.event_type,
        payload: queueItem.payload,
        requestHeaders: {},
        responseStatus: error.response?.status || 0,
        responseBody: error.message,
        errorMessage: error.message,
        duration,
        retryAttempt: queueItem.retry_count,
        status: 'failed',
      });

      // Update webhook stats
      await db.query(
        'UPDATE marketing_webhooks SET failure_count = failure_count + 1 WHERE id = $1',
        [queueItem.webhook_id]
      );

      // Retry logic
      if (queueItem.retry_count < queueItem.max_retries) {
        const nextRetry = new Date(Date.now() + Math.pow(2, queueItem.retry_count) * 60000); // Exponential backoff
        await db.query(
          `UPDATE marketing_webhook_queue 
           SET retry_count = retry_count + 1, next_retry_at = $1, status = 'pending'
           WHERE id = $2`,
          [nextRetry, queueItem.id]
        );
      } else {
        // Max retries reached
        await db.query(
          'UPDATE marketing_webhook_queue SET status = $1, processed_at = NOW() WHERE id = $2',
          ['failed', queueItem.id]
        );
      }
    }
  }

  async logWebhook(logData) {
    await db.query(
      `INSERT INTO marketing_webhook_logs 
       (webhook_id, event_type, payload, request_headers, response_status, 
        response_body, error_message, duration_ms, retry_attempt, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        logData.webhookId,
        logData.eventType,
        logData.payload,
        logData.requestHeaders,
        logData.responseStatus,
        logData.responseBody,
        logData.errorMessage || null,
        logData.duration,
        logData.retryAttempt || 0,
        logData.status,
      ]
    );
  }

  generateSignature(payload, secretKey) {
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  verifySignature(payload, signature, secretKey) {
    const expectedSignature = this.generateSignature(payload, secretKey);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  // Common webhook events
  async triggerCampaignSent(campaign, orgId) {
    await this.triggerWebhooks('campaign.sent', {
      event: 'campaign.sent',
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      sent_count: campaign.sent_count,
      timestamp: new Date().toISOString(),
    }, orgId);
  }

  async triggerContactCreated(contact, orgId) {
    await this.triggerWebhooks('contact.created', {
      event: 'contact.created',
      contact_id: contact.id,
      email: contact.email,
      first_name: contact.first_name,
      last_name: contact.last_name,
      timestamp: new Date().toISOString(),
    }, orgId);
  }

  async triggerFormSubmitted(form, submission, orgId) {
    await this.triggerWebhooks('form.submitted', {
      event: 'form.submitted',
      form_id: form.id,
      form_name: form.name,
      submission_id: submission.id,
      data: submission.data,
      timestamp: new Date().toISOString(),
    }, orgId);
  }

  async triggerEmailOpened(campaign, email, orgId) {
    await this.triggerWebhooks('email.opened', {
      event: 'email.opened',
      campaign_id: campaign.id,
      email,
      timestamp: new Date().toISOString(),
    }, orgId);
  }

  async triggerEmailClicked(campaign, email, link, orgId) {
    await this.triggerWebhooks('email.clicked', {
      event: 'email.clicked',
      campaign_id: campaign.id,
      email,
      link,
      timestamp: new Date().toISOString(),
    }, orgId);
  }
}

module.exports = new WebhookService();
