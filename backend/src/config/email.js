const nodemailer = require('nodemailer');
require('dotenv').config();

// Email configuration
const emailConfig = {
  provider: process.env.EMAIL_PROVIDER || 'smtp', // 'smtp' or 'sendgrid'
  
  // SMTP Configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  
  // SendGrid Configuration
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
  },
  
  // Default sender
  defaults: {
    from: process.env.DEFAULT_FROM_EMAIL || 'noreply@yourcompany.com',
    fromName: process.env.DEFAULT_FROM_NAME || 'Your Company',
  },
  
  // Bulk email settings
  bulk: {
    batchSize: 10, // Send 10 emails at a time
    delayBetweenBatches: 1000, // 1 second delay
  },
};

// Create SMTP transporter
const createTransporter = () => {
  if (emailConfig.provider === 'smtp') {
    const transporter = nodemailer.createTransport(emailConfig.smtp);
    console.log('✅ SMTP email transporter created');
    return transporter;
  }
  return null;
};

// Verify email connection
const verifyConnection = async (transporter) => {
  try {
    if (transporter) {
      await transporter.verify();
      return { success: true, provider: 'smtp' };
    }
    return { success: false, error: 'No transporter available' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  emailConfig,
  createTransporter,
  verifyConnection,
};
