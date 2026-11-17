import emailTransporter from '../config/mailer.js';
import env from '../config/env.js';
import { newsletterEmailTemplate } from '../templates/newsletterEmail.js';
import { testEmailTemplate } from '../templates/testEmail.js';

export const sendNewsletterEmail = async (subscriberEmail) => {
  try {
    await emailTransporter.sendMail({
      from: env.EMAIL_USER,
      to: subscriberEmail,
      subject: 'Welcome to Aetheria Heights - Discover Luxury Like Never Before!',
      html: newsletterEmailTemplate()
    });
    console.log('Newsletter email sent successfully to:', subscriberEmail);
    return true;
  } catch (error) {
    console.error('Error sending newsletter email:', error);
    return false;
  }
};

// Throws on failure so the caller can report the error
export const sendTestEmail = async (testEmail) => {
  await emailTransporter.sendMail({
    from: process.env.EMAIL_USER,
    to: testEmail,
    subject: 'Aetheria Heights - Email Test',
    html: testEmailTemplate()
  });
};
