import nodemailer from 'nodemailer';
import env from './env.js';

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
});

export const verifyMailer = () => {
  emailTransporter.verify((error) => {
    if (error) {
      console.log('❌ Email configuration error:', error.message);
      console.log('📧 Please check your EMAIL_USER and EMAIL_PASS in backend/.env');
      console.log('🔑 Make sure to use Gmail App Password (not regular password)');
    } else {
      console.log('✅ Email service is ready to send newsletters!');
    }
  });
};

export default emailTransporter;
