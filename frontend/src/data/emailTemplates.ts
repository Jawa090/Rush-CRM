export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  subject: string;
  htmlContent: string;
  description: string;
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'welcome-email',
    name: 'Welcome Email',
    category: 'Onboarding',
    thumbnail: '📧',
    subject: 'Welcome to {{company_name}}!',
    description: 'Perfect for welcoming new subscribers',
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #1f2937; margin-bottom: 20px;">Welcome, {{first_name}}! 👋</h1>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      We're thrilled to have you join {{company_name}}. You've taken the first step towards something amazing!
    </p>
    <div style="text-align: center; margin-top: 30px;">
      <a href="{{cta_link}}" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
        Get Started
      </a>
    </div>
  </div>
</div>`
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    category: 'Newsletter',
    thumbnail: '📰',
    subject: '{{month}} Newsletter - Latest Updates',
    description: 'Monthly newsletter template',
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="background-color: #3b82f6; padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">{{company_name}} Newsletter</h1>
    <p style="color: #e0e7ff; margin-top: 10px;">{{month}} {{year}}</p>
  </div>
  <div style="padding: 40px 30px;">
    <h2 style="color: #1f2937; margin-bottom: 15px;">Hi {{first_name}},</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Here's what's new this month at {{company_name}}:
    </p>
    <div style="text-align: center; margin-top: 40px;">
      <a href="{{website_url}}" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Visit Our Website
      </a>
    </div>
  </div>
</div>`
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    category: 'Announcement',
    thumbnail: '🚀',
    subject: 'Introducing {{product_name}} - You will Love This!',
    description: 'Announce new products or features',
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="padding: 40px 30px; text-align: center;">
    <div style="font-size: 60px; margin-bottom: 20px;">🚀</div>
    <h1 style="color: #1f2937; margin: 0;">We've Launched Something New!</h1>
  </div>
  <div style="padding: 0 30px 40px;">
    <p style="color: #4b5563; font-size: 18px; line-height: 1.6; text-align: center;">
      Hi {{first_name}}, we're excited to introduce <strong>{{product_name}}</strong>
    </p>
    <div style="text-align: center; margin-top: 40px;">
      <a href="{{cta_link}}" style="background-color: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: 600;">
        Try It Now
      </a>
    </div>
  </div>
</div>`
  },
  {
    id: 'promotional',
    name: 'Promotional Offer',
    category: 'Promotion',
    thumbnail: '🎁',
    subject: 'Special Offer: {{discount}}% OFF Just for You!',
    description: 'Promote special offers and discounts',
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fef3c7;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 32px;">🎁 SPECIAL OFFER</h1>
    <p style="color: #fef3c7; margin-top: 10px; font-size: 18px;">Exclusively for {{first_name}}</p>
  </div>
  <div style="background-color: white; padding: 40px 30px; margin: 20px; border-radius: 12px;">
    <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px;">Limited Time Offer!</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
      We're giving you an exclusive <strong>{{discount}}% discount</strong> on all products.
    </p>
    <div style="text-align: center; margin-top: 30px;">
      <a href="{{shop_link}}" style="background-color: #dc2626; color: white; padding: 15px 50px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: 600;">
        Shop Now
      </a>
    </div>
  </div>
</div>`
  },
  {
    id: 'event-invitation',
    name: 'Event Invitation',
    category: 'Event',
    thumbnail: '📅',
    subject: 'You are Invited: {{event_name}}',
    description: 'Invite contacts to webinars or events',
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 50px 30px; text-align: center;">
    <div style="font-size: 60px; margin-bottom: 20px;">📅</div>
    <h1 style="color: white; margin: 0;">You're Invited!</h1>
  </div>
  <div style="padding: 40px 30px;">
    <p style="color: #4b5563; font-size: 18px; line-height: 1.6;">Hi {{first_name}},</p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      We'd love for you to join us for an exclusive event: <strong>{{event_name}}</strong>
    </p>
    <div style="text-align: center; margin-top: 40px;">
      <a href="{{registration_link}}" style="background-color: #8b5cf6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: 600;">
        Reserve Your Spot
      </a>
    </div>
  </div>
</div>`
  },
  {
    id: 'follow-up',
    name: 'Follow-Up Email',
    category: 'Sales',
    thumbnail: '💼',
    subject: 'Following up on our conversation',
    description: 'Professional follow-up template',
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
  <div style="padding: 30px; border-bottom: 3px solid #3b82f6;">
    <h2 style="color: #1f2937; margin: 0;">Following Up</h2>
  </div>
  <div style="padding: 30px;">
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Hi {{first_name}},</p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      I wanted to follow up on our recent conversation about {{topic}}.
    </p>
    <div style="margin-top: 30px;">
      <a href="{{calendar_link}}" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
        Schedule a Call
      </a>
    </div>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 30px;">
      Best regards,<br><strong>{{sender_name}}</strong>
    </p>
  </div>
</div>`
  },
  {
    id: 'abandoned-cart',
    name: 'Abandoned Cart',
    category: 'E-commerce',
    thumbnail: '🛒',
    subject: 'You left something behind...',
    description: 'Recover abandoned shopping carts',
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="padding: 40px 30px; text-align: center;">
    <div style="font-size: 60px; margin-bottom: 20px;">🛒</div>
    <h1 style="color: #1f2937; margin: 0;">Don't Miss Out!</h1>
    <p style="color: #6b7280; margin-top: 10px; font-size: 16px;">You left items in your cart</p>
  </div>
  <div style="padding: 0 30px 40px;">
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Hi {{first_name}},</p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      We noticed you left some items in your cart. They're still waiting for you!
    </p>
    <div style="text-align: center; margin-top: 30px;">
      <a href="{{cart_link}}" style="background-color: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: 600;">
        Complete Your Purchase
      </a>
    </div>
  </div>
</div>`
  },
  {
    id: 'thank-you',
    name: 'Thank You Email',
    category: 'Transactional',
    thumbnail: '�',
    subject: 'Thank you, {{first_name}}!',
    description: 'Express gratitude to customers',
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="padding: 50px 30px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
    <div style="font-size: 60px; margin-bottom: 20px;">🙏</div>
    <h1 style="color: white; margin: 0;">Thank You!</h1>
  </div>
  <div style="padding: 40px 30px;">
    <p style="color: #4b5563; font-size: 18px; line-height: 1.6;">Dear {{first_name}},</p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      We wanted to take a moment to thank you for {{reason}}. Your support means the world to us!
    </p>
    <div style="text-align: center; margin-top: 30px;">
      <a href="{{cta_link}}" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
        Claim Your Offer
      </a>
    </div>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 30px;">
      With gratitude,<br><strong>The {{company_name}} Team</strong>
    </p>
  </div>
</div>`
  }
];

export const personalizationTokens = [
  { token: '{{first_name}}', description: 'Contact first name' },
  { token: '{{last_name}}', description: 'Contact last name' },
  { token: '{{email}}', description: 'Contact email' },
  { token: '{{company_name}}', description: 'Your company name' },
  { token: '{{company}}', description: 'Contact company' },
  { token: '{{phone}}', description: 'Contact phone' },
  { token: '{{website_url}}', description: 'Your website URL' },
  { token: '{{unsubscribe_link}}', description: 'Unsubscribe link' },
  { token: '{{month}}', description: 'Current month' },
  { token: '{{year}}', description: 'Current year' },
  { token: '{{sender_name}}', description: 'Sender name' },
  { token: '{{sender_title}}', description: 'Sender title' },
];
