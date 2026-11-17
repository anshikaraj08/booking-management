import { sendNewsletterEmail, sendTestEmail } from '../services/email.service.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/newsletter/subscribe
export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const emailSent = await sendNewsletterEmail(email);

    if (emailSent) {
      res.json({
        success: true,
        message: 'Newsletter subscription successful! A detailed welcome brochure has been sent to your email.',
        details: {
          email,
          sentAt: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({ error: 'Failed to send newsletter email. Please try again later.' });
    }
  } catch (err) {
    console.error('Newsletter subscription error:', err);
    res.status(500).json({ error: 'Failed to process newsletter subscription', details: err.message });
  }
};

// POST /api/test-email
export const testEmail = async (req, res) => {
  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({ error: 'Test email address is required' });
    }

    await sendTestEmail(testEmail);
    res.json({ success: true, message: 'Test email sent successfully!' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email', details: error.message });
  }
};
