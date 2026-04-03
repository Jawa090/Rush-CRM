const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'smtp'; // 'smtp' or 'sendgrid'
    this.initializeProvider();
  }

  initializeProvider() {
    if (this.provider === 'sendgrid') {
      // SendGrid setup
      const apiKey = process.env.SENDGRID_API_KEY;
      if (apiKey) {
        sgMail.setApiKey(apiKey);
        console.log('✅ SendGrid email service initialized');
      } else {
        console.warn('⚠️  SENDGRID_API_KEY not found, falling back to SMTP');
        this.provider = 'smtp';
        this.initializeSMTP();
      }
    } else {
      this.initializeSMTP();
    }
  }

  initializeSMTP() {
    // SMTP setup (Gmail, Outlook, custom SMTP)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('✅ SMTP email service initialized');
  }

  async sendEmail({ to, subject, html, text, from, replyTo }) {
    try {
      const fromEmail = from || process.env.DEFAULT_FROM_EMAIL || 'noreply@yourcompany.com';
      const fromName = process.env.DEFAULT_FROM_NAME || 'Your Company';

      if (this.provider === 'sendgrid') {
        return await this.sendViaSendGrid({ to, subject, html, text, from: fromEmail, fromName, replyTo });
      } else {
        return await this.sendViaSMTP({ to, subject, html, text, from: fromEmail, fromName, replyTo });
      }
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }

  async sendViaSendGrid({ to, subject, html, text, from, fromName, replyTo }) {
    const msg = {
      to,
      from: { email: from, name: fromName },
      subject,
      text: text || this.htmlToText(html),
      html,
      replyTo,
    };

    const result = await sgMail.send(msg);
    return {
      success: true,
      messageId: result[0].headers['x-message-id'],
      provider: 'sendgrid',
    };
  }

  async sendViaSMTP({ to, subject, html, text, from, fromName, replyTo }) {
    const mailOptions = {
      from: `"${fromName}" <${from}>`,
      to,
      subject,
      text: text || this.htmlToText(html),
      html,
      replyTo,
    };

    const info = await this.transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      provider: 'smtp',
    };
  }

  async sendBulkEmails(emails) {
    const results = [];
    const batchSize = 10; // Send 10 emails at a time

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(email => this.sendEmail(email))
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push({
            email: batch[index].to,
            success: true,
            messageId: result.value.messageId,
          });
        } else {
          results.push({
            email: batch[index].to,
            success: false,
            error: result.reason.message,
          });
        }
      });

      // Small delay between batches to avoid rate limits
      if (i + batchSize < emails.length) {
        await this.delay(1000);
      }
    }

    return results;
  }

  async sendCampaign(campaign, contacts) {
    const emails = contacts.map(contact => ({
      to: contact.email,
      subject: this.replaceTokens(campaign.subject, contact),
      html: this.replaceTokens(campaign.content, contact),
      from: campaign.from_email,
      replyTo: campaign.from_email,
    }));

    return await this.sendBulkEmails(emails);
  }

  replaceTokens(content, contact) {
    if (!content) return content;

    const tokens = {
      '{{first_name}}': contact.first_name || '',
      '{{last_name}}': contact.last_name || '',
      '{{email}}': contact.email || '',
      '{{company}}': contact.company || '',
      '{{company_name}}': contact.company || '',
      '{{phone}}': contact.phone || '',
      '{{city}}': contact.city || '',
      '{{country}}': contact.country || '',
      '{{job_title}}': contact.job_title || '',
      '{{website}}': contact.website || '',
      '{{cta_link}}': process.env.APP_URL || 'https://yourcompany.com',
      '{{month}}': new Date().toLocaleString('default', { month: 'long' }),
      '{{year}}': new Date().getFullYear().toString(),
    };

    let result = content;
    Object.entries(tokens).forEach(([token, value]) => {
      result = result.replace(new RegExp(token, 'g'), value);
    });

    return result;
  }

  htmlToText(html) {
    if (!html) return '';
    // Simple HTML to text conversion
    return html
      .replace(/<style[^>]*>.*<\/style>/gm, '')
      .replace(/<script[^>]*>.*<\/script>/gm, '')
      .replace(/<[^>]+>/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async verifyConnection() {
    try {
      if (this.provider === 'smtp' && this.transporter) {
        await this.transporter.verify();
        return { success: true, provider: 'smtp' };
      } else if (this.provider === 'sendgrid') {
        return { success: true, provider: 'sendgrid' };
      }
      return { success: false, error: 'No email provider configured' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
