const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // If using mock credentials, auto-create an Ethereal test account
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'mock_user') {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('[Email Service] Ethereal test account created');
      console.log(`[Email Service] Ethereal User: ${testAccount.user}`);
      return transporter;
    } catch (error) {
      console.warn('[Email Service] Could not create Ethereal account, using fallback logging transport');
      // Fallback: just log emails instead of sending
      transporter = {
        sendMail: async (opts) => {
          console.log('[Email Service] [MOCK] Email would be sent:');
          console.log(`  To: ${opts.to}`);
          console.log(`  Subject: ${opts.subject}`);
          return { messageId: `mock-${Date.now()}@local` };
        }
      };
      return transporter;
    }
  }

  // Use real SMTP credentials from .env
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
};

const sendEmail = async (to, subject, text, html) => {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: '"E-Government Portal" <no-reply@egov.invest>',
      to,
      subject,
      text,
      html,
    });

    console.log('[Email Service] Email sent: %s', info.messageId);

    // Log Ethereal preview URL if available
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('[Email Service] Preview URL: %s', previewUrl);
    }

    return info;
  } catch (error) {
    console.error('[Email Service] Error sending email:', error.message);
    return null;
  }
};

module.exports = { sendEmail };
